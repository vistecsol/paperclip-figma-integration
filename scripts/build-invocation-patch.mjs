import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
const host = process.argv[2] ?? '/app';
const scratch = process.env.PAPERCLIP_RUN_SCRATCH_DIR;
if (!scratch) throw new Error('PAPERCLIP_RUN_SCRATCH_DIR required');
const baseline = JSON.parse(readFileSync('host-prerequisite/invocation-baseline.json', 'utf8'));
let patch = '';
for (const [i, file] of baseline.files.entries()) {
  const original = readFileSync(join(host, file.path), 'utf8');
  if (createHash('sha256').update(original).digest('hex') !== file.sha256) throw new Error(`Source drift: ${file.path}`);
  let updated;
  if (file.path.endsWith('/protocol.ts')) {
    const anchor = 'export interface PluginInvocationScope {\n  companyId: string;\n}';
    if (!original.includes(anchor)) throw new Error('Scope anchor missing');
    updated = original.replace(anchor, `export interface PluginInvocationScope {
  companyId: string;
  /** Host-derived API identity. Never recover these fields from worker RPC args. */
  apiRequest?: {
    projectId: string | null;
    actor: {
      actorType: "user" | "agent";
      actorId: string;
      agentId: string | null;
      runId: string | null;
    };
  };
}`);
  } else {
    const anchor = '    if (directCompanyId) return { companyId: directCompanyId };';
    if (!original.includes(anchor)) throw new Error('Derivation anchor missing');
    updated = original.replace(anchor, `    if (directCompanyId && method === "handleApiRequest" && isRecord(params.actor)) {
      // params is the host-generated API envelope, not the HTTP request body.
      // Missing identity never falls back to worker-supplied identity later.
      const actor = params.actor;
      const actorId = readNonEmptyString(actor.actorId);
      const agentId = readNonEmptyString(actor.agentId);
      const runId = readNonEmptyString(actor.runId);
      if (actorId && (actor.actorType === "user" ||
          (actor.actorType === "agent" && agentId && runId))) {
        return {
          companyId: directCompanyId,
          apiRequest: {
            projectId: isRecord(params.params) ? readNonEmptyString(params.params.projectId) : null,
            actor: { actorType: actor.actorType, actorId, agentId, runId },
          },
        };
      }
    }
    if (directCompanyId) return { companyId: directCompanyId };`);
  }
  const before = join(scratch, `invocation-before-${i}`), after = join(scratch, `invocation-after-${i}`);
  writeFileSync(before, original); writeFileSync(after, updated);
  const result = spawnSync('diff', ['-u', '--label', `a/${file.path}`, '--label', `b/${file.path}`, before, after], { encoding: 'utf8' });
  if (![0,1].includes(result.status)) throw new Error('Diff failed');
  patch += result.stdout;
}
writeFileSync('host-prerequisite/figma-invocation-scope.patch', patch);
console.log('Generated invocation scope prerequisite; running host unchanged.');
