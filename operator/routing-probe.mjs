// Bootstrap only: built-in modules, no application imports or filesystem writes.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
export function validateProbeEnvironment({uid,status,mountinfo,cgroup,limits}) {
 assert.equal(uid,1000,'Probe must run as node UID 1000');
 assert.match(status,/^CapEff:\s+0+$/m,'Probe capabilities must be dropped');
 assert.match(status,/^NoNewPrivs:\s+1$/m,'Probe requires no-new-privileges');
 assert.ok(cgroup.startsWith('/') && cgroup!=='/' && !cgroup.split('/').includes('..'),'Host cgroup path required');
 for(const [key,value] of Object.entries({'memory.max':'67108864','memory.swap.max':'0','cpu.max':'25000 100000','pids.max':'32'}))
  assert.equal(limits[key],value,'Ineffective probe '+key);
 const mounts=mountinfo.trim().split('\n').map(line=>line.split(' '));
 const root=mounts.find(fields=>fields[4]==='/');
 assert.ok(root?.[5].split(',').includes('ro'),'Probe root filesystem must be read-only');
 assert.ok(!mounts.some(f=>['/app','/paperclip','/var/run/docker.sock','/run/docker.sock'].some(p=>f[4]===p||f[4].startsWith(p+'/'))),'No application/state/socket mounts');
 return true;
}
export async function runProbe() {
 const read=p=>fs.readFileSync(p,'utf8').trim();
 const cgroup=read('/proc/self/cgroup').split('\n').find(l=>l.startsWith('0::'))?.slice(3);
 assert.ok(cgroup?.startsWith('/') && cgroup!=='/' && !cgroup.split('/').includes('..'),'Host cgroup path required');
 const dir=path.join('/sys/fs/cgroup',cgroup);
 validateProbeEnvironment({uid:process.getuid(),status:read('/proc/self/status'),mountinfo:read('/proc/self/mountinfo'),cgroup,
  limits:Object.fromEntries(['memory.max','memory.swap.max','cpu.max','pids.max'].map(k=>[k,read(path.join(dir,k))]))});
 // Never evaluate the pure validator until independent bootstrap checks pass.
 const chunks=[];let bytes=0;
 for await(const chunk of process.stdin){bytes+=chunk.length;assert.ok(bytes<=1024*1024,'Bounded validator input');chunks.push(chunk);}
 const payload=JSON.parse(Buffer.concat(chunks).toString());
 assert.match(payload.records.run,/^[0-9a-f-]{36}$/,'Run UUID required');
 for(const key of ['app','browser','network','volume']){assert.equal(payload.records[key].length,1,'One exact inspect record');payload.records[key]=payload.records[key][0];}
 const {validateRouting}=await import('data:text/javascript;base64,'+payload.source);
 const routing=validateRouting(payload.records);
 const {validateDnsReceipt}=await import('data:text/javascript;base64,'+payload.dnsSource);
 validateDnsReceipt(payload.dnsReceipt,{run:payload.records.run,extraHosts:payload.records.app.HostConfig.ExtraHosts??[]});
 console.log(JSON.stringify({probeEnvironmentVerified:true,dnsReceiptVerified:true,...routing}));
}
