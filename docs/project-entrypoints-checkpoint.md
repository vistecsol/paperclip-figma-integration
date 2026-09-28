# Create project and Configuration design associations

28 September 2026. Engineering preview; live browser acceptance is deferred.

The saved project UI correction is implemented in a shared native association
editor alongside Source repos in both Create project and Project Configuration.
It follows RepositoryEditor spacing, optional section, bordered summary rows,
outline add control and native buttons. Add Figma design selects a named managed
OAuth connection and accepts a file/node URL; no file-enumeration capability is
invented. Native Connect Figma uses ConnectionSetupFlow.

Multiple files/nodes, labels/purposes, ordering, primary designation and detach
are supported. Saving is explicitly distinct from verifying access; the existing
Designs tab retains its explicit employee access check. GitHub controls/payloads
are preserved. Company/project changes remount the editor.

Creation retains the new project ID when association saving partially fails.
Retry reconciles already-saved normalized links without creating another project.
The error also offers recovery through Project Configuration. Configuration
pins the starting revision even if background queries refresh; stale or partial
saves require reload to review what persisted. No automatic stale replay.

## Exact scope and evidence

Host target: 2026.916.1 / d554c4789ed3930f8a53ac9fdf6503b3187097da.
Both NewProjectDialog.tsx and ProjectProperties.tsx were byte-compared against
that upstream commit before baseline hashes were recorded. Host authority stays
in the committed keyed data/action route fix f633ddedc21dd7833ceaf90d3b7f39b63bdf1980.
No extra backend permissions or unscoped RPC were introduced.

Commands passed:

- `python3 "$PAPERCLIP_RUN_SCRATCH_DIR/pin-ui.py"`: downloaded the two exact
  upstream files and compared local bytes, then recorded SHA-256 baselines.
- `node scripts/build-project-ui-patch.mjs`: generated eighth host prerequisite.
- `node scripts/check-project-ui.mjs`: applied the patch to isolated copies;
  DOM create flow selects GitHub and two nodes, partially saves, retries using
  the same project, then reads both saved links; configuration rename/save/reload;
  concurrent revision rejection after a background refresh; URL canonicalization
  and host-spoof rejection. Uses actual attachment transitions and real React
  Query, with simulated authenticated transport/storage. This is not browser HTTP
  or database integration proof.
- `node --check scripts/build-project-ui-patch.mjs` and
  `node --check operator/prepare-context.mjs`; `git diff --check`.

Initial harness failures: `python` absent (used python3); React Query CommonJS
provider differed from bundled ESM hooks (shared ESM exports corrected). The
first passing DOM process retained cache timers and was interrupted after its
pass message; gcTime 0 corrected teardown, and subsequent commands exited 0.

Operator preparation applies the new patch, copies the shared component and
checks its packaged digest. No host full compiler, package build/pack, broad
suite, UI smoke rebuild or Docker operation ran in this heartbeat. Unrelated
maintenance work is preserved.

## Pending runtime gate

The previously stopped test app remains the continuation baseline; no current
availability claim. Last recorded app admission failed by 21.75 MiB. That is
historical, not a new measurement. The prior 04:00 UTC expiry is not extended.
The changed host UI needs one bounded rebuilt smoke asset before testing these
entry points, followed by qualified app-only admission and guarded retained-app
start. Preserve accounts, managed credentials, links and existing GitHub data.
Elena coordinates the capacity/window; Nadia owns build, installation and keyed
HTTP plus actual user-browser save/reload proof. Do not request a user retry
until availability and successful response bodies are verified. Existing consent
card is preserved, but offline runtime verification is the current blocker.

Full-host/CI, live OAuth/shared-agent/protected-runtime, browser acceptance,
onboarding and both clean-instance lifecycle gates remain unpassed. No release
candidate or engineering completion is claimed; no interim Theo wake.
