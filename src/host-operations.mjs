import { changeDesigns, verifiedDesigns, designSourceIndex, DesignError } from './attachments.mjs';

/** Host-only operations. withProject must bind the original authenticated actor
 * and open a host transaction using withFigmaProjectTransaction. Its store and
 * authorizeConnection must use that same transaction; never pass worker SQL or
 * a worker callback into it. This is not an SDK RPC registration.
 */
export function hostDesignOperations({ withProject }) {
  if (typeof withProject !== 'function') throw new Error('Host project transaction required');
  const execute = (request, write, operation) => withProject(request, write, operation);
  return Object.freeze({
    list: request => execute(request, false, ({ store, companyId, projectId }) => store.read(companyId, projectId)),
    sources: request => execute(request, false, async ({ store, companyId, projectId }) =>
      designSourceIndex(await store.read(companyId, projectId))),
    verify: (request, id, expectedRevision) => execute(request, true, async ({ store, companyId, projectId, authorizeConnection, inspect }) => {
      const before = await store.read(companyId, projectId);
      if (before.revision !== expectedRevision) throw new DesignError('stale_revision', 409);
      const row = before.attachments.find(item => item.id === id);
      if (!row) throw new DesignError('design_not_found', 404);
      if (typeof inspect !== 'function') throw new DesignError('managed_session_required', 409);
      await authorizeConnection(row.connectionId);
      const result = await inspect({ connectionId: row.connectionId, fileKey: row.fileKey, nodeId: row.nodeId });
      const after = verifiedDesigns(before, id, result.state, new Date().toISOString());
      return store.compareAndSwap(companyId, projectId, before, after);
    }),
    mutate: (request, command) => {
      // Freeze caller-owned command values before authorization yields.
      const input = structuredClone(command);
      return execute(request, true, async ({ store, companyId, projectId, authorizeConnection }) => {
        const before = await store.read(companyId, projectId);
        const after = changeDesigns(before, input);
        if (input.type === 'add') {
          if (typeof authorizeConnection !== 'function') throw new DesignError('design_access_denied', 403);
          await authorizeConnection(input.connectionId);
        }
        return store.compareAndSwap(companyId, projectId, before, after);
      });
    },
  });
}
