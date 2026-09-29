// Pure credential-free input bootstrap; no filesystem writes or application graph.
import fs from 'node:fs';
import assert from 'node:assert/strict';
const input=JSON.parse(fs.readFileSync(0,'utf8'));
assert.match(input.run,/^[0-9a-f-]{36}$/);
assert.equal(input.mapping.run,input.run);
const source=Buffer.from(input.source,'base64').toString('utf8');
const anchor="'./qualification-dns.mjs'";
assert.equal(source.split(anchor).length,2,'Exactly one reviewed DNS module import required');
const bundled=source.replace(anchor,JSON.stringify('data:text/javascript;base64,'+input.library));
const {resolveFreshDraft}=await import('data:text/javascript;base64,'+Buffer.from(bundled).toString('base64'));
await resolveFreshDraft({run:input.run,mapping:input.mapping});
