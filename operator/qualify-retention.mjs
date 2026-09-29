import fs from 'node:fs';
import assert from 'node:assert/strict';
import {collectRetention} from './collect-retention.mjs';
import {assertRetention} from './retention-receipts.mjs';
import {assertUnavailable} from './qualification-lifecycle.mjs';
import {beforeMutation} from './qualification-mutation-guard.mjs';
const root='/paperclip/instances/default/test-bootstrap/';
const read=n=>JSON.parse(fs.readFileSync(root+'qualification-'+n+'.json','utf8'));
const state=read('state'),base='/api/plugins/'+state.installed.id,scope={companyId:state.companyId,params:{projectId:state.projectId}};
let cookie='';const receipts=[];
async function request(path,body,method=body===undefined?'GET':'POST'){
 const r=await fetch('http://127.0.0.1:3310'+path,{method,signal:AbortSignal.timeout(20000),headers:{origin:'http://localhost:3310',host:'localhost:3310','content-type':'application/json',cookie},...(body===undefined?{}:{body:JSON.stringify(body)})});
 if(r.headers.getSetCookie().length)cookie=r.headers.getSetCookie().map(x=>x.split(';')[0]).join('; ');
 const value={status:r.status,body:await r.json()};receipts.push({path,method,status:r.status,innerStatus:value.body.data?.status});return value;
}
async function snapshot(api=true){
 const s=await collectRetention(state);
 const project=await request('/api/projects/'+state.projectId);assert.equal(project.status,200);s.repositories=project.body.workspaces;
 if(api){const r=await request(base+'/data/designs.list',scope);assert.equal(r.status,200);assert.equal(r.body.data.status,200);assert.deepEqual({revision:r.body.data.body.revision,attachments:r.body.data.body.attachments},s.snapshot);assert.deepEqual(r.body.data.body,read('snapshot').snapshot);s.connections=r.body.data.body.connections;assert.equal(s.plugin.status,'ready');}
 return s;
}
try{
 await beforeMutation();assert.equal((await request('/api/auth/sign-in/email',read('account'))).status,200);
 const phase=process.argv[2];assert.ok(['baseline','after-restart','uninstall-restore'].includes(phase));
 if(phase==='baseline'){
  const s=await snapshot();assert.deepEqual(s.snapshot,{revision:read('snapshot').snapshot.revision,attachments:read('snapshot').snapshot.attachments});assert.deepEqual(s.repositories,read('snapshot').repositories);
  fs.writeFileSync(root+'qualification-retention.json',JSON.stringify(s),{flag:'wx',mode:0o600});
  console.log(JSON.stringify({phase,passed:true,receipt:s,receipts,providerCalls:0}));
 }else{
  const before=read('retention');assertRetention(before,await snapshot());
  if(phase==='uninstall-restore'){
   await beforeMutation();const deleted=await request(base,undefined,'DELETE');assert.equal(deleted.status,200);assert.equal(deleted.body.status,'uninstalled');
   assertUnavailable(await request(base+'/data/designs.list',scope));
   await beforeMutation();assertUnavailable(await request(base+'/actions/designs.mutate',{companyId:state.companyId,params:{projectId:state.projectId,command:{type:'update',expectedRevision:before.snapshot.revision,id:before.snapshot.attachments[0].id,label:'MUST NOT PERSIST'}}}));
   const retained=await snapshot(false);assertRetention(before,retained);assert.equal(retained.plugin.status,'uninstalled');assert.deepEqual(retained.config,before.config);
   console.log(JSON.stringify({phase:'uninstalled-storage',passed:true,receipt:retained}));
   await beforeMutation();const restored=await request('/api/plugins/install',{packageName:'/app/figma-candidate',isLocalPath:true});assert.equal(restored.status,200);assert.equal(restored.body.id,before.pluginId);
  }
  const after=await snapshot();assertRetention(before,after);assert.deepEqual(after.config,before.config);
  console.log(JSON.stringify({phase,passed:true,receipt:after,receipts,providerCalls:0,configurationReapplied:false}));
 }
}catch(e){console.log(JSON.stringify({passed:false,error:e.message,receipts}));process.exitCode=1;}
