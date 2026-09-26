// Executed in the copied pinned host tree by prepare-host-proof.mjs.
import { randomUUID } from 'node:crypto';
import { pathToFileURL } from 'node:url';
import { join } from 'node:path';
import { beforeAll, afterAll, expect, it } from 'vitest';
import { createDb, plugins } from '@paperclipai/db';
import { pluginDatabaseService, derivePluginDatabaseNamespace } from '../services/plugin-database.js';
import { startEmbeddedPostgresTestDatabase } from './helpers/embedded-postgres.js';
const root = process.env.FIGMA_INTEGRATION_ROOT;
if (!root) throw new Error('FIGMA_INTEGRATION_ROOT required');
const { designStore } = await import(pathToFileURL(join(root, 'src/storage.mjs')).href);
const { changeDesigns, emptyDesigns } = await import(pathToFileURL(join(root, 'src/attachments.mjs')).href);
const manifest = {
  id: 'vistecsol.figma', apiVersion: 1 as const, version: '0.1.0-alpha.1',
  displayName: 'Figma', description: 'Isolated attachment persistence proof', author: 'VTS',
  categories: ['workspace' as const],
  capabilities: ['database.namespace.migrate', 'database.namespace.read', 'database.namespace.write'] as any,
  entrypoints: { worker: './src/worker.mjs' },
  database: { namespaceSlug: 'figma', migrationsDir: 'migrations' },
};
let database: Awaited<ReturnType<typeof startEmbeddedPostgresTestDatabase>>;
let service: ReturnType<typeof pluginDatabaseService>;
let store: ReturnType<typeof designStore>;
const pluginId = randomUUID();
beforeAll(async () => {
  database = await startEmbeddedPostgresTestDatabase('figma-attachments-');
  const db = createDb(database.connectionString);
  await db.insert(plugins).values({ id: pluginId, pluginKey: manifest.id, packageName: '@vistecsol/paperclip-figma-integration',
    version: manifest.version, apiVersion: 1, categories: manifest.categories, manifestJson: manifest, status: 'installed', installOrder: 1 });
  service = pluginDatabaseService(db);
  await service.applyMigrations(pluginId, manifest, root!);
  store = openStore();
});
function openStore() {
  return designStore({
    namespace: derivePluginDatabaseNamespace(manifest.id, 'figma'),
    query: (sql: string, params: unknown[]) => service.query(pluginId, sql, params),
    execute: (sql: string, params: unknown[]) => service.execute(pluginId, sql, params),
  });
}
afterAll(async () => { await database?.cleanup(); });
function add(current: any, node: string) {
  return changeDesigns(current, { type: 'add', expectedRevision: current.revision, connectionId: 'connection-a', url: `https://figma.com/design/FileA?node-id=${node}` });
}
it('migration is idempotent; persisted links reload; company and project scopes stay distinct', async () => {
  let current = emptyDesigns();
  for (const node of ['1-2', '3-4', '5-6']) current = await store.compareAndSwap('company-a', 'project-a', current, add(current, node));
  await service.applyMigrations(pluginId, manifest, root!);
  expect(await openStore().read('company-a', 'project-a')).toEqual(current);
  expect(await store.read('company-b', 'project-a')).toEqual(emptyDesigns());
  expect(await store.read('company-a', 'project-other')).toEqual(emptyDesigns());
});
it('concurrent initial insert accepts exactly one revision', async () => {
  const before = emptyDesigns();
  const results = await Promise.allSettled(['1-2', '3-4'].map(node => store.compareAndSwap('company-a', 'race-insert', before, add(before, node))));
  expect(results.filter(r => r.status === 'fulfilled')).toHaveLength(1);
  expect((results.find(r => r.status === 'rejected') as PromiseRejectedResult).reason.code).toBe('stale_revision');
  expect((await store.read('company-a', 'race-insert')).attachments).toHaveLength(1);
});
it('concurrent primary/reorder updates never lose edits or produce multiple primaries', async () => {
  const before = await store.read('company-a', 'project-a');
  const results = await Promise.allSettled(before.attachments.slice(0, 2).map((row: any) => store.compareAndSwap('company-a', 'project-a', before,
    changeDesigns(before, { type: 'primary', id: row.id, expectedRevision: before.revision }))));
  expect(results.filter(r => r.status === 'fulfilled')).toHaveLength(1);
  const after = await store.read('company-a', 'project-a');
  expect(after.attachments.filter((a: any) => a.primary)).toHaveLength(1);
  expect(after.revision).toBe(before.revision + 1);
  await expect(store.compareAndSwap('company-a', 'project-a', before,
    changeDesigns(before, { type: 'reorder', ids: before.attachments.map((a: any) => a.id).reverse(), expectedRevision: before.revision })))
    .rejects.toMatchObject({ code: 'stale_revision' });
});
it('same resource on another project is valid; detach preserves original project', async () => {
  const initial = emptyDesigns();
  const next = await store.compareAndSwap('company-a', 'project-copy', initial, add(initial, '1-2'));
  const detached = changeDesigns(next, { type: 'detach', id: next.attachments[0].id, expectedRevision: next.revision });
  await store.compareAndSwap('company-a', 'project-copy', next, detached);
  expect((await store.read('company-a', 'project-copy')).attachments).toHaveLength(0);
  expect((await store.read('company-a', 'project-a')).attachments).toHaveLength(3);
});
