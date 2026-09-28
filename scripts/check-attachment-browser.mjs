import fs from 'node:fs';
import {createRequire} from 'node:module';
const {chromium}=createRequire('/app/package.json')('/app/node_modules/.pnpm/playwright@1.62.1/node_modules/playwright');
// Test-only browser harness. Native test session input arrives on stdin and is never logged.
const input=JSON.parse(fs.readFileSync(0,'utf8'));
if (!input.connectionId) throw Error('Explicit same-company test connection required');
const timeout=setTimeout(()=>process.exit(2),150000);
const reserve=setInterval(()=>{if(Number(fs.readFileSync('/proc/meminfo','utf8').match(/MemAvailable:\s+(\d+)/)[1])*1024<1280*1024**2)process.exit(3);},1000);
let browser, page, stage = 'startup';
try {
 for(const [k,v] of Object.entries({'memory.max':'536870912','memory.swap.max':'0','cpu.max':'100000 100000'}))if(fs.readFileSync('/sys/fs/cgroup/'+k,'utf8').trim()!==v)throw Error('Ineffective '+k);
 browser=await chromium.launch({headless:true,args:['--disable-dev-shm-usage']});
 const context=await browser.newContext({baseURL:'http://localhost:3310',viewport:{width:1280,height:1000}});
 const login=await context.request.post('/api/auth/sign-in/email',{data:input.account,headers:{origin:'http://localhost:3310'}});
 if(!login.ok())throw Error('Native login failed');
 const companyId=input.state.companyId, pluginId=input.state.installed.id;
 const company=(await (await context.request.get('/api/companies')).json()).find(x=>x.id===companyId);
 const created=await context.request.post('/api/companies/'+companyId+'/projects',{data:{name:'Attach design layout proof',status:'planned'},headers:{origin:'http://localhost:3310'}});
 if(!created.ok())throw Error('Create fixture HTTP '+created.status());
 const project=await created.json();
 await context.addInitScript(id=>localStorage.setItem('paperclip.selectedCompanyId',id),companyId);
 page=await context.newPage();page.setDefaultTimeout(30000);
 stage='open-project';
 await page.goto('/'+company.issuePrefix+'/projects/'+project.id);
 await page.getByRole('tab',{name:'Designs',exact:true}).click();
 await page.getByRole('button',{name:'Attach design',exact:true}).click();
 const form=page.getByRole('form',{name:'Attach design',exact:true});
 await form.getByLabel('Connection',{exact:true}).selectOption(input.connectionId);
 await form.getByLabel('Figma link',{exact:true}).fill('https://www.figma.com/design/LayoutProof123/Unverified?node-id=1-2');
 await form.getByLabel('Label',{exact:true}).fill('Unverified layout proof');
 await form.getByLabel('Purpose',{exact:true}).fill('Synthetic UI save/reload check; no Figma retrieval.');
 async function layout() {
  const boxes=await form.locator('select,input,textarea').evaluateAll(xs=>xs.map(x=>({box:x.getBoundingClientRect().toJSON(),border:getComputedStyle(x).borderTopWidth,display:getComputedStyle(x).display})));
  if(boxes.length!==4||boxes.some(x=>x.box.width<150||x.box.height<35||parseFloat(x.border)<1))throw Error('Invisible/small controls');
  for(let i=1;i<boxes.length;i++)if(boxes[i].box.y<boxes[i-1].box.bottom)throw Error('Controls overlap');
  if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth))throw Error('Horizontal overflow');
  return boxes;
 }
 const desktop=await layout();await page.screenshot({path:'/app/attach-desktop.png'});
 await page.setViewportSize({width:390,height:1000});
 const mobile=await layout();await page.screenshot({path:'/app/attach-mobile.png'});
 stage='submit';
 await form.getByRole('button',{name:'Save',exact:true}).click();
 await form.waitFor({state:'detached'});
 stage='reload';
 await page.reload();
 const response=await context.request.post('/api/plugins/'+pluginId+'/data/designs.list',{data:{companyId,params:{projectId:project.id}},headers:{origin:'http://localhost:3310'}});
 const result=await response.json();
 const row=result.data?.body?.attachments?.[0];
 if(result.data?.status!==200||row?.label!=='Unverified layout proof'||row?.connectionId!==input.connectionId)throw Error('Persistence mismatch');
 await page.getByRole('link',{name:/Unverified layout proof/}).waitFor();
 console.log(JSON.stringify({passed:true,projectId:project.id,desktop,mobile,innerStatus:result.data.status,revision:result.data.body.revision,verification:row.verification.state,memoryPeak:fs.readFileSync('/sys/fs/cgroup/memory.peak','utf8').trim(),memoryEvents:fs.readFileSync('/sys/fs/cgroup/memory.events','utf8').trim()}));
} catch(e){if(page)await page.screenshot({path:'/app/attach-desktop.png'}).catch(()=>{});console.log(JSON.stringify({passed:false,error:e.message}));process.exitCode=1;}
finally{clearTimeout(timeout);clearInterval(reserve);await browser?.close();}
