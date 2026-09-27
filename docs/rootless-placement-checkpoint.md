# Rootless placement checkpoint — 27 September 2026

Access authorization is resolved; engineering and release acceptance remain incomplete.
Host target: `2026.916.1` / `d554c4789ed3930f8a53ac9fdf6503b3187097da`.
Integration input: `7aaf51d9bf1a0d8380bee3750da65d1ac7038d7f`.

## Actual evidence

Docker client `26.1.5+dfsg1`, server `29.8.0`; default endpoint
`unix:///var/run/docker.sock`, rootless security option, cgroup v2/systemd.
Daemon reports 8 CPUs and 8,209,739,776 bytes total memory.
At 03:36:04 UTC, `python3 operator/preflight.py --phase build --limit-gib 8
--reserve-gib 2` refused the build: available memory 3,195,830,272 bytes,
visible effective headroom the same, free workspace disk 7,063,187,456 bytes.
The agent is inside a container, so ancestor/daemon storage headroom is not fully
established. Even total reported RAM is below the proposed build plus reserve.
No compiler, image build or application start was attempted. No smaller budget
was silently substituted after the earlier measured compiler peak of 5.46 GiB.

One sequential, short containment probe used the already available image
`sha256:d74eeac9a635390a49bc21bd49fccd973de707e2a53a76ac49b552b8712ec46f`
with its entrypoint overridden to `/bin/sh`; PostgreSQL was never started.
Container `vts-figma-test-containment-c36e2155`, ID
`6a352fe318dd4fc96a6ebec5ed2b33775e40862b45aa7da41e6fbf52e745be0e`, carried
issue/run ownership labels. Flags: `--network none --memory 64m --memory-swap
64m --cpus 0.25 --pids-limit 32 --read-only --cap-drop ALL --security-opt
no-new-privileges`. No host bind mounts or socket were supplied.
Reading cgroup files from that test process returned:

- memory.max: 67108864; memory.swap.max: 0
- cpu.max: 25000 100000; pids.max: 32
- memory.events: all zero; process exit: 0

This proves small-container containment only, not native build descendant
containment. The image's declared VOLUME unexpectedly created fresh anonymous
volume `109e156ad1207863fe1d794e86d1b45664b962ab077fa52dfcf1815926ae0ac7`.
A filtered container listing confirmed only the probe referenced it. After
verifying the exact container's labels and exited state, `docker container rm
-v 6a352fe318dd4fc96a6ebec5ed2b33775e40862b45aa7da41e6fbf52e745be0e`
removed that probe and its fresh volume. Future probes must override image
VOLUME destinations with tmpfs or use a volume-free image. No production
container was exec'd into, attached, stopped, restarted or changed.

## Operator changes and remaining work

Compose A/B names now use `vts-figma-test-*`, with an explicit app container
name and issue/purpose labels on containers, volumes and networks. Historical
Buildx commands generating a differently prefixed container are withdrawn.
A compliant explicitly named builder remains to be prepared when capacity is
available. No test login origin is live. The localhost tunnel remains a proposal.

Elena coordinates a capacity/storage placement or an evidenced reduced build
strategy; Nadia then verifies headroom, builds with effective descendant limits
and prepares the actual managed login route. No production cleanup, limit change,
purchase or new scope is requested. Full-host/CI, live OAuth/shared-agent,
protected-runtime, browser, onboarding and both clean-instance lifecycle gates
remain unpassed. Theo's complete-candidate review remains dependent.
