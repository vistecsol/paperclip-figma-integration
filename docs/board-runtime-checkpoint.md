# Board verification and isolated runtime placement

Engineering preview; release acceptance remains incomplete. Continues integration
`9d0e94ea9cabe367e1e40859603c1e427d62bdd3` against Paperclip `2026.916.1`,
`d554c4789ed3930f8a53ac9fdf6503b3187097da`. Resulting commit and package hashes
are recorded on the engineering issue.

## Implementation

Designs obtains eligible employees from the existing same-origin native
`GET /api/tool-connections/:connectionId/test-agents` route. No employee is
preselected. Explicit verification sends the selection through the host-captured
UI invocation. Original board identity and inspector closure remain host-only;
worker input cannot construct authority. API board verification may explicitly
supply `agentId`; employee sessions retain the original session-bound path.

The two native tools/employee authorization helpers are extracted unchanged from
`tool-access.ts` into `board-tool-test-policy.ts` and shared by the existing test
routes and Designs inspector. That route source was downloaded at the pinned
upstream commit and matched `/app` byte-for-byte; `board-baseline.json` records
its SHA-256. `figma-board-policy.patch` is an explicit additional host prerequisite,
never applied by npm install or to the running server.

The inspector permits only `get_metadata` on the exact official OAuth remote
connection and calls native `executeTestCall` as the board user with the selected
employee. Native company membership, grant audience, policy, audit and secret
handling remain in force. Native ask-first policies are not access proof; the
Apps workflow remains the place for approval handling. Provider content and
errors do not cross the plugin RPC. Project/company authorization, connection
validation, expected revision and persistence remain in the existing transaction.
A worker timeout rolls back verification persistence; it cannot undo a provider
read already dispatched. The result is link access evidence, not proof of a fresh
employee run or protected runtime.

## Verification and corrections

Commands, sequential in the isolated pinned-source harness:

```sh
node scripts/build-board-policy-patch.mjs /app
node scripts/build-invocation-patch.mjs /app
node scripts/prepare-host-proof.mjs /app board-proof-2
node scripts/build.mjs "$PAPERCLIP_RUN_SCRATCH_DIR/board-proof-2"
FIGMA_INTEGRATION_ROOT="$PWD" /app/node_modules/.bin/vitest run --root "$PAPERCLIP_RUN_SCRATCH_DIR/board-proof-2/server" src/__tests__/figma-inspection.test.ts src/__tests__/figma-project-transaction.test.ts
node scripts/check-ui.mjs /app
npm run check
npm pack --pack-destination "$PAPERCLIP_RUN_SCRATCH_DIR/package-one" --json
```

The focused native tests exercise denied tools permission, missing/terminated
employee, board-user grant-audience denial, explicit synthetic membership/grant
success with deterministic remote transport, existing agent inspection and grant
revocation, and UI invocation through the actual bundled worker and PostgreSQL.
The DOM check requires an explicit employee choice and checks the submitted ID
and revision, alongside existing stale-edit, detach and project-switch checks.
No real OAuth, browser HTTP integration or fresh model session is represented by
these tests. Final results and package prepack outcome are recorded on the issue.

Initial failures: the new generator initially looked for the route in the wrong
baseline file; a dedicated verified baseline corrected it. A broad harness edit
accidentally inserted baseline records into filename lists; it was corrected
before preparing `board-proof-2`. The first board fixture lacked acting-user
company membership and grant audience; the native gateway correctly denied it.
Those denials are now asserted, then the fixture explicitly adds both. A paused
employee is assignable under native policy; the unavailable-employee test was
corrected to use `terminated`, without changing host policy.

## Precise external prerequisite

Fresh API inspection on 27 September 2026 found:

- Current task `currentExecutionWorkspace: null`.
- Project `executionWorkspacePolicy: null`; registered workspace
  `9bb0fa6b-bb0d-45bc-9731-18d8bc44f113` has `runtimeConfig: null` and `cwd: null`.
- `GET /api/companies/:companyId/environments` returned HTTP 403,
  `Board access required`, under Nadia's run identity.
- Managed Figma discovery returned an empty service list. No real connection
  setup card can be requested on this unchanged host.

A supported runtime-service start needs a realized execution workspace and a
configured service. There is neither an authorized environment identifier
available to this identity nor a service to start. Run scratch is ephemeral and
is not a persistent OAuth callback/runtime placement. An unmanaged background
server, running-host patch, alternate credentials or desktop login is not an
acceptable substitute.

Elena coordinates a supported VTS isolated placement with a realized execution
workspace, permitted native plugin-install mechanism, persistent fresh test
DB/vault storage, and a board-accessible origin/callback. Nadia owns preparing
and configuring the pinned prerequisite host/package there, starting it through
managed controls, and exposing the native Figma setup flow. Only then request
indispensable VTS test identity/fixture inputs through managed setup. No secret
values are required in the placement response. This is a concrete placement
prerequisite, not renewed scope approval or a request for compiler retries.

Full-host verification remains unpassed; no compiler retry occurred. Elena retains
compiler placement. Live OAuth/shared-agent/protected-runtime, browser integration,
complete onboarding acceptance, two clean-instance lifecycle checks and CI remain
open. No production deployment, npm publication, RTS access or canvas change.
