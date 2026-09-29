# Distinct unpublished lifecycle pair and upgrade/rollback driver

29 September 2026. Nadia; engineering incomplete. Restart and immediate
soft-uninstall/restore evidence remains passed; it was not repeated.

## Actual artifacts and provenance

Normally built test-only versions from integration revision
`1209c9c41027496b08c3a74eb66807331636ac58` (full revision in version-pair.json), host
`2026.916.1 / d554c4789ed3930f8a53ac9fdf6503b3187097da`, arm64 dependency image
`sha256:4e2e1e59219129a4b687cd54ba439fb7fed0a5710af9f1551277dedd23dc61f1`.
SDK inputs were copied into fresh staging, baseline checked, then the committed
SDK RPC patch applied. No production tree was modified or mounted.

| Version | Tarball SHA-256 | Contents |
| --- | --- | --- |
| 0.1.0-lifecycle.1 | c911989969ab93504e55a165b0e59a0f63244d58e93bc54b934f5fba44268d8a | 251 files |
| 0.1.0-lifecycle.2 | 9139da168f9b846e3baf670056961017d014d944f1c24f725315374994ad52f7 | 251 files |

These are unpublished qualification fixtures, not replacements for the frozen
preview or release candidates. Each source checkout changes package.json and
src/manifest.mjs BEFORE `node scripts/build.mjs /app` and ordinary `npm pack`.
Normal prepack checks/tests and build integrity passed in each changed version;
no ignore-scripts, post-pack manifest editing, hook bypass or UI rebuild.
Extracted package/manifest versions agree. Full per-file inventories are in
version-pair.json. Same manifest ID/schema/capabilities; migrations, worker and UI
are byte-identical. This pair proves a real version transition can be tested
without inventing a schema migration; it does not test destructive migrations.
Each version was built once successfully; same-version reproducibility is not
claimed. Required normal prepack runs are not independent release CI evidence.

Retained Mac output directory:
`/Users/nolan/vts-figma-test/pair-corrected-553f80a6-932e-4819-9d12-575a5786e2f2/outputs`
Use a fresh staging directory for the next session; these outputs are immutable inputs.

## Bounded build outcome

One session began 22:02:57 UTC, work deadline 22:22:57, cleanup hard stop
22:27:57. First launch failed before compilation: host cgroup namespace exposes
limits below /sys/fs/cgroup plus /proc/self/cgroup, not at the mount root.
Corrected this routine defect, validated against the actual captured probe path,
and continued with changed code inside the SAME deadline. No unchanged retry.

Corrected build 22:04:11.903–22:04:15.694 UTC, exit 0, OOMKilled=false.
Admission complete ancestor headroom 7,593,738,240 bytes; disk 907,223,408,640.
Build 1408 MiB/no swap/one CPU/128 PIDs; Node old space 896 MiB; effective
cgroup limits checked. Peak 148,250,624 bytes; zero max/OOM/kill events.
Full 1280 MiB host and 2 GiB disk reserves retained. Builder and probe had
network none, no mounts, no credentials or provider calls. No app was launched.

Exact corrected build `fe51b9415d60fb436d3086cf451e69b811934a785257af7629910b064922542e`
and probe `3125aa9968186314f401b582e46751dffd5697f7a6f64fe3029ef33583af0eb7`
were ownership-checked and removed after exporting artifacts. Run-filtered
Docker events record their destruction; independent readback is empty. Initial
failed resources were also removed. Retained human state/design links untouched.

## Prepared transition driver and focused checks

`operator/run-upgrade-rollback-session.sh` reuses the proved internal-network
fixture, scoped SQL collector, exact ownership/mutation guards and cleanup.
It does not rerun selector, disable or uninstall cases. It runs baseline,
upgrade and rollback, stopping/re-admitting a NEW app between distinct versions
while preserving only its own fresh synthetic volume/network.

`stage-version-package.sh` pins these exact tarball digests and refuses foreign
or running targets, including under set +e. `qualify-version-transition.mjs`
checks every extracted file and selected tarball before any API mutation; calls
the native `/api/plugins/:id/upgrade` route; checks registry version, ready state,
full keyed API data, independent scoped storage, configuration, migrations,
namespace/IDs and GitHub workspace equality. Same-version transitions fail.
The rollback calls that same native route with the old package/version; if the
host rejects downgrade, report unsupported and preserve state, never reverse SQL.

Focused actual-driver checks against the built artifacts passed at a simulated
native API/storage boundary: baseline→upgrade→rollback, retained-link corruption
refusal and installed-worker tamper refusal. Actual staging shell tests passed
foreign/running refusal and exact created-target copy under set +e. Node/Bash
syntax and whitespace passed. These do NOT certify native runtime upgrades,
worker replacement, actual SQL, migration execution or two-instance portability.

## Exact next executable step — Nadia, no new user decision

Stage `run-upgrade-rollback-session.sh`, `stage-version-package.sh`,
`qualify-version-transition.mjs`, the pair JSON/tarballs and existing retained
fixture/guard dependencies in a fresh run-owned Mac job. Pin ALL staged files in
session-input-sha256.txt, including runtime-name and pair artifacts. Reuse the
verified identity HOST/SDK/UI outputs, not its old candidate tarball. In each
newly staged launch/restart body replace the entire old candidate extraction/
copy block with exactly `. ./stage-version-package.sh`; retain registered
ownership, internal network, fresh volume and effective limit checks. Generate
new access-window-deadline and supervisor epochs; never reuse saved epochs.

Invoke through the exclusive wrapper, with start at actual execution, teardown
start+1200 and hard stop start+1500:

```sh
/Users/nolan/vts-figma-test/bin/docker-job /bin/bash \
  "$SESSION/run-upgrade-rollback-session.sh" "$SESSION" "$RUN" \
  "$START" "$TEARDOWN" "$STOP"
```

Require fresh 3712 MiB aggregate admission, app/browser-helper/probe/resolver
1536/768/64/64 MiB, existing CPU/no-swap caps, 1280 MiB host/2 GiB disk reserves,
DNS freshness and no provider egress. Transient DNS needs its separate owned
network and 1344 MiB pre-resolver check. No human credentials, provider/model/
OAuth calls, new tasks or employees. Stop work for safety failure; routine
reversible corrections stay within the one original deadline. Exact owned
cleanup and independent absence readback remain mandatory. This driver is
prepared but has NOT been executed against the host.

## Remaining gates

Native upgrade/rollback; second clean instance and built-host portability;
concurrent/protected runtime; live credential recovery/grant removal; native
skill audit disposition; required full-host/CI; final candidate reproduction
and Theo's independent complete-candidate review. No publication or readiness
claim. Current work is actionable preparation/execution, not an external blocker.
