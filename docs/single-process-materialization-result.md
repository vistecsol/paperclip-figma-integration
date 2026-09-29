# Single-process native materialization result

29 September 2026. Authorized by single-process-continuation revision
350df6ae-6105-4970-a088-d4d2d9af896d. Integration input
`e2d2ab718ebd3f9a1efb8e584a8ba88f06c2052b`; host
`2026.916.1 / d554c4789ed3930f8a53ac9fdf6503b3187097da`;
arm64 image `sha256:4e2e1e59219129a4b687cd54ba439fb7fed0a5710af9f1551277dedd23dc61f1`.

Native materialization and additive replay passed in the server process.
The official skill matches commit 38308b7bbc676a9e9d57795ad4793fa9682d1644
and SHA-256 a6e852421e4db72260b2ca641929b1f84684e5b067aead081e35111f5b5feee4.
All five prior desired Paperclip skills materialized; seven library rows and
all six desired assignments were preserved. Replay produced identical hashes.
The fresh employee directory was absent before creation. Subsequent cache
inventory found only this run's materialization directory; existing native
runtime entries were reused and verified through native service selection.
This is adapter materialization proof, not actual model visibility or an audit pass.

The approved single test task was created after prerequisites passed:
`07b6529e-43a7-4dda-91c0-b92274e4a987` (VTS-2, isolated test instance).
Its run `9885843a-5106-463a-9bcb-d582ef6bd90c` failed with
`configuration_incomplete`: “Connect an account and choose your personal default”.
The task is blocked. No model execution or Figma provider call was reached;
all four additional provider calls remain unused. The single-task authorization
is now consumed: resume this same task after supported correction, do not create another.

Native source ai-connections.ts throws this message when no grant ID resolves
from the requested AI connection binding/personal default. Exact retained
binding, responsible identity and permitted saved grant still need inspection;
do not infer that another login is required or reuse someone else's identity.
No AI grant/default or credential was changed, and no failed run was retried.

## Execution and containment

Used the existing Mac docker-job wrapper. Copied the two committed test-only
TypeScript files and changed only the copied launch entry from server/src/index.ts
to server/materialization-session.ts. Retained secret bootstrap, privilege drop,
tsx loader and safety guard; explicit issue/run markers supplied.
Restored domain/worker/UI and both harness hashes matched expected bytes.

At 05:37:39.705 UTC fresh complete daemon/ancestor headroom was 7,599,841,280
bytes; disk free 919,199,436,800 bytes. Executable startup gate 2880 MiB
(the generic observer report's 3328 MiB label is not the executable gate).
Hard stop recorded before launch: 06:05:38 UTC. Effective app 1536 MiB,
no swap, one CPU; 1280 MiB host and 2 GiB disk reserves retained.
Final observed memory.peak 1,421,549,568 bytes; own max/OOM/kill counters zero.
This is an observed peak before stop, not a terminal peak certification.

Exact app bef129c6c3687b99b654b9e1ffd93e40f9ebce5179c9eb23023e9fe38ce868d7
was stopped once. Immediate cleanup assertion raced AutoRemove; independent
subsequent issue/run-filtered readback confirmed no ephemeral containers.
Named state, credentials, assignments, links and network retained. Access OFFLINE.

Local plain node --check treated TypeScript as JavaScript and rejected the
non-null assertion; native tsx execution successfully parsed and ran both files.
Readback initially retained an obsolete idle assertion after the agent entered
error; corrected read-only inspection recovered the failed run without retrying it.
SCP brace expansion was unsupported; explicit file copies succeeded. No rebuild,
broad suite, hook bypass, production operation or timer.

Next: Nadia inspects the native AI binding and responsible-user default against
existing authorized managed grants, then resumes the same approved task in an
Elena-coordinated bounded window after supported correction. No new task or
login is presumed. Native GitHub audit, fresh-agent/shared-use/protected-runtime,
automatic draft selection, full-host/CI, reproducibility and lifecycle gates
remain open; Theo's complete-candidate dependency is unchanged.
