# One bounded native compiler trial

Prepared for the accepted capacity disposition. No compiler image is available
or certified by this increment, and no heavy trial has been run. Current placement
is inadequate. The runner deliberately cannot install dependencies, build/pull
images, launch a service, or change production resources.

Run from the rootless daemon host, with Python 3 and the supplied Docker context.
Host-side `/proc`, ancestor cgroups and the actual DockerRootDir filesystem must
be readable. Container-side observations cannot certify host headroom. Defaults
are not silently relaxed: at least 6 GiB effective available RAM, 12 GiB free
storage; trial cap 4 GiB RAM, zero swap, 1 CPU, 256 PIDs, 900 seconds. The 2 GiB
memory reserve and 2 GiB disk stop reserve are proposed experimental safeguards,
not established host-build requirements. Recheck storage after every preparation
stage; the final trial preflight still requires 12 GiB free, not just 2 GiB.

Prepare and review a separate immutable local compiler image when capacity allows.
Its `/work` must contain the pinned patched host source, independently installed
frozen dependencies, native compiler 7.0.2 and pnpm, and completed native runner
vendor/SDK preparation. Do not mount production source, storage or dependencies.
The image must have no declared volumes and no credentials. Record source archive,
patch/integration revision, lockfile, package/tool versions and prerequisite command
results in review evidence. The following receipt binds those reviewed results;
it is an operator attestation, not automatic validation of image internals:

```json
{
  "imageId": "sha256:REPLACE_WITH_EXACT_LOCAL_IMAGE_ID",
  "hostCommit": "d554c4789ed3930f8a53ac9fdf6503b3187097da",
  "integrationCommit": "REPLACE_WITH_EXACT_INTEGRATION_COMMIT",
  "lockfileSha256": "REPLACE_WITH_EXACT_LOCKFILE_SHA256",
  "frozenInstall": "passed",
  "runnerVendorPreparation": "passed",
  "sdkBuildDependencies": "passed"
}
```

Never mark a prerequisite passed before its evidence exists. The runner checks
receipt/image binding and refuses missing prerequisites; it does not create this
receipt or make an image reproducibility claim.

After Elena coordinates a qualifying window, invoke once (replace placeholders):

```sh
python3 operator/compiler-trial.py \
  --image sha256:EXACT_LOCAL_IMAGE_ID \
  --receipt /srv/vts-figma-test/preparation.json \
  --daemon-storage /home/paperclip/.local/share/docker \
  --name vts-figma-test-compiler-UNIQUE_LOWERCASE_SUFFIX \
  --run-id EXACT_PAPERCLIP_RUN_ID \
  --evidence /srv/vts-figma-test/unique-attempt-evidence
```

The evidence directory must not exist; exclusive creation prevents accidental
same-attempt replay. A new directory does not authorize another compiler attempt.
No automatic retry exists. Capacity refusal occurs before any Docker command.
Image/name/provenance/rootless checks occur before creation. The container has
network `none` (no shared network), no mounts and no socket, fresh writable image
layer, dropped capabilities and no-new-privileges. Exact ID and issue/run labels
are retained. Configured limits are inspected before start; effective memory,
swap, CPU and PID cgroups are checked inside this test container before compiler
execution. All native descendants inherit them. No `NODE_OPTIONS` cap is relied on.

Command: `pnpm exec tsc --singleThreaded --noEmit -p server/tsconfig.json`, with
`GOMAXPROCS=1 GOGC=50 GOMEMLIMIT=3GiB`. Full project semantics are retained.
It is not the entire maintained server script, full build, test suite or CI.
The Go limit is soft; Docker cgroups are the actual memory boundary.

Evidence contains preflight JSON, receipt digest/projected provenance, exact test
ID/limits, wall time, Docker exit/OOM state, and compiler log with cgroup events
before/after and peak memory. If OOM kills the shell before final snapshots,
Docker OOM/exit evidence remains; missing cgroup diagnostics are not a pass.
Review diagnostics for sensitive content before uploading. On timeout the runner
rechecks exact name/issue/run ownership and stops only that ID. It preserves the
stopped test container for inspection; no automatic removal, volumes, prune or
production commands. Abrupt operator interruption may require explicit ownership-
verified stop of the recorded test ID. Cleanup requires separately checking the
recorded identity and retention; never delete evidence to retry.

Preparation tests use mocked Docker and synthetic capacity only. Real descendant
containment for this runner, its timeout path, image preparation and full compiler
outcome remain unproven until the authorized trial can run.
