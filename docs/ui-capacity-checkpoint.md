# Bounded UI recovery checkpoint — 27 September 2026

The authorized heavy UI attempt was skipped. Engineering is incomplete.

Input integration revision: `a6abb13403d111564e3952de0f6caed0c0a5925e`.
Host: `2026.916.1` / `d554c4789ed3930f8a53ac9fdf6503b3187097da`.
Dependency image: `sha256:a02ac35ac41df911af477422ea0e781cf41d2b2c600c66f0a5ac9d8c63f52c2c`.

## Preparation

Fetched the pinned upstream `ui/vite.config.ts` and compared it with the local
read-only source. Both SHA-256 values are
`00623aabebff01f309706f40f6dfe93eb0e14d3c235c8804a0bf4e1ea14247fc`.
The configuration selects esbuild minification, production console/debugger
removal, React/Tailwind/service-worker plugins and source aliases. It does not
explicitly enable source maps. The prior failure occurred during chunk rendering.

`operator/ui-smoke-build.mjs` prepares a programmatic Vite build that retains the
pinned config and production mode, but disables output minification and compressed
size reporting, and explicitly disables source maps. This is a browser-smoke
variation, not the maintained release build. Its memory benefit is unmeasured;
no Vite execution or generated UI artifact is claimed. Both new scripts pass
`node --check`; `git diff --check` passes. Product suites were not repeated.

Future invocation inside a fresh owned build container, after the external gate:
`NODE_OPTIONS=--max-old-space-size=1408 RAYON_NUM_THREADS=1 VTS_UI_PREFLIGHT_APPROVED=1 node /ui-smoke-build.mjs`.
The entrypoint checks effective 2048 MiB/no-swap, 1 CPU, 128 PID limits and a
2 GiB disk stop reserve. The environment flag is a guard against accidental
invocation, not independent headroom proof. Before execution, a supervising
operator must verify fresh host/ancestor evidence, monitor the 1280 MiB host
reserve and disk reserve throughout, stop the exact owned build on breach, and
capture terminal memory/events/exit and elapsed time. That supervisor and a
successful bounded build remain unproven. No automatic launch or retry exists.
Use the retained test build's patched shared source, verified by labels and input
revision, with the immutable image dependencies; mount no production storage.
Keep all test apps stopped during compilation. Never run a production Compose
command or touch protected production containers.

## Daemon-side measurement

Docker reports hermes01, rootless 29.8.0, cgroup v2/systemd. Exact retained login
`c1e1180a6d74c5e690b8d8bd1cad42a975071c2fd06768025ffc3f89c109d90b`
and prior UI build
`6f337790ad0aac496a44a5e4ffa82aeda6ebe231a6616674f5aecb94baf4b91c`
were checked for VIS-6/run ownership and both remain exited.

A fresh probe ran with no network, no mounts, read-only root, dropped capabilities,
no-new-privileges, user node, direct node entrypoint, and host cgroup namespace.
The namespace exposes ancestor counters without mounting or changing them.
Only this new test process was started. Effective limits were 67,108,864 bytes
RAM, zero swap, `cpu.max=25000 100000`, 32 PIDs. Probe own memory peak at sample
was 10,731,520 bytes, all own OOM events zero; this is not a terminal peak.

At `2026-09-27T06:20:27.526Z`:

- Daemon-host MemAvailable: **3,252,764,672 bytes = 3102.08 MiB**.
- Required: **3,489,660,928 bytes = 3328 MiB**.
- Shortfall: **236,896,256 bytes = 225.92 MiB**.
- Every ancestor through `/user.slice/user-1002.slice/user@1002.service/user.slice`
  to cgroup root was inspected; finite ancestor memory limits did not reduce
  available headroom. The probe's own ceiling is excluded from sibling headroom.
- Daemon-backed free disk: **6,591,172,608 bytes**; above the 2 GiB stop reserve.
  This does not prove a complete image build fits.
- Decision: **skip-heavy-run**. No build, compiler, runtime restart, or browser run.

Retained stopped probe: `vts-figma-test-ui-capacity-b7cdf730`, ID
`021ef9afbda312212c411a964d26c25687ea8351219cb558eefb2e71873862a6`.
Run ownership: `b7cdf730-2dcd-4d46-8631-bc73e10d88da`.
Two small probe setup errors were corrected: Docker cannot copy into a read-only
rootfs; then the image entrypoint could not drop privileges with all capabilities
removed. Direct `--user node --entrypoint node` plus module text in argv resolved
both. The two failed probes were individually label-verified and removed; their
IDs and failures are retained in the JSON artifact. No heavy attempt was consumed.

## Disposition

Elena owns coordination of a window satisfying the existing measured gate.
Nadia owns rechecking capacity, completing supervision, and the one UI trial
when that gate passes. No higher budget, reserve reduction, cleanup of unrelated
resources, pending human question or timer is requested. No interim Theo wake.

The corrected localhost:3310 runtime stays offline; test state and design links
are retained. No usable consent URL is published. Browser acceptance, human OAuth,
shared-agent/protected-runtime proof, full-host/CI, onboarding and both clean-instance
lifecycle gates remain unpassed. No production action or package publication.
