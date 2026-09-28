# Worker-enabled reload: measured browser contention

28 September 2026. Implements the coordinated 22:05–22:50 UTC diagnostic
window. Runtime input integration 4661c6887913225ee9920eb53602856c8768b6cd;
host 2026.916.1 / d554c4789ed3930f8a53ac9fdf6503b3187097da;
arm64 dependency image sha256:4e2e1e59219129a4b687cd54ba439fb7fed0a5710af9f1551277dedd23dc61f1.

## Execution and result

Verified old app absent and no remaining expiry supervisor. One app session
reused retained named state, passed built UI and callback repair. Enforced
22:50 UTC deadline before launch. No new login/consent, build or restart loop.

Commands through the authorized Mac wrapper:

    /Users/nolan/vts-figma-test/bin/docker-job bash <diagnostic-dir>/restore.sh <retained-build-dir> 79b344dc-6a81-41bc-8ae6-7b4acc7e86f6 <diagnostic-dir>
    /Users/nolan/vts-figma-test/bin/docker-job bash <diagnostic-dir>/reload-proof.sh <diagnostic-dir> 79b344dc-6a81-41bc-8ae6-7b4acc7e86f6

Diagnostic directory:
 /Users/nolan/vts-figma-test/reload-79b344dc-6a81-41bc-8ae6-7b4acc7e86f6
Retained build:
 /Users/nolan/vts-figma-test/job-c69805a3-cd15-444d-98f0-645d61b68cca

Exact executable scripts, admission records, browser events and terminal
readback are in the attached redacted artifact. Credentials arrived on stdin
from native private test state; none are included in the artifact.

Fresh app admission: 7,613,628,416 bytes headroom, 919,200,096,256 bytes disk.
Browser admission: 6,286,180,352 bytes headroom, 919,068,348,416 bytes disk;
explicit 3392 MiB aggregate gate passed. The underlying reusable probe reports
3328 MiB in its JSON; the shell separately enforces 3392 MiB. Complete ancestor
evidence recorded. Full 1280 MiB host and 2 GiB disk reserves retained.

Native login 22:07:57.958; fresh navigation 22:07:58.364; Designs and saved
synthetic attachment visible by 22:07:59.625. Reload began 22:07:59.699 and
failed waiting for load with the 35-second navigation timeout. Failure evidence
collection also stalled; latest recorded resource sample is 22:09:04.467.
Do not interpret the sample timestamp as the navigation timeout duration.
Browser job exited 1. No normal reload or this-run keyed readback pass.

At the latest sample:

| Counter | Value |
| --- | --- |
| memory.current | 536,850,432 bytes |
| memory.peak | 539,836,416 bytes |
| memory.max configured/effective | 536,870,912 bytes |
| memory.events max | 182,845 |
| oom / oom_kill | 0 / 0 |
| memory.pressure full total | 4,843,479 microseconds |
| memory.pressure full avg10 | 6.89% |
| cpu usage / system | 79,840,051 / 67,010,661 microseconds |
| throttled periods / total periods | 742 / 900 |

Peak accounting slightly above the configured cap does not mean limits changed.
CPU throttled time is not directly wall-clock duration. These counters establish
substantial contention in this capped browser; they do not establish the precise
worker bug or prove that more memory fixes it.

Session, adapters, health, settings and company responses completed HTTP 200;
session body included a user and health was authenticated/ready. Later project
and sidebar requests started but lacked completion in the final capture. No
captured page error or failed attachment mutation. Service workers stayed enabled.
The retained unminified index bundle is approximately 10 MiB. Native worker uses
network-first fetch and clones successful static responses into its cache.
That source behavior plus measured pressure motivates a controlled resource
comparison; it does not justify a speculative worker patch or worker disablement.

## Resource disposition

App 3b9db7946c72738411584c330f1e625ed3f99935d82191b0a152fe8e1c08d104
had issue VIS-6/run 79b344dc labels, 1536 MiB/no swap/one CPU, AutoRemove.
Peak 1,329,147,904 bytes; own max/oom/oom_kill zero. Health passed before stop.
Served plugin UI SHA-256:
7c107e86ccb5dd4e9e4dd0ebc7c9a8e355820ae0db1eab66a30c54e68c30f9a0.

Browser had 512 MiB/no swap/one CPU, AutoRemove, separate container sharing only
the owned app's test network namespace. Probe auto-removed. Browser cleanup
completed; exact app was ownership-verified and stopped after failed diagnostic.
Independent wrapper readback confirms both absent. Named volume/network and
design/account/managed-credential state retained. App is offline; no ready URL.

## Source increment and next action

The previously prepared instrumentation was runtime-tested in this run.
The follow-up harness change records periodic samples independently of the final
catch path, includes memory.stat to separate anonymous/file-cache pressure, and
timestamps request events. Node syntax and git whitespace checks passed; this
follow-up logging change is not runtime-tested. No product patch is claimed.

Elena must coordinate a changed browser-budget comparison before another trial.
Concrete proposal: keep app 1536 MiB, raise only experimental browser cap to
768 MiB/no swap/one CPU, keep 64 MiB probe and 1280 MiB reserve:
3648 MiB aggregate admission, fresh ancestor/disk evidence and one bounded
worker-enabled run. This is a proposed diagnostic allocation, not a measured
minimum or a proven remedy. No such increase or trial occurred here.
Nadia owns the comparison and smallest evidenced correction. If memory pressure
clears but reload still fails, investigate worker/request completion using the
timestamped evidence; do not claim browser acceptance from a disabled worker.

Inspection allowlisting, real association correction, context/screenshots and
fresh-agent proof were not attempted because the required reload gate failed.
Automatic draft selection and all remaining release gates remain open.
No production action, canvas edit, broad suite, package rebuild, timer,
publication or interim reviewer handoff.
