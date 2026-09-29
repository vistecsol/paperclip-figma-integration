// Executes the patched native selector, with realistic competing identities.
import {readFileSync,mkdirSync,copyFileSync,writeFileSync} from 'node:fs';
import {join,resolve} from 'node:path';
import {createRequire} from 'node:module';
import {spawnSync} from 'node:child_process';
import {pathToFileURL} from 'node:url';
import assert from 'node:assert/strict';
const host=process.argv[2] ?? '/app';
const dir=join(process.env.PAPERCLIP_RUN_SCRATCH_DIR,'draft-selection');
mkdirSync(dir,{recursive:true});
for(const {path} of JSON.parse(readFileSync('host-prerequisite/project-ui-baseline.json')).files){
 mkdirSync(join(dir,path,'..'),{recursive:true});
 copyFileSync(join(host,path),join(dir,path));
}
const applied=spawnSync('git',['apply','--unsafe-paths','--directory',dir,resolve('host-prerequisite/figma-project-ui.patch')],{encoding:'utf8'});
assert.equal(applied.status,0,applied.stderr);
const source=readFileSync(join(dir,'ui/src/features/connections/ConnectionSetupFlow.tsx'),'utf8');
const start=source.indexOf('function appSourceSlug(');
const end=source.indexOf('export type ConnectionSetupCompletion');
assert.ok(start>=0 && end>start);
const esbuild=createRequire(join(host,'package.json'))('esbuild');
const code=await esbuild.transform(source.slice(start,end)+'\nexport {reusableOAuthConnection};',{loader:'ts',format:'esm'});
writeFileSync(join(dir,'selector.mjs'),code.code);
const {reusableOAuthConnection:select}=await import(pathToFileURL(join(dir,'selector.mjs')));
const application={id:'figma-app',status:'active',sourceTemplateKey:'figma',config:{sourceTemplateKey:'figma'}};
const personal={id:'foreign',applicationId:'figma-app',status:'draft',authKind:'oauth',credentialPolicy:'per_user',createdByUserId:'other',config:{sourceTemplateKey:'figma'},transportConfig:{}};
const own={...personal,id:'own',createdByUserId:'current'};
const shared={...personal,id:'shared',credentialPolicy:'shared'};
for(const options of [{},{draftOnly:true,applicationId:'figma-app'}]){
 assert.equal(select('figma',[application],[personal,own,shared],options),null);
 assert.equal(select('figma',[application],[{...shared,status:'active'}],options),null);
}
// Other providers retain native matching and archive filtering.
const other={...personal,config:{sourceTemplateKey:'other'}};
assert.equal(select('other',[],[other]),other);
assert.equal(select('other',[],[{...other,status:'archived'}]),null);
// Explicit resume remains outside the selector; changing automatic selection does not confer authority.
assert.ok(source.includes('const refreshedConnection = refreshedResumeConnection ?? reusableOAuthConnection('));
assert.ok(source.includes('const identityConnection = resumeConnection ?? reconnectConnection;'));
console.log('Patched native selector: implicit Figma identity adoption denied; other-provider behavior and explicit paths preserved. Live UI deferred.');
