import { DesignError, requiredId } from './attachments.mjs';

// These declarations use the pinned host's existing scoped API contract.
export const designApiRoutes = [
  ['designs.list', 'GET', '/projects/:projectId/designs'],
  ['designs.mutate', 'POST', '/projects/:projectId/designs'],
  ['designs.verify', 'POST', '/projects/:projectId/designs/:designId/verify'],
  ['designs.sources', 'GET', '/projects/:projectId/designs/sources'],
].map(([routeKey, method, path]) => ({ routeKey, method, path,
  auth: 'board-or-agent', capability: 'api.routes.register',
  companyResolution: { from: 'query', key: 'companyId' },
}));
const commandFields = {
  add: ['expectedRevision', 'connectionId', 'url', 'label', 'purpose'],
  rebind: ['expectedRevision', 'id', 'connectionId'],
  update: ['expectedRevision', 'id', 'label', 'purpose'],
  detach: ['expectedRevision', 'id'],
  primary: ['expectedRevision', 'id'],
  reorder: ['expectedRevision', 'ids'],
};
function object(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new DesignError('invalid_body');
  return value;
}
function exactFields(body, allowed) {
  if (Object.keys(body).some(key => !allowed.includes(key))) throw new DesignError('unknown_field');
}

/** Wire only to onApiRequest: the envelope must come from host RPC, not HTTP JSON.
 * The service bridge still MUST revalidate current project/run/grant policy.
 * A valid envelope is not itself project or connection authorization.
 */
export function designApi(service) {
  return async input => {
    try {
      const route = designApiRoutes.find(r => r.routeKey === input?.routeKey);
      if (!route) return { status: 404, body: { error: 'route_not_found' } };
      if (input.method !== route.method) return { status: 405, body: { error: 'method_not_allowed' } };
      const actor = input.actor;
      if (!actor || !['user', 'agent'].includes(actor.actorType)
          || !actor.actorId || (actor.actorType === 'agent' && (!actor.agentId || !actor.runId))) {
        throw new DesignError('unauthorized', 403);
      }
      const request = { companyId: requiredId(input.companyId, 'company'),
        projectId: requiredId(input.params?.projectId, 'project'), actor };
      let body;
      switch (route.routeKey) {
        case 'designs.list': body = await service.list(request); break;
        case 'designs.sources': body = await service.sources(request); break;
        case 'designs.mutate': {
          const command = object(input.body);
          if (!Object.hasOwn(commandFields, command.type)) throw new DesignError('unknown_design_command');
          exactFields(command, ['type', ...commandFields[command.type]]);
          body = await service.mutate(request, command); break;
        }
        case 'designs.verify': {
          const payload = object(input.body);
          exactFields(payload, ['expectedRevision', 'agentId']);
          if (payload.agentId !== undefined) requiredId(payload.agentId, 'agent');
          if (!Number.isSafeInteger(payload.expectedRevision) || payload.expectedRevision < 0) throw new DesignError('revision_required');
          body = await service.verify(request, requiredId(input.params?.designId, 'design'), payload.expectedRevision); break;
        }
      }
      return { status: 200, body };
    } catch (error) {
      // Provider/database errors can contain credentials or private response data.
      // Only locally generated domain codes cross the worker API boundary.
      return error instanceof DesignError
        ? { status: error.status, body: { error: error.code } }
        : { status: 500, body: { error: 'design_operation_failed' } };
    }
  };
}
