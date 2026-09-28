// UI smoke variation only; not the release build or full-host verification.
// Requires a fresh external host/ancestor preflight and enforced Docker limits.
import fs from 'node:fs';
import v8 from 'node:v8';
import { directIconImports } from './ui-icon-imports.mjs';
const expected = {'memory.max':'1476395008','memory.swap.max':'0','cpu.max':'100000 100000','pids.max':'128'};
for (const [key, value] of Object.entries(expected)) {
  if (fs.readFileSync('/sys/fs/cgroup/'+key, 'utf8').trim() !== value) throw Error('Ineffective '+key);
}
if (process.env.VTS_UI_PREFLIGHT_APPROVED !== '1') throw Error('External measured preflight required');
// V8's total heap also includes young-generation space; it is not the
// --max-old-space-size ceiling. Reject command-line overrides instead.
if (process.env.NODE_OPTIONS !== '--max-old-space-size=896' || process.execArgv.length) throw Error('Unexpected Node heap configuration');
console.log(JSON.stringify({event:'smoke-limits', oldSpaceLimitMiB:896,
  totalV8HeapLimitBytes:v8.getHeapStatistics().heap_size_limit, limits:expected}));
const disk = fs.statfsSync('/app');
if (disk.bavail*disk.bsize < 2*1024**3) throw Error('Disk stop reserve breached');
process.chdir('/app/ui');
// Preserve source plugins, aliases, production transforms and service-worker stamping.
// Disable only output minification and compressed-size reporting for browser smoke.
const { build, mergeConfig } = await import('/app/ui/node_modules/vite/dist/node/index.js');
await build(mergeConfig({configFile:'/app/ui/vite.config.ts', mode:'production'}, {
  plugins:[directIconImports('/app/ui/node_modules/lucide-react')],
  build:{minify:false, reportCompressedSize:false, sourcemap:false},
}));
