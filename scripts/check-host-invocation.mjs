import { spawnSync } from 'node:child_process';
import { join, resolve } from 'node:path';
const host = resolve(process.argv[2] ?? '/app');
const scratch = process.env.PAPERCLIP_RUN_SCRATCH_DIR;
if (!scratch) throw new Error('PAPERCLIP_RUN_SCRATCH_DIR required');
for (const [command, args] of [
  [process.execPath, ['scripts/prepare-host-proof.mjs', host, 'invocation-proof']],
  [join(host, 'node_modules/.bin/vitest'), ['run', '--root', join(scratch, 'invocation-proof/server'),
    'src/__tests__/figma-api-authority.test.ts']],
]) {
  const result = spawnSync(command, args, { stdio: 'inherit', env: { ...process.env, FIGMA_INTEGRATION_ROOT: process.cwd() } });
  if (result.status !== 0) process.exit(result.status ?? 1);
}
console.log('Real worker process authority lifecycle verified. Live managed access remains unproven.');
