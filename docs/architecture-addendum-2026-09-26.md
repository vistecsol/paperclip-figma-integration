# Conditional host extensions — Stage 1 architecture addendum

26 September 2026. Engineering incomplete; no release candidate. This addendum supersedes the pending host-scope statement in the earlier feasibility report. Elena relayed approval of conditional minimal host extensions in comment `9d094b90-1756-40d1-897d-33ee584ca021` on [VIS-6](/VIS/issues/VIS-6). Host implementation still requires the provenance, extension design and supported Figma identity/shared-use prerequisites; full connector/UI work additionally requires live managed-runtime proof. No technical gate is waived.

## Provenance verification

- Maintained upstream identified by server package metadata: https://github.com/paperclipai/paperclip. Public GitHub commit API returned HTTP 200 for `d554c4789ed3930f8a53ac9fdf6503b3187097da`.
- Authenticated `GET /api/health`: version/serverVersion `2026.916.1`, commit `d554c4789ed3930f8a53ac9fdf6503b3187097da`; source working-tree state unavailable. `/app/server/dist/build-info.json` independently embeds that same commit.
- Dockerfile lines 132–142 explain server build stamping from `PAPERCLIP_BUILD_COMMIT`. `/app/.paperclip-build-version` is absent. The referenced stamp writer is absent at `/app/scripts/write-build-stamp.mjs`; do not claim local build reproducibility from this container.
- Compared local bytes to HTTPS raw upstream files at that exact SHA: all six below returned HTTP 200 and exact byte equality. This establishes provenance of these inspected interfaces, not an image attestation or proof of every deployed byte. Image digest, release/tag relationship and maintained supported target range remain unverified. SDK `1.0.0` alone is not a supported-host range.

| File | Local SHA-256 (matches pinned upstream bytes) |
| --- | --- |
| packages/plugins/sdk/src/types.ts | b4afb572bb0548a6e1ff5995677990cfdc7a28341198f851cd7954e1307a0dc8 |
| server/src/services/plugin-loader.ts | 471a4653b7886525b74cda84d6df228206cb3640bb661e341ab01edab9076199 |
| server/src/services/project-tool-context.ts | f848c428a22ed4ec89a12c498160674b9f6b00f111c2352bf77f170bfec51642 |
| server/src/services/heartbeat.ts | 50d7b3b58661161af9851685400582840dc8524e4394371029954c0443ac901a |
| scripts/ingest-app-definitions.mjs | e99784a16dd5a9f10025e3028c59038bd759fde29e621bd18783b70429a76e62 |
| doc/connections/CONNECTOR-PLAYBOOK.md | 0e6d0ad40a32050e1f13a04febd1915b744e9e53e85ae39e16ee76546f284495 |

Integration baseline: `c295e2a48958c91608be5ada287ac51370cad052`. This document's commit will be recorded on the issue. Repository status was clean before editing; no other workspace changes were staged.

## Minimal host prerequisites (proposed, not implemented contracts)

1. **Curated Figma connection definition.** Follow the existing data route: `scripts/ingest-app-definitions.mjs`, generated `packages/shared/src/app-definitions/<slug>.json` and `app-definitions.generated.ts`, official sanitized branding and manifest, plus `packages/shared/src/app-definitions.test.ts`. The playbook expressly treats this as catalog data, not an npm plugin. Prefer this bounded host prerequisite over creating a general executable connector registry solely for Figma. Configure only a recognized vendor identity and permitted credential-sharing policy once evidenced. Reuse existing remote MCP discovery, OAuth callback, vault, refresh, grants, audit and tool policies in `tool-access.ts`; no new token store or plugin access to token values. Do not introduce a provider-name OAuth workaround without demonstrated need and narrow tests.
2. **Narrow managed-connection bridge for plugin attachment operations.** `PluginContext` has authorization and secret-reference primitives, but no managed-connection metadata/access-check client. Extend the SDK type/RPC contract and `server/src/services/plugin-host-services.ts` with scoped metadata and allowlisted inspection invocation through the existing tool-access service. Contract must carry server-authenticated company, actor and project/run scope; return connection ID, display/health state and classified inspection outcomes, never credentials. Reuse the actual caller's grants/protected-runtime policy; do not grant the plugin a service identity with broader access. Installation configuration only references a same-company managed connection. Exact API names and manifest capability strings remain to be designed against the maintained SDK; none are claimed to exist.
3. **Bounded project source-context contribution.** Add a typed plugin contribution for compact project-source records, with host-supplied company/project/agent/run identity, size limits, timeout and lifecycle registration/removal. The existing `PluginContext.tools` supports tools, not fresh-run source injection. `heartbeat.ts` around line 20981 already replaces caller-provided connector skill instructions with host-resolved delivery for both CLI and native runtime; integrate a separately validated source contribution into that shared preparation path. `connector-runtime.ts` currently contains a static trusted AgentMail contribution array; do not disguise Figma as AgentMail or replace ordinary remote MCP tool delivery. Apply the authority pattern in `project-tool-context.ts` (authenticated run, task, company, session generation, mode) and permission checks before retrieving attachments. Host must label attachment text as data, not instructions, and refresh it on new runs. Failure should report unavailable discovery without breaking projects that have no designs. Disable/uninstall removes contribution execution while retaining stored design associations.

The npm package continues to own Designs UI, attachment data/API, skills and onboarding. It must declare the eventual host prerequisite revision; the current host cannot be called a verified standalone target. Existing detailTab, scoped API, managed-skills and namespaced database surfaces should be reused. SDK database calls expose query/execute, with no public multi-call transaction primitive observed: first prove single-statement atomic revision/reorder/primary operations; if insufficient, return a separately bounded transaction extension requirement before adding it. Never mutate public tables through plugin SQL.

## Targeted validation required for these prerequisites

These are planned checks, **not executed or passed tests**:

- Catalog fixtures: correct official endpoint and OAuth contract, genuine supported client identity, explicit sharing policy, inspection allowlist; unknown/new/write tools denied. Extend shared app-definition and server tool-access tests.
- Bridge: cross-company connection substitution, unauthorized project, missing/revoked grant, protected runtime, stale/cancelled run and forged actor IDs all denied; credential values absent from RPC/errors/audit. Extend `plugin-access-authorization-host-services.test.ts`, `plugin-tenant-isolation.test.ts`, `plugin-scoped-api-routes.test.ts`, `tool-access-service.test.ts`.
- Discovery: fresh CLI/native runs see ordered records, exact node references and status; unauthorized sources omitted; caller wake data cannot inject authority; worker failure/timeout bounded; revoked access and plugin disable stop delivery; no-design/GitHub associations unaffected. Extend heartbeat/plugin tests and add focused source-contribution coverage.
- Data: concurrent primary selection/reorder and stale revisions must demonstrate atomicity through the actual plugin DB boundary before any UI claim.
- Live exit proof after support is established: authorized VTS identity and fixtures, fresh eligible runs retrieving context/screenshots through managed runtime, two isolated concurrent eligible sessions, refresh/revocation and tool-denial evidence. Then package contents, two clean-instance installs, upgrade/disable/uninstall and link-preserving rollback; required repository hooks/CI remain mandatory.

## Independent Figma support gate

Read on 26 September 2026:

- [Remote installation](https://developers.figma.com/docs/figma-mcp-server/remote-server-installation/) restricts remote MCP to catalog clients and directs new clients to a waitlist.
- [Figma client catalog](https://www.figma.com/mcp-catalog/) did not list Paperclip in the returned page. Recognized client products appearing there do not establish permission for Paperclip to reuse their identity.
- [Access documentation](https://developers.figma.com/docs/figma-mcp-server/rate-limits-access/) describes normal per-user OAuth and enterprise-managed authorization only for Claude via Okta XAA. This does not establish permission for a Paperclip company gateway sharing centrally held authorization among agents.
- Managed `connections_search({query:"Figma"})` again returned `{"version":1,"query":"Figma","results":[]}`. No service identifier was available for a real setup request. This is run-relative evidence, not a claim about every company connection.

Required vendor condition: a recognized Paperclip client identity (or explicitly supported gateway arrangement), permitted redirects/registration/authentication method, and documented permission for the intended centrally managed multi-agent use. These are separate from technical OAuth success. No client-name substitution, desktop login, unofficial server or REST substitute is acceptable. No vendor contact was attempted.

Required operational inputs after that condition: non-secret deployment/source release attestation including image digest and supported target; authorized VTS test identity and seat/limits via real managed setup; existing read-access fixtures (two nodes in one file and another file). Never supply tokens in an issue or artifact. Vendor outreach and test fixture canvas editing remain unauthorized.

## Executed verification and disposition

Executed commands: `git status --short`; `git log -1 --format=fuller`; targeted `rg`/`sed`/`cat` interface and Dockerfile reads; authenticated curl health GET; public GitHub commit GET; Node fetch/Buffer equality/SHA-256 comparison against the six pinned paths; managed connection discovery; official Figma documentation/catalog reads. Some guessed source paths were absent as noted above; no product tests, builds or live vendor calls ran. Sandbox namespace initialization failed; approved escalated inspection was used. Documentation whitespace check is recorded with the commit.

Elena owns resolution of the missing vendor-support evidence through a saved interaction on [VIS-6](/VIS/issues/VIS-6). Options are to supply an existing non-secret support record for engineering verification, or hold delivery pending that vendor condition; new outreach needs separate authorization. No repeat host-scope approval is requested. Nadia owns checking supplied evidence and resuming Stage 1 only when the route is established. [Theo's review](/VIS/issues/VIS-7) still has no candidate to validate. All critical live/runtime/package/release checks remain deferred, not passed.
