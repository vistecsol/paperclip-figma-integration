import { DesignError } from './attachments.mjs';

const denied = () => new DesignError('design_access_denied', 403);
const states = new Set(['accessible', 'access_denied', 'missing', 'reconnect_required', 'rate_limited', 'transient_error']);

/** HOST-SIDE only. resolveInvocation must use the worker manager's own active
 * invocation record. Never populate authority from worker parameters. policy
 * binds actual host project/run/grant/runtime controls; this module is no policy
 * substitute. The returned facade contains neither credentials nor raw MCP data.
 */
export function managedDesignBridge({ resolveInvocation, policy }) {
  for (const key of ['project', 'connection', 'inspect']) {
    if (typeof policy?.[key] !== 'function') throw new Error('Managed policy required');
  }
  if (typeof resolveInvocation !== 'function') throw new Error('Invocation resolver required');
  async function authority(request, write = false) {
    const invocation = await resolveInvocation();
    if (!invocation || invocation.active !== true || invocation.pluginEnabled !== true
        || invocation.companyId !== request.companyId || invocation.projectId !== request.projectId) throw denied();
    const actor = invocation.actor;
    if (!actor || !['user', 'agent'].includes(actor.actorType) || !actor.actorId
        || (actor.actorType === 'agent' && (!actor.runId || !actor.agentId))) throw denied();
    // Caller actor is compared, never used as authority; captures are copied so
    // later request mutation cannot replace the authenticated actor.
    if (['actorType', 'actorId', 'agentId', 'runId'].some(k => (request.actor?.[k] ?? null) !== (actor[k] ?? null))) throw denied();
    const scope = Object.freeze({ companyId: invocation.companyId, projectId: invocation.projectId,
      actor: Object.freeze({ ...actor }), write });
    if (await policy.project(scope) !== true) throw denied();
    return scope;
  }
  async function connection(request, write = false) {
    const scope = await authority(request, write);
    if (typeof request.connectionId !== 'string' || !request.connectionId) throw denied();
    const input = Object.freeze({ ...scope, connectionId: request.connectionId });
    // Must enforce company ownership, grant, current run and protected-runtime
    // eligibility. Only a boolean decision crosses this local interface.
    if (await policy.connection(input) !== true) throw denied();
    return input;
  }
  const safe = operation => async request => {
    try { return await operation(request); }
    catch (error) {
      if (error instanceof DesignError) throw error;
      throw new DesignError('managed_design_operation_failed', 500);
    }
  };
  return Object.freeze({
    authorizeProject: safe(request => authority(request, request.write === true)),
    authorizeConnection: safe(request => connection(request)),
    inspect: safe(async request => {
      const scope = await connection(request, true);
      if (typeof request.fileKey !== 'string' || request.fileKey.length > 256 || !/^[a-zA-Z0-9]+$/.test(request.fileKey)
          || (request.nodeId !== null && !/^\d+:\d+$/.test(request.nodeId))) throw new DesignError('invalid_design_reference');
      // No worker-selected tool, arbitrary URL or arbitrary arguments. The host
      // adapter must route this operation through existing managed tool policy.
      const result = await policy.inspect(Object.freeze({ ...scope, operation: 'figma.inspect',
        fileKey: request.fileKey, nodeId: request.nodeId }));
      await connection(request, true);
      return { state: states.has(result?.state) ? result.state : 'transient_error' };
    }),
  });
}
