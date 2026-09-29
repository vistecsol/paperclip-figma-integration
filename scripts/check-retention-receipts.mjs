import assert from 'node:assert/strict';
import {assertRetention,assertVersionTransition,assertIndependentInstances} from '../operator/retention-receipts.mjs';
const base={pluginId:'plugin',namespace:'ns',companyId:'c',projectId:'p',snapshot:{revision:3,attachments:[{id:'a',url:'https://www.figma.com/design/test',connectionId:'conn',primary:true}]},repositories:[{id:'repo'}],migrationHistory:[1]};
assertRetention(base,structuredClone(base));
for(const key of Object.keys(base)){const altered=structuredClone(base);delete altered[key];assert.throws(()=>assertRetention(base,altered));}
const changed=structuredClone(base);changed.snapshot.attachments[0].connectionId='other';assert.throws(()=>assertRetention(base,changed));
const old={version:'0.1.0-alpha.1',packageSha256:'a'.repeat(64)};
const next={version:'0.1.0-alpha.2',packageSha256:'b'.repeat(64),status:'ready'};
assertVersionTransition(old,next,next);
assert.throws(()=>assertVersionTransition(old,{...old,status:'ready'},old));
assertVersionTransition(next,{...old,status:'ready'},old);
const a={databaseIdentity:'db-a',volumeId:'v-a',networkId:'n-a',instanceId:'i-a',packageSha256:old.packageSha256,developmentCheckoutMounted:false,credentialsCopied:false,productionStorageMounted:false,dockerSocketMounted:false};
const b={...a,databaseIdentity:'db-b',volumeId:'v-b',networkId:'n-b',instanceId:'i-b'};
assertIndependentInstances(a,b);
assert.throws(()=>assertIndependentInstances(a,{...b,volumeId:a.volumeId}));
assert.throws(()=>assertIndependentInstances(a,{...b,credentialsCopied:true}));
console.log('Offline retention receipt rejection checks passed; no lifecycle execution claimed.');
