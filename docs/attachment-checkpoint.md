# Attachment implementation checkpoint — 26 September 2026

Elena's 18:53 execution direction supersedes the earlier live-proof sequencing
holds in historical reports. Nadia owns isolated harness preparation. Live
OAuth/shared-agent proof remains release acceptance work, not a prerequisite to
independent implementation. This checkpoint does not declare engineering done.

## Implemented

- Strict official HTTPS design/file URL parsing, normalized file/node identity,
  duplicate detection and query/fragment removal. No supplied URL is fetched.
- Project-wide revisions, stable IDs, rename/purpose, reorder, one primary,
  detach and classified verification states. Arbitrary body fields are not saved.
- Company/project-keyed plugin SQL storage with a single atomic compare-and-swap
  per mutation. Initial insert races also reject one writer. The whole bounded
  project collection is one JSONB row so primary selection/reordering cannot
  partially commit. No transaction SDK extension is needed for this model.
- Explicitly internal service seam for host-authenticated project and managed
  connection authorization. Every call rechecks project access; add/verify
  recheck the connection. A broken link can still be detached without Figma
  access. The seam is not a claimed SDK API and is not exposed as a worker.
- Compact structured source records with exact node citations. Fresh-run host
  injection and connection health enrichment are still outstanding.
- Engineering-preview npm package with an explicit file allowlist and no runtime
  dependencies. No install hooks, host patch application, credentials or private
  connection configuration are bundled.

Storage is scoped, but storage scoping is not an authorization proof. Unit tests
use a synthetic bridge; actual host actor/grant/protected-runtime integration
remains required. Link metadata is untrusted data and must stay data in runtime
context and UI.

## Executed checks

- `npm test`: 19 core/service tests passed.
- `npm run check`: JavaScript syntax and whitespace checks passed.
- `node scripts/prepare-host-proof.mjs /app`: created copied source with the
  existing OAuth prerequisite in the run scratch directory.
- `FIGMA_INTEGRATION_ROOT="$PWD" /app/node_modules/.bin/vitest run --root "$PAPERCLIP_RUN_SCRATCH_DIR/host-proof/server" src/__tests__/figma-attachments-database.test.ts`:
  4 passed against new embedded PostgreSQL through actual host
  `pluginDatabaseService` migration/query/execute validation. Migration replay,
  persistence across store recreation, company/project separation, competing
  insert/primary writes, stale reorder and detach preservation passed.
- The first multi-file edit attempt failed at sandbox namespace initialization;
  no partial files were left. Escalated file editing and verification succeeded.
  No commit hooks or CI were bypassed. The dependency-free lockfile was generated offline; packaging ran its prepack checks. Initial inventory review found the test files missing from the allowlist; tests and both harness scripts were added before the final repeat-pack check.

Host baseline remains `d554c4789ed3930f8a53ac9fdf6503b3187097da`.
The existing helper verifies the OAuth-touched source hashes. This run reused
installed host dependencies; it is not a clean dependency installation or full
host build. The four database tests do not independently attest all host bytes.

## Draft installation and rollback boundary

The tarball is a review artifact, not an installable plugin candidate. Do not
install it on a production or adopting company server. Future clean-instance
installation must use the host plugin loader after the worker, UI, managed
bridge and source contribution exist and required host checks pass. No generic
npm install command is represented as working Paperclip installation.

Migration namespace is derived by the pinned host from plugin ID
`vistecsol.figma` and slug `figma`. Keep both stable. Preserve the project rows
on disable, uninstall and rollback. A future downgrade must keep schema 001
readable; do not drop schemas or destructively revert migrations. Remove
executable grants/installations through managed controls before rollback.
Current tests created synthetic records only; no real associations were changed.

## Next work and deferred acceptance

Nadia: implement/review the minimal managed-connection bridge and host source
contribution; wire authenticated scoped API and native Designs UI; pin official
skills and additive onboarding; prepare a browser-reachable isolated managed
test instance. Then run live managed setup with indispensable VTS identity and
readable fixture inputs, two eligible runs, recovery and isolation checks.

Deferred, not passed: live login/shared use, actual host project/connection
authorization and protected-runtime enforcement, UI, skill provisioning, plugin
loading, fresh-run injection, full host checks/CI, clean-instance install twice,
upgrade/disable/uninstall and live link-preserving rollback. Package contents and
repeat-pack hash results are recorded on the issue. Theo receives this increment
as preliminary evidence; the complete-candidate review dependency stays open.
