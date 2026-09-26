import { test } from 'node:test';
import assert from 'node:assert/strict';
import { designApi, designApiRoutes } from '../src/api.mjs';
import { DesignError } from '../src/attachments.mjs';
const envelope = { routeKey: 'designs.mutate', method: 'POST', companyId: 'company-a',
  params: { projectId: 'project-a' }, actor: { actorType: 'agent', actorId: 'agent-a', agentId: 'agent-a', runId: 'run-a' },
  body: { type: 'add', expectedRevision: 0, connectionId: 'connection-a', url: 'https://figma.com/design/FileA' } };
test('body cannot inject company, project, actor or verification authority', async () => {
  let calls = 0;
  const api = designApi({ mutate: async () => { calls++; } });
  for (const field of ['companyId', 'projectId', 'actor', 'verification', 'state']) {
    assert.equal((await api({ ...envelope, body: { ...envelope.body, [field]: 'forged' } })).status, 400);
  }
  assert.equal(calls, 0);
});
test('host envelope reaches service; caller query does not replace authorized company', async () => {
  let scope;
  const api = designApi({ mutate: async request => { scope = request; return { revision: 1 }; } });
  assert.equal((await api({ ...envelope, query: { companyId: 'forged' } })).status, 200);
  assert.equal(scope.companyId, 'company-a');
  assert.equal(scope.actor, envelope.actor);
});
test('missing run, invalid actor and method mismatch fail before service', async () => {
  const api = designApi({ mutate: () => { throw new Error('should not reach service'); } });
  for (const actor of [null, { actorType: 'agent', actorId: 'a', agentId: 'a' }, { actorType: 'webhook', actorId: 'w' }]) {
    assert.equal((await api({ ...envelope, actor })).status, 403);
  }
  assert.equal((await api({ ...envelope, method: 'GET' })).status, 405);
  assert.equal((await api({ ...envelope, routeKey: 'unknown' })).status, 404);
});
test('verify only accepts a revision; errors never disclose provider messages', async () => {
  const input = { ...envelope, routeKey: 'designs.verify', params: { projectId: 'p', designId: 'd' }, body: { expectedRevision: 1 } };
  let calls = 0;
  const api = designApi({ verify: async () => { calls++; throw new Error('private provider response'); } });
  assert.deepEqual(await api(input), { status: 500, body: { error: 'design_operation_failed' } });
  for (const body of [{ expectedRevision: 1, state: 'accessible' }, { expectedRevision: -1 }, null]) assert.equal((await api({ ...input, body })).status, 400);
  assert.equal(calls, 1);
  const stale = designApi({ verify: async () => { throw new DesignError('stale_revision', 409); } });
  assert.equal((await stale(input)).status, 409);
});
test('every route declares authenticated company-scoped dispatch', () => {
  assert.equal(designApiRoutes.length, 4);
  for (const route of designApiRoutes) {
    assert.equal(route.auth, 'board-or-agent');
    assert.deepEqual(route.companyResolution, { from: 'query', key: 'companyId' });
  }
});
