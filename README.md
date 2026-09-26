# Paperclip Figma integration

Engineering preview `0.1.0-alpha.1`. **Not a release candidate or installable
Paperclip plugin yet.** No publication or deployment is authorized.

The repository contains a narrow managed OAuth host prerequisite, isolated test
harness, attachment domain/service/storage implementation and migration. The
invocation-bound bridge, source lifecycle registry and worker definition are
review modules. Host policy/RPC binding and runtime registration remain required
before they can be loaded as a working plugin.

Paperclip target: `2026.916.1`, source
`d554c4789ed3930f8a53ac9fdf6503b3187097da`.
Hermes compatibility reference:
`06a495cc5b1f6baf429e02825103888dfbdf5ec7`.
See [bridge checkpoint](docs/bridge-checkpoint.md),
[API/discovery checkpoint](docs/api-discovery-checkpoint.md),
[attachment checkpoint](docs/attachment-checkpoint.md) and
[OAuth prerequisite](host-prerequisite/README.md).

## Local checks

Node >=24.11.0; the core package has no dependencies.

```sh
npm test
npm run check
npm pack --pack-destination "$PAPERCLIP_RUN_SCRATCH_DIR"
```

This packs an engineering preview for source review; it does not install a
connector. The package intentionally has no invented plugin manifest or
unsupported installation command. Use the pinned prepared Paperclip source and
its normal dependencies for host tests:

```sh
node scripts/prepare-host-proof.mjs /path/to/pinned-paperclip
FIGMA_INTEGRATION_ROOT="$PWD" /path/to/pinned-paperclip/node_modules/.bin/vitest run --root "$PAPERCLIP_RUN_SCRATCH_DIR/host-proof/server" src/__tests__/figma-attachments-database.test.ts
```

Use a fresh run scratch directory. The helper refuses to overwrite an existing
proof tree. Synthetic database fixtures establish neither live login nor
multi-agent shared access. See the checkpoint for deferred release gates.

No third-party skill files are redistributed. Official skill pinning/onboarding
and project UI remain to be implemented. Package naming is provisional; registry
availability and publishing ownership are unverified.
