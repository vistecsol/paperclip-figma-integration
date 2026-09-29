import assert from 'node:assert/strict';
import {validateRouting,origin} from '../operator/qualification-routing.mjs';
const labels={'vts.figma.issue':'VIS-6','vts.figma.run':'proof'};
const host={Memory:1536*1024**2,MemorySwap:1536*1024**2,NanoCpus:1e9,PidsLimit:256,Privileged:false};
const valid={run:'proof',app:{Id:'app-exact',Name:'/vts-figma-test-app',Config:{Labels:labels},State:{Running:true},HostConfig:host,NetworkSettings:{Networks:{'vts-figma-test-net':{NetworkID:'net-exact'}}},Mounts:[{Type:'volume',Name:'vts-figma-test-state',Destination:'/paperclip'}]},network:{Id:'net-exact',Name:'vts-figma-test-net',Internal:true,Labels:labels},volume:{Name:'vts-figma-test-state',Labels:labels},browser:{Id:'browser-exact',Name:'/vts-figma-test-browser',Config:{Labels:labels},State:{Running:true},HostConfig:{...host,Memory:768*1024**2,MemorySwap:768*1024**2,NetworkMode:'container:app-exact'},Mounts:[]}};
assert.equal(validateRouting(valid).origin,origin);
for(const mutate of [
 x=>x.app.Name='/paperclip-production',
 x=>x.volume.Labels['vts.figma.run']='other',
 x=>x.network.Internal=false,
 x=>x.app.NetworkSettings.Networks.external={NetworkID:'external'},
 x=>x.browser.HostConfig.NetworkMode='host',
 x=>x.browser.Mounts.push({Type:'bind',Source:'/var/run/docker.sock'}),
 x=>x.app.HostConfig.MemorySwap=-1,
 x=>x.browser.HostConfig.Memory=512*1024**2,
 x=>x.app.State.Running=false,
]){const x=structuredClone(valid);mutate(x);assert.throws(()=>validateRouting(x));}
console.log('Routing contract: exact test ownership, internal-only network, namespace binding, storage boundary and cap denials passed. No Docker/browser execution.');
