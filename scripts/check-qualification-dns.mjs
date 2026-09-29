import assert from 'node:assert/strict';
import {collectDnsReceipt,validateDnsReceipt,hostname} from '../operator/qualification-dns.mjs';
const run='11111111-1111-1111-1111-111111111111',now=1000000;
const args={run,guardPath:process.argv[2],now:()=>now,resolvers:['synthetic-resolver'],
 resolve4:async(h,o)=>{assert.equal(h,hostname);assert.equal(o.ttl,true);return [{address:'8.8.8.8',ttl:60}];},
 lookup:async()=>[{address:'8.8.8.8',family:4}]};
const r=await collectDnsReceipt(args);
assert.deepEqual(validateDnsReceipt(r,{run,now,extraHosts:['mcp.figma.com:8.8.8.8']}),['mcp.figma.com:8.8.8.8']);
for(const [key,value] of [['run','22222222-2222-2222-2222-222222222222'],['hostname','evil.invalid'],['guardSha256','changed'],['observedAt',now+1],['expiresAt',now+300001]]){
 assert.throws(()=>validateDnsReceipt({...r,[key]:value},{run,now}));
}
assert.throws(()=>validateDnsReceipt(r,{run,now:now+60000}));
assert.throws(()=>validateDnsReceipt(r,{run,now,extraHosts:['mcp.figma.com:127.0.0.1']}));
for(const address of ['127.0.0.1','169.254.169.254','192.168.0.1','::1']){
 await assert.rejects(()=>collectDnsReceipt({...args,resolve4:async()=>[{address,ttl:60}],lookup:async()=>[{address,family:address.includes(':')?6:4}]}));
}
await assert.rejects(()=>collectDnsReceipt({...args,lookup:async()=>[{address:'1.1.1.1',family:4}]}));
await assert.rejects(()=>collectDnsReceipt({...args,lookup:async()=>[{address:'8.8.8.8',family:4},{address:'::1',family:6}]}));
await assert.rejects(()=>collectDnsReceipt({...args,resolve4:async()=>[{address:'8.8.8.8',ttl:0}]}));
console.log('Synthetic DNS provenance/TTL/mapping checks and actual pinned native guard denials passed; no DNS/network call.');
