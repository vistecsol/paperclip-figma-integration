# Native distinct-version upgrade and rollback — 29 September 2026

Engineering incomplete. Native local upgrade and rollback passed on fresh
synthetic state in the patched source host. This is not built-host portability,
registry installation, changed-schema migration, or final release acceptance.

## Inputs, command and results

Host `2026.916.1 / d554c4789ed3930f8a53ac9fdf6503b3187097da`;
verified identity host/SDK/UI output `cc61ea1` (all 482 inventory entries).
Driver input began at `18ccbedc8579c2b2c1b30c4ff861aa2d98f34471` and received
routine corrections described below. No product rebuild or frozen-preview replacement.

| Phase | Version | Tarball SHA-256 | Native result |
| --- | --- | --- | --- |
| Baseline | 0.1.0-lifecycle.1 | c911989969ab93504e55a165b0e59a0f63244d58e93bc54b934f5fba44268d8a | ready |
| Upgrade | 0.1.0-lifecycle.2 | 9139da168f9b846e3baf670056961017d014d944f1c24f725315374994ad52f7 | POST upgrade 200, ready |
| Rollback | 0.1.0-lifecycle.1 | c911989969ab93504e55a165b0e59a0f63244d58e93bc54b934f5fba44268d8a | POST upgrade 200, ready |

All phases returned keyed list outer/inner 200. Full API and independent scoped
read-only SQL equality preserved three links, revision 3, IDs, names, ordering,
verification states, company/project, namespace, enabled configuration and migration
ledger. GitHub workspace equality passed. No SQL mutation, credential transfer,
provider/model/OAuth call or canvas write. Synthetic links remain unverified.
Plugin `78c19ccf-3d4d-4d26-9cca-8c70b7f0737e`, namespace `plugin_figma_2fe47c3b41`.

One original bounded session: start epoch 1790719940 (22:12:20 UTC), teardown
1790721140 (22:32:20), hard stop 1790721440 (22:37:20). Changed executions retained
these limits; no unchanged retry or deadline extension. Successful final directory:
`/Users/nolan/vts-figma-test/upgrade-directory-917e1bc9-53e9-481b-b765-dcd80c60b03c`.

```sh
/Users/nolan/vts-figma-test/bin/docker-job /bin/bash \
  "$SESSION/run-upgrade-rollback-session.sh" "$SESSION" \
  917e1bc9-53e9-481b-b765-dcd80c60b03c 1790719940 1790721140 1790721440
```

Do not replay these epochs. Saved artifact includes exact staged inputs and hashes.

## Routine harness corrections and observed limits

1. The original driver restarted the host with newer files before invoking native
   upgrade. Startup reconciled the registry to `.2`; the strict old-version assertion
   refused this as explicit upgrade proof. No false pass recorded.
2. A symlink fixture exited before health. The ephemeral app log was unavailable
   after AutoRemove. A separate 64 MiB read-only diagnostic established `/app` is
   root-owned 0755 while the application UID is 1000. Final bootstrap creates only
   `/app/figma-slot`, chowns it to node and then invokes native tini/entrypoint and
   privilege drop. No production path changed. Exact earlier exit cause was not
   recovered from a log; the permission prerequisite was corrected.
3. The symlink-based native call returned `.1` instead of `.2`. Tiny local ESM
   reproduction confirms realpath caching even with a changed query key. Final
   fixture uses a regular directory, with untouched immutable copies of both
   packages. It copies only differing content and advances manifest mtime because
   the native loader uses truncated mtime as its import cache key. Every resulting
   file is checked against its original tarball inventory. Tarballs/manifests are
   never edited, and worker/UI/migration bytes must be identical across versions.
4. A local receipt formatter initially treated admission JSON-lines as one JSON
   object; the corrected reader selects the first sample. Runtime was not repeated
   for that reporting error. Initial scp brace/glob selection errors were corrected
   before execution and transferred no credentials.

Final changed execution exited 0. Native registry remained at the old version
before each explicit upgrade API call; target version and ready state afterward
were checked. This is a version-only local-path procedure with fresh manifest
metadata, not a guarantee that arbitrary normalized archives upgrade automatically.
A changed executable/schema transition needs separate fixtures and migration proof.

## Reusable staging contract

Stage both exact packages through `stage-version-package.sh` while the fresh app
is stopped. Copy `start-version-source.sh` and copy `start-version-source.mjs` as
`/app/start-source.mjs`; create with `/bin/sh /app/start-version-source.sh` as its
explicit entrypoint. Native privilege drop remains in the wrapper. Seed native
install at `/app/figma-slot/current` (replace the old `/app/figma-candidate` fixture
path). The startup code copies `.1` into a fresh node-owned regular directory.
Use the current phase driver on the same running host for baseline → upgrade →
rollback. Do not restart between these phases. Pin staged source, runtime-name,
package pair, guards, inventory and new epochs before any resource creation.

Focused actual-driver checks pass simulated native transitions, corrupted retained
state rejection and package tamper rejection; stopped-stage checks reject foreign
and running containers under set +e. Node/Bash syntax and git diff --check passed.
No broader suite, host compiler or CI pass claimed; no hook bypass.

## Containment and cleanup

Final complete admission 7,336,787,968 bytes, immediate 7,350,501,376; required
3712 MiB. Disk 907,056,533,504 bytes. App 1536 MiB/no swap/one CPU/256 PIDs;
idle namespace helper 768 MiB/no swap/one CPU; supervisor and transient DNS resolver
64 MiB with their established limits. Host reserve 1280 MiB and disk reserve 2 GiB.
Internal app network has no provider egress; credential-free DNS has its exact owned
transient network. No socket or production storage mounted.

Final app `497f1c4ef90d7dfc03110d00634d774251ec68eb8bf1b40f1603ca541cc1d931`.
Supervisor survived; sampled peak 33,382,400 bytes, zero max/OOM/kill counters.
Pre-stop app readback OOMKilled=false; terminal application peak not certified.
Independent exact-ID readback confirms all phases' test resources absent, no current-run
ephemeral containers, DNS network absent and health HTTP_000. Fresh labeled synthetic
volumes/networks are retained; existing human data/design links and unrelated work
are untouched. App OFFLINE. No production action, publication, timer or QA wake.

## Next action and remaining gates

Nadia next prepares the second-clean-instance receipt/driver with separate database,
volume, network and instance identities using the same exact artifact; distinguish
patched source-host evidence from complete built-host portability. No human action
or new task is needed. Concurrent/protected runtime, live credential recovery and
grant removal, native skill audit disposition, required full-host/CI, final candidate
reproduction and Theo's independent complete-candidate review remain open.
