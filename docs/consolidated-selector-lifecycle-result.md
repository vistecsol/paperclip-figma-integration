# Consolidated selector and disable/re-enable result — 29 September 2026

Engineering remains incomplete. Elena's 20:24 credit correction was applied:
routine reversible harness fixes were consolidated in the existing execution
ceiling instead of requesting another review/window for each fix. No deadline,
resource limit, endpoint validation, rate limit or provider permission changed.

## User-visible behavior proved

- Installed Add account selected no retained identity with either native draft
  ordering (foreign personal first or shared first).
- Explicit resume and reconnect showed the selected shared connection name and
  “Any human in the company” audience in the visible native identity region.
  Intercepted outgoing intent targeted that exact connection. Foreign identity
  was absent, and native connection readback remained unchanged.
- Native disable returned disabled and blocked both keyed reads and a write with
  outer HTTP 502 / WORKER_UNAVAILABLE. Re-enable returned ready; exact snapshot
  equality preserved all three synthetic design links, revision 3, IDs, fields,
  connection references and the GitHub workspace. The attempted disabled write
  did not persist.
- Native fixtures created both actual draft orderings without response rewriting.
  Local package install/configuration and authenticated keyed persistence passed.
  Served index SHA-256 matched the approved export:
  53633621079529e21bda214672c9f2ede1e1e71d095dc7e65e0b09260229c33b.

Selector evidence uses fresh service-worker-blocked diagnostic contexts with
setup writes intercepted; it proves displayed identity and request selection,
not completed account setup/OAuth. Prior normal worker-enabled reload evidence
stands separately. Links are synthetic/unverified. Stored GitHub coexistence
is not GitHub authorization. No provider/model/OAuth call occurred.

## Corrections consolidated in this heartbeat

Input be953f0937b25f4610ce76124168c268e730ab80 already fixed the native
{connections: [...]} envelope. That correction passed runtime here.

| Execution | Result and concrete change |
| --- | --- |
| a | Native fixture passed. Browser new passed; resume timed out because the harness omitted native “Finish with Figma”. Corrected in 45313ca. |
| b | New and resume passed. Reconnect hit ambiguous unscoped audience lookup. Scoped assertions to the single visible Selected connection region in bf5135e; exact name/audience requirements remain. |
| c | All foreign-first intents passed. Repeated per-case synthetic sign-ins reached HTTP 429 entering shared-first. Changed harness to authenticate once and reuse only its synthetic user's in-memory storage state across fresh contexts in 961ff4a. Host rate limits unchanged; no same-request retry. |
| d | Both native orderings / new-resume-reconnect passed, followed by native disable/re-enable preservation. Session exit 0. |

Each changed execution used new synthetic state and exact resource identities;
no failed partial fixture was replayed. No product source or build output changed.
All commits include Co-Authored-By: Paperclip <noreply@paperclip.ing>.
Focused assertion-contract checks, Node syntax and git diff --check passed.
No hooks/CI bypass, broad suite or product rebuild.

## Exact inputs and execution

Host: 2026.916.1 / d554c4789ed3930f8a53ac9fdf6503b3187097da.
Identity build input: cc61ea1caa512cbfdb4a5097eb37000d9dadaa4f.
Reused package SHA-256:
e0c835c8a32647fecbc294361328fefb7fda970026b69464fe4933c3efc46e2b.
All 482 export hashes and the staged input manifests verified each time.
The frozen reproducible preview is unchanged; this is diagnostic output evidence.

Run: 48775c6d-91b8-4930-854d-ca8d458e520a.
Mac stage root: /Users/nolan/vts-figma-test/consolidated-48775c6d-91b8-4930-854d-ca8d458e520a,
with suffixes -b, -c, -d for changed executions. Each contains the exact staged
manifest and redacted receipts; private runtime logs are excluded from handoff.

Final invocation (earlier variants use their respective stage directory):

```sh
/Users/nolan/vts-figma-test/bin/docker-job /bin/bash \
  /Users/nolan/vts-figma-test/consolidated-48775c6d-91b8-4930-854d-ca8d458e520a-d/run-selector-lifecycle-session.sh \
  /Users/nolan/vts-figma-test/consolidated-48775c6d-91b8-4930-854d-ca8d458e520a-d \
  48775c6d-91b8-4930-854d-ca8d458e520a 1790713200 1790715600 1790715900
```

Original teardown remained 21:00 UTC / hard stop 21:05 UTC. All executions
finished earlier. App/browser/probe/resolver caps remained 1536/768/64/64 MiB,
no swap; app/browser one CPU, probe/resolver bounded as staged. Aggregate
admission remained 3712 MiB; full 1280 MiB host and 2 GiB disk reserves retained.
Measured initial complete daemon/ancestor headroom, bytes: a 7,564,189,696;
b 7,610,310,656; c 7,464,943,616; d 7,531,487,232.
Internal app/browser network prevents provider egress; separately owned DNS-only
resolver network retained native public-address/freshness validation. No human
credentials or production database/storage were copied. Terminal app/browser
memory peaks were not captured; none is claimed.

## Cleanup, remaining gates and next action

Exact-ID cleanup completed after each execution. Independent readback verifies
all recorded ephemeral IDs absent, no issue/run ephemeral containers, no resolver
network, and host health HTTP_000. Access is OFFLINE. Fresh labeled synthetic
named state/network retained; existing human accounts, managed credentials,
design links and unrelated maintenance work preserved. Production untouched.

No unresolved failure remains in this selector/disable-enable slice. Release is
still blocked on the larger acceptance matrix: restart, upgrade/uninstall/rollback
retention and two-instance portability; concurrent eligible employees/protected
runtime; live refresh/revocation; native skill audit disposition; full-host/CI;
current candidate reproduction and independent complete-candidate review.
No wider vendor endorsement or supported host range is claimed.

Nadia's next action is to consolidate these receipts into the candidate matrix
and prepare the exact restart/upgrade/uninstall/rollback retention checks using
the preserved links. No CEO review is needed for these routine harness fixes.
Further live/provider or expanded lifecycle scope remains separately bounded;
no extension, monitor, new task, publication or interim Theo wake was created.
