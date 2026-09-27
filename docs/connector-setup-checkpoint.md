# Native connector setup and skill visibility checkpoint

Continues integration `697c09c0e4086f0098f68675fdd945d14670bd73` against host
`2026.916.1` / `d554c4789ed3930f8a53ac9fdf6503b3187097da`.
Engineering preview only. Resulting commit and tarball digest are recorded on VIS-6.

## Connector increment

The explicit linked host prerequisite now registers Figma in Paperclip's native
app catalog, automatic dynamic-client OAuth setup and connection discovery.
It uses the exact official remote endpoint and the existing managed credential,
connection-intent and OAuth mechanisms. The definition requests no customer
client secret fields, creates no grants and declares no vendor endorsement.
Existing Hermes-compatible metadata remains limited to its exact endpoint chain.

`figma-catalog.patch` changes the native generator, generated registry and visible
catalog slug set. `figma-app-definition.json` supplies the generated definition.
All three changed existing files match the pinned public host source byte-for-byte;
`catalog-baseline.json` records hashes. The proof harness copies shared sources,
checks baselines, applies the patch and resolves tests to the copied shared package.
Nothing patches `/app` or installs into the running server. Generator regeneration
against the full external capture corpus is deferred. Generic native OAuth artwork
is an explicit preview placeholder; official connector branding remains incomplete.

Designs now links to the current company's native Apps surface. Native setup
uses `/<company-prefix>/apps`; an agent-created connection intent is handled by
`/<company-prefix>/apps/connect?intent=<interaction-id>`. These are host routes,
not a replacement credential form. The setup-card test creates only a synthetic
interaction in an isolated database, not a user-facing card on the running host.

## Verification

Commands (run sequentially; no compiler attempt):

```sh
node scripts/prepare-host-proof.mjs /app setup-proof
FIGMA_INTEGRATION_ROOT="$PWD" /app/node_modules/.bin/vitest run --root "$PAPERCLIP_RUN_SCRATCH_DIR/setup-proof/server" src/__tests__/figma-connector-setup.test.ts
FIGMA_INTEGRATION_ROOT="$PWD" PAPERCLIP_HOME="$PAPERCLIP_RUN_SCRATCH_DIR/onboarding-home" PAPERCLIP_INSTANCE_ID=figma-onboarding /app/node_modules/.bin/vitest run --root "$PAPERCLIP_RUN_SCRATCH_DIR/setup-proof/server" src/__tests__/figma-onboarding.test.ts
node scripts/check-ui.mjs /app
node scripts/build.mjs "$PAPERCLIP_RUN_SCRATCH_DIR/setup-proof"
npm run check
npm pack --pack-destination "$PAPERCLIP_RUN_SCRATCH_DIR/package-one" --json
```

Passed native service/PostgreSQL setup proof: schema accepts the definition;
automatic OAuth needs no customer credential configuration; discovery is available;
request/replay produces one native connection-intent card addressed to the run's
responsible user; setup options expose OAuth; creating the card grants no usable
connection; mismatched company claims are rejected. No live provider call occurs.
DOM checks pass, including native Apps navigation switching with company context.

Onboarding uses the actual importer, additive assignment HTTP route, company
runtime skill resolver, Codex desired-skill selector and `ensureCodexSkillsInjected`.
Two separate synthetic employee directories contain the exact pinned SKILL.md
bytes after assignment and replay; prior skill materialization is retained. No
shared CODEX_HOME or actual employee configuration is changed. This is native
adapter-function evidence, not a fresh Codex process/model or protected-runtime
proof. The GitHub-import audit rejection remains explicitly asserted.

## Pinned inventory

`official-skill-inventory.json` records all 14 SKILL.md entrypoints from the
untruncated upstream tree at `38308b7bbc676a9e9d57795ad4793fa9682d1644`,
with Git blob verification and SHA-256 hashes. Entrypoint descriptions were
reviewed; excluded skill dependency trees were not audited or imported.

- Selected: `figma-design-to-code`, a single-file skill with no bundled references
  or scripts. Full text reviewed: context and screenshot retrieval, sparse-context
  follow-up, existing component reuse, local assets and visual verification.
  It does not authorize Figma canvas editing. No additional skill dependency is
  mandatory in its text. Motion context can require separately reviewed support.
- Deferred optional specialization: `figma-implement-motion` needs additional
  motion-tool and dependency review; it is not installed automatically.
- Excluded from automatic onboarding: Code Connect authoring, new-file creation,
  design/diagram/library generation, generative plugins, shaders, general Plugin
  API use, FigJam/motion/slides Plugin API extensions and bidirectional SwiftUI.
  Their broader read/write behavior is outside the chosen inspection workflow.

No upstream skill content is redistributed. Native audit still rejects GitHub
imports. Supported native assignment and materialization do not waive that audit
limitation or establish complete onboarding acceptance.

## Board and live boundaries / next action

Read-only tracing found the existing board test-call route:
`POST /api/tool-connections/:connectionId/test-calls`. It explicitly requires a
board actor, tools permission and authorization to test as the selected employee;
it invokes the gateway as a user. It is not interchangeable with a managed
employee session or a project-scoped Designs verification call. Designs keeps
`managed_session_required` until that explicit authority/selection workflow is
implemented and tested. No board-to-employee identity substitution was introduced.

Live managed discovery returned no Figma service on the unchanged running host.
No live setup card could be requested there. The isolated catalog test does not
make that host connectable. Nadia's next action is to complete board verification
through the native permission/agent-selection path and prepare a supported
isolated runtime exposing this catalog for real managed setup. Live OAuth, fresh
eligible-agent context/screenshots, concurrent shared use, grants/protected-runtime
proof, actual browser integration, two clean-instance lifecycle tests, full host
verification and CI remain unpassed. Elena retains compiler placement; no retry
was attempted. Theo receives preliminary evidence via his existing review issue.
