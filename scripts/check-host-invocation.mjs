import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { stripTypeScriptTypes } from 'node:module';
import { runInNewContext } from 'node:vm';
import assert from 'node:assert/strict';
const host = process.argv[2] ?? '/app';
const scratch = process.env.PAPERCLIP_RUN_SCRATCH_DIR;
if (!scratch) throw new Error('PAPERCLIP_RUN_SCRATCH_DIR required');
const root = join(scratch, 'invocation-patch-proof');
const baseline = JSON.parse(readFileSync('host-prerequisite/invocation-baseline.json', 'utf8'));
for (const file of baseline.files) {
  const bytes = readFileSync(join(host, file.path));
  assert.equal(createHash('sha256').update(bytes).digest('hex'), file.sha256);
  const target = join(root, file.path); mkdirSync(dirname(target), { recursive: true }); writeFileSync(target, bytes);
}
const patch = resolve('host-prerequisite/figma-invocation-scope.patch');
for (const args of [['apply', '--check', patch], ['apply', patch]]) {
  const result = spawnSync('git', args, { cwd: root, encoding: 'utf8' });
  if (result.status !== 0) throw new Error(result.stderr);
}
const manager = readFileSync(join(root, 'server/src/services/plugin-worker-manager.ts'), 'utf8');
const start = manager.indexOf('  function readNonEmptyString(');
const end = manager.indexOf('  function registerInvocation(', start);
assert.ok(start >= 0 && end > start);
const derive = runInNewContext(stripTypeScriptTypes(manager.slice(start, end)) + '\nderiveInvocationScope');
const envelope = { companyId: 'c', params: { projectId: 'p' }, actor: { actorType: 'agent', actorId: 'a', agentId: 'a', runId: 'r' },
  body: { companyId: 'foreign', projectId: 'foreign', actor: { actorId: 'forged' } } };
const result = derive('handleApiRequest', envelope);
assert.equal(result.companyId, 'c'); assert.equal(result.apiRequest.projectId, 'p'); assert.equal(result.apiRequest.actor.runId, 'r');
envelope.actor.runId = 'mutated'; assert.equal(result.apiRequest.actor.runId, 'r');
assert.equal(derive('handleApiRequest', { ...envelope, actor: { actorType: 'agent', actorId: 'a' } }).apiRequest, undefined);
assert.equal(derive('handleApiRequest', { ...envelope, actor: { actorType: 'plugin', actorId: 'a' } }).apiRequest, undefined);
assert.equal(derive('handleWebhook', envelope).apiRequest, undefined);
assert.equal(derive('handleApiRequest', { ...envelope, actor: { actorType: 'user', actorId: 'u' } }).apiRequest.actor.actorId, 'u');
assert.equal(derive('executeTool', { runContext: { companyId: 'legacy' } }).companyId, 'legacy');
console.log('Patch application and 7 host scope assertions passed. Extracted function proof only; not full host RPC/typecheck.');
