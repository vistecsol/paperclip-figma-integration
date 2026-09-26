import { test } from 'node:test';
import assert from 'node:assert/strict';
import { hostDesignOperations } from '../src/host-operations.mjs';
import { emptyDesigns } from '../src/attachments.mjs';
const request = { companyId: 'untrusted', projectId: 'untrusted' };
const add = { type: 'add', expectedRevision: 0, connectionId: 'connection', url: 'https://figma.com/design/FileA?node-id=1-2' };
function harness({ denied = false, rollback = false, beforeWork = () => {} } = {}) {
  let committed = emptyDesigns();
  const events = [];
  const operations = hostDesignOperations({ async withProject(_request, write, work) {
    events.push(['authorize', write]);
    if (denied) throw new Error('denied');
    beforeWork();
    let staged = structuredClone(committed);
    const result = await work({ companyId: 'trusted-company', projectId: 'trusted-project',
      async authorizeConnection(id) { events.push(['connection', id]); if (id !== 'connection') throw new Error('denied'); },
      store: {
        async read(c, p) { events.push(['read', c, p]); return structuredClone(staged); },
        async compareAndSwap(c, p, before, after) { events.push(['write', c, p]); assert.equal(before.revision, staged.revision); staged = after; return after; },
      },
    });
    if (rollback) throw new Error('transaction aborted');
    committed = staged;
    events.push(['commit']);
    return result;
  } });
  return { operations, events, snapshot: () => committed };
}
test('mutations use the transaction-owned scope and connection authorization', async () => {
  const h = harness();
  await h.operations.mutate(request, add);
  assert.deepEqual(h.events, [['authorize', true], ['read', 'trusted-company', 'trusted-project'], ['connection', 'connection'], ['write', 'trusted-company', 'trusted-project'], ['commit']]);
  assert.equal(h.snapshot().revision, 1);
});
test('denied policy and rejected connection commit no link', async () => {
  const denied = harness({ denied: true });
  await assert.rejects(denied.operations.mutate(request, add));
  assert.deepEqual(denied.events, [['authorize', true]]);
  const revoked = harness();
  await assert.rejects(revoked.operations.mutate(request, { ...add, connectionId: 'revoked' }));
  assert.equal(revoked.snapshot().revision, 0);
});
test('transaction failure rolls back staged persistence', async () => {
  const h = harness({ rollback: true });
  await assert.rejects(h.operations.mutate(request, add), /transaction aborted/);
  assert.equal(h.snapshot().revision, 0);
});
test('caller mutation cannot swap a command while authority is resolved', async () => {
  const command = { ...add };
  const h = harness({ beforeWork: () => { command.connectionId = 'forged'; } });
  await h.operations.mutate(request, command);
  assert.equal(h.snapshot().attachments[0].connectionId, 'connection');
});
test('read and source paths use project transaction without Figma access', async () => {
  const h = harness();
  assert.equal((await h.operations.list(request)).revision, 0);
  assert.equal((await h.operations.sources(request)).sources.length, 0);
  assert.ok(h.events.filter(e => e[0] === 'authorize').every(e => e[1] === false));
  assert.ok(!h.events.some(e => e[0] === 'connection' || e[0] === 'write'));
});
