import { test } from 'node:test';
import assert from 'node:assert/strict';
import { designService } from '../src/service.mjs';
import { DesignError, emptyDesigns } from '../src/attachments.mjs';

function harness() {
  const records = new Map();
  let deniedProject = false, deniedConnection = false;
  let reads = 0, writes = 0, inspections = 0;
  const store = {
    async read(c, p) { reads++; return structuredClone(records.get(c + '/' + p) ?? emptyDesigns()); },
    async compareAndSwap(c, p, before, after) {
      const current = records.get(c + '/' + p) ?? emptyDesigns();
      if (current.revision !== before.revision) throw new DesignError('stale_revision', 409);
      writes++; records.set(c + '/' + p, structuredClone(after)); return after;
    },
  };
  const bridge = {
    async authorizeProject(s) { if (deniedProject || s.companyId !== 'company-a' || s.projectId !== 'project-a') throw new DesignError('forbidden', 403); },
    async authorizeConnection(s) { if (deniedConnection || s.connectionId !== 'connection-a') throw new DesignError('forbidden', 403); },
    async inspect() { inspections++; return { state: 'rate_limited', ignoredSecret: 'not-persisted' }; },
  };
  return { service: designService(store, bridge), counts: () => ({ reads, writes, inspections }),
    revokeProject: () => { deniedProject = true; }, revokeConnection: () => { deniedConnection = true; } };
}
const request = { companyId: 'company-a', projectId: 'project-a', actor: { actorType: 'agent', agentId: 'a', runId: 'r' } };
const add = { type: 'add', expectedRevision: 0, connectionId: 'connection-a', url: 'https://figma.com/design/FileA?node-id=1-2' };
test('no bridge means fail closed; project denials precede all storage access', async () => {
  assert.throws(() => designService({}, {}), /Managed host bridge required/);
  for (const altered of [{ companyId: 'company-b' }, { projectId: 'project-b' }, { actor: null }]) {
    const h = harness();
    await assert.rejects(h.service.list({ ...request, ...altered }));
    await assert.rejects(h.service.mutate({ ...request, ...altered }, add));
    await assert.rejects(h.service.sources({ ...request, ...altered }));
    assert.deepEqual(h.counts(), { reads: 0, writes: 0, inspections: 0 });
  }
});
test('cross-company or revoked connection binding never persists a link', async () => {
  const h = harness();
  await assert.rejects(h.service.mutate(request, { ...add, connectionId: 'other-company-connection' }));
  h.revokeConnection();
  await assert.rejects(h.service.mutate(request, add));
  assert.equal(h.counts().writes, 0);
});
test('access checks use bridge classifications only and recheck revocation', async () => {
  const h = harness();
  const saved = await h.service.mutate(request, add);
  const id = saved.attachments[0].id;
  const verified = await h.service.verify(request, id, 1);
  assert.equal(verified.attachments[0].verification.state, 'rate_limited');
  assert.equal(JSON.stringify(verified).includes('not-persisted'), false);
  await assert.rejects(h.service.verify(request, id, 1), { code: 'stale_revision' });
  h.revokeConnection();
  await assert.rejects(h.service.verify(request, id, 2));
  assert.equal(h.counts().inspections, 1);
  // Removing a broken association remains possible without a Figma grant.
  await h.service.mutate(request, { type: 'detach', id, expectedRevision: 2 });
});
test('source data invokes no Figma calls and project revocation stops subsequent reads', async () => {
  const h = harness();
  await h.service.mutate(request, add);
  assert.equal((await h.service.sources(request)).sources.length, 1);
  assert.equal(h.counts().inspections, 0);
  const reads = h.counts().reads;
  h.revokeProject();
  await assert.rejects(h.service.sources(request));
  assert.equal(h.counts().reads, reads);
});
