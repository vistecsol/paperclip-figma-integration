// Exercise actual phase driver at a deterministic native API/storage boundary.
// Does not claim Docker, SQL, worker reload, or live lifecycle qualification.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {spawnSync,execFileSync} from 'node:child_process';
const scratch=process.env.PAPERCLIP_RUN_SCRATCH_DIR;assert.ok(scratch);
const source=fs.readFileSync('operator/qualify-version-transition.mjs','utf8');
const input=path.resolve(process.argv[2]);const pair=JSON.parse(fs.readFileSync(path.join(input,'version-pair.json')));
const root=path.join(scratch,'version-driver-contract');fs.mkdirSync(root);
const fixture={pluginId:'p',namespace:'n',companyId:'c',projectId:'j',snapshot:{revision:3,attachments:[{id:'design',label:'keep',connectionId:'c1'}]},repositories:[{id:'repo',repositoryUrl:'https://github.com/example/repo'}],migrationHistory:[{checksum:'unchanged'}],config:{enabled:true},plugin:{version:pair.packages[0].version,status:'ready'}};
fs.writeFileSync(path.join(root,'qualification-state.json'),JSON.stringify({installed:{id:'p'},companyId:'c',projectId:'j'}));
fs.writeFileSync(path.join(root,'qualification-account.json'),'{}');
fs.writeFileSync(path.join(root,'fixture.json'),JSON.stringify(fixture));
fs.copyFileSync('operator/retention-receipts.mjs',path.join(root,'retention-receipts.mjs'));
fs.writeFileSync(path.join(root,'boundary.mjs'),`import fs from 'node:fs';
export const fixture=JSON.parse(fs.readFileSync(new URL('./fixture.json',import.meta.url)));
export async function beforeMutation(){};
export async function collectRetention(){return structuredClone(fixture)};
globalThis.fetch=async(url,opts)=>{const p=new URL(url).pathname;let body;
 if(p==='/api/auth/sign-in/email')body={};
 else if(p==='/api/projects/j')body={workspaces:fixture.repositories};
 else if(p==='/api/plugins/p/upgrade'){fixture.plugin.version=JSON.parse(opts.body).version;if(process.env.CORRUPT_RETAINED==='1')fixture.snapshot.attachments[0].label='changed';body={...fixture.plugin};}
 else if(p==='/api/plugins/p/data/designs.list')body={data:{status:200,body:{...fixture.snapshot,connections:[]}}};
 else throw Error('Unexpected native route '+p);
 return {status:200,headers:{getSetCookie:()=>[]},json:async()=>body};
};`);
let driver=source.replace("import {collectRetention} from './collect-retention.mjs';","import {collectRetention,beforeMutation} from './boundary.mjs';").replace("import {beforeMutation} from './qualification-mutation-guard.mjs';",'');
driver=driver.replaceAll('/paperclip/instances/default/test-bootstrap/',root+'/').replaceAll('/app/version-pair.json',path.join(input,'version-pair.json')).replaceAll('/app/figma-candidate/',root+'/candidate/package/').replaceAll('/app/selected-candidate.tgz',root+'/selected.tgz');
fs.writeFileSync(path.join(root,'driver.mjs'),driver);
function stage(i){const dest=path.join(root,'candidate');if(fs.existsSync(dest))fs.renameSync(dest,dest+'-'+Date.now());fs.mkdirSync(dest);fs.copyFileSync(path.join(input,pair.packages[i].tarball),path.join(root,'selected.tgz'));execFileSync('tar',['-xzf',path.join(root,'selected.tgz'),'-C',dest]);}
function run(phase,env={}){return spawnSync(process.execPath,[path.join(root,'driver.mjs'),phase],{encoding:'utf8',env:{...process.env,...env}});}
stage(0);let r=run('baseline');assert.equal(r.status,0,r.stderr);
stage(1);r=run('upgrade',{CORRUPT_RETAINED:'1'});assert.notEqual(r.status,0);assert.match(r.stderr,/Retention changed: snapshot/);assert.ok(!fs.existsSync(path.join(root,'qualification-version-upgrade.json')));
r=run('upgrade');assert.equal(r.status,0,r.stderr);
fixture.plugin.version=pair.packages[1].version;fs.writeFileSync(path.join(root,'fixture.json'),JSON.stringify(fixture));
stage(0);r=run('rollback');assert.equal(r.status,0,r.stderr);
// Reject tampered installed bytes before the first native operation.
fs.appendFileSync(path.join(root,'candidate/package/dist/worker.mjs'),'\n// tampered\n');r=run('baseline');assert.notEqual(r.status,0);assert.match(r.stderr,/dist\/worker.mjs/);
console.log('Actual phase driver passed version round-trip, retained-state corruption refusal and installed-byte tamper refusal at simulated native boundary.');
