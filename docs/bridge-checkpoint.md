# Managed bridge and source lifecycle checkpoint

26 September 2026. Extends integration `20ceaa665674a85fe75323c4c1c10c22ccfd7620`.
Engineering remains incomplete; this is review code, not an installable plugin
or release candidate. Running host and timer/monitor settings are unchanged.

## Changes

- Host-side managed bridge derives authority from an invocation resolver, compares
  request scope to authenticated company/project/actor/run, and requires explicit
  current project and connection policy approval. Fixed inspection operation,
  normalized reference arguments, projected result state and redacted unexpected
  errors prevent a caller from selecting arbitrary tools or receiving raw provider
  data. Rechecks authorization after remote I/O so revocation suppresses results.
- Source registry tracks lifecycle generations. Replacement/disable aborts pending
  collection; old cleanup cannot unregister a new worker. A deadline bounds even
  a non-cooperating collector. Uses the existing bounded untrusted-data projection,
  authorization rechecks and cancellation. The eventual host RPC adapter must honor
  cancellation: Promise.race bounds delivery, not the underlying process lifetime.
- Worker definition composes the existing service and scoped API. It fails closed
  without a bridge. This factory is not an installed worker entrypoint.
- Review patch extends the existing host invocation registry to retain authenticated
  API actor/project context. The input is the server-built API envelope, not its
  body; captured identity is copied. Non-API company-only invocations remain
  unchanged. Missing identity cannot acquire managed authority by supplying RPC
  arguments. Patch generation checks pinned file hashes and edits no running host.

## Provenance

Target host `2026.916.1` / `d554c4789ed3930f8a53ac9fdf6503b3187097da`.
Both newly inspected local source files matched raw public upstream bytes at that
exact commit over HTTPS:

| File | SHA-256 |
| --- | --- |
| packages/plugins/sdk/src/protocol.ts | 46ce64e6527fc85f767c8a3e66c5687b90c7bb11b2f6c954e96b55d81d89b577 |
| server/src/services/plugin-worker-manager.ts | 220cef73e1fb72a389993367cb13f9b8b51060c48592fce6d3f9888e7534343a |

This establishes those source bytes, not image attestation or supported vendor
client/shared-use endorsement. Hermes reference and OAuth prerequisite are unchanged.

## Verification

- `node --test test/managed-bridge.test.mjs test/source-registry.test.mjs`:
  10 passed. Covers forged scope, expired/disabled invocation, project/connection
  denial, revocation during I/O, fixed inspection arguments, provider redaction,
  worker dispatch, deadline, cancellation, disable/replacement and stale cleanup.
- `node scripts/build-invocation-patch.mjs /app`: generated review patch.
- `node scripts/check-host-invocation.mjs /app`: patch application plus seven
  assertions on the actual extracted patched scope function passed. Includes
  body spoofing, post-capture actor mutation, incomplete agent identity,
  unsupported actor, non-API isolation, board identity and legacy tool scope.
  Node emits the expected experimental TypeScript stripping warning. This is
  not a full host typecheck or end-to-end worker RPC test.
- Initial bridge implementation used an unsupported generic error state; inspection
  of the attachment domain caught it before packing. It now maps unknown outcomes
  to `transient_error`. No initial failed product test was concealed.
- `npm pack --pack-destination "$PAPERCLIP_RUN_SCRATCH_DIR" --json`: prepack
  passed all 38 package tests and syntax/whitespace checks. Initial inventory
  parsing failed because npm lifecycle test output preceded its JSON. Parsing
  the trailing JSON inventory corrected the report; package creation succeeded.
  Final commit and artifact digest are recorded in the issue comment.

## Limits and concrete next step

The bridge policy/resolver tests use synthetic host callbacks. Real project
transaction locks, session generation, protected runtime, grant checks and managed
MCP invocation have NOT been exercised by these tests. Policy callbacks must bind
existing host services, never booleans supplied by the worker. The patch preserves
identity but does not itself register new host RPC methods. Mutation authorization
and storage commit must share the appropriate host transaction/identity lock;
prechecks alone cannot establish race-safe authorization.

Nadia next binds the host-service RPC handler to its active invocation context,
existing project/run and managed connection policy, adds the SDK client and actual
worker entrypoint, and registers source collection in both runtime preparation
paths with lifecycle cleanup. Then wire native Designs UI and pinned onboarding.
No UI, catalog, heartbeat or production runtime registration is claimed here.

Live OAuth, refresh/shared-agent inspection, real host authorization, both clean
instance lifecycle tests, full host release checks/CI, pinned official skills and
install/update/rollback runbook validation remain deferred. Do not pass release
acceptance or close Theo's complete-candidate dependency on this checkpoint.
