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
const {cpSync,existsSync}=await import('node:fs');
if(existsSync('/app/figma-slot/current'))throw Error('Expected fresh package directory');
cpSync('/app/release-0.1.0-lifecycle.1','/app/figma-slot/current',{recursive:true});
const expected={'memory.max':'1610612736','memory.swap.max':'0','cpu.max':'100000 100000','pids.max':'256'};
for(const [k,v] of Object.entries(expected)) if(readFileSync('/sys/fs/cgroup/'+k,'utf8').trim()!==v) throw Error('Ineffective '+k);

process.execve(process.execPath, [process.execPath, '--import', '/app/access-window-guard.mjs', '--import', './server/node_modules/tsx/dist/loader.mjs', 'server/src/index.ts'], process.env);
