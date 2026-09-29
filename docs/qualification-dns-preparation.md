# Qualification DNS preparation — 29 September 2026

Preparation only. No DNS snapshot, mapping installation, container session or
provider call was performed. Runtime behavior and memory fit remain unverified.
The prior allowance is closed; Elena must coordinate replacement execution.

## Correction and provenance

The fixture keeps https://mcp.figma.com/mcp and the unchanged native endpoint
guard. Credential-free preparation resolves A records with TTL and independently
compares the OS resolver's IPv4 set. The native pinned guard checks every observed
address, including IPv6, with private networking disabled. Any disagreement,
empty/invalid answer, private address, timeout or source drift stops the session.

Pinned host: 2026.916.1 / d554c4789ed3930f8a53ac9fdf6503b3187097da.
Fresh upstream downloads and inspected native source establish:

- remote-http-endpoint-guard.ts SHA-256:
  5a7b994420e366cfed6548754466b033ce4b47c6c54dff08e2ab8f0dbcc33be4
- services/tool-access.ts:
  f7e23f80702cf4a79c75edf5e76f05cbbdbf9bebb9af959cfa13298c4f61fb2d
- routes/projects.ts:
  be872a91a17ae18643025b8e1abfef7cfa6b8539e05225fae852f7b93dcd7e04

Receipt records exact hostname, run UUID, resolver configuration, observation
time, answers/TTL and native-guard hash. Expiry is the earliest TTL, at most five
minutes from query start. This is resolver provenance, not DNSSEC authentication.
No IP is hardcoded. The conservative IPv4-only mapping rejects all nonpublic
answers; native validation is not replaced. If DNS changes between queries or
TTL expires before draft creation, stop; no automatic refresh/retry.

The pure receipt validator checks exact Docker ExtraHosts in the existing capped
supervisor, after its independent ownership/environment checks. The native
fixture rechecks freshness before any mutation and again immediately before the
draft POST, and verifies actual OS lookup equals the receipt's address set.
A mapping alone grants no egress: the app stays on its verified internal network,
the browser shares only that namespace, no additional network or socket mount.

## Exact proposed command integration

Use a newly coordinated run/window and fresh synthetic volume/network. First
prepare and export browser dependencies. Then in that already ownership-verified
credential-free preparation container (768 MiB/no swap/one CPU), copy the three
DNS modules and the hash-verified native guard. Run, before disconnecting it:

    node /app/collect-qualification-dns.mjs RUN_UUID /app/server/src/services/remote-http-endpoint-guard.ts

Capture stdout as qualification-dns.json using docker exec from the exclusive
wrapper. The collector has a ten-second deadline. Supply the receipt to the same
preparation container and run:

    node /app/dns-host-arguments.mjs /app/qualification-dns.json RUN_UUID

Capture stdout as dns-hosts.txt. Build the argument array without eval or host
Node (Mac Bash supports this form):

    dns_args=()
    while IFS= read -r entry; do
      dns_args+=(--add-host "$entry")
    done < dns-hosts.txt

Add "${dns_args[@]}" to the existing app docker-create argument array before
the immutable image reference. Keep every existing memory/CPU/network/storage
argument. Capture full inspect records, including ExtraHosts. The pure capped
validator refuses any missing, additional or changed host mapping. Do not reuse
a prior run's receipt, app or partially initialized state.

Transfer qualification-dns.mjs and qualification-dns.json alongside routing
modules into SESSION_DIR. Copy qualify-local-persistence.mjs as native-proof.mjs.
The committed wrappers now enforce the checks:

    bash qualify-routing-session.sh SESSION_DIR RUN_UUID START_EPOCH TEARDOWN_EPOCH STOP_EPOCH

The outer runner must retain dual time guards before resource creation and launch,
fresh complete 3648 MiB aggregate admission, app 1536 MiB/browser 768 MiB/probe
64 MiB, one CPU per app/browser, no swap, 1280 MiB host and 2 GiB disk reserves.
Proposal: one 45-minute zero-provider session with final five-minute cleanup.
All temporary containers require exact-ID ownership-checked finally cleanup.
No production resources, existing credentials or old state may be used.
The public DNS mapping remains proposed until the real receipt and native draft
POST succeed. No app launch is authorized by this document.

## Subsequent native prerequisite review

- createConnection validates company secret references first (fixture supplies
  none), then config.url via the endpoint guard. Fixture has no token-broker URL,
  Google Sheets configuration, local stdio template or existing application ID.
- It inserts the application/connection, default organization grant and secret
  binding metadata. ensureRuntimeSlot returns null for mcp_remote; creation does
  not perform remote discovery, OAuth or a tool call. Do not add health-check,
  catalog-refresh, connect or authorization requests to this zero-provider test.
- Project creation uses repositoryUrls, not repositoryIds: native URL
  normalization plus workspace persistence, without GitHub repository discovery.
  This proves stored GitHub/design coexistence only, not GitHub authorization.
- Attachment operations remain unverified-link persistence with revision CAS.
  Do not invoke designs.verify; it can cross the managed provider boundary.
- Existing browser script checks anonymous denial, synthetic sign-in, normal
  worker-enabled navigation/reload and keyed readback. It does NOT exercise
  explicit-only selector/new-account behavior or disable/re-enable/restart/
  upgrade/uninstall. Those require separate assertions/receipts before acceptance;
  transport success must not be labeled a selector/lifecycle pass.
- Internal-network asset loading remains a runtime prerequisite. Missing local
  assets or an attempted provider dependency must stop without enabling egress.

## Focused verification

Passed offline using synthetic DNS answers and the actual hash-verified native
guard:

    node scripts/check-qualification-dns.mjs PINNED_GUARD_PATH
    python3 scripts/check-routing-probe-shell.py
    node scripts/check-routing-probe.mjs

Covered TTL expiry/future time, wrong run/host/source, exact mapping mismatch,
resolver disagreement and private/mixed-family rejection. DNS functions are
injected mocks; no actual DNS lookup was made. Mock Docker ordering checks pass
independent ownership/limits/filesystem/image guards before execution. Node/Bash
syntax and git diff --check pass. Initial trailing whitespace was corrected.
No broad suite, product build, package replacement or native runtime pass claimed.

Nadia owns execution and remaining qualification after Elena's review/window
coordination. Existing frozen package, accounts and links remain unchanged.
Engineering and Theo's complete-candidate dependency remain incomplete.
