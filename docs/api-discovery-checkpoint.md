# Scoped API and source contribution checkpoint

26 September 2026. Engineering remains incomplete. This extends attachment
commit `32cadf7aad4e940d3bc57e022f3bb7644f22ab2a`; it is review code, not an
installable plugin or a release candidate. Host target remains `2026.916.1` /
`d554c4789ed3930f8a53ac9fdf6503b3187097da`.

## Implemented

- Four scoped route declarations and a worker API adapter: list, mutate, verify,
  sources. Route shapes validate against the available host's actual shared
  validator. Company query selection is validated by the host before dispatch;
  the adapter uses only that host envelope and never substitutes body/query
  actor, company or project values. Project authorization is still delegated to
  the required bridge on every service call.
- Strict mutation fields prevent verification/status or identity injection.
  Access checks accept only the revision; inspection results come from the
  managed bridge. Unknown provider/database errors return a fixed error code.
- Source contribution collects explicit non-secret fields, labels attachment
  content untrusted data, preserves exact node citations, and limits UTF-8 JSON
  bytes without splitting records. It reports omitted records. It checks
  authorization before and after collection and honors an aborted signal.
- Package exports include service/API/discovery. Syntax checks cover all source
  and script modules. No credentials, additional dependency or host mutation.

## Verification and reproducibility

- `node --test test/api.test.mjs test/discovery.test.mjs`: 9 passed.
- `npm test`: 28 passed, 0 skipped.
- `npm run check`: passed.
- `node /app/server/node_modules/tsx/dist/cli.mjs scripts/check-host-api.mjs /app`:
  all 4 declarations accepted by the actual host schema.
- Initial schema command used `/app/node_modules/tsx/dist/cli.mjs`, which does not
  exist; corrected to the installed server loader above. Do not report the
  initial command as passed.
- The schema check uses locally available host source; prior provenance evidence
  covers selected host interfaces, not an attestation of this entire source
  tree. No full host build, CI or live policy test was performed in this slice.

## Remaining host work and release gates

The adapter must be wired only to authenticated `onApiRequest` dispatch. Its
shape checks do not prove authorization. The host bridge must capture immutable
invocation authority and enforce current project policy, same-company managed
connections, live run/session generation, work mode, runtime protection and
current grants. Plugin-supplied actor objects cannot grant that authority.

The discovery collector is not yet registered with heartbeat or either agent
runtime. The host must impose execution deadlines/worker cancellation, validate
contribution output and remove registration on disable/uninstall. Abort checks
alone cannot stop a non-cooperative pending I/O operation. Connection health is
not included yet; attachment verification is not connection health.

Nadia next implements that bounded host bridge and lifecycle registration, then
worker/UI/onboarding wiring. Real managed OAuth/shared-agent retrieval, isolation
through real host policy, official skill pinning, two clean-instance installs,
upgrade/disable/uninstall, rollback and required release checks remain deferred.
No missing private fixture blocks independent implementation. No release-ready
or vendor-endorsement claim is made.
