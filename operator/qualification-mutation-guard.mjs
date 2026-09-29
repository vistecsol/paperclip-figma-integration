import fs from 'node:fs';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
const root='/app/qualification-guard';
export async function beforeMutation({dns=false}={}){
 const end=Number(process.env.QUALIFICATION_TEARDOWN_EPOCH)*1000;
 assert.ok(Date.now()<end,'Qualification window expired');
 for(const[k,v]of Object.entries({'memory.max':'1610612736','memory.swap.max':'0','cpu.max':'100000 100000','pids.max':'256'}))assert.equal(fs.readFileSync('/sys/fs/cgroup/'+k,'utf8').trim(),v);
 const nonce=randomUUID();if(dns)fs.writeFileSync(root+'-dns-request',nonce);
 fs.writeFileSync(root+'-request',nonce);
 const deadline=Math.min(end,Date.now()+20000);
 while(Date.now()<deadline){
  try{const x=JSON.parse(fs.readFileSync(root+'-approval','utf8'));
   if(x.nonce===nonce){assert.ok(Date.now()-x.time<3000);return;}
  }catch(e){if(e.code!=='ENOENT'&&!(e instanceof SyntaxError))throw e;}
  await new Promise(r=>setTimeout(r,100));
 }
 throw Error('External ownership/reserve guard did not authorize mutation');
}
