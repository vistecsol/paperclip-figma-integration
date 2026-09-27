# Isolated-test operator bundle checkpoint

Engineering remains incomplete. This applies the answered runtime-placement
interaction following board verification at integration
`390237813607907526539753532cde0580ea8bc6`. The resulting commit, final tarball
SHA-256 and inventory are recorded on the engineering issue.

Host target remains `2026.916.1` / `d554c4789ed3930f8a53ac9fdf6503b3187097da`.
The exact upstream archive SHA-256 is
`f7a2049c2f10accc455b50ec4821ff100e0daa53074a23cf05398f83c12f0baa`.

## Delivered

- `operator/prepare-context.mjs` prepares a complete offline build context from
  the digest-verified upstream archive and preview tarball, verifies every
  recorded source baseline, applies the seven approved patches, and checks the
  packed services/assets and compiled outputs. It refuses drift or reuse of an
  existing destination. No `/app` dependency links or production data copies.
- The appended test-image stage retains native build/entrypoint behavior,
  carries the npm plugin at `/opt/figma-candidate`, and explicitly includes the
  JS domain asset that native tsc does not emit. No running source is patched.
- `operator/compose.json` uses a distinct project/network/volume, loopback port,
  authenticated/private origin, no restart loop, hard memory/swap limits and
  native embedded PostgreSQL/local-encrypted vault. Fresh signing secrets are
  generated only on an approved first boot and retained privately in that volume.
- Runbook covers operator preflight, bounded native BuildKit execution, image
  ID recording, browser tunnel/OAuth origin, native plugin installation and
  managed setup, separate clean instance B, health, stop and rollback preserving
  design links. Physical volume deletion is deliberately not in cleanup.

## Checks and commands

Smallest checks first: `node --check operator/prepare-context.mjs`,
`node --check operator/start.mjs`, Python syntax and `git diff --check` passed.
Normal `npm pack --pack-destination "$PAPERCLIP_RUN_SCRATCH_DIR" --json` invokes
normal prepack syntax, package tests and build-integrity checks; no hooks bypassed.
No product code changed; native gateway/worker/database suites were not repeated.

Downloaded official Docker Compose v2.39.4 executable solely for offline config
parsing; SHA-256 matched the release checksums file:
`7af95166a730b87e172d4fc9aefea8725d3c6c7327d59149267b452114ddb7d4`.
No Docker daemon is available in this execution container.

`docker-compose -f operator/compose.json config --format json` passed for A/B
synthetic non-secret configurations. Assertions confirmed loopback ports
4310/4311, distinct named networks/volumes, equal hard memory/swap totals
4294967296, no external database or signing-secret environment inheritance.
Missing required configuration was rejected. The all-zero image ID was a
parse-only fixture, never claimed to exist or started.

Initial assertion compared Compose's normalized memory string to an integer;
corrected the assertion to parse the numeric value. The Compose parse itself
succeeded. This was a validation-harness correction, not a runtime test pass.

`node operator/prepare-context.mjs SOURCE_ARCHIVE CANDIDATE SHA256 NEW_CONTEXT`
passed on the actual pinned complete source and packed preview. Checked source
archive/baselines, patches, retained upstream Dockerfile and exact domain asset.
A wrong candidate digest was rejected before creating the destination; existing
context reuse was rejected without altering it.

`python3 operator/preflight.py --phase build --limit-gib 8` produced a read-only
capacity observation and correctly exited 1: this is inside a container, visible
headroom is below the proposed limit-plus-reserve, and visible free disk is below
the 30 GiB preparation budget. This is not hermes01 host-placement proof. The
script reads no secrets or process command lines. No compiler attempt occurred.

## External prerequisite and acceptance limits

Elena owns an actual hermes01 operator decision: verify host-wide memory/disk,
sequence shared capacity, approve a bounded build placement, select/pin BuildKit
image and tools, and confirm the isolated browser/OAuth access path. The proposed
8 GiB build and 4 GiB runtime ceilings are not tested resource requirements.
A sibling container does not create memory. Nadia owns configuring and proving
the host/plugin once that decision is resolved.

Dockerfile has upstream moving base/OS/CLI inputs; source pinning does not imply
a reproducible host image. Record resolved image/tool revisions. The npm package
is separately reproducible. Full host/CI checks, actual cgroup containment under
compiler load, image build/health, browser HTTP, real OAuth/shared eligible-agent
sessions, protected runtimes, full onboarding and both clean-instance lifecycle
checks remain deferred/unpassed. No live setup card, deployment, publication,
paid change, RTS access, canvas edit, new task or timer is claimed.
