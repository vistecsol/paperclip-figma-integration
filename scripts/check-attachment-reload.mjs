import fs from 'node:fs';
import {createRequire} from 'node:module';
const {chromium}=createRequire('/app/package.json')('/app/node_modules/.pnpm/playwright@1.62.1/node_modules/playwright');
// Read-only diagnostic: existing synthetic project, no grant or attachment mutation.
const input=JSON.parse(fs.readFileSync(0,'utf8'));
const timeout=setTimeout(()=>{console.log(JSON.stringify({passed:false,stage,error:'diagnostic deadline',events,resourceSample}));process.exit(2);},150000);
const reserve=setInterval(()=>{if(Number(fs.readFileSync('/proc/meminfo','utf8').match(/MemAvailable:\s+(\d+)/)[1])*1024<1280*1024**2)process.exit(3);},1000);
let browser, page, stage='startup';
const events=[]; const mark=name=>{stage=name;const item={stage,at:new Date().toISOString()};events.push(item);sampleResources();console.log(JSON.stringify({...item,resourceSample}));};
let resourceSample;
const sampleResources=()=>{
 try {resourceSample={at:new Date().toISOString(),...Object.fromEntries(['memory.current','memory.peak','memory.events','memory.stat','memory.pressure','cpu.stat'].map(k=>[k,fs.readFileSync('/sys/fs/cgroup/'+k,'utf8').trim()]))};}catch{}
};
sampleResources();
let resourceTicks=0;
const resourceTimer=setInterval(()=>{sampleResources();if(++resourceTicks%5===0)console.log(JSON.stringify({event:'resource-sample',stage,resourceSample}));},1000);
const path=url=>{try{return new URL(url).pathname}catch{return 'invalid-url'}};
try {
 for(const [k,v] of Object.entries({'memory.max':'536870912','memory.swap.max':'0','cpu.max':'100000 100000'}))if(fs.readFileSync('/sys/fs/cgroup/'+k,'utf8').trim()!==v)throw Error('Ineffective '+k);
 browser=await chromium.launch({headless:true,args:['--disable-dev-shm-usage']});
 const context=await browser.newContext({baseURL:'http://localhost:3310',viewport:{width:1280,height:1000}});
 mark('native-login');
 const login=await context.request.post('/api/auth/sign-in/email',{data:input.account,headers:{origin:'http://localhost:3310'}});
 if(!login.ok())throw Error('Native login failed');
 const companyId=input.state.companyId, pluginId=input.state.installed.id;
 const company=(await (await context.request.get('/api/companies')).json()).find(x=>x.id===companyId);
 const project={id:'370fd415-d4f9-45c0-9e89-bfded2155bfa'};
 await context.addInitScript(id=>localStorage.setItem('paperclip.selectedCompanyId',id),companyId);
 page=await context.newPage();page.setDefaultTimeout(35000);page.setDefaultNavigationTimeout(35000);
 page.on('requestfinished',r=>events.push({at:new Date().toISOString(),event:'finished',path:path(r.url())}));
 page.on('request',r=>events.push({at:new Date().toISOString(),event:'request',path:path(r.url()),method:r.method()}));
 page.on('response',async r=>{
 events.push({at:new Date().toISOString(),event:'response',path:path(r.url()),status:r.status(),worker:r.fromServiceWorker()});
 if(['/api/auth/get-session','/api/health','/api/instance/settings/experimental'].includes(path(r.url()))) {
  try {const b=await r.json();events.push({at:new Date().toISOString(),event:'body-complete',path:path(r.url()),object:!!b,sessionUserPresent:!!b?.user,deploymentMode:b?.deploymentMode,bootstrapStatus:b?.bootstrapStatus});}catch{events.push({at:new Date().toISOString(),event:'body-error',path:path(r.url())});}
 }
});
 page.on('requestfailed',r=>events.push({at:new Date().toISOString(),event:'requestfailed',path:path(r.url()),error:r.failure()?.errorText}));
 page.on('console',m=>events.push({at:new Date().toISOString(),event:'console',type:m.type(),class:/Failed to fetch|dynamically imported|module/i.test(m.text())?'module-or-fetch':/React|Minified/i.test(m.text())?'react':'other'}));
 page.on('pageerror',e=>events.push({at:new Date().toISOString(),event:'pageerror',name:e.name,message:e.message.replace(/https?:\/\/[^ ]+/g,'[url]').slice(0,300)}));
 mark('fresh-navigation');
 await page.goto('/'+company.issuePrefix+'/projects/'+project.id);
 mark('open-designs');
 await page.getByRole('tab',{name:'Designs',exact:true}).click();
 mark('saved-link-visible');
 await page.getByRole('link',{name:/Unverified layout proof/}).waitFor();
 await page.screenshot({path:'/app/attach-desktop.png'});
 mark('reload');
 await page.reload();
 mark('reload-link-visible');
 await page.getByRole('link',{name:/Unverified layout proof/}).waitFor();
 await page.setViewportSize({width:390,height:1000});
 await page.screenshot({path:'/app/attach-mobile.png'});
 mark('keyed-readback');
 const response=await context.request.post('/api/plugins/'+pluginId+'/data/designs.list',{data:{companyId,params:{projectId:project.id}},headers:{origin:'http://localhost:3310'}});
 const result=await response.json();
 events.push({at:new Date().toISOString(),event:'browser-state',...(await page.evaluate(()=>({visibility:document.visibilityState,worker:!!navigator.serviceWorker?.controller})))});
 const row=result.data?.body?.attachments?.[0];
 if(result.data?.status!==200||row?.label!=='Unverified layout proof'||row?.connectionId!=='165fc3b9-48c8-4f20-a549-0f7ffe4b339f')throw Error('Persistence mismatch');
 console.log(JSON.stringify({passed:true,stage,events,projectId:project.id,freshNavigation:true,reload:true,innerStatus:result.data.status,revision:result.data.body.revision,verification:row.verification.state,memoryPeak:fs.readFileSync('/sys/fs/cgroup/memory.peak','utf8').trim(),memoryEvents:fs.readFileSync('/sys/fs/cgroup/memory.events','utf8').trim()}));
} catch(e){if(page)events.push({at:new Date().toISOString(),event:'browser-state',...(await page.evaluate(()=>({visibility:document.visibilityState,worker:!!navigator.serviceWorker?.controller})).catch(()=>({})))});if(page)await page.screenshot({path:'/app/attach-desktop.png',timeout:5000}).catch(()=>{});console.log(JSON.stringify({passed:false,stage,events,resourceSample,error:e.message,visibleText:page?await page.locator('body').innerText({timeout:5000}).catch(()=>'unavailable'):'unavailable'}));process.exitCode=1;}
finally{clearInterval(resourceTimer);clearInterval(reserve);await browser?.close();clearTimeout(timeout);}
