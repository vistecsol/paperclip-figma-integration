// Offline rendering of actual patched native headers/screens, not runtime acceptance.
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdirSync,copyFileSync} from 'node:fs';
import {join,resolve} from 'node:path';
import {createRequire} from 'node:module';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
const host=resolve(process.argv[2]??'/app');
const dir=join(process.env.PAPERCLIP_RUN_SCRATCH_DIR,'setup-identity');
for(const file of JSON.parse(readFileSync('host-prerequisite/project-ui-baseline.json')).files){
 const bytes=readFileSync(join(host,file.path));
 assert.equal(createHash('sha256').update(bytes).digest('hex'),file.sha256);
 mkdirSync(join(dir,file.path,'..'),{recursive:true});copyFileSync(join(host,file.path),join(dir,file.path));
}
const patch=spawnSync('git',['apply','--unsafe-paths','--directory',dir,resolve('host-prerequisite/figma-project-ui.patch')],{encoding:'utf8'});
assert.equal(patch.status,0,patch.stderr);
const source=readFileSync(join(dir,'ui/src/features/connections/ConnectionSetupFlow.tsx'),'utf8');
const esbuild=createRequire(join(host,'package.json'))('esbuild');
// Parse the whole changed source, then render the actual native components with cosmetic dependencies stubbed.
await esbuild.transform(source,{loader:'tsx',format:'esm'});
const helper=source.slice(source.indexOf('type SelectedSetupIdentity'),source.indexOf('export type ConnectionSetupCompletion'));
const screens=source.slice(source.indexOf('function StepHeader('),source.indexOf('function ZapierConnectStep('));
const code=await esbuild.transform(helper+screens+'\nexport {selectedFigmaSetupIdentity, StepHeader};',{loader:'tsx',format:'cjs',jsxFactory:'React.createElement'});
const requireUi=createRequire(join(host,'ui/package.json'));
const React=requireUi('react'),{renderToStaticMarkup:render}=requireUi('react-dom/server');
const module={exports:{}};
const stub=({children})=>React.createElement('span',null,children);
new Function('module','React','AppLogo','Button','UnverifiedServerBadge','cn','Link2','Lock','Loader2','ArrowUpRight',code.code)(module,React,stub,stub,stub,(...a)=>a.filter(Boolean).join(' '),stub,stub,stub,stub);
const {selectedFigmaSetupIdentity:identity,StepHeader,OAuthConnectStateScreen}=module.exports;
const connection={name:'Company <Figma> & design',credentialPolicy:'shared',config:{sourceTemplateKey:'figma'}};
assert.equal(identity(null),undefined);
assert.equal(identity({...connection,config:{sourceTemplateKey:'other'}}),undefined);
assert.equal(identity({...connection,credentialPolicy:'per_user'}).audience,'Just me');
assert.equal(identity({...connection,credentialPolicy:'per_agent'}).audience,'A dedicated account for an agent');
const selected=identity(connection);
const entry={name:'Figma',branding:{logoUrl:null}};
for(const phase of ['entry','starting','redirecting','error']){
 const html=render(React.createElement(OAuthConnectStateScreen,{entry,phase,resuming:true,selectedSetupIdentity:selected,onRetry(){},onBack(){},onCancel(){}}));
 assert.ok(html.includes('Company &lt;Figma&gt; &amp; design'));
 assert.ok(html.includes('Any human in the company'));
 assert.ok(html.includes('Connect Figma'));
 const fresh=render(React.createElement(OAuthConnectStateScreen,{entry,phase,onRetry(){},onBack(){},onCancel(){}}));
 assert.ok(!fresh.includes('Selected connection'));assert.ok(!fresh.includes(connection.name));
}
for(const step of ['access','key']){
 const html=render(React.createElement(StepHeader,{step,subtitle:'Setup',labels:['Access','Sign in'],activeIndex:0,appIdentity:{name:'Figma',logoUrl:null},selectedSetupIdentity:selected,onCancel(){}}));
 assert.ok(html.includes('Any human in the company'));assert.ok(html.includes('Company &lt;Figma&gt; &amp; design'));
}
// Wiring must use only explicit native-fetched identity, never implicit draft state.
assert.ok(source.includes('const selectedSetupIdentity = selectedFigmaSetupIdentity(identityConnection);'));
assert.ok(source.includes('const identityConnection = resumeConnection ?? reconnectConnection;'));
assert.equal((source.match(/selectedSetupIdentity=\{selectedSetupIdentity\}/g)||[]).length,4);
console.log('Patched source parse and native rendering passed: explicit identity, audiences, OAuth phases, subsequent headers, fresh setup absence and escaped names. Installed browser proof deferred.');
