# Selector list-envelope stop — 29 September 2026

Engineering remains incomplete. The resolver-stdin-review allowance authorized one
attempt from 20:20–21:05 UTC, teardown by 21:00. Attempt started at 20:20:02 UTC
using reviewed 3b462b962b4abf4804257dec2f10b7b48c68bf01. First failure ended it.

## Execution and observed results

Run bc9091fd-f034-4b0a-979f-79a4e8a38e7b used fresh pinned staging, including
resolver-stdin.mjs, native-proof.mjs, exact runtime name and updated epochs:

    /Users/nolan/vts-figma-test/bin/docker-job /bin/bash       /Users/nolan/vts-figma-test/stdin-bc9091fd-f034-4b0a-979f-79a4e8a38e7b/run-selector-lifecycle-session.sh       /Users/nolan/vts-figma-test/stdin-bc9091fd-f034-4b0a-979f-79a4e8a38e7b       bc9091fd-f034-4b0a-979f-79a4e8a38e7b 1790713200 1790715600 1790715900

All 482 approved output hashes, inventory and package digest matched:
e0c835c8a32647fecbc294361328fefb7fda970026b69464fe4933c3efc46e2b.
Reused identity build cc61ea1caa512cbfdb4a5097eb37000d9dadaa4f, host
2026.916.1 / d554c4789ed3930f8a53ac9fdf6503b3187097da. No rebuild.

Fresh complete ancestor headroom 7,619,739,648 bytes and disk 912,600,662,016
bytes passed admission. App/browser/probe/resolver caps 1536/768/64/64 MiB,
no swap, CPU/PID controls, 1280 MiB host reserve and 2 GiB disk reserve retained.
Initial 3712 MiB aggregate and fresh pre-resolver admission passed.

Browser dependency launch/close, initial DNS mapping, internal routing and
native loopback health passed. Native synthetic signup/admin bootstrap,
company creation, local package install/configuration and member setup passed.
The read-only resolver stdin path executed successfully; fresh receipts supported
two native draft POSTs, both HTTP 201. Latest saved receipt TTL was 77 seconds.
Endpoint validation and unchanged-address/freshness guards were retained.
No provider/model/OAuth call, human credential reuse or canvas edit occurred.

The subsequent list GET returned HTTP 200. Fixture failed at
assert.ok(Array.isArray(rows)): pinned native GET /tools/connections returns
{connections: [...]}, not a bare array. This is a harness contract error, not a
resolver, capacity or product failure. Native both-order validation, installed
browser selector and disable/re-enable were not reached. No retry.

## Correction and focused verification

Native seed and browser baseline/readback now strictly unwrap the native
connections envelope. Browser reads also require HTTP 200. The helper returns
the original array unchanged; ordering, ownership, selected identity and
unchanged-metadata assertions are preserved. Malformed or bare-array inputs
fail closed. Pinned upstream route source independently confirms the envelope.

    node scripts/check-selector-lifecycle.mjs
    node --check operator/qualify-selector-browser.mjs
    node --check operator/seed-selector-lifecycle.mjs
    git diff --check

Focused offline envelope/malformed-input, both-order fixture and existing
selector/lifecycle assertion contracts passed. Corrected full runtime remains
untested. No broad suite, product build or hook bypass.

## Cleanup and next action

Owned app 5d0d7ccbd0a702034972b2d8cf1ec75840f4b478680015aca63e99448cdf3127
and current-run ephemeral resources were cleaned up. Independent exact issue/run
container and resolver-network lists were empty; host health HTTP_000. App is
OFFLINE. Terminal app/browser/resolver memory peaks were not recorded; no
minimum sizing or no-pressure claim is made. The supervisor's sampled peak at
the last resolver admission was 35,987,456 bytes, zero own max/OOM/kill counters.

Fresh labeled synthetic state/network retained. Existing human accounts,
credentials/design links, frozen preview and unrelated maintenance work untouched.
Production resources were not mutated. No timer, publication or interim QA wake.

Nadia owns reviewed fresh staging and remaining selector/lifecycle qualification
after a replacement allowance is coordinated by Elena. Reuse successful identity
outputs; no rebuild, login or increased capacity is indicated by this failure.
This allowance is closed. All other release gates and Theo's complete-candidate
dependency remain open.
