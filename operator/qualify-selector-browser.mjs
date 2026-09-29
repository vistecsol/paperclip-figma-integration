import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {createSelectorContext,observeSelector,assertSelectorIntent,captureRenderedIdentity} from './qualification-selector.mjs';
import {assertDraftPair,selectorOrders,connectionRows} from './selector-fixtures.mjs';
const {chromium}=createRequire('/app/package.json')('/app/node_modules/.pnpm/playwright@1.62.1/node_modules/playwright');
const input=JSON.parse(fs.readFileSync(0,'utf8')),origin='http://localhost:3310';
const end=Number(process.env.QUALIFICATION_TEARDOWN_EPOCH)*1000;
assert.ok(Date.now()<end);
const timer=setTimeout(()=>process.exit(2),Math.min(180000,end-Date.now()));
let browser,stage='start';const results=[];
try{
 browser=await chromium.launch({headless:true,args:['--disable-dev-shm-usage']});
 assert.deepEqual(input.state.selectorCases.map(x=>x.order),selectorOrders);
 // Authenticate once, then reuse only this synthetic user's in-memory state in
 // isolated browser contexts. Six sign-ins test the auth limiter, not selection.
 stage='authenticate';
 const authContext=await createSelectorContext(browser,{baseURL:origin});
 const login=await authContext.request.post('/api/auth/sign-in/email',{data:input.account,headers:{origin},timeout:15000});
 assert.equal(login.status(),200,'Native synthetic authentication failed');
 const storageState=await authContext.storageState();
 await authContext.close();
 for(const fixture of input.state.selectorCases)for(const mode of ['new','resume','reconnect']){
  stage=fixture.order+':'+mode;
  const ctx=await createSelectorContext(browser,{baseURL:origin,storageState});
  const path='/api/companies/'+fixture.companyId+'/tools/connections';
  const baselineResponse=await ctx.request.get(path);assert.equal(baselineResponse.status(),200);
  const baseline=connectionRows(await baselineResponse.json());
  const orderReceipt=assertDraftPair(baseline,fixture);
  const chosen=baseline.find(x=>x.id===fixture.connectionId);assert.ok(chosen);assert.equal(chosen.name,'Qualification shared draft');assert.equal(chosen.credentialPolicy,'shared');
  assert.ok(baseline.some(x=>x.id===fixture.foreignConnectionId));
  await ctx.addInitScript(id=>localStorage.setItem('paperclip.selectedCompanyId',id),fixture.companyId);
  const observer=await observeSelector(ctx,origin,fixture.companyId);
  const page=await ctx.newPage();page.setDefaultTimeout(15000);
  await page.goto('/'+fixture.issuePrefix+'/apps/connect?source=figma&'+(mode==='new'?'new=1':mode+'='+fixture.connectionId),{waitUntil:'domcontentloaded'});
  await page.getByRole('button',{name:/^Continue$|^Continue to Figma$|^Finish with Figma$/}).first().waitFor({state:'visible'});
  const rendered=await captureRenderedIdentity(page,{mode,names:{shared:chosen.name,foreign:baseline.find(x=>x.id===fixture.foreignConnectionId).name}});
  if(!observer.events.some(x=>x.kind==='mutation-blocked')){
   const button=page.getByRole('button',{name:/^Continue$|^Continue to Figma$|^Finish with Figma$/}).first();
   await button.click();
   await page.waitForTimeout(500);
  }
  const receipt=assertSelectorIntent(observer.events,{companyId:fixture.companyId,mode,connectionId:fixture.connectionId});
  const afterResponse=await ctx.request.get(path);assert.equal(afterResponse.status(),200);
  const after=connectionRows(await afterResponse.json());assert.deepEqual(after,baseline);
  results.push({...receipt,rendered,unchangedDrafts:true,ordering:orderReceipt,chosen:{id:chosen.id,name:chosen.name,credentialPolicy:chosen.credentialPolicy}});
  await observer.close();await ctx.close();
 }
 console.log(JSON.stringify({passed:true,results,bothNativeOrderings:true,providerCalls:0}));
}catch(e){console.log(JSON.stringify({passed:false,stage,error:e.message,results}));process.exitCode=1;}
finally{clearTimeout(timer);await browser?.close();}
