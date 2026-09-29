import fs from 'node:fs';
import assert from 'node:assert/strict';
import {beforeMutation} from './qualification-mutation-guard.mjs';
import {qualifyLifecycle} from './qualification-lifecycle.mjs';
const root='/paperclip/instances/default/test-bootstrap/';
const read=n=>JSON.parse(fs.readFileSync(root+'qualification-'+n+'.json','utf8'));
let cookie='';
async function request(path,body,method=body===undefined?'GET':'POST'){
 const r=await fetch('http://127.0.0.1:3310'+path,{method,signal:AbortSignal.timeout(15000),headers:{origin:'http://localhost:3310',host:'localhost:3310','content-type':'application/json',cookie},...(body===undefined?{}:{body:JSON.stringify(body)})});
 if(r.headers.getSetCookie().length)cookie=r.headers.getSetCookie().map(x=>x.split(';')[0]).join('; ');
 return {status:r.status,body:await r.json()};
}
try{
 await beforeMutation();assert.equal((await request('/api/auth/sign-in/email',read('account'))).status,200);
 console.log(JSON.stringify(await qualifyLifecycle({request,state:read('state'),baseline:read('snapshot'),phase:'disable-enable',beforeMutation})));
}catch(e){console.log(JSON.stringify({passed:false,error:e.message}));process.exitCode=1;}
