# DNS resolver isolation and admission correction

Preparation only in response to Elena's DNS sequencing review. No runtime allowance exercised.

The helper creates a dedicated bridge named `vts-figma-test-dns-<run UUID>` and records its exact ID in `resolver-network-id`. Before resolver copy/start it verifies network ID/name/issue/run labels and bridge mode; membership must be empty or solely the exact resolver. Created/stopped containers may have no attached endpoint. Resolver ID/name/issue/run and configured network ID are independently checked. Shared default bridge is no longer selected.

The network permits external DNS resolution for the credential-free Node resolver. It is not an HTTP firewall: provider HTTP exclusion rests on the reviewed DNS-only executable, no credentials, no mounts and no application graph. App/browser remain on their internal-only network. No production network is joined. Resolver limits remain 64 MiB/no swap, 0.25 CPU/32 PIDs, read-only root, node user, dropped capabilities and no-new-privileges.

Immediately before each resolver start, the existing capped supervisor collects fresh host/complete-ancestor/disk evidence. Admission requires **1344 MiB** available (64 MiB resolver plus full 1280 MiB reserve), complete evidence and the **2 GiB** disk floor. Equal thresholds pass; one byte below fails. Original continuous reserve supervision remains. Aggregate admission stays **3712 MiB**. Earliest DNS TTL capped at five minutes is unchanged.

EXIT/TERM/INT cleanup verifies ownership/membership, removes the exact resolver, then its exact empty owned network. Successful independent listings must show both absent. The outer session has an exact-ID empty-network fallback if the helper is interrupted. Foreign ownership or unexpected membership fails closed and is reported, never cleaned broadly.

## Replacement invocation inputs

For a newly coordinated session only: stage current `operator/collect-fresh-draft-dns.sh`, `operator/resolver-admission.mjs`, `operator/ui-capacity.mjs`, and `operator/run-selector-lifecycle-session.sh` alongside the previously reviewed DNS/session modules. Regenerate and verify `session-input-sha256.txt`. Reuse successful identity outputs; no product rebuild.

```sh
bash run-selector-lifecycle-session.sh SESSION_DIR RUN_UUID START_EPOCH TEARDOWN_EPOCH STOP_EPOCH
```

Elena coordinates fresh epochs before execution. Proposed maximum 45 minutes with final five minutes cleanup, one attempt and first-failure stop. Existing app/browser/probe/resolver caps are 1536/768/64/64 MiB. Zero provider/model/OAuth calls. Consumed allowances cannot be reused.

## Offline verification

- `python3 scripts/check-resolver-isolation.py`: mocked ownership/membership refusal, admission refusal before start, exact cleanup after success/failed start, cleanup-residue detection, outer fallback and foreign/member refusal.
- `node scripts/check-resolver-admission.mjs`: exact floors, one-byte-short, incomplete/stale/future and invalid sample refusal.
- `node scripts/check-dns-sequencing.mjs`: unchanged TTL/cap, drift/private denial and ordering.
- Bash syntax for both changed shells; `git diff --check`.

All passed. No actual DNS, Docker, SSH, build, provider call, login or production action. Runtime networking, resolver memory fit/timing, both installed selector orders and disable/re-enable remain unverified. App remains offline; frozen preview unchanged. Nadia owns execution after Elena reviews and coordinates a fresh allowance.
