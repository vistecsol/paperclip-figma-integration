# Hermes-compatible managed authentication — engineering checkpoint

26 September 2026. Narrow implementation complete for review; engineering release
remains incomplete. Elena's 18:06:59 decision supersedes the earlier documentary
support hold in the feasibility, architecture and authentication assessments.
No separate vendor endorsement is claimed or required before this implementation.
Full interface work remains gated on actual managed-runtime proof.

## Change and provenance

- Paperclip target: `2026.916.1`, `d554c4789ed3930f8a53ac9fdf6503b3187097da`.
- Hermes compatibility reference: `06a495cc5b1f6baf429e02825103888dfbdf5ec7`.
- Integration input revision: `87efc0e583f0bace5c01ee8ffa1a56fff9ef80d3`.
  Implementation commit is recorded on the issue after commit creation.
- Both modified existing host files were compared byte-for-byte with the public
  pinned upstream commit; their SHA-256 values are in `host-prerequisite/baseline.json`.
- Review patch: `host-prerequisite/figma-managed-oauth.patch`, SHA-256
  `8cd474080b460d5999ac3392ab71dce17b0e34c2940cea303d973d47c7b4d01b`.
- No running host mutation, installation, production deployment, publication,
  private RTS inspection or real credential access occurred.

The host already provides the generic custom remote MCP setup, company credential
vault, PKCE, binding, refresh and callback validation. The patch selects Hermes's
`client_name: Claude Code` and `token_endpoint_auth_method: client_secret_post`
only for the exact official Figma endpoint chain. Other providers retain host
behavior. It refuses changed authentication-method support rather than silently
falling back. Scope comes from discovery. Missing callback `iss` works in the
existing host; present mismatches still fail before token exchange.

The initial addendum's claim that a catalog definition is a connection prerequisite
is narrowed: it is required for curated discovery/setup convenience, but Paperclip's
`doc/connections/GENERIC-REMOTE-MCP.md` documents custom managed URL setup without
catalog registration. The npm plugin's attachment bridge/source-index prerequisites
remain outstanding. No catalog absence hold is reinstated.

## Public discovery (no login)

Executed GETs on 26 September:

- `https://mcp.figma.com/.well-known/oauth-protected-resource`: resource
  `https://mcp.figma.com/mcp`, issuer `https://api.figma.com`, scope `mcp:connect`.
- `https://api.figma.com/.well-known/oauth-authorization-server`: authorization
  `https://www.figma.com/oauth/mcp`, token `https://api.figma.com/v1/oauth/token`,
  registration `https://api.figma.com/v1/oauth/mcp/register`; PKCE `S256`;
  authentication methods ordered `client_secret_basic`, `client_secret_post`;
  authorization-code and refresh-token grants; advertised callback issuer support.

No DCR POST or live OAuth exchange was made outside managed credentials.

## Executed checks

All product tests below used an isolated copied host source tree with the patch,
existing installed host dependencies and a new embedded PostgreSQL test database.
`PAPERCLIP_TOOL_ACCESS_TEST_DATABASE_URL` was absent. All fixture credentials are
synthetic. Commands are reproducible in `host-prerequisite/README.md`.

| Check | Actual result |
| --- | --- |
| `vitest run --root "$PAPERCLIP_RUN_SCRATCH_DIR/host-proof/server" src/__tests__/figma-oauth-compatibility.test.ts` | 49 passed, 0 failed. Official identity and altered/missing endpoint-chain fields covered. |
| Same Vitest runner, `src/__tests__/tool-access-service.test.ts -t 'uses Hermes-compatible Figma DCR\|preserves the provider.s DCR client-auth ordering for Miro\|treats invalid_grant as terminal'` | 5 passed, 317 filtered/skipped. Actual filter uses `|` without backslashes; see README. |
| Managed Figma refresh scenario | Mocked discovery/DCR, scope and S256, code verifier, callback without issuer, vault references, secret absence from config/result, two service objects contending on refresh, exactly one refresh and two secret versions. |
| Managed Figma revoked scenario | Mocked invalid_grant requires reauthorization, disables connection, clears refresh reference; no replay. |
| Managed Figma issuer-mismatch scenario | Rejects wrong issuer; zero token exchanges. |
| Existing-provider regression | Miro DCR method ordering/exchange and generic Slack terminal invalid_grant behavior pass. |
| `node scripts/prepare-host-proof.mjs /app` with fresh scratch directory | Clean copied-source patch application passed. |
| `git -C /app apply --check <review-patch>` | Passed; no host write. |
| `node --check scripts/build-host-patch.mjs` and `node --check scripts/prepare-host-proof.mjs` | Passed. |
| Staged whitespace check | Recorded with implementation commit. |

Initial harness attempts failed because `patch` was unavailable and the scratch
copy lacked `tsconfig.base.json`. The committed helper uses `git apply` and copies
both required tsconfigs. The passing runs above followed those corrections.
Initial single managed-login test also passed before expanding to lifecycle cases.
No hooks or CI were bypassed. These tests do not prove live Figma behavior,
cross-company isolation, protected runtimes, or eligible-agent sharing.

## Live gate and concrete missing input

Managed discovery returned `{version:1,query:"Figma",results:[]}`. The issue's
heartbeat context returned `currentExecutionWorkspace: null`; there is no managed
test-instance URL/runtime service to start here. The current server lacks this
patch, and production deployment is prohibited. We do not start an unmanaged
background server or repurpose the running control plane.

Elena owns routing an existing authorized isolated test instance (or its managed
provisioning path), a consenting VTS test identity with seat/call limits, and
readable fixtures (two nodes in one file and a second file). No credentials should
be supplied in comments. Use real managed custom-server setup on that test host;
a connection tool request requires a returned available service identifier.
Nadia then verifies the built prerequisite, prepares inspection-only grants,
executes real login/refresh/recovery and fresh eligible-agent context/screenshots,
and records exact host/connection/run references with secrets redacted.

A saved input interaction on this issue is the waiting path, addressed to Elena;
its ID is recorded in the checkpoint comment. No repeat host-scope approval or
vendor endorsement request. Theo's assigned review issue receives preliminary
patch/test evidence; its complete-candidate dependency remains unresolved.

Deferred, not passed: real login/client acceptance, authorized shared runtime,
two fresh eligible agents, inspection allowlist and company/protected-runtime
negative tests, full host typecheck/test/build/CI, catalog branding, attachment
bridge/storage/API/UI, source index, skill onboarding, reproducible npm candidate,
two clean-instance installations and lifecycle/rollback proof. No supported-host
range beyond this test baseline is claimed. Image attestation remains unverified.

Rollback guidance is in `host-prerequisite/README.md`; preserve design links and
use supported grant/install/connection controls. This proof created no real links.
