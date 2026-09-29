// Run only inside the ownership-verified isolated host via its native tsx loader.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { createDb, agents } from '@paperclipai/db';
import { eq } from 'drizzle-orm';
import { companySkillService } from './src/services/company-skills.js';
import { loadConfig } from './src/config.js';
import { ensureCodexSkillsInjected } from '../packages/adapters/codex-local/src/server/execute.js';
import { resolveCodexDesiredSkillNames } from '../packages/adapters/codex-local/src/server/skills.js';
const companyId = 'e36aa1e8-e20b-469e-a661-a2ff66d77536';
const agentId = 'ed1c19c4-97fe-4aa3-8888-fb425683386a';
const key = 'figma/mcp-server-guide/figma-design-to-code';
const expectedHash = 'a6e852421e4db72260b2ca641929b1f84684e5b067aead081e35111f5b5feee4';
const digest = (value: string | Buffer) => createHash('sha256').update(value).digest('hex');
export async function verifyRetainedSkillMaterialization(run: string, replay = false) {
assert.match(run ?? '', /^[a-f0-9-]{36}$/);
assert.equal(process.env.FIGMA_PROOF_ISOLATED, 'VIS-6');
assert.equal(fs.readFileSync('/sys/fs/cgroup/memory.max', 'utf8').trim(), '1610612736');
const config = loadConfig();
assert.equal(config.databaseUrl, undefined, 'Only retained embedded test database is allowed');
assert.ok(config.embeddedPostgresDataDir.startsWith('/paperclip/instances/default/'));
const pid = fs.readFileSync(path.join(config.embeddedPostgresDataDir, 'postmaster.pid'), 'utf8').split('\n');
assert.equal(path.resolve(pid[1]), path.resolve(config.embeddedPostgresDataDir));
assert.match(pid[3], /^\d+$/);
// Native embedded test database defaults; no production connection is accepted.
const db = createDb(`postgres://paperclip:paperclip@127.0.0.1:${pid[3]}/paperclip`);
const [agent] = await db.select().from(agents).where(eq(agents.id, agentId));
assert.equal(agent.companyId, companyId);
assert.equal(agent.status, 'idle');
assert.equal(agent.adapterType, 'codex_local');
const service = companySkillService(db);
console.log(JSON.stringify({stage:'native_materialization_begin',agentId,companyId,replay}));
const library = await service.listFull(companyId);
const skill = library.find(row => row.id === '0743f2f3-c0ef-4c35-aa3e-c9cee1b3ec1b');
assert.equal(skill?.key, key);
assert.equal(skill?.sourceType, 'github');
assert.equal(skill?.sourceRef, '38308b7bbc676a9e9d57795ad4793fa9682d1644');
assert.equal(digest((await service.readFile(companyId, skill!.id, 'SKILL.md'))!.content), expectedHash);
const home = `/paperclip/instances/default/test-bootstrap/materialization-${run}/${agentId}`;
const receipt = home + '.receipt.json';
if (!replay) assert.ok(!fs.existsSync(home), 'Fresh employee directory required');
const entries = await service.listRuntimeSkillEntries(companyId);
const desired = resolveCodexDesiredSkillNames(agent.adapterConfig, entries);
assert.ok(desired.includes(key));
assert.equal(desired.filter(value => value === key).length, 1);
const selected = entries.filter(entry => desired.includes(entry.key));
assert.equal(selected.filter(entry => entry.key.startsWith('paperclip')).length, 5);
for (const entry of selected) assert.notEqual(entry.sourceStatus, 'missing', `Missing desired entry: ${entry.key}`);
const errors: string[] = [];
await ensureCodexSkillsInjected(async (stream, text) => { if (stream === 'stderr') errors.push(text); }, {
  skillsHome: home, skillsEntries: entries, desiredSkillNames: desired,
});
assert.deepEqual(errors, []);
const hashes = selected.map(entry => ({key:entry.key, hash:digest(fs.readFileSync(path.join(home,entry.runtimeName,'SKILL.md')))}));
assert.equal(hashes.find(row => row.key === key)?.hash, expectedHash);
const after = await service.listFull(companyId);
const libraryReceipt = (rows: typeof library) => rows.map(row => ({id:row.id,hash:digest(row.markdown ?? ''),updatedAt:String(row.updatedAt)})).sort((a,b)=>a.id.localeCompare(b.id));
assert.deepEqual(libraryReceipt(after), libraryReceipt(library));
const result = {desired,hashes,library:libraryReceipt(after)};
if (replay) assert.deepEqual(result, JSON.parse(fs.readFileSync(receipt,'utf8')));
else fs.writeFileSync(receipt,JSON.stringify(result),{mode:0o600,flag:'wx'});
console.log(JSON.stringify({stage:replay?'materialization_replay':'materialization',agentId,companyId,hashes,priorLibraryRowsPreserved:library.length,replay,nativeAudit:'unpassed',freshModelVisibility:'unproven'}));
return { agentId, companyId, hashes, replay };
}
