# Isolated Figma browser access — 28 September 2026

The test app is available for your own browser until **04:00 UTC on 28 September
2026**, unless a safety reserve is breached first. This is a development test,
not production or release acceptance. Nadia owns the service and follow-up.

## Open your browser

On your own computer, using your existing SSH access to hermes01, run:

```sh
ssh -N -o ExitOnForwardFailure=yes -L 3310:127.0.0.1:3310 hermes01
```

Keep that terminal open. If your SSH configuration needs a username, use your
existing hermes01 SSH alias/account. Open **http://localhost:3310/auth**.
Keep exactly `localhost:3310` throughout native login and Figma authorization;
do not substitute another local port or the hermes01 hostname in the browser.
The app listens on port 3310 and Docker exposes only hermes01 loopback port 3310.
No public port or production proxy was changed.

Choose native account creation and use your own email and a new test password.
Do not reuse or request the synthetic test account. Reply to the saved task card
once signed in, with your chosen display name (no password, cookies or tokens).
A new account may initially have no companies: that is expected.
Nadia will identify your new native account and grant access only to the retained
VTS test company through the native admin company-access API. Nadia will preserve
any existing memberships and set only the test permissions needed for Connect.
This avoids distributing bearer invitation links or synthetic credentials.

After Nadia confirms membership, refresh, choose the VTS test company, open Apps,
select Figma and use **Add account** (or a fresh native Finish setup action).
Complete Figma's own login/consent in that browser. Use only your authorized VTS
test identity. Do not paste OAuth URLs, passwords or tokens into this task.
A stale setup attempt should be restarted through the native UI, not by reusing
an old OAuth URL. The callback origin is `http://localhost:3310`, path
`/api/tools/oauth/callback`; keep the SSH tunnel open until it returns.
Human consent and the actual workstation tunnel round trip remain untested.

## Verified in this preparation

- One app-only start, at 01:43:57 UTC; no UI rebuild or Chromium process.
- Fresh daemon/ancestor headroom at 01:42:41 UTC: 3,313,926,144 bytes,
  above 3,019,898,880 bytes (2880 MiB = app 1536 + probe 64 + reserve 1280).
  Complete ancestor hierarchy; no finite ancestor limit reduced headroom.
  Disk free 5,400,633,344 bytes; 2 GiB reserve retained.
- App configuration and effective limits: 1536 MiB, zero swap, one CPU,
  256 PIDs. Observed peak 1,359,106,048 bytes; zero own OOM events at check.
- Health authenticated/private, bootstrap ready: HTTP 200. Native private
  synthetic sign-in, company membership, Figma catalog and admin-user access:
  HTTP 200. Credentials and cookies stayed inside the isolated test app.
- Patched HTML and all referenced built assets: HTTP 200. Retained catalog
  chunk contains the official Figma MCP endpoint. UI source was not rebuilt.
- Callback route rejects anonymous access with 403 and authenticated missing
  state with 400, as pinned native policy requires. Matching internal/external
  port and explicit localhost auth origin preserve the tunnel callback URL.
  This is callback readiness, not a completed OAuth exchange through SSH.
- Initial HTTP checks occurred before startup was ready and returned connection
  refused; subsequent readiness checks passed without restarting the app.
- Previous real browser rendering is retained evidence; this run performs no
  browser acceptance check. All other release gates remain open.

## Bounded service and recovery

No realized Paperclip execution workspace is assigned, so the explicitly
approved Docker handoff is used. An imported test-only guard checks host available
memory and test-volume disk every two seconds. It terminates the server on a
1280 MiB host-reserve breach, 2 GiB disk-reserve breach, missing evidence, or
04:00 UTC expiry; it sends SIGTERM and forces exit after ten seconds if needed.
The verified ancestor limits were unlimited at admission. The app retains its
hard cgroup limits. No automatic restart, agent timer or capacity polling is set.
The guard provides sampled protection, not an instantaneous capacity guarantee.

If access fails, report the non-secret error in the saved task card. Do not
restart containers yourself or change ports. Nadia verifies the exact owned app,
its guard reason, fresh headroom and retained state before any separately routed
recovery. An expired window is not authorization for an automatic restart.
Closing SSH only closes your tunnel; the app remains bounded by the above guard.

For an authorized operator to stop early on the supplied rootless Docker
connection, first inspect this exact ID and confirm the name and issue label:

```sh
docker inspect --format '{{.Name}} {{index .Config.Labels "vts.figma.issue"}}' c1e1180a6d74c5e690b8d8bd1cad42a975071c2fd06768025ffc3f89c109d90b
# Required: /vts-figma-test-ui-f62ac13d VIS-6
docker stop --time 30 c1e1180a6d74c5e690b8d8bd1cad42a975071c2fd06768025ffc3f89c109d90b
```

Preserve volume `vts-figma-test-source-8ec3a4a7-state`, isolated network
`vts-figma-test-source-8ec3a4a7-egress`, built UI and design links. Do not remove
volumes or use prune, bulk operations, production Compose, or any production
container action. No Docker socket or production storage is mounted.

## Provenance

Host `2026.916.1` / `d554c4789ed3930f8a53ac9fdf6503b3187097da`.
Dependency image `sha256:a02ac35ac41df911af477422ea0e781cf41d2b2c600c66f0a5ac9d8c63f52c2c`.
Successful UI build input `b0797eb011509e4ecca427ab3fa4b0610f85ae7f`;
previous repository HEAD `05f86854775e87af38946619f691e4e5d3be6a5a`.
App ID as above. Probe `a6fe7545efc7ba1496272b7d3eea95b3d69f54a22205a24499f48c0c14cb80ad`
is stopped and retained. Its effective limits were 64 MiB/no-swap, 0.25 CPU,
32 PIDs, no network/mounts, read-only root; zero own OOM events.

Engineering remains incomplete: actual human consent, Designs browser acceptance,
shared-agent/protected-runtime proof, full-host/CI, onboarding and both clean
installation/lifecycle gates have not passed. No publication or production change.
