# Project UI recovery admission — 28 September 2026

The coordinated sequence stopped at its first admission check. No UI build
container was created, Vite did not execute, and the retained app was not started.
The app remains offline; no user retry, successful keyed HTTP body, or actual
Create project/Configuration save-reload is claimed.

Inputs: integration 7063a7acacb808a3a7f8d9ac038904e23344342b, including keyed route
fix f633ddedc21dd7833ceaf90d3b7f39b63bdf1980. Host 2026.916.1 /
d554c4789ed3930f8a53ac9fdf6503b3187097da. Dependency image
sha256:a02ac35ac41df911af477422ea0e781cf41d2b2c600c66f0a5ac9d8c63f52c2c.

The runner now prepares the two native project components from checked baselines,
applies the committed project UI patch and copies its shared editor. An explicit
VTS_UI_TRIAL_DEADLINE bounds both launch and supervision. Admission includes the
additional concurrent 64 MiB probe: 1536 build + 64 probe + 1280 host reserve =
2880 MiB. The build hard cap, no-swap setting, one CPU and 1024 MiB old-space
ceiling are unchanged. Source preparation/build behavior remains unexecuted
because admission failed first.

Command:

```sh
VTS_UI_TRIAL_DEADLINE=2026-09-28T04:00:00Z python3 operator/ui-smoke-trial.py
```

At 03:40:47.157 UTC, complete daemon ancestor evidence showed 2,989,006,848 bytes
(2850.54 MiB) available, against 3,019,898,880 bytes (2880 MiB): shortfall
30,892,032 bytes (29.46 MiB). Disk free 5,287,768,064 bytes passed the 2 GiB reserve.
The 2816 MiB workload threshold alone excludes the concurrent probe; the saved
decision explicitly requires adding that budget. No admission threshold was
lowered and no second probe was run.

Owned probe vts-figma-test-ui-smoke-4df31a91-probe:
90630dcf69ec0e1477a205bb67c7131da23d28cd3319d9a7652f01204baa33f3.
Effective 64 MiB RAM/no swap, 0.25 CPU and 32 PIDs were verified. No network or
mounts; read-only filesystem, node user, dropped capabilities. It is retained
stopped by the runner's docker stop --time 1 cleanup: exit 137, OOMKilled=false.
This is a supervised probe stop, not a failed UI build. Measurement and exact
resource inspection are in the issue artifact.

Read-only verification confirms retained app
c1e1180a6d74c5e690b8d8bd1cad42a975071c2fd06768025ffc3f89c109d90b
is stopped (exit 0), with 1536 MiB/no swap/one CPU/256 PIDs and its existing test
volume/network. Accounts, membership, UI, design links and GitHub associations
were not modified. No production resource action or credential copying occurred.

Validation: python3 -m py_compile operator/ui-smoke-trial.py and git diff --check
passed. Real refusal path and stopped-resource readback passed. No broad suites,
compiler, package rebuild, UI build, app admission/start, browser test or CI pass.

Next: Elena coordinates a qualifying window; Nadia owns fresh aggregate admission,
one bounded changed-UI build, separate app admission, then keyed list/action HTTP
and actual entry-point persistence proof before user retry. The existing 04:00
expiry is unchanged; later execution needs a separately coordinated window.
The existing human consent card is preserved but is not the technical unblock.
All other release gates remain open; no complete candidate or Theo handoff.
