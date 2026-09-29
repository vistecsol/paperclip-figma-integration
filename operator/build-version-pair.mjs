// Run only in the admitted, supervised Linux builder; never publishes.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {pathToFileURL} from 'node:url';
const [source,host,out,revision]=process.argv.slice(2);
assert.match(revision??'',/^[a-f0-9]{40}$/);
assert.ok(!fs.existsSync(out),'Fresh pair output required');fs.mkdirSync(out,{recursive:true});
const run=(cmd,args,cwd)=>execFileSync(cmd,args,{cwd,stdio:'inherit'});
const hash=p=>createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const inventory=root=>Object.fromEntries(fs.readdirSync(root,{recursive:true}).filter(p=>fs.statSync(path.join(root,p)).isFile()).sort().map(p=>[p,hash(path.join(root,p))]));
const results=[];
for(const version of ['0.1.0-lifecycle.1','0.1.0-lifecycle.2']){
 const cwd=path.join(out,version);run('git',['clone','--no-local','--no-hardlinks',source,cwd]);run('git',['checkout','--detach',revision],cwd);
 assert.equal(execFileSync('git',['rev-parse','HEAD'],{cwd,encoding:'utf8'}).trim(),revision);
 const p=JSON.parse(fs.readFileSync(path.join(cwd,'package.json'),'utf8'));p.version=version;
 fs.writeFileSync(path.join(cwd,'package.json'),JSON.stringify(p,null,2)+'\n');
 const mf=path.join(cwd,'src/manifest.mjs'),original=fs.readFileSync(mf,'utf8');
 assert.equal((original.match(/version: '0.1.0-alpha.1'/g)??[]).length,1);
 fs.writeFileSync(mf,original.replace("version: '0.1.0-alpha.1'",`version: '${version}'`));
 // Version is an input to the normal build, not a post-pack modification.
 run('node',['scripts/build.mjs',host],cwd);
 run('npm',['pack','--pack-destination',out],cwd);
 const tarball=path.join(out,`vistecsol-paperclip-figma-integration-${version}.tgz`);
 const extracted=path.join(out,'extracted-'+version);fs.mkdirSync(extracted);run('tar',['-xzf',tarball,'-C',extracted]);
 const root=path.join(extracted,'package');
 const manifest=(await import(pathToFileURL(path.join(root,'dist/manifest.mjs')))).default;
 assert.equal(manifest.version,version);assert.equal(JSON.parse(fs.readFileSync(path.join(root,'package.json'))).version,version);
 run('node',['scripts/verify-build.mjs'],root);
 results.push({version,sourceRevision:revision,tarball:path.basename(tarball),packageSha256:hash(tarball),manifest,files:inventory(root)});
}
const [a,b]=results;assert.notEqual(a.packageSha256,b.packageSha256);
const withoutVersion=m=>{const {version,...rest}=m;return rest;};assert.deepEqual(withoutVersion(a.manifest),withoutVersion(b.manifest));
for(const name of Object.keys(a.files).filter(p=>p.startsWith('migrations/')||['dist/worker.mjs','dist/ui/index.js'].includes(p)))assert.equal(a.files[name],b.files[name],name+' drift');
fs.writeFileSync(path.join(out,'version-pair.json'),JSON.stringify({qualification:'unpublished-test-pair-not-release',hostCommit:'d554c4789ed3930f8a53ac9fdf6503b3187097da',packages:results},null,2)+'\n');
console.log('Distinct normal-build/prepack artifacts verified; upgrade/rollback runtime not claimed.');
