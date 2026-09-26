# Native managed inspection checkpoint

Continues integration `ff3999db05c7dda63a0975ddc89959eed5b51b99` against
Paperclip `2026.916.1` / `d554c4789ed3930f8a53ac9fdf6503b3187097da`.
Resulting commit and package digest are recorded on VIS-6. Engineering preview;
not a release candidate. No full-host compiler retry was performed.

## Implementation and boundary

The attachment access-check operation no longer unconditionally returns 501.
It checks the expected project revision, resolves the persisted reference,
authorizes the official same-company connection and persists only a normalized
verification state/time through the existing project transaction and CAS.
A stale request makes no external call. Expired worker authority rolls back.

The API route captures its native gateway service and gateway-session header in
a host-only closure. The existing header allowlist excludes that header from
worker input. No session is created, credential is read by this integration, or
board authority converted to an employee. The gateway validates the original
company, agent, run and project against the active managed session and denies
named gateway substitution. It selects only the connection's read-classified
`get_metadata`, builds file/node arguments itself, and delegates execution to
Paperclip's existing gateway for current policies, grants, audit, approval and
runtime restrictions. File-only links inspect root node `0:1`; this is a narrow
access check, not proof of every node in a file.

Results use the native normalized MCP envelope. Nonempty successful content is
accessible; MCP errors and unclassified transport/provider failures remain
transient, and gateway 429 is rate limited. Provider messages are never parsed
as proof of a missing file and never returned through this RPC. Native approval
creation is preserved; an approval is not an access success and the integration
does not retry it automatically. Missing/reconnect classification needs explicit
provider evidence before it can be claimed.

Board UI checks without a native employee session return
`managed_session_required` (409), with a useful UI message. A complete board
managed-setup/access workflow remains unfinished. This narrow implementation is
not a claim that all managed-inspection requirements are complete.

The new gateway source was compared byte-for-byte with the pinned upstream
commit; its SHA-256 is in `inspection-baseline.json`. Preparation verifies it
before applying `figma-inspection.patch` to isolated source. Package installation
does not patch any host. No running server was changed.

## Verification and reproduction

Use README preparation/build commands, then run the affected native tests:

```sh
FIGMA_INTEGRATION_ROOT="$PWD" /app/node_modules/.bin/vitest run --root "$PAPERCLIP_RUN_SCRATCH_DIR/proof/server" src/__tests__/figma-inspection.test.ts src/__tests__/figma-project-transaction.test.ts
FIGMA_INTEGRATION_ROOT="$PWD" PAPERCLIP_HOME="$PAPERCLIP_RUN_SCRATCH_DIR/onboarding-home" PAPERCLIP_INSTANCE_ID=figma-onboarding /app/node_modules/.bin/vitest run --root "$PAPERCLIP_RUN_SCRATCH_DIR/proof/server" src/__tests__/figma-onboarding.test.ts
node scripts/check-host-invocation.mjs /app
node scripts/check-ui.mjs /app
```

The operation check covers stale verification and absent managed authority.
The real worker/database test verifies persisted access state, revision change
and stale-retry rejection. Native authority lifecycle checks cover forgery,
timeout and unsupported-host rejection. DOM checks cover existing mutation,
revision and company/project switching behavior. Actual browser integration is
not tested by the DOM harness.

The gateway test first stubs only execution to check session/catalog selection
and output redaction, then exercises the real gateway with deterministic remote
HTTP responses. This is synthetic managed-service evidence, not live Figma OAuth.
Final affected native outcomes: gateway inspection and corrected native HTTP
onboarding tests both passed; the preceding real-worker/project transaction run
passed all eleven checks. The corrected authority lifecycle run passed its three
checks. The deterministic gateway test performed one native remote dispatch and
verified revoking its grant prevented a second dispatch. The remote response and
grant were synthetic; OAuth, protected deployment and live Figma are unproven.

Corrected setup errors: the authority checker was initially passed an already
patched host, and correctly rejected source drift; rerunning against `/app`
passed. The onboarding fixture initially assumed a nonempty clean library; it
was corrected to create an explicit preserved local fixture. An initial gateway
classification used raw MCP shape and was corrected to the native normalized
envelope before final verification. No failed check is counted as passed.

## Onboarding and remaining acceptance

The native GitHub-import audit restriction remains unchanged and tested.
No source-type conversion, audit metadata edit or audit waiver is implemented.
The supported additive route is `/api/agents/:id/skills/sync` with `mode: add`;
its implementation does not require the separate unsupported audit endpoint.
An isolated test exercises that actual route with a preserved prior skill and
replay for an existing and a future synthetic employee. The process adapter
fixture proves persisted assignment, not actual adapter materialization or
fresh-run skill visibility. Full official-package inventory review remains open.

Managed connection discovery returned no Figma service in this run. No setup
request, credentials, live login, context/screenshot retrieval or fresh eligible
agent evidence is claimed. Native connector/setup integration, actual protected
runtime/shared-use proof, live provider recovery, both clean-instance lifecycle
checks, full-host checks and CI remain open. Elena owns compiler placement;
Nadia owns the remaining implementation and managed test-harness setup. Theo's
independent review receives this preliminary evidence with the complete-candidate
dependency retained. Existing release gates, company boundaries and rollback
preserving design links are unchanged.
