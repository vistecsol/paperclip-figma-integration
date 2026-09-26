import { pathToFileURL } from 'node:url';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { beforeAll, afterAll, expect, it } from 'vitest';
import { eq, sql } from 'drizzle-orm';
import { createDb, companies, projects, agents, issues, heartbeatRuns, plugins } from '@paperclipai/db';
import { pluginDatabaseService, derivePluginDatabaseNamespace } from '../services/plugin-database.js';
import { withFigmaProjectTransaction } from '../services/figma-project-transaction.js';
import { startEmbeddedPostgresTestDatabase } from './helpers/embedded-postgres.js';
const root = process.env.FIGMA_INTEGRATION_ROOT;
if (!root) throw new Error('FIGMA_INTEGRATION_ROOT required');
const { designStore } = await import(pathToFileURL(join(root, 'src/storage.mjs')).href);
const { hostDesignOperations } = await import(pathToFileURL(join(root, 'src/host-operations.mjs')).href);
const pluginId = randomUUID();
const manifest = (await import(pathToFileURL(join(root!, 'dist/manifest.mjs')).href)).default;
function storeFor(tx: typeof db) {
  const service = pluginDatabaseService(tx);
  return designStore({ namespace: derivePluginDatabaseNamespace(manifest.id, 'figma'),
    query: (statement: string, params: unknown[]) => service.query(pluginId, statement, params),
    execute: (statement: string, params: unknown[]) => service.execute(pluginId, statement, params) });
}
let database: Awaited<ReturnType<typeof startEmbeddedPostgresTestDatabase>>;
let db: ReturnType<typeof createDb>;
let companyId: string, projectId: string, otherProjectId: string, agentId: string;
beforeAll(async () => {
  database = await startEmbeddedPostgresTestDatabase('figma-project-policy-');
  db = createDb(database.connectionString);
  await db.insert(plugins).values({ id: pluginId, pluginKey: manifest.id, packageName: '@vistecsol/paperclip-figma-integration', version: manifest.version,
    apiVersion: 1, categories: manifest.categories, manifestJson: manifest, status: 'installed', installOrder: 1 });
  await pluginDatabaseService(db).applyMigrations(pluginId, manifest, root!);
  [companyId] = (await db.insert(companies).values({ name: 'Synthetic VTS policy fixture', issuePrefix: 'FTP' }).returning()).map(x => x.id);
  [projectId, otherProjectId] = (await db.insert(projects).values([{ companyId, name: 'Designs' }, { companyId, name: 'Other' }]).returning()).map(x => x.id);
  [agentId] = (await db.insert(agents).values({ companyId, name: 'Synthetic engineer', role: 'ceo', adapterType: 'process' }).returning()).map(x => x.id);
});
afterAll(async () => { await database?.cleanup(); });
async function fixture(workMode = 'standard', status = 'running', conversation = false) {
  const [issue] = await db.insert(issues).values({ companyId, projectId, title: 'Synthetic task', workMode, assigneeAgentId: agentId,
    ...(conversation ? { conversationAgentId: agentId, conversationUserId: 'synthetic-user', conversationState: 'active' as const, conversationSessionGeneration: 2 } : {}) }).returning();
  const [run] = await db.insert(heartbeatRuns).values({ companyId, agentId, status, nativeIssueId: issue.id,
    contextSnapshot: { issueId: issue.id, conversationSessionGeneration: 1 } }).returning();
  return { run, authority: { companyId, projectId, actor: { type: 'agent' as const, source: 'agent_jwt' as const, companyId, agentId, runId: run.id } } };
}
it('original local board authority reads a real project and rejects a mismatched company', async () => {
  const authority = { companyId, projectId, actor: { type: 'board' as const, source: 'local_implicit' as const, userId: 'local-board' } };
  await expect(withFigmaProjectTransaction(db, authority, false, async () => 'ok')).resolves.toBe('ok');
  await expect(withFigmaProjectTransaction(db, { ...authority, companyId: randomUUID() }, false, async () => 'bad')).rejects.toThrow('unavailable');
});
it('nonmember board session cannot replace authenticated authority', async () => {
  await expect(withFigmaProjectTransaction(db, { companyId, projectId, actor: { type: 'board', source: 'session', userId: 'not-a-member' } }, true, async () => 'bad')).rejects.toThrow('denied');
});
it('real task/run policy accepts a current same-project run and retains its row lock through work', async () => {
  const { authority, run } = await fixture();
  await expect(withFigmaProjectTransaction(db, authority, true, async () => {
    await expect(db.transaction(async tx => {
      await tx.execute(sql`select id from heartbeat_runs where id = ${run.id} for update nowait`);
    })).rejects.toMatchObject({ cause: { code: '55P03' } });
    return 'committed';
  })).resolves.toBe('committed');
});
it('Ask and Plan reject writes, while Plan permits project reads', async () => {
  for (const mode of ['ask', 'plan']) {
    const { authority } = await fixture(mode);
    await expect(withFigmaProjectTransaction(db, authority, true, async () => 'bad')).rejects.toThrow('Ask or Plan');
    await expect(withFigmaProjectTransaction(db, authority, false, async () => 'read')).resolves.toBe('read');
  }
});
it('cancelled runs, changed conversation sessions, and another project fail before work', async () => {
  const cancelled = await fixture('standard', 'cancelled');
  await expect(withFigmaProjectTransaction(db, cancelled.authority, true, async () => 'bad')).rejects.toThrow('active run');
  const stale = await fixture('standard', 'running', true);
  await expect(withFigmaProjectTransaction(db, stale.authority, true, async () => 'bad')).rejects.toThrow('session has changed');
  const current = await fixture();
  await expect(withFigmaProjectTransaction(db, { ...current.authority, projectId: otherProjectId }, true, async () => 'bad')).rejects.toThrow('differs');
  await expect(withFigmaProjectTransaction(db, { ...current.authority, actor: { ...current.authority.actor, source: 'agent_key' } }, true, async () => 'bad')).rejects.toThrow('authenticated agent run');
});
it('failed work rolls back its real database mutation', async () => {
  const { authority } = await fixture();
  await expect(withFigmaProjectTransaction(db, authority, true, async tx => {
    await tx.update(projects).set({ name: 'must roll back' }).where(eq(projects.id, projectId));
    throw new Error('synthetic failure');
  })).rejects.toThrow('synthetic failure');
  expect((await db.select().from(projects).where(eq(projects.id, projectId)))[0].name).toBe('Designs');
});

it('actual plugin attachment writes commit with host policy and roll back on transaction failure', async () => {
  const { authority } = await fixture();
  let failCommit = true;
  const operations = hostDesignOperations({ withProject: (_request: unknown, write: boolean, work: any) =>
    withFigmaProjectTransaction(db, authority, write, async tx => {
      const result = await work({ companyId, projectId, store: storeFor(tx),
        // Synthetic connection decision only; managed grants remain a separate gate.
        authorizeConnection: async () => {} });
      if (failCommit) throw new Error('abort after attachment write');
      return result;
    }) });
  const add = { type: 'add', expectedRevision: 0, connectionId: 'synthetic-connection', url: 'https://figma.com/design/FileA?node-id=1-2' };
  await expect(operations.mutate({}, add)).rejects.toThrow('abort after attachment write');
  expect((await storeFor(db).read(companyId, projectId)).revision).toBe(0);
  failCommit = false;
  await operations.mutate({}, add);
  expect((await storeFor(db).read(companyId, projectId)).attachments).toHaveLength(1);
  await db.update(heartbeatRuns).set({ status: 'cancelled' }).where(eq(heartbeatRuns.id, authority.actor.runId));
  await expect(operations.mutate({}, { ...add, expectedRevision: 1, url: 'https://figma.com/design/FileB' })).rejects.toThrow('active run');
  expect((await storeFor(db).read(companyId, projectId)).revision).toBe(1);
});

it('real worker fixed RPC persists only the captured request and denies foreign connections and disabled companies', async () => {
  const { toolApplications, toolConnections, pluginCompanySettings } = await import('@paperclipai/db');
  const { createPluginWorkerHandle } = await import('../services/plugin-worker-manager.js');
  const { captureFigmaApiAuthority } = await import('../services/figma-api-authority.js');
  const { createHostClientHandlers } = await import('@paperclipai/plugin-sdk');
  const { buildHostServices } = await import('../services/plugin-host-services.js');
  const [app] = await db.insert(toolApplications).values({ companyId, name: 'Figma synthetic', type: 'mcp' as any }).returning();
  const [connection] = await db.insert(toolConnections).values({ companyId, applicationId: app.id, name: 'Figma synthetic', uid: randomUUID(),
    transport: 'mcp_remote', authKind: 'oauth', config: { url: 'https://mcp.figma.com/mcp' } }).returning();
  const [project] = await db.insert(projects).values({ companyId, name: 'RPC isolated' }).returning();
  const { pluginLoader } = await import('../services/plugin-loader.js');
  const loadedManifest = await pluginLoader(db).loadManifest(root!);
  expect(loadedManifest?.id).toBe('vistecsol.figma');
  const nativeServices = buildHostServices(db, pluginId, 'vistecsol.figma', {
    forPlugin: () => ({ emit() {}, subscribe() {}, clear() {} }),
  } as any, undefined, { manifest: loadedManifest! });
  const handle = createPluginWorkerHandle(pluginId, {
    entrypointPath: join(root!, 'dist/worker.mjs'),
    manifest: loadedManifest!, config: {}, apiVersion: 1, autoRestart: false,
    instanceInfo: { instanceId: 'isolated', hostVersion: '2026.916.1' },
    hostHandlers: createHostClientHandlers({ pluginId, capabilities: ['api.routes.register'],
      services: nativeServices }),
  });
  const call = async (routeKey: string, body: unknown = null) => {
    const input = { routeKey, method: routeKey === 'designs.list' ? 'GET' : 'POST', path: '/',
      params: { projectId: project.id }, companyId, body, query: {}, headers: {},
      actor: { actorType: 'user', actorId: 'local-board' }, testHostMethod: 'projectDesigns.execute' };
    captureFigmaApiAuthority(input, { type: 'board', source: 'local_implicit', userId: 'local-board' }, companyId, project.id);
    if (routeKey === 'designs.mutate') input.body = { type: 'detach', id: 'forged', expectedRevision: 0 };
    return await handle.call('handleApiRequest', input as any) as any;
  };
  await handle.start();
  try {
    const added = await call('designs.mutate', { type: 'add', expectedRevision: 0, connectionId: connection.id, url: 'https://figma.com/design/RealRpc?node-id=2-3' });
    expect(added.status).toBe(200);
    expect(added.body.attachments[0].fileKey).toBe('RealRpc');
    expect((await storeFor(db).read(companyId, project.id)).revision).toBe(1);
    const foreign = await call('designs.mutate', { type: 'add', expectedRevision: 1, connectionId: randomUUID(), url: 'https://figma.com/design/Foreign' });
    expect(foreign.status).toBe(403);
    expect((await storeFor(db).read(companyId, project.id)).revision).toBe(1);
    // A plausible official transportConfig must not hide a different effective endpoint.
    await db.update(toolConnections).set({ config: { url: 'https://invalid.example/mcp' },
      transportConfig: { url: 'https://mcp.figma.com/mcp' } }).where(eq(toolConnections.id, connection.id));
    expect((await call('designs.mutate', { type: 'add', expectedRevision: 1, connectionId: connection.id,
      url: 'https://figma.com/design/Spoof' })).status).toBe(403);
    await db.insert(pluginCompanySettings).values({ companyId, pluginId, enabled: false });
    expect((await call('designs.list')).status).toBe(403);
    await db.update(pluginCompanySettings).set({ enabled: true }).where(eq(pluginCompanySettings.pluginId, pluginId));
    expect((await call('designs.list')).body.attachments).toHaveLength(1);
  } finally { await handle.stop(); nativeServices.dispose(); }
});

it('native host services deny direct namespace SQL for the Figma worker', async () => {
  const { buildHostServices } = await import('../services/plugin-host-services.js');
  const services = buildHostServices(db, pluginId, 'vistecsol.figma', {
    forPlugin: () => ({ emit() {}, subscribe() {}, clear() {} }),
  } as any);
  try {
    await expect(services.db.query({ sql: 'SELECT * FROM forbidden', params: [] })).rejects.toThrow('scoped host operation');
    await expect(services.db.execute({ sql: 'DELETE FROM forbidden', params: [] })).rejects.toThrow('scoped host operation');
  } finally { services.dispose(); }
});
