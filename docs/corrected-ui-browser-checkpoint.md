# Corrected UI smoke and native browser checkpoint — 28 September 2026

Engineering remains incomplete. The authorized corrected build passed once. A real
browser signed in and rendered the Figma connector and native Finish setup controls.
The combined application/browser runtime was then OOM-killed while opening the
project. No Designs interaction, usable consent handoff, release build or release
acceptance pass is claimed. No retry followed the runtime failure.

## Exact inputs and build

- Integration/harness: `b0797eb011509e4ecca427ab3fa4b0610f85ae7f`.
- Host: `2026.916.1` / `d554c4789ed3930f8a53ac9fdf6503b3187097da`.
- Dependency image: `sha256:a02ac35ac41df911af477422ea0e781cf41d2b2c600c66f0a5ac9d8c63f52c2c`.
- Command: `python3 operator/ui-smoke-trial.py`.
- Container command: `NODE_OPTIONS=--max-old-space-size=1024 RAYON_NUM_THREADS=1 VTS_UI_PREFLIGHT_APPROVED=1 node /ui-smoke-build.mjs`.
- The Vite configuration retains production transforms/plugins and disables
  minification, compressed-size reporting and source maps. It is a smoke variation.
  Preserve the immutable image, pinned patched shared source and committed script
  when reproducing externally; the retained source-container ID is daemon-local.

The existing runner verified the exact source container's ownership, stopped state,
image and absence of mounts. Admission at `2026-09-28T01:09:39.302Z` passed with
3,294,117,888 bytes available, complete ancestor evidence, and 6,139,760,640 bytes
free disk. Required memory was 2,952,790,016 bytes (2816 MiB).

Build `63eb5cd3838c02e8f57906309ceb0af6260d370975ff4aa4a9497ac2b35d9ef5`
ran from 01:09:39.357Z to 01:09:57.527Z, exit 0, OOMKilled=false. Supervisor elapsed
19.197 seconds; Vite reported 17.37 seconds. Effective in-container checks passed:
1536 MiB RAM, no swap, 1 CPU, 128 PIDs, old space 1024 MiB. No mounts or network.
Minimum sampled host/ancestor headroom was 2,223,566,848 bytes, above the full
1280 MiB reserve. The 2 GiB disk reserve was retained. Terminal build peak RSS was
not captured. Existing CSS/dynamic-import warnings remain in the evidence.

Probe `af7d15c4aa1a79553c7d6c93cc7f4d9928d686197597da13f27c4290ec71552c`
used 64 MiB/no-swap, 0.25 CPU, 32 PIDs, no network/mounts, read-only root and dropped
capabilities. The supervisor sampled ancestors and stopped the probe after work.
Build and probe are retained stopped. Neither is a production resource.

## Native runtime and browser proof

Verified the retained app, isolated volume and network by exact identifiers and
issue ownership. The app had no socket or production-storage mounts. Preserved
its existing fresh test database/vault and design links. Copied only successful
`/app/ui/dist` output into `/app/server/ui-dist` on the stopped test app: the pinned
native static-server code prefers that directory. No build was repeated.

A run-owned supervisor performed fresh admission before and after copy, checked
1536 MiB/no-swap/1 CPU configuration, sampled daemon/ancestor reserve and disk
approximately every two seconds plus command latency, and had a 600-second bound.
Pre-start available memory was 3,309,293,568 bytes. It used the same owned probe.

The exact app is `c1e1180a6d74c5e690b8d8bd1cad42a975071c2fd06768025ffc3f89c109d90b`
(`vts-figma-test-ui-f62ac13d`), with 256 PIDs and loopback port `3310:3310`.
Volume: `vts-figma-test-source-8ec3a4a7-state`.
Network: `vts-figma-test-source-8ec3a4a7-egress`.

Passed on this resumed app:

- Health and patched static UI HTTP 200.
- Native synthetic account sign-in, company membership and Figma gallery HTTP 200.
- Authenticated attachment read: original ID `e9204aa4-f23e-40ee-8960-15757dbda914`,
  revision 1, one attachment, still unverified. No authority or verification invented.
- Real Chromium native sign-in and Apps rendering: Figma and its inspection-only
  description, existing draft connections, Add account and Finish setup controls.
  No page JavaScript errors observed through that checkpoint. Screenshot saved.

Browser preparation exposed a real missing prerequisite: the installed Playwright
package had no browser binary, then its headless browser lacked system libraries.
Inside the owned test container only, ran the installed CLI:

```
node /app/node_modules/@playwright/test/cli.js install chromium --only-shell
node /app/node_modules/@playwright/test/cli.js install-deps chromium
```

The downloaded browser was Chromium headless shell 151.0.7922.34, Playwright
revision 1234; FFmpeg revision 1011. Package-manager/library output is retained.
This mutable test dependency installation is not a reproducible host-image claim.
Credentials stayed in the private synthetic test account store; cookies stayed in
browser memory. No traces, cookies, OAuth states, passwords or tokens were saved
in evidence. No new managed Connect request or human Figma consent was performed.

The first screenshot captured loading placeholders because network idle preceded
React content readiness. The corrected observation explicitly waited for Figma;
that rendered screenshot is the evidence. It is not a claim that Connect completed.

## Runtime failure and boundaries

While the browser opened the project for Designs verification, its exec exited
137 and the entire combined app/browser container exited 137, OOMKilled=true.
Runtime timestamps: 01:11:28.598Z to 01:15:32.427Z. Terminal cgroup peak was not
captured. The supervisor detected exit and stopped its owned probe. Its minimum
sampled host headroom was 1,725,571,072 bytes and minimum free disk 5,276,086,272
bytes: no sampled breach of the 1280 MiB host or 2 GiB disk reserve. This is an
in-container combined-workload memory failure, not proof that the host reserve
failed or that the successful UI build needs more memory.

All involved processes are stopped; test storage and built UI remain retained.
`http://localhost:3310` is offline. No same-command retry, timer/monitor, compiler,
broad suite, package rebuild, production action, publication or interim Theo wake.
Unrelated `maintenance/` work is preserved. Only documentation is committed here.

## Smallest next action

Reuse the successful UI assets; do not rebuild. Nadia owns separating browser
execution from the app's 1536 MiB cap and preparing the next supervised runtime
proof. Elena owns routing the capacity/placement decision after this failure.
A browser on an independently provisioned test client can use the existing
`ssh -N -L 3310:127.0.0.1:3310 hermes01` route, subject to verified access and an
app-only fresh preflight. That workstation route remains untested. Alternatively,
a separately bounded browser needs its own evidenced headroom; a successful
combined minimum or external-browser budget has not been measured. Do not infer
that increasing the app limit is necessary or authorized.

The eventual human operator must use their own native account/company membership
and managed Figma consent; Elena coordinates that handoff only after a stable
usable access path exists. No credential request or stale OAuth URL is provided.
Designs interaction, human consent, live OAuth/shared-agent/protected-runtime
proof, full-host/CI, onboarding and both clean-instance lifecycle gates remain
unpassed. The task remains blocked with Nadia's concrete technical unblock action.
