# Native Figma setup identity correction — 29 September 2026

Source-only delivery for Elena's reviewed correction. Runtime remains OFFLINE.

## Change and scope

The existing project-UI patch now adds the explicitly selected native-fetched
Figma connection name and credential-policy audience to the native StepHeader.
Curated and generic OAuth entry, starting, redirecting and error screens pass
that identity through; subsequent Access/Sign-in headers do likewise. Native
application branding remains unchanged. Shared, personal and agent audiences
use the existing labels: “Any human in the company”, “Just me”, and “A dedicated
account for an agent”. Names render as React text, not HTML.

The display derives only from `resumeConnection ?? reconnectConnection` and is
scoped to the Figma source template. It does not use the implicit reusable draft,
editable gallery name, or request-supplied ownership flags. A new setup has no
selected identity. Existing loading/missing-connection guards run before these
screens. Selection, intent payloads, grant controls, ownership checks and server
authorization are unchanged; no authentication store is added. This is within
the approved minimal host display extension, not an authorization repair.

## Exact source and output provenance

Host: 2026.916.1 / d554c4789ed3930f8a53ac9fdf6503b3187097da.
ConnectionSetupFlow.tsx baseline SHA-256:
`b6161ab826a5601884c742d5ccae4b7c347b8af0e5c37decfb81eef63b7d61c2`.
Patched source SHA-256:
`56e98332d6fea393dd8a77341afd7368e48564642a766459e4bdbf38dbc93e06`.

`host-prerequisite/setup-identity-staged-provenance.json` records all staged
patch/generator/baseline hashes and unchanged output hashes. The generator
verifies all three pinned native input hashes before applying unique anchors.
Existing source provenance was reused and verified locally, not re-fetched.

The frozen preview SHA-256 remains
`2db67196528809aeb3a675a988672bb6b3dd841f890980d8e45c789d7f1749e5`.
Neither it nor the previous 482-entry diagnostic export includes this change.
`dist/build-provenance.json` was deliberately not relabeled: current
`node scripts/verify-build.mjs` exits 1 with `Prerequisite build is stale`, as
expected after this source-only change. No regenerated bundle, UI, package,
installed output or runtime acceptance is claimed.

## Focused offline verification

Passed:

```
node scripts/build-project-ui-patch.mjs
node scripts/check-draft-selection.mjs
node scripts/check-setup-identity.mjs
node --check scripts/build-project-ui-patch.mjs
git diff --check
```

The new check validates baseline hashes, applies the complete patch in scratch,
parses the entire changed TSX, and renders actual native StepHeader and
OAuthConnectStateScreen code with cosmetic dependencies stubbed. It verifies
explicit identity and audience, all OAuth phases, later setup headers, absent
identity for new setup, non-Figma exclusion and escaping of untrusted names.
The existing selector check preserves explicit paths and other-provider behavior.
This is offline component rendering, not a full host typecheck or browser test.
The strict installed-browser assertions have not been weakened.

## Later staged rebuild and qualification

After Elena coordinates execution: transfer the exact committed inputs, verify
the staged provenance hashes, prepare fresh pinned host source with all approved
prerequisites, and verify the resulting ConnectionSetupFlow.tsx hash above.
Run normal package build/prepack and the coordinated native UI smoke build;
regenerate output provenance and a new complete export inventory from the
successful build. Do not mix old served assets with new source or overwrite the
frozen preview as though it were qualified. Verify served hashes before running
both native ordering cases with new/resume/reconnect visible-identity and exact
intent assertions, then disable/re-enable preservation checks.

The reviewed scope remains zero provider/model/OAuth calls, fresh synthetic
state, existing 3648 MiB aggregate admission, app/browser/probe 1536/768/64 MiB,
no swap, existing CPU limits, 1280 MiB host and 2 GiB disk reserves, dual time
guards and exact owned cleanup. A new build allowance must also explicitly
coordinate the previously evidenced 1792 MiB smoke build and its admission;
this document authorizes neither build nor runtime. All production resources
remain protected. Nadia owns staged rebuild and qualification; Elena coordinates
its bounded window. No new human login or RAM request is needed for preparation.
All remaining release gates and Theo's complete-candidate dependency stay open.
