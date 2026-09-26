# Host RPC and bundled-worker checkpoint

26 September 2026. Engineering incomplete; this is an attachment engineering
preview, not a release candidate. It continues `6d12aab541209f502662185c1a1ef2e81ca324fd`.
Elena's execution-window and risk-based testing comments are applied. No review
approval or renewed host-scope permission was required. Running host unchanged.

## Implemented boundary

The scoped API route snapshots the original authenticated Express actor and
original request into a host-only WeakMap. The worker manager binds that snapshot
to its active invocation object. Only company scope is serialized; source, key
scope and membership information stay on the host. Copies/forged parameters and
company-only proactive calls cannot obtain that authority. Completion, timeout
and worker stop invalidate it.

`projectDesigns.execute` is registered through the SDK protocol, capability gate,
worker client and native host services for `vistecsol.figma`. It accepts no SQL,
actor, project or operation from the worker. It executes the captured request
using the existing project/run policy and attachment transaction. Original
request mutation after capture cannot change the operation. Checks at the end of
the transaction reject authority that expired while awaiting SQL.

Plugin/company enabled state and same-company connection binding are checked
inside the persistence transaction. The effective remote endpoint is taken from
`connection.config` (the gateway's source), must be the exact official Figma
endpoint, and cannot be replaced by a URL credential reference. Connection row
locks preserve that decision until commit. This is **association policy only**:
a link does not grant managed-tool access and no grant/shared-use proof is claimed.
The native manifest requires namespace-read capability for migrations; native
host services deny direct namespace query/execute RPC for this plugin so all
attachment access remains scoped. Host-owned migration/persistence still works.

The worker now uses the fixed RPC, has a real native manifest and bundled SDK,
and refuses initialization without the prerequisite. Its health explicitly
reports incomplete qualification. `designs.verify` returns 501 until actual
managed inspection is wired. No mock success, Figma network call, credential
read or Figma canvas mutation is part of this implementation.

## Provenance

Host target `2026.916.1`, public upstream `paperclipai/paperclip` commit
`d554c4789ed3930f8a53ac9fdf6503b3187097da`. Seven route/worker/SDK/host-service files
in the invocation and RPC baseline JSON files were fetched from that exact
public commit and matched the inspected host bytes by SHA-256. Existing OAuth
and project-policy baselines remain applicable. This is source verification,
not deployed image attestation or a declared vendor compatibility range.

Build: Node `24.21.0`, esbuild `0.28.2`, bundled SDK source version `1.0.0` with
this repository's explicit RPC patch; Zod `4.4.3`. `THIRD_PARTY_NOTICES.md`
contains their MIT notices. `dist/build-provenance.json` records source, patch
and output hashes. The generated host domain module comes only from this
repository's API/storage/domain code; the host never loads arbitrary executable
plugin code into its process.

## Verification and limits

Passed affected checks:

- Real worker authority retention, no original actor data in serialized messages,
  copied-envelope rejection, completion/timeout invalidation, and rejection of
  an unpatched host.
- Actual bundled worker, native manifest loader, SDK capability dispatcher,
  native host-service registration and isolated PostgreSQL persistence. Captured
  requests override changed worker envelopes. Unavailable connections, misleading
  endpoint configuration and disabled company plugins are denied without an
  attachment revision change. Re-enabling preserves the links.
- Actual native host services deny direct SQL. Existing real task/run transaction
  checks cover Ask/Plan mutations, stale/cancelled runs, project/company mismatch,
  run-lock retention and rollback. Final affected suite: 12 passed. The final
  native-registration refinement is rerun separately and recorded on the issue.
- Patched SDK `tsc --noEmit` passed. Manifest accepted by the actual host schema.
  Two independently prepared host directories produced identical worker/manifest
  hashes and build provenance. Package checks and final tarball/inventory hashes
  are recorded on the issue after packing.

**Failed required host verification:** isolated server `tsc --noEmit` was killed
with exit `137` before diagnostics. No full host typecheck/build/CI pass is
claimed. The cgroup's cumulative `oom_kill` counter was 1 when inspected, but no
before-counter was captured; resource termination is suspected, not proven.
The task's current execution workspace is null, project runtime policy is null,
and environment enumeration returned `Board access required`. Elena owns the
supported runtime-placement coordination; Nadia owns rerunning the checks.
No repeated heavy check, timer, monitor change or paid resource change was made.

Initial harness failures: missing isolated root tsconfig; a fixture used a
literal company instead of its database-generated company; direct Node and one
incorrect tsx path failed to resolve TS source; native schema required migration
read capability. These were corrected and affected checks rerun. They are not
reported as passes. Prepack also caught an obsolete worker test after the contract
switch; the test now checks the fixed RPC and preserves error-redaction coverage.
Endpoint-source inspection also corrected the first draft
before the final tests.

## Reproduce

Use a fresh run-owned scratch directory, pinned host source and its installed
dependencies. Do not apply these patches to the running server.

```sh
node scripts/prepare-host-proof.mjs /path/to/pinned-host proof
node scripts/build.mjs "$PAPERCLIP_RUN_SCRATCH_DIR/proof"
/path/to/pinned-host/node_modules/.bin/tsc --noEmit -p "$PAPERCLIP_RUN_SCRATCH_DIR/proof/packages/plugins/sdk/tsconfig.json"
FIGMA_INTEGRATION_ROOT="$PWD" /path/to/pinned-host/node_modules/.bin/vitest run --root "$PAPERCLIP_RUN_SCRATCH_DIR/proof/server" src/__tests__/figma-api-authority.test.ts src/__tests__/figma-project-transaction.test.ts
node --import /path/to/pinned-host/node_modules/.pnpm/tsx@4.23.12/node_modules/tsx/dist/loader.mjs scripts/check-host-manifest.mjs /path/to/pinned-host
npm pack --pack-destination "$PAPERCLIP_RUN_SCRATCH_DIR" --json
```

The host-domain bundle can be regenerated with pinned esbuild using
`scripts/host-domain-entry.mjs`, platform node, format esm, and output
`host-prerequisite/server/src/services/figma-domain.mjs`. The preparation helper
copies sources and dependencies into an isolated proof tree and refuses to
replace an existing tree. Test databases are synthetic and independently torn
down. No production database configuration is consumed.

## Remaining engineering and gates

Nadia still owns actual managed grant/protected-runtime inspection, source
registration in both runtime paths, UI, official-skill pinning/onboarding and
complete lifecycle validation. Live OAuth, shared eligible-agent context and
screenshots, inspection permissions, grant removal/recovery, full host checks
and both clean-instance lifecycle tests remain unproven. Source registry and
managed bridge modules remain unwired review code. Managed discovery returned
no Figma service in this run; no connection intent was manufactured.

The prepared source copies and direct worker/migration tests are **not two clean
Paperclip instance installations**. Follow the [draft runbook](draft-runbook.md)
for the intended test procedure after the remaining prerequisites are completed.
Theo's assigned review receives this exact partial evidence; its full-candidate
dependency stays open. Elena retains scope and release decisions.
