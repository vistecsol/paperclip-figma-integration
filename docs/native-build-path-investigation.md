# Native build-path investigation — 27 September 2026

Engineering remains blocked on verification. This answers Elena's 04:09 UTC
request; no new decision, compiler retry, image build or application launch occurred.
Integration input: `1069a07df3dbe7e75060ec5b0017ab3b578c311a`.
Host: `2026.916.1`, `d554c4789ed3930f8a53ac9fdf6503b3187097da`.

## Source correction and preserved gates

Fetched the pinned upstream `server/package.json`, `Dockerfile` and
`tsconfig.base.json` from `paperclipai/paperclip`. The base config matches the
read-only installed copy. **There is no `server/scripts/build.mjs` at this
revision** (HTTP 404); earlier continuation evidence referring to that file is
not applicable source evidence.

The server's maintained `typecheck` script prepares runner vendor output, ensures
SDK build dependencies, then runs `tsc --noEmit`. Its `build` script prepares and
verifies runner vendor dependencies, runs `tsc`, copies assets/vendor output and
writes the build stamp. Docker builds Rust dependencies/runner, UI, SDK and server.
Running only a compiler cannot establish that the other stages passed. Serializing
Rust or workspace tasks avoids overlap, but does not reduce the server's own
reachable type graph.

Installed compiler: TypeScript `7.0.2`, native linux-x64 executable selected by its
Node launcher; binary runtime markers include `go1.26.4`, `GOMEMLIMIT`, `GOGC`.
`node /app/node_modules/typescript/bin/tsc --help --all` exposes these options:

| Option | What remains checked | Limit / disposition |
| --- | --- | --- |
| `--singleThreaded --noEmit -p server/tsconfig.json` | Same project/config and semantic checks; scheduling changes only | Best next narrow trial. Memory benefit unmeasured. Runner/SDK prerequisites still required. |
| `GOMAXPROCS=1 GOGC=50 GOMEMLIMIT=3GiB` with native compiler | Does not disable semantic checks; changes Go scheduling/GC | Proposed tuning only. Soft limit can be exceeded; hard Docker cgroup containment is mandatory. |
| `--incremental` with isolated build-info file | Compiler tracks dependencies and rechecks invalidated inputs | Cold first pass still required; no demonstrated initial-memory benefit. Not selected for the retry. |
| `pnpm --workspace-concurrency=1 -r typecheck` | Retains workspace package scripts sequentially | Avoids concurrent package checks, not server peak; only after the narrow gate. |
| `--noCheck`, emit-only transpilation or hand-picked source subset | Loses full semantic or project coverage | Cannot satisfy the host gate; rejected as a substitute. |
| TS 5/6 replacement, new project splits, changing strictness | Changes compiler/config contract | Not the pinned host check; not selected or silently implemented. |

Go's [GC guide](https://go.dev/doc/gc-guide) documents the CPU/memory tradeoff of
GOGC and the soft nature of GOMEMLIMIT. These controls cannot shrink required live
objects indefinitely and are not an RSS cap. This is a runtime-supported experiment,
not evidence of a lower Paperclip build requirement or of successful containment.

Smallest option check: created one run-owned `sample.ts` containing
`const value: string = 42;`, config `strict:true,noEmit:true,types:[]`. Both default
and `--singleThreaded` compiler invocations exited 1 with TS2322. This confirms the
serial flag is accepted and still reports that semantic error. It is not the
server typecheck and proves no host memory reduction. No product suites repeated.

## Measured capacity and storage

Previous full server attempt: SIGKILL after 78.08 seconds, maximum child RSS
5,728,748 KiB = about 5.46 GiB; OOM counter rose. This is a failed-run observation,
not a successful-build minimum or upper bound. Current `/proc/meminfo` observation:
MemAvailable 3,003,316 KiB = about 2.86 GiB. Rootless daemon reports total memory
8,209,739,776 bytes. No adequate headroom for the proposed trial exists now.

Read-only `docker system df --format '{{json .}}'` reports rounded allocations:
images 7.837 GB, writable container layers 74.6 MB, local volumes 126.6 MB, build
cache 316.5 MB. Reclaimable flags do **not** authorize cleanup; none performed.
Docker root is `/home/paperclip/.local/share/docker`, overlayfs. It is not directly
visible from the agent container, so checkout `df` alone was insufficient.

A fresh isolated probe measured the daemon-backed root overlay with `df -Pk /`:
102,626,232 KiB total, 90,479,876 KiB used, **6,887,092 KiB available**
(7,052,382,208 bytes, about 6.57 GiB). This samples the backing filesystem, not a
reservation or a guarantee against concurrent usage/quota limits.

Probe: `vts-figma-test-storage-4edadadb`, container ID
`da9f1c0460264a3ce689d774db92681bc7b806b178a37aa1030afd91e708980b`;
image `sha256:d74eeac9a635390a49bc21bd49fccd973de707e2a53a76ac49b552b8712ec46f`.
Issue/run labels were checked before removal. Network none, read-only root,
capabilities dropped, no-new-privileges; 1 MiB tmpfs replaces the image's database
volume declaration. No database start, socket or host mounts. Effective limits:
64 MiB RAM, zero swap, 0.25 CPU, 32 PIDs; all memory events zero. Inspect reported
exited with no volume mounts. Removed only this exact verified test ID. No
production container or Compose resource was touched.

Read-only allocated sizes (`du -sx -B1`) from the existing installation:
node_modules 2,578,649,088 bytes; server 146,317,312; packages 207,515,648. These are
reference observations, not a fresh frozen-install footprint; they omit other
workspace content and Rust/compiler caches. No production dependency copy or
mount is proposed. A fresh daemon build needs space for base/toolchain layers,
frozen dependencies, source/context, Rust target and build outputs, image export,
and separate A/B persistent state. Layers may share bytes; simple addition of
image virtual sizes would overstate usage. Exact incremental peak is unmeasured.
The 6.57 GiB available does not establish that a full image build fits.

## Concrete next placement and bounded trial

Nadia's selected next trial is the same full server semantic check, single-threaded,
with GC tuning, in a fresh **named test container** against the pinned patched
source and independently installed frozen dependencies. Proposed limits: 4 GiB
hard memory/no swap, 1 CPU, 256 PIDs, 15-minute foreground timeout;
`GOMAXPROCS=1 GOGC=50 GOMEMLIMIT=3GiB`. Require at least 6 GiB measured available
memory immediately before launch: 4 GiB containment plus 2 GiB proposed shared-host
reserve, with effective ancestor headroom confirmed. These are trial budgets,
not claimed measured needs. Current 2.86 GiB fails that condition. A smaller
unmeasured ceiling is not being used to force a retry now.

After native runner/SDK preparation is separately available and recorded, the
narrow compiler command is `pnpm exec tsc --singleThreaded --noEmit -p
server/tsconfig.json`. Record dependency provenance; do not claim the entire
maintained typecheck script passed if its prerequisite stages did not run.
Verify actual memory/swap/CPU/PID limits and descendant placement before the one
attempt. Capture elapsed time, exit/signal, cgroup peak/events and diagnostics;
stop after failure, with no loop or concurrent heavy stage. Hard limits protect
the host but may cause a cleanly contained OOM; no success is predicted.

For storage, select a test-only filesystem with **at least 12 GiB free as an
initial trial allocation**, explicitly a proposal: the observed dependency tree
is about 2.40 GiB; remaining allocation covers fresh source/tool/base/dependency
variation and intermediate output. Reserve 2 GiB of that allocation as a stop
threshold. Measure actual fresh-install and per-stage growth before each heavy
stage; stop rather than prune or expand implicitly. This does not establish a
12 GiB full-image requirement or sufficiency. Full Rust/image peak must be
measured separately. No alternative location is confirmed. Existing 8 GiB RAM /
30 GiB disk suggestions in `operator/preflight.py` remain conservative legacy
proposal checks, not discovered minimums; that script is not used to validate
this new trial and needs an explicit-budget update before execution.

Elena coordinates a window/placement meeting these trial conditions; Nadia owns
preparing the bounded runner, parameterizing preflight, measuring storage growth,
and performing the one permitted check when headroom exists. No user strategy
question or reviewer approval is needed. Full-host/CI, live OAuth/shared-agent,
protected runtime, browser/onboarding and both clean-instance lifecycle gates
remain unpassed; Theo's evidence remains preliminary.
