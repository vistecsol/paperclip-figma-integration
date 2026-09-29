# Paperclip Figma integration

Engineering preview `0.1.0-alpha.1`; **not a release candidate**. No publication
or deployment is authorized. The package now has a native manifest and bundled
worker. Its attachment RPC has been exercised through the actual loader, SDK,
host services and isolated PostgreSQL. Complete clean-instance lifecycle acceptance remains unproven. Managed OAuth and one fresh employee run passed; see docs/candidate-consolidation.md for current limits.

Paperclip target `2026.916.1` / `d554c4789ed3930f8a53ac9fdf6503b3187097da`
requires the explicit reviewed host prerequisites. The package does not patch
host source. Unpatched hosts are rejected. Agent access checks now require a matching native managed gateway session; board access checks require native tools permission and explicit employee selection.
The native Designs UI is implemented and tested in isolation. Runtime source delivery now has isolated host/database and shared-renderer proof;
One fresh legacy employee run loaded the pinned skill and retrieved context/screenshots. Multi-agent, protected-runtime and complete onboarding acceptance remain open.

See [board/runtime checkpoint](docs/board-runtime-checkpoint.md),
[connector setup checkpoint](docs/connector-setup-checkpoint.md),
[inspection checkpoint](docs/inspection-checkpoint.md),
[source/onboarding evidence](docs/source-onboarding-checkpoint.md),
[UI/recovery evidence](docs/ui-recovery-checkpoint.md),
[RPC/package evidence](docs/rpc-package-checkpoint.md),
[draft runbook](docs/draft-runbook.md) and
[OAuth prerequisite](host-prerequisite/README.md).

## Build and review

Use the pinned host's dependencies and a fresh run scratch directory:

```sh
node scripts/prepare-host-proof.mjs /path/to/pinned-host proof
node scripts/build.mjs "$PAPERCLIP_RUN_SCRATCH_DIR/proof"
npm pack --pack-destination "$PAPERCLIP_RUN_SCRATCH_DIR" --json
```

Prepack runs syntax/whitespace, package tests and build-integrity checks. No
credentials or deployment URLs are packaged. Node >=24.11.0 and pinned esbuild
0.28.2 are required for build; the worker bundles its runtime dependencies with
[license notices](THIRD_PARTY_NOTICES.md). The official Figma skill has a [pinned import reference](docs/official-skill-pin.json);
it is not redistributed or installed by this preview. The package name is provisional.

The required full host typecheck was killed with exit 137; host build/CI and live
OAuth/shared-agent/lifecycle gates have not passed. See the checkpoint for exact
commands, corrected harness failures and all remaining limitations.
