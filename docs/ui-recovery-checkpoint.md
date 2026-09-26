# Designs UI and measured compiler recovery

26 September 2026. Engineering remains incomplete. Continues integration commit
`199a4d1878d284ea9eff729fcad424b562d9f2ee`; the resulting commit and tarball hashes
are recorded on VIS-6 after creation. Both Elena recovery comments were applied:
implementation continued independently of the required full-host compiler gate.

## Concrete increment

Native `ui.detailTab.register`, project `detailTab` and `dist/ui/index.js` expose
Designs through Paperclip's existing plugin UI loader. The React bundle imports
host-provided React and SDK hooks; it calls no host APIs directly and packages no
second React runtime. Native worker data/action registrations use the existing
fixed-operation RPC. The host captures board authority and the intended operation
before UI bridge dispatch, retains them by object identity, and authorizes the
project transaction. Agent UI-bridge attempts fail closed; agents continue to use
the scoped API with current-run checks. Other plugins' bridge behavior is unchanged.

The tab provides normalized-link attachment, label/purpose edits, explicit
revision writes, ordering, primary designation, exact-node external links,
detach confirmation and access-state display. It blocks duplicate in-flight
writes, refreshes after stale revision responses without replaying them, and
remounts when company/project changes. Same-company official-OAuth connection
choices contain only ID/name; they do not assert health or managed-tool grants.
No connection tokens/configuration cross the UI boundary. No fabricated setup
card is shown. The existing native Connectors setup still needs Figma catalog
integration. Access-check requests explicitly report the existing 501 limitation.

Five additional UI/skill-import source files matched the exact public host commit
byte-for-byte; see `host-prerequisite/ui-baseline.json`. Host target remains
`2026.916.1` / `d554c4789ed3930f8a53ac9fdf6503b3187097da`. The official Figma
skill reference is pinned at `38308b7bbc676a9e9d57795ad4793fa9682d1644` with a file
hash and scoped import procedure. Its content is not redistributed, installed or
assigned in this checkpoint. See `official-skill-onboarding.md` for additive
provisioning and the still-unexecuted acceptance steps.

## Measured compiler outcome

The previous run's scratch tree was absent; its measurement script survived as
an untracked repository file. A fresh isolated source tree was prepared and the
single permitted attempt ran before UI edits:

```sh
node scripts/prepare-host-proof.mjs /app recovery-proof
python3 scripts/measure-host-typecheck.py "$PAPERCLIP_RUN_SCRATCH_DIR/recovery-proof" "$PAPERCLIP_RUN_SCRATCH_DIR/compiler-evidence.json"
```

Preflight MemAvailable: 3,823,738,880 bytes; visible cgroup memory.current:
1,437,638,656 bytes; visible memory.max/high: `max`; competing esbuild RSS:
8,140 KiB. Result: SIGKILL (9), 78.08 seconds, peak child RSS 5,728,748 KiB,
empty diagnostics. Visible cumulative oom_kill rose from 2 to 3. This supports
an OOM-associated termination but does not independently identify every victim.
Only namespace-visible cgroup ancestors could be inspected. Exact before/after
measurements are in `compiler-recovery-evidence.json`.

Post-failure inspection found installed TypeScript `7.0.2` invokes a native
compiler via `process.execve`; the supplied Node 2048-MiB heap ceiling therefore
did not bound compiler memory. The committed measurement script now refuses that
launcher instead of misleadingly treating it as heap-bounded. It was not rerun.
No limit changes, unrelated process termination or second compiler attempt.
Elena received this new capacity finding for coordination. Full-host typecheck,
build and CI remain unpassed; targeted transpilation/tests are not substitutes.

## Affected checks and reproduction

After preparing `ui-proof` and building the bundle:

```sh
FIGMA_INTEGRATION_ROOT="$PWD" /app/node_modules/.bin/vitest run --root "$PAPERCLIP_RUN_SCRATCH_DIR/ui-proof/server" src/__tests__/figma-project-transaction.test.ts
node --import /app/node_modules/.pnpm/tsx@4.23.12/node_modules/tsx/dist/loader.mjs scripts/check-host-manifest.mjs /app
node scripts/check-ui.mjs /app
```

Passed: native bundled worker, host-service RPC and PostgreSQL operations,
including the new UI bridge rename/read path, immutable captured commands,
rejection of copied envelopes and agent UI attempts. Existing run/company and
transaction tests in the affected file passed (nine tests). Native manifest
schema accepted the UI slot. DOM checks passed for escaping label text, revision
submission, duplicate suppression, stale-write recovery, detach confirmation,
company/project draft reset and empty state. UI callbacks use a synthetic SDK
fixture in this DOM check; native bridge/database proof is separate. Actual
browser route rendering, visual review and end-to-end HTTP sessions are deferred.

`npm run check` initially caught whitespace in blank context lines of the
new generated patch. The generator was corrected; a fresh `ui-repro` tree then
applied the patch and rebuilt successfully, and syntax/whitespace checks passed.
Final prepack/package results are recorded with the uploaded inventory. No hook
or CI bypass. No SDK typecheck rerun or unrelated full test suite.

## Remaining release conditions

Managed inspection and catalog setup, source-index registration in both runtime
paths, actual company skill import/audit/additive assignment, live OAuth and
shared eligible-agent context/screenshots, protected runtime/grant removal,
clean-instance lifecycle proof twice, full host checks and independent candidate
review remain unpassed. Current Figma connection discovery returned an empty
result; no intent/card or live access was claimed. Running host and employee
configuration were untouched. No production changes, npm publication, paid
resources, RTS access or timer/monitor changes.

Nadia owns the next code increment: wire native managed inspection and runtime
source delivery, retaining the authorization boundaries above. Elena owns the
native-compiler verification placement. Theo receives this partial checkpoint
through his assigned review issue; its complete-candidate dependency stays open.
