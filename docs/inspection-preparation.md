# Inspection enforcement and association correction preparation

28 September 2026. Source preparation only; access remains OFFLINE. No Docker
session, managed call, credential read, grant mutation, rebuild or live data change.

Host target: 2026.916.1 / d554c4789ed3930f8a53ac9fdf6503b3187097da.
Native `server/src/services/tool-access-policy.ts` matches pinned upstream bytes;
SHA-256 5732ca84adba342ead0533b0bd78845152ac9a623ee6c3537271fdb9c6beb036.

## Executable preparation

`operator/inspection-preparation.mjs` exports `prepareInspection` and
`prepareRebind`. Pass authenticated native readback, not hard-coded fixture IDs.
No function performs network operations or carries credentials.

The fixed set is whoami, get_metadata, get_design_context and get_screenshot.
Each must have exactly one active, same-company/same-connection catalog row with
risk read. Policies select the eligible employee, connection, exact catalog ID,
exact name and read risk. Native allow rules have priority 0; a connection/employee
catch-all block has priority 1. Create the block FIRST, then the exact allows.
This denies writes, destructive operations, unknown read tools, changed catalog IDs
and changed risk even if a broader profile would otherwise grant them. It does
not grant another employee access. Repeat only for separately eligible employees
after explicit review; never use an all-agent wildcard.

The preparer refuses ANY existing enabled policy. This deliberate conservative
stop prevents overriding an existing approval/block policy or silently reordering
unrelated restrictions. In the live session inspect existing rules first; if this
precondition fails, stop before mutation and report the concrete conflict. Do not
disable policies to make preparation succeed. Native profile/grant/runtime rules
must also be inspected; the source-only test does not certify those layers.

Use native POST `/api/companies/:companyId/tools/policies` for each prepared rule.
Read back exact selectors, priority, enabled state and company after creation.
Use POST `/api/companies/:companyId/tools/policy/test` to test the actual employee,
connection and catalog entries. Test write/destructive/unknown tools with the
non-executing policy endpoint only; never execute them against Figma. Require deny,
not approval, before autonomous work. Check actual gateway summaries as well.
Partial failure leaves the catch-all block active and ends execution. Before
rollback, remove exact allow rules first; retain block until native access is
otherwise disabled. Preserve unrelated grants and profiles.

## Atomic association repair

New `rebind` mutation accepts only ID, target connection ID and expectedRevision.
It preserves ID, file/node URL, label, purpose, ordering and primary designation;
it resets verification to unverified. Duplicate target references and stale
revisions fail. Host operations authorize the target within the existing project
transaction before compare-and-swap. No detach/add gap and no credential migration.

Read keyed designs.list for the real project. Inspect the real row and the current
shared active managed connection. `prepareRebind(snapshot, {id,oldConnectionId,
newConnectionId})` refuses an unexpected old connection and produces the exact
revision-bound body for keyed designs.mutate. Submit once, then read back all rows
and GitHub associations. On 409, re-read and reconcile; never blindly retry.
The existing shared target previously verified is
165fc3b9-48c8-4f20-a549-0f7ffe4b339f, but its live state must be revalidated.

The generated figma-domain.mjs and installed worker are NOT rebuilt in this run.
The new command is source-only and must be bundled through the normal small
plugin/host-domain build before live correction. No host UI rebuild is needed.
Existing running/retained artifacts do not yet implement rebind.

## Checks actually run

- `node --test test/inspection-preparation.test.mjs test/host-operations.test.mjs test/api.test.mjs`: passed affected API/transaction and preparation checks.
- `node --test test/inspection-preparation.test.mjs`: passed after adding API-to-host authorized rebind coverage.
- `node scripts/check-inspection-policy.mjs <pinned-tool-access-policy.ts>`: passed actual native selector and ordered policy-loop checks for the four allowed reads, write/destructive/new-tool denial, rediscovered ID and changed risk denial, unrelated scope unaffected.
- Pinned-source `cmp` and `git diff --check`: passed.

The native policy check executes extracted upstream selectors/decision loop with
synthetic context and stubbed unrelated dependencies. It does NOT run native DB,
HTTP, gateway, protected runtime or provider transport. The rebind store test is
synthetic. Native transaction/CAS implementation is reused; live proof is pending.

## Requested next bounded session and sequence

Elena coordinates one 45-minute Mac session with a concrete UTC expiry. No launch
is authorized by this document. Reuse named test state, accounts and managed
credentials on macbuilder01 through its wrapper; protect every production resource.

1. Sequential small plugin/domain build: proposed existing 1408 MiB/no swap/one CPU,
   Node old space 896 MiB; 64 MiB probe plus 1280 MiB reserve = 2752 MiB aggregate,
   with the established 128 MiB preparation margin (2880 MiB). Save exact bundle
   hashes and normal checks. This is not full host compilation or a host UI rebuild.
2. Fresh app admission 2880 MiB; app 1536 MiB/no swap/one CPU. Verify ownership,
   isolated network/state, effective limits, ancestor headroom, 2 GiB disk reserve,
   expiry and automatic ephemeral cleanup. No socket/production mounts.
3. Read native catalog/policies/access; enforce and verify inspection rules before
   any provider or fresh-agent call. Resolve conflicts without weakening controls.
4. Apply repaired domain output through the owned test app preparation; verify
   served revision, keyed API and revision-safe real rebind/readback. Preserve all
   real links and GitHub associations. No new login is expected.
5. If browser proof is needed, use the demonstrated 768 MiB/no swap/one CPU browser,
   fresh aggregate 3648 MiB (app + browser + 64 MiB probe + full 1280 MiB reserve).
   Worker-enabled reload/readback; no browser workaround.
6. Fixed read context and screenshot calls for the real node with bounded call
   budget, followed by an eligible fresh project-agent source/skill/grant check.
   Confirm existing eligible identities first; create no employees/tasks here.
   No write tools, canvas edits or cross-company credentials. Capture redacted
   call/audit outcomes and exact citations; never package tokens or private images
   without the applicable sharing authorization.
7. Stop on failure/expiry, collect redacted results and verify exact ephemeral
   cleanup. Named state persists. No automatic restart, retry loop or timer.

Live shared-agent concurrency, revocation/protected-runtime evidence, automatic
draft selection, full-host/CI, onboarding, revised reproducible package and both
clean-instance lifecycle gates remain open. No complete-candidate or Theo handoff.
