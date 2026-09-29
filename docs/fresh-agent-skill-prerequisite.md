# Fresh-agent session: missing official skill prerequisite

29 September 2026. Accepted confirmation ae5a9c75-2868-4874-9046-1c8b7b09d6a0
targets fresh-agent-session revision aceccb99-9bcd-4874-8616-0eef29290d17.
One bounded unattended session executed; no user attendance requested.

Integration HEAD c40c18c181c85814bc6406bd2f297f8fa45cd6d5.
Retained executable input 841e831925125e6490896368f338177c084a6a40.
Host 2026.916.1 / d554c4789ed3930f8a53ac9fdf6503b3187097da.
Arm64 dependency image sha256:4e2e1e59219129a4b687cd54ba439fb7fed0a5710af9f1551277dedd23dc61f1.

## Verified outcome

Fresh daemon/ancestor admission at 05:14:19.228 UTC:
7,651,041,280 bytes headroom, 919,199,485,952 bytes disk.
Executable app gate 2880 MiB; observer's generic threshold is not that gate.
Retained named network/volume ownership verified against original run
c69805a3-cd15-444d-98f0-645d61b68cca and issue VIS-6.
App 42665c1f5504e68b659d71841a35e61ff1bc3622c41d18767233307ed25d4dcf:
1536 MiB, no swap, one CPU, AutoRemove. Absolute deadline set before launch;
full 1280 MiB host/2 GiB disk reserve guard retained. Stopped early on prerequisite failure.
Observed memory peak 1,305,755,648 bytes; own max/OOM/kill counters zero.

Native retained sign-in succeeded. Project 1fce47de-0092-4084-8d4f-4624f710e483
and idle codex_local employee ed1c19c4-97fe-4aa3-8888-fb425683386a both matched
test company e36aa1e8-e20b-469e-a661-a2ff66d77536. Timer disabled.
GET /api/agents/:id/skills returned only five desired Paperclip skills;
no Figma skill assignment or Figma runtime entry exists. No warning was returned.

The approved proposal says to record missing skills as failures and stop on a
failed prerequisite. Accordingly no task was created, no employee run started,
and zero of four additional Figma calls were used. This is a prerequisite failure,
not failed model inference or a fresh-agent proof pass. No permission broadened.

Read-back executable hashes match prior proof:
- domain: 7b275453cc7efa94b32f3cca188ca8581a99dfe3d524c018600cb9d41a0a166a
- worker: 27f729dbeff8cc833f89ef4dadc2c5e97768e8f4b5745f126cb0d98c8d4ea9b6
- UI: 7c107e86ccb5dd4e9e4dd0ebc7c9a8e355820ae0db1eab66a30c54e68c30f9a0

## Commands and cleanup

Through SSH nolan@macbuilder01.skynet.local, authorized docker-job wrapper:
1. bash fresh-<run>/restore.sh job-c69805a3-cd15-444d-98f0-645d61b68cca <run> fresh-<run>
2. bash fresh-<run>/preflight.sh fresh-<run> <run>
3. bash fresh-<run>/cleanup.sh fresh-<run> <run>

Scripts and non-secret readbacks accompany this record. The preflight reads
native account credentials only within test storage; none are printed or copied.
Cleanup verifies exact labels before stop; separate issue/run-filtered Docker
readback returned no ephemeral containers. Named state/credentials/design links
preserved. Access remains OFFLINE. No production operation, rebuild, canvas edit,
repeated suite, Xcode action, timer or publication.

## Concrete correction and next proof

Existing docs/official-skill-onboarding.md supplies the supported correction:
inspect this test company's library for an existing suitable/conflicting skill;
import only docs/official-skill-pin.json's exact source if absent; verify stored
bytes against that pin; use native skills/sync additive mode for the existing
Test employee and verify preservation/replay. The prior isolated synthetic
onboarding tests did not provision this retained employee. Do not claim native
GitHub audit acceptance or relabel provenance.

Nadia owns this onboarding and fresh-run verification. Elena coordinates a new
bounded session including that prerequisite correction. The accepted single-task
authorization is unconsumed; do not request task approval again. Next session
should complete prerequisite readback before creating that one project task;
retain the four-call cap and existing limits/reserves. No further login or build
is required by this finding. Automatic draft selection and all remaining
shared-agent/protected-runtime, full-host/CI, reproducibility and lifecycle gates
remain open. No complete candidate handoff to Theo.
