# Retained employee skill assignment and lazy-source preflight stop

29 September 2026; authorized by `skill-correction-continuation` revision
4d40c161-730f-4eab-8605-fe3501f4bd6f on [VIS-6](/VIS/issues/VIS-6).

One bounded Mac session ran. Pinned official import and additive assignment
succeeded; runtime availability preflight stopped before replay or task creation.
This is not evidence of a broken import or successful fresh-agent execution.

## Exact inputs and results

- Integration input: da941cec93e82494fe738127a6cc1d71b59d2167.
- Host: 2026.916.1 / d554c4789ed3930f8a53ac9fdf6503b3187097da.
- Arm64 image: sha256:4e2e1e59219129a4b687cd54ba439fb7fed0a5710af9f1551277dedd23dc61f1.
- Official source: figma/mcp-server-guide, commit
  38308b7bbc676a9e9d57795ad4793fa9682d1644, skills/figma-design-to-code/SKILL.md.
- Stored file SHA-256:
  a6e852421e4db72260b2ca641929b1f84684e5b067aead081e35111f5b5feee4.
- Test company e36aa1e8-e20b-469e-a661-a2ff66d77536;
  project 1fce47de-0092-4084-8d4f-4624f710e483;
  idle Test employee ed1c19c4-97fe-4aa3-8888-fb425683386a; timer disabled.
- Library had six existing rows and no Figma conflict. Native import created
  0743f2f3-c0ef-4c35-aa3e-c9cee1b3ec1b with sourceType github and exact sourceRef.
- Native skills/sync mode add saved figma/mcp-server-guide/figma-design-to-code.
  Independent readback preserves all five prior desired Paperclip skills.
  Prior library row IDs remain; complete content comparison was not reached.
- Runtime snapshot returns desired=true, state=missing, sourcePath=null for Figma.
  Its message formats the remote URL as a local path. No warnings array entry.
  The assertion requiring a sourcePath failed. Replay was not executed.

## Diagnosis and concrete correction

The exact pinned agents.ts GET skills route calls buildRuntimeSkillConfig with
materializeMissing:false. Its company-skills.ts resolver returns missing for
an unmaterialized runtime cache. Therefore the HTTP snapshot alone is not a
valid prerequisite test of whether the importer can supply a fresh run.
The preflight expected eager materialization too early; no product bug is
established by this outcome.

The existing test/host-onboarding.test.ts already demonstrates the native
service listRuntimeSkillEntries(companyId), Codex desired selector and
ensureCodexSkillsInjected in isolated employee directories. The next harness
should use that native materialization path for the exact retained employee,
verify pinned bytes and preserved prior entries in a fresh run directory,
then repeat additive sync and readback. Do not manufacture the reported URL
path, relabel the GitHub source, edit database grants, or claim audit acceptance.
Any failure must still stop before the approved task. This source diagnosis
was performed after cleanup; no corrected runtime attempt occurred.

## Resource evidence and commands

SSH nolan@macbuilder01.skynet.local through the authorized docker-job wrapper:
restore.sh, preflight.sh, onboard.sh, read-only diagnose.sh, cleanup.sh.
All scripts and redacted readbacks accompany the issue artifact.

Fresh daemon/ancestor admission at 05:20:31.665 UTC: 7,590,150,144 bytes
headroom and 919,199,297,536 bytes disk. Executable admission gate 2880 MiB;
observer generic threshold is not the executable gate. Absolute hard stop
05:49:31 UTC was recorded before launch, less than 30 minutes after startup.
App 10a7e6e0cfe8a4826dc4e16c323f286c65c80fc25b9fbb0f579893b6ab5b1a74:
1536 MiB/no swap/one CPU, AutoRemove; full 1280 MiB host/2 GiB disk reserve.
Observed memory peak 1,324,630,016 bytes; own max/OOM/kill counters zero.
Retained domain/worker/UI hashes match the prior verified record.

Exact app was ownership-verified and stopped after prerequisite failure.
Independent issue/run-filtered Docker readback returned no ephemeral containers.
Named state, skill import/assignment, credentials and links are preserved.
Access is OFFLINE. No rebuild, provider call, task, model invocation, production
operation, canvas edit, timer, publication or interim QA wake.

## Remaining and ownership

One-task authorization ae5a9c75-2868-4874-9046-1c8b7b09d6a0 is unconsumed;
all four additional provider calls remain. Nadia owns correcting the lazy-source
preflight and native materialization/replay proof; Elena coordinates the next
bounded session. No repeat login, task approval or increased capacity is needed.
Native GitHub audit, fresh-agent/shared-use/protected-runtime, automatic draft
selection, full-host/CI, reproducibility and lifecycle gates remain unpassed.
Engineering is incomplete; Theo's complete-candidate dependency is unchanged.
