# Mac arm64 build checkpoint — 28 September 2026

Engineering remains incomplete. No browser retry or working service is offered.

## Exact inputs

- Integration input: dcff4c3b7a095e456fe3875e0c1730e7d91ba4db.
- Host: 2026.916.1 / d554c4789ed3930f8a53ac9fdf6503b3187097da.
- Host archive SHA-256: f7a2049c2f10accc455b50ec4821ff100e0daa53074a23cf05398f83c12f0baa.
- Original image index: sha256:a02ac35ac41df911af477422ea0e781cf41d2b2c600c66f0a5ac9d8c63f52c2c.
- Verified linux/arm64 member: ghcr.io/paperclipai/paperclip@sha256:4e2e1e59219129a4b687cd54ba439fb7fed0a5710af9f1551277dedd23dc61f1.
- Dependency lock SHA-256 verified inside arm64 container: af3b879fea127a608b0f9279627f357638299441bbf41835f0b91ab0162e441c.

Downloaded pinned public source, verified every recorded baseline, applied all eight prerequisite patches, and copied only source inputs to macbuilder01. No test/production databases, credentials, dependency directories or sockets transferred. Existing hermes01 account/data/design links remain untouched. Unrelated maintenance/ was excluded.

## Executed validation

SSH used the authorized identity and /Users/nolan/vts-figma-test/bin/docker-job wrapper. Engine reported aarch64, 8,319,238,144 bytes RAM and 12 CPUs; no competing running containers.

First probe failed before measurement because the image's root privilege-drop entrypoint conflicted with dropped capabilities. Corrected the probe to explicit node user/direct Node entrypoint; no limits or capabilities relaxed. Corrected probe passed at 18:31:00.905 UTC: complete ancestor evidence, 7,682,199,552 bytes available, 920,382,500,864 bytes disk free. Initial preparation admission was 2880 MiB; before-build admission 2752 MiB.

One build ran with effective 1408 MiB/no swap, one CPU, 128 PIDs, no network or mounts, Node old space 896 MiB. Supervisor checked the 1280 MiB host reserve and 2 GiB disk reserve every second, with a 20-minute deadline. It verified architecture, lock hash and cgroup limits before starting.

Passed:
- Patched SDK: node /app/node_modules/typescript/bin/tsc -p /app/packages/plugins/sdk/tsconfig.json --singleThreaded
- Plugin/domain/manifest/UI bundles: node scripts/build.mjs /app
- npm prepack's node scripts/check.mjs stage.

Failed:
- npm pack invoked its normal prepack hook. git diff --check failed with exit 129 because git archive does not contain a Git repository.
- Package tests/build-integrity stage, tarball production and Vite did not run. No hook was bypassed.
- Terminal sampled memory.peak: 417,460,224 bytes (398.12 MiB); own OOM counters zero. Container exited 129, OOMKilled=false. This is a packaging-context defect, not a capacity failure.

## Retained Mac resources

Run ac23c7d4-7a01-4ca2-aee5-49f6ae5acbfd.
- Build bb58c23f2d4264090d5dc12b6317b6cf0d54e7aa89a076f5e456490e311ae6fc, vts-figma-test-mac-ac23c7d4-native-build, stopped.
- Successful probe 5d4f744ee5ae10e07d93f1b60b3ecbf45ffbfc7728ce1cfe80056f5722573363, stopped.
- Initial failed probe 2fa334147719 (full identity available via owned-resource inspection), stopped.
- Source inputs and private build output: /Users/nolan/vts-figma-test/vis6-mac-validation.
No runtime, network or persistent data volume was created; no production resource mutation.

## Corrected next invocation

The committed operator/mac-build-job.sh now requires a fresh directory, integration.bundle, patched-inputs.tar.gz and mac-build-supervisor.mjs. Create integration.bundle with git bundle create PATH HEAD, preserving real commit history without local Git config/credentials. A local clone of that bundle preserved the exact input HEAD and passed git diff --check. Do not initialize an empty repository or disable the prepack check.

Through the existing wrapper:

    /Users/nolan/vts-figma-test/bin/docker-job /bin/bash /path/mac-build-job.sh /fresh/job-directory FULL_RUN_ID EXACT_INTEGRATION_REVISION

Job records attach status and final container state even on build failure. Same resource names intentionally prevent replay. Shell/Node syntax and whitespace checks passed. Corrected full job has not executed.

Nadia owns the corrected source transfer, fresh admission and next bounded candidate build, followed by fresh isolated runtime state, served revision, keyed list/action bodies and Create project/Configuration save/reload. Elena coordinates the continuation after this concrete failure; no same-command retry was made. No additional RAM is needed based on this evidence. Human consent, actual browser/navigation, shared-agent/protected-runtime, full-host/CI, onboarding and clean-instance lifecycle remain unpassed. Theo's full-candidate dependency remains open.
