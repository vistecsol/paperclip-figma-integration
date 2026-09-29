# Both-order selector preparation — 29 September 2026

Source-only response to Elena's 16:41 direction. No runtime allowance exercised.
Host 2026.916.1 / d554c4789ed3930f8a53ac9fdf6503b3187097da.
Frozen preview and the 482 diagnostic export hashes are unchanged.

## Completed executable changes

- `selector-fixtures.mjs` creates each pair through native requests. Only the
  first draft supplies applicationName; the second requires the returned
  applicationId, and both responses must reference that same application.
- Two separate fresh synthetic companies use opposite creation sequences.
  Native listConnections orders updatedAt descending. Readback must actually
  show foreign-personal first in one company and current-user shared first in
  the other. Timestamp ties/unexpected sorting stop the fixture; responses are
  never reordered or mocked. Both companies retain the same synthetic users;
  the second membership update preserves the first company assignment.
- Readback checks company/application IDs, distinct creators, exact names,
  shared/per_user audience, draft state and empty credential references.
- Browser driver covers new/resume/reconnect in fresh contexts for both native
  orderings. Before intent it checks visible DOM identity/audience; afterward
  it requires the exact intercepted intent and unchanged native metadata.
  New setup must not display either retained name. Resume/reconnect must display
  the chosen shared name and shared audience, never the foreign personal name.
- Interception remains a worker-blocked diagnostic, not account setup,
  provider authorization or normal-worker acceptance. All provider prerequisites
  and external navigation fail; no fabricated provider response is supplied.

## Important source finding — do not launch just to rediscover it

The inspected ConnectionSetupFlow SHA-256
b6161ab826a5601884c742d5ccae4b7c347b8af0e5c37decfb81eef63b7d61c2
matches the committed pinned baseline. Its StepHeader takes entry.name (Figma),
not the selected retained connection's name. OAuthConnectStateScreen likewise
receives the application entry, without retained identity. AccessStep can render
shared audience, but the OAuth entry screen does not expose that audience.
The existing selector patch changes implicit selection only.

Consequently the new strict visible-name/audience check is expected to expose a
real rendered-identity gap on explicit resume/reconnect with current exports.
This is source evidence, not an observed browser failure. Do not weaken the
assertion to accept API metadata or generic Figma branding. The prepared harness
is reviewable, but an unchanged runtime submission is not recommended: Nadia
must address this narrow native rendered-identity gap in source and prepare
updated output provenance before that acceptance can pass. No product patch or
rebuild was performed in this preparation-only heartbeat. Elena coordinates
any subsequent execution after reviewing this finding.

## Offline results

Passed:

    node scripts/check-selector-lifecycle.mjs
    node --check operator/selector-fixtures.mjs
    node --check operator/seed-selector-lifecycle.mjs
    node --check operator/qualification-selector.mjs
    node --check operator/qualify-selector-browser.mjs
    bash -n operator/run-selector-lifecycle-session.sh
    git diff --check

The focused contracts exercise both creation sequences, applicationId reuse,
missing applicationId, unexpected native ordering, wrong creator, implicit or
foreign selection, missing native refetch, wrong audience, absent visible name,
provider prerequisite refusal, and existing lifecycle denial/preservation
assertions. Synthetic offline checks prove assertion behavior only. Runtime
fixture creation, ordering, rendered identity and lifecycle remain unpassed.

## Corrected bounded invocation for later coordination

`operator/run-selector-lifecycle-session.sh` is the saved previous launcher
(source SHA-256 7023b01b7634a5187a6395053b6b0d44ed862f1d136757ffae896005d46f44e5)
with explicit five-argument time bounds, new module staging and pre-Docker input
hash verification. It refuses closed-window epochs in staged launch/supervisor
inputs. It does not invent a new window. Stage all reviewed dependencies,
`seed-selector-lifecycle.mjs` as `native-proof.mjs`, selector-fixtures in both
app/browser inputs, and refreshed supervisor/launch-body templates. Generate
`session-input-sha256.txt` from reviewed staged input bytes only, before transfer;
verify it on Mac. Never regenerate it from unverified remote inputs.

After Elena coordinates a NEW window, use these arguments (unset values refuse):

```bash
/Users/nolan/vts-figma-test/bin/docker-job bash \
  "$SESSION_DIR/run-selector-lifecycle-session.sh" \
  "$SESSION_DIR" "$RUN_ID" \
  "${START_EPOCH:?new coordinated start required}" \
  "${TEARDOWN_EPOCH:?new coordinated teardown required}" \
  "${STOP_EPOCH:?new coordinated stop required}"
```

SESSION_DIR is a fresh /Users/nolan/vts-figma-test/selector-<run-id> directory.
Use the authorized absolute Docker CLI PATH through the exclusive wrapper.
Window at most 45 minutes; final five minutes cleanup only. Verify both time
boundaries before creation/launch and native mutation handshake before every
fixture/lifecycle mutation. Do not replay partial state. DNS receipt must remain
fresh through all FOUR draft creates; expiry ends the attempt, no automatic
refresh or bypass. Browser dependency preparation precedes app launch.

Fresh complete admission 3648 MiB; app/browser/probe 1536/768/64 MiB,
CPU 1/1/0.25, PID 256/256/32, no swap; continuous 1280 MiB host/2 GiB disk
reserves. Internal app network and browser sharing only its network namespace,
no provider egress, production storage or Docker socket. Verify exact
issue/run/name/image/network/mount identities before mutation and cleanup.
First failed prerequisite, expiry, supervisor loss, OOM or reserve breach stops
work. Finally saves redacted receipts, removes only exact owned ephemeral
containers and independently checks their absence/offline state. No retry,
substitute probe, cap increase, model/OAuth/provider call or production action.

The driver runs selector then disable/re-enable, not the passed broad attachment
suite. Restart is explicitly deferred by this invocation; it does not silently
exercise the old conditional permission. Uninstall, upgrade/rollback and
second-instance portability remain separate unpassed gates. No user attendance,
login or extra RAM is currently established as needed. Access remains OFFLINE;
Theo's complete-candidate dependency remains open, without an interim wake.
