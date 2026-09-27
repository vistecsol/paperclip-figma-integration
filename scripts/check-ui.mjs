// Isolated DOM proof using the pinned host's React and jsdom; no live server.
import { createRequire } from 'node:module';
import { writeFileSync, symlinkSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import assert from 'node:assert/strict';
const host = resolve(process.argv[2] ?? '/app');
const scratch = process.env.PAPERCLIP_RUN_SCRATCH_DIR;
if (!scratch) throw new Error('Run scratch required');
const requireHost = createRequire(join(host, 'package.json'));
const requireUi = createRequire(join(host, 'ui/package.json'));
const { JSDOM } = requireHost('./node_modules/.pnpm/jsdom@30.0.1_@noble+hashes@2.4.0/node_modules/jsdom');
const React = requireUi('react');
const { createRoot } = requireUi('react-dom/client');
const { act } = React;
const dom = new JSDOM('<div id="root"></div>', { url: 'https://paperclip.test' });
globalThis.window = dom.window; globalThis.document = dom.window.document;
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
const mock = join(scratch, 'ui-sdk-fixture.mjs');
writeFileSync(mock, `export const useHostContext = () => globalThis.figmaUiProof.context;
export const usePluginData = () => globalThis.figmaUiProof.query;
export const usePluginAction = key => params => globalThis.figmaUiProof.action(key, params);\n`);
if (!existsSync(join(scratch, 'node_modules'))) symlinkSync(join(host, 'ui/node_modules'), join(scratch, 'node_modules'));
const output = join(scratch, 'ui-proof-component.mjs');
await requireHost('esbuild').build({ entryPoints: ['src/ui.jsx'], outfile: output, bundle: true,
  format: 'esm', platform: 'node', external: ['react'], alias: { '@paperclipai/plugin-sdk/ui': mock } });
const { DesignsTab } = await import(pathToFileURL(output));
const root = createRoot(document.getElementById('root'));
let calls = [], refreshes = 0, finish;
globalThis.figmaUiProof = {
  context: { companyId: 'company', companyPrefix: 'VIS', projectId: 'project' },
  query: { data: { status: 200, body: { revision: 7, connections: [{ id: 'managed', name: 'Managed Figma' }],
    attachments: [{ id: 'design', connectionId: 'managed', fileKey: 'File', nodeId: '1:2', url: 'https://www.figma.com/design/File?node-id=1-2',
      label: '<script>not HTML</script>', purpose: 'Reference', primary: false, verification: { state: 'unverified', checkedAt: null } }] } },
    refresh: async () => { refreshes++; } },
  action: async (key, params) => { calls.push({ key, params }); return await new Promise(resolve => { finish = resolve; }); },
};
const render = () => act(async () => { root.render(React.createElement(DesignsTab)); });
const button = label => [...document.querySelectorAll('button')].find(item => item.textContent === label);
const click = label => act(async () => { button(label).click(); });
try {
  await render();
  assert.equal(document.querySelector('a[href="/VIS/apps"]').textContent, 'Manage Figma connection');
  assert.equal(document.querySelectorAll('script').length, 0);
  assert.ok(document.body.textContent.includes('<script>not HTML</script>'));
  await click('Set primary'); await click('Set primary');
  assert.equal(calls.length, 1); assert.equal(calls[0].params.command.expectedRevision, 7);
  await act(async () => { finish({ status: 409, body: { error: 'stale_revision' } }); });
  assert.match(document.querySelector('[role="alert"]').textContent, /Reload/);
  assert.equal(calls.length, 1); assert.equal(refreshes, 1); // no silent stale-command replay
  await click('Detach'); assert.equal(calls.length, 1);
  await click('Cancel'); assert.equal(calls.length, 1);
  const previousFetch = globalThis.fetch;
  globalThis.fetch = async url => { assert.equal(url, '/api/tool-connections/managed/test-agents'); return { ok: true, json: async () => ({ agents: [{ id: 'selected-agent', name: 'Engineer' }] }) }; };
  await click('Check access');
  assert.equal(button('Verify selected employee').disabled, true);
  const selector = document.querySelector('select');
  await act(async () => { selector.value = 'selected-agent'; selector.dispatchEvent(new window.Event('change', { bubbles: true })); });
  await click('Verify selected employee');
  assert.equal(calls[1].key, 'designs.verify');
  assert.equal(calls[1].params.agentId, 'selected-agent');
  assert.equal(calls[1].params.expectedRevision, 7);
  await act(async () => { finish({ status: 200, body: {} }); });
  globalThis.fetch = previousFetch;
  await click('Rename / purpose'); assert.ok(document.querySelector('form'));
  figmaUiProof.context = { companyId: 'other-company', companyPrefix: 'OTHER', projectId: 'other-project' };
  figmaUiProof.query.data = { status: 200, body: { revision: 0, attachments: [], connections: [] } };
  await render();
  assert.equal(document.querySelector('a[href="/VIS/apps"]'), null);
  assert.ok(document.querySelector('a[href="/OTHER/apps"]'));
  assert.equal(document.querySelector('form'), null); assert.ok(button('Attach design').disabled);
  assert.match(document.body.textContent, /No designs attached/);
  assert.doesNotMatch(document.body.textContent, /not HTML|Reference/);
  console.log('DOM proof passed: text escaping, mutation revision and duplicate suppression, stale-write recovery, detach confirmation, company/project remount and empty state.');
} finally { await act(async () => root.unmount()); dom.window.close(); delete globalThis.figmaUiProof; }
