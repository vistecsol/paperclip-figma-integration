import { describe, expect, it } from "vitest";
import { fileURLToPath } from "node:url";
import { createPluginWorkerHandle } from "../services/plugin-worker-manager.js";
import { captureFigmaApiAuthority, resolveFigmaApiAuthority } from "../services/figma-api-authority.js";

const manifest = { id: "vistecsol.figma", apiVersion: 1, version: "0.1.0-alpha.1",
  displayName: "Figma test", description: "Isolated authority proof", author: "VTS",
  categories: ["automation"], capabilities: [], entrypoints: { worker: "fixture.cjs" } } as const;

describe("host-only original actor over real worker RPC", () => {
  it("retains key scope without serializing it and expires authority after completion", async () => {
    let captured: ReturnType<typeof resolveFigmaApiAuthority> | undefined;
    const handle = createPluginWorkerHandle("figma-test", {
      entrypointPath: fileURLToPath(new URL("./fixtures/figma-authority-worker.cjs", import.meta.url)),
      manifest: manifest as any, config: {}, apiVersion: 1,
      instanceInfo: { instanceId: "isolated", hostVersion: "2026.916.1" }, autoRestart: false,
      hostHandlers: { "companies.get": async (_params, context) => {
        captured = resolveFigmaApiAuthority(context);
        return { id: "company" } as any;
      } },
    });
    await handle.start();
    try {
      const input = { companyId: "company", params: { projectId: "project" },
        actor: { actorType: "agent", actorId: "agent", agentId: "agent", runId: "run" } } as any;
      const actor = { type: "agent", agentId: "agent", companyId: "company", runId: "run",
        source: "agent_key", keyScope: "task_bridge", companyIds: ["company"] } as any;
      captureFigmaApiAuthority(input, actor, "company", "project");
      actor.companyIds.push("forged");
      const response = await handle.call("handleApiRequest", input) as any;
      expect(response.serialized).not.toContain("keyScope");
      expect(response.serialized).not.toContain("task_bridge");
      expect(captured!.authority.actor).toMatchObject({ source: "agent_key", keyScope: "task_bridge", companyIds: ["company"] });
      expect(() => captured!.assertActive()).toThrow("Design invocation is unavailable");
      // An envelope clone/worker-provided actor has no host map identity.
      await expect(handle.call("handleApiRequest", structuredClone(input))).rejects.toThrow("Design invocation is unavailable");
      // Company-only proactive scope is insufficient, even with matching IDs.
      expect(() => resolveFigmaApiAuthority({ invocationScope: { companyId: "company" } })).toThrow();
    } finally { await handle.stop(); }
  });

  it("invalidates in-flight authority when the top-level invocation times out", async () => {
    let captured: ReturnType<typeof resolveFigmaApiAuthority> | undefined;
    let release!: () => void;
    const wait = new Promise<void>(resolve => { release = resolve; });
    const handle = createPluginWorkerHandle("figma-timeout-test", {
      entrypointPath: fileURLToPath(new URL("./fixtures/figma-authority-worker.cjs", import.meta.url)),
      manifest: manifest as any, config: {}, apiVersion: 1,
      instanceInfo: { instanceId: "isolated", hostVersion: "2026.916.1" }, autoRestart: false,
      hostHandlers: { "companies.get": async (_params, context) => {
        captured = resolveFigmaApiAuthority(context);
        await wait;
        captured.assertActive();
        return { id: "company" } as any;
      } },
    });
    await handle.start();
    try {
      const input = { companyId: "company", params: { projectId: "project" } } as any;
      captureFigmaApiAuthority(input, { type: "board", userId: "user" } as any, "company", "project");
      await expect(handle.call("handleApiRequest", input, 200)).rejects.toThrow("timed out");
      expect(captured).toBeDefined();
      expect(() => captured!.assertActive()).toThrow("Design invocation is unavailable");
    } finally { release(); await handle.stop(); }
  });
});

it("built worker refuses a host without the fixed-operation prerequisite", async () => {
  const root = process.env.FIGMA_INTEGRATION_ROOT;
  if (!root) throw new Error('FIGMA_INTEGRATION_ROOT required');
  const handle = createPluginWorkerHandle('unsupported-host-test', {
    entrypointPath: root + '/dist/worker.mjs', manifest: { id: 'vistecsol.figma', apiVersion: 1, version: '0.1.0-alpha.1', displayName: 'Figma',
      description: 'Unsupported host proof', author: 'VTS', categories: ['workspace'], capabilities: [],
      entrypoints: { worker: './dist/worker.mjs' } },
    config: {}, apiVersion: 1, instanceInfo: { instanceId: 'isolated', hostVersion: '2026.916.1' },
    autoRestart: false, hostHandlers: {},
  });
  try { await expect(handle.start()).rejects.toThrow(); }
  finally { await handle.stop(); }
});
