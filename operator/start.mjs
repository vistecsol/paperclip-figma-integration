// Runs only in an explicitly launched test image, after the native privilege drop.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { randomBytes } from 'node:crypto';
const dir = '/paperclip/instances/default/test-bootstrap';
mkdirSync(dir, { recursive: true, mode: 0o700 });
for (const name of ['BETTER_AUTH_SECRET', 'PAPERCLIP_TOOL_ACTION_SIGNING_SECRET']) {
  const path = `${dir}/${name}`;
  try { writeFileSync(path, randomBytes(32).toString('hex'), { flag: 'wx', mode: 0o600 }); }
  catch (error) { if (error.code !== 'EEXIST') throw error; }
  const value = readFileSync(path, 'utf8').trim();
  if (!/^[a-f0-9]{64}$/.test(value)) throw new Error('Invalid test bootstrap secret file');
  process.env[name] = value;
}
process.chdir('/app');
process.execve(process.execPath, [process.execPath, '--import', './server/node_modules/tsx/dist/loader.mjs', 'server/dist/index.js'], process.env);
