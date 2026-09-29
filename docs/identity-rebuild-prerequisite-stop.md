# Identity rebuild prerequisite stop — 29 September 2026

The authorized attempt stopped before Docker resource creation. Qualification is
cancelled by the first-failure rule, not deferred until its start time in this run.
Engineering remains incomplete; access is OFFLINE.

## Inputs and attempted execution

Integration cc61ea1caa512cbfdb4a5097eb37000d9dadaa4f; host 2026.916.1 /
d554c4789ed3930f8a53ac9fdf6503b3187097da. Fresh public archive SHA-256
f7a2049c2f10accc455b50ec4821ff100e0daa53074a23cf05398f83c12f0baa verified.
All recorded native baselines and staged identity input hashes verified; eight
patches applied in fresh local scratch. All 43 host inputs were regenerated.
Patched ConnectionSetupFlow.tsx SHA-256 is
56e98332d6fea393dd8a77341afd7368e48564642a766459e4bdbf38dbc93e06.
Git-preserving transfer retains exact HEAD and no remote. Unrelated maintenance
was excluded. Frozen preview and existing output inventory were not overwritten.

Attempted run d692a2fc-e874-405a-8f9c-500fbce39a8c, Mac directory
/Users/nolan/vts-figma-test/identity-d692a2fc-e874-405a-8f9c-500fbce39a8c:

```sh
VTS_QUALIFICATION_DEADLINE=2026-09-29T17:22:00Z \
 /Users/nolan/vts-figma-test/bin/docker-job /bin/bash \
 /Users/nolan/vts-figma-test/identity-d692a2fc-e874-405a-8f9c-500fbce39a8c/mac-build-job.sh \
 /Users/nolan/vts-figma-test/identity-d692a2fc-e874-405a-8f9c-500fbce39a8c \
 d692a2fc-e874-405a-8f9c-500fbce39a8c cc61ea1caa512cbfdb4a5097eb37000d9dadaa4f
```

The lower/upper guard passed at epoch 1790701138 (16:58:58 UTC), inside
16:57–17:22 execution bounds. My staging command invoked native Mac python3
to replace the smoke script's approved cap assertion. That launcher returned the
Xcode-license error before any probe/build create. No license accepted and no
retry. The Bash 3.2 empty-array cleanup then reported `owned_ids[@]: unbound
variable`, masking the prerequisite status with final exit 1. This is a harness
failure, not a memory/capacity failure. No fresh admission, effective build
limits, output regeneration or new package success is claimed.

Independent read-only Docker query, filtered by exact issue/run labels, returned
no ephemeral containers. Mac-host health returned HTTP 000. No resource cleanup
mutation was necessary. Existing named data, accounts, credentials and links
were untouched; no provider/model/OAuth calls or production actions occurred.

## Correction and checks

The corrected staged job copies a locally prepared ui-smoke-build.mjs instead
of executing Mac Python. Its sole change from reviewed source is the approved
memory.max assertion 1476395008 → 1879048192; Node old space stays 896 MiB.
The transferred supervisor retains the same approved 1792 MiB cap and 3136 MiB
immediate admission. Initial admission remains 3264 MiB; one CPU/no swap,
128 PIDs, 1280 MiB host and 2 GiB disk reserves are unchanged. The corrected
staged job is included in the artifact, but its old epochs are CLOSED and must
be replaced only under a newly coordinated allowance in a fresh directory.

Empty-resource cleanup now uses Bash-compatible guarded array expansion, so
an empty registry preserves the original exit status and performs no Docker
call. Focused mocked cleanup tests pass empty registry, exact owned-resource
removal and foreign-owner refusal. Bash/Node syntax and git diff --check pass.
The corrected full Mac execution remains untested; no claim of Bash 3.2 runtime
validation is made from the local test alone.

## Separate receipts and next action

- Build: stopped at source staging before Docker admission or compilation.
- Installed selector and visible identity: not reached.
- Disable/re-enable lifecycle: not reached. Restart remains outside scope.
- Cleanup/OFFLINE: independent exact-run readback empty; host health HTTP 000.

Nadia owns validating the corrected transfer/empty-cleanup path and the exact
source rebuild in a new coordinated allowance. Elena coordinates replacement
execution; the existing build and conditional qualification allowances are
closed on failure. No new login, extra RAM, license acceptance, cap increase or
product source change is required by this failure. All release gates and Theo's
complete-candidate dependency remain open. No timer or interim QA wake.
