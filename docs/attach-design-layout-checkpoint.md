# Attach Design layout correction — 28 September 2026

Both user screenshots were downloaded and visually inspected. The first shows
the connected company Figma account, consistent with separately verified consent.
The second shows the Designs attachment form open, with borderless inputs and
inline labels/actions running together. It does not show a failed save response.

The plugin rendered raw HTML controls without control styles. Its few Tailwind
classes depend on compiled host CSS; separately loaded plugin sources are not
reliable host scan inputs. The pinned SDK exports higher-level components but
no general Button/Input/Select controls.

src/ui.jsx now ships scoped styles inside its UI module, using Paperclip theme
tokens for borders, backgrounds, text and focus rings. The editor stacks labeled
controls inside a bounded form. Buttons have visible boundaries and wrapping
action groups. The form has an accessible name, link placeholder, and explanation
that saving does not verify access. Authorization and mutation contracts remain.

## Reproduction and validation

Host: 2026.916.1 / d554c4789ed3930f8a53ac9fdf6503b3187097da.
Base integration: 8c738cdfcba9b70bc17eae52c81aec21d864cf27.

    node scripts/check-ui.mjs /app
    node --check scripts/check-attachment-browser.mjs
    git diff --check

Passed focused DOM checks cover revision/duplicate-submit protection, stale-write
recovery, detach confirmation, employee selection and company/project remount.
No broad suites or full-host build were repeated.

Only the plugin UI was bundled with host esbuild 0.28.2:

    esbuild.build({
      entryPoints: ['src/ui.jsx'], outfile: '<run scratch>/designs-ui.js',
      bundle: true, platform: 'browser', format: 'esm', target: 'es2022',
      external: ['react', '@paperclipai/plugin-sdk/ui'], sourcemap: false
    })

Bundle SHA-256: 7c107e86ccb5dd4e9e4dd0ebc7c9a8e355820ae0db1eab66a30c54e68c30f9a0.
The ownership-verified Mac test app received this file at
/app/figma-candidate/dist/ui/index.js. The served plugin route matched it
byte-for-byte. Original bundle retained for rollback. No host UI rebuild,
application restart, account/grant change or consent retry.

App: 9f765711b5f951ce34d6dd9db018c2855590ee38fd3e5139703a4b2b2be7aec3.
Ownership run: 674c9b1f-13bb-4663-be3c-48b78e61eba7, issue VIS-6.
Existing 1536 MiB/no-swap/one-CPU limits, reserve guard and 22:05:33 UTC expiry
unchanged. No production resources touched.

The browser harness uses native sign-in from private test state passed only over
stdin, creates a synthetic project, explicitly chooses a same-company connection,
checks computed field sizes/borders and non-overlap at desktop/mobile widths,
then saves and reloads through the keyed API. It invokes no Figma tools and never
modifies the canvas or existing real project links.

First browser attempt timed out because the harness expected a link named
Designs. Pinned ProjectDetail/PageTabBar renders a tab; selector corrected.
Failed result retained; no attachment submission occurred in that attempt.
A second attempt reached Attach design but timed out on the exact Connection
label. Explicit accessible names were added to all attachment fields before
rebuilding only the UI module. That failure is also retained.
Evidence retrieval initially used unsupported remote brace expansion; explicit
file paths corrected that download.

## Runtime form evidence

The corrected form passed computed layout checks at 1280px and 390px: all four
controls had visible borders, adequate width/height, vertical non-overlap and no
page horizontal overflow. Captured desktop/mobile screenshots confirm clear
field boundaries, spacing and distinct Save/Cancel buttons.

The browser submitted once and the form closed. A subsequent exact-text
post-reload assertion timed out; this is not represented as a passing browser
reload. Independent authenticated native readback then confirmed:
- Synthetic project 370fd415-d4f9-45c0-9e89-bfded2155bfa.
- Inner keyed response status 200, revision 1.
- Saved connection 165fc3b9-48c8-4f20-a549-0f7ffe4b339f.
- Normalized synthetic node 1:2, label Unverified layout proof.
- Verification remains unverified; no remote Figma call was made.

Two earlier failed harness attempts left empty synthetic projects. Existing user
projects and associations were not modified. Read-only browser confirmation is
recorded separately below.

The read-only browser run also timed out; body text was Loading… and the final
screenshot was a blank native page. It made no attachment mutations. The harness
did not emit stage milestones, so a fresh-navigation versus post-reload pass is
not independently certified from that run. The checked-in harness now reports
the stage on failure. No further browser retry was performed.

Final app health remained ok; own memory.events reported zero OOM/kill events,
observed peak 1,307,811,840 bytes. This does not diagnose the browser loading cause.
Separate browsers retained 512 MiB/no swap/one CPU, full host/disk reserve
supervision, six-minute lifetime and AutoRemove. Each temporary browser was
stopped after evidence extraction; probes auto-removed. No app restart or expiry
extension. The remaining native loading defect needs instrumented request/
console evidence before browser reload acceptance.

Final source/bundle is installed only in the authorized test app. Its existing
window remains 22:05:33 UTC. No new consent or user retry is requested while the
remaining reload defect is unresolved.

## Release limits

Targeted installed UI correction, not a newly qualified npm release. Full package
reproduction and release checks remain outstanding. Consent was already verified
separately. Inspection allowlisting, correction of the existing real design's
synthetic connection reference, fresh eligible-agent retrieval, automatic draft
selection, protected-runtime proof and lifecycle/onboarding gates remain owned
by Nadia. Theo's complete-candidate dependency stays open.
