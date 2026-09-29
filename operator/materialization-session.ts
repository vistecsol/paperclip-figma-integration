// Test-only entry point, copied to /app/server in a verified owned test container.
// Runs proof in the server process to avoid a second native TS module graph.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { startServer } from './src/index.js';
import { verifyRetainedSkillMaterialization } from './retained-skill-preflight.js';
assert.equal(process.env.FIGMA_PROOF_ISOLATED, 'VIS-6');
const run = process.env.FIGMA_PROOF_RUN!;
assert.match(run, /^[a-f0-9-]{36}$/);
const server = await startServer();
try {
  const agentId = 'ed1c19c4-97fe-4aa3-8888-fb425683386a';
  const projectId = '1fce47de-0092-4084-8d4f-4624f710e483';
  const companyId = 'e36aa1e8-e20b-469e-a661-a2ff66d77536';
  const key = 'figma/mcp-server-guide/figma-design-to-code';
  const account = JSON.parse(fs.readFileSync('/paperclip/instances/default/test-bootstrap/mac-proof-account.json','utf8'));
  let cookie = '';
  async function req(route: string, body?: unknown) {
    const response = await fetch(`http://127.0.0.1:${server.listenPort}${route}`, {
      method: body === undefined ? 'GET' : 'POST', signal: AbortSignal.timeout(15000),
      headers: {'content-type':'application/json',origin:'http://localhost:3310',host:'localhost:3310',...(cookie?{cookie}:{})},
      ...(body === undefined ? {} : {body:JSON.stringify(body)}),
    });
    if (response.headers.getSetCookie().length) cookie = response.headers.getSetCookie().map(v=>v.split(';')[0]).join('; ');
    assert.ok(response.ok, `${route}: HTTP ${response.status}`);
    return response.json();
  }
  await req('/api/auth/sign-in/email',{email:account.email,password:account.password});
  const agent = await req(`/api/agents/${agentId}`);
  const project = await req(`/api/projects/${projectId}`);
  assert.equal(agent.companyId,companyId); assert.equal(project.companyId,companyId);
  assert.equal(agent.status,'idle'); assert.equal(agent.runtimeConfig?.heartbeat?.enabled,false);
  const before = await req(`/api/agents/${agentId}/skills`);
  assert.equal(before.desiredSkills.length,6); assert.ok(before.desiredSkills.includes(key));
  await verifyRetainedSkillMaterialization(run);
  await req(`/api/agents/${agentId}/skills/sync`,{mode:'add',desiredSkills:[key]});
  const after = await req(`/api/agents/${agentId}/skills`);
  assert.deepEqual(after.desiredSkills,before.desiredSkills);
  await verifyRetainedSkillMaterialization(run,true);
  console.log(JSON.stringify({stage:'native_materialization_prerequisites_passed',companyId,agentId,projectId,taskCreated:false,providerCalls:0}));
} catch (error) {
  // Do not log provider responses, account data or exception objects.
  console.error(JSON.stringify({stage:'native_materialization_prerequisite_failed',errorType:error instanceof Error?error.name:'unknown'}));
  await server.shutdown('SIGTERM');
  process.exit(1);
}
