// Input is an ephemeral synthetic native login only; never print it or cookies.
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {origin} from './qualification-routing.mjs';
const {chromium}=createRequire('/app/package.json')('/app/node_modules/.pnpm/playwright@1.62.1/node_modules/playwright');
const input=JSON.parse(fs.readFileSync(0,'utf8'));
const end=Number(process.env.QUALIFICATION_TEARDOWN_EPOCH)*1000;
assert.ok(Number.isFinite(end)&&Date.now()<end,'Missing/expired coordinated teardown');
let browser,stage='start';
const timer=setTimeout(()=>process.exit(2),Math.min(120000,end-Date.now()));
try {
 for(const[k,v]of Object.entries({'memory.max':'805306368','memory.swap.max':'0','cpu.max':'100000 100000','pids.max':'256'}))assert.equal(fs.readFileSync('/sys/fs/cgroup/'+k,'utf8').trim(),v);
 browser=await chromium.launch({headless:true,args:['--disable-dev-shm-usage']});
 const ctx=await browser.newContext({baseURL:origin,serviceWorkers:'allow'});
 stage='anonymous';
 const anonymous=await ctx.request.get('/api/companies',{timeout:20000});
 assert.equal(anonymous.status(),403);
 stage='sign-in';
 const login=await ctx.request.post('/api/auth/sign-in/email',{data:input.account,headers:{origin},timeout:20000});assert.ok(login.ok());
 const companies=await (await ctx.request.get('/api/companies',{timeout:20000})).json();
 assert.ok(companies.some(x=>x.id===input.state.companyId));
 await ctx.addInitScript(id=>localStorage.setItem('paperclip.selectedCompanyId',id),input.state.companyId);
 const page=await ctx.newPage();page.setDefaultTimeout(25000);
 stage='navigate';
 await page.goto('/'+input.state.issuePrefix+'/projects/'+input.state.projectId,{waitUntil:'load'});
 await page.getByRole('tab',{name:'Designs',exact:true}).click();
 await page.getByRole('button',{name:'Attach design',exact:true}).waitFor();
 stage='reload';await page.reload({waitUntil:'load'});
 await page.getByRole('tab',{name:'Designs',exact:true}).click();
 await page.getByRole('button',{name:'Attach design',exact:true}).waitFor();
 const response=await ctx.request.post('/api/plugins/'+input.state.installed.id+'/data/designs.list',{data:{companyId:input.state.companyId,params:{projectId:input.state.projectId}},headers:{origin},timeout:20000});
 const data=await response.json();assert.equal(data.data?.status,200);
 assert.deepEqual(data.data.body,input.snapshot.snapshot);
 console.log(JSON.stringify({passed:true,origin,anonymousStatus:403,authenticatedCompany:true,reload:true,innerStatus:200,revision:data.data.body.revision,serviceWorkers:'allow',providerCalls:0}));
}catch(e){console.log(JSON.stringify({passed:false,stage,error:e.name}));process.exitCode=1;}
finally{clearTimeout(timer);await browser?.close();}
