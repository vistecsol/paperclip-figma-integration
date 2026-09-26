import { test } from 'node:test';
import assert from 'node:assert/strict';
import { designSourceRegistry } from '../src/source-registry.mjs';
const index = { revision: 0, sources: [] };
const scope = { authorize: async () => {} };
test('registration delivers empty sources; disable removes executable contribution', async () => {
  const r = designSourceRegistry(); const dispose = r.register('figma', async () => index);
  assert.equal((await r.collect('figma', scope)).status, 'available');
  dispose(); assert.deepEqual(await r.collect('figma', scope), { status: 'unavailable' });
});
test('deadline bounds a non-cooperating worker and signals cancellation', async () => {
  const r = designSourceRegistry({ timeoutMs: 15 }); let signal;
  r.register('figma', async context => { signal = context.signal; return new Promise(() => {}); });
  assert.deepEqual(await r.collect('figma', scope), { status: 'unavailable' });
  assert.equal(signal.aborted, true);
});
test('disable in flight suppresses late data; stale cleanup cannot unregister replacement', async () => {
  const r = designSourceRegistry(); let resolve;
  const dispose = r.register('figma', () => new Promise(done => { resolve = done; }));
  const pending = r.collect('figma', scope);
  await new Promise(done => setImmediate(done));
  r.register('figma', async () => index); dispose(); resolve(index);
  assert.equal((await pending).status, 'unavailable');
  assert.equal((await r.collect('figma', scope)).status, 'available');
});
test('authorization failure and pre-aborted invocation never call worker', async () => {
  const r = designSourceRegistry(); let calls = 0;
  r.register('figma', async () => { calls++; return index; });
  await r.collect('figma', { authorize: async () => { throw new Error('private policy details'); } });
  await r.collect('figma', { ...scope, signal: AbortSignal.abort() });
  assert.equal(calls, 0);
});
