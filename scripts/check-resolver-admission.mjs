import assert from 'node:assert/strict';
import {assertResolverAdmission} from '../operator/resolver-admission.mjs';
const now=10000,s={completeAncestorEvidence:true,time:new Date(now).toISOString(),effectiveHeadroomBytes:1344*1024**2,diskFreeBytes:2*1024**3};
assertResolverAdmission(s,now);
for(const delta of [{effectiveHeadroomBytes:s.effectiveHeadroomBytes-1},{diskFreeBytes:s.diskFreeBytes-1},{completeAncestorEvidence:false},{time:new Date(now-6000).toISOString()},{time:new Date(now+1).toISOString()},{effectiveHeadroomBytes:NaN}])
 assert.throws(()=>assertResolverAdmission({...s,...delta},now));
console.log('Exact 1344 MiB and 2 GiB floors pass; one-byte-short, incomplete, stale/future and invalid evidence refuse.');
