import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { join, resolve } from 'node:path';
const host = resolve(process.argv[2] ?? '/app');
const scratch = process.env.PAPERCLIP_RUN_SCRATCH_DIR;
if (!scratch) throw new Error('PAPERCLIP_RUN_SCRATCH_DIR required');
const baseline = JSON.parse(readFileSync('host-prerequisite/baseline.json', 'utf8'));
const changes = [];
for (const file of baseline.files) {
  const original = readFileSync(join(host, file.path), 'utf8');
  if (createHash('sha256').update(original).digest('hex') !== file.sha256) throw new Error(`Host source drift: ${file.path}`);
  let updated = original;
  if (file.path.endsWith('/services/tool-access.ts')) {
    updated = 'import { figmaDcrCompatibility } from "./figma-oauth-compatibility.js";\n' + updated;
    const before = `    const tokenEndpointAuthMethod = selectOAuthDcrTokenEndpointAuthMethod(\n      input.endpoints.tokenEndpointAuthMethodsSupported,\n    );\n\n    const host = new URL(input.redirectUri).host;\n    const requestedMetadata = {\n      client_name: \`Paperclip (\${host})\`,`;
    const after = `    const compatibility = figmaDcrCompatibility({\n      ...input.endpoints,\n      serverUrl: asRecord(input.connection.config).url,\n    });\n    if (\n      compatibility &&\n      !input.endpoints.tokenEndpointAuthMethodsSupported?.includes(\n        compatibility.tokenEndpointAuthMethod,\n      )\n    ) {\n      throw unprocessable("Figma no longer advertises the required client authentication method", {\n        code: "oauth_figma_client_auth_unsupported",\n      });\n    }\n    const tokenEndpointAuthMethod = compatibility?.tokenEndpointAuthMethod ??\n      selectOAuthDcrTokenEndpointAuthMethod(\n        input.endpoints.tokenEndpointAuthMethodsSupported,\n      );\n\n    const host = new URL(input.redirectUri).host;\n    const requestedMetadata = {\n      client_name: compatibility?.clientName ?? \`Paperclip (\${host})\`,`;
    if (!updated.includes(before)) throw new Error('Registration anchor missing');
    updated = updated.replace(before, after);
  } else {
    const addition = readFileSync('host-prerequisite/managed-service-test.inc', 'utf8');
    const anchor = '  it("preserves the provider\'s DCR client-auth ordering for Miro token exchange", async () => {';
    if (!updated.includes(anchor)) throw new Error('Test anchor missing');
    updated = updated.replace(anchor, addition + '\n' + anchor);
  }
  changes.push({ path: file.path, original, updated });
}
for (const path of ['server/src/services/figma-oauth-compatibility.ts', 'server/src/__tests__/figma-oauth-compatibility.test.ts']) changes.push({path, original: '', updated: readFileSync(join('host-prerequisite', path), 'utf8')});
mkdirSync(scratch, {recursive:true});
let patch = '';
for (const [index, file] of changes.entries()) {
  const oldPath = join(scratch, `figma-before-${index}`), newPath = join(scratch, `figma-after-${index}`);
  writeFileSync(oldPath, file.original); writeFileSync(newPath, file.updated);
  const result = spawnSync('diff', ['-u', '--suppress-blank-empty', '--label', file.original ? `a/${file.path}` : '/dev/null', '--label', `b/${file.path}`, oldPath, newPath], {encoding:'utf8'});
  if (![0, 1].includes(result.status)) throw new Error('diff failed');
  patch += result.stdout;
}
writeFileSync('host-prerequisite/figma-managed-oauth.patch', patch);
console.log('Generated review patch; no host files modified.');
