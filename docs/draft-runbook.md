# Draft installation and rollback runbook

Engineering preview `0.1.0-alpha.1`; not approved for release or deployment.
No npm publication is authorized. Package scope/name remains provisional.

## Compatibility and preparation

The unmodified Paperclip `2026.916.1` host at commit
`d554c4789ed3930f8a53ac9fdf6503b3187097da` does not provide the required RPC.
Worker initialization rejects that unsupported host. Only the isolated patched
source has been tested. A compatible built host must include the OAuth,
invocation, RPC, run-source, inspection, catalog and board-policy prerequisite patches plus the explicitly supplied host service
modules. This is an approved host prerequisite, not a standalone npm-only route;
the npm package never patches a running host. No broader host range is claimed.

Use the checkpoint's preparation/build commands. Retain the tarball SHA-256,
package inventory, integration commit and `dist/build-provenance.json` together.
Verify `npm pack` prepack checks and source/output digests before handoff. Normal
host typecheck, tests, build, hooks and CI remain mandatory; do not bypass them.

## Clean-instance procedure — not yet executed

1. Provision an authorized isolated VTS test host with the completed prerequisites
   through supported runtime controls. Use fresh database and managed secrets;
   never copy the running instance database, VTS/RTS credentials or browser login.
2. Unpack the reviewed tarball into a dedicated directory. The native plugin
   loader reads `package.json` → `paperclipPlugin.manifest` and its bundled worker.
   An authorized instance admin uses the existing Plugins install operation
   (`POST /api/plugins/install`, `packageName` = unpacked absolute directory,
   `isLocalPath` = true), subject to that instance's plugin-management policy.
   On cloud-managed hosts, only bundled-catalog sources are allowed; a local-path
   trick is not a supported bypass. Confirm that the chosen test host permits the
   native install route before proceeding. Do not label this step tested yet.
3. Confirm namespace migration, startup and restart persistence; use at least
   three design links across two files/two nodes. Verify labels, order, primary,
   stale revision handling, duplicate normalization and project/company isolation.
4. The preview now includes the managed connection/catalog prerequisite. Set up Figma
   only through Paperclip managed OAuth/setup, using a consenting VTS test identity
   and official remote MCP. Keep all secrets in the managed vault. Record actual
   client metadata, seat/call limits and shared-use behavior, without endorsement
   claims. Unknown/write tools stay denied. No Figma canvas changes.
5. Prove inspection through fresh eligible-agent runs, shared credentials, grant
   removal, protected-runtime denial, refresh contention and reconnect/revocation.
   Board verification uses native tools permission, explicit employee selection and the acting user’s native grant audience. Agent verification requires its own matching managed session. Neither synthetic check establishes live proof. Source delivery is wired through the shared
   wake renderer but full fresh-session execution and onboarding remain unproven; the Designs UI has isolated DOM/worker proof only, so no complete connector behavior is claimed.
6. Repeat actual native installation and managed setup on a second clean instance;
   prove no original checkout/instance dependency. Exercise upgrade, restart,
   disable/uninstall and recovery. Record exact commands and results, including
   every deferred check, for Theo's independent validation.

## Upgrade and rollback

Back up design association data according to instance retention policy before a
future upgrade. Preserve namespace and migration history. Do not downgrade schema
or delete attachments to recover executable code.

Disable the company plugin and remove Figma grants/installations using supported
controls to stop execution. Revert to a previously tested compatible host/plugin
revision if necessary. Keep `project_designs` and original design URLs. Disabling
and re-enabling the company plugin preserved links in the isolated RPC test;
full host upgrade/uninstall behavior is still deferred. Avoid destructive schema
uninstall options until retention compatibility has been independently reviewed.

## Isolated test placement

See [the hermes01 operator bundle](../operator/README.md) for pinned complete-source
preparation, non-deploying Compose validation, proposed memory containment, fresh
volumes, browser/OAuth origin and retention-safe stop/rollback instructions.
Elena must resolve the remaining host launch/capacity decision before any build
or runtime start. Source preparation is checked; container and lifecycle proof
remain unpassed.
