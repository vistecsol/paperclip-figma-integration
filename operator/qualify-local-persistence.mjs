// Fresh, isolated, credential-free qualification instance only. No provider invocation.
// A failed prerequisite ends the coordinated attempt; do not rerun against partial state.
import fs from 'node:fs';
import {randomBytes,createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const origin='http://localhost:3310',root='/paperclip/instances/default/test-bootstrap';
const account={email:'qualification@example.invalid',name:'Qualification Operator',password:randomBytes(32).toString('hex')};
let cookie='';const receipts=[];
async function req(path,body,method=body===undefined?'GET':'POST'){
 const r=await fetch('http://127.0.0.1:3310'+path,{method,signal:AbortSignal.timeout(20000),headers:{'content-type':'application/json',origin,host:'localhost:3310',...(cookie?{cookie}:{})},...(body===undefined?{}:{body:JSON.stringify(body)})});
 if(r.headers.getSetCookie().length)cookie=r.headers.getSetCookie().map(x=>x.split(';')[0]).join('; ');
 const data=await r.json();receipts.push({path,status:r.status});
 if(!r.ok)throw Error(JSON.stringify({path,status:r.status,error:data.error??data.message}));
 return data;
}
try{
 const health=await req('/api/health');assert.equal(health.status,'ok');
 const auth=await req('/api/auth/sign-up/email',account);
 fs.writeFileSync(root+'/qualification-account.json',JSON.stringify(account),{mode:0o600});
 await req('/api/bootstrap/claim',{});
 const company=await req('/api/companies',{name:'VTS Offline Qualification',description:'Zero-provider local qualification only'});
 const installed=await req('/api/plugins/install',{packageName:'/app/figma-candidate',isLocalPath:true});
 console.log(JSON.stringify({stage:'installed',companyId:company.id,installed}));
 const pluginId=installed.id;
 await req('/api/plugins/'+pluginId+'/config',{companyId:company.id,configJson:{enabled:true}});
 const connection=await req('/api/companies/'+company.id+'/tools/connections',{name:'Qualification shared draft',applicationName:'Figma',transport:'mcp_remote',authKind:'oauth',credentialPolicy:'shared',status:'draft',enabled:true,config:{sourceTemplateKey:'figma',url:'https://mcp.figma.com/mcp'},transportConfig:{url:'https://mcp.figma.com/mcp'},credentialRefs:[]});
 const project=await req('/api/companies/'+company.id+'/projects',{name:'GitHub and three designs',repositoryUrls:['https://github.com/vistecsol/paperclip-figma-integration']});
 const state={companyId:company.id,projectId:project.id,installed,connectionId:connection.id,applicationId:connection.applicationId,issuePrefix:company.issuePrefix};
 fs.writeFileSync(root+'/qualification-state.json',JSON.stringify(state),{mode:0o600});
 const base='/api/plugins/'+pluginId;
 const list=async()=>{const v=await req(base+'/data/designs.list',{companyId:company.id,params:{projectId:project.id}});assert.equal(v.data.status,200);return v.data.body;};
 const mutate=async(command,status=200)=>{const v=await req(base+'/actions/designs.mutate',{companyId:company.id,params:{projectId:project.id,command}});assert.equal(v.data.status,status,JSON.stringify(v));return v;};
 let snap=await list();
 for(const [url,label] of [['https://www.figma.com/design/QualificationFile1?node-id=1-2','Foundations'],['https://www.figma.com/design/QualificationFile1?node-id=3-4','Components'],['https://www.figma.com/design/QualificationFile2?node-id=5-6','Reference']]){
  await mutate({type:'add',expectedRevision:snap.revision,connectionId:connection.id,url,label});snap=await list();
 }
 const initial=structuredClone(snap);
 const repositoryBefore=(await req('/api/projects/'+project.id)).workspaces;
 assert.equal(repositoryBefore[0].repoUrl,'https://github.com/vistecsol/paperclip-figma-integration');
 await mutate({type:'update',expectedRevision:snap.revision,id:snap.attachments[0].id,label:'Foundations renamed'});snap=await list();
 await mutate({type:'reorder',expectedRevision:snap.revision,ids:snap.attachments.map(x=>x.id).reverse()});snap=await list();
 await mutate({type:'primary',expectedRevision:snap.revision,id:snap.attachments[1].id});snap=await list();
 const protectedSnapshot=structuredClone(snap);
 await mutate({type:'update',expectedRevision:snap.revision-1,id:snap.attachments[0].id,label:'Stale'},409);
 await mutate({type:'add',expectedRevision:snap.revision,connectionId:connection.id,url:'https://figma.com/file/QualificationFile1/Name?node-id=01%3A02'},409);
 assert.deepEqual(await list(),protectedSnapshot);
 const detached=snap.attachments[0];
 await mutate({type:'detach',expectedRevision:snap.revision,id:detached.id});snap=await list();
 await mutate({type:'add',expectedRevision:snap.revision,connectionId:connection.id,url:detached.url,label:detached.label});snap=await list();
 const repositoryAfter=(await req('/api/projects/'+project.id)).workspaces;assert.deepEqual(repositoryAfter,repositoryBefore);
 const final={snapshot:snap,repositories:repositoryAfter};
 fs.writeFileSync(root+'/qualification-snapshot.json',JSON.stringify(final),{mode:0o600});
 const index=fs.readFileSync('/app/ui/dist/index.html');const served=Buffer.from(await(await fetch(origin)).arrayBuffer());assert.ok(served.equals(index));
 console.log(JSON.stringify({passed:true,receipts,state,initial,final,servedIndexSha256:createHash('sha256').update(served).digest('hex'),callsToProvider:0}));
}catch(e){console.log(JSON.stringify({passed:false,receipts,error:e.message}));process.exitCode=1;}
