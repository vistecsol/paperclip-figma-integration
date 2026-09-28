# Figma setup identity diagnosis — 28 September 2026

Host 2026.916.1 / d554c4789ed3930f8a53ac9fdf6503b3187097da. Served build/package input 81e2b0a3cdc988d1fc33dd16765b4dede547d3fb. This diagnosis changes the access handoff, not host policy or served code.

Both supplied screenshots were inspected. The first shows a personal reconnect denial; the second shows a saved unverified project link. Saving a link does not authorize Figma access.

## Actual selected identity

Mac company e36aa1e8-e20b-469e-a661-a2ff66d77536. Failed browser request: POST /api/tools/oauth/50bbf85b-057d-47ca-b45e-a915f97fcbe5/start, asCurrentUser=true, HTTP 403 at 19:10 UTC. Its browser referer explicitly contained resume=50bbf85b-057d-47ca-b45e-a915f97fcbe5.

That draft is named Unverified synthetic fixture, application e79053b6-912b-48b4-ad36-14756aa96ced, credentialPolicy per_user, creator WXrFg9lJLlkRV2plrTI4OuYGDDB50gG0 (Mac Proof Operator). It has an organization grant with zero secret references and no personal grant; fixedPersonalIdentityForReconnect still correctly binds it to its creator. Adam is 3enr8wLy3EcfIz4gFpApkvg7qwO4IZsj. Administrator status does not transfer this personal identity.

Source ConnectionSetupFlow.reusableOAuthConnection selects matching OAuth drafts without checking their creator. A new=1 URL restricts to drafts but still permits that selection; explicit resume takes precedence. The synthetic fixture exposed this native selection defect. The generic selector is not repaired by a documentation change and remains a follow-up engineering risk.

## Corrected setup target, already exercised by Adam

Adam created Figma for the company at 19:15:11 UTC:
- Application 758d8c54-d7ba-4ea1-83f5-5d25a6c2ad77.
- Connection 165fc3b9-48c8-4f20-a549-0f7ffe4b339f; shared policy; creator Adam.
- Organization grant f7c46f30-0bfe-4639-96da-c4d062e15e2e; active grant row but zero credential secret references.
- Official Figma OAuth/DCR configuration; localhost:3310/api/tools/oauth/callback.
- Native audit attributes setup to Adam. Request logs confirm connect 201 followed by this exact connection's OAuth start 200 at 19:15, 19:17 and 19:20 UTC.

These were existing human operations observed during diagnosis, not Nadia impersonation or new consent calls. Shared credential operation is not proven: connection remains draft/unchecked and no Figma retrieval occurred.

The saved browser-access document now targets /VTS/apps/connect?source=figma&stage=setup&resume=165fc3b9-48c8-4f20-a549-0f7ffe4b339f. This explicit native selection avoids the wrong draft without modifying any identity or copying credentials. Direct route and health returned HTTP 200. No new identity/outcome request or duplicate connection was created.

## Containment and limits

Verified owned app 7458aac464079c99aa780d21196d01314b75445b377f63a4f5452e639efaac27, vts-figma-test-mac-60247ad9-access, labels VIS-6/run 60247ad9-a4f9-400a-951d-5937c0990602; running, 1536 MiB memory and equal memory-swap (no swap), one CPU. Existing deadline 20:30:18 UTC and reserve guard unchanged. Only native reads, retained private test-session login, exact test-app source/request metadata and health/route reads were used. No restart, container creation, build, browser launch, broad suite or production operation. Existing links, memberships, synthetic fixture and managed credentials were untouched.

Read-only API commands ran in the exact test container through /Users/nolan/vts-figma-test/bin/docker-job. Native routes inspected: company tools/applications and tools/connections, connection grants and activity. Output was projected to identity/status/counts; no secrets or OAuth handoff URLs are included in evidence. Request selection evidence contains only timestamps, route paths, status and non-secret selection fields.

Next Nadia action: correct implicit Figma draft selection so fresh setup never chooses another personal identity, and complete actual managed consent/shared-agent/runtime evidence. Elena receives the corrected exact-target handoff. No release acceptance or complete-candidate handoff to Theo; all remaining release gates stay open.
