// Credential-free DNS-only subprocess. No application graph or HTTP requests.
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {resolve4,lookup,getServers} from 'node:dns/promises';
import {collectDnsReceipt,validateFreshMapping} from './qualification-dns.mjs';
export async function resolveFreshDraft({run,mapping}) {
assert.equal(process.getuid(),1000);
for(const[k,v]of Object.entries({'memory.max':'67108864','memory.swap.max':'0','cpu.max':'25000 100000','pids.max':'32'}))assert.equal(fs.readFileSync('/sys/fs/cgroup/'+k,'utf8').trim(),v);
assert.match(fs.readFileSync('/proc/self/status','utf8'),/^CapEff:\s+0+$/m);
const timeout=setTimeout(()=>process.exit(2),10000);
try{
 const receipt=await collectDnsReceipt({run,guardPath:'/app/server/src/services/remote-http-endpoint-guard.ts',resolve4,lookup,resolvers:getServers()});
 validateFreshMapping(receipt,{mapping,run});
 console.log(JSON.stringify(receipt));
}finally{clearTimeout(timeout);}
}
