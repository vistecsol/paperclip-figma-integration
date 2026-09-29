# Qualification deadline forwarding stop — 29 September 2026

Executed one allowance under session-ownership-review, 19:50–20:35 UTC with teardown by 20:30. Engineering remains incomplete; access OFFLINE. First failure closed the attempt; no retry.

## Exact inputs and measured progress

Reviewed harness input d11963ce062c69072f675b4b53112cc9377a828a.
Pinned host 2026.916.1 / d554c4789ed3930f8a53ac9fdf6503b3187097da.
Reused identity build cc61ea1caa512cbfdb4a5097eb37000d9dadaa4f, package SHA-256 e0c835c8a32647fecbc294361328fefb7fda970026b69464fe4933c3efc46e2b.
All 482 exported hashes verified; no rebuild. Staged reviewed dependency chain, exact runtime-name in input hash manifest, new epochs and 3712 MiB supervisor gate. Target Bash syntax and transferred manifest verification passed before runtime mutation.

Command through the authorized Mac wrapper:

    /Users/nolan/vts-figma-test/bin/docker-job /bin/bash \
      /Users/nolan/vts-figma-test/ownership-7e77be6f-8cc8-4211-9f9d-e9555e80e76d/run-selector-lifecycle-session.sh \
      /Users/nolan/vts-figma-test/ownership-7e77be6f-8cc8-4211-9f9d-e9555e80e76d \
      7e77be6f-8cc8-4211-9f9d-e9555e80e76d 1790711400 1790713800 1790714100

Initial complete host/ancestor headroom 7,618,228,224 bytes, disk free 914,716,389,376 bytes. Immediate headroom 7,497,641,984 bytes. App/browser/probe caps 1536/768/64 MiB, no swap, CPU 1/1/0.25, PIDs 256/256/32. Full 1280 MiB host and 2 GiB disk reserves preserved. Routing bootstrap verified effective probe environment and internal app/browser origin isolation.

Browser dependency installation and launch/close passed. Initial DNS host-mapping evidence passed routing validation. Native loopback health returned 200. The transient fresh-draft resolver was never reached; no assertion about its runtime fit or sequencing is made.

## First failure and correction

Native proof returned passed:false, receipts:[health HTTP 200], error:"Qualification window expired".

The actual window was still open. run-selector-lifecycle-session.sh exported QUALIFICATION_TEARDOWN_EPOCH in its calling shell, but qualify-native-session.sh forwarded only QUALIFICATION_RUN_ID in docker exec. Docker does not inherit caller environment exports. The native guard therefore computed an invalid deadline and refused before the first signup/mutation. This is a harness environment-contract failure, not expired authorization, capacity failure or provider rejection.

The narrow correction forwards the validated fourth positional argument explicitly as QUALIFICATION_TEARDOWN_EPOCH on that Docker exec. No guard or deadline is relaxed. Offline check-native-deadline.py extracts the actual invocation, proves the explicit argument survives an obsolete parent environment, and reproduces historical refusal with the flag removed. Bash syntax and git diff --check passed. Corrected full runtime behavior remains untested.

A local sandbox namespace failure required the approved escalated shell path. A read-only progress-file glob failed under Mac zsh and was corrected with bounded explicit file reads; neither affected the qualification invocation. The runtime attempt was not repeated.

## Separate receipts and cleanup

- Runtime/native: health and routing passed; signup, company/package fixture and draft POST were not reached.
- Browser: dependency launch/close only. Installed selector in either ordering and rendered identity untested.
- Lifecycle: disable/re-enable untested; restart/uninstall/upgrade/rollback remain deferred.
- Provider/model/OAuth calls: zero. Fresh synthetic state only; no retained credentials copied.
- Before stop, app/browser/probe reported OOMKilled=false; no terminal memory peaks are claimed.
- Exact app 47d681413282dfb0a3567648cf9800c9d009062edb1052d682391eb5cab8fd6e, browser 6bfcde8d0ac895ff41df0a8117d81afa60b5dbcd96b4e07a5c0542aaeba6880e and probe 397565b3fd31fb7447d7e0c1e68a23b2be8afd4dd7a93efd04c9021e43f11bf4 were ownership-checked and removed.
- Independent issue/run-filtered readback found no ephemeral containers; host health HTTP_000. Fresh labeled synthetic volume/network remain. Existing accounts, credentials, design links, production and unrelated maintenance/ were untouched.

Nadia owns reviewed deadline forwarding and the remaining selector/lifecycle qualification using unchanged successful outputs. Elena coordinates any replacement bounded zero-provider allowance after this evidence; the consumed allowance is not replayed. No rebuild, human login or additional RAM is indicated. Frozen preview and all other release gates remain unchanged; Theo's complete-candidate dependency stays open. No interim review wake, publication, timer or readiness claim.
