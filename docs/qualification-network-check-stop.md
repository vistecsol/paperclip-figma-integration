# Corrected-fixture session: host-port check stopped qualification

29 September 2026. Engineering remains incomplete. The single allowance was
15:30–16:15 UTC, teardown by 16:10. This attempt is closed; no restart or retry.

## Inputs, preparation and launch

Integration input: 2ca4182b5079bcdec1ef18d44d728c27461c33bf.
Host: 2026.916.1 / d554c4789ed3930f8a53ac9fdf6503b3187097da.
Arm64 dependency image:
sha256:4e2e1e59219129a4b687cd54ba439fb7fed0a5710af9f1551277dedd23dc61f1.
Exported diagnostic product: 98fdec937d2f09f285fc1336ea17c7e6ddc38e29
plus the approved cap-only comparison patch. All 482 output hashes matched.
No build occurred and the frozen reproducible preview remains unchanged.

The corrected fixture contains config.url and transportConfig.url. Reviewed
native project repositoryUrls handling and attachment command shapes before
launch. Chromium dependencies were installed in a separate 768 MiB/no-swap,
one-CPU/256-PID disposable test container; a headless launch/close passed.
Its external preparation network was then disconnected before app launch.
No app data or credentials were copied to the browser and no provider/model/
OAuth call occurred. Browser installation reached its cap with reclaim events
but zero OOM/kill events; this is dependency readiness, not UI acceptance.

Fresh complete daemon/ancestor headroom before app launch was 7,232,376,832
bytes; the executable gate required 3648 MiB because the prepared browser was
also present. Disk free 918,320,902,144 bytes passed the 2 GiB reserve.
The generic observation JSON also prints its older 3328 MiB reference; the
appended executable admission enforced 3648 MiB. Existing 1280 MiB memory
reserve and 16:10 deadline guards remained active.

Both time boundaries were checked before resources and immediately before
launch. Fresh app 663b191c8e1ad0ced5c872db37b85a62b3459e4be41adae6e892037ae9ce83e3
started at 15:33:40.934 UTC. It had a fresh named volume, internal network,
1536 MiB/no swap/one CPU/256 PIDs and AutoRemove=true. No production storage,
Docker socket or retained account/database/credential copy.

## Actual failure and correction

The native proof wrapper ran this from the Mac host at approximately 15:34:03:

    curl --max-time 5 -fsS http://127.0.0.1:3310/api/health

It returned exit 7, connection refused, before the fixture script executed.
The attempt stopped at this prerequisite. No signup, install, draft creation,
association write or browser qualification occurred.

Captured native logs show embedded PostgreSQL ready at 15:33:49.822, listener
bound at 15:33:50.133 and startup recovery complete at 15:33:50.331. Thus this
does not establish an application startup or capacity failure. The refused
path is the Mac published-port access to an internal-only Docker network.
The precise Docker Desktop forwarding behavior was not independently probed.
No internal HTTP health response was captured in this attempt.

Added operator/qualify-native-session.sh for the next coordinated attempt.
It verifies ownership, namespace, running state and effective limits; refuses
replay when the fresh qualification account already exists; copies the prepared
fixture and runs it inside the exact owned app. The fixture already performs
a timeout-bounded native loopback health check before authentication/mutations.
This removes the unrelated Mac-host published-port prerequisite without opening
provider egress or changing application authorization. Bash syntax and whitespace
passed. Corrected runtime behavior is untested.

Exact invocation files are in the issue artifact. They ran through the
authorized Mac docker-job wrapper, in this order:

    prepare-browser.sh SESSION_DIR RUN_ID
    launch.sh SESSION_DIR RUN_ID
    native-proof.sh SESSION_DIR RUN_ID
    failure-cleanup.sh SESSION_DIR RUN_ID

Replacement native proof, for a separately coordinated allowance:

    qualify-native-session.sh SESSION_DIR RUN_ID START_EPOCH TEARDOWN_EPOCH STOP_EPOCH

Browser-to-app routing must also use the isolated network rather than assume
Mac-host forwarding; prepare that address/auth-origin path before another launch.

## Cleanup and limits

Ownership-verified app and browser stop/removal completed. Independent readback
confirmed no current-run ephemeral containers and exact app absent. Host-local
health remained HTTP 000; access is OFFLINE. Fresh labeled qualification volume
and internal network remain; pre-existing accounts, credentials and design links
are untouched.

App sampled peak: 1,253,150,720 bytes; max/OOM/kill counters all zero.
Browser sampled peak: 805,306,368 bytes; max 1353, OOM/kill zero.
These pre-stop samples are not terminal peaks after automatic removal.
No broad suite, production operation, canvas edit, timer or publication.

## Remaining and owner

Corrected fixture runtime, installed selector/refetch/resume, foreign-personal
denial, saved GitHub/design coexistence, keyed mutation/reload and lifecycle
checks were not reached. No new qualification pass is claimed.

Nadia owns the internal native-health/browser transport correction and the
remaining zero-provider sequence. Elena coordinates its replacement allowance;
no new login, capacity increase or rebuild is a prerequisite. This allowance
ended on its required failure stop. Theo's complete-candidate dependency and
all remaining release gates stay open.
