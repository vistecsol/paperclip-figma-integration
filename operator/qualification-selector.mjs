// Captures real installed-browser intent without executing OAuth/setup mutations.
// Attach only AFTER native sign-in; context-wide routing also covers popup requests.
import assert from 'node:assert/strict';
export async function observeSelector(context,origin,companyId) {
 assert.equal(context.serviceWorkers().length,0,'Use a fresh serviceWorkers:block diagnostic context');
 const events=[];
 const handler=async route=>{
  const request=route.request(),url=new URL(request.url());
  if(url.origin!==origin){events.push({kind:'external-blocked'});return route.abort('blockedbyclient');}
  const method=request.method(),path=url.pathname;
  if(/\/(preflight|discover|test-call|verify)(\/|$)/.test(path)){events.push({kind:'provider-prerequisite-blocked',path});return route.abort('blockedbyclient');}
  if(!['GET','HEAD'].includes(method)){
   const body=request.postDataJSON()??{};
   events.push({kind:'mutation-blocked',path,method,
    galleryKey:body.galleryKey??null,resumeConnectionId:body.resumeConnectionId??null,
    reconnectConnectionId:body.reconnectConnectionId??null});
   return route.abort('blockedbyclient');
  }
  return route.continue();
 };
 const response=async r=>{
  const u=new URL(r.url());
  if(u.origin===origin&&u.pathname==='/api/companies/'+companyId+'/tools/connections'
    &&r.request().method()==='GET'){
   events.push({kind:'connections-read',status:r.status()});
  }
 };
 await context.route('**/*',handler);context.on('response',response);
 return {events,close:async()=>{context.off('response',response);await context.unroute('**/*',handler);}};
}
export function assertSelectorIntent(events,{companyId,mode,connectionId}) {
 assert.ok(['new','resume','reconnect'].includes(mode));
 assert.equal(events.filter(x=>x.kind==='provider-prerequisite-blocked').length,0,'Native provider prerequisite encountered; defer instead of fabricating success');
 assert.ok(events.some(x=>x.kind==='connections-read'&&x.status===200),'Native refetch was not observed');
 assert.equal(events.filter(x=>x.kind==='external-blocked').length,0,'Unexpected provider navigation');
 const writes=events.filter(x=>x.kind==='mutation-blocked');
 assert.equal(writes.length,1,'Require one explicit, intercepted intent');
 const e=writes[0];
 if(e.path==='/api/companies/'+companyId+'/tools/apps/connect'){
  assert.equal(e.method,'POST');assert.equal(e.galleryKey,'figma');
  assert.equal(e.resumeConnectionId,mode==='resume'?connectionId:null);
  assert.equal(e.reconnectConnectionId,mode==='reconnect'?connectionId:null);
 } else {
  assert.notEqual(mode,'new','New setup silently reused a connection');
  assert.equal(e.method,'POST');
  assert.equal(e.path,'/api/tools/oauth/'+connectionId+'/start');
 }
 return {mode,intentOnly:true,intercepted:true,persistedMutation:false,providerCalls:0};
}

export async function createSelectorContext(browser,options={}) {
 return browser.newContext({...options,serviceWorkers:'block'});
}
