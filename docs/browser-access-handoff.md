# Mac browser access — verified 28 September 2026, 19:38 UTC

This replaces the expired Hermes handoff. The obsolete login card is withdrawn. Current app is available until **20:30:18 UTC on 28 September**, or earlier memory/disk safety stop. No automatic restart.

## Adam: use your existing Mac account

Your unique Mac account named Adam now has verified native instance-administrator access and active membership in **VTS Mac Figma Proof**. Existing membership is preserved. No signup or identity resubmission is needed. This is a different user ID from hermes01.

Keep or establish the Mac SSH tunnel on your workstation:

    ssh -N -o ExitOnForwardFailure=yes -L 3310:127.0.0.1:3310 nolan@macbuilder01.skynet.local

If port 3310 is occupied by your old Hermes tunnel, close that old tunnel first. Use your normal SSH authentication; no synthetic test credentials are shared.

Refresh/sign into your existing account at http://localhost:3310/auth, select **VTS Mac Figma Proof**, then open:

http://localhost:3310/VTS/apps/connect?source=figma&stage=setup&resume=165fc3b9-48c8-4f20-a549-0f7ffe4b339f

This exact native setup route selects Adam's **Figma for the company** draft (`165fc3b9-48c8-4f20-a549-0f7ffe4b339f`), rather than the synthetic operator's personal fixture. Its application page is http://localhost:3310/VTS/apps/app/758d8c54-d7ba-4ea1-83f5-5d25a6c2ad77/permissions. Keep the current Mac account and company selected. Do not use the old personal fixture's Finish setup or Try again button. No new signup or identity submission is required. Use the new repair-outcome card after this attempt; old answered/withdrawn cards are historical.

The reported identity denial was real and correct: the failed native start selected personal fixture `50bbf85b-057d-47ca-b45e-a915f97fcbe5`, owned by the synthetic operator. The current native Add account flow can reuse a draft even with `new=1`; an explicit resume target removes that ambiguity for this handoff. The generic selector itself is not patched by this routing correction.

Adam already created the separate shared-policy draft. Native audit attributes its successful setup operations to Adam, and request logs show connect HTTP 201 followed by OAuth start HTTP 200 at 19:15, 19:17 and 19:20 UTC. No new authorization attempt was made by Nadia. This proves the corrected selection reaches native OAuth handoff; it does not prove completed consent. At inspection the connection remains draft/unchecked, its organization grant has zero credential secret references, and no live Figma retrieval is claimed. Credentials, OAuth state and provider handoff URLs remain inside managed setup.

The exact setup route and health returned HTTP 200 during this diagnosis. The existing deadline and safety stop still apply. The previous screenshot/outcome cards are answered or withdrawn; do not reuse them as pending requests.

## Callback repair verified

The separate shared callback permission defect is now corrected in the isolated host. Current instance-admin authority is queried and row-locked inside the credential-persistence transaction, after requiring active same-company non-viewer membership. Native callback tests with fresh PostgreSQL and synthetic transport passed eligible authority, rejected forged/revoked/ineligible authority without persisted secrets/grants, concurrent revocation, and personal identity protection. This is deterministic callback proof, not successful Figma consent.

The replacement app serves source SHA-256 18c7c72dbd3091c6b438e1a7adff060524d35b28172bedc5a265a9b26a778241; health/authentication, Adam's current admin/membership and the exact shared draft were reverified. The passed built UI is unchanged. **Resume on the exact route above**, then use the native sign-in action for a fresh managed OAuth attempt. Do not reuse an old provider handoff URL. Shared connection is still draft/unchecked until actual consent completes.

## Verified evidence

- Unique Adam account: `3enr8wLy3EcfIz4gFpApkvg7qwO4IZsj`; native admin API readback `isInstanceAdmin:true`; active company `e36aa1e8-e20b-469e-a661-a2ff66d77536`. Membership update preserves all existing memberships; no old Hermes ID reused.
- Historical synthetic-fixture application ID `e79053b6-912b-48b4-ad36-14756aa96ced` (not Adam’s current setup target). Authenticated gallery contains official Figma MCP OAuth. Direct route HTTP 200 serves exactly the built index. Native admin login and authentication readiness pass. These are API/served-asset checks, not a new Adam browser-session or OAuth pass.
- Host `2026.916.1 / d554c4789ed3930f8a53ac9fdf6503b3187097da`; installed package/build input `81e2b0a3cdc988d1fc33dd16765b4dede547d3fb`; package SHA-256 `a60b877632c792caeaf37d1c312ce8b7e7330c0afae152a93a1eff335bcc551e`; served index SHA-256 `6f737c016f469c4dd4d73e4339e5fd76a209f6c301b32d82b9f6114745207f70`. Reused passed UI, no rebuild.
- Fresh daemon/ancestor headroom 6,511,276,032 bytes; complete ancestor evidence; disk free 919,066,681,344 bytes. Admission passed both the probe's reported 3328 MiB comparison and explicit 2880 MiB app gate. Effective app 1536 MiB, zero swap, one CPU, 256 PIDs. Observed peak 1,354,153,984 bytes; zero own OOM events at readback. Full 1280 MiB host and 2 GiB disk reserves enforced by existing guard.

## Lifetime, storage and safe stop

Owned active container `65d011fed1d335626610f4f1e5e23e7337131a1bf65bff1b4b7f4ceb60e78b48`, name `vts-figma-test-mac-4cbab8ab-access`; labels issue VIS-6 and run `4cbab8ab-538c-44de-b9e9-7f09f273cd99`. Docker AutoRemove=true: deadline/safety stop removes this temporary container. Admission probe also auto-removed. No additional cleanup task or broad cleanup performed.

Retained isolated state volume `vts-figma-test-mac-c69805a3-runtime-state` and isolated network `vts-figma-test-mac-c69805a3-runtime-net` were ownership-verified before reuse. Account and design data remain in the named test volume; build/UI assets remain in the Mac job output directory. No production mounts, Docker socket, production actions or cross-company credentials.

Operator stop: through `/Users/nolan/vts-figma-test/bin/docker-job`, first inspect the exact container and verify both ownership labels, then `docker stop 65d011fed1d335626610f4f1e5e23e7337131a1bf65bff1b4b7f4ceb60e78b48`. Do not remove the named state volume. After expiry or safety stop, report unavailable; Nadia must obtain fresh admission and prepare a newly bounded access session before another link is offered. Do not restart blindly.

Engineering remains incomplete. Consent/shared-agent/protected-runtime, full-host/CI, complete onboarding, exact-revision reproducibility and both clean-instance lifecycle gates remain open.
