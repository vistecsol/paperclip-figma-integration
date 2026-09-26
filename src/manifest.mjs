import { designApiRoutes } from './api.mjs';
export default {
  id: 'vistecsol.figma', apiVersion: 1, version: '0.1.0-alpha.1',
  displayName: 'Figma Designs', description: 'Company-scoped Figma design attachments; patched host required',
  author: 'Visual Technology Solutions', categories: ['workspace'],
  capabilities: ['api.routes.register', 'ui.detailTab.register', 'database.namespace.migrate', 'database.namespace.read'],
  entrypoints: { worker: './dist/worker.mjs', ui: './dist/ui' },
  ui: { slots: [{ type: 'detailTab', id: 'designs', displayName: 'Designs',
    exportName: 'DesignsTab', entityTypes: ['project'], order: 40 }] },
  database: { namespaceSlug: 'figma', migrationsDir: 'migrations' },
  apiRoutes: designApiRoutes,
};
