#!/usr/bin/env python3
"""One supervised 1536 MiB smoke build. No automatic retry or cleanup."""
import datetime, hashlib, json, os, pathlib, subprocess, time
root = pathlib.Path(__file__).resolve().parent.parent
scratch = pathlib.Path(os.environ["PAPERCLIP_RUN_SCRATCH_DIR"]) / "ui-smoke"
scratch.mkdir(exist_ok=True)
run = os.environ["PAPERCLIP_RUN_ID"]
image = "sha256:a02ac35ac41df911af477422ea0e781cf41d2b2c600c66f0a5ac9d8c63f52c2c"
source = "6f337790ad0aac496a44a5e4ffa82aeda6ebe231a6616674f5aecb94baf4b91c"
name = "vts-figma-test-ui-smoke-" + run[:8]
labels = {"vts.figma.issue": "VIS-6", "vts.figma.run": run}
record = {"image": image, "sourceContainer": source, "attemptedBuild": False, "samples": []}
receipt = scratch / "result.json"
if receipt.exists():
    raise SystemExit("Existing trial receipt: no replay")
def docker(*args):
    return subprocess.check_output(["docker", *args], text=True, stderr=subprocess.STDOUT).strip()
def inspect(cid):
    return json.loads(docker("inspect", cid))[0]
def owned(cid, current=True):
    item = inspect(cid)
    assert item["Name"].startswith("/vts-figma-test-")
    assert item["Config"]["Labels"]["vts.figma.issue"] == "VIS-6"
    if current:
        assert item["Config"]["Labels"]["vts.figma.run"] == run
    return item
def save():
    receipt.write_text(json.dumps(record, indent=2) + "\n")
flags = [v for k, val in labels.items() for v in ("--label", k+"="+val)]
deadline = datetime.datetime.fromisoformat(os.environ["VTS_UI_TRIAL_DEADLINE"].replace("Z", "+00:00")).timestamp()
def within_window():
    if time.time() >= deadline:
        raise RuntimeError("Coordinated UI trial window expired")
probe = None
build = None
try:
    within_window()
    original = owned(source, False)
    assert original["State"]["Status"] == "exited" and not original["Mounts"]
    assert original["Image"] == image
    # Only source inputs; never copy credentials, dependency mounts or state.
    docker("cp", source+":/app/packages/shared/src", str(scratch/"shared-src"))
    probe_code = (root/"operator/ui-capacity.mjs").read_text()
    probe = docker("create", "--name", name+"-probe", *flags,
                   "--network", "none", "--read-only", "--cap-drop", "ALL",
                   "--security-opt", "no-new-privileges", "--user", "node",
                   "--cgroupns", "host", "--memory", "64m", "--memory-swap", "64m",
                   "--cpus", "0.25", "--pids-limit", "32",
                   "-e", "VTS_UI_SMOKE_1536=1", "--entrypoint", "node", image,
                   "--input-type=module", "-e",
                   "setInterval(()=>{},1000);")
    record["probeId"] = probe
    owned(probe)
    docker("start", probe)
    def sample():
        owned(probe)
        result = json.loads(docker("exec", probe, "node", "--input-type=module", "-e", probe_code))
        own = result["cgroups"][0]
        assert own["memory.max"] == "67108864" and own["memory.swap.max"] == "0"
        assert own["cpu.max"] == "25000 100000" and own["pids.max"] == "32"
        # Include the concurrent 64 MiB supervisor probe in admission.
        required = (1536 + 64 + 1280) * 1024**2
        result["requiredHeadroomBytes"] = required
        result["shortfallBytes"] = max(0, required - result["effectiveHeadroomBytes"])
        if result["shortfallBytes"]:
            result["decision"] = "skip-heavy-run"
            result["reasons"].append("Insufficient aggregate headroom including supervisor probe")
        record["samples"].append(result)
        save()
        return result
    before = sample()
    if before["decision"] == "skip-heavy-run":
        record["outcome"] = "preflight-refused"
    else:
        within_window()
        ui_input = scratch/"project-ui"
        ui_input.mkdir()
        for entry in json.loads((root/"host-prerequisite/project-ui-baseline.json").read_text())["files"]:
            target = ui_input/entry["path"]
            target.parent.mkdir(parents=True, exist_ok=True)
            docker("cp", source+":/app/"+entry["path"], str(target))
            assert hashlib.sha256(target.read_bytes()).hexdigest() == entry["sha256"], "UI baseline drift"
        subprocess.run(["git", "apply", str(root/"host-prerequisite/figma-project-ui.patch")],
                       cwd=ui_input, check=True)
        build = docker("create", "--name", name, *flags, "--network", "none",
                       "--memory", "1536m", "--memory-swap", "1536m", "--cpus", "1",
                       "--pids-limit", "128", "--security-opt", "no-new-privileges",
                       "--cap-drop", "ALL", "--user", "node",
                       "-e", "NODE_OPTIONS=--max-old-space-size=1024",
                       "-e", "RAYON_NUM_THREADS=1", "-e", "VTS_UI_PREFLIGHT_APPROVED=1",
                       "--entrypoint", "node", image, "/ui-smoke-build.mjs")
        record["buildId"] = build
        item = owned(build)
        assert not item["Mounts"] and item["HostConfig"]["NetworkMode"] == "none"
        docker("cp", str(scratch/"shared-src")+"/.", build+":/app/packages/shared/src")
        docker("cp", str(root/"operator/ui-smoke-build.mjs"), build+":/ui-smoke-build.mjs")
        for entry in json.loads((root/"host-prerequisite/project-ui-baseline.json").read_text())["files"]:
            docker("cp", str(ui_input/entry["path"]), build+":/app/"+entry["path"])
        docker("cp", str(root/"host-prerequisite/ui/src/components")+"/.",
               build+":/app/ui/src/components")
        record["projectUiPatchSha256"] = hashlib.sha256((root/"host-prerequisite/figma-project-ui.patch").read_bytes()).hexdigest()
        # Recheck after preparation, immediately before consuming the single trial.
        before = sample()
        if before["decision"] == "skip-heavy-run":
            record["outcome"] = "preflight-refused-after-copy"
        else:
            within_window()
            owned(build)
            record["attemptedBuild"] = True
            save()
            started = time.monotonic()
            docker("start", build)
            while True:
                item = owned(build)
                if not item["State"]["Running"]:
                    break
                observation = sample()
                reason = None
                if time.time() >= deadline:
                    reason = "coordinated-window-expired"
                elif not observation["completeAncestorEvidence"]:
                    reason = "ancestor-evidence-lost"
                elif observation["effectiveHeadroomBytes"] < 1280*1024**2:
                    reason = "host-reserve-breached"
                elif observation["diskFreeBytes"] < 2*1024**3:
                    reason = "disk-reserve-breached"
                elif time.monotonic()-started > 300:
                    reason = "300-second-timeout"
                if reason:
                    record["supervisorStop"] = reason
                    owned(build)
                    docker("stop", "--time", "1", build)
                    break
                time.sleep(1)
            record["elapsedSeconds"] = round(time.monotonic()-started, 3)
            item = owned(build)
            record["state"] = item["State"]
            record["limits"] = {k:item["HostConfig"][k] for k in ("Memory", "MemorySwap", "NanoCpus", "PidsLimit")}
            record["buildLog"] = docker("logs", build)
            record["outcome"] = "passed" if item["State"]["ExitCode"] == 0 and not record.get("supervisorStop") else "failed"
except Exception as exc:
    record["failure"] = str(exc)
    record["outcome"] = "harness-failed"
    if build and owned(build)["State"]["Running"]:
        docker("stop", "--time", "1", build)
finally:
    if probe and owned(probe)["State"]["Running"]:
        docker("stop", "--time", "1", probe)
    save()
print(json.dumps({k:v for k,v in record.items() if k not in ("samples","buildLog")}, indent=2))
