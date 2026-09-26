import { cpSync, copyFileSync, mkdirSync, symlinkSync, existsSync, readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { resolve, join } from 'node:path';
import { createHash } from 'node:crypto';
const source = resolve(process.argv[2] ?? '/app');
const scratch = process.env.PAPERCLIP_RUN_SCRATCH_DIR;
if (!scratch) throw new Error('PAPERCLIP_RUN_SCRATCH_DIR required');
const target = join(scratch, 'host-proof');
if (existsSync(target)) throw new Error('Use a fresh scratch directory; existing proof tree is preserved');
const baseline = JSON.parse(readFileSync('host-prerequisite/baseline.json', 'utf8'));
const policyBaseline = JSON.parse(readFileSync('host-prerequisite/project-policy-baseline.json', 'utf8'));
for (const file of [...baseline.files, ...policyBaseline.files]) {
  const bytes = readFileSync(join(source, file.path));
  if (createHash('sha256').update(bytes).digest('hex') !== file.sha256) throw new Error(`Host source drift: ${file.path}`);
}
mkdirSync(join(target, 'server'), { recursive: true });
cpSync(join(source, 'server/src'), join(target, 'server/src'), { recursive: true });
for (const file of ['package.json', 'vitest.config.ts', 'tsconfig.json']) copyFileSync(join(source, 'server', file), join(target, 'server', file));
copyFileSync(join(source, 'tsconfig.base.json'), join(target, 'tsconfig.base.json'));
for (const entry of ['node_modules', 'packages', 'server/node_modules']) symlinkSync(join(source, entry), join(target, entry));
const applied = spawnSync('git', ['-C', target, 'apply', resolve('host-prerequisite/figma-managed-oauth.patch')], { stdio: 'inherit' });
if (applied.status !== 0) throw new Error('Patch application failed');
copyFileSync('test/host-database.test.ts', join(target, 'server/src/__tests__/figma-attachments-database.test.ts'));
copyFileSync('host-prerequisite/server/src/services/figma-project-transaction.ts', join(target, 'server/src/services/figma-project-transaction.ts'));
copyFileSync('test/host-project-transaction.test.ts', join(target, 'server/src/__tests__/figma-project-transaction.test.ts'));
console.log('Prepared isolated host source proof tree at ' + target);
