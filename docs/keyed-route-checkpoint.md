# Keyed Designs authority wiring — 28 September 2026

Fixed `scripts/build-invocation-patch.mjs` and its generated host prerequisite so
both keyed browser routes capture the same host-owned authority as legacy bridge
routes. No UI rebuild or permission promotion is required. Original actor,
company and project validation remain in the existing authority/policy service.

Host baseline: `2026.916.1`, `d554c4789ed3930f8a53ac9fdf6503b3187097da`.
The installed isolated route exactly matched the previous generated patch.
The corrected route was copied into the stopped test app and read back byte for
byte. Built UI, accounts, memberships and persistent design links were preserved.

## Verification and limits

- `node scripts/build-invocation-patch.mjs`: passed baseline hashes and generation.
- Old and new patches applied to isolated copies of the pinned route and worker
  source; installed old route matched exactly. Initial scratch Git invocation
  used an unsupported absolute `--directory`; corrected to `git -C` with a
  prepared tree. No running production source was changed.
- `FIGMA_PATCHED_ROUTES="$PAPERCLIP_RUN_SCRATCH_DIR/runtime-plugins-after.ts" node --test test/host-keyed-route-authority.mjs`: passed both keyed routes. Executes
  generated forwarding blocks with real authority maps and a simulated worker
  boundary. Covers actor forgery, missing project/company, non-board actor and
  invocation company mismatch. Error construction is stubbed; HTTP/database
  policy and actual worker transport are not proven by this check.
- Initial regression harness parsed a top-level return as TypeScript and failed;
  corrected parsing boundary, then passed.
- `node scripts/check-host-invocation.mjs`: preparation refused source drift in
  `/app/packages/adapters/codex-local/src/server/execute.ts` following launcher
  recovery. No authority lifecycle test ran; no baseline hash was relaxed.
- `git diff --check`: passed. No hooks or CI bypassed. No broad suite, compiler,
  npm rebuild or release validation performed.

## Runtime outcome

Exact app: `c1e1180a6d74c5e690b8d8bd1cad42a975071c2fd06768025ffc3f89c109d90b`,
`vts-figma-test-ui-f62ac13d`, issue label VIS-6, ownership run
`f62ac13d-4a58-4257-9f7a-b4c48d5112fc`. Inspected ownership, sole test-volume mount,
isolated network and 1536 MiB RAM/no swap/one CPU before stopping it once for the
source correction. Existing 04:00 UTC expiry and reserve guard remain unchanged.

Fresh daemon/ancestor headroom: **2,997,088,256 bytes**, admission **3,019,898,880**
(2880 MiB), shortfall **22,810,624 bytes / 21.75 MiB**. Complete ancestor evidence;
disk free **5,350,305,792 bytes**, above the 2 GiB reserve. Admission failed, so
**no app restart occurred**. The app is offline; do not ask the user to retry.

Probe `4379b17309c008a63157d0cc8ad1e45d1009847a27c815f21df716dc3f7448d8`
was created with 64 MiB/no swap, 0.25 CPU, 32 PIDs, read-only root, dropped caps,
node user, no mounts/network and host cgroup namespace for read-only ancestor
observation. It ran `node --input-type=module -e` with unchanged
`operator/ui-capacity.mjs`; stopped and retained. Its generic 3328 MiB display is
not the app admission: the explicit app threshold above was evaluated separately.
Dependency image remains
`sha256:a02ac35ac41df911af477422ea0e781cf41d2b2c600c66f0a5ac9d8c63f52c2c`.

## Next action

Elena coordinates a qualifying app-only recovery window. Nadia then verifies fresh
2880 MiB daemon/ancestor admission, effective app limits and reserves, starts only
the retained app once within the existing expiry (or a separately coordinated
window), verifies actual keyed list body and a non-destructive keyed action
round trip, and confirms UI availability before user retry. Prefer identity
reorder with the current revision, preserving every attachment field and link.
No restart loop or build is needed. The pending consent card is preserved, but
capacity/runtime recovery is the immediate blocker. HTTP keyed response, browser
acceptance, human consent and all other release gates remain unpassed.
