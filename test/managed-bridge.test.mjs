import { test } from 'node:test';
import assert from 'node:assert/strict';
import { managedDesignBridge } from '../src/managed-bridge.mjs';
import { designWorker } from '../src/worker.mjs';
import { emptyDesigns } from '../src/attachments.mjs';
const actor = { actorType: 'agent', actorId: 'a', agentId: 'a', runId: 'r' };
const request = { companyId: 'c', projectId: 'p', actor, connectionId: 'connection', fileKey: 'Abc', nodeId: '1:2' };
function harness() {
  const state = { active: true, pluginEnabled: true, companyId: 'c', projectId: 'p', actor: { ...actor } };
  let grant = true, project = true, inspections = 0;
  let inspect = async () => ({ state: 'accessible', token: 'must-never-cross' });
  const bridge = managedDesignBridge({ resolveInvocation: async () => state, policy: {
    project: async () => project,
    connection: async s => grant && s.connectionId === 'connection',
    inspect: async s => { inspections++; assert.equal(s.operation, 'figma.inspect'); return inspect(s); },
  } });
  return { state, bridge, revoke: () => { grant = false; }, denyProject: () => { project = false; },
    inspecting: fn => { inspect = fn; }, inspections: () => inspections };
}
test('bridge denies missing authority and forged company/project/actor/run before inspection', async () => {
  for (const altered of [{ companyId: 'other' }, { projectId: 'other' }, { actor: { ...actor, runId: 'other' } }, { actor: { ...actor, actorId: 'other' } }]) {
    const h = harness();
    await assert.rejects(h.bridge.inspect({ ...request, ...altered }), { code: 'design_access_denied' });
    assert.equal(h.inspections(), 0);
  }
  for (const flag of ['active', 'pluginEnabled']) {
    const h = harness(); h.state[flag] = false;
    await assert.rejects(h.bridge.inspect(request)); assert.equal(h.inspections(), 0);
  }
});
test('project, grant and cross-connection denial; unknown inspection fields never cross', async () => {
  const h = harness();
  assert.deepEqual(await h.bridge.inspect(request), { state: 'accessible' });
  await assert.rejects(h.bridge.inspect({ ...request, connectionId: 'foreign' }));
  h.revoke(); await assert.rejects(h.bridge.inspect(request));
  h.denyProject(); await assert.rejects(h.bridge.authorizeProject(request));
  assert.equal(h.inspections(), 1);
});
test('revocation during remote I/O prevents stale success delivery', async () => {
  const h = harness();
  h.inspecting(async () => { h.revoke(); return { state: 'accessible' }; });
  await assert.rejects(h.bridge.inspect(request), { code: 'design_access_denied' });
});
test('fixed inspection operation rejects URL/tool argument injection by projection', async () => {
  const h = harness();
  h.inspecting(async s => { assert.equal(s.tool, undefined); assert.equal(s.url, undefined); return { state: 'provider_secret' }; });
  assert.deepEqual(await h.bridge.inspect({ ...request, tool: 'write_canvas', url: 'https://evil.invalid' }), { state: 'transient_error' });
  await assert.rejects(h.bridge.inspect({ ...request, fileKey: 'https://evil.invalid' }));
});
test('worker executes scoped API through the bridge and redacts unexpected errors', async () => {
  const h = harness(); let reads = 0;
  const worker = designWorker({ bridge: h.bridge, store: { async read() { reads++; return emptyDesigns(); } } });
  const input = { routeKey: 'designs.list', method: 'GET', companyId: 'c', params: { projectId: 'p' }, actor };
  assert.equal((await worker.onApiRequest(input)).status, 200);
  h.state.active = false;
  assert.equal((await worker.onApiRequest(input)).status, 403);
  assert.equal(reads, 1);
  assert.throws(() => designWorker({ store: {} }), /Managed host bridge/);
});
test('provider failures are redacted at the bridge, before worker RPC', async () => {
  const h = harness(); h.inspecting(async () => { throw new Error('private-provider-response'); });
  await assert.rejects(h.bridge.inspect(request), error => error.code === 'managed_design_operation_failed' && !error.message.includes('private'));
  await assert.rejects(h.bridge.inspect({ ...request, fileKey: undefined }), { code: 'invalid_design_reference' });
});
