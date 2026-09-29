# Bounded identity build and qualification — 29 September 2026

One execution under the latest credit-control direction. Engineering incomplete;
access OFFLINE. No provider/model/OAuth calls, production changes or retry.

## Passed and reusable

Exact reviewed integration input `cc61ea1caa512cbfdb4a5097eb37000d9dadaa4f`;
host `2026.916.1 / d554c4789ed3930f8a53ac9fdf6503b3187097da`;
arm64 image `sha256:4e2e1e59219129a4b687cd54ba439fb7fed0a5710af9f1551277dedd23dc61f1`.
All 43 staged host hashes and exact Git HEAD matched. Staging used locally
prepared files, no Mac Python. Actual Mac Bash 3.2.57 empty cleanup preserved
exit 17 without Docker invocation. Expired guard exited 1 before its start
sentinel. Final build guard was moved before set +e in the saved executable.

Work bound: actual start 19:20:07 UTC, teardown 19:40:07, hard stop 19:45:07.
Build started 19:20:50.309 and finished 19:20:58.147, exit 0. Native SDK,
plugin build, normal npm prepack and full diagnostic UI smoke rendering passed.
Initial/immediate complete ancestor headroom: 7,617,695,744 / 7,592,951,808 bytes.
Approved build 1792 MiB/no swap/one CPU, Node old space 896 MiB; peak
1,628,889,088 bytes, zero max/OOM/kill events. Full 1280 MiB host and 2 GiB disk
reserves retained. This is not a full-host typecheck or release-build pass.

Reusable outputs and complete SHA-256 inventory are at
`/Users/nolan/vts-figma-test/identity-6a7686f1-6947-4223-ba87-63b89733c75d/output`.
Package SHA-256 `e0c835c8a32647fecbc294361328fefb7fda970026b69464fe4933c3efc46e2b`.
This diagnostic package includes the identity source; frozen reproducible preview
is unchanged. Reproducibility at this new input was not checked.

## First qualification failure

Fresh synthetic state/internal network and verified new exports were used.
Browser dependency launch/close and native app loopback health passed.
DNS receipt observed 19:23:33.460, TTL 15 seconds, expiry 19:23:48.460.
The capped routing validator rejected it as stale at the following validation,
before native fixture execution or browser navigation. The freshness guard was
not relaxed, refreshed or retried. Both selector orders and disable/re-enable
were not reached; no installed acceptance is claimed. App/browser/probe caps
remained 1536/768/64 MiB with approved CPU/no-swap controls and reserves.

A local scp brace-path transfer initially failed; exact-file copying corrected
that staging error before qualification. No build or qualification was repeated.

## Cleanup and next action

Exact registered ephemeral build/probe/preparation/app/browser resources were
removed. Independent issue/run-filtered Docker readback was empty and host-local
health returned HTTP_000. Fresh labeled synthetic state/network remain; retained
human credentials, design links and unrelated maintenance work were untouched.

Nadia owns removing the DNS-expiry race from the qualification harness without
weakening endpoint validation or enabling provider egress: separate immutable
host-mapping evidence from time-sensitive draft validation, or collect/validate
fresh DNS after app readiness through an explicitly isolated resolver path.
That is a proposed correction, not implemented or authorized runtime execution.
Elena dispositions the next bounded qualification allowance after source review.
Reuse this successful build; no rebuild, new login or RAM increase is indicated.
All other release gates and Theo's complete-candidate dependency remain open.
