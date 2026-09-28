// Offline preparation only: no install, compiler, image build or running-host access.
import { readFileSync, writeFileSync, mkdirSync, readdirSync, copyFileSync, existsSync } from 'node:fs';
import { resolve, join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const [archiveArg, candidateArg, expectedHash, targetArg] = process.argv.slice(2);
if (!archiveArg || !candidateArg || !/^[a-f0-9]{64}$/.test(expectedHash ?? '') || !targetArg)
  throw new Error('Usage: node operator/prepare-context.mjs SOURCE.tar.gz CANDIDATE.tgz EXPECTED_SHA256 NEW_CONTEXT');
const target = resolve(targetArg);
if (existsSync(target)) throw new Error('Context must not exist; existing state is never replaced');
const hash = path => createHash('sha256').update(readFileSync(path)).digest('hex');
const pin = JSON.parse(readFileSync(join(root, 'operator/source-pin.json')));
if (hash(archiveArg) !== pin.archiveSha256) throw new Error('Pinned host archive digest mismatch');
if (hash(candidateArg) !== expectedHash) throw new Error('Candidate digest mismatch');
const run = (cmd, args) => {
  const result = spawnSync(cmd, args, { encoding: 'utf8' });
  if (result.status !== 0) throw new Error(`${cmd} failed: ${result.stderr}`);
  return result.stdout;
};
// Both inputs are digest-verified release inputs. Refuse traversal names as well.
for (const input of [archiveArg, candidateArg]) {
  const paths = run('tar', ['-tzf', resolve(input)]).trim().split('\n');
  if (paths.some(path => path.startsWith('/') || path.split('/').includes('..')))
    throw new Error('Unsafe archive path');
}
mkdirSync(target, { recursive: true });
run('tar', ['-xzf', resolve(archiveArg), '--strip-components=1', '-C', target]);
for (const name of readdirSync(join(root, 'host-prerequisite')).filter(name => name.endsWith('baseline.json'))) {
  for (const entry of JSON.parse(readFileSync(join(root, 'host-prerequisite', name))).files) {
    if (hash(join(target, entry.path)) !== entry.sha256) throw new Error(`Source drift: ${entry.path}`);
  }
}
const patches = ['figma-managed-oauth', 'figma-invocation-scope', 'figma-design-rpc', 'figma-run-sources', 'figma-inspection', 'figma-catalog', 'figma-board-policy', 'figma-project-ui'];
for (const name of patches) run('git', ['-C', target, 'apply', join(root, 'host-prerequisite', `${name}.patch`)]);
for (const name of readdirSync(join(root, 'host-prerequisite/server/src/services'))) {
  copyFileSync(join(root, 'host-prerequisite/server/src/services', name), join(target, 'server/src/services', name));
}
for (const name of readdirSync(join(root, 'host-prerequisite/ui/src/components'))) {
  copyFileSync(join(root, 'host-prerequisite/ui/src/components', name), join(target, 'ui/src/components', name));
}
copyFileSync(join(root, 'host-prerequisite/figma-app-definition.json'), join(target, 'packages/shared/src/app-definitions/figma.json'));
mkdirSync(join(target, 'figma-candidate'));
run('tar', ['-xzf', resolve(candidateArg), '-C', join(target, 'figma-candidate')]);
const packed = join(target, 'figma-candidate/package');
// Require the tarball to carry the exact reviewed prerequisites used for the host.
for (const name of patches) {
  const path = `host-prerequisite/${name}.patch`;
  if (hash(join(packed, path)) !== hash(join(root, path))) throw new Error(`Candidate prerequisite mismatch: ${path}`);
}
for (const name of readdirSync(join(root, 'host-prerequisite/server/src/services'))) {
  const path = `host-prerequisite/server/src/services/${name}`;
  if (hash(join(packed, path)) !== hash(join(root, path))) throw new Error(`Candidate service mismatch: ${path}`);
}
for (const name of readdirSync(join(root, 'host-prerequisite/ui/src/components'))) {
  const path = `host-prerequisite/ui/src/components/${name}`;
  if (hash(join(packed, path)) !== hash(join(root, path))) throw new Error(`Candidate UI mismatch: ${path}`);
}
for (const path of ['host-prerequisite/figma-app-definition.json', 'operator/start.mjs']) {
  if (hash(join(packed, path)) !== hash(join(root, path))) throw new Error(`Candidate asset mismatch: ${path}`);
}
const provenance = JSON.parse(readFileSync(join(packed, 'dist/build-provenance.json')));
if (provenance.hostCommit !== pin.hostCommit) throw new Error('Candidate host mismatch');
for (const [name, digest] of Object.entries(provenance.outputs)) {
  if (hash(join(packed, 'dist', name)) !== digest) throw new Error(`Candidate output mismatch: ${name}`);
}
mkdirSync(join(target, 'figma-operator'));
copyFileSync(join(root, 'operator/start.mjs'), join(target, 'figma-operator/start.mjs'));
writeFileSync(join(target, 'Dockerfile.figma-test'), readFileSync(join(target, 'Dockerfile'), 'utf8') + readFileSync(join(root, 'operator/Dockerfile.append'), 'utf8'));
writeFileSync(join(target, 'figma-context.json'), JSON.stringify({ ...pin, packageSha256: expectedHash,
  qualification: 'prepared-only-not-built-or-launched',
  patches: Object.fromEntries(patches.map(name => [name, hash(join(root, 'host-prerequisite', `${name}.patch`))])) }, null, 2) + '\n');
console.log('Prepared isolated complete source context; no build or launch performed.');
