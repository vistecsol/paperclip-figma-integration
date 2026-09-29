import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {spawn,execFileSync} from 'node:child_process';
const read=p=>fs.readFileSync(p,'utf8').trim();
for(const[k,v]of Object.entries({'memory.max':'1476395008','memory.swap.max':'0','cpu.max':'100000 100000','pids.max':'128'}))assert.equal(read('/sys/fs/cgroup/'+k),v);
assert.equal(process.arch,'arm64');
const deadline=Number(process.env.PAIR_TEARDOWN)*1000;
assert.ok(Date.now()+300000<deadline,'Insufficient time');
const capacity=()=>{
 let headroom=Number(read('/proc/meminfo').match(/MemAvailable:\s+(\d+)/)[1])*1024;
 const rel=read('/proc/self/cgroup').split('\n').find(x=>x.startsWith('0::'))?.slice(3);
 assert.ok(rel&&rel!=='/'&&!rel.split('/').includes('..'));
 let p=path.dirname('/sys/fs/cgroup'+rel);
 for(;;){
  if(p!=='/sys/fs/cgroup'||fs.existsSync(p+'/memory.max')){
   const current=Number(read(p+'/memory.current'));
   for(const k of ['memory.max','memory.high']){const limit=read(p+'/'+k);if(/^\d+$/.test(limit))headroom=Math.min(headroom,Math.max(0,Number(limit)-current));}
  }
  if(p==='/sys/fs/cgroup')break;p=path.dirname(p);
 }
 const d=fs.statfsSync('/app');return {headroom,diskFree:d.bavail*d.bsize,peak:read('/sys/fs/cgroup/memory.peak'),events:read('/sys/fs/cgroup/memory.events')};
};
const initial=capacity();console.log(JSON.stringify({initial}));assert.ok(initial.headroom>=2752*1024**2&&initial.diskFree>=2*1024**3);
execFileSync('chown',['-R',`${process.getuid()}:${process.getgid()}`,'/app/integration']);
assert.equal(execFileSync('git',['-C','/app/integration','rev-parse','HEAD'],{encoding:'utf8'}).trim(),process.env.PAIR_REVISION);
const child=spawn('node',['/app/integration/operator/build-version-pair.mjs','/app/integration','/app','/app/version-pair',process.env.PAIR_REVISION],{stdio:'inherit',detached:true});
let stopped=false;const stop=()=>{if(stopped)return;stopped=true;process.kill(-child.pid,'SIGTERM');setTimeout(()=>{try{process.kill(-child.pid,'SIGKILL');}catch{}},5000).unref();};
const timer=setInterval(()=>{try{const c=capacity();if(Date.now()>=deadline||c.headroom<1280*1024**2||c.diskFree<2*1024**3)stop();}catch{stop();}},1000);
child.on('exit',(code,signal)=>{clearInterval(timer);console.log(JSON.stringify({code,signal,stopped,terminal:capacity()}));process.exitCode=stopped?2:code??1;});
