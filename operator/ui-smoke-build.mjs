// UI smoke variation only; not the release build or full-host verification.
// Requires a fresh external host/ancestor preflight and enforced Docker limits.
import fs from 'node:fs';
import { build, mergeConfig } from '/app/ui/node_modules/vite/dist/node/index.js';
const expected = {'memory.max':'2147483648','memory.swap.max':'0','cpu.max':'100000 100000','pids.max':'128'};
for (const [key, value] of Object.entries(expected)) {
  if (fs.readFileSync('/sys/fs/cgroup/'+key, 'utf8').trim() !== value) throw Error('Ineffective '+key);
}
if (process.env.VTS_UI_PREFLIGHT_APPROVED !== '1') throw Error('External measured preflight required');
const disk = fs.statfsSync('/app');
if (disk.bavail*disk.bsize < 2*1024**3) throw Error('Disk stop reserve breached');
process.chdir('/app/ui');
// Preserve source plugins, aliases, production transforms and service-worker stamping.
// Disable only output minification and compressed-size reporting for browser smoke.
await build(mergeConfig({configFile:'/app/ui/vite.config.ts', mode:'production'}, {
  build:{minify:false, reportCompressedSize:false, sourcemap:false},
}));
