import { requiredId } from '../src/attachments.mjs';

export const inspectionTools = Object.freeze(['whoami', 'get_metadata', 'get_design_context', 'get_screenshot']);

/** Preparation only: no API calls, credentials or inferred live identities.
 * Install the block first; native policy/test must pass before enabling proof.
 * Refuse existing policies rather than reorder or bypass company restrictions.
 */
export function prepareInspection({ companyId, connectionId, agentId, catalog, policies }) {
  for (const id of [companyId, connectionId, agentId]) requiredId(id);
  if (policies.some(p => p.enabled)) throw new Error('Review existing enabled policies before installing inspection rules');
  const rows = inspectionTools.map(name => {
    const matches = catalog.filter(r => r.companyId === companyId && r.connectionId === connectionId && r.toolName === name);
    if (matches.length !== 1 || matches[0].riskLevel !== 'read' || matches[0].status !== 'active') {
      throw new Error(`Reviewed active read catalog entry required: ${name}`);
    }
    requiredId(matches[0].id);
    return matches[0];
  });
  const selectors = { connectionId, agentId };
  const block = { name: 'Figma inspection: deny other tools', policyType: 'block', priority: 1, enabled: true, selectors };
  const allows = rows.map(row => ({ name: `Figma inspection: ${row.toolName}`, policyType: 'allow', priority: 0,
    enabled: true, selectors: { ...selectors, catalogEntryId: row.id, toolName: row.toolName, riskLevel: 'read' } }));
  return { companyId, creationOrder: [block, ...allows],
    note: 'Read back exact rules and test native decisions before any execution. No all-agent or unrelated connection permission is changed.' };
}

/** Snapshot comes from authenticated keyed list; host rechecks revision and
 * authorizes the target connection in the persistence transaction. */
export function prepareRebind(snapshot, { id, oldConnectionId, newConnectionId }) {
  const row = snapshot.attachments.find(a => a.id === id);
  if (!row || row.connectionId !== oldConnectionId) throw new Error('Association changed; inspect fresh state');
  requiredId(newConnectionId);
  if (oldConnectionId === newConnectionId) throw new Error('Association already uses target connection');
  return { type: 'rebind', id, connectionId: newConnectionId, expectedRevision: snapshot.revision };
}
