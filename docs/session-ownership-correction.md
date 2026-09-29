# Session ownership correction

Source-only response to the DNS isolation review of 7edc25e21810ba7e5a02ccda9d50853e32781d8f.

The outer own() previously returned the final prefix-case status despite failed run/issue tests under cleanup's set +e and watchdog's && context. It now explicitly refuses every failed inspection/comparison, accepts only a unique registered full container ID, and checks exact ID/name/issue/run identity. Resolver fallback additionally requires the exact owned DNS bridge, matching NetworkMode and no foreign members before its first stop. Cleanup revalidates before stop and resolver removal; network removal requires successful inspection and an empty owned network. Existing independent absence checks remain.

## Staging change

Before any future execution, write the exact reviewed launch-body application container name (without slash) to runtime-name and include it in session-input-sha256.txt using the normal sha256 two-space format. The driver refuses omission before Docker operations. This identity must come from the reviewed launcher, never from live inspect output. Other role names derive from the fixed session naming contract. No existing staged bundle is represented as updated.

Reuse successful identity outputs. Proposed invocation remains:
bash run-selector-lifecycle-session.sh DIR RUN START TEARDOWN STOP

Only after Elena coordinates a new allowance: new epochs, complete 3712 MiB aggregate admission, fresh pre-resolver 1344 MiB admission, unchanged app/browser/probe/resolver caps 1536/768/64/64 MiB, existing CPU/no-swap limits, 1280 MiB host reserve and 2 GiB disk reserve. Maximum 45 minutes including final five-minute cleanup; first failure closes execution. No runtime allowance is exercised by this preparation.

## Verification

- python3 scripts/check-session-ownership.py — passed actual extracted cleanup (set +e) and watchdog (&&) against an offline Docker executable. Both runtime and resolver paths reject foreign run, issue, exact name, returned ID, failed inspect and unregistered identity. Resolver additionally rejects foreign network ownership, failed network inspect, foreign members and wrong NetworkMode. Positive exact-owned stop/removal and absence readbacks pass.
- python3 scripts/check-resolver-isolation.py — passed existing resolver ownership/membership, admission refusal, failure cleanup and outer empty-network fallback.
- bash -n operator/run-selector-lifecycle-session.sh — passed.
- git diff --check — passed.

No SSH, live Docker, DNS lookup, provider/model/OAuth call, rebuild or login. Actual Mac Bash/runtime behavior remains unverified. Production, retained state, frozen preview and unrelated maintenance work are unchanged. App remains offline per prior evidence. Nadia owns subsequent reviewed qualification; Elena coordinates a fresh runtime allowance. Installed selector/lifecycle and all other release gates remain open.
