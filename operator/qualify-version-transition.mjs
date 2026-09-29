// Native API phase driver. Outer owned session must stage selected bytes while
// stopped, re-admit, restart, and maintain its mutation/reserve supervisor.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {pathToFileURL} from 'node:url';
import {collectRetention} from './collect-retention.mjs';
import {assertRetention,assertVersionTransition} from './retention-receipts.mjs';
import {beforeMutation} from './qualification-mutation-guard.mjs';
const root='/paperclip/instances/default/test-bootstrap/';
const read=n=>JSON.parse(fs.readFileSync(root+'qualification-'+n+'.json','utf8'));
const state=read('state'),pair=JSON.parse(fs.readFileSync('/app/version-pair.json','utf8'));
const phase=process.argv[2];assert.ok(['baseline','upgrade','rollback'].includes(phase));
const target=pair.packages[phase==='upgrade'?1:0];
const selectedRoot='/app/release-'+target.version;
const hash=p=>createHash('sha256').update(fs.readFileSync(p)).digest('hex');
// Validate the complete extracted package, including worker and provenance.
for(const [p,digest]of Object.entries(target.files)){
 assert.ok(!p.startsWith('/')&&!p.split('/').includes('..'));assert.equal(hash(selectedRoot+'/'+p),digest,p);
}
assert.equal(hash('/app/vistecsol-paperclip-figma-integration-'+target.version+'.tgz'),target.packageSha256);
const manifest=(await import(pathToFileURL(selectedRoot+'/dist/manifest.mjs'))).default;
assert.equal(manifest.version,target.version);assert.equal(manifest.id,'vistecsol.figma');
let cookie='';const receipts=[];
async function request(p,body){const r=await fetch('http://127.0.0.1:3310'+p,{method:body===undefined?'GET':'POST',signal:AbortSignal.timeout(20000),headers:{origin:'http://localhost:3310',host:'localhost:3310','content-type':'application/json',cookie},...(body===undefined?{}:{body:JSON.stringify(body)})});if(r.headers.getSetCookie().length)cookie=r.headers.getSetCookie().map(x=>x.split(';')[0]).join('; ');const value={status:r.status,body:await r.json()};receipts.push({path:p,status:r.status,innerStatus:value.body.data?.status});assert.equal(r.status,200);return value.body;}
await beforeMutation();await request('/api/auth/sign-in/email',read('account'));
const endpoint='/api/plugins/'+state.installed.id;
if(phase!=='baseline'){
 const previous=read(phase==='upgrade'?'version-baseline':'version-upgrade');
 const current=await collectRetention(state);assert.equal(current.plugin.version,previous.version,'Host must not silently update registry before native upgrade');
 await beforeMutation();
 // Native local upgrades re-read this directory. Do not use a symlink:
 // Node caches its realpath across imports. Running executable/migration bytes
 // must remain identical for this version-only qualification pair.
 const installedRoot='/app/figma-slot/current';
 assert.equal(fs.lstatSync(installedRoot).isDirectory(),true);
 assert.equal(fs.lstatSync(installedRoot).isSymbolicLink(),false);
 const prior=pair.packages.find(x=>x.version===previous.version);assert.ok(prior);
 for(const [p,digest]of Object.entries(prior.files))assert.equal(hash(installedRoot+'/'+p),digest,p);
 for(const [p,digest]of Object.entries(target.files)){
  if(p==='dist/worker.mjs'||p.startsWith('dist/ui/')||p.startsWith('migrations/'))assert.equal(prior.files[p],digest,'Executable or schema change requires separate fixture');
 }
 const oldMtime=fs.statSync(installedRoot+'/dist/manifest.mjs').mtimeMs;
 for(const p of Object.keys(prior.files))if(!(p in target.files))fs.unlinkSync(installedRoot+'/'+p);
 for(const [p,digest]of Object.entries(target.files)){
  const dest=installedRoot+'/'+p;
  if(!fs.existsSync(dest)||hash(dest)!==digest){fs.mkdirSync(path.dirname(dest),{recursive:true});fs.copyFileSync(selectedRoot+'/'+p,dest);}
 }
 // Native loader's documented cache key is truncated manifest mtime. Tarballs
 // normalize this metadata, so ensure the newly staged manifest has a fresh key.
 const stamp=Math.max(Date.now(),Math.floor(oldMtime)+1000)/1000;
 fs.utimesSync(installedRoot+'/dist/manifest.mjs',stamp,stamp);
 assert.notEqual(Math.trunc(fs.statSync(installedRoot+'/dist/manifest.mjs').mtimeMs),Math.trunc(oldMtime));
 for(const [p,digest]of Object.entries(target.files))assert.equal(hash(installedRoot+'/'+p),digest,p);
 const changed=await request(endpoint+'/upgrade',{version:target.version});assert.equal(changed.version,target.version);assert.equal(changed.status,'ready');
}
const s=await collectRetention(state);s.repositories=(await request('/api/projects/'+state.projectId)).workspaces;
const api=await request(endpoint+'/data/designs.list',{companyId:state.companyId,params:{projectId:state.projectId}});assert.equal(api.data.status,200);
assert.deepEqual({revision:api.data.body.revision,attachments:api.data.body.attachments},s.snapshot);
const result={...s,version:s.plugin.version,status:s.plugin.status,packageSha256:target.packageSha256,api:api.data.body};
assert.equal(result.version,target.version);assert.equal(result.status,'ready');
if(phase!=='baseline'){
 const baseline=read('version-baseline'),previous=read(phase==='upgrade'?'version-baseline':'version-upgrade');
 assertRetention(baseline,result);assert.deepEqual(result.config,baseline.config);assert.deepEqual(result.api,baseline.api);assertVersionTransition(previous,result,target);
}
fs.writeFileSync(root+'qualification-version-'+phase+'.json',JSON.stringify(result),{flag:'wx',mode:0o600});
console.log(JSON.stringify({phase,passed:true,receipt:result,receipts,providerCalls:0}));
