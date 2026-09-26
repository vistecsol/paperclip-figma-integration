import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
const provenance = JSON.parse(readFileSync('dist/build-provenance.json', 'utf8'));
const hash = path => createHash('sha256').update(readFileSync(path)).digest('hex');
for (const [path, digest] of Object.entries(provenance.sourceInputs)) {
  if (hash(path) !== digest) throw new Error('Build is stale: '+path);
}
for (const [name,digest] of Object.entries(provenance.prerequisitePatches)) {
  if (hash(`host-prerequisite/${name}.patch`) !== digest) throw new Error('Prerequisite build is stale');
}
for (const [path, digest] of Object.entries(provenance.hostServiceInputs ?? {})) {
  if (hash(path) !== digest) throw new Error('Host prerequisite source drift: '+path);
}
for (const [name,digest] of Object.entries(provenance.outputs)) {
  if (hash(`dist/${name}`) !== digest) throw new Error('Built output drift: '+name);
}
console.log('Build hashes match sources, prerequisites and outputs. This is not release qualification.');
