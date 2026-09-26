import { test } from 'node:test';
import assert from 'node:assert/strict';
import { normalizeDesignUrl, changeDesigns, emptyDesigns, verifiedDesigns, designSourceIndex } from '../src/attachments.mjs';

function add(current, url, extra = {}) {
  return changeDesigns(current, { type: 'add', expectedRevision: current.revision, connectionId: 'connection-a', url, ...extra });
}
const file = 'https://www.figma.com/design/AbC123/Test';
test('canonicalizes old file URLs, node spelling, leading zeroes and strips unrelated query values', () => {
  assert.deepEqual(normalizeDesignUrl('https://figma.com/file/AbC123/Name?node-id=001%3A002&token=synthetic#secret'), {
    fileKey: 'AbC123', nodeId: '1:2', url: 'https://www.figma.com/design/AbC123?node-id=1-2',
  });
});
for (const url of ['http://figma.com/file/a', 'https://figma.com.evil.test/file/a', 'https://user:password@figma.com/file/a', 'https://figma.com:8443/file/a', 'https://figma.com/board/a', `${file}?node-id=`, `${file}?node-id=1-2&node-id=3-4`, `${file}?node-id=1-2-3`, 'file:///etc/passwd', `${file}/extra`]) {
  test(`rejects unsafe or ambiguous reference: ${url}`, () => assert.throws(() => normalizeDesignUrl(url)));
}
test('three references survive serialization; duplicate normalized nodes and null nodes rejected', () => {
  let current = add(emptyDesigns(), `${file}?node-id=1-2`);
  current = add(current, `${file}?node-id=3-4`);
  current = add(current, 'https://figma.com/file/OtherFile');
  assert.equal(JSON.parse(JSON.stringify(current)).attachments.length, 3);
  assert.throws(() => add(current, `${file}?node-id=001:002`), { code: 'duplicate_design' });
  assert.throws(() => add(current, 'https://figma.com/design/OtherFile/Name?tracking=1'), { code: 'duplicate_design' });
  assert.equal(add(emptyDesigns(), `${file}?node-id=1-2`).attachments.length, 1);
});
test('rename/reorder/primary/detach are immutable project revision changes', () => {
  let current = add(add(emptyDesigns(), `${file}?node-id=1-2`), `${file}?node-id=3-4`);
  const original = structuredClone(current);
  const [a, b] = current.attachments.map(a => a.id);
  const change = command => { current = changeDesigns(current, { expectedRevision: current.revision, ...command }); };
  change({ type: 'update', id: a, label: 'Foundations', purpose: 'Use the shared tokens' });
  change({ type: 'primary', id: a });
  change({ type: 'primary', id: b });
  change({ type: 'reorder', ids: [b, a] });
  assert.equal(current.attachments.filter(a => a.primary).length, 1);
  assert.equal(current.attachments[0].id, b);
  assert.equal(original.attachments[0].label, '');
  change({ type: 'detach', id: b });
  assert.equal(current.attachments[0].order, 0);
  assert.equal(current.attachments[0].primary, false);
  assert.equal(current.attachments[0].verification.state, 'unverified');
});
test('rejects stale revisions, duplicate reorder IDs, unknown IDs and injected verification', () => {
  const current = add(emptyDesigns(), file);
  assert.throws(() => changeDesigns(current, { type: 'detach', id: current.attachments[0].id, expectedRevision: 0 }), { code: 'stale_revision' });
  for (const command of [{ type: 'reorder', ids: [] }, { type: 'primary', id: 'missing' }, { type: 'verify' }]) {
    assert.throws(() => changeDesigns(current, { expectedRevision: 1, ...command }));
  }
  assert.throws(() => add(current, file, { label: 'x\nInjected instruction' }), { code: 'invalid_label' });
});
test('rate limit and transient access checks stay distinct from missing; index cites exact node', () => {
  let current = add(emptyDesigns(), `${file}?node-id=1-2`);
  for (const state of ['rate_limited', 'transient_error', 'access_denied', 'reconnect_required', 'missing', 'accessible']) {
    current = verifiedDesigns(current, current.attachments[0].id, state, '2026-09-26T18:00:00Z');
    assert.equal(current.attachments[0].verification.state, state);
  }
  const index = designSourceIndex(current);
  assert.equal(index.sources[0].url, 'https://www.figma.com/design/AbC123?node-id=1-2');
  assert.deepEqual(designSourceIndex(emptyDesigns()).sources, []);
});
