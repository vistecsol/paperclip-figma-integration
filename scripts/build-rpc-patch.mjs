import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
const host = process.argv[2] ?? '/app';
const scratch = process.env.PAPERCLIP_RUN_SCRATCH_DIR;
if (!scratch) throw new Error('PAPERCLIP_RUN_SCRATCH_DIR required');
const edits = {
  'packages/plugins/sdk/src/protocol.ts': [['  // Restricted plugin database namespace', `  /** Executes only the original host-captured project Designs API request. */
  "projectDesigns.execute": [params: Record<string, never>, result: PluginApiResponse];

  // Restricted plugin database namespace`]],
  'packages/plugins/sdk/src/host-client-factory.ts': [
    ['export interface HostServices {', `export interface HostServices {
  projectDesigns?: {
    execute(context?: WorkerHostCallContext): Promise<WorkerToHostMethods["projectDesigns.execute"][1]>;
  };`],
    ['  // Config — always allowed', '  "projectDesigns.execute": "api.routes.register",\n\n  // Config — always allowed'],
    ['    // State\n', `    "projectDesigns.execute": gated("projectDesigns.execute", async (_params, context) => {
      if (!services.projectDesigns) throw new Error("Project Designs host prerequisite unavailable");
      return services.projectDesigns.execute(context);
    }),

    // State\n`]],
  'packages/plugins/sdk/src/types.ts': [['  db: PluginDatabaseClient;', `  db: PluginDatabaseClient;

  /** Optional until the host project Designs prerequisite is installed. */
  projectDesigns?: { execute(): Promise<{ status?: number; headers?: Record<string, string>; body?: unknown }> };`]],
  'packages/plugins/sdk/src/worker-rpc-host.ts': [['      db: {', '      projectDesigns: { execute: () => callHost("projectDesigns.execute", {}) },\n\n      db: {']],
  'server/src/services/plugin-host-services.ts': [
    ['export function buildHostServices(', 'export function buildHostServices('],
    ['  const registry = pluginRegistryService(db);', '  const registry = pluginRegistryService(db);'],
  ],
};
// Host registration is deliberately restricted to the reviewed Figma plugin key.
const hostServicePath = 'server/src/services/plugin-host-services.ts';
const hostOriginal = readFileSync(join(host, hostServicePath), 'utf8');
const retIndex = hostOriginal.indexOf('  return {', hostOriginal.indexOf('export function buildHostServices('));
// Find actual outer return via its known config member rather than nested helpers.
const match = hostOriginal.match(/  return \{\n    config: \{/);
if (!match) throw new Error('Host services return anchor missing');
edits[hostServicePath] = [[match[0], `  return {
    ...(pluginKey === "vistecsol.figma" ? {
      projectDesigns: { execute: (context?: WorkerHostCallContext) => executeFigmaDesignRequest(db, pluginId, context) },
    } : {}),
    config: {`]];
edits[hostServicePath].push(
  ['        return pluginDb.query(pluginId, params.sql, params.params);',
   '        if (pluginKey === "vistecsol.figma") throw new Error("Design storage requires the scoped host operation");\n        return pluginDb.query(pluginId, params.sql, params.params);'],
  ['        return pluginDb.execute(pluginId, params.sql, params.params);',
   '        if (pluginKey === "vistecsol.figma") throw new Error("Design storage requires the scoped host operation");\n        return pluginDb.execute(pluginId, params.sql, params.params);'],
);
const baselinePath='host-prerequisite/rpc-baseline.json';
const baseline=JSON.parse(readFileSync(baselinePath,'utf8'));
let patch='';
for (const [i, [path, replacements]] of Object.entries(edits).entries()) {
  const original=readFileSync(join(host,path),'utf8');
  if (createHash('sha256').update(original).digest('hex') !== baseline.files.find(f=>f.path===path)?.sha256) throw new Error('Source drift: '+path);
  let updated=original;
  for (const [anchor,replacement] of replacements) {
    if(updated.split(anchor).length!==2) throw new Error('Ambiguous anchor: '+path+' '+anchor);
    updated=updated.replace(anchor,replacement);
  }
  if(path===hostServicePath) updated='import { executeFigmaDesignRequest } from "./figma-design-rpc.js";\n'+updated;
  const before=join(scratch,`rpc-before-${i}`),after=join(scratch,`rpc-after-${i}`);
  writeFileSync(before,original);writeFileSync(after,updated);
  const result=spawnSync('diff',['-u','--label',`a/${path}`,'--label',`b/${path}`,before,after],{encoding:'utf8'});
  if(![0,1].includes(result.status)) throw new Error('Diff failed');
  patch+=result.stdout;
}
writeFileSync('host-prerequisite/figma-design-rpc.patch',patch);
console.log('Generated fixed-operation SDK/host RPC prerequisite.');
