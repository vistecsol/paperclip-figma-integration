# Engineering consolidation — 29 September 2026

Revised engineering preview 0.1.0-alpha.1, not a qualified release candidate.
Host: 2026.916.1 / d554c4789ed3930f8a53ac9fdf6503b3187097da.

The pinned native ConnectionSetupFlow selector now rejects implicit reuse for
Figma in initial and post-refetch selection. Existing accounts require explicit
resume/reconnect; Add account cannot silently choose another personal draft or
an unintended shared account. Server identity guards remain unchanged. Other
providers preserve native behavior. The source matched exact upstream bytes.

Focused patched-selector execution and project create/configuration DOM checks
passed. The latter preserves the GitHub payload and exercises actual attachment
transitions with simulated transport. Installed selector intent/identity is now evidenced in both native orderings; see consolidated-selector-lifecycle-result.md for diagnostic limits.
Provenance now includes the project-UI patch and supplied UI components. The
rebuilt domain includes the previously committed atomic rebind command.

| Gate | Evidence/limit |
| --- | --- |
| OAuth/inspection | Shared managed consent and board reads passed; native fixed policy denies write/destructive/new tools |
| Real association | Rebind preserved fields and advanced revision 2 to 3 |
| Fresh employee | Run e6af310d-59c0-4a5e-b33c-0c9c04aa57d6 succeeded as Adam, fresh workspace/session, pinned skill, source revision 3, four reads |
| Native browser | Create/configuration persistence and worker-enabled synthetic Designs reload passed |
| Onboarding | Pinned bytes and additive preservation/replay passed; native GitHub audit rejected |
| Revised packaging | Normal prepack and repeat build/pack results attached to issue |
| New selection behavior | Installed new/resume/reconnect intent and visible identity passed in both native orderings; writes intercepted, service workers blocked for this diagnostic |
| Concurrent employees/protected runtime | Deferred; one legacy employee does not prove these |
| Live refresh/revocation/grant removal | Deferred |
| GitHub association coexistence | Native saved repository and three synthetic design links persist together; GitHub authorization is not proved |
| Full host typecheck/build/CI | Unpassed; prior OOM, no retry here |
| Lifecycle | Native disable denies keyed reads/writes; re-enable preserves exact three-link/revision/repository snapshot. Restart/upgrade/uninstall/rollback and two-instance matrix remain deferred |
| Independent review | Theo waits for complete candidate; no interim wake |

The live four-call allowance is exhausted and app remains offline. Adam has no
further action for the completed test. Nadia owns technical qualification; Elena
coordinates further bounded live scope. No vendor endorsement or wider host
range is claimed. See draft-runbook.md for host prerequisites, native install
and rollback preserving links; the npm package never patches the running host.

Reproduce using pinned host dependencies (esbuild 0.28.2), isolated patched SDK,
node scripts/build.mjs PREPARED_HOST, then normal npm pack --json. Affected checks:
node scripts/check-draft-selection.mjs PINNED_HOST and
node scripts/check-project-ui.mjs PINNED_HOST.

Initial scratch setup filtered out SDK patch paths and then lacked SDK dependency
links. Builds refused those configurations; prepack refused stale outputs. Both
were corrected in scratch without disabling checks. No Docker, full-host compiler,
provider call or production action. Exact implementation commit, archive digest
and inventory are recorded outside the tarball to avoid self-reference.

Latest bounded zero-provider receipts: [consolidated selector/lifecycle result](consolidated-selector-lifecycle-result.md). These do not qualify the full release.

## Retention qualification handoff

See [exact remaining lifecycle protocol](lifecycle-retention-protocol.md).
Restart, upgrade, rollback, soft-uninstall/restore and second-instance receipts
remain deferred individually. Same-version diagnostic packages cannot prove an
upgrade. Native local installation is evidenced; standalone built-host portability
is not. Offline receipt assertions reject missing snapshots, changed references,
same-version transitions and shared instance storage; they are not runtime proof.
