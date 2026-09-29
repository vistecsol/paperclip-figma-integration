# Restart and soft-uninstall/restore — 29 September 2026

Engineering remains incomplete. This is native lifecycle evidence on one fresh
synthetic, patched source-host instance; not standalone built-host portability.

## Inputs and bounded execution

- Host: `2026.916.1 / d554c4789ed3930f8a53ac9fdf6503b3187097da`.
- Reused identity output input: `cc61ea1caa512cbfdb4a5097eb37000d9dadaa4f`.
- Package SHA-256: `e0c835c8a32647fecbc294361328fefb7fda970026b69464fe4933c3efc46e2b`.
- Dependency image: `ghcr.io/paperclipai/paperclip@sha256:4e2e1e59219129a4b687cd54ba439fb7fed0a5710af9f1551277dedd23dc61f1`.
- All 482 saved output hashes passed. No build or frozen-preview replacement.
- Run: `cf97bb0d-5de2-4d33-8572-6a20cf9d2cd0`.
- Session start `1790716437` (21:13:57 UTC), teardown `1790717637`
  (21:33:57), hard stop `1790717937` (21:38:57). Work completed before teardown.
- Mac directory: `/Users/nolan/vts-figma-test/retention-cf97bb0d-5de2-4d33-8572-6a20cf9d2cd0`.
- Exact invocation through authorized exclusive wrapper:

```sh
/Users/nolan/vts-figma-test/bin/docker-job /bin/bash "$SESSION/run-retention-session.sh" "$SESSION" "$RUN" 1790716437 1790717637 1790717937
```

A routine collector correction continued through staged `continue-retention.sh`
with the same arguments, deadline, caps and this run's fresh synthetic volume.
It did not repeat selector or disable/re-enable checks. Both staged drivers and
input manifests are in the artifact. No automatic unchanged retry.

## Implementation and observed results

`collect-retention.mjs` uses a read-only PostgreSQL transaction with exact plugin,
company and project predicates. It reads only the allocated Figma namespace,
attachment row, plugin row, migration ledger and known `{enabled:true}` config.
No vault, secret, user credentials or full database export is read. The driver
uses authenticated native APIs for every mutation; SQL never restores data or
authority.

| Phase | Observed outcome |
| --- | --- |
| Fresh fixture | Native install/configure, one credential-free shared draft, three synthetic links and saved GitHub workspace; revision 3 |
| Baseline | Full API state agrees with scoped storage; migration and config captured |
| Restart | Original app absent; new container/process on same owned volume/network; ready and exact attachment/repository/namespace/migration/config equality |
| Soft uninstall | Native DELETE without purge returned uninstalled; keyed reads and writes returned outer 502 / WORKER_UNAVAILABLE |
| Independent retention | While uninstalled, read-only SQL confirms identical attachment IDs, all fields/order/revision and migration ledger; native GitHub workspace unchanged; config remains enabled |
| Reinstall | Native local install reuses same plugin ID/namespace, ready; keyed inner 200 matches full baseline; no config reapplication needed |

Plugin ID `339756a5-3cde-40ae-81bd-98a6eeae43d3`, namespace
`plugin_figma_2fe47c3b41`, company `5b2a0385-b526-4a3e-8d3b-d1f8ba3ff2e8`,
project `8b87877f-7937-4303-a927-9dfa6a9e264c`. Links remain unverified synthetic
resources; this does not prove provider access or GitHub authorization.

The initial collector comparison failed because the API includes a `connections`
projection absent from the stored row. Correction explicitly compares persisted
revision/attachments to SQL and independently compares the complete API body to
the seeded baseline. It did not strip or relax attachment checks. The initial
failed receipt is retained. Cleanup completed before the changed continuation.
There was no product failure in the completed lifecycle slice.

Targeted checks: Node parsing for new modules, Bash parsing for driver, offline
retention rejection checks and `git diff --check` passed. Real native/SQL phase
receipts then passed. No host typecheck, full build, broad suite or CI pass claimed.

## Containment and cleanup

Fresh complete admission in corrected continuation: 7,299,706,880 bytes; restart
admission: 7,299,833,856 bytes. Gate remained 3712 MiB, host reserve 1280 MiB,
disk reserve 2 GiB. App 1536 MiB/no swap/one CPU/256 PIDs; idle namespace helper
768 MiB/no swap/one CPU (no Chromium or selector checks); supervisor/resolver
64 MiB with existing caps. Internal-only application network; transient
credential-free DNS network was removed. Provider/model/OAuth calls: zero.

Original restart subject `485ee1b4f4eb3fa65c5ab961b9b7fd5220fde2db46e5f6d10636584f6fca48bc`;
replacement `a02b62f7c2c54a492641b639c1b16d55f462787f0a8d847813c81a8828babee1`.
Independent readback confirms both absent, all current-run ephemeral containers
absent, resolver network absent and host health HTTP 000. Access is OFFLINE.
Named synthetic state/network remain labeled for retention. Human accounts,
credentials/design links and production resources were not touched.

Supervisor survived all phases; final sampled peak 30,941,184 bytes and zero own
max/OOM/kill counters. Replacement app readback reports OOMKilled=false; no
terminal app peak is claimed. No timers, publication or interim QA wake.

## Remaining release gates and owner

Nadia owns a normally built distinct-version pair and scoped upgrade/rollback
execution next. Current same-version packages cannot prove version transitions.
Second clean-instance install/discovery, complete built-host portability,
concurrent eligible employees/protected runtime, live refresh/revocation/grant
removal, native skill audit disposition, full-host/CI, final candidate
reproduction and independent Theo review remain open. Long-term uninstall GC
retention is not established by this immediate restore. Completed owner-origin
proof and selector/disable receipts stand; no further Adam attendance is needed
for these completed cases. Additional runtime/provider work needs its applicable
bounded scope; this session ends offline.
