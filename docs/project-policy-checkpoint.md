# Host project policy and transaction checkpoint

26 September 2026. Builds on integration `9148136ab6fcb313b30bd617f4b8c7258427510b`.
Engineering remains incomplete. No running-host change, deployment or publication.

## Implemented

`host-prerequisite/server/src/services/figma-project-transaction.ts` binds the
actual host `projectToolContext` and `accessService` to one database transaction.
It snapshots the original authenticated Express actor, verifies project company,
requires an agent's current task to belong to that project, enforces active run,
conversation generation and writable work mode, then executes persistence inside
that transaction. The existing task/run locking order is preserved. Board access
uses existing project authorization; no new permission action is invented.

`src/host-operations.mjs` provides host-side list/source/mutation operations.
Storage scope comes from the authorized transaction callback, not worker request
fields. Commands are copied before yielding to authorization. Connection binding
is required for adds. Detach remains possible without Figma access. These
operations are the replacement path for the earlier worker-side precheck followed
by a separate storage commit; the worker has NOT been switched to them yet.

The helper's original actor requirement matters: the current scoped-plugin API
copies actor ID, agent and run but omits authentication source and key scope.
Reconstructing an Express actor from that reduced record would invent authority.
The next host RPC change must retain the original actor in a host-only invocation
record, not worker arguments or the serialized invocation scope. A company-only
proactive invocation cannot use this transaction helper as an authenticated run.

## Exact provenance

Host target: `2026.916.1`, upstream
`https://github.com/paperclipai/paperclip`, commit
`d554c4789ed3930f8a53ac9fdf6503b3187097da`.
Five additional host sources matched public upstream bytes at that revision:
project-tool-context, run-identity, access, authorization and plugin-database.
`host-prerequisite/project-policy-baseline.json` records their SHA-256 hashes;
the isolated proof preparation checks them. This is source verification, not
image attestation or a vendor supported-version declaration.

## Reproduce and results

Use a fresh authorized `PAPERCLIP_RUN_SCRATCH_DIR` and the pinned host with its
normal installed dependencies. No production database URL is used.

```sh
node --test test/host-operations.test.mjs
node scripts/prepare-host-proof.mjs /path/to/pinned-host
FIGMA_INTEGRATION_ROOT="$PWD" /path/to/pinned-host/node_modules/.bin/vitest run --root "$PAPERCLIP_RUN_SCRATCH_DIR/host-proof/server" src/__tests__/figma-project-transaction.test.ts
npm test
npm run check
npm pack --pack-destination "$PAPERCLIP_RUN_SCRATCH_DIR" --json
```

- Five targeted operation tests passed: transaction scope, policy/connection
  denial, rollback, caller-command mutation and read-only discovery.
- Seven real host/PostgreSQL tests passed. They exercise the unmocked project/run
  and access services, real plugin migration/storage, company mismatch, nonmember
  board denial, same-project active runs, Ask/Plan write denial, Plan reads,
  cancelled runs, stale conversation generation, other-project denial and API-key
  denial. `FOR UPDATE NOWAIT` on a second connection proves the run lock survives
  through the attachment transaction. Actual attachment persistence rolls back on
  failure, commits on success, and stops after cancellation.
- Connection approval in the attachment integration fixture is synthetic. This
  does not prove grant removal, inspection permissions or protected MCP runtime.
- Initial host run: four passed, two failed due to test fixtures (Drizzle wraps
  lock errors; conversation fixtures require user and state). Assertions now
  check PostgreSQL `55P03`, and fixtures satisfy the real schema. Next run failed
  setup because an alternative test plugin key did not match the migration's
  canonical namespace. Using `vistecsol.figma` corrected that fixture. Final run:
  seven passed, none skipped. These failures are not recorded as passing runs.
- Package and inventory results, final integration commit and artifact digest
  are recorded in the task comment after final packaging.

## Remaining gates and next action

Nadia owns host-only original-actor capture, fixed-operation RPC registration,
transaction-bound managed connection/grant policy and worker switch-over.
Invocation expiry/disable must prevent commits; membership/grant revocation must
not race persistence. Existing tests prove task/run lock retention, not every
concurrent authorization change. Do not hold database locks across remote MCP
network calls; inspection needs separate preflight and checked commit phases.
Then finish runtime source registration, SDK entrypoint, Designs UI, pinned
skills/onboarding and install/upgrade/disable/uninstall runbook.

Not performed: full host typecheck/build/CI, end-to-end worker RPC, live OAuth or
shared-agent retrieval, actual inspection/protected-runtime checks, both clean
instance lifecycle tests. No installable release candidate or readiness claim.
Rollback remains disable executable access while preserving design link records;
this checkpoint modifies no real instance and requires no destructive rollback.
