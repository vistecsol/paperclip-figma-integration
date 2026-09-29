// Preparation only: caller must enforce the coordinated window and owned runtime.
// request returns {status, body}; it must use native authenticated HTTP, never mocks in a live receipt.
import assert from 'node:assert/strict';
export function assertUnavailable(response) {
 assert.equal(response.status,502);
 assert.equal(response.body.code,'WORKER_UNAVAILABLE');
 assert.equal(response.body.data,undefined);
}
export async function qualifyLifecycle({request, state, baseline, phase, beforeMutation}) {
 assert.ok(['disable-enable','after-restart','soft-uninstall'].includes(phase));
 const base='/api/plugins/'+state.installed.id;
 const scope={companyId:state.companyId,params:{projectId:state.projectId}};
 const get=async path=>{const r=await request(path);assert.equal(r.status,200);return r.body;};
 const same=async()=>{
  const r=await request(base+'/data/designs.list',scope);
  assert.equal(r.status,200);assert.equal(r.body.data?.status,200);
  assert.deepEqual(r.body.data.body,baseline.snapshot);
  assert.deepEqual((await get('/api/projects/'+state.projectId)).workspaces,baseline.repositories);
 };
 const mutate=async(path,body,method='POST')=>{
  await beforeMutation();const r=await request(path,body,method);assert.equal(r.status,200);return r.body;
 };
 await same();
 if(phase==='after-restart') {
  assert.equal((await get(base)).status,'ready');
  return {phase,preserved:true,providerCalls:0};
 }
 const actionBody={companyId:state.companyId,params:{projectId:state.projectId,
  command:{type:'update',expectedRevision:baseline.snapshot.revision,
   id:baseline.snapshot.attachments[0].id,label:'MUST NOT PERSIST'}}};
 assert.ok(actionBody.params.command.id);
 if(phase==='disable-enable'){
  assert.equal((await mutate(base+'/disable',{reason:'Isolated lifecycle qualification'})).status,'disabled');
 } else {
  // Never purge; fresh synthetic fixture only, destructive phase must be separately selected.
  assert.equal((await mutate(base,undefined,'DELETE')).status,'uninstalled');
 }
 assertUnavailable(await request(base+'/data/designs.list',scope));
 await beforeMutation();
 assertUnavailable(await request(base+'/actions/designs.mutate',actionBody));
 assert.deepEqual((await get('/api/projects/'+state.projectId)).workspaces,baseline.repositories);
 if(phase==='soft-uninstall')return {phase,executionDenied:true,
  linkRetention:'requires independent storage receipt; not proved by denied read',providerCalls:0};
 assert.equal((await mutate(base+'/enable',{})).status,'ready');
 await same(); // Includes failed write non-persistence, revision, IDs and all link fields.
 return {phase,executionDenied:true,preserved:true,providerCalls:0};
}
