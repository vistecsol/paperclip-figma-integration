# Stage 1 feasibility evidence — 26 September 2026

Status: mandatory gates NOT PASSED. Engineering is not done; no release candidate exists. Stop full connector/UI implementation pending Elena's supported-path decision. No host edits, installations, OAuth impersonation, credentials, canvas changes, or publication performed.

## Provenance

- Repository: https://github.com/vistecsol/paperclip-figma-integration. Initial `git status --short` empty; `git log -3 --oneline` reported unborn main; `git ls-remote origin` succeeded with no refs. No pre-existing implementation or repository instructions found.
- Authenticated GET `/api/health` reports host version/serverVersion `2026.916.1`, full commit `d554c4789ed3930f8a53ac9fdf6503b3187097da`, private authenticated deployment. Local changes unavailable (`git_status_unavailable`). This identifies the running server, not a verified byte-for-byte match of inspected source.
- Inspected source: `/app`, no git checkout/build stamps at inspected root/server locations. SDK `packages/plugins/sdk/package.json` reports `@paperclipai/plugin-sdk` version `1.0.0`, MIT, repository `https://github.com/paperclipai/paperclip`. That declared upstream is not yet verified as the maintained deployment source; image digest and source-to-build relationship unresolved. Do not infer a supported host range from SDK placeholder version.

## Extension mapping (source inspection, not runtime proof)

| Requirement | Evidence under /app | Finding / remaining proof |
| --- | --- | --- |
| npm loader / SDK | server/src/services/plugin-loader.ts; packages/plugins/sdk; doc/plugins/PLUGIN_AUTHORING_GUIDE.md | Real npm/local loader, manifests, workers exist. Guide explicitly describes an alpha surface. Clean tarball install and supported version range untested. |
| Managed connector registration / OAuth | doc/connections/CONNECTOR-PLAYBOOK.md; packages/plugins/sdk/src/types.ts PluginContext | Canonical catalog authored as core AppDefinition data in scripts/ingest-app-definitions.mjs and shared generated registry, explicitly not a plugin. No connector registration/OAuth client in inspected PluginContext. Generic remote MCP exists but does not establish Figma support. Requires evidenced supported extension or separately authorized upstream prerequisite. |
| Managed secrets / grants | PluginContext secrets and authorization; server/src/services/plugin-host-services.ts | Secret-reference resolution and authorization APIs exist; no demonstrated managed connection lifecycle/invocation bridge. Reading tokens into a plugin is not a substitute for managed execution. |
| Project Designs UI | packages/shared/src/types/plugin.ts PluginUiSlotDeclaration | detailTab/entityTypes and shared UI kit declared; project mount and permission behavior still require runtime proof. |
| Persistence / migrations | authoring guide database section; PluginContext.db | Namespaced SQL migrations and restricted query/execute supported. Public-table mutations prohibited. Transaction/concurrency semantics for reorder/primary selection remain unproven. |
| Authenticated API | authoring guide Scoped plugin API routes | apiRoutes mounted under /api/plugins/:pluginId/api/*; host resolves company/actor and checkout policy. Project-specific authorization and isolation need tests. |
| Agent source index | server/src/services/project-tool-context.ts; PluginContext.tools | Tool registration exists; no source-index injection hook located in inspected interfaces. On-demand tool alone does not prove fresh-run index acceptance. |
| Company skills | PluginContext.skills; authoring guide managed resources | Managed skill reconcile/reset exists. Additive eligible-agent assignments, future onboarding and official provenance pin remain deferred. |

The existence of most plugin primitives does not pass plugin-only viability. No fictional manifest fields or install command supplied.

## Independent Figma gate

Managed `connections_search({query:"Figma"})` returned `{version:1,query:"Figma",results:[]}` in this authorized VTS run. No ready or available service identifier exists to request through the connection tool. No setup request was fabricated and no credentials requested. This establishes absence from this run's search results, not global absence of all company connections.

Official sources reviewed today:

- https://developers.figma.com/docs/figma-mcp-server/remote-server-installation/ — remote endpoint uses OAuth; documentation restricts access to catalog clients and directs new clients to a waitlist. It does not establish Paperclip's approved identity.
- https://developers.figma.com/docs/figma-mcp-server/rate-limits-access/ — access/limits documentation reviewed; no evidence obtained approving this Paperclip shared managed runtime.

No recognized Paperclip client registration, permitted company-sharing agreement, authorized VTS fixture/identity, centrally managed fresh-session context/screenshot retrieval, or two-session proof established. A Claude Code client-name substitution cannot pass this gate. Hermes compatibility evidence in the accepted plan remains reference only; no RTS resources inspected.

## Verification and limits

Executed: repository status/origin/log/remote-ref inspection; host authenticated health read; targeted rg/sed/cat reads of actual loader, SDK, host services and authoring contracts; managed service discovery; official Figma documentation review. Shell namespace sandbox failed before execution; permitted escalated reads used. One inspection command used unavailable `python`; repeated its JSON parsing with Node successfully. Initial guessed SDK path was absent; actual SDK path located and read. These are discovery results, not product tests.

Deferred, NOT PASSED: live OAuth/shared use; all connection lifecycle and isolation tests; attachment acceptance matrix; agent discovery; onboarding; official skill pin/license review; build/typecheck/product tests; reproducible npm tarball/contents; both clean-instance installations; upgrade/disable/uninstall/rollback; required release CI. No npm package name reserved or candidate packaged. Rollback implementation must preserve links; no links or executable integration were created in this heartbeat.

## Decision and next action

Elena owns scope and supported-path resolution. Recommended: pursue recognized Figma client/shared-runtime evidence and approve bounded upstream extension work only after exact gaps are confirmed against the maintained host source. Alternative: hold delivery pending upstream/vendor support. A documented supported-client workflow would require an explicit scope change and would not satisfy the current shared connector acceptance. Integrated/core delivery also needs separate authorization; none is assumed.

Nadia resumes Stage 1 when Elena supplies the supported route or authorized prerequisite scope, verifies maintained host provenance and the missing extension mappings, then obtains a real managed setup path for authorized VTS identity/fixtures. Theo receives this preliminary gate evidence in his assigned review issue; a complete candidate handoff remains deferred.
