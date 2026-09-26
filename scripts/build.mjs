import { createRequire } from 'node:module';
import { readFileSync, mkdirSync, writeFileSync, readdirSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { createHash } from 'node:crypto';
const host = process.argv[2];
if (!host) throw new Error('Pass the isolated prepared host root; see prepare-host-proof.mjs');
const root = resolve(host);
const require = createRequire(join(root, 'package.json'));
const esbuild = require('esbuild');
if (esbuild.version !== '0.28.2') throw new Error('Build requires pinned esbuild 0.28.2');
const sdk = join(root, 'packages/plugins/sdk/src/index.ts');
const protocol = readFileSync(join(root, 'packages/plugins/sdk/src/protocol.ts'), 'utf8');
if (!protocol.includes('"projectDesigns.execute"')) throw new Error('Patched SDK prerequisite unavailable');
mkdirSync('dist', { recursive: true });
await esbuild.build({ entryPoints: ['scripts/host-domain-entry.mjs'],
  outfile: 'host-prerequisite/server/src/services/figma-domain.mjs',
  bundle: true, platform: 'node', format: 'esm', target: 'node24' });
const workerBuild = await esbuild.build({ entryPoints: ['src/entry.mjs'], outfile: 'dist/worker.mjs',
  bundle: true, platform: 'node', format: 'esm', target: 'node24', legalComments: 'eof', minifyWhitespace: true, metafile: true,
  alias: { '@paperclipai/plugin-sdk': sdk }, sourcemap: false });
await esbuild.build({ entryPoints: ['src/manifest.mjs'], outfile: 'dist/manifest.mjs',
  bundle: true, platform: 'node', format: 'esm', target: 'node24', sourcemap: false });
await esbuild.build({ entryPoints: ['src/ui.jsx'], outfile: 'dist/ui/index.js', bundle: true,
  platform: 'browser', format: 'esm', target: 'es2022', external: ['react', '@paperclipai/plugin-sdk/ui'], sourcemap: false });
const hash = path => createHash('sha256').update(readFileSync(path)).digest('hex');
writeFileSync('dist/build-provenance.json', JSON.stringify({
  hostCommit: 'd554c4789ed3930f8a53ac9fdf6503b3187097da', hostVersion: '2026.916.1',
  esbuildVersion: esbuild.version,
  sourceInputs: Object.fromEntries(readdirSync('src').filter(name => /\.(mjs|jsx)$/.test(name)).map(name => [`src/${name}`, hash(`src/${name}`)])),
  prerequisitePatches: Object.fromEntries(['figma-managed-oauth', 'figma-invocation-scope', 'figma-design-rpc', 'figma-run-sources', 'figma-inspection'].map(name => [name, hash(`host-prerequisite/${name}.patch`)])),
  outputs: Object.fromEntries(['worker.mjs', 'manifest.mjs', 'ui/index.js'].map(name => [name, hash(`dist/${name}`)])),
  hostServiceInputs: Object.fromEntries(readdirSync('host-prerequisite/server/src/services').map(name => {
    const path = `host-prerequisite/server/src/services/${name}`;
    return [path, hash(path)];
  })),
  qualification: 'engineering-preview-not-release-ready',
}, null, 2) + '\n');
writeFileSync('dist/bundle-inputs.json', JSON.stringify(Object.keys(workerBuild.metafile.inputs).map(path => resolve(path).replaceAll(root, '<prepared-host>').replaceAll('/app', '<host>').replaceAll(process.cwd(), '<integration>')), null, 2) + '\n');
console.log('Built bundled worker and native manifest against explicit prepared host. No installation or publication.');
