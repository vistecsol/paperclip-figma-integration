import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
const host = process.argv[2] ?? '/app';
const scratch = process.env.PAPERCLIP_RUN_SCRATCH_DIR;
if (!scratch) throw new Error('PAPERCLIP_RUN_SCRATCH_DIR required');
const baseline = JSON.parse(readFileSync('host-prerequisite/invocation-baseline.json', 'utf8'));
const replace = (text, anchor, replacement) => {
  if (text.split(anchor).length !== 2) throw new Error('Missing or ambiguous patch anchor');
  return text.replace(anchor, replacement);
};
let patch = '';
for (const [i, file] of baseline.files.entries()) {
  const original = readFileSync(join(host, file.path), 'utf8');
  if (createHash('sha256').update(original).digest('hex') !== file.sha256) throw new Error(`Source drift: ${file.path}`);
  let updated = original;
  if (file.path.endsWith('/plugin-worker-manager.ts')) {
    updated = 'import { bindFigmaApiAuthority } from "./figma-api-authority.js";\n' + original;
    const anchor = '      const invocation = invocationScope ? registerInvocation(invocationScope) : null;';
    updated = replace(updated, anchor, `${anchor}
      if (invocation && invocationScope && method === "handleApiRequest") {
        bindFigmaApiAuthority(params, invocationScope,
          () => activeInvocations.get(invocation.id)?.scope === invocationScope && status === "running");
      }`);
  } else if (file.path.endsWith('/routes/plugins.ts')) {
    updated = 'import { captureFigmaApiAuthority } from "../services/figma-api-authority.js";\n' + original;
    const anchor = '      const result = await bridgeDeps.workerManager.call(\n        plugin.id,\n        "handleApiRequest",';
    updated = replace(updated, anchor, `      captureFigmaApiAuthority(input, req.actor, companyId, match.params.projectId);
${anchor}`);
  }
  const before = join(scratch, `invocation-before-${i}`), after = join(scratch, `invocation-after-${i}`);
  writeFileSync(before, original); writeFileSync(after, updated);
  const result = spawnSync('diff', ['-u', '--label', `a/${file.path}`, '--label', `b/${file.path}`, before, after], { encoding: 'utf8' });
  if (![0,1].includes(result.status)) throw new Error('Diff failed');
  patch += result.stdout;
}
writeFileSync('host-prerequisite/figma-invocation-scope.patch', patch);
console.log('Generated host-only invocation prerequisite; running host unchanged.');
