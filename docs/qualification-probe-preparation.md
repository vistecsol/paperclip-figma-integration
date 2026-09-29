# Routing validator in the existing bounded probe

29 September 2026. Source preparation only for Elena's latest direction. No
replacement runtime allowance is implied. Host target remains 2026.916.1 /
d554c4789ed3930f8a53ac9fdf6503b3187097da. Product exports and frozen preview
are unchanged; no application graph, host installation or rebuild is needed.

## Executable change

qualify-routing-session.sh now calls validate-routing-in-probe.sh instead of
host Node. The latter uses Bash/Docker/base64/tr and streams JSON inspect records
plus encoded pure-validator source over stdin to Node in the EXISTING live
supervision probe. It creates no resources, copies no files into the probe and
loads only Node built-ins plus the supplied pure module, using a data URL.
The probe's current supervisor continues; its total 64 MiB cap is unchanged.
The extra short exec's memory fit is unmeasured and must be verified in the next
allowance; an OOM or bootstrap failure stops qualification, without retry.

Before bootstrap execution, independent Bash inspect assertions require:

- Exact full probe ID, test namespace, current issue/run labels and running state.
- Expected immutable image ID; node user; host cgroup namespace; network none.
- 64 MiB memory, no swap, 0.25 CPU, 32 PIDs; read-only root, dropped ALL
  capabilities, no-new-privileges, no mounts/binds/tmpfs/devices/added capabilities.

The bootstrap then checks actual UID, effective capabilities/no-new-privileges,
read-only root mount and absence of application/state/socket mounts. It resolves
its own cgroup via /proc/self/cgroup (host namespace) and requires effective
memory.max=67108864, memory.swap.max=0, cpu.max='25000 100000', pids.max=32.
Only afterward does it read at most 1 MiB of input and import the pure validator.
That validator independently checks the app/browser/network/volume boundaries
before the existing wrapper copies or executes native/browser qualification.
Raw inspect records stay in the protected session directory, never in uploaded
receipts; only projected non-secret results are printed. No synthetic credentials
are included in this validator input.

## Proposed invocation and stop conditions

Elena must first coordinate new START, TEARDOWN and STOP epoch values. No old
window is reusable. Use the authorized Mac docker-job wrapper and its documented
absolute Docker CLI PATH; retain its lock. Copy these committed files alongside
the previous routing/native/browser files into the fresh session directory:

    validate-routing-in-probe.sh
    routing-probe.mjs
    qualification-routing.mjs
    qualify-routing-session.sh

The outer job records the existing supervisor's full ID in probe-id and its
verified immutable image ID in probe-image-id. Do not substitute an app or browser
as the validator host. The supervisor must retain its already specified node,
read-only, network-none, host-cgroup and 64 MiB/0.25 CPU/32-PID contract. It must
remain alive and enforce reserves throughout qualification. Missing/stopped or
incompatible probe is a prerequisite refusal, not permission to launch another.
After exact app/browser/network/volume IDs are recorded, the command remains:

    bash qualify-routing-session.sh SESSION_DIR RUN_ID START_EPOCH TEARDOWN_EPOCH STOP_EPOCH

For the validator-only stage (inspect records already captured by the wrapper):

    bash validate-routing-in-probe.sh SESSION_DIR RUN_ID START_EPOCH TEARDOWN_EPOCH STOP_EPOCH

Propose one 45-minute zero-provider session, final five minutes reserved for
cleanup, fresh state and verified 482-entry exports. Credential-free browser
preparation precedes app launch. Preserve dual time guards before creation and
launch, complete fresh aggregate admission >=3648 MiB, app 1536 MiB/browser
768 MiB (one CPU/no swap each), probe 64 MiB, host reserve 1280 MiB and disk
reserve 2 GiB. Sequential workloads only. No new model run, OAuth or provider
call. No rebuild or Adam attendance needed.

Stop on any failed check, unavailable probe, OOM, reserve breach, prerequisite
error or deadline. No retry or extension. Outer finally cleanup must preserve
redacted receipts, verify exact owned ephemeral IDs absent, retain named state
and finish offline. All production containers/Compose resources remain protected.
This source-only heartbeat does not start that session.

## Focused validation

Passed:

    node scripts/check-routing-probe.mjs
    python3 scripts/check-routing-probe-shell.py
    node scripts/check-qualification-routing.mjs
    bash -n operator/validate-routing-in-probe.sh operator/qualify-routing-session.sh
    node --check operator/routing-probe.mjs
    git diff --check

The effective-environment check uses deterministic fixtures, and the shell test
uses a Docker stub to prove guards fail before exec and accepts the streamed
payload. An initial mock test inherited BASH_ENV that replaced PATH and reached
the real Docker inspect for a nonexistent all-a ID; inspect reported no such
object. No resources were created or changed. The fixture now disables that
startup file; the corrected mock check passed. No SSH or runtime launch occurred.

Actual probe exec/memory, native/browser routing, installed selector, positive
GitHub/design coexistence and lifecycle acceptance remain unverified. No host/CI,
provider, release, or portability pass follows from these local tests. Nadia owns
execution after Elena coordinates a replacement allowance. Theo's complete-
candidate dependency and every other open release gate remain unchanged.
