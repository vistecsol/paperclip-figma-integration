import { readFileSync } from 'node:fs';
import { stripTypeScriptTypes } from 'node:module';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
import { inspectionTools, prepareInspection } from '../operator/inspection-preparation.mjs';
const source = readFileSync(process.argv[2] ?? '/app/server/src/services/tool-access-policy.ts', 'utf8');
function section(start, end) {
  const a = source.indexOf(start), b = source.indexOf(end, a);
  assert.ok(a >= 0 && b > a, 'Native policy source anchors changed');
  return source.slice(a, b);
}
// Execute the actual native selectors and ordered decision loop. Database,
// grant resolution and gateway enforcement remain live-session requirements.
const helpers = stripTypeScriptTypes(section('function listValues(', 'function asToolRiskLevel(') + section('function selectorMatches(', 'function conditionRecord('));
const loop = section('    const matchingPolicies = policies', '    if (await explicitGrant(ctx))');
const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
const evaluate = new AsyncFunction('policies', 'ctx', `${helpers}
const policyConditions = p => p.conditions;
const evaluatePolicyConditions = c => { if(c) throw Error('Unexpected condition'); return {matched:true,matchedGroups:[]}; };
const unsupportedRuntimePolicyType = t => !['allow','block'].includes(t);
const decision = (result, reason) => ({result,reason});
const effectiveProfileIds = [], redaction = {redactionPlan:{}};
${loop}
return {result:'outside-scope'};`);
const catalog = inspectionTools.map((toolName, i) => ({ id: `tool-${i}`, companyId: 'company', connectionId: 'shared', toolName, riskLevel: 'read', status: 'active' }));
const plan = prepareInspection({ companyId: 'company', connectionId: 'shared', agentId: 'employee', catalog, policies: [] });
const policies = [...plan.creationOrder].sort((a,b) => a.priority-b.priority);
const context = { connectionId: 'shared', agentId: 'employee', toolName: 'get_metadata', upstreamToolName: 'get_metadata', catalogEntryId: 'tool-1', riskLevel: 'read' };
for (const row of catalog) assert.equal((await evaluate(policies, { ...context, toolName: row.toolName, upstreamToolName: row.toolName, catalogEntryId: row.id })).result, 'allow');
for (const delta of [
  {toolName:'write_design',upstreamToolName:'write_design',catalogEntryId:'write',riskLevel:'write'},
  {toolName:'delete_node',upstreamToolName:'delete_node',catalogEntryId:'delete',riskLevel:'destructive'},
  {toolName:'new_read_tool',upstreamToolName:'new_read_tool',catalogEntryId:'new',riskLevel:'read'},
  {catalogEntryId:'rediscovered-id'}, {riskLevel:'write'},
]) assert.equal((await evaluate(policies, {...context,...delta})).result, 'deny');
assert.equal((await evaluate(policies, {...context, connectionId:'unrelated'})).result,'outside-scope');
assert.equal((await evaluate(policies, {...context, agentId:'other-agent'})).result,'outside-scope');
console.log(JSON.stringify({nativePolicySha256:createHash('sha256').update(source).digest('hex'), result:'PASS', boundary:'native selectors and policy loop only; no DB/gateway/live proof'}));
