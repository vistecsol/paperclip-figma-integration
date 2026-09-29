import assert from 'node:assert/strict';
import {validateProbeEnvironment} from '../operator/routing-probe.mjs';
const valid={uid:1000,status:'CapEff:\t0000000000000000\nNoNewPrivs:\t1',mountinfo:'1 0 0:1 / / ro,relatime - overlay overlay ro',cgroup:'/test/probe',limits:{'memory.max':'67108864','memory.swap.max':'0','cpu.max':'25000 100000','pids.max':'32'}};
assert.equal(validateProbeEnvironment(valid),true);
for(const mutate of [
 x=>x.uid=0,x=>x.status=x.status.replace('0000000000000000','0000000000000001'),
 x=>x.status=x.status.replace('NoNewPrivs:\t1','NoNewPrivs:\t0'),
 x=>x.cgroup='/',x=>x.cgroup='/../escape',
 x=>x.limits['memory.max']='max',x=>x.limits['memory.swap.max']='max',
 x=>x.limits['cpu.max']='max 100000',x=>x.limits['pids.max']='max',
 x=>x.mountinfo=x.mountinfo.replace('ro,relatime','rw,relatime'),
 x=>x.mountinfo+='\n2 1 0:2 / /paperclip rw - ext4 /dev/test rw',
]){const x=structuredClone(valid);mutate(x);assert.throws(()=>validateProbeEnvironment(x));}
console.log('Probe effective-cap, UID/capability and read-only filesystem boundaries passed; no Docker execution.');
