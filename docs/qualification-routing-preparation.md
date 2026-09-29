# Zero-provider native and browser routing preparation

29 September 2026. Preparation only; no Docker, SSH, application or browser
execution. Supersedes the Mac published-port prerequisite in the closed
network-stop attempt. Its forwarding cause remains unproven.

## Inputs and routing

Host target: 2026.916.1 / d554c4789ed3930f8a53ac9fdf6503b3187097da.
Reuse the 482-entry verified export inventory from the successful diagnostic
comparison (98fdec937d2f09f285fc1336ea17c7e6ddc38e29 plus approved cap patch).
No product rebuild or change to the frozen reproducible preview is proposed.

Native fixture: execute inside the exact owned app, request 127.0.0.1:3310
with Host and Origin localhost:3310. Browser: a SEPARATE 768 MiB container
uses `--network container:APP_EXACT_ID`; it shares the app's network namespace,
not its PID namespace, filesystem, cgroup, or state volume. Chromium and its
APIRequestContext both use http://localhost:3310. No host port, Docker DNS alias,
HTTP proxy, request interception, cookie-domain rewriting or worker disabling.
The app attaches only to a fresh internal test network. No provider egress.

This preserves the native explicit auth origin, loopback cookie scope and
service-worker secure context. Keep PORT=3310 and the existing explicit
http://localhost:3310 auth base URL/allowed localhost configuration. There is
no OAuth call in this session. The browser first expects anonymous companies
HTTP 403, then signs in natively with a newly generated synthetic account,
checks membership, navigates and reloads with service workers allowed, and
compares the keyed inner-200 snapshot to the native persisted snapshot.
These are prepared assertions, not runtime passes. No Adam account or credential
is used. Auth source inspection confirms loopback recognition and trusted-origin
derivation; browser behavior still needs the coordinated runtime check.

## Executable handoff

Copy the committed operator files to a fresh run-owned Mac session directory:

- assert-session-window.sh, qualify-native-session.sh
- qualify-local-persistence.mjs as native-proof.mjs
- qualification-routing.mjs, qualify-browser-routing.mjs
- qualify-routing-session.sh, validate-routing-in-probe.sh, routing-probe.mjs
- mac-owned-cleanup.sh

Use the authorized /Users/nolan/vts-figma-test/bin/docker-job wrapper with
/Applications/Docker.app/Contents/Resources/bin on PATH. Do not bypass its lock.
Host Node is no longer required. The pure validator runs through the already
running capped Node supervision probe. See qualification-probe-preparation.md
for its independent pre-execution checks and exact input/launch contract.

Prepare a credential-free browser dependency image before the app: use the
already verified pinned arm64 dependency image and browser install recipe,
validate Chromium launch/close, then snapshot ONLY that owned fresh preparation
container before removing it. Record the resulting immutable image ID and its
parent/install receipt. It must contain no account, database, cookies, app state,
Docker socket or host mounts. This local test image preparation is proposed for
the next allowance, not performed or certified here. No registry publication.
The final browser starts from that image directly in the app network namespace;
do not attach an external dependency network to the running app namespace.

In the outer guarded job, create the app on a fresh internal network/volume and
record exact IDs as runtime-id, network-id and volume-id. Label EACH resource
vts.figma.issue=VIS-6 and vts.figma.run=RUN_ID. Register ephemeral IDs immediately
with the existing finally cleanup. Before resource creation AND immediately
before start, call:

    bash assert-session-window.sh START_EPOCH TEARDOWN_EPOCH STOP_EPOCH

After app readiness, browser creation has this exact network/limit contract
(other flags must preserve the credential-free image entrypoint contract):

    docker create --name vts-figma-test-RUN-browser \
      --label vts.figma.issue=VIS-6 --label vts.figma.run=RUN_ID \
      --network container:APP_EXACT_ID --memory 768m --memory-swap 768m \
      --cpus 1 --pids-limit 256 --security-opt no-new-privileges \
      --entrypoint node PREPARED_BROWSER_IMAGE_ID \
      -e 'setInterval(()=>{},1000)'

No mounts, extra devices/capabilities or privileged mode. Record/register its
exact ID as browser-id, check the time again and start it. Then:

    bash qualify-routing-session.sh SESSION_DIR RUN_ID START_EPOCH TEARDOWN_EPOCH STOP_EPOCH

The wrapper reads exact inspect records, validates namespace/run/issue ownership,
internal-only app networking and network ID, fresh volume identity/destination,
no browser mounts, running states and Docker CPU/RAM/swap/PID limits BEFORE
copy/exec. Native and browser processes also check effective cgroup limits.
It invokes the corrected native fixture, then transfers ONLY the synthetic
account/state/snapshot via stdin pipe into the separate browser. No credentials
in argv, logs or host artifact files. Never upload raw inspect records or login
files; publish projected ownership/limit receipts instead.

Native fixture writes an exclusive qualification-attempt.json marker BEFORE its
first request. The wrapper rejects either that marker or an existing account.
Any partial attempt is closed; do not rerun on the same state. Retain labeled
state for evidence and use new state only in a separately coordinated allowance.
This is not an idempotent bootstrap or an implicit cleanup/retry instruction.

## Proposed replacement allowance

One 45-minute zero-provider session with explicit start/teardown/stop epochs;
reserve final five minutes for cleanup. No runtime allowance exists yet.
App 1536 MiB, browser 768 MiB, probe 64 MiB; no swap, one CPU each workload,
256 PIDs. Fresh complete daemon/ancestor headroom >=3648 MiB, host reserve
1280 MiB, disk reserve 2 GiB. Sequential preparation and qualification, no
concurrent build. Existing app deadline/reserve guard plus outer supervision
must remain active through browser execution; poll ancestor/disk reserves through
the existing probe, not only /proc inside Chromium. Recheck admission immediately
before launch. Stop on failed prerequisite, reserve breach, OOM or deadline;
no retry, increased cap or silent extension.

Use mac-owned-cleanup.sh for non-AutoRemove ephemeral resources. Register browser
before launching it, preserve redacted outputs before cleanup, stop browser before
app, and independently verify both exact IDs absent and no current-run ephemeral
containers. For AutoRemove resources, use the existing AutoRemove-aware exact-ID
cleanup path instead; do not infer ownership from a name or run broad cleanup.
Keep fresh named test state; never remove retained design-link state. Finish
OFFLINE. Production Paperclip/Compose resources remain entirely protected.

## Verification and remaining scope

Passed locally: node scripts/check-qualification-routing.mjs (ownership, wrong
namespace/network/mount, swap, cap and stopped-container refusals), Node syntax
for native fixture/browser/validator, Bash syntax for both wrappers, git diff
--check. No browser, Docker, SSH, HTTP or provider call was run. Search for two
nonexistent source paths returned errors; the existing better-auth.ts source
was read directly. No product source or auth policy changed.

The prepared browser check proves transport/auth and normal reload only when
executed. Installed selector/refetch/explicit-resume assertions and conditional
lifecycle checks retain their separate acceptance scope; this receipt must not
be reported as their pass. Native fixture contains positive GitHub/design
coexistence, revision conflicts and keyed persistence assertions, still unrun.
Elena coordinates the next allowance; Nadia owns dependency receipt, fresh
admission, execution, exact cleanup and remaining qualification. No new login,
provider budget, model run, task, canvas edit or QA wake is proposed.
