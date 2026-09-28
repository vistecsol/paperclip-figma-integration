# Native reload diagnosis — 28 September 2026

Integration baseline b277499c8204c93cbf8a131dcff4439a885613cb.
Host 2026.916.1 / d554c4789ed3930f8a53ac9fdf6503b3187097da.
Arm64 image sha256:4e2e1e59219129a4b687cd54ba439fb7fed0a5710af9f1551277dedd23dc61f1.
No host rebuild, restart, deployed source change, grant mutation or Figma call.

## Changed evidence

The read-only diagnostic uses the existing synthetic project
370fd415-d4f9-45c0-9e89-bfded2155bfa. Its native session arrives over stdin from
private test state and is never recorded. It logs URL paths without query strings,
response codes, explicit stages and classified console events. No response
credentials or headers are saved.

1. Worker-enabled Chromium: native login at 21:55:18 UTC, fresh navigation and
saved design visible by 21:55:19.765. Reload at 21:55:19.885; the saved-link
assertion failed after 20 seconds with native Loading. Auth/session, adapters,
health and experimental settings responses were 200. No captured page error.
This certifies fresh navigation, not reload.
2. Differentiated diagnostic with serviceWorkers blocked: login 21:57:33.189;
fresh navigation, reload and authenticated keyed readback passed by 21:57:36.363.
Revision 1, expected label and shared connection, verification unverified.
This is diagnostic evidence only: disabling the worker is not normal acceptance.
Browser peak 541028352 bytes; memory.events max 6671, oom and oom_kill zero.
Peak briefly above configured limit does not imply the effective limit was changed.
3. Worker-enabled comparison with request-finished and projected body-completion
evidence, 35-second assertion: fresh saved link visible at 21:59:01.830, reload
21:59:01.940. Reload still failed. Later failure capture showed the native shell,
but no project content; worker controller true, document visible. Session body
completed with a user, health authenticated/ready, and experimental settings
completed. Subsequent company/project requests had started by final capture.
This does not prove a failed backend response or an infinite Loading state.

No repeated save or new fixture mutation. The served worker is the native
build-stamped worker (index-DQ6KiWFu), network-first static cache and API bypass.
The comparison implicates the worker-enabled smoke path but does not establish
a precise root cause. Capped-browser cache/CPU/memory pressure is a hypothesis,
not a finding. No service-worker disablement was deployed or offered to Adam.

## Execution and safety

Executed through /Users/nolan/vts-figma-test/bin/docker-job:
bash access-674c9b1f-13bb-4663-be3c-48b78e61eba7/reload-proof.sh
     access-674c9b1f-13bb-4663-be3c-48b78e61eba7 <run-id>
(Absolute directory arguments in the retained runner artifact.)

Each sequential browser admission reused the full 3392 MiB aggregate threshold,
1280 MiB reserve and 2 GiB disk reserve. First fresh admission:
6479364096 bytes headroom, 919067586560 bytes disk. Browser enforced
512 MiB/no swap/one CPU; six-minute outer lifetime, reserve supervision,
AutoRemove and ownership checks. Only test-app network namespace shared;
no production mounts or Docker socket. Native synthetic session piped over stdin.

A concurrent attempt to sample pressure through the wrapper was refused by its
job lock; no Docker command ran in that attempt and the lock was not bypassed.
Final wrapper check verified the last browser absent, exact app
9f765711b5f951ce34d6dd9db018c2855590ee38fd3e5139703a4b2b2be7aec3 running,
1536 MiB/no swap/one CPU, AutoRemove, health 200. App peak 1307811840,
own max/oom/oom_kill counters zero. Original 22:05:33 UTC expiry unchanged.

scripts/check-attachment-reload.mjs now adds immediate stage output, bounded
failure screenshots/navigation, deadline evidence and one-second resource samples.
Syntax and whitespace pass. Those final logging improvements were not rerun;
runtime evidence above comes from the preceding recorded harness versions.

## Remaining action

Normal reload acceptance remains unpassed. Nadia owns a controlled worker-enabled
diagnostic with pressure and response-completion timestamps, then the smallest
evidenced correction; no speculation-based native worker patch. Elena coordinates
a new 45-minute Mac window for that check and subsequent inspection proof.
Use retained outputs/state and existing app limits/reserves; no rebuild prerequisite.
Any changed browser resource budget needs explicit coordination and fresh aggregate
admission. No ready/retry handoff until worker-enabled reload is verified.

After that gate: apply native fixed deny-by-default inspection selection, verify
write/destructive/new-tool denial, correct the real attachment revision-safely,
then context/screenshots and fresh-agent proof. None of those later runtime steps
was attempted here. Automatic draft selection, package reproduction, full host/CI,
protected runtime, onboarding and lifecycle acceptance remain open.
