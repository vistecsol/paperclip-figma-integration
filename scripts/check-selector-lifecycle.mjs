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

const {seedDraftPair,assertDraftPair,selectorOrders,connectionRows}=await import('../operator/selector-fixtures.mjs');
const {assertRenderedIdentity}=await import('../operator/qualification-selector.mjs');
for(const order of selectorOrders){
 const writes=[];
 const pair=await seedDraftPair({order,create:async(kind,body)=>{
  writes.push(body);
  if(writes.length===1)assert.equal(body.applicationName,'Figma');
  else {assert.equal(body.applicationId,'app');assert.equal('applicationName' in body,false);}
  return {...body,id:kind,applicationId:'app',companyId:'c',createdByUserId:kind==='shared'?'owner':'foreign',credentialSecretRefs:[]};
 }});
 const rows=order==='foreign-first'?[pair.foreign,pair.shared]:[pair.shared,pair.foreign];
 const state={order,companyId:'c',applicationId:'app',connectionId:'shared',foreignConnectionId:'foreign',ownerUserId:'owner',foreignUserId:'foreign'};
 const envelope={connections:rows};
 assert.equal(connectionRows(envelope),rows,'Unwrap without sorting or copying');
 assertDraftPair(connectionRows(envelope),state);
 for(const malformed of [rows,{},null,{connections:{}},{connections:null}])
  assert.throws(()=>connectionRows(malformed));
 assert.throws(()=>assertDraftPair([...rows].reverse(),state));
 assert.throws(()=>assertDraftPair(rows.map(x=>x.id==='foreign'?{...x,createdByUserId:'owner'}:x),state));
}
await assert.rejects(seedDraftPair({order:'foreign-first',create:async()=>({id:'missing-app'})}));
const names={shared:'Qualification shared draft',foreign:'Foreign personal draft'};
for(const mode of ['new','resume','reconnect']){
 const observed={mode,names,text:mode==='new'?'Connect Figma':names.shared,selectedAudience:'Any human in the company'};
 assertRenderedIdentity(observed);
 assert.throws(()=>assertRenderedIdentity({...observed,text:names.foreign}));
 assert.throws(()=>assertRenderedIdentity({...observed,selectedAudience:'Just me'}));
 if(mode!=='new')assert.throws(()=>assertRenderedIdentity({...observed,text:'Connect Figma'}));
}
console.log('Both native-order fixture contracts, application-ID reuse and rendered-identity failure contracts passed offline.');
