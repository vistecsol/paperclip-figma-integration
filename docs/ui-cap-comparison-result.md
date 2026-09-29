# Fixed-input 1792 MiB UI comparison — 29 September 2026

The single authorized build-only comparison passed. Engineering remains incomplete. This is diagnostic smoke-build evidence, not optimized release-build, full-host/CI, installed-browser or lifecycle qualification.

## Exact inputs and command

Host 2026.916.1 / d554c4789ed3930f8a53ac9fdf6503b3187097da. Integration baseline 98fdec937d2f09f285fc1336ea17c7e6ddc38e29 plus the exact approved cap-only patch SHA-256 d5d30e29bd6e3f553a91f220497bc15f147bfc79543fc8d386aae8dc3b98869c. Frozen product revision remains 00597a508ab174191a566c6a8067ee1314cff8a4.

Fresh Git-preserving checkout, exact HEAD, tracked diff and archive checks passed. The upstream archive hash f7a2049c2f10accc455b50ec4821ff100e0daa53074a23cf05398f83c12f0baa and frozen preview hash 2db67196528809aeb3a675a988672bb6b3dd841f890980d8e45c789d7f1749e5 passed preparation. All 43 retained host-input files matched a fresh pinned-source preparation byte-for-byte; eight prerequisite patches applied. Patched-input archive SHA-256 468138bb7a98c0330c0d0c374eaff3d51fb060b725a104b63da0f49f50c5d290.

Mac image/readback: ghcr.io/paperclipai/paperclip@sha256:4e2e1e59219129a4b687cd54ba439fb7fed0a5710af9f1551277dedd23dc61f1, arm64. Supervisor verified dependency lock af3b879fea127a608b0f9279627f357638299441bbf41835f0b91ab0162e441c.

Run e5aa0046-d064-474d-8b91-8422d31b70b1. Fresh directory /Users/nolan/vts-figma-test/cap-e5aa0046-d064-474d-8b91-8422d31b70b1.

    VTS_QUALIFICATION_DEADLINE=2026-09-29T15:35:00Z /Users/nolan/vts-figma-test/bin/docker-job /bin/bash /Users/nolan/vts-figma-test/cap-e5aa0046-d064-474d-8b91-8422d31b70b1/mac-build-job.sh /Users/nolan/vts-figma-test/cap-e5aa0046-d064-474d-8b91-8422d31b70b1 e5aa0046-d064-474d-8b91-8422d31b70b1 98fdec937d2f09f285fc1336ea17c7e6ddc38e29

Wrapper exclusive lock was respected. Root job orchestration adds the mandated separate ancestor-aware immediate probe; the transferred tracked source remains exactly the approved four-file cap patch. Modified supervisor matches at transfer root and inside checkout. No baseline build rerun or same-command retry. No hooks, prepack or CI checks bypassed.

## Measurements

- Initial complete daemon/ancestor observation at 15:06:32.864 UTC: 7,656,144,896 bytes headroom, above the enforced 3264 MiB preparation gate. The generic probe receipt displays its 3136 MiB base gate; the job's additional initial assertion enforces 3264 MiB.
- Immediate complete ancestor observation at 15:06:33.372 UTC: 7,630,794,752 bytes, above 3136 MiB. Disk free 919,190,921,216 bytes.
- Effective build: 1792 MiB RAM and total RAM+swap, zero swap; one CPU, 128 PIDs, network none, no mounts. Node old space unchanged at 896 MiB. Probe caps 64 MiB/no swap/0.25 CPU/32 PIDs. Effective cgroup checks passed.
- Build started 15:06:33.474584925 UTC, finished 15:06:40.085046887 UTC (6.61 seconds). Vite reported 4.40 seconds. SDK/plugin compilation, normal npm prepack/check/tests/build integrity and Vite smoke rendering passed.
- Container peak 1,722,048,512 bytes (1642.27 MiB); memory.events max/oom/oom_kill all zero. Docker exit 0, OOMKilled=false. Terminal host availability 7,421,050,880 bytes; disk 919,159,128,064 bytes. Full 1280 MiB host and 2 GiB disk reserve supervision retained; no reserve-stop signal.
- Prior same-input 1408 MiB build OOM remains valid. This success establishes only the observed pinned-input trial at 1792 MiB, not minimum capacity or a repeatability guarantee.

## Outputs and cleanup

Diagnostic UI/SDK/plugin/package outputs were exported before cleanup into the named Mac job directory. Complete output hashes are in the attached evidence. Diagnostic package SHA-256 4a6933b836e61aa35fefaf615cd9295501c61defe3cfd3deb673d66d2d239cc2; UI index SHA-256 7defb4746ac93ba8affd37fe6da4c40343a8918787c7ac98f9d1bfd2c354994a. This one build does not replace the frozen reproducible preview or establish revised reproducibility.

Exact build 2710a16f191bd21924146bbf20fb00aa6f74a2ddd46bea04d2722e00f6e07aec; initial probe 2db5d040952537ff6d5aae63bf74dcae4d2d1ffd84e2e9dce8575c905192fbe6; immediate probe a09cadf68a14664698edd556e0b821cf4637b4774f4b1886c24b19169495bf8a. Exit cleanup verified issue/run/name ownership, exported state/logs and removed exact IDs. Independent wrapper readback confirmed all three absent and no current-run ephemeral containers. Test health HTTP 000; app remains OFFLINE.

No app/browser launch, provider/model/OAuth call, grant/credential change, production action, canvas edit, timer, publication or runtime-state transfer. Named state/accounts/credentials/design links and unrelated maintenance work preserved.

## Next action

Nadia owns installed explicit-selector browser verification, positive GitHub/design coexistence and native persistence/lifecycle qualification using the exported outputs in a separately coordinated zero-provider session. Elena coordinates that session's expiry and limits. No rebuild or Adam login is a prerequisite. All other unpassed gates remain: concurrent eligible employees/protected runtime, live recovery, native skill audit disposition, full-host/CI and two-instance lifecycle/rollback proof. Theo's complete-candidate dependency stays open; no interim review wake.
