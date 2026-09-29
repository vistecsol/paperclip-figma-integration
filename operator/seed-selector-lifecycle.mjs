// Fresh, isolated, credential-free qualification instance only. No provider invocation.
// A failed prerequisite ends the coordinated attempt; do not rerun against partial state.
import fs from 'node:fs';
import {seedDraftPair,assertDraftPair,selectorOrders} from './selector-fixtures.mjs';
import {beforeMutation} from './qualification-mutation-guard.mjs';
import {lookup} from 'node:dns/promises';
import {validateFreshMapping,validateMappingEvidence,hostname} from './qualification-dns.mjs';
import {randomBytes,createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const origin='http://localhost:3310',root='/paperclip/instances/default/test-bootstrap';
const account={email:'qualification@example.invalid',name:'Qualification Operator',password:randomBytes(32).toString('hex')};
let cookie='';const receipts=[];
async function req(path,body,method=body===undefined?'GET':'POST'){
 if(method!=='GET'&&method!=='HEAD'){
  const draft=path.endsWith('/tools/connections');
  await beforeMutation({dns:draft});
  if(draft){
   const fresh=JSON.parse(fs.readFileSync('/app/qualification-dns-fresh.json','utf8'));
   validateFreshMapping(fresh,{mapping:JSON.parse(fs.readFileSync('/app/qualification-dns.json','utf8')),run:process.env.QUALIFICATION_RUN_ID});
   const resolved=await lookup(hostname,{all:true,verbatim:true});
   assert.deepEqual([...new Set(resolved.map(x=>x.address))].sort(),fresh.answers.map(x=>x.address).sort());
   validateFreshMapping(fresh,{mapping:JSON.parse(fs.readFileSync('/app/qualification-dns.json','utf8')),run:process.env.QUALIFICATION_RUN_ID});
  }
 }
 const r=await fetch('http://127.0.0.1:3310'+path,{method,signal:AbortSignal.timeout(20000),headers:{'content-type':'application/json',origin,host:'localhost:3310',...(cookie?{cookie}:{})},...(body===undefined?{}:{body:JSON.stringify(body)})});
 if(r.headers.getSetCookie().length)cookie=r.headers.getSetCookie().map(x=>x.split(';')[0]).join('; ');
 const data=await r.json();receipts.push({path,status:r.status});
 if(!r.ok)throw Error(JSON.stringify({path,status:r.status,error:data.error??data.message}));
 return data;
}
try{
 const initialDns=JSON.parse(fs.readFileSync('/app/qualification-dns.json','utf8'));
 validateMappingEvidence(initialDns,{run:process.env.QUALIFICATION_RUN_ID});
 fs.mkdirSync(root,{recursive:true});
 fs.writeFileSync(root+'/qualification-attempt.json',JSON.stringify({startedAt:new Date().toISOString()}),{flag:'wx',mode:0o600});
 const health=await req('/api/health');assert.equal(health.status,'ok');
 const auth=await req('/api/auth/sign-up/email',account);
 fs.writeFileSync(root+'/qualification-account.json',JSON.stringify(account),{mode:0o600});
 await req('/api/bootstrap/claim',{});
 const company=await req('/api/companies',{name:'VTS Offline Qualification',description:'Zero-provider local qualification only'});
 const installed=await req('/api/plugins/install',{packageName:'/app/figma-candidate',isLocalPath:true});
 console.log(JSON.stringify({stage:'installed',companyId:company.id,installed}));
 const pluginId=installed.id;
 await req('/api/plugins/'+pluginId+'/config',{companyId:company.id,configJson:{enabled:true}});
 const dnsReceipt=JSON.parse(fs.readFileSync('/app/qualification-dns.json','utf8'));
 validateMappingEvidence(dnsReceipt,{run:process.env.QUALIFICATION_RUN_ID});
 const resolved=await lookup(hostname,{all:true,verbatim:true});
 assert.deepEqual([...new Set(resolved.map(x=>x.address))].sort(),dnsReceipt.answers.map(x=>x.address).sort(),'Installed OS resolver differs from receipt');
 const ownerCookie=cookie;
 const foreign={email:'foreign@example.invalid',name:'Foreign Fixture',password:randomBytes(32).toString('hex')};
 cookie='';
 const foreignAuth=await req('/api/auth/sign-up/email',foreign);
 const foreignCookie=cookie;cookie=ownerCookie;
 const selectorCases=[];const companyIds=[];
 for(const order of selectorOrders){
  const scope=selectorCases.length===0?company:await req('/api/companies',{name:'VTS Reverse Selector Qualification'});
  companyIds.push(scope.id);
  await req('/api/admin/users/'+foreignAuth.user.id+'/company-access',{companyIds:[...companyIds]},'PUT');
  const pair=await seedDraftPair({order,create:async(kind,payload)=>{
   cookie=kind==='shared'?ownerCookie:foreignCookie;
   validateMappingEvidence(dnsReceipt,{run:process.env.QUALIFICATION_RUN_ID});
   return req('/api/companies/'+scope.id+'/tools/connections',payload);
  }});
  cookie=ownerCookie;
  const fixture={order,companyId:scope.id,issuePrefix:scope.issuePrefix,connectionId:pair.shared.id,
   applicationId:pair.shared.applicationId,foreignConnectionId:pair.foreign.id,
   ownerUserId:auth.user.id,foreignUserId:foreignAuth.user.id};
  assertDraftPair(await req('/api/companies/'+scope.id+'/tools/connections'),fixture);
  selectorCases.push(fixture);
 }
 const connection={id:selectorCases[0].connectionId,applicationId:selectorCases[0].applicationId};
 const personal={id:selectorCases[0].foreignConnectionId};
 const project=await req('/api/companies/'+company.id+'/projects',{name:'GitHub and three designs',repositoryUrls:['https://github.com/vistecsol/paperclip-figma-integration']});
 const state={companyId:company.id,projectId:project.id,installed,connectionId:connection.id,applicationId:connection.applicationId,issuePrefix:company.issuePrefix,foreignConnectionId:personal.id,selectorCases};
 fs.writeFileSync(root+'/qualification-state.json',JSON.stringify(state),{mode:0o600});
 const base='/api/plugins/'+pluginId;
 const list=async()=>{const v=await req(base+'/data/designs.list',{companyId:company.id,params:{projectId:project.id}});assert.equal(v.data.status,200);return v.data.body;};
 const mutate=async(command,status=200)=>{const v=await req(base+'/actions/designs.mutate',{companyId:company.id,params:{projectId:project.id,command}});assert.equal(v.data.status,status,JSON.stringify(v));return v;};
 let snap=await list();
 for(const [url,label] of [['https://www.figma.com/design/QualificationFile1?node-id=1-2','Foundations'],['https://www.figma.com/design/QualificationFile1?node-id=3-4','Components'],['https://www.figma.com/design/QualificationFile2?node-id=5-6','Reference']]){
  await mutate({type:'add',expectedRevision:snap.revision,connectionId:connection.id,url,label});snap=await list();
 }
 const initial=structuredClone(snap);
 const repositoryAfter=(await req('/api/projects/'+project.id)).workspaces;
 assert.equal(repositoryAfter[0].repoUrl,'https://github.com/vistecsol/paperclip-figma-integration');
 const final={snapshot:snap,repositories:repositoryAfter};
 fs.writeFileSync(root+'/qualification-snapshot.json',JSON.stringify(final),{mode:0o600});
 const index=fs.readFileSync('/app/ui/dist/index.html');const served=Buffer.from(await(await fetch(origin,{signal:AbortSignal.timeout(20000)})).arrayBuffer());assert.ok(served.equals(index));
 console.log(JSON.stringify({passed:true,receipts,state,initial,final,servedIndexSha256:createHash('sha256').update(served).digest('hex'),callsToProvider:0}));
}catch(e){console.log(JSON.stringify({passed:false,receipts,error:e.message}));process.exitCode=1;}
