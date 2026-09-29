# Qualification output-path stop — 29 September 2026

One attempt under native-deadline-review, 20:00–20:45 UTC, teardown by 20:40.
Engineering remains incomplete. The first failed gate closed the allowance.

## Execution and first failure

Input harness c749a3ec528dd2e96de08e56a6b00547773971b3; run
0363e95c-3e4b-4153-b035-ddee621b37cb. Fresh staging pinned exact runtime-name,
updated all epochs and passed transferred manifest and target Bash syntax checks.
Command through the authorized exclusive Mac wrapper:

    /Users/nolan/vts-figma-test/bin/docker-job /bin/bash \
      /Users/nolan/vts-figma-test/deadline-0363e95c-3e4b-4153-b035-ddee621b37cb/run-selector-lifecycle-session.sh \
      /Users/nolan/vts-figma-test/deadline-0363e95c-3e4b-4153-b035-ddee621b37cb \
      0363e95c-3e4b-4153-b035-ddee621b37cb 1790712000 1790714400 1790714700

Time guard admitted at epoch 1790712108 (20:01:48 UTC). Inventory comparison
then refused: line 3 / output/ui/index.html differed. Driver source still pinned
the older cap-e5aa0046 build, whereas staged expected inventory correctly pinned
the approved identity-6a7686f1 outputs. No resource was created, no capacity
admission performed and no DNS/native/browser/provider/model/OAuth call ran.
No qualification retry occurred.

## Narrow correction and verification

The driver now references the already approved identity-6a7686f1 directory.
Inventory equality, exact candidate digest and complete output hash verification
run before any Docker operation or cleanup trap. No expected digest is rewritten
to accept the older output; no build or freshness/ownership guard is changed.

Read-only Mac verification: expected inventory matches the correct directory;
all 482 output hashes pass; candidate SHA-256 is
 e0c835c8a32647fecbc294361328fefb7fda970026b69464fe4933c3efc46e2b.
Bash syntax and git diff --check passed. Full corrected runtime remains untested.
Host target remains 2026.916.1 / d554c4789ed3930f8a53ac9fdf6503b3187097da;
identity build input cc61ea1caa512cbfdb4a5097eb37000d9dadaa4f.

## Separate receipts and disposition

- Staging: manifest and Bash syntax passed. Output-path prerequisite failed closed.
- Runtime/admission/DNS: not reached; no new memory/capacity measurement.
- Both selector orders, rendered identity and disable/re-enable: not reached.
- Cleanup: no resources created; independent issue/run-filtered readback empty;
  host health HTTP_000. App OFFLINE. No cleanup mutation necessary.
- Retained state, credentials, links, frozen preview and unrelated maintenance
  preserved. No production action, timer, rebuild, publication or interim QA wake.

Nadia owns verification of the corrected output binding and remaining installed
selector/lifecycle checks after Elena coordinates a replacement bounded allowance.
Reuse approved outputs; no new login or additional capacity is indicated. This
allowance is closed and must not be replayed. Remaining release gates and Theo's
complete-candidate dependency remain open.
