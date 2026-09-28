import { test } from 'node:test';
import assert from 'node:assert/strict';
import { inspectionTools, prepareInspection, prepareRebind } from '../operator/inspection-preparation.mjs';
import { changeDesigns } from '../src/attachments.mjs';
import { hostDesignOperations } from '../src/host-operations.mjs';
const catalog = inspectionTools.map((toolName, i) => ({ id: `tool-${i}`, companyId: 'company', connectionId: 'shared', toolName, riskLevel: 'read', status: 'active' }));
const input = { companyId: 'company', connectionId: 'shared', agentId: 'employee', catalog, policies: [] };
test('preparation scopes exact reviewed entries and installs denial before permissions', () => {
  const plan = prepareInspection(input);
  assert.equal(plan.creationOrder[0].policyType, 'block');
  assert.ok(plan.creationOrder.slice(1).every(p => p.selectors.agentId === 'employee' && p.selectors.riskLevel === 'read'));
  assert.throws(() => prepareInspection({ ...input, policies: [{ enabled: true }] }), /existing enabled policies/);
  assert.throws(() => prepareInspection({ ...input, catalog: catalog.map(r => ({ ...r, riskLevel: 'write' })) }), /read catalog/);
});
const original = { revision: 7, attachments: [{ id: 'real', connectionId: 'personal', fileKey: 'File', nodeId: '1:2', url: 'https://www.figma.com/design/File?node-id=1-2', label: 'Keep', purpose: 'Foundation', primary: true, order: 0, verification: { state: 'accessible', checkedAt: '2026-09-28T00:00:00Z' } }] };
test('rebind retains link identity and metadata, resets verification and rejects stale/duplicate correction', () => {
  const command = prepareRebind(original, { id: 'real', oldConnectionId: 'personal', newConnectionId: 'shared' });
  const next = changeDesigns(original, command);
  assert.deepEqual(next.attachments[0], { ...original.attachments[0], connectionId: 'shared', verification: { state: 'unverified', checkedAt: null } });
  assert.equal(next.revision, 8);
  assert.throws(() => changeDesigns(next, command), { code: 'stale_revision' });
  assert.throws(() => changeDesigns({ ...original, attachments: [...original.attachments, { ...original.attachments[0], id: 'duplicate', connectionId: 'shared' }] }, command), { code: 'duplicate_design' });
});
test('rebind denies revoked target before persistence', async () => {
  let writes = 0;
  const ops = hostDesignOperations({ withProject: (_r, _w, fn) => fn({ companyId: 'company', projectId: 'project', store: { read: async () => original, compareAndSwap: async () => { writes++; } }, authorizeConnection: async () => { throw new Error('revoked'); } }) });
  await assert.rejects(ops.mutate({}, { type: 'rebind', id: 'real', connectionId: 'shared', expectedRevision: 7 }), /revoked/);
  assert.equal(writes, 0);
});
test('authorized rebind commits once through host transaction', async () => {
  let saved = original;
  const authorized = [];
  const ops = hostDesignOperations({ withProject: (_r, write, fn) => {
    assert.equal(write, true);
    return fn({ companyId: 'company', projectId: 'project', store: { read: async () => saved, compareAndSwap: async (_c,_p,before,after) => { assert.equal(before.revision, saved.revision); saved=after; return saved; } }, authorizeConnection: async id => authorized.push(id) });
  } });
  const { designApi } = await import('../src/api.mjs');
  const result = await designApi(ops)({ routeKey:'designs.mutate', method:'POST', companyId:'company', params:{projectId:'project'}, actor:{actorType:'user',actorId:'board'}, body:prepareRebind(original,{id:'real',oldConnectionId:'personal',newConnectionId:'shared'}) });
  assert.equal(result.status,200);
  assert.deepEqual(authorized,['shared']);
  assert.equal(saved.revision,8);
});
