# Hermes authentication answer — Stage 1 assessment

26 September 2026. Engineering remains incomplete. This records the answer to interaction `86e02163-c74d-4fcd-956b-30da7b3dff9b`: “use the Hermes Claude.ai still authentication”. The interaction is answered; no pending-response claim remains. Conditional minimal host-extension approval remains accepted.

## Verified result

The pinned [Hermes OAuth implementation](https://github.com/NousResearch/hermes-agent/blob/06a495cc5b1f6baf429e02825103888dfbdf5ec7/tools/mcp_oauth.py#L1089) sets the Figma dynamic-registration client name to `Claude Code`, scope to `mcp:connect`, and token authentication to `client_secret_post` (lines 1089–1118). It explicitly describes selecting an allowlisted name. This is not evidence of a Claude.ai-hosted gateway or a recognized Paperclip registration. The answer identifies a compatibility reference but supplies no independent shared-use support record. The installed RTS Hermes revision remains unknown; no private installation or credentials were inspected.

[Figma remote installation documentation](https://developers.figma.com/docs/figma-mcp-server/remote-server-installation/) still limits remote access to catalog clients and directs new clients to its waitlist. Its documented Claude Code login applies to that client. [Access documentation](https://developers.figma.com/docs/figma-mcp-server/rate-limits-access/) does not establish the requested Paperclip company gateway arrangement. These findings do not prove a vendor denial of every possible arrangement; they leave the mandatory support gate unproven.

Managed `connections_search({query:"Figma"})` returned `{"version":1,"query":"Figma","results":[]}` in this run. No service identifier is available for a real managed setup request. No OAuth registration or login was attempted and no client identity was substituted.

## Gate disposition and next action

The approved plan expressly says a client-name workaround alone does not pass this gate. Consequently the answer does not unblock implementation. Existing host evidence and minimal extensions remain recorded in the [architecture addendum](/VIS/issues/VIS-6#document-architecture-addendum); no repeat host approval is required.

Concrete missing condition: recognized Paperclip client registration or an explicitly supported gateway arrangement covering Paperclip's actual redirects, authentication method and centrally managed multi-agent use. Elena owns scope coordination: relay existing non-secret vendor evidence if available, or retain the support hold; any outreach or alternative product workflow needs separate scope authorization. Nadia owns verifying that evidence before implementation. No additional task, timer or cross-company access is needed. Do not add a dependency on the parent because the parent already depends on this engineering issue.

Current host baseline: `2026.916.1` / `d554c4789ed3930f8a53ac9fdf6503b3187097da`. Integration evidence baseline: `ea8058a4a997a66bcd3282fd3d38780f01f1fd43`; this assessment's commit is recorded in the issue comment. No plugin revision or release candidate exists. Image attestation/supported target range, live runtime proof, implementation tests, tarball and clean-instance lifecycle checks remain deferred.

## Verification performed

- Read existing architecture evidence and checked `git status --short` (clean before this change).
- Downloaded the exact public Hermes source revision with `curl -fsS`; inspected relevant lines with `rg -n -C 8`. Browser retrieval of that raw URL failed with cache miss; terminal retrieval succeeded.
- Re-read official Figma remote installation/access pages; searched managed connections once.
- Documentation-only change: `git diff --check` is the applicable local verification. No product tests, hooks or CI results are claimed; no hooks are bypassed.
