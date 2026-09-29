# Guarded qualification: installation passed, fixture contract stopped session

29 September 2026. Engineering remains incomplete. The replacement allowance was
15:20–16:05 UTC, teardown by 16:00. Both lower/upper guards were applied before
admission/resource creation and immediately before launch. The fresh app started
at 15:21:44.965 UTC, inside that window. This corrects the previous early launch;
it does not pass the unfinished browser or release gates.

## Inputs and successful checks

- Integration/harness input: 3e0cb373b9a1cce8916811b187937d65e8a48f7b.
- Exported product: 98fdec937d2f09f285fc1336ea17c7e6ddc38e29 plus the approved
  cap-only comparison patch. All 482 exported hashes matched the recorded inventory.
- Host: 2026.916.1 / d554c4789ed3930f8a53ac9fdf6503b3187097da.
- Dependency image: linux/arm64
  sha256:4e2e1e59219129a4b687cd54ba439fb7fed0a5710af9f1551277dedd23dc61f1.
- Diagnostic package SHA-256:
  4a6933b836e61aa35fefaf615cd9295501c61defe3cfd3deb673d66d2d239cc2.
  Frozen reproducible preview remains unchanged.
- Fresh complete daemon/ancestor headroom: 7,614,976,000 bytes;
  app gate 2880 MiB. Disk free: 919,115,120,640 bytes.
  Generic probe JSON also prints its historical 3328 MiB reference;
  the appended executable app admission checks 2880 MiB. This observation
  exceeds both; the artifact retains the unmodified report.
- Effective app limits: 1536 MiB, no swap, one CPU, 256 PIDs. Full 1280 MiB
  host memory and 2 GiB disk reserves retained by the existing deadline guard.
- Native health, synthetic signup, private first-admin claim, company creation,
  supported local-path package installation and company plugin configuration
  passed. Installed plugin 6720462f-0adf-49fe-85b3-a0f354554bf1 is ready,
  version 0.1.0-alpha.1, lastError null. This is installation of an extracted
  diagnostic package on a patched source host, not standalone npm portability.

## Actual stop and source correction

The first draft connection POST returned HTTP 400:
Remote MCP connection requires config.url.

The qualification request supplied config with sourceTemplateKey only and
put the URL only in transportConfig. Native createConnection selects
input.config ?? input.transportConfig ?? {}; the present config shadows the
fallback and therefore has no URL. This is my fixture preparation defect.
No connection was created; the project and attachment checks were not reached.
No provider, model, OAuth, browser or canvas call ran. The internal test network
blocked external egress. No permission guard was bypassed.

operator/qualify-local-persistence.mjs now places the official endpoint in
both config and transportConfig. A tiny check executed the actual native
parseRemoteHttpEndpoint function: the original selected config fails with
mcp_remote_url_missing; the corrected selected config parses the exact official
endpoint. Node syntax and whitespace passed. No DNS or HTTP call was used by
that check. Full corrected native persistence execution remains untested.
The script requires fresh state and must not be replayed against partial state.

Executed session commands, parameterized by run-owned directory:

    bash assert-session-window.sh 1790695200 1790697600 1790697900
    docker-job bash launch.sh SESSION_DIR RUN_ID
    docker-job bash native-proof.sh SESSION_DIR RUN_ID
    docker-job bash cleanup.sh SESSION_DIR RUN_ID

The artifact includes exact executable launch, native-proof and cleanup files,
the original failing payload and separately named corrected payload.

## Cleanup and preserved state

Exact app 60c5941c0340f7340e2df8c5faf153d1581488747cff7e3a53a681b1c3c9ba21
was ownership-verified and stopped once. AutoRemove was enabled. Independent
readback confirmed exact app absent, zero current-run ephemeral containers and
host-local health HTTP 000. Sampled pre-stop peak 1,372,192,768 bytes; max/OOM/kill
counters zero. No terminal peak is claimed after automatic removal.

Fresh named qualification state/network vts-figma-test-qual-f10e047a-state/net
remain labeled to this issue/run. Internal networking and one fresh state volume
were verified; no socket, production storage or copied credentials/database.
Existing Mac/hermes01 accounts, credentials, design links and GitHub state were
not accessed or changed. Production resources were untouched.

## Remaining and owner

Installed selector/browser, positive saved GitHub/design coexistence,
authenticated keyed persistence, disable/re-enable and restart checks were not
reached. No browser acceptance, full-host/CI, second-instance portability or
release readiness is claimed. No rebuild, unchanged retry, extension, timer,
new login or interim QA wake occurred.

Nadia owns the corrected native fixture and remaining zero-provider sequence.
Elena coordinates a replacement bounded allowance; this attempt stopped at the
failed prerequisite. Reuse verified exports, fresh qualification state, the
corrected dual time guards and existing limits/reserves. Review the draft's
native endpoint validation and browser dependency preparation before any new
runtime attempt. Theo's complete-candidate dependency remains open.
