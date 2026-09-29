# Remaining lifecycle qualification — preparation, 29 September 2026

Owner: Nadia. No runtime allowance is exercised by this document. No provider
calls, new employees/tasks, publication or production changes are proposed.

## Evidence carried forward

Consolidated receipt f1f3ccd8d6d3f3fd179207d381dd5af5c68c8db1 proves both
native selector orderings and disable/re-enable preservation. Do not rerun that
slice. Selector writes were intercepted in worker-blocked diagnostic contexts;
this is not OAuth acceptance. Separate worker-enabled reload and stored
GitHub/design coexistence receipts remain valid. See candidate-consolidation.md.

Host target: 2026.916.1 / d554c4789ed3930f8a53ac9fdf6503b3187097da.
Identity output input: cc61ea1caa512cbfdb4a5097eb37000d9dadaa4f; package SHA-256
 e0c835c8a32647fecbc294361328fefb7fda970026b69464fe4933c3efc46e2b.
This diagnostic package differs from frozen reproducible preview SHA-256
2db67196528809aeb3a675a988672bb6b3dd841f890980d8e45c789d7f1749e5.
Neither is a release-qualified candidate; do not conflate their provenance.

## Preconditions and native contracts

Before later execution, verify pinned route/loader/registry/lifecycle source
against its baseline. Current read-only /app inspection informs this protocol,
not new upstream provenance certification. Native contracts:

- POST /api/plugins/install with packageName=absolute extracted package path,
  isLocalPath=true. Host policy must permit local installation; no bypass.
- POST /api/plugins/:id/upgrade accepts version. Local installs re-read stored
  packagePath; sending a version alone does not replace its bytes. Stage exact
  independently built artifact at that path while the isolated host is stopped.
- DELETE /api/plugins/:id without purge performs soft uninstall. Registry keeps
  the row; reinstall of the same manifest ID reuses its plugin ID. Route comments
  mention 30-day retention; this does not prove indefinite retention/GC behavior.
- Loader rejects added capabilities before registry update. Do not treat the
  lifecycle's upgrade_pending branch as proof that escalated upgrades succeed.
- Existing qualifyLifecycle soft-uninstall receipt deliberately does not claim
  link retention. An unavailable API cannot establish data preservation.

Use only fresh synthetic qualification state, never the human credential volume.
Before every phase record package digest, manifest ID/version/capabilities,
plugin ID/namespace, company/project IDs, exact attachment JSON/revision,
repository workspace JSON, migration ledger and native configuration. Obtain
storage evidence by a scoped read-only SELECT of revision/attachments for these
IDs in the actual plugin namespace, plus migration metadata. Never modify SQL to
restore authority or state. Keep raw storage in test artifacts, redacting secrets;
no full vault/database dump in ordinary evidence.

## Exact phase matrix (all following runtime checks deferred)

| Phase | Action | Required acceptance receipt |
| --- | --- | --- |
| Restart | Stop exact owned app after baseline; replace once using same owned synthetic volume/network and identical verified host/package inputs | New container/process ID, old process absent, native ready/config; keyed list inner 200 and exact full baseline equality; GitHub workspace and migration ledger unchanged |
| Upgrade | Require distinct reviewed old/new package versions and digests with same manifest ID/schema/capabilities; stop app, replace extracted local package, start under fresh admission, POST upgrade with new version | Native version and actual worker/package digest match new artifact; exact retention equality; migrations neither duplicated nor destructive; wrong version or same-version reload fails qualification |
| Rollback | After upgrade success, stop isolated app, restore verified previous package bytes, restart, POST upgrade with previous version through the same native local route | Old version/digest ready and exact data equality; if native downgrade rejects, stop with rollback unsupported, leave preserved state disabled; never reverse schema or delete links |
| Soft uninstall | On disposable synthetic state only, DELETE without purge, then deny keyed reads/writes | Native uninstalled and unavailable worker; independent scoped storage equality, same registry ID and repositories; a denial alone is insufficient |
| Restore after uninstall | POST install same manifest ID from verified extracted artifact, restore config through native controls if required | Same plugin ID/namespace, ready, unchanged attachment/repository/migration snapshot; record whether config survived or needed supported reapplication |
| Instance B | After A is offline, fresh independent database, volume, network and instance; install same tarball without repo checkout or A data/credentials | Independent identity receipts, native install/config, locally seeded links and source discovery; A IDs absent/denied. Synthetic transport proves only local portability; separate managed setup/fresh-agent portability remains deferred |

Use operator/retention-receipts.mjs to compare captured receipts. It never
performs a mutation. Re-run only changed risks, not the passed selector suite.
Require request/response status AND inner plugin status; compare all IDs, fields,
ordering, primary, verification and revisions, not merely link counts.

## Concrete execution prerequisites, not hidden approvals

A true upgrade pair is not yet available: current previews reuse version
0.1.0-alpha.1. Do not edit packaged manifests post-build or claim those different
hashes prove a version upgrade. Prepare distinct unpublished test versions with
normal build/provenance/prepack checks and explicit compatibility first. No
registry publication is necessary. Exact tarballs/digests and restoration behavior
must be pinned before upgrade/rollback mutation. Full supported-host production
build and clean-instance bootstrap remain unpassed; source-host diagnostics are
not the package portability gate.

Proposed next bounded session: restart plus soft-uninstall/restore on one fresh
synthetic instance, zero provider/model/OAuth calls; at most 25 minutes from
actual start with five minutes reserved for cleanup. No closed window reused.
Fresh aggregate admission remains 3712 MiB if browser and transient resolver are
present; caps app/browser/probe/resolver 1536/768/64/64 MiB, no swap, existing CPU
limits, full 1280 MiB host/2 GiB disk reserves. Fresh per-resolver admission 1344
MiB; retain earliest-TTL/five-minute DNS rule and internal app isolation. A second
instance runs sequentially, never alongside A. Exact reviewed staging, effective
limits, dual time guards and wrapper lock are mandatory. On failure save state,
stop work and independently verify exact owned ephemeral cleanup; preserve named
synthetic data/links. Never mutate paperclip-* or any production Compose resource.

No execution is authorized here. Nadia owns completing the scoped storage
collector/phase driver and exact artifact pair, then executing within coordinated
scope. Elena owns expanded window/provider decisions; routine reversible harness
fixes need no renewed approval. Theo receives the complete candidate only.

Other critical gates remain separate: concurrent eligible employees, protected
runtime, live refresh/revocation, native skill audit disposition, full-host/CI,
final candidate reproduction and independent review. No new human action needed.
