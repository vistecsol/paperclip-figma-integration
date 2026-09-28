# Direct-icon smoke build preparation — 28 September 2026

Source-only recovery for VIS-6; no Docker operation, capacity probe, UI build,
restart or heavy trial in this heartbeat. Service remains offline. The previous
04:00 UTC allowance is expired. Elena coordinates a new execution window.

Host target: 2026.916.1 / d554c4789ed3930f8a53ac9fdf6503b3187097da.
Dependency image: sha256:a02ac35ac41df911af477422ea0e781cf41d2b2c600c66f0a5ac9d8c63f52c2c.
Prior source baseline: c109c06929dfe48e99858bebafdb0c427abaaf30.

## Changed executable workload

`operator/ui-icon-imports.mjs` adds a build-only post-transform plugin to the
existing successful Vite smoke configuration. It reads the installed Lucide
1.38.0 side-effect-free barrel and resolves named icon/helper imports directly
to the exact re-exported default modules. It uses bundler AST import declarations,
not text replacement of user strings. Aliases are preserved. Namespace, dynamic,
unknown and unsupported declarations retain native resolution. Version drift,
missing files and absent expected exports fail closed. Existing production
transforms, React, Tailwind, native project controls, assets and service-worker
stamping remain. This is a full clean Vite build, not reuse of stale chunks.

The changed dependency graph is concrete: NewProjectDialog imports Folder/X,
ProjectProperties imports its status/action icons, and their shared
FigmaDesignEditor imports Plus/X/FileImage. The editor also retains native
ConnectionSetupFlow, query client, dialog and API dependencies. No UI feature or
connection component is removed. Scanning UI runtime imports plus the new editor
found 423 declarations, 285 distinct direct targets out of 1793 barrel targets,
and zero fallback declarations. This static inventory excludes third-party
importers; it is not the measured full build graph. Third-party barrel imports
may reduce savings. Actual peak memory and success at the new cap are unproven.

Focused checking caught an independent build defect: the new editor used the
removed `Figma` brand export. Lucide 1.38.0 has no such export. The editor now
uses its real `FileImage` icon; text, links and interactions are unchanged.
The prior DOM mock had hidden the unavailable export.

## Portable invocation and exact experimental budgets

After Elena coordinates a window, from this committed repository with the
supplied rootless Docker environment and normal Paperclip run variables:

```sh
VTS_UI_TRIAL_DEADLINE='<new coordinated UTC deadline>' python3 operator/ui-smoke-trial.py
```

The runner prepares verified pinned project sources and invokes inside its
explicitly owned test build container:

```sh
NODE_OPTIONS=--max-old-space-size=896 RAYON_NUM_THREADS=1 VTS_UI_PREFLIGHT_APPROVED=1 node /ui-smoke-build.mjs
```

Build hard limit: **1408 MiB (1476395008 bytes)**, no swap, one CPU, 128 PIDs;
Node old space 896 MiB. Concurrent probe: 64 MiB, no swap, 0.25 CPU, 32 PIDs.
Fresh daemon/ancestor admission: **2752 MiB (2885681152 bytes)** = build 1408 +
probe 64 + unchanged host reserve 1280. Disk reserve remains 2 GiB. Existing
continuous reserve supervision, 300-second timeout, expiry, ownership checks,
no network/mounts, one-attempt receipt and no automatic retry remain.

These are selected experimental limits, not evidenced successful minima. The
changed graph supports trying less memory; it does not prove a 128 MiB saving.
The application budget is unchanged: 1536 MiB/no swap/one CPU, fresh separate
**2880 MiB** admission including probe and reserve. No browser runs inside it.
A smaller UI build does not solve the app admission requirement or authorize a
runtime launch. Smallest fallback if the optimization does not fit is the prior
successful 1536 MiB full smoke configuration in a coordinated window; no extra
user RAM, stale output substitution or reserve reduction is proposed.

## Focused verification

Passed:

```sh
node scripts/check-ui-icon-imports.mjs /app/node_modules/.pnpm/@babel+parser@7.29.8/node_modules/@babel/parser/lib/index.js /app /app/node_modules/.pnpm/rollup@4.63.1/node_modules/rollup/dist/es/rollup.js
node --check operator/ui-capacity.mjs
node --check operator/ui-smoke-build.mjs
node --check operator/ui-icon-imports.mjs
python3 -c "import ast; ast.parse(open('operator/ui-smoke-trial.py').read())"
git diff --check
```

The first command verifies aliases, strings/comments, namespace/dynamic/unknown
fallback behavior and source import inventory. Its tiny real Rollup fixture
linked 12 modules, retained all four requested exports and loaded neither the
Lucide barrel nor icon index. Rollup warned that two upstream `use client`
directives were ignored; this is a client-only fixture, not SSR verification.
Initial expected-Figma-export assertion failed, exposing the defect corrected
above. No full UI/host build, browser, release check or broad suite was run.
Vite hook execution on the entire UI at the reduced cap remains untested.

## Next action and retained gates

Nadia owns one newly coordinated changed-workload trial, separate retained-app
admission, served revision/asset proof, keyed data/action response bodies and
Create project/Configuration save-reload preserving GitHub and design links.
Elena owns the next service window. Require usable time for Adam's navigation
and consent before asking him to retry. Existing consent card stays preserved.
All live OAuth/shared-agent/protected-runtime, browser acceptance, full-host/CI,
onboarding and clean-instance lifecycle gates remain open. No complete candidate
or Theo handoff is claimed. Production containers/Compose and unrelated
maintenance work are untouched; only ownership-verified vts-figma-test-* resources
may be used in a later authorized trial, with no socket or production mounts.
