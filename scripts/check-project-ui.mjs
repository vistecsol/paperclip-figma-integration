// Focused DOM/transport proof. Native browser HTTP and full-host compilation are separate gates.
import { createRequire } from 'node:module';
import { readFileSync, writeFileSync, mkdirSync, symlinkSync, existsSync, copyFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { spawnSync } from 'node:child_process';
import assert from 'node:assert/strict';
import { changeDesigns } from '../src/attachments.mjs';
const host = resolve(process.argv[2] ?? '/app');
const scratch = join(process.env.PAPERCLIP_RUN_SCRATCH_DIR, 'project-ui-proof');
mkdirSync(join(scratch, 'ui/src/components'), { recursive: true });
for (const name of ['NewProjectDialog.tsx','ProjectProperties.tsx']) copyFileSync(join(host, 'ui/src/components', name), join(scratch, 'ui/src/components', name));
const applied = spawnSync('git', ['apply', '--unsafe-paths', '--directory', scratch, resolve('host-prerequisite/figma-project-ui.patch')], { encoding: 'utf8' });
assert.equal(applied.status, 0, applied.stderr);
const component = resolve('host-prerequisite/ui/src/components/FigmaDesignEditor.tsx');
const requireHost = createRequire(join(host, 'package.json'));
const requireUi = createRequire(join(host, 'ui/package.json'));
const { JSDOM } = requireHost('./node_modules/.pnpm/jsdom@30.0.1_@noble+hashes@2.4.0/node_modules/jsdom');
const dom = new JSDOM('<div id="root"></div>', { url: 'https://paperclip.test' });
globalThis.window = dom.window; globalThis.document = dom.window.document; globalThis.IS_REACT_ACT_ENVIRONMENT = true;
const React = requireUi('react'); const { act } = React;
const { createRoot } = requireUi('react-dom/client');

if (!existsSync(join(scratch, 'node_modules'))) symlinkSync(join(host, 'ui/node_modules'), join(scratch, 'node_modules'));
const mocks = join(scratch, 'mocks.mjs');
writeFileSync(mocks, `import React from 'react';
export const api = { get: async () => ({connections: [{id:'managed', name:'VTS Figma', enabled:true, transport:'mcp_remote', authKind:'oauth', config:{url:'https://mcp.figma.com/mcp'}}]}) };
export const pluginsApi = { listUiContributions: async () => [{pluginId:'plugin',pluginKey:'vistecsol.figma'}], bridgeGetData: (...a) => globalThis.proof.read(...a), bridgePerformAction: (...a) => globalThis.proof.write(...a) };
export const projectsApi = {create: (...a) => globalThis.proof.create(...a)};
export const queryKeys = {projects:{all: id => ['projects',id]}};
export const useDialog = () => ({}); export const useCompany = () => ({});
export const Button = ({variant,size,children,...props}) => React.createElement('button',props,children);
export const Dialog = ({open,children}) => open ? React.createElement('div',null,children) : null;
export const DialogContent = ({children}) => React.createElement('div',null,children);
export const DialogTitle = ({children}) => React.createElement('h2',null,children);
export const Figma = () => null; export const Plus = Figma; export const X = Figma; export const Folder = Figma;
export const ConnectionSetupFlow = () => React.createElement('p',null,'Native connection setup');
export const repositoryOptionsKey = id => ['repos',id];
export const ProjectRepositoryInput = ({onChange,disabled}) => React.createElement('button',{type:'button',disabled,onClick:()=>onChange([{id:'github-repo'}])},'Select GitHub repo');
`);
const output = join(scratch, 'proof.mjs');
await requireHost('esbuild').build({ stdin: {contents: `export {QueryClient, QueryClientProvider} from "@tanstack/react-query"; export {NewProjectForm} from ${JSON.stringify(join(scratch,'ui/src/components/NewProjectDialog.tsx'))}; export * from ${JSON.stringify(component)};`,resolveDir: scratch}, outfile: output, bundle: true, format:'esm',platform:'node',jsx:'automatic',external:['react','react/jsx-runtime','@tanstack/react-query'], plugins:[{name:'boundaries',setup(build){build.onResolve({filter:/.*/},args=>{
 if (args.path === './FigmaDesignEditor') return {path:component};
 if (args.path.startsWith('.') && args.importer === component || ['lucide-react'].includes(args.path) || args.path.startsWith('@/') || args.importer.endsWith('NewProjectDialog.tsx') && args.path !== 'react' && args.path !== 'react/jsx-runtime' && args.path !== '@tanstack/react-query') return {path:mocks};
});}}] });
const {QueryClient, QueryClientProvider, NewProjectForm, ProjectFigmaDesigns, saveCreatedDesigns, normalizeFigmaLink} = await import(pathToFileURL(output));
let snapshot={revision:0,attachments:[]}, creates=0, failOnce=true, sent=[];
globalThis.proof={
 read:async (_plugin,_key,params,company)=>{assert.equal(company,'company');assert.equal(params.projectId,'project');return {data:{status:200,body:structuredClone(snapshot)}};},
 write:async (_plugin,_key,params,company)=>{assert.equal(company,'company');assert.equal(params.projectId,'project');sent.push(params.command);if(failOnce && snapshot.attachments.length===1){failOnce=false;throw new Error('transport unavailable');}try{snapshot=changeDesigns(snapshot,params.command);return {data:{status:200,body:structuredClone(snapshot)}};}catch(e){return {data:{status:e.status,body:{error:e.code}}};}},
 create:async (company,body)=>{assert.equal(company,'company');assert.deepEqual(body.repositoryIds,['github-repo']);creates++;return {id:'project'};}
};
const drafts=[{connectionId:'managed',url:'https://www.figma.com/design/File?node-id=1-2',label:'First',purpose:''},{connectionId:'managed',url:'https://www.figma.com/design/File?node-id=3-4',label:'Second',purpose:'',primary:true}];
await assert.rejects(()=>saveCreatedDesigns('company','project',drafts),/transport unavailable/);
await saveCreatedDesigns('company','project',drafts);
assert.equal(snapshot.attachments.length,2);assert.equal(snapshot.attachments[1].primary,true);
assert.equal(normalizeFigmaLink('https://figma.com/file/File?node-id=01:02'),'https://www.figma.com/design/File?node-id=1-2');
assert.throws(()=>normalizeFigmaLink('https://figma.com.evil/design/File'));
const client=new QueryClient({defaultOptions:{queries:{retry:false,gcTime:0},mutations:{retry:false,gcTime:0}}});
const root=createRoot(document.getElementById('root'));
const render=component=>act(async()=>{root.render(React.createElement(QueryClientProvider,{client},component));await new Promise(r=>setTimeout(r,10));});
const button=label=>[...document.querySelectorAll('button')].find(b=>b.textContent===label);
const click=label=>act(async()=>{assert.ok(button(label),label);button(label).click();await new Promise(r=>setTimeout(r,10));});
const change=async(input,value)=>act(async()=>{Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set.call(input,value);input.dispatchEvent(new window.Event('input',{bubbles:true}));});
try {
 await render(React.createElement(ProjectFigmaDesigns,{companyId:'company',projectId:'project'}));
 await render(React.createElement(ProjectFigmaDesigns,{companyId:'company',projectId:'project'}));
 assert.match(document.body.textContent,/Figma designs/);assert.match(document.body.textContent,/First/);
 await change(document.querySelector('input[maxlength="200"]'),'Renamed');
 await click('Save designs');await click('Reload designs');
 assert.equal(snapshot.attachments[0].label,'Renamed');assert.equal(document.querySelector('input[maxlength="200"]').value,'Renamed');
 await change(document.querySelector('input[maxlength="200"]'),'Stale draft');
 snapshot=changeDesigns(snapshot,{type:'update',id:snapshot.attachments[0].id,label:'Other editor',expectedRevision:snapshot.revision});
 await act(async()=>{await client.invalidateQueries({queryKey:['project-figma-designs','company','project']});await new Promise(r=>setTimeout(r,10));});
 await click('Save designs');assert.equal(snapshot.attachments[0].label,'Other editor');assert.match(document.body.textContent,/Designs changed/);assert.ok(button('Save designs').disabled);
 await click('Reload designs');
 await render(React.createElement(NewProjectForm,{companyId:'company',onClose:()=>{}}));
 assert.match(document.body.textContent,/Create project/);assert.ok(button('Add Figma design'));assert.ok(button('Select GitHub repo'));
 snapshot={revision:0,attachments:[]};failOnce=true;
 await change(document.querySelector('input[aria-label="Project name"]'),'Test');await click('Select GitHub repo');
 for (const row of drafts) {
   await click('Add Figma design');
   await act(async()=>{const select=document.querySelector('select');select.value='managed';select.dispatchEvent(new window.Event('change',{bubbles:true}));});
   await change(document.querySelector('input[type="url"]'),row.url);await click('Add design');
 }
 await click('Create project');assert.equal(creates,1);assert.equal(snapshot.attachments.length,1);assert.match(document.body.textContent,/Project created; some designs/);
 await click('Retry design save');assert.equal(creates,1);assert.equal(snapshot.attachments.length,2);
 assert.equal((await proof.read('plugin','designs.list',{projectId:'project'},'company')).data.body.attachments.length,2);
 console.log('PASS: pinned patch application; normalized duplicate identity; partial association retry; configuration save/reload with actual storage transition; create entry point and GitHub payload preservation. Mock transport only; browser HTTP deferred.');
} finally {await act(async()=>root.unmount());client.clear();dom.window.close();delete globalThis.proof;}
