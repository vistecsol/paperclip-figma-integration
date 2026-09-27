import { cpSync, copyFileSync, mkdirSync, symlinkSync, existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { resolve, join } from 'node:path';
import { createHash } from 'node:crypto';
const source = resolve(process.argv[2] ?? '/app');
const scratch = process.env.PAPERCLIP_RUN_SCRATCH_DIR;
if (!scratch) throw new Error('PAPERCLIP_RUN_SCRATCH_DIR required');
const target = join(scratch, process.argv[3] ?? 'host-proof');
if (existsSync(target)) throw new Error('Use a fresh scratch directory; existing proof tree is preserved');
const baseline = JSON.parse(readFileSync('host-prerequisite/baseline.json', 'utf8'));
const policyBaseline = JSON.parse(readFileSync('host-prerequisite/project-policy-baseline.json', 'utf8'));
for (const file of [...JSON.parse(readFileSync('host-prerequisite/inspection-baseline.json', 'utf8')).files, ...JSON.parse(readFileSync('host-prerequisite/catalog-baseline.json', 'utf8')).files, ...baseline.files, ...policyBaseline.files, ...JSON.parse(readFileSync('host-prerequisite/source-baseline.json', 'utf8')).files, ...JSON.parse(readFileSync('host-prerequisite/invocation-baseline.json', 'utf8')).files, ...JSON.parse(readFileSync('host-prerequisite/rpc-baseline.json', 'utf8')).files]) {
  const bytes = readFileSync(join(source, file.path));
  if (createHash('sha256').update(bytes).digest('hex') !== file.sha256) throw new Error(`Host source drift: ${file.path}`);
}
mkdirSync(join(target, 'server'), { recursive: true });
cpSync(join(source, 'server/src'), join(target, 'server/src'), { recursive: true });
for (const file of ['package.json', 'vitest.config.ts', 'tsconfig.json']) copyFileSync(join(source, 'server', file), join(target, 'server', file));
for (const file of ['tsconfig.base.json', 'tsconfig.json']) copyFileSync(join(source, file), join(target, file));
for (const entry of ['node_modules', 'server/node_modules']) symlinkSync(join(source, entry), join(target, entry));
const applied = spawnSync('git', ['-C', target, 'apply', resolve('host-prerequisite/figma-managed-oauth.patch')], { stdio: 'inherit' });
if (applied.status !== 0) throw new Error('Patch application failed');
copyFileSync('test/host-database.test.ts', join(target, 'server/src/__tests__/figma-attachments-database.test.ts'));
copyFileSync('host-prerequisite/server/src/services/figma-project-transaction.ts', join(target, 'server/src/services/figma-project-transaction.ts'));
copyFileSync('test/host-project-transaction.test.ts', join(target, 'server/src/__tests__/figma-project-transaction.test.ts'));
console.log('Prepared isolated host source proof tree at ' + target);

const invocationPatch = spawnSync('git', ['-C', target, 'apply', resolve('host-prerequisite/figma-invocation-scope.patch')], { stdio: 'inherit' });
if (invocationPatch.status !== 0) throw new Error('Invocation patch application failed');
copyFileSync('host-prerequisite/server/src/services/figma-api-authority.ts', join(target, 'server/src/services/figma-api-authority.ts'));
copyFileSync('test/host-api-authority.test.ts', join(target, 'server/src/__tests__/figma-api-authority.test.ts'));
copyFileSync('test/fixtures/figma-authority-worker.cjs', join(target, 'server/src/__tests__/fixtures/figma-authority-worker.cjs'));

mkdirSync(join(target, 'packages/plugins/sdk'), { recursive: true });
for (const entry of readdirSync(join(source, 'packages'))) {
  if (!['plugins', 'adapter-utils', 'shared'].includes(entry)) symlinkSync(join(source, 'packages', entry), join(target, 'packages', entry));
}
for (const entry of readdirSync(join(source, 'packages/plugins'))) {
  if (entry !== 'sdk') symlinkSync(join(source, 'packages/plugins', entry), join(target, 'packages/plugins', entry));
}
cpSync(join(source, 'packages/plugins/sdk/src'), join(target, 'packages/plugins/sdk/src'), { recursive: true });
for (const file of ['package.json', 'tsconfig.json']) copyFileSync(join(source, 'packages/plugins/sdk', file), join(target, 'packages/plugins/sdk', file));
symlinkSync(join(source, 'packages/plugins/sdk/node_modules'), join(target, 'packages/plugins/sdk/node_modules'));
const rpcPatch = spawnSync('git', ['-C', target, 'apply', resolve('host-prerequisite/figma-design-rpc.patch')], { stdio: 'inherit' });
if (rpcPatch.status !== 0) throw new Error('RPC patch application failed');
for (const file of ['figma-design-rpc.ts', 'figma-domain.mjs', 'figma-domain.d.mts']) {
  copyFileSync(join('host-prerequisite/server/src/services', file), join(target, 'server/src/services', file));
}
let config = readFileSync(join(target, 'server/vitest.config.ts'), 'utf8');
config = config.replace('alias: [', `alias: [
      { find: /^@paperclipai\\/plugin-sdk$/, replacement: fileURLToPath(new URL('../packages/plugins/sdk/src/index.ts', import.meta.url)) },`);
writeFileSync(join(target, 'server/vitest.config.ts'), config);

cpSync(join(source, 'packages/adapter-utils'), join(target, 'packages/adapter-utils'), { recursive: true, dereference: false });
const sourcePatch = spawnSync('git', ['-C', target, 'apply', resolve('host-prerequisite/figma-run-sources.patch')], { stdio: 'inherit' });
if (sourcePatch.status !== 0) throw new Error('Source delivery patch application failed');
copyFileSync('host-prerequisite/server/src/services/figma-run-sources.ts', join(target, 'server/src/services/figma-run-sources.ts'));
copyFileSync('test/host-onboarding.test.ts', join(target, 'server/src/__tests__/figma-onboarding.test.ts'));

const inspectionPatch = spawnSync('git', ['-C', target, 'apply', resolve('host-prerequisite/figma-inspection.patch')], { stdio: 'inherit' });
if (inspectionPatch.status !== 0) throw new Error('Inspection patch application failed');
copyFileSync('host-prerequisite/server/src/services/figma-inspection.ts', join(target, 'server/src/services/figma-inspection.ts'));

copyFileSync('test/host-inspection.test.ts', join(target, 'server/src/__tests__/figma-inspection.test.ts'));

cpSync(join(source, 'packages/shared'), join(target, 'packages/shared'), { recursive: true, dereference: false });
mkdirSync(join(target, 'scripts'), { recursive: true });
copyFileSync(join(source, 'scripts/ingest-app-definitions.mjs'), join(target, 'scripts/ingest-app-definitions.mjs'));
const catalogPatch = spawnSync('git', ['-C', target, 'apply', resolve('host-prerequisite/figma-catalog.patch')], { stdio: 'inherit' });
if (catalogPatch.status !== 0) throw new Error('Catalog patch application failed');
copyFileSync('host-prerequisite/figma-app-definition.json', join(target, 'packages/shared/src/app-definitions/figma.json'));
config = readFileSync(join(target, 'server/vitest.config.ts'), 'utf8');
config = config.replace('alias: [', `alias: [
      { find: /^@paperclipai\\/shared$/, replacement: fileURLToPath(new URL('../packages/shared/src/index.ts', import.meta.url)) },`);
writeFileSync(join(target, 'server/vitest.config.ts'), config);
copyFileSync('test/host-connector-setup.test.ts', join(target, 'server/src/__tests__/figma-connector-setup.test.ts'));
