# Installed selector and lifecycle assertions

Preparation only, 29 September 2026. No runtime allowance remains.
Base integration c339bad6f16095d43616535763cacb54e7ebd19a; host
2026.916.1 / d554c4789ed3930f8a53ac9fdf6503b3187097da.
Reuse diagnostic exports from 98fdec937d2f09f285fc1336ea17c7e6ddc38e29
plus the approved cap-only patch, checking the existing 482-entry inventory.
Frozen preview SHA-256 remains
2db67196528809aeb3a675a988672bb6b3dd841f890980d8e45c789d7f1749e5.
These modules do not rebuild or replace it.

## Native contracts reviewed

ConnectionSetupFlow explicitly resolves resume/reconnect IDs from fetched
connections; the installed Figma patch prevents implicit reuse.
POST /api/companies/:companyId/tools/apps/connect carries galleryKey=figma
and optional resumeConnectionId/reconnectConnectionId.
Direct retained OAuth uses POST /api/tools/oauth/:connectionId/start.
Native connection-list GET must complete before judging selected identity.

Plugin lifecycle service transitions ready -> disabled -> ready. A route comment
incorrectly says installed; assertions use the actual service state.
Keyed data/action dispatch while not ready returns outer 502 with
WORKER_UNAVAILABLE. Outer 200 carrying a denial is not enough for this gate.
DELETE /api/plugins/:id without purge soft-uninstalls; executable worker access
ends, but denied reads alone cannot prove retained storage.
Upgrade delegates to loader.upgradePlugin and may enter upgrade_pending when
capabilities change. Do not use an invented local upgrade endpoint.

## Reviewable executable assertions

operator/qualification-selector.mjs exports createSelectorContext,
observeSelector and assertSelectorIntent. After synthetic native sign-in,
attach the observer to a fresh serviceWorkers:block context. This deliberate
request-interception diagnostic is installed UI intent proof only, not normal
worker-enabled acceptance; the previously passed normal reload is preserved.

For each case use a separate fresh context and obtain native connection-list
200 after navigation. Seed two uniquely named Figma drafts through the existing
native fixture: current synthetic user's shared draft and a different synthetic
user's personal draft, both without credentials. Never copy retained human
credentials. Record fixture IDs and before/after native draft metadata.

1. Open the native Figma new-account route with new=1. Advance the native access
   choice once. Intercept its first setup intent: galleryKey figma and neither
   resume nor reconnect ID. Fail if a retained draft is chosen.
2. Repeat from a fresh navigation/refetch with draft ordering reversed in
   separately prepared synthetic state, not a mocked API response. Expect the
   same no-implicit-identity result.
3. Open the explicit resume route targeting the current shared draft. Its
   first intercepted connect request must carry exactly that ID, or the native
   OAuth-start path must name exactly that ID. Foreign personal ID must not
   appear. Hydrated name/audience should match the chosen draft.
4. Explicit reconnect is a separate case, requiring the chosen ID in the
   reconnect field or exact native OAuth-start path.

The observer aborts all writes and external destinations and blocks native
preflight/discovery/verification routes. If those prerequisites prevent reaching
an intent, record the case deferred; never fabricate responses to make it pass.
The internal network remains the provider-egress boundary. No OAuth starts,
provider handoffs or credential persistence are authorized. Compare native draft
metadata after each case: no mutation expected. Actual new account persistence,
foreign-personal authorization rejection and provider completion remain separate
native/live gates; intercepted intent is not evidence of those outcomes.

operator/qualification-lifecycle.mjs exports qualifyLifecycle. Supply an
authenticated native request(path,body,method) returning {status,body}, exact
fixture state and a full snapshot/repository baseline. beforeMutation MUST
revalidate coordinated time, ownership, limits, supervisor survival and reserves;
do not supply a no-op in runtime execution.

Sequential phases:
- disable-enable: baseline read -> native disable -> status disabled -> keyed
  read and attempted rename both outer 502/WORKER_UNAVAILABLE -> repository
  unchanged -> native enable -> ready -> exact original links/revision and
  repository equality. Failed rename must not persist.
- after-restart: external owner-checked supervisor stops/recreates ONLY the
  synthetic test app with the same fresh qualification volume and exact inputs;
  no simultaneous app. After readiness, reauthenticate synthetically and call
  this phase. Require ready and exact snapshot/repositories.
- soft-uninstall (separate, last phase): native DELETE with no purge; require
  uninstalled and keyed execution denials. The module explicitly reports link
  retention unproven until an independent read-only native storage receipt or
  supported reinstall verifies the exact baseline. Never enable an uninstalled
  row or reset its status in the database.

Upgrade/downgrade/rollback and two-instance portability stay deferred: need two
versioned package inputs, loader install-source/provenance verification,
migration compatibility and supported restore behavior. Current one-version
diagnostic extracted package cannot establish these. Soft-uninstall should be
left for that separate retention/restore session, rather than creating an
irreversible acceptance dead end in the first session.

## Focused offline verification

    node scripts/check-selector-lifecycle.mjs
    node --check operator/qualification-selector.mjs
    node --check operator/qualification-lifecycle.mjs
    git diff --check

Checks reject implicit/foreign selection, absent refetch, provider prerequisite,
wrong unavailable response and changed post-enable revision. Synthetic transport
validates assertion behavior only. No installed selector/lifecycle pass claimed.

## Proposed execution, for Elena coordination

One 45-minute zero-provider session, final five minutes exclusively cleanup,
with explicit new START/TEARDOWN/STOP epochs; no launch until coordinated.
First session: installed intent cases and disable/re-enable; conditional single
restart only if at least ten minutes remain before teardown. Defer uninstall,
upgrade/rollback and second-instance portability as above.

Reuse the proven Mac docker-job exclusive wrapper, DNS receipt/native guard,
capped-probe routing validator and internal namespace route. Prepare credential-
free browser dependencies before app admission. Fresh synthetic volume/network,
never replay populated prior fixtures as fresh. Verify export inventory and
assertion hashes; fresh DNS receipt must survive through fixture draft creation.

Fresh complete aggregate admission 3648 MiB; app 1536 MiB, browser/preparation
768 MiB, supervisor 64 MiB, one CPU per app/browser, supervisor 0.25 CPU;
no swap, PID limits 256/256/32. Retain 1280 MiB host and 2 GiB disk reserves.
Dual time guards before creation/launch and before every mutation; ongoing
supervision, first failure/pressure stop/deadline ends allowance. No retry,
substitute probe, cap increase, model task or provider/OAuth call.

Driver delta: use existing native setup only to seed required fixture/baseline,
not rerun rename/reorder/detach coverage. Import selector module in capped
browser driver and lifecycle module in the app's already-running native session
path. Drivers must retain fail-closed receipts and native sign-in; no host Node
dependency. These assertion modules are prepared, not a new container launcher.
Stage receipts must separate intercepted intent, actual lifecycle HTTP behavior,
preservation, deferred retention/upgrade and offline cleanup.

Verify exact issue/run/name/image/network/mount ownership before every mutation,
then exact finally cleanup and independent absence readback. Preserve named
test data and all existing human accounts/credentials/design links. Never touch
production containers or Compose resources, mount Docker socket/production
storage, prune, publish or edit canvas. No Theo interim wake.

Nadia owns integration of these assertions into the coordinated session and
remaining qualification. Elena owns execution-window disposition. Access stays
OFFLINE. No further human login or RAM request is needed for this preparation.
