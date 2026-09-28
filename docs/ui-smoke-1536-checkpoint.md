# Changed smoke workload: supervised 1536 MiB trial — 28 September 2026

Engineering remains incomplete. The one trial started and exited before Vite:
an incorrect additional heap guard rejected a valid Node configuration. No OOM,
UI build, browser pass or new minimum build-capacity claim follows from this result.
No second attempt was made.

## Inputs and command

- Integration input: 3f9221b2464efc8ee61af5ae04c195b244bb8bff.
- Host: 2026.916.1 / d554c4789ed3930f8a53ac9fdf6503b3187097da.
- Immutable dependency image: sha256:a02ac35ac41df911af477422ea0e781cf41d2b2c600c66f0a5ac9d8c63f52c2c.
- Source: retained, ownership-verified, stopped UI build
  6f337790ad0aac496a44a5e4ffa82aeda6ebe231a6616674f5aecb94baf4b91c.
  Only /app/packages/shared/src was copied; no credentials or dependency mounts.
- Supervisor: python3 operator/ui-smoke-trial.py.
- Exact build command inside the prepared isolated image:
  NODE_OPTIONS=--max-old-space-size=1024 RAYON_NUM_THREADS=1 VTS_UI_PREFLIGHT_APPROVED=1 node /ui-smoke-build.mjs
- The prepared script loads /app/ui/vite.config.ts in production mode, retaining
  plugins and aliases while overriding minify:false, reportCompressedSize:false,
  sourcemap:false. This is a smoke variation, not release-build acceptance.

For another authorized placement, use that immutable image, the pinned patched
shared source, and the script. Docker controls are --network none --memory 1536m
--memory-swap 1536m --cpus 1 --pids-limit 128 --security-opt no-new-privileges
--cap-drop ALL --user node --entrypoint node, with no mounts. Use a new
vts-figma-test-* name and issue/run ownership labels. The committed supervisor
contains the exact create/copy/start commands and refuses receipt replay.
It depends on the retained source container on this daemon; on an external daemon,
prepare the same patched source from the documented pinned host/operator bundle
instead of treating the local container ID as portable. Enforce the same fresh
ancestor preflight and reserve supervision externally. No further attempt is
authorized by this document.

## Measured outcome

Immediate pre-start sample at 2026-09-28T01:02:57.714Z:

- Daemon/ancestor headroom: 3,221,381,120 bytes (3072.15 MiB).
- Required changed-workload headroom: 2,952,790,016 bytes (2816 MiB).
- Daemon-backed free disk: 6,149,427,200 bytes; stop reserve 2 GiB.
- Full ancestor evidence was visible; own probe had 64 MiB/no-swap,
  0.25 CPU, 32 PIDs and zero own OOM counters.
- Supervision retained 1280 MiB host reserve, 2 GiB disk reserve, one-second
  sampling interval (plus Docker command latency), 300-second timeout, exact-ID
  ownership validation before stop. No automatic retries or cleanup.

Build da14d3dcccddcc33b6241f726740d4b81f2164f5e9041e7a26f5ce861ef25798,
name vts-figma-test-ui-smoke-4e1992ad, started 01:02:57.856408468Z and
finished 01:02:58.257764944Z: exit 1, OOMKilled=false. Supervisor elapsed
1.506 seconds includes observation overhead. Effective memory/no-swap/CPU/PID
checks in the script passed before the heap guard; Docker configuration was
1610612736 bytes RAM and total RAM+swap, 1000000000 NanoCPUs, 128 PIDs.
No terminal memory peak was captured.

Probe 8780b5f41920d553b2b443aff1cda667bc707f0f8bff3804b7661bff2d3dd2a2,
name vts-figma-test-ui-smoke-4e1992ad-probe, was stopped by the supervisor.
Both resources remain retained stopped. Existing login/storage/design links
remain untouched; localhost:3310 remains offline.

## Cause, correction and verification

The added guard compared v8.getHeapStatistics().heap_size_limit against 1100 MiB.
That reports the total V8 heap, not just old space. A small local Node v24.21.0
diagnostic with NODE_OPTIONS=--max-old-space-size=1024 returned 1,275,068,416 bytes
(1216 MiB), reproducing the invalid assumption without running Vite.

The corrected script checks the exact old-space option and rejects command-line
overrides. It reports total V8 heap separately and imports Vite after containment
checks. The supervisor now also asserts actual probe cgroup limits. The changed
workload selector in ui-capacity.mjs retains the old 3328 MiB default; only
VTS_UI_SMOKE_1536=1 selects 2816 MiB.

Passed: node --check on both JS scripts, Python compilation, git diff --check,
and the small Node heap diagnostic. The corrected script and supervisor have
not had a second runtime/build trial. No broad suites, compiler, CI or npm pack
were repeated.

## Capacity and next action

This is a harness defect, not evidence of insufficient external capacity. The
2816 MiB admission gate passed and no OOM occurred. A successful-build minimum,
peak Vite memory and external storage requirement beyond the preserved reserve
remain unmeasured. Increasing capacity is not justified by this failure.

Nadia owns the corrected harness and subsequent browser/Connect proof. Elena
owns disposition of the consumed one-attempt allowance: review this precise
failure and route a new controlled trial if appropriate. There is no automatic
retry, timer, new task or interim Theo wake. Human consent remains unperformed.
Full-host/CI, live OAuth/shared-agent/protected-runtime, browser, onboarding and
both clean-instance lifecycle gates remain unpassed. Production resources were
not accessed or changed.
