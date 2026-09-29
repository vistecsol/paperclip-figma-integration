# Retained native materialization: bounded session memory stop

29 September 2026. Corrected continuation revision
64c1f52c-51f6-4e18-800b-0697f5ec8687 authorized one session.
Integration input 7190c90941aa90d087b165e8b5671743ed568ecd;
host 2026.916.1 / d554c4789ed3930f8a53ac9fdf6503b3187097da;
arm64 image sha256:4e2e1e59219129a4b687cd54ba439fb7fed0a5710af9f1551277dedd23dc61f1.

## Result

The corrected preflight stopped on a real OOM before native materialization
emitted a result. No test task or model run was created; all four additional
provider calls and the single-task authorization remain unconsumed.

The retained import/assignment was reused, with no reimport or grant mutation.
Native authentication, exact employee/company/project identity, idle Codex
employee, disabled timer and all six desired skills passed. The executable
hashes matched the prior verified domain, worker and UI records. Native
materialization and additive replay did not pass; no source availability or
fresh-agent acceptance is claimed.

At 05:29:58.606 UTC, daemon/ancestor headroom was 7,634,415,616 bytes and
free disk 919,199,244,288 bytes. Executable startup gate was 2880 MiB;
observer generic threshold is not the executable gate. Hard stop recorded
before launch: 05:58:57 UTC. App memory 1536 MiB/no swap, one CPU, with
1280 MiB host/2 GiB disk reserve guard. No limit increase or rebuild.

Exact app b0b74baf08830c9579d6dc457698923141011484acbe977f9c6970164b33edd3
started at 05:29:59 UTC. At 05:30:14 a second Node process began loading the
native host/Codex modules through tsx. At 05:30:17 Docker recorded `oom`,
exec exit 137, container exit 137 and `destroy`. This proves an OOM-associated
session failure, not the precise allocation responsible. Terminal peak and
cgroup event counters were unavailable after AutoRemove. No invented peak or
successful larger-budget claim.

Independent issue/run-filtered readback confirmed no ephemeral containers.
Original labels remain on the retained test-state volume/network. State was
not deleted; accounts, central credentials and design links remain in named
storage. Partial runtime-cache materialization cannot be excluded and must be
checked on the next session. Access is OFFLINE.

## Exact execution

Through SSH nolan@macbuilder01.skynet.local and the existing docker-job wrapper:
1. `restore.sh <retained-job-directory> <run-id> <session-directory>` performs
   ownership/admission checks, restores passed assets and starts the app.
2. `materialize.sh <session-directory> <run-id>` verifies executable hashes,
   runs native HTTP identity/assignment readback, then invokes:
   `node --import /app/server/node_modules/tsx/dist/loader.mjs /app/server/retained-skill-preflight.ts`
   as node user with explicit test/run markers. This second-process invocation
   failed; replay commands were not reached.
3. Read-only exact-container Docker events and cleanup readback recovered the
   failure after AutoRemove. Cleanup reporting initially tried to read absent
   state/peak files; subsequent event evidence is authoritative.

The source/evidence artifact contains these scripts and non-secret receipts.
An initial local syntax helper referenced an unavailable TypeScript package;
Node's built-in `--check` subsequently passed both TypeScript harness files.
No broad suite, full build, hooks/CI bypass or production action occurred.

## Prepared smallest changed approach — not executed

`operator/retained-skill-preflight.ts` now exports the native verification
function. `operator/materialization-session.ts` calls the existing exported
`startServer()` and performs native service/Codex materialization, pinned-byte
and prior-entry verification, HTTP additive sync and materialization replay
in that same Node process. Imported host modules share its module cache;
this removes the second simultaneous host/Codex module graph. Its memory
benefit and runtime behavior are unproven.

For the next explicitly coordinated session, copy these two test-only files
to `/app/server/` of the exact owned app before launch. In its copied
`start-source.mjs` only, replace the final `server/src/index.ts` entry argument
with `server/materialization-session.ts`; retain secret bootstrap, privilege
drop, native tsx loader and access-window guard. Set FIGMA_PROOF_ISOLATED=VIS-6
and FIGMA_PROOF_RUN to the new run UUID. Keep the existing memory/CPU caps,
2880 MiB startup gate and reserves. Record a fresh hard stop and capture
stage receipts before task creation. No production source patch, public
proof endpoint, source-index injection, rebuild or extra RAM is proposed.

Syntax/whitespace passed for this source preparation only. The previous
second-process failed command must not be repeated unchanged. Elena owns
coordination of the changed session; Nadia owns its prerequisite proof and
then the already-approved single test task. Native GitHub audit and all
remaining release gates, including fresh-agent/shared-use/protected-runtime,
automatic selection, full-host/CI, reproducibility and lifecycle acceptance,
remain open. Theo's complete-candidate dependency is unchanged.
