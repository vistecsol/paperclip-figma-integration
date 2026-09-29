# DNS sequencing correction — source preparation only

Both 19:28 comments are applied. The existing freshness rule is unchanged:
expiry is the earliest returned TTL, capped at 300 seconds; equality at expiry
is rejected. Fifteen seconds was an observed receipt lifetime, not a new guard.

The previous receipt was collected before startup, browser setup, signup and
native installation. Those operations consumed its lifetime. Routing now labels
that receipt as historical immutable host-mapping evidence, validated at its
observation time. It is not accepted as current authority for a draft POST.

For each of four synthetic draft POSTs, the existing external mutation handshake
requests one DNS-only collection after the ownership/reserve check. A separate
credential-free 64 MiB resolver runs the pinned native public-endpoint guard,
resolve4 with TTL and OS lookup agreement. It must reproduce exactly the original
host mapping. Address drift, stale evidence, resolver disagreement or failure
stops the session; there is no refresh retry. Only its receipt enters the app.
The native caller checks freshness, OS mapping, then freshness again immediately
before POST. Subsequent native endpoint validation remains in place. Application
and browser remain on the internal network; no provider HTTP or credentials are
used by the resolver. No production resource is involved.

## Reviewable invocation and resource change

Reuse successful identity outputs documented in `bounded-identity-result.md`
(input cc61ea1caa512cbfdb4a5097eb37000d9dadaa4f, package SHA-256
 e0c835c8a32647fecbc294361328fefb7fda970026b69464fe4933c3efc46e2b).
No product rebuild is needed. Stage the updated operator files, including
`collect-fresh-draft-dns.sh` and `fresh-draft-dns.mjs`, and regenerate the session
input inventory. Native proof is `seed-selector-lifecycle.mjs` as before.

Proposed replacement command, only after Elena coordinates execution:

```
bash run-selector-lifecycle-session.sh "$SESSION_DIR" "$RUN" "$START" "$TEARDOWN" "$STOP"
```

Use a fresh maximum 25-minute work window with five minutes reserved for cleanup,
not any expired epoch. The proposed aggregate admission is **3712 MiB** rather
than 3648: app 1536 + browser 768 + supervisor 64 + transient DNS resolver 64 +
unchanged host reserve 1280. Stage the supervisor with that explicit admission;
the runner refuses the old staged threshold. Existing app/browser caps stay
unchanged; resolver is 64 MiB, no swap, 0.25 CPU, 32 PIDs, UID 1000, read-only
root, no mounts, dropped capabilities. Disk reserve remains 2 GiB. This extra
resolver and admission change require review in the next execution allowance;
no runtime authority is inferred here. Exact resolver ID is registered before
copy/start and included in safety teardown; its local trap removes it after
receipt collection or failure. Inspect cleanup independently after the session.

The collector uses only built-ins and the hash-verified native endpoint guard,
not a second application graph. Its actual memory fit, DNS duration, supervisor
survival, Mac execution and full fixture are **unverified**. A short TTL may still
expire in the bounded handoff; this remains a hard failure, never a relaxed guard.
Both selector orders and disable/re-enable remain deferred. No provider allowance
is requested or exercised.

## Offline verification

- `node scripts/check-dns-sequencing.mjs`: passed historical/current separation,
  exact 15-second fixture expiry boundary, unchanged five-minute cap, address
  drift/private-answer rejection and placement after mutation guard/before POST.
- Node syntax for collector and native fixture; Bash syntax for collector,
  session driver and mutation guard; `git diff --check`: passed.
- Checks are deterministic source/contract evidence, not actual DNS, Docker,
  native callback, installed selector or lifecycle acceptance.

Host remains 2026.916.1 / d554c4789ed3930f8a53ac9fdf6503b3187097da.
App stays OFFLINE; frozen preview, prior live proof and unrelated maintenance are
preserved. Nadia owns reviewed execution and qualification; Elena coordinates
its replacement allowance. No rebuild, SSH, Docker operation, provider/model/
OAuth call, login request, timer or QA handoff occurred in this heartbeat.
