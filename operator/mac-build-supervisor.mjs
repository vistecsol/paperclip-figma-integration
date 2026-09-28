import fs from 'node:fs';
import {spawn} from 'node:child_process';
import {createHash} from 'node:crypto';
const read=p=>fs.readFileSync(p,'utf8').trim();
for(const [k,v] of Object.entries({'memory.max':'1476395008','memory.swap.max':'0','cpu.max':'100000 100000','pids.max':'128'}))
 if(read('/sys/fs/cgroup/'+k)!==v) throw Error('Ineffective limit '+k);
if(process.arch!=='arm64') throw Error('Architecture mismatch');
if(createHash('sha256').update(fs.readFileSync('/app/pnpm-lock.yaml')).digest('hex')!=='af3b879fea127a608b0f9279627f357638299441bbf41835f0b91ab0162e441c') throw Error('Dependency lock mismatch');
const sample=()=> {
 const available=Number(read('/proc/meminfo').match(/MemAvailable:\s+(\d+)/)[1])*1024;
 const d=fs.statfsSync('/app');
 return {available,diskFree:d.bavail*d.bsize,peak:read('/sys/fs/cgroup/memory.peak'),events:read('/sys/fs/cgroup/memory.events')};
};
const initial=sample();
console.log(JSON.stringify({event:'initial',...initial}));
if(initial.available<2752*1024**2 || initial.diskFree<2*1024**3) throw Error('Admission failed');
const child=spawn('/bin/bash',['-ec',`
node /app/node_modules/typescript/bin/tsc -p /app/packages/plugins/sdk/tsconfig.json --singleThreaded
cd /app/integration
node scripts/build.mjs /app
# Normal prepack hooks are retained.
npm pack --pack-destination /app/integration
mv vistecsol-paperclip-figma-integration-0.1.0-alpha.1.tgz candidate.tgz
node operator/ui-smoke-build.mjs
`],{stdio:'inherit',detached:true});
let stopped=false;
const stop=reason=>{ if(stopped)return; stopped=true;console.error(reason);process.kill(-child.pid,'SIGTERM');setTimeout(()=>{try{process.kill(-child.pid,'SIGKILL');}catch{}},5000).unref();};
const interval=setInterval(()=>{const s=sample(); if(s.available<1280*1024**2||s.diskFree<2*1024**3)stop('Reserve breached');},1000);
const timeout=setTimeout(()=>stop('20 minute bound expired'),20*60*1000);
child.on('exit',(code,signal)=>{clearInterval(interval);clearTimeout(timeout);console.log(JSON.stringify({event:'terminal',code,signal,...sample()}));process.exitCode=stopped?2:code??1;});
