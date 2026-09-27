# Source runtime smoke — 27 September 2026

Engineering is incomplete. This is real source-runtime/HTTP evidence, not full-host compilation, a clean npm installation, browser acceptance, or live OAuth/shared-agent proof.

## Inputs and actual preparation

- Integration input: `be66795ba1facf16f162de9db971ee938b87b5a2`.
- Host: `2026.916.1`, source `d554c4789ed3930f8a53ac9fdf6503b3187097da`.
- Public source archive SHA-256: `f7a2049c2f10accc455b50ec4821ff100e0daa53074a23cf05398f83c12f0baa`.
- Existing engineering tarball SHA-256: `6749aeba84deb725e99ffe7b9aca8077b05bbf60c0a4277221721023814b4109` (operator-bundle checkpoint; product code through `3902378`). No new npm package was built.
- Immutable upstream dependency image: `ghcr.io/paperclipai/paperclip@sha256:a02ac35ac41df911af477422ea0e781cf41d2b2c600c66f0a5ac9d8c63f52c2c`.
- Image and pinned archive dependency lock SHA-256 agree: `af3b879fea127a608b0f9279627f357638299441bbf41835f0b91ab0162e441c`. This reuses immutable image dependencies; it is not an independently reproduced image build.
- `node operator/prepare-context.mjs SOURCE.tar.gz CANDIDATE.tgz EXPECTED_SHA256 NEW_CONTEXT` verified source baselines and applied all seven approved patches.
- Pinned `server/package.json` declares `dev: tsx src/index.ts`. Actual source launch: `node --import ./server/node_modules/tsx/dist/loader.mjs server/src/index.ts`.
- Copied patched server/shared/adapter-utils/SDK source and unpacked engineering package into a fresh test container. No production dependency, database, storage or socket mount. No production-container action.

## Executed sequence and failures

The checked-in Python scripts preserve the executed startup and login sequence. They expect this run's prepared `runtime/host` and inputs under PAPERCLIP_RUN_SCRATCH_DIR; they are experimental operator harnesses, not a turnkey installer. Do not blindly replay against existing resource names.

1. `python3 operator/source-runtime-smoke.py`: 1.5 GiB hard memory/no swap, 1 CPU, 256 PIDs; preflight requires 1.25 GiB reserve. Initial visible available RAM 3,200,245,760 bytes. Inside daemon test process: 3,205,025,792 bytes available, 6,686,679,040 bytes disk free; 2 GiB disk reserve. Effective cgroup limits verified. Source health became OK after 42.93 seconds, peak memory 1,103,466,496 bytes, no OOM events. Fresh embedded PostgreSQL migrated successfully.
2. Real HTTP company/project creation returned 201. Figma native gallery returned 200. Initial official metadata preflight failed with remote_http_dns_failed because the first network was internal-only.
3. Local native plugin installation reached its worker but returned 400: Host does not handle method projectDesigns.execute. The immutable image SDK dist still needed the approved SDK patch compiled.
4. `pnpm exec tsc -p packages/plugins/sdk/tsconfig.json --singleThreaded` could not run: Corepack attempted a package-manager download on the internal network (EAI_AGAIN). No compiler started in that command.
5. `node /app/node_modules/typescript/bin/tsc -p /app/packages/plugins/sdk/tsconfig.json --singleThreaded` inside the bounded test container exited 0 with no diagnostics. Only SDK compilation; no full-host check. This used the image's already-installed compiler directly.
6. Created separately labeled egress network, connected only this test container, and restarted it. Plugin recovered to ready through native startup.
7. Figma native preflight returned 200: endpoint reachable, OAuth metadata found, registration advertised. No login, token exchange or user design retrieval occurred.
8. Created a draft, disabled OAuth connection with empty credential refs via native API. Scoped plugin GET returned revision 0; POST added synthetic file SmokeFixture123/node 1:2; GET returned the same attachment at revision 1 and unverified status. All three returned 200. This proves HTTP/worker/database save/read, not access to that synthetic Figma file.
9. Stopped the unauthenticated smoke container. `python3 operator/source-runtime-login.py` creates a separate authenticated container using the same fresh test volume, patched source, built SDK and package. Native secret bootstrap generates secrets only inside the test volume; none are in artifacts or logs.
10. Authenticated /api/health: 200, status ok; /: 200 text/html; unauthenticated /api/companies: 403. Effective memory 1,610,612,736, swap 0, CPU 100000/100000; final observed peak 1,381,826,560 bytes, no OOM events. Login startup visible available RAM 3,284,492,288 bytes.

Python syntax compilation and git diff --check passed. No unchanged product suites, full compiler, package rebuild or CI repeated. No hooks bypassed.

## Retained exact test resources

All resources carry VIS-6/run ownership labels (run 8ec3a4a7-70e3-4db6-aa8e-e96cbb4a5985).

- Stopped smoke: vts-figma-test-source-8ec3a4a7, ID d7aa4012d1af5742b9a5ad0c715e15b32eba80c1a4f8d0fd19bb7450f65c4790.
- Running authenticated login: vts-figma-test-source-8ec3a4a7-login, ID c0c2552ce0d3f6d7b017f657b38bce48a0128dc7bd650e93e673af9d58833af3.
- Fresh persistent test volume: vts-figma-test-source-8ec3a4a7-state.
- Internal network: vts-figma-test-source-8ec3a4a7-net, ID 3b95509579f62b2e512681950008586bbafa9c4b77fb926119d0674516f7f2a8.
- Separate egress network: vts-figma-test-source-8ec3a4a7-egress, ID dfd16079ad9aa5e50f97bda24c0dd5ef7a49fc18e37e21c0834ffe6af5f005fe.
- Synthetic company c10611ce-cb61-4f41-af14-e0eadf5141df; project fcdea0b4-fa2f-4fd7-bc72-3db3d3ebea1b; plugin c4fdf200-1779-4f0b-aec4-1f3849113732.
- Attachment e9204aa4-f23e-40ee-8960-15757dbda914; draft connection 45dc77f6-d475-4c62-a229-e4d7f39d86bd. Neither represents live Figma access.

## Access, retention and next action

The Docker host binds only 127.0.0.1:3310. On hermes01 open http://localhost:3310; a remote operator with existing SSH access can use `ssh -N -L 3310:127.0.0.1:3310 hermes01` and open that URL locally. SSH/browser reachability was not tested from the user's workstation. This is not a public preview URL.

Authenticated HTML is served from the immutable image; this is not an independent UI build or browser validation. Native account/bootstrap and company membership must be completed before managed Figma setup. Do not put bootstrap tokens or Figma credentials in comments. Only native managed setup may hold the authorization.

Nadia owns native account/setup preparation and remaining engineering; Elena coordinates the authorized VTS test operator/identity and readable fixture links. Live OAuth, two fresh eligible-agent sessions, grants/protected runtimes, full onboarding, browser, both clean-instance lifecycle gates and full-host/CI remain unpassed. The source runtime does not waive them.

Before any subsequent test mutation, inspect its exact ID and verify the run/issue labels. To release idle capacity, stop only the authenticated test ID above after ownership verification with `docker stop --time 30 ID`. Preserve the named test volume and links. Re-start only that verified test ID when authorized test work resumes. No bulk cleanup, volume removal, production Compose commands or paperclip-* actions. Only one app container is running; no timers or automatic retries were created.
