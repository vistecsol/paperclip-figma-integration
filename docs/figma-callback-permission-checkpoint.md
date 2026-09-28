# Figma callback permission failure — 28 September 2026

The 19:19 screenshot was inspected: it shows the generic “Authorization did not complete” outcome. It contains no callback-specific cause. This is distinct from the earlier wrong-personal-draft reconnect denial.

## Correlated native evidence

Read-only native API inspection in ownership-verified Mac test app `7458aac464079c99aa780d21196d01314b75445b377f63a4f5452e639efaac27` found two `tool_app.oauth_failed` activity records:

| UTC | Connection | Actor | Result |
| --- | --- | --- | --- |
| 19:18:28.907 | 165fc3b9-48c8-4f20-a549-0f7ffe4b339f | Adam, 3enr8wLy3EcfIz4gFpApkvg7qwO4IZsj | oauth_callback_http_403 |
| 19:20:12.111 | same | same | oauth_callback_http_403 |

Both native messages: “Only a company owner, admin, or member with connection-manager permission can share credentials with the organization.” The 19:18 record immediately precedes the screenshot submission; the screenshot itself has no attempt identifier, so unique screenshot-to-event identity is not certified. Both adjacent attempts independently establish the same callback failure on Adam's intended shared connection.

Native membership readback: company `e36aa1e8-e20b-469e-a661-a2ff66d77536`, membership `db0fa497-52ef-4d02-9a9c-41b617c5beaf`, active, role `operator`, grants `[]`. The native member protection reports instance-admin status. Connection is still `draft` / `unchecked`, credential policy `shared`, created by Adam. Correct ownership selection is established; successful callback completion is not.

## Exact host conflict

Installed `/app/server/src/services/tool-access.ts`, `completeOAuthCallback`, locks active non-viewer company membership and checks company owner/admin role or explicit `tools:manage_connections` grant before shared-credential persistence. Instance-admin status does not satisfy that check. Native route authorization permits the setup/start via instance-admin authority. Native membership and permission update endpoints call `assertCanManageCompanyMember`, which protects instance-admin targets from updates. Thus simply asking Adam to repeat consent on the corrected draft cannot resolve the observed condition.

Do not bypass personal ownership, directly edit database grants, temporarily demote Adam to evade the protection, or move credentials to another identity. No such action was taken. A narrow host authorization consistency correction needs disposition: preserve active same-company membership and transaction-safe revocation checks while making instance-admin handling consistent, or supply an explicitly supported native membership-management repair. Elena owns that scope disposition; Nadia owns implementation and focused verification after resolution. Automatic draft-selection correction remains separate unfinished work.

## Commands and boundaries

Used the authorized Mac wrapper `/Users/nolan/vts-figma-test/bin/docker-job` for exact-container inspect and `docker exec -i <id> node --input-type=module`. Native synthetic admin login read its existing private account file inside the test app; session cookie remained in memory. Read `/api/companies/<company>/activity?limit=200`, `/members`, and `/tools/connections`; projected only actor/connection IDs, timestamps, native error code/message, membership role/grants and connection state. Inspected installed callback source. No OAuth code/state/token was emitted or persisted. Screenshot downloaded from the current issue's supplied attachment.

Host `2026.916.1` / `d554c4789ed3930f8a53ac9fdf6503b3187097da`; served build input `81e2b0a3cdc988d1fc33dd16765b4dede547d3fb`. No source/runtime mutation, restart, rebuild, browser launch, broad tests, new consent card or provider request. Existing 20:30:18 UTC expiry remains unchanged. Production, credentials, accounts and design links untouched. The access document now suspends retry guidance until callback authorization is corrected and verified. All remaining release gates remain open.
