# Shared callback authority repair — 28 September 2026

Scope: Elena's callback-disposition on VIS-6. Host 2026.916.1, upstream d554c4789ed3930f8a53ac9fdf6503b3187097da. Existing managed OAuth patch and its pinned baseline are retained. No production changes.

## Architecture and revocation semantics

scripts/build-host-patch.mjs generates the narrow server/src/services/tool-access.ts prerequisite. In the shared branch of completeOAuthCallback, after the existing active same-company non-viewer membership lock and owner/admin or explicit manager check, query instance_user_roles for the OAuth state's user and instance_admin role with FOR UPDATE. The role is read at persistence, not captured at OAuth start or trusted from a client flag. Its lock is held by the same transaction that writes secrets and grants. Native accessService.demoteInstanceAdmin deletes that row, so deletion/update serializes with this lock: revocation committed first denies the callback, while a callback holding the row completes before revocation. Missing roles grant no authority.

Existing company membership and explicit grant locks remain intact. No broader role redesign, direct membership grants, temporary admin demotion, or personal identity bypass. The personal callback/reconnect branch is unchanged. Automatic UI draft selection remains a separate unfinished correction; exact targeting is still required.

## Focused proof and commands

Generated with node scripts/build-host-patch.mjs, checked against baseline hashes. Applied the generated patch to a fresh scratch copy of native server source with dependency links to the installed host; no host-source mutations. Native Vitest database harness creates and cleans its own fresh PostgreSQL database.

From scratch host/server:

    node /app/node_modules/vitest/vitest.mjs run src/__tests__/tool-access-service.test.ts -t 'shared callback current authority|activates and discovers actions for a fresh personal OAuth callback'
    node /app/node_modules/vitest/vitest.mjs run src/__tests__/tool-access-service.test.ts -t 'shared callback repair preserves foreign'

First command: 17 passed, 320 filtered; 33.13 seconds. Tests exercise actual native callback and database persistence with deterministic Slack transport (the repaired shared persistence branch is provider-independent), not a live Figma exchange. Eligible instance-admin/operator, owner, admin and explicit manager succeed. Ordinary operator, forged admin flag, absent/inactive/viewer/wrong-company membership, and authority revoked during exchange deny without changed company secrets or connection grants. Concurrent transactions hold membership, explicit grant or instance-admin rows; callback waits, then denies after their removal. Existing personal callback activation/reconnect tests pass.

Second command: one passed, 337 filtered; 28.39 seconds. Even an active same-company instance admin cannot start OAuth on another user's personal draft; grants unchanged and no secrets added.

Initial patch generation rejected an ambiguous anchor; narrowed to the exact shared-denial text. First test run found an omitted error-call fragment in the generated replacement; fixed before any runtime application. Subsequent focused tests above pass. No broader suite, full-host compiler, npm rebuild or release check is claimed.

## Isolated Mac application

Running source before correction matched retained source byte-for-byte:
f983af0227d203a04786076dd7e37ae875dd3fc7bdaf2d1f58d8494257a793ee.
Applied only the import and shared-branch lock/condition change. Corrected deployed source:
18c7c72dbd3091c6b438e1a7adff060524d35b28172bedc5a265a9b26a778241.

Used authorized SSH and /Users/nolan/vts-figma-test/bin/docker-job. Exact prior app ownership verified before stop. Its AutoRemove cleanup ran; fresh bounded replacement reuses the ownership-verified named test volume/network, passed built UI and SDK/package. No database or secret transfer. No Chromium or UI rebuild.

Fresh daemon/ancestor admission at 19:36:35 UTC: 6,511,276,032 bytes available; disk 919,066,681,344 bytes. Both explicit 2880 MiB app gate and probe 3328 MiB comparison pass. Replacement:
65d011fed1d335626610f4f1e5e23e7337131a1bf65bff1b4b7f4ceb60e78b48,
vts-figma-test-mac-4cbab8ab-access, labels VIS-6 / run 4cbab8ab-538c-44de-b9e9-7f09f273cd99.
Effective 1536 MiB/no swap/one CPU, 256 PIDs. Original 1280 MiB host reserve, 2 GiB disk reserve and **20:30:18 UTC expiry** retained. AutoRemove=true; named test state and design links survive shutdown. No automatic restart.

Native health/authentication pass. Adam remains instance admin with active membership; intended connection 165fc3b9-48c8-4f20-a549-0f7ffe4b339f remains shared/draft/unchecked. Exact native resume route serves the unchanged built index. No live OAuth exchange was performed by the agent; no credentials or OAuth state logged. Native synthetic account credentials were read only inside their existing private test runtime and session stayed in memory.

## Limits and next action

Resume the existing Mac account on the exact route in browser-access-handoff.md. The fixed callback is ready for human consent validation; successful Figma OAuth, refresh/shared-agent/protected-runtime proof and all other release gates are still unpassed. No complete candidate or Theo handoff. The current package predates this host repair and was not repacked. Generic automatic draft selection remains unfinished.
