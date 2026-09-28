# Mac build and browser checkpoint — 28 September 2026

Engineering remains incomplete. This is an engineering preview with approved host prerequisites, not release acceptance.

## Exact source and executable commands

Integration input: 81e2b0a3cdc988d1fc33dd16765b4dede547d3fb.
Host: 2026.916.1 / d554c4789ed3930f8a53ac9fdf6503b3187097da.
Arm64 dependency image: ghcr.io/paperclipai/paperclip@sha256:4e2e1e59219129a4b687cd54ba439fb7fed0a5710af9f1551277dedd23dc61f1.
Patched-input archive SHA-256: 6044f9107270651fbad3874feac2b1ee68ed2b270b1a7574b1b547e087466ebf. It matches the previously baseline-verified archive; changes since that verification affect only operator ownership checks and documentation. The fresh Git bundle clone and in-container Git preflight verified the exact HEAD and ownership without safe-directory overrides.

One sequential build, through the authorized wrapper:

    /Users/nolan/vts-figma-test/bin/docker-job /bin/bash /Users/nolan/vts-figma-test/job-c69805a3-cd15-444d-98f0-645d61b68cca/mac-build-job.sh /Users/nolan/vts-figma-test/job-c69805a3-cd15-444d-98f0-645d61b68cca c69805a3-cd15-444d-98f0-645d61b68cca 81e2b0a3cdc988d1fc33dd16765b4dede547d3fb

The supervisor executed patched SDK compilation, node scripts/build.mjs /app, normal npm pack/prepack, and node operator/ui-smoke-build.mjs. No hook or CI bypass. This UI configuration disables minification/compression reporting and uses direct Lucide imports; it does not replace release-build validation.

## Build result

Admission: 7,717,531,648 bytes daemon/ancestor headroom; disk 920,233,365,504 bytes.
Effective 1408 MiB/no swap/one CPU/128 PIDs; old space 896 MiB; 1280 MiB host and 2 GiB disk reserves.
Started 18:42:41.142 UTC; finished 18:44:45.610 UTC; exit 0, OOMKilled=false.
Vite transformed 5894 modules and completed in 2m 2s. Terminal memory.peak 1,476,395,008 bytes reached the hard cap, with zero own OOM events and substantial reclaim pressure. No claim of memory margin or minimum required capacity.
Normal prepack passed syntax/whitespace, 44 package tests, and build integrity. No unrelated broad suite or full-host compiler.
Package: 148 files, SHA-256 a60b877632c792caeaf37d1c312ce8b7e7330c0afae152a93a1eff335bcc551e. One pack in this run; cross-build reproducibility for this exact revision remains deferred.

## Fresh runtime and browser evidence

Fresh labeled network and state volume on Mac; no production storage, Docker socket, secrets or databases transferred. Source entry point with built SDK/UI and unpacked package. App admission: 7,481,483,264 bytes; separate browser admission: 6,259,642,368 bytes. App 1536 MiB/no swap/one CPU; browser 512 MiB/no swap/one CPU, sharing only this test app's network namespace. Browser dependencies installed in its disposable container, not on the host. App had a 20-minute deadline/reserve guard; browser test process had bounded timeout/reserve monitoring.

Native authenticated signup, first-admin claim, company/project creation and local package installation all passed. Plugin reached ready. Synthetic credentials stayed in the private test volume; session transfer to the test browser occurred only over stdin, not in artifacts.

Actual authenticated keyed data/designs.list and actions/designs.mutate inner bodies returned status 200. Add/rename/readback retained synthetic file/node reference at revision 2, unverified. Served index matches built index byte-for-byte, SHA-256 6f737c016f469c4dd4d73e4339e5fd76a209f6c301b32d82b9f6114745207f70.

Actual Chromium:
- Create project opened the native dialog with Figma controls alongside Source repositories, selected the synthetic managed connection and saved a design reference.
- Configuration changed its label and saved. A fresh navigation verified the input value and actual keyed database readback: revision 2, label “Browser configuration saved”, node 2:3, still unverified.
- Screenshots and scripts are in the evidence bundle.
- First selector expected New project instead of visible Add Project; corrected without a rebuild. Configuration loading/reload assertions timed out; final read-only DOM-value plus keyed-readback check passed. These failed harness attempts remain recorded, not erased or represented as initial passes.
- No actual GitHub connection was provisioned on Mac. Existing hermes01/GitHub state was not touched by this run; live GitHub coexistence acceptance and Adam's own navigation are not claimed.
- No live OAuth consent, tokens, Figma context/screenshot retrieval or shared-agent proof.

App observed peak reached 1,610,612,736 bytes; browser peak 537,382,912 bytes, both with zero own OOM events. Browser's terminal exit 137 followed explicit supervisor docker stop (OOMKilled=false); it is not an OOM result.

## Retained resources and disposition

Build: 68def40a4553087c730bad4a2c8b01e536b1b74a6c847a1e3e24ec49c80a72ff (/vts-figma-test-mac-c69805a3-native-build), stopped.
App: ff15e53eb979e31e72ff22215d5ef327b1659955c95095f0abf11b5d53e18cb2.
Browser: d03b2099f0623e6014e7ad130c6ba565d1c888b4d4a28bd12e81b3689c6c28cc.
App/browser ownership verified before every mutation; both stopped explicitly at 18:55:45 UTC after proof. App exit 0; browser OOMKilled=false. Fresh volume vts-figma-test-mac-c69805a3-runtime-state and network vts-figma-test-mac-c69805a3-runtime-net retained. Synthetic accounts/design links retained. No production container, Compose resource, daemon cleanup or unrelated maintenance change.

No ready URL is offered: this bounded verification session is over. Nadia owns preparing a usable Mac human-access window, native human account/company membership and managed Connect handoff; Elena coordinates the operator/access window. Reuse successful output, do not rebuild. Preserve the existing pending consent response path rather than asking for credentials or circulating synthetic login details.

Outstanding: live consent/shared-agent/protected-runtime, Adam navigation, live GitHub coexistence, full-host/CI, complete onboarding, reproducibility at this revision and both clean-instance lifecycle gates. Local installation on one fresh patched source runtime is a partial portability result, not two-instance or standalone npm acceptance. Theo's review remains dependent; no interim review wake.
