# Separated runtime admission — 28 September 2026

The separated-runtime decision was applied. Admission failed; no app restart,
browser workload, rebuild or retry occurred. Engineering remains incomplete.

## Placement and budget

No independent browser tool is exposed in this session. Local executable discovery
found SSH but no Chromium, Chrome or Firefox. An SSH client does not establish an
authorized remote browser workstation or working tunnel; that path remains unverified.

The proposed same-daemon browser trial is 512 MiB RAM/no swap, 0.5 CPU, 128 PIDs,
separate from the unchanged app's 1536 MiB/no-swap, 1 CPU, 256 PIDs.
The browser budget is experimental, not a measured minimum. Admission reserves
64 MiB for supervision plus the full 1280 MiB host reserve: **3392 MiB total**.
The browser has not been provisioned or started; its dependency/image receipt and
effective limits remain prerequisites before any launch. Prior known browser
dependencies are Playwright Chromium headless shell 151.0.7922.34, revision 1234,
with FFmpeg revision 1011 and native system libraries; the mutable installed
dependencies in the stopped app are not a reproducible separate-browser image.
No app snapshot containing synthetic credentials was made.

## Fresh measurement

At 2026-09-28T01:21:57.368Z, the single daemon probe measured:

- Effective host/ancestor headroom: 3319545856 bytes
  (3165.77 MiB).
- Required aggregate: 3556769792 bytes (3392 MiB).
- Shortfall: 237223936 bytes (226.23 MiB).
- Free daemon-backed disk: 5435695104 bytes; 2 GiB reserve passes.
- Ancestor evidence complete, no finite parent memory limit reduced headroom.
- Probe effective limits: 64 MiB/no swap, 0.25 CPU, 32 PIDs; no mounts or
  network, read-only root, dropped capabilities, node user.
- Probe exit 0, OOMKilled=false; own OOM counters zero. Sample peak
  11,083,776 bytes is not a terminal peak.

Probe ID: `4ebcbb4fa59f10ace3191d9d31ee754fba54f9fc63e3b433680f5b4394c71d10`.
Name: `vts-figma-test-separated-admission-abb20f2d`.
Retained stopped. Exact argv and ancestor records are in the uploaded JSON.
The command uses committed operator/ui-capacity.mjs with only the admission
expression replaced by the explicit aggregate sum; it launches no heavy work.

Read-only inspection verified retained app
`c1e1180a6d74c5e690b8d8bd1cad42a975071c2fd06768025ffc3f89c109d90b`
has the issue/run ownership labels, remains stopped after its prior OOM,
and retains the same isolated volume and 1536 MiB limit. No mutation of its
data, network, source or built UI occurred. localhost:3310 remains offline.
All production resources and unrelated maintenance/ work were untouched.

## Revisions, limits and next action

Integration at measurement: `3d641818e9e7c226f2e942f24d21a8ee6eea40c6`.
Host: `2026.916.1 / d554c4789ed3930f8a53ac9fdf6503b3187097da`.
Probe/dependency image: `sha256:a02ac35ac41df911af477422ea0e781cf41d2b2c600c66f0a5ac9d8c63f52c2c`.

Elena coordinates a qualifying placement/window or an independently provisioned
authorized browser access path. Nadia owns preparing the separate browser dependency
receipt and network access, fresh aggregate admission, effective-limit verification,
and the one supervised separated trial. Current measurement does not establish a
successful browser minimum; no larger app budget is needed or requested.
No timer, monitor, polling loop, broad suite, compiler or interim Theo wake.

Human consent, Designs browser acceptance, live shared-agent/protected-runtime,
full-host/CI, onboarding and clean-instance lifecycle checks remain unpassed.
