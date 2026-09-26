import { changeDesigns, designSourceIndex, DesignError } from './attachments.mjs';

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
