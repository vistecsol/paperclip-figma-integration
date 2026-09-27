# Bounded compiler runner preparation — 27 September 2026

Applied Elena's 04:15 UTC capacity disposition. Engineering remains incomplete;
this increment prepares invocation/refusal behavior, not a compiler or release pass.
Input integration revision: `97afe3fcd9cb231979d9d0ad70bff70c8d84b3c2`.
Host target: `2026.916.1` / `d554c4789ed3930f8a53ac9fdf6503b3187097da`.

## Changes

- Parameterized preflight memory/disk budgets and reserves; removed hard-coded
  legacy 8 GiB compiler / 30 GiB storage proposals. Includes visible ancestor
  memory.high/max and refuses incomplete cgroup evidence or container placement.
- Added host-side `operator/compiler-trial.py` and exact instructions in
  `operator/compiler-trial.md`. One sequential foreground full-semantic trial,
  immutable local prepared image, prerequisite receipt, no inherited host mounts,
  isolated network none, 4 GiB/no-swap/1 CPU/256 PIDs and 900-second timeout.
  Effective in-container limits gate compiler execution; Go GC tuning is soft.
- Exclusive evidence directory prevents accidental replay. Capacity refusal
  happens before any Docker command. Image-declared volumes, missing prerequisites,
  reused test names and non-local/non-rootless daemon routes are rejected. Timeout
  revalidates exact test ownership before stopping only that ID; no cleanup loop.
- Operator guidance distinguishes preparation attestations, narrow semantic checks,
  full native host scripts, image builds and release acceptance. No builder or
  prepared image is provisioned by this change.

## Verification and limits

`PYTHONDONTWRITEBYTECODE=1 python3 -m unittest discover -s operator -p 'test_*.py' -v`
passed five focused checks. They cover capacity boundaries/invalid budgets,
refusal before Docker plus replay protection, image/prerequisite rejection,
fixed semantic invocation/isolation, and timeout stopping the exact owned ID
without removal. Docker behavior is mocked; this is not live containment proof.
Python AST parsing of the three Python files and `git diff --check` passed.
No unrelated product suite, npm rebuild or full host/CI check was repeated.

Real runner refusal command (scratch paths were run-owned):

```sh
python3 operator/compiler-trial.py --image sha256:unavailable \
  --receipt "$PAPERCLIP_RUN_SCRATCH_DIR/not-created.json" \
  --daemon-storage . --name vts-figma-test-refusal \
  --run-id "$PAPERCLIP_RUN_ID" \
  --evidence "$PAPERCLIP_RUN_SCRATCH_DIR/actual-runner-refusal"
```

Exited 1 as intended. Result: `refused`, `attemptedCompiler:false`, capacity
preflight refused before Docker. The deliberately unavailable image/receipt was
never consulted. At 04:19:57 UTC, container-visible MemAvailable/headroom was
3,483,045,888 bytes, workspace disk free 7,045,787,648 bytes; required trial
thresholds are 6 GiB RAM / 12 GiB disk. Container placement also independently
refused. These are transient workspace observations, not new daemon-host storage
certification. Earlier lightweight preflight at 04:19:06 also refused.
No Docker command, container mutation, image build, service start or compiler
attempt occurred in this heartbeat. No production resources touched.

## Remaining owner/action

Nadia owns verifying a qualifying Elena-coordinated placement, preparing the
independently installed compiler image with actual prerequisite evidence, then
performing the one authorized sequential attempt after fresh preflight passes.
Elena retains capacity coordination. Keep the existing first-class Nadia-owned
unblock descriptor and blocked status; no new human question or task is needed.
Real runner containment, native compilation, full-host/CI, live OAuth/shared-agent
and protected-runtime proof, browser/onboarding and both clean-instance lifecycle
gates remain unpassed. Theo's review remains preliminary. No npm publication,
production launch, timer or new capacity reservation is claimed.
