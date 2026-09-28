# Narrow Figma managed OAuth prerequisite

Development proof only. Not a plugin release, not installed on the running host,
and not evidence of Figma endorsement or shared-use qualification.

Targets Paperclip `2026.916.1`, source
`d554c4789ed3930f8a53ac9fdf6503b3187097da`. `baseline.json` records exact hashes
of the two modified existing files, checked against public upstream bytes.
Hermes reference: `06a495cc5b1f6baf429e02825103888dfbdf5ec7`,
`tools/mcp_oauth.py` provider defaults and `tools/mcp_oauth_provider.py`.

The patch adds a strictly bounded DCR metadata selector and calls it from
Paperclip's existing registration service. Only the exact official MCP resource,
issuer, authorization, token and registration URLs select `Claude Code` and
`client_secret_post`. A changed auth-method advertisement fails with a classified
error. Other providers keep their existing selection. The actual Paperclip
callback, PKCE, company/client binding, encrypted secret references and refresh
service remain in charge. Scope `mcp:connect` comes from official discovery.
Existing host callback handling already accepts an omitted issuer and rejects a
present mismatched issuer; this patch does not change issuer handling.

The separate `server/` files and test fragment are editable patch inputs, not a
second server implementation. The generated patch is the reviewable host change.
No install hook patches host files; any eventual npm plugin must declare this
host prerequisite explicitly.

## Reproduce against a prepared host checkout

Use the pinned host revision with its normal dependencies installed. From this
integration repository, set `PAPERCLIP_RUN_SCRATCH_DIR` to a fresh authorized
scratch directory (Paperclip supplies it during runs), then:

```sh
node scripts/build-host-patch.mjs /path/to/pinned-paperclip
node scripts/prepare-host-proof.mjs /path/to/pinned-paperclip
/path/to/pinned-paperclip/node_modules/.bin/vitest run --root "$PAPERCLIP_RUN_SCRATCH_DIR/host-proof/server" src/__tests__/figma-oauth-compatibility.test.ts
/path/to/pinned-paperclip/node_modules/.bin/vitest run --root "$PAPERCLIP_RUN_SCRATCH_DIR/host-proof/server" src/__tests__/tool-access-service.test.ts -t 'uses Hermes-compatible Figma DCR|preserves the provider.s DCR client-auth ordering for Miro|treats invalid_grant as terminal'
```

Use the embedded test database; do not set
`PAPERCLIP_TOOL_ACCESS_TEST_DATABASE_URL` to a real instance database. No live
Figma credentials are used; all token strings in fixtures are synthetic. The
proof helper copies source, links installed dependencies, and applies the patch
only in scratch. Source and running server remain unchanged.

## Live qualification still required

Use an authorized isolated Paperclip test instance with this prerequisite built
through normal host checks. Its actual HTTPS callback must be browser-reachable.
Create a company-owned custom remote MCP connection through Paperclip's **Connect
your own MCP server** flow for `https://mcp.figma.com/mcp`; authentication remains
in managed setup. No desktop session, copied token, RTS credential or REST
substitute is involved. Agent `connection_request` may only be used after
`connections_search` returns an available service identifier; it cannot create
an arbitrary URL setup card.

Keep newly discovered tools quarantined. Explicitly review and allow only
inspection tools needed for context/screenshots; leave writes, unknown tools,
and unreviewed Code Connect operations disabled. Confirm same-company grants and
protected-runtime denials before fresh eligible-agent calls. Two service objects
in a mocked database test are not two eligible live agents.

Outstanding input: authorized VTS test-instance/setup route, consenting test
identity with applicable seat/call limits, two readable nodes in one file and a
second readable file. No secrets should appear in issues or artifacts.

Full host checks (`pnpm -r typecheck`, `pnpm test:run`, `pnpm build`), real login,
fresh-agent context/screenshots, company isolation, grant removal, live refresh
and revocation, npm installability, package contents, and both clean-instance
lifecycle checks remain required before release handoff. This prerequisite does
not implement the project attachment bridge or source-index extension.

## Rollback boundary

This proof creates no design links or executable installation on a real host.
If subsequently activated in an authorized test instance, disable the connection
and remove its grants/installations using Paperclip controls before rolling back
the host prerequisite. Preserve attachment/link records and managed secret
lifecycle; do not delete database schemas or copy credentials to another host.

The inspection prerequisite adds a fixed gateway metadata operation and a
host-only API session capture. It requires the exact pinned gateway source in
`inspection-baseline.json`; `figma-inspection.patch` is applied only to the
explicit isolated/approved host build. See `docs/inspection-checkpoint.md` for
agent-session requirements and the unfinished board workflow.

## Project association entry points

`figma-project-ui.patch` places the shared native `FigmaDesignEditor.tsx` in
Create project and Project Configuration, next to Source repos. Generate with
`node scripts/build-project-ui-patch.mjs /path/to/pinned-paperclip`; the two
host inputs must match `project-ui-baseline.json`. The operator preparation
applies this eighth patch and copies/digest-checks the component from the package.
This is an explicit host prerequisite, never an installation hook.

Creation keeps the returned project ID across partial association failures and
reconciles prior adds on retry. Configuration pins the edit's base revision,
saves through the existing authorized keyed bridge, and requires reload after
a partial or stale save. Repository mutations remain on their existing path.
See `docs/project-entrypoints-checkpoint.md` for proof and deferred browser gates.
