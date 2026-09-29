# Zero-provider qualification stop — 29 September 2026

The single authorized 14:50–15:35 UTC allowance ended on build OOM. No application or browser was launched. Engineering remains incomplete.

## Inputs and cleanup correction

Frozen product input: 00597a508ab174191a566c6a8067ee1314cff8a4.
Frozen package SHA-256: 2db67196528809aeb3a675a988672bb6b3dd841f890980d8e45c789d7f1749e5.
Host: 2026.916.1 / d554c4789ed3930f8a53ac9fdf6503b3187097da.
Source archive SHA-256: f7a2049c2f10accc455b50ec4821ff100e0daa53074a23cf05398f83c12f0baa.
Mac arm64 image: ghcr.io/paperclipai/paperclip@sha256:4e2e1e59219129a4b687cd54ba439fb7fed0a5710af9f1551277dedd23dc61f1.

Cleanup-only engineering revisions b608b96, 18442c1 and 98fdec937d2f09f285fc1336ea17c7e6ddc38e29 add exact-ID ownership-checked exit cleanup, failure diagnostics and an explicit teardown deadline. The last is the actual build input; product code and prerequisites remain from the frozen input. Every commit includes the required Paperclip co-author. Unrelated maintenance/ was preserved.

The narrow cleanup test initially failed because the mocked Docker executable was not selected by shell initialization. Removing a shell function did not fix it; explicitly setting the mock PATH inside the spawned shell did. The final check proves owned failed-job state export and stop/removal, preservation of the original exit code, and refusal to mutate a foreign-owned ID. These are harness tests, not product qualification. Bash/Node syntax and git diff --check passed. No hooks or CI were bypassed.

The checkout transfer preserves Git metadata and validates exact HEAD inside Linux. The host source archive and frozen package hashes passed preparation; all baseline checks and eight prerequisite patches applied. No retained database, account, credential, dependency mount or production state was transferred.

## Exact execution

Run: 8a342de1-6e1c-4b1f-a104-ce7783673803.

Local preparation:

    python3 scripts/check-owned-cleanup.py
    node operator/prepare-context.mjs SOURCE.tar.gz CANDIDATE.tgz 2db67196528809aeb3a675a988672bb6b3dd841f890980d8e45c789d7f1749e5 NEW_HOST_CONTEXT
    bash operator/prepare-mac-checkout.sh NEW_TRANSFER_DIRECTORY 98fdec937d2f09f285fc1336ea17c7e6ddc38e29

The patched-input archive contains only baseline-listed and supplied host source modules, prepared from the verified archive. Actual paths and harness sources are in the artifact.

One Mac invocation:

    VTS_QUALIFICATION_DEADLINE=2026-09-29T15:30:00Z /Users/nolan/vts-figma-test/bin/docker-job /bin/bash /Users/nolan/vts-figma-test/qualification-8a342de1-6e1c-4b1f-a104-ce7783673803/mac-build-job.sh /Users/nolan/vts-figma-test/qualification-8a342de1-6e1c-4b1f-a104-ce7783673803 8a342de1-6e1c-4b1f-a104-ce7783673803 98fdec937d2f09f285fc1336ea17c7e6ddc38e29

The supervisor ran patched SDK compilation, plugin build, normal npm pack/prepack, then node operator/ui-smoke-build.mjs. No full-host compilation or unrelated suite was added. Normal prepack ran its required package tests and build-integrity check.

## Measured result

- Admission at 14:52:25.310 UTC: complete ancestor evidence, 7,647,277,056 bytes available; fresh disk 919,197,806,592 bytes. Initial gate 2880 MiB passed.
- Build initial headroom 7,641,698,304 bytes; immediate 2752 MiB gate passed.
- Effective build: 1408 MiB, zero swap, one CPU, 128 PIDs, Node old space 896 MiB; network none and no mounts. Probe: 64 MiB, zero swap, 0.25 CPU, 32 PIDs, read-only root, dropped capabilities, no mounts/network.
- SDK/plugin compilation, normal prepack and build integrity passed.
- Vite transformed 5,894 modules, then child SIGKILL. Terminal cgroup memory.peak 1,476,395,008 bytes (1408 MiB); memory.events max 87, oom 1, oom_kill 1.
- Docker build state: exit 1, OOMKilled=true; start 14:52:25.580431630 UTC, finish 14:52:31.454918133 UTC. Terminal sampled host availability 7,554,764,800 bytes; disk 919,186,046,976 bytes. No reserve-stop signal was reported. This is container-limit OOM, not evidence that the Mac lacks total capacity.
- No UI output pass, installed selector/browser proof, GitHub/design coexistence, restart/disable persistence or new-instance install proof. No replacement candidate or reproducibility claim from this build. Frozen package remains the earlier preview.

This changed UI build exceeds its current experimental cap. A successful larger budget or minimum requirement is not established. The prior 1408 MiB success is not a guarantee for this source revision/run.

## Cleanup and limits

Probe: 1846061cbb6be6f01f4be5a3ddeda136671340b2e0f6d7232d4730bcd3f14cd2.
Build: 9ba098a1003909762234e8dc5847368e30cd627c921e5d52aa4591aeb3b0751a.

The exit trap exported state/logs, verified labels/names, then removed both exact owned containers. Independent wrapper readback confirmed both IDs absent and no current-run ephemeral containers. Host-local test health returned HTTP 000. No fresh qualification state/network/app was created. Existing named state, credentials, design links and completed owner-origin proof were untouched.

Provider calls: zero. Build/probe used network none. No model run, OAuth, refresh/reconnect, catalog synchronization, account sharing, task/employee creation, production action, canvas edit or publication. No retry, timer or runtime extension.

## Next action

Nadia owns preparing the next bounded UI-render qualification strategy from this measured OOM: preserve the full native UI and package contracts, identify a reduced render workload or propose an explicitly budgeted comparison. Elena coordinates any new allowance before execution. No unchanged retry is queued or requested. App stays offline; Adam has no login/attendance action.

Installed/browser selector, positive GitHub/design coexistence and lifecycle receipts remain deferred. All other release gates and Theo's complete-candidate dependency remain open. This is failure evidence and a working cleanup increment, not a release candidate.
