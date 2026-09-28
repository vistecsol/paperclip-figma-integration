import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { stripTypeScriptTypes } from 'node:module';
import { test } from 'node:test';

// Execute the patched host route's real forwarding block and real authority
// maps. This isolates route wiring; database/project policy and HTTP are separate.
const routeFile = process.env.FIGMA_PATCHED_ROUTES;
if (!routeFile) throw new Error('FIGMA_PATCHED_ROUTES must name the generated pinned host route');
const routes = readFileSync(routeFile, 'utf8');
const authoritySource = stripTypeScriptTypes(readFileSync(
  'host-prerequisite/server/src/services/figma-api-authority.ts', 'utf8'))
  .replace('import { forbidden } from "../errors.js";', 'const forbidden = message => new Error(message);');
const authority = await import('data:text/javascript;base64,' + Buffer.from(authoritySource).toString('base64'));
const AsyncFunction = Object.getPrototypeOf(async function() {}).constructor;
for (const [path, method, key] of [
  ['/plugins/:pluginId/data/:key', 'getData', 'designs.list'],
  ['/plugins/:pluginId/actions/:key', 'performAction', 'designs.mutate'],
]) {
  test(path + ' binds only scoped host authority to the forwarded envelope', async () => {
    const start = routes.indexOf('router.post("' + path + '"');
    assert.ok(start >= 0);
    const begin = routes.indexOf('    try {', start) + '    try {'.length;
    const end = routes.indexOf('      res.json({ data: result });', begin);
    const code = stripTypeScriptTypes(routes.slice(begin, end)) + '\nreturn result;';
    const forward = new AsyncFunction('body', 'companyId', 'key', 'req', 'plugin', 'db',
      'getActorInfo', 'captureFigmaUiAuthority', 'captureFigmaInspector',
      'actionParamsWithAuthorizedCompanyScope', 'performActionActorContext', 'bridgeDeps', code);
    const actor = { type: 'board', userId: 'native-user', source: 'session' };
    const apiActor = { actorType: 'user', actorId: 'native-user' };
    const call = async (params, companyId = 'company', requestActor = actor, scopeCompany = companyId) =>
      forward({ params }, companyId, key, { actor: requestActor }, { id: 'plugin', pluginKey: 'vistecsol.figma' }, {},
        () => apiActor, authority.captureFigmaUiAuthority, () => undefined,
        (params, companyId) => ({ ...params, companyId }), () => apiActor,
        { workerManager: { call: async (_id, actualMethod, input) => {
          assert.equal(actualMethod, method);
          const scope = { companyId: scopeCompany };
          authority.bindFigmaApiAuthority(input, scope, () => true);
          return authority.resolveFigmaApiAuthority({ invocationScope: scope });
        } } });
    const command = { type: 'reorder', ids: ['retained-link'], expectedRevision: 1 };
    const result = await call({ projectId: 'project', command, actor: { type: 'forged' } });
    assert.deepEqual(result.authority, { actor, companyId: 'company', projectId: 'project' });
    assert.equal(result.request.routeKey, key);
    if (method === 'performAction') assert.deepEqual(result.request.body, command);
    await assert.rejects(call({}), /unavailable/);
    await assert.rejects(call({ projectId: 'project' }, null), /unavailable/);
    await assert.rejects(call({ projectId: 'project' }, 'company', { type: 'agent' }), /unavailable/);
    await assert.rejects(call({ projectId: 'project' }, 'company', actor, 'other-company'), /unavailable/);
  });
}
