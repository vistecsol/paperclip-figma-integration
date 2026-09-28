import { DesignError, changeDesigns, verifiedDesigns, designSourceIndex, requiredId } from './attachments.mjs';

/**
 * Internal seam for the approved host bridge, not an existing SDK extension.
 * bridge must authorize from immutable server actor/run context, enforce current
 * project/grant/protected-runtime policy, and return only non-secret metadata.
 * Until that host bridge is implemented, no worker exposes this service.
 */
export function designService(store, bridge) {
  for (const method of ['authorizeProject', 'authorizeConnection', 'inspect']) {
    if (typeof bridge?.[method] !== 'function') throw new Error('Managed host bridge required');
  }
  async function scope(request, write) {
    const companyId = requiredId(request.companyId, 'company');
    const projectId = requiredId(request.projectId, 'project');
    if (!request.actor) throw new DesignError('unauthorized', 403);
    await bridge.authorizeProject({ companyId, projectId, actor: request.actor, write });
    return { companyId, projectId, actor: request.actor };
  }
  return {
    async list(request) {
      const s = await scope(request, false);
      return store.read(s.companyId, s.projectId);
    },
    async mutate(request, command) {
      const s = await scope(request, true);
      // Validate the command before any connection call, then authorize its binding.
      const before = await store.read(s.companyId, s.projectId);
      const after = changeDesigns(before, command);
      if ((command.type === 'add' || command.type === 'rebind')) await bridge.authorizeConnection({ ...s, connectionId: command.connectionId });
      return store.compareAndSwap(s.companyId, s.projectId, before, after);
    },
    async verify(request, id, expectedRevision) {
      const s = await scope(request, true);
      const before = await store.read(s.companyId, s.projectId);
      if (before.revision !== expectedRevision) throw new DesignError('stale_revision', 409);
      const row = before.attachments.find(a => a.id === id);
      if (!row) throw new DesignError('design_not_found', 404);
      await bridge.authorizeConnection({ ...s, connectionId: row.connectionId });
      const result = await bridge.inspect({ ...s, connectionId: row.connectionId, fileKey: row.fileKey, nodeId: row.nodeId });
      const after = verifiedDesigns(before, id, result.state, new Date().toISOString());
      return store.compareAndSwap(s.companyId, s.projectId, before, after);
    },
    async sources(request) {
      const s = await scope(request, false);
      const snapshot = await store.read(s.companyId, s.projectId);
      // Discovery does not invoke Figma or turn attachments into grants.
      return designSourceIndex(snapshot);
    },
  };
}
