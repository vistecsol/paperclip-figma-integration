# Qualification resolver read-only input stop — 29 September 2026

Engineering remains incomplete. One attempt under output-binding-review,
20:10–20:55 UTC with teardown by 20:50, using harness
73a3aae448f23bfc8c752c29876a24fc0912e357. First failure closed the allowance.

## Execution

Run ca448c72-dc85-43c2-9431-4cc5ebb3bcb4 staged fresh inputs, exact runtime
name, native-proof entrypoint and new epochs. Target manifest and Bash syntax
passed. The approved identity inventory and all 482 exported hashes passed,
including candidate SHA-256
e0c835c8a32647fecbc294361328fefb7fda970026b69464fe4933c3efc46e2b.
Identity build cc61ea1caa512cbfdb4a5097eb37000d9dadaa4f; host
2026.916.1 / d554c4789ed3930f8a53ac9fdf6503b3187097da.

Command through authorized exclusive wrapper:

    /Users/nolan/vts-figma-test/bin/docker-job /bin/bash       /Users/nolan/vts-figma-test/output-ca448c72-dc85-43c2-9431-4cc5ebb3bcb4/run-selector-lifecycle-session.sh       /Users/nolan/vts-figma-test/output-ca448c72-dc85-43c2-9431-4cc5ebb3bcb4       ca448c72-dc85-43c2-9431-4cc5ebb3bcb4 1790712600 1790715000 1790715300

Fresh complete ancestor headroom 7,618,412,544 bytes at 20:10:11.919 UTC;
immediate headroom 7,486,042,112 bytes. Disk 913,658,777,600 bytes.
3712 MiB aggregate gate, app/browser/probe/resolver 1536/768/64/64 MiB,
one CPU for app/browser, quarter CPU for probes, no swap, 1280 MiB host
and 2 GiB disk reserves retained.

Native loopback health, synthetic signup/admin claim, company creation,
package install/configuration and synthetic member setup passed. Initial
DNS collection and internal routing validation passed. The first draft
requested fresh DNS; the helper attempted docker cp into its read-only
resolver rootfs. Docker rejected it: "container rootfs is marked read-only".
The mutation guard subsequently timed out, so no draft POST occurred.
No provider/model/OAuth calls; no repeated attempt.

## Separate receipts

- Native fresh-draft resolver: failed before collection on input staging.
- Installed selector, both orders/rendered identities: not reached.
- Disable/re-enable: not reached. Restart and wider lifecycle remain deferred.
- Cleanup: exact owned app/browser/probe/preparation/resolver containers removed.
  Independent issue/run listing empty; DNS resolver-network listing empty;
  host-local health HTTP_000. App OFFLINE. No terminal memory peaks claimed.
- Existing human accounts/credentials/links and frozen preview untouched.
  Fresh synthetic qualification state/network retained. No production action,
  rebuild, publication, canvas edit, timer or interim review wake.

Initial receipt download used unsupported remote brace expansion and failed;
explicit per-file copies succeeded without rerunning any qualification action.

## Narrow preparation correction

The resolver remains node UID 1000, read-only, no mounts, dropped capabilities,
64 MiB/no swap/quarter CPU/32 PIDs on its exact owned DNS network. Reviewed DNS
module bytes and public mapping now travel as a JSON stdin envelope to a small
Node bootstrap. Docker create -i / start -ai replaces copying into the resolver.
Native endpoint validation, earliest-TTL/five-minute freshness, unchanged-address
check and pre-start admission remain intact. Only the successful receipt is
copied to the isolated application.

Focused checks passed:

    node scripts/check-resolver-stdin.mjs
    python3 scripts/check-resolver-isolation.py
    node --check operator/resolver-stdin.mjs
    node --check operator/fresh-draft-dns.mjs
    bash -n operator/collect-fresh-draft-dns.sh
    git diff --check

Actual bootstrap input/identity/import checks and mocked read-only invocation,
ownership, admission refusal and cleanup passed. No actual DNS/Docker or runtime
memory-fit test of the corrected path occurred. Future staging must include
resolver-stdin.mjs in the pinned input manifest. No resource cap increase or
filesystem restriction relaxation is proposed.

Nadia owns reviewed fresh staging/admission and both selector/lifecycle receipts
after Elena coordinates replacement execution. Reuse approved outputs; no rebuild
or human login indicated. All other release gates and Theo's candidate dependency
remain open.
