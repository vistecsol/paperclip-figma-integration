// Test-only DNS receipt. No provider HTTP, OAuth, credentials or guard replacement.
import assert from 'node:assert/strict';
import {isIP} from 'node:net';
export const hostname='mcp.figma.com';
export const guardSha256='5a7b994420e366cfed6548754466b033ce4b47c6c54dff08e2ab8f0dbcc33be4';
export function validateDnsReceipt(r,{run,now=Date.now(),extraHosts}={}) {
 assert.equal(r.version,1);assert.equal(r.hostname,hostname);
 assert.match(run,/^[0-9a-f-]{36}$/);assert.equal(r.run,run);
 assert.equal(r.guardSha256,guardSha256);
 assert.equal(r.method,'node:dns/promises.resolve4(ttl)+lookup; native public guard');
 assert.ok(Array.isArray(r.resolvers)&&r.resolvers.length>0&&r.resolvers.every(x=>typeof x==='string'&&x.length<256));
 assert.ok(Number.isFinite(r.observedAt)&&r.observedAt<=now,'Future DNS receipt');
 assert.ok(Number.isFinite(r.expiresAt)&&now<r.expiresAt&&r.expiresAt<=r.observedAt+300000,'Stale DNS receipt');
 assert.ok(Array.isArray(r.answers)&&r.answers.length>0&&r.answers.length<=32);
 const addresses=r.answers.map(a=>{
  assert.equal(isIP(a.address),4,'IPv4 snapshot required');
  const [x,y,z]=a.address.split('.').map(Number);
  assert.ok(!(x===0||x===10||x===127||x>=224||(x===100&&y>=64&&y<=127)||
   (x===169&&y===254)||(x===172&&y>=16&&y<=31)||(x===192&&(y===168||y===0||y===88))||
   (x===198&&(y===18||y===19||(y===51&&z===100)))||(x===203&&y===0&&z===113)),'Non-public DNS answer');
  assert.ok(Number.isInteger(a.ttl)&&a.ttl>0&&r.expiresAt<=r.observedAt+a.ttl*1000,'TTL exceeded');
  return a.address;
 });
 assert.equal(new Set(addresses).size,addresses.length);
 const hosts=addresses.map(a=>hostname+':'+a).sort();
 if(extraHosts!==undefined)assert.deepEqual([...extraHosts].sort(),hosts,'Exact DNS host mapping required');
 return hosts;
}
export async function collectDnsReceipt({run,guardPath,resolve4,lookup,resolvers,now=Date.now}) {
 const fs=await import('node:fs');const {createHash}=await import('node:crypto');
 const {pathToFileURL}=await import('node:url');
 assert.equal(createHash('sha256').update(fs.readFileSync(guardPath)).digest('hex'),guardSha256,'Pinned guard drift');
 const guard=await import(pathToFileURL(guardPath).href);
 const observedAt=now();
 const answers=await resolve4(hostname,{ttl:true});
 const looked=await lookup(hostname,{all:true,verbatim:true});
 assert.deepEqual([...new Set(looked.filter(x=>x.family===4).map(x=>x.address))].sort(),[...new Set(answers.map(x=>x.address))].sort(),'Resolver disagreement');
 // Validate ALL observed families, not just the selected A records.
 await guard.assertPublicRemoteHttpEndpoint(new URL('https://'+hostname+'/mcp'),{lookup:async()=>[...looked,...answers.map(x=>({address:x.address,family:4}))]},m=>new Error(m));
 const r={version:1,hostname,run,guardSha256,method:'node:dns/promises.resolve4(ttl)+lookup; native public guard',resolvers,observedAt,
  expiresAt:observedAt+Math.min(300,...answers.map(x=>x.ttl))*1000,answers};
 validateDnsReceipt(r,{run,now:now()});return r;
}

// Historical mapping evidence is not current DNS authority. Validate at observation
// only for immutable routing checks; draft requests must use validateFreshMapping.
export function validateMappingEvidence(receipt, options) {
 return validateDnsReceipt(receipt,{...options,now:receipt.observedAt});
}
export function validateFreshMapping(receipt,{mapping,run,now=Date.now()}={}) {
 const hosts=validateDnsReceipt(receipt,{run,now});
 assert.deepEqual(hosts,validateMappingEvidence(mapping,{run}),'DNS changed since immutable host mapping; stop session');
 return hosts;
}
