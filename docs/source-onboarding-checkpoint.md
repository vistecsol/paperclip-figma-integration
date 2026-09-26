# Runtime source delivery and isolated official-skill import

26 September 2026. Continues integration `bc021f672bf033b1d50228d51311dfae0607be71`.
The resulting commit, package digest and uploaded inventory are recorded on VIS-6.
Host target remains `2026.916.1` / `d554c4789ed3930f8a53ac9fdf6503b3187097da`.
Engineering preview only; no release readiness claim.

## Implementation

The approved host prerequisite now collects a project source index during run
preparation, before the shared wake renderer feeds CLI and native execution.
Committed task/run identity, rather than wake project fields, determines the
project. Original host project/run policy runs inside the database transaction.
The collector locks plugin and company enablement state, projects bounded
attachment metadata, and performs no MCP or credential calls. Plugin absence,
disable, unavailable schema, cancelled run, scope mismatch or SQL error produces
no contribution. Source data never substitutes for tool authorization.

SQL statement and lock timeouts (1500/500 ms) are set before project policy
acquires its locks. These are per-statement bounds, not a total wall-time SLA;
connection-pool acquisition is not covered. A real contended plugin-row test
exercises cancellation rather than merely racing an uncancelled SQL promise.
No background collection or recurring timer is introduced.

`projectDesignSources` is overwritten with the host result on each preparation,
including null on failure. The shared renderer labels it as untrusted data,
limits serialized input to 32 KiB, escapes Markdown-fence/tag delimiters and
retains exact JSON values and source URLs. It does not append labels as system
instructions. This is source wiring and isolated renderer proof; actual native
and CLI fresh-agent execution remains deferred, as do managed connection health
projection and live context/screenshot retrieval.

Two additional upstream source files (heartbeat dispatcher and shared renderer)
match the pinned public host commit byte-for-byte; hashes are in
`host-prerequisite/source-baseline.json`. The preparation script copies the
adapter-utils package into scratch before patching it, preserving the host copy.
Build provenance now also covers host service files; the normal build regenerates
the host domain bundle.

## Risk-based verification

Passed on the isolated pinned-source harness:

- Actual host policy/PostgreSQL/worker file: ten tests, including current project
  source delivery, foreign company/project denial, cancellation and company
  disable. Existing attachment RPC/UI authorization regressions remained green.
- One additional targeted real PostgreSQL lock-contention check passed; ten
  unrelated tests in that filtered invocation were skipped, not rerun.
- Shared renderer checks passed with fresh, resumed and native-reader options,
  including hostile fence/tag text, JSON round trip and oversize suppression.
  These calls do not constitute actual adapter or browser execution.
- Real company-skill import fetched the exact official GitHub revision, matched
  the recorded SKILL.md SHA-256, reused the row on replay, preserved existing
  library rows/content and denied a foreign-company lookup. Synthetic companies,
  a fresh database and a run-owned skill root were used; production was untouched.

The initial domain build mistakenly invoked the native esbuild ELF executable
with Node, which failed with a syntax error. It was corrected to invoke esbuild
directly before host testing. No failed check is described as passed.

Reproduction (after the standard prepare/build commands in README):

```sh
FIGMA_INTEGRATION_ROOT="$PWD" /path/to/host/node_modules/.bin/vitest run --root "$PAPERCLIP_RUN_SCRATCH_DIR/proof/server" src/__tests__/figma-project-transaction.test.ts
node --import /path/to/host/node_modules/.pnpm/tsx@4.23.12/node_modules/tsx/dist/loader.mjs scripts/check-source-renderer.mjs "$PAPERCLIP_RUN_SCRATCH_DIR/proof"
PAPERCLIP_HOME="$PAPERCLIP_RUN_SCRATCH_DIR/onboarding-home" PAPERCLIP_INSTANCE_ID=figma-onboarding FIGMA_INTEGRATION_ROOT="$PWD" /path/to/host/node_modules/.bin/vitest run --root "$PAPERCLIP_RUN_SCRATCH_DIR/proof/server" src/__tests__/figma-onboarding.test.ts
```

The onboarding test performs public, pinned upstream retrieval; it is deliberately
separate from deterministic package tests. It refuses a non-scratch skill root.

## Onboarding correction and remaining gates

The previous runbook incorrectly prescribed native audit after GitHub import.
The pinned host audit service explicitly rejects `github` skills; only `catalog`
and `local_path` are accepted. The real isolated test confirmed that rejection.
The runbook now records the limit. No source-type conversion, audit bypass or
assignment occurred. Hash comparison covers SKILL.md, not a full package audit.
The importer can update same-key content; inspect an existing library before
import, preserve custom/suitable skills, and do not generalize clean-library
replay proof into safe overwrite of customized installations.

Managed discovery again returned no Figma service. No connection request or
credential solicitation followed. The access-check route still returns 501;
managed inspection/catalog integration, full inventory audit, additive employee
assignment/replay, future-agent onboarding and live two-agent proof remain open.
Both clean-instance lifecycle checks, actual browser sessions, full-host checks
and CI remain unpassed. No further full-host compiler attempt ran; Elena owns
isolated placement under the saved decision, independent of implementation.

Nadia owns continued managed inspection and onboarding implementation. Theo
receives this preliminary source/package evidence on his assigned review issue;
the complete-candidate dependency remains open. No production deployment, npm
publication, canvas change, RTS access, paid change or new task is included.
