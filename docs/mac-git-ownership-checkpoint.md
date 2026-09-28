# Mac Git ownership checkpoint — 28 September 2026

Engineering incomplete. One authorized build executed; no build retry or runtime launch.

## Inputs and verification

Integration 5dc19f10e0dc29d758c671050a2cb143fb650dd6; host 2026.916.1 / d554c4789ed3930f8a53ac9fdf6503b3187097da. Arm64 image ghcr.io/paperclipai/paperclip@sha256:4e2e1e59219129a4b687cd54ba439fb7fed0a5710af9f1551277dedd23dc61f1. Host archive SHA-256 f7a2049c2f10accc455b50ec4821ff100e0daa53074a23cf05398f83c12f0baa.

Re-downloaded and hash-verified the public archive, verified all recorded baselines, applied eight patches and compared every file in retained patched-inputs.tar.gz with the resulting source. Input archive SHA-256 6044f9107270651fbad3874feac2b1ee68ed2b270b1a7574b1b547e087466ebf. Fresh bundle clone retained the exact integration revision. No secrets, databases, production storage or unrelated maintenance transferred.

Run 559af9c9-12bc-4774-8c24-1fd83225a901; fresh Mac directory /Users/nolan/vts-figma-test/job-559af9c9-12bc-4774-8c24-1fd83225a901.

Executed through authorized wrapper:

    /Users/nolan/vts-figma-test/bin/docker-job /bin/bash /Users/nolan/vts-figma-test/job-559af9c9-12bc-4774-8c24-1fd83225a901/mac-build-job.sh /Users/nolan/vts-figma-test/job-559af9c9-12bc-4774-8c24-1fd83225a901 559af9c9-12bc-4774-8c24-1fd83225a901 5dc19f10e0dc29d758c671050a2cb143fb650dd6

## Actual result

Fresh daemon/ancestor admission at 18:36:48.947 UTC passed: 7,692,374,016 bytes headroom, complete ancestry, 920,309,686,272 bytes disk free. Build initial available 7,677,607,936 bytes. Effective 1408 MiB/no swap/one CPU/128 PIDs, old space 896 MiB; no network or mounts. Supervisor retained 1280 MiB RAM and 2 GiB disk reserves.

Patched SDK compilation, plugin bundles and prepack syntax check passed. Normal prepack git diff --check exited 129; npm tests/build integrity, tarball and Vite were not reached. Build elapsed 1.479 seconds from Docker timestamps; terminal memory.peak 354,119,680 bytes, zero own OOM events, OOMKilled=false. This is not a capacity failure or full-host pass.

Read-only stopped-container inspection proved .git existed. A separate 64 MiB/no-swap/.25 CPU Git-only diagnostic revealed `detected dubious ownership`: copied files retain Mac UID 503 while build runs as root. Git diff's shorter message had obscured this cause. A second small diagnostic changed ownership only of its fresh /app/integration checkout; rev-parse returned the exact expected commit and git diff --check passed. No safe.directory override, hook suppression, prepack bypass or compilation retry.

## Correction and limits

Supervisor now normalizes only the fresh test checkout to the build UID/GID, requires VTS_INTEGRATION_REVISION, verifies actual HEAD and runs git diff --check before compilation. Job supplies the exact revision. Node/shell syntax and repository whitespace passed. The focused real arm64 ownership diagnostic passed; full corrected build remains unexecuted.

Retained stopped build: faa26e9c81647ce1d2079ef7c56bf45057bd0f67e2889dafa35c9cfe3b96d704 (vts-figma-test-mac-559af9c9-native-build). Probe ee8253615a572f6f7a0ce986e3f568141f3aa07d353bca4306f90380622d0b2f. Diagnostic IDs and logs are in the evidence artifact. Ownership labels were verified before operations. No production container action or cleanup; no test runtime, volume or network created. Hermes01 accounts/design/GitHub state and unrelated maintenance remain untouched.

Nadia owns the corrected build and subsequent fresh runtime, served revision, keyed HTTP and project entry-point persistence verification; Elena coordinates the next controlled continuation after this failure. No higher memory budget or human credentials required. No user retry or ready URL. Remaining browser, consent/shared-agent/protected-runtime, full-host/CI, onboarding and clean-instance release gates remain unpassed; Theo's candidate dependency remains.
