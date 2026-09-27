# hermes01 isolated Figma test operator bundle

Prepared only. No container, image, database, OAuth setup or compiler run is
implied by this bundle. Elena owns the remaining launch/capacity decision.
Nadia owns host/plugin configuration and test execution once a placement is
approved. Do not execute build/start steps until that decision is saved.

## Exact inputs and isolation

Host: Paperclip `2026.916.1`, source
`d554c4789ed3930f8a53ac9fdf6503b3187097da`, archive digest in
`source-pin.json`. Seven reviewed host prerequisite patches are applied to a
fresh complete source export. This is an explicitly patched host, not an npm
installer patching production. Integration base: `390237813607907526539753532cde0580ea8bc6`;
the operator checkpoint records its resulting revision and tarball hash.
The npm `0.1.0-alpha.1` package is still an engineering preview.

Use only a host-side operator-owned directory, e.g. `/srv/vts-figma-test`, with
mode 0700. Do not mount `/app`, the production volume, Docker socket, agent
homes, SSH material, production config or provider credentials into the test
container. The dedicated Compose project owns its own bridge network and named
`state` volume; the native embedded PostgreSQL, assets and managed vault live
there. The test-only startup wrapper generates fresh signing secrets once with
0600 permissions. The native local-encrypted vault generates its own master
key. No secret values are in Compose, image layers or the handoff bundle.
The inherited native entrypoint drops privileges and owns the data directory.

Runtime is authenticated/private. Only loopback `127.0.0.1:4310` is published.
For the first test, the browser origin is `http://localhost:4310`; from the
operator workstation establish `ssh -N -L 4310:127.0.0.1:4310 hermes01`, then
keep that tunnel open through OAuth. Use a separate browser profile for the test
instance to avoid sharing localhost cookies with any existing instance. This is a proposed access path, not proven
Figma redirect compatibility. A browser local to hermes01 uses the same origin.
Use a distinct approved HTTPS test origin if Figma rejects loopback; record the
exact rejection and return to Elena for routing/TLS approval. Never change the
production proxy or reuse its origin silently. Server egress must reach the
native OAuth discovery/issuer endpoints and `https://mcp.figma.com/mcp`.

## 1. Prepare and validate — no service launch

Unpack the review bundle; retain its SHA-256 and package inventory. From its
integration root, use Node 24.11+, Python 3, curl, git and tar:

```sh
curl -fL --output paperclip-source.tar.gz https://codeload.github.com/paperclipai/paperclip/tar.gz/d554c4789ed3930f8a53ac9fdf6503b3187097da
node operator/prepare-context.mjs paperclip-source.tar.gz candidate.tgz CANDIDATE_SHA256 fresh-context
```

Replace `CANDIDATE_SHA256` with the checkpoint's exact digest. The script checks
both archives, all recorded source baselines, patch application, packed host
prerequisites and bundled outputs; it refuses an existing output directory.
It never links `/app/node_modules` or copies instance data. Store
`fresh-context/figma-context.json` with the evidence. The extra Docker stage
copies `figma-domain.mjs` explicitly because upstream TypeScript does not emit
this JS-only runtime asset. The original production build stages remain intact.

Copy `test.env.example` outside the repository as `test.env`; fill the final
image ID after a successful build. All values are non-secret. With Docker
Compose v2 on the operator host, validate before launching:

```sh
docker compose --env-file test.env -f operator/compose.json config --quiet
```

Do not use an inherited shell full of production overrides; only `FIGMA_TEST_*`
variables configure this bundle. No `DATABASE_URL` or provider key is inherited.
A config parse proves structure, not image availability, port availability,
permissions, startup or OAuth. Verify port 4310 is unused with `ss -ltn` and
verify the project/volume name is unused with `docker compose ls` and
`docker volume inspect vts-figma-a_state` (expected not found for a clean test).
Existing volume means stop and choose a new authorized name; never clear it.

## 2. Capacity and bounded build — Elena decision required

A sibling container adds no RAM. The exhausted compiler is not retried in the
shared agent container. On hermes01 itself, record:

```sh
python3 operator/preflight.py --phase build --limit-gib 8 --reserve-gib 2 > build-preflight.json
docker stats --no-stream --format '{{.Name}} {{.MemUsage}} {{.PIDs}}'
docker info --format '{{.CgroupVersion}} {{.CgroupDriver}}'
```

A nonzero preflight means stop. It records MemAvailable, visible ancestor
limits/events and process RSS without command lines or secrets. An 8 GiB build
ceiling plus 2 GiB free reserve is a conservative proposal, not a measured
requirement or reservation. Elena must sequence it with VTS/RTS/system load;
insufficient capacity requires another approved placement/window, not a larger
limit on the existing server. Free disk check uses 30 GiB as a preparation
budget; actual full host build/cache usage is unmeasured.

After an explicit approved window, use a dedicated BuildKit container with a
hard cgroup ceiling for native compiler descendants, no extra swap allowance,
and one build step at a time. Docker documents `memory` and `memory-swap` driver
options at https://docs.docker.com/build/builders/drivers/docker-container/.
Pin the operator-reviewed BuildKit image digest as `BUILDKIT_IMAGE` before this
step; that digest and Docker/Buildx versions are still external prerequisites.

```sh
docker buildx create --name vts-figma-proof --driver docker-container --buildkitd-config operator/buildkitd.toml --driver-opt "image=$BUILDKIT_IMAGE,memory=8g,memory-swap=8g,cpu-period=100000,cpu-quota=200000,restart-policy=no"
docker buildx inspect vts-figma-proof --bootstrap
docker inspect buildx_buildkit_vts-figma-proof0 --format '{{.HostConfig.Memory}} {{.HostConfig.MemorySwap}} {{.HostConfig.CpuQuota}}'
```

Require memory and swap totals of `8589934592`, and quota `200000`. Also inspect
that builder's `/sys/fs/cgroup/memory.max` and `memory.events` through a read-only
`docker exec` before/after building; refuse missing/ineffective limits. Observe the native compiler PID and its `/proc/PID/cgroup` during the approved
build; verify its cgroup is beneath the measured hard ceiling. Stop if the build
executor escapes that hierarchy. Never
use only `NODE_OPTIONS` as the containment mechanism. Stop the test runtime
while building; do not run the build and test concurrently.

```sh
docker buildx build --builder vts-figma-proof --target figma-test --load --tag vts-figma-test:review --file fresh-context/Dockerfile.figma-test --build-arg PAPERCLIP_BUILD_COMMIT=d554c4789ed3930f8a53ac9fdf6503b3187097da --build-arg PAPERCLIP_BUILD_VERSION=2026.916.1 --build-arg FIGMA_INTEGRATION_REVISION=INTEGRATION_COMMIT --build-arg FIGMA_PACKAGE_SHA256=CANDIDATE_SHA256 fresh-context
docker image inspect vts-figma-test:review --format '{{.Id}} {{json .Config.Labels}}'
docker buildx stop vts-figma-proof
```

Replace the two uppercase revision/hash placeholders. Save build exit, elapsed
time, OOM event changes, image ID, platform, resolved base images and tool versions.
Set `FIGMA_TEST_IMAGE` to that immutable local `sha256:` ID; pull policy is never.
Upstream Dockerfile includes moving OS/base/CLI inputs (`@latest`); exact source
pins alone do not make this host image reproducible. Record resolved versions;
no bit-for-bit host image claim. npm reproducibility is a separate recorded check.
No push/publication occurs. Image build is not the required host test/CI pass;
run the maintained required checks only in the separately approved bounded
placement and record them separately. Failure leaves release gates unpassed.

## 3. Start, bootstrap and managed setup — after launch approval

```sh
python3 operator/preflight.py --phase runtime --limit-gib 4 --reserve-gib 2 > runtime-preflight.json
docker compose --env-file test.env -f operator/compose.json up -d --no-build --pull never
docker compose --env-file test.env -f operator/compose.json ps
docker compose --env-file test.env -f operator/compose.json exec paperclip cat /sys/fs/cgroup/memory.max
curl --fail http://127.0.0.1:4310/api/health
```

Require runtime `memory.max` of `4294967296` for the example 4g budget. Confirm
Docker inspect reports the intended loopback port, distinct network and sole
state volume, with no production mounts. Health proves only server health. If
initial startup fails, preserve redacted diagnostics and stop; no restart loop.
Use the browser to sign up and claim this fresh authenticated/private instance
through native first-admin setup. Do not paste bootstrap links or cookies into
tickets. Create only the authorized VTS test company/project/employees. Configure
agent authentication via supported managed setup separately; no credentials are
copied from hermes01, VTS production or RTS. Lack of eligible model-runtime
credentials remains a real prerequisite for fresh-agent proof.

Install through native instance-admin Plugins using local package directory
`/opt/figma-candidate` (`POST /api/plugins/install` with
`{"packageName":"/opt/figma-candidate","isLocalPath":true}`), then company-enable
through native controls. The supported API/UI handles authorization; do not
change hosted install policy to force the install. If local-path install is
disallowed in the chosen runtime, stop and report it. Never edit database rows
or auto-install via a new bypass script.

Use Apps → Figma managed setup card for the consenting VTS identity, approve
only inspection tools and eligible employees, and record the actual client,
callback origin and allowed shared-use result without credentials. Attach test
links in Designs. Board access check requires tools permission and explicit
employee selection. Test two fresh eligible employee runs, source/skill visibility,
context/screenshots, grants/revocation/refresh, protected runtimes and no canvas
writes. Record actual browser HTTP outcomes. These are all deferred today.

## 4. Stop, rollback, second instance and cleanup

```sh
docker compose --env-file test.env -f operator/compose.json stop
```

This preserves database, vault and design links. Before upgrade, take an approved
consistent backup of this test volume only (stop first), including its managed
key; keep that backup private rather than uploading it as evidence. Remove Figma
grants/installations and disable the company plugin through native controls to
remove execution. Uninstall must preserve namespace data and design links; do
not enable destructive schema-removal options. Revert only to a previously
tested compatible image/plugin pair. No compatible older pair has passed yet.
Never roll back schemas or delete associations as a recovery shortcut.

For test B, stop A, use a separate `test-b.env` with project `vts-figma-b`, port
`4311`, origin `http://localhost:4311`, a new SSH tunnel, and a fresh named volume.
Repeat installation and managed setup without sharing A's database, vault or
credentials. A second fresh volume does not itself prove a second successful
installation; collect the full lifecycle evidence on both.

After evidence/retention review, `docker compose ... down` removes only that
project's stopped containers/network and retains its state volume. Do not pass
`--volumes`, prune, or remove the named volume; links and the vault must survive.
`docker buildx rm --keep-state vts-figma-proof` removes the dedicated stopped
builder while retaining its cache. Physical data deletion needs a separate
retention decision and is deliberately absent. Restore/restart, native uninstall
retention, and both clean-instance lifecycles remain acceptance gates.
