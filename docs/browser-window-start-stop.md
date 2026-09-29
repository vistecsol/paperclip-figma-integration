# Installed-browser session stopped on early launch — 29 September 2026

Engineering remains incomplete. The coordinated window was 15:15–16:00 UTC,
teardown from 15:55. The session launcher incorrectly checked only an upper
deadline and started the fresh app at **15:14:31.289058258 UTC**, 28.711 seconds
before the start boundary. This was an execution error, not a capacity failure.
It was identified immediately afterward; no qualification script was run.
The exact owned app was stopped and automatically removed. No retry was made.

## Evidence and limits

- Host: 2026.916.1 / d554c4789ed3930f8a53ac9fdf6503b3187097da.
- Product input: 98fdec937d2f09f285fc1336ea17c7e6ddc38e29 plus the approved
  cap-only comparison patch; integration checkout at 2d3ce5dcf4610b8f88fb53e44bc9b58863b60630.
- Dependency image: linux/arm64
  sha256:4e2e1e59219129a4b687cd54ba439fb7fed0a5710af9f1551277dedd23dc61f1.
- All **482** output hash entries matched the inventory independently downloaded
  from comparison artifact 2ae9098a-b9bb-4231-b3d1-905020ffafaa. A commentary
  update incorrectly said 488; the machine receipt and this record are authoritative.
- Diagnostic package SHA-256:
  4a6933b836e61aa35fefaf615cd9295501c61defe3cfd3deb673d66d2d239cc2.
  UI index SHA-256:
  7defb4746ac93ba8affd37fe6da4c40343a8918787c7ac98f9d1bfd2c354994a.
- Fresh complete ancestor/headroom admission: 7,622,299,648 bytes, above
  2880 MiB. Disk reserve passed.
- App 55bcbbf463cd153f757d8c4b7788d8a331848f8375010959e21b9ab45237ae55:
  effective memory 1610612736 bytes, zero swap, one CPU, 256 PIDs;
  AutoRemove true. Sampled peak 1,225,768,960 bytes at 15:15:20.412 UTC,
  memory max/OOM/kill counters zero. Terminal peak after removal unavailable.
- Fresh internal Docker network and fresh named state:
  vts-figma-test-qual-4828a5a3-net / vts-figma-test-qual-4828a5a3-state,
  labels issue VIS-6 and run 4828a5a3-2777-4183-b3e6-6d7feae70506.
  No copied accounts, credentials, sessions, databases, production storage or
  Docker socket. Internal network blocks external provider egress.
- The app process included the existing deadline/reserve guard set to 15:55 UTC.
  Exact-ID cleanup verified ownership, stopped the app, confirmed its absence
  and zero issue/run ephemeral containers. Host-local health returned HTTP 000.
  Fresh named state/network retained with ownership receipts. Existing live-test
  named state and design links were untouched.

## Correction and verification

Added operator/assert-session-window.sh, a fail-closed lower/upper time gate:
START_EPOCH <= current UTC time < TEARDOWN_EPOCH < STOP_EPOCH.
It never waits, launches, or extends a window. The corrected session invocation is:

    bash assert-session-window.sh 1790694900 1790697300 1790697600

The saved launch script now calls this before admission/resource creation.
Boundary checks covered before start, exact start, just before teardown,
exact teardown and hard stop. Bash syntax and whitespace passed.
The first clock-shim test failed because the shell's BASH_ENV reset its PATH;
the test subprocess then removed that test-only startup injection and all
boundary checks passed. No product hooks or CI bypassed.
An initial evidence-copy command used unsupported SFTP brace expansion;
explicit source paths recovered the receipts without repeating cleanup.

The corrected launcher was not run. No native installation, synthetic account
creation, browser launch, selector acceptance, saved GitHub/design coexistence,
disable/re-enable or restart qualification occurred. These remain deferred.
No model/task, OAuth, remote verification or provider call was initiated.
No release pass, candidate replacement or human-ready endpoint is claimed.

## Next action

Nadia owns the corrected guarded launcher and the same zero-provider
qualification sequence. Elena coordinates a replacement execution allowance
after this timing failure; no automatic retry or extension. Reuse the verified
outputs, fresh qualification state, effective limits/reserves and exact cleanup.
The frozen reproducible preview and completed owner-origin proof remain unchanged.
All release gates and Theo's complete-candidate dependency remain open.
