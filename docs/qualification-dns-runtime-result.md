# DNS-isolated native persistence and browser qualification

29 September 2026. Engineering remains incomplete. Executed one session under
Elena's 16:15–17:00 UTC allowance, teardown by 16:55, then finished offline.
No provider, model or OAuth calls; no existing credentials or database copied.

## Revisions and invocation

Preparation: ee9d4e8a03199dd43519d9627b262773d17e3c60.
Host: 2026.916.1 / d554c4789ed3930f8a53ac9fdf6503b3187097da.
Diagnostic product exports: 98fdec937d2f09f285fc1336ea17c7e6ddc38e29 plus
previously approved cap-only comparison. All 482 exported hashes matched.
Immutable arm64 dependency image:
ghcr.io/paperclipai/paperclip@sha256:4e2e1e59219129a4b687cd54ba439fb7fed0a5710af9f1551277dedd23dc61f1.
The frozen reproducible engineering package is unchanged; no product rebuild.

Run: d2bed7f5-c6dc-4cb7-82cd-91a977bba398. Executed through the exclusive
Mac docker-job wrapper, with the absolute Docker CLI PATH:

    /Users/nolan/vts-figma-test/bin/docker-job bash \
      /Users/nolan/vts-figma-test/dns-d2bed7f5-c6dc-4cb7-82cd-91a977bba398/run-session.sh \
      /Users/nolan/vts-figma-test/dns-d2bed7f5-c6dc-4cb7-82cd-91a977bba398 \
      d2bed7f5-c6dc-4cb7-82cd-91a977bba398

The committed qualification wrapper received START=1790698500,
TEARDOWN=1790700900, STOP=1790701200. Both boundaries were checked before
creation and launch. Credential-free browser preparation preceded the app;
DNS collection ran once in that capped preparation container after dependency
installation. The app had only a fresh internal network and fresh named state.
The separate browser shared only its network namespace, preserving localhost
origin, cookies and normal service workers without Mac port forwarding.

## Measured results

- Initial complete daemon/ancestor headroom: 7,623,065,600 bytes at
  16:17:17.591 UTC; disk 917,891,092,480 bytes. The 3648 MiB aggregate gate passed.
- App: 1536 MiB/no swap/one CPU/256 PIDs; browser/preparation:
  768 MiB/no swap/one CPU/256 PIDs. Probe: 64 MiB/no swap/0.25 CPU/32 PIDs.
  Effective cgroup checks passed. Full 1280 MiB host and 2 GiB disk reserves
  remained supervised. Final Docker readbacks preceded cleanup and are not
  terminal memory-peak measurements; no app/browser peak is claimed.
- DNS: observed 16:18:22.731 UTC, earliest TTL 77 seconds, expiry
  16:19:39.731 UTC. A answers and OS IPv4 set agreed; the exact pinned native
  guard accepted all observed addresses. Receipt records resolver 192.168.65.7
  and source hash. This is resolver provenance, not independent upstream
  authority or DNSSEC proof. Exact ExtraHosts validation passed in the live
  capped supervisor; native OS lookup/freshness checks passed before draft POST.
- Native health, synthetic signup/admin bootstrap, company creation, local
  plugin installation/configuration and remote draft creation passed. The draft
  returned HTTP 201 with native endpoint validation intact and provider egress
  disabled. No real managed connection or provider verification is claimed.
- Native attachment persistence passed: three links (two nodes in one file and
  another file), rename, reorder, primary, detach/re-add, stale revision and
  normalized duplicate rejection (inner 409), unchanged state after rejection.
  Final revision is 8. All links remain synthetic and unverified.
- Positive saved GitHub/design coexistence passed: the native repositoryUrls
  workspace remained byte-for-byte equal across attachment mutations. This
  proves stored association compatibility, not GitHub discovery/authentication.
- Served index matched installed output SHA-256
  7defb4746ac93ba8affd37fe6da4c40343a8918787c7ac98f9d1bfd2c354994a.
- Separate Chromium passed anonymous company denial (403), native sign-in,
  company access, project Designs navigation, normal service-worker-enabled
  reload, and keyed inner-200 readback exactly matching revision 8.
- Supervisor survived validation and browser completion. Outer session exit 0.

## Separate acceptance limits

Installed explicit-only selector/new-account/refetch/resume assertions were not
executed and remain deferred. Disable/re-enable/restart, upgrade/uninstall,
two-instance lifecycle/rollback, protected/concurrent employees, live credential
recovery, native skill audit and full-host/CI remain open. Local installation of
an extracted diagnostic package on the patched source host is not standalone
portability or release qualification. The completed owner-origin proof stands;
no further human login or attendance was needed here.

## Cleanup and preservation

Independent read-only wrapper invocation confirmed all exact ephemeral IDs absent:

- Preparation: 14f77c89e7148c1ad103d144765b316f8449cd649d4d1165912d05e0e00779cd
- Browser: 8892ab73b3dc88797b9d53bc8233b333870ee986560cb7e0469c27f449ed7dde
- App: f0b093e9c13f6ddb259fa9fefa69330faa12d9700079abc70a55758f005429b5
- Probe: 288ce8e3702abffc6366bd4280a14889b82003277bec01b0c56818e859ff1810

No current-run ephemeral containers remain; Mac-local health HTTP 000.
Fresh synthetic volume vts-figma-test-qual-d2bed7f5-state and internal network
6edad9982634272498b0f32f64ccd2890629a3ea8905c48a17771b7d4e7fcb26 retain
verified issue/run ownership. This populated state must not be replayed as a
fresh fixture. Existing human accounts, credentials, design links and production
resources were untouched. Access remains OFFLINE.

The local sandbox initially refused namespace creation; the approved escalated
shell path worked. Post-run scp brace expansion failed before transfer; an
explicit selected-file tar stream retrieved evidence without rerunning tests.
No qualification failure or retry occurred. Syntax checks of the adapted runner
passed before execution; documentation whitespace passed. No hooks/CI bypass.

Nadia owns specific selector/lifecycle assertions and remaining qualification;
Elena coordinates any next bounded execution allowance. No unchanged suite rerun
is needed for the passed DNS/native/browser cases. Theo's complete-candidate
review remains dependent; no interim wake, publication, timer or readiness claim.
