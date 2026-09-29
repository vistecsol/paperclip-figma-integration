import assert from 'node:assert/strict';
import {assertSelectorIntent} from '../operator/qualification-selector.mjs';
import {qualifyLifecycle,assertUnavailable} from '../operator/qualification-lifecycle.mjs';
const read={kind:'connections-read',status:200};
const intent={kind:'mutation-blocked',method:'POST',path:'/api/companies/c/tools/apps/connect',
 galleryKey:'figma',resumeConnectionId:null,reconnectConnectionId:null};
assertSelectorIntent([read,intent],{companyId:'c',mode:'new'});
assert.throws(()=>assertSelectorIntent([read,{...intent,resumeConnectionId:'foreign'}],{companyId:'c',mode:'new'}));
assertSelectorIntent([read,{...intent,resumeConnectionId:'chosen'}],{companyId:'c',mode:'resume',connectionId:'chosen'});
assert.throws(()=>assertSelectorIntent([read,{...intent,resumeConnectionId:'foreign'}],{companyId:'c',mode:'resume',connectionId:'chosen'}));
assert.throws(()=>assertSelectorIntent([intent],{companyId:'c',mode:'new'}));
assert.throws(()=>assertSelectorIntent([read,intent,{kind:'provider-prerequisite-blocked'}],{companyId:'c',mode:'new'}));
assert.throws(()=>assertUnavailable({status:200,body:{data:{status:403}}}));
const baseline={snapshot:{revision:1,attachments:[{id:'a',label:'Keep'}]},repositories:[{repoUrl:'https://github.com/example/repo'}]};
async function exercise(corrupt=false){
 let status='ready',guards=0;
 const request=async(path,body,method)=>{
  if(path.endsWith('/disable'))status='disabled';
  if(path.endsWith('/enable')){status='ready';}
  if(path.endsWith('designs.list'))return status==='ready'?{status:200,body:{data:{status:200,body:corrupt&&guards===3?{...baseline.snapshot,revision:2}:baseline.snapshot}}}:{status:502,body:{code:'WORKER_UNAVAILABLE'}};
  if(path.endsWith('designs.mutate'))return {status:502,body:{code:'WORKER_UNAVAILABLE'}};
  if(path.startsWith('/api/projects/'))return {status:200,body:{workspaces:baseline.repositories}};
  return {status:200,body:{status}};
 };
 const result=await qualifyLifecycle({request,state:{companyId:'c',projectId:'p',installed:{id:'i'}},baseline,
  phase:'disable-enable',beforeMutation:async()=>{guards++;}});
 assert.equal(guards,3);return result;
}
assert.equal((await exercise()).preserved,true);
await assert.rejects(exercise(true));
console.log('Offline assertion contracts passed; no browser/native lifecycle execution claimed.');
