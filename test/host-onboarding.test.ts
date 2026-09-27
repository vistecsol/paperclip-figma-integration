import express from 'express';
import request from 'supertest';
import { eq } from 'drizzle-orm';
import { readPaperclipSkillSyncPreference, writePaperclipSkillSyncPreference } from '@paperclipai/adapter-utils/server-utils';
import { agentRoutes } from '../routes/agents.js';
import { errorHandler } from '../middleware/index.js';
import { readFileSync, readdirSync } from 'node:fs';
import { ensureCodexSkillsInjected } from '../../../packages/adapters/codex-local/src/server/execute.js';
import { resolveCodexDesiredSkillNames } from '../../../packages/adapters/codex-local/src/server/skills.js';
import { createHash } from 'node:crypto';
import { join } from 'node:path';
import { beforeAll, afterAll, expect, it } from 'vitest';
import { createDb, companies, agents } from '@paperclipai/db';
import { companySkillService } from '../services/company-skills.js';
import { resolvePaperclipInstanceRoot } from '../home-paths.js';
import { startEmbeddedPostgresTestDatabase } from './helpers/embedded-postgres.js';
const root = process.env.FIGMA_INTEGRATION_ROOT!;
const scratch = process.env.PAPERCLIP_RUN_SCRATCH_DIR!;
const pin = JSON.parse(readFileSync(join(root, 'docs/official-skill-pin.json'), 'utf8'));
let database: Awaited<ReturnType<typeof startEmbeddedPostgresTestDatabase>>;
let db: ReturnType<typeof createDb>;
beforeAll(async () => {
  if (!scratch || !resolvePaperclipInstanceRoot().startsWith(scratch + '/')) throw new Error('Isolated instance root required');
  database = await startEmbeddedPostgresTestDatabase('figma-onboarding-');
  db = createDb(database.connectionString);
});
afterAll(async () => { await database?.cleanup(); });
it('native importer pins official bytes and reuses the same row; remote audit is explicitly unsupported', async () => {
  const [company] = await db.insert(companies).values({ name: 'Synthetic onboarding fixture', issuePrefix: 'FON' }).returning();
  const service = companySkillService(db);
  const existing = await service.createLocalSkill(company.id, { name: 'Preserved fixture', slug: 'preserved-fixture', markdown: '# Preserve this fixture skill\n' });
  const before = await service.listFull(company.id);
  const first = await service.importFromSource(company.id, pin.importSource);
  expect(first.imported).toHaveLength(1);
  const skill = first.imported[0];
  expect(skill.sourceRef).toBe(pin.commit);
  expect(skill.sourceType).toBe('github');
  const content = await service.readFile(company.id, skill.id, 'SKILL.md');
  expect(createHash('sha256').update(content!.content).digest('hex')).toBe(pin.sha256);
  const repeated = await service.importFromSource(company.id, pin.importSource);
  expect(repeated.imported.map(row => row.id)).toEqual([skill.id]);
  const after = await service.listFull(company.id);
  expect(before.every(row => after.some(saved => saved.id === row.id && saved.markdown === row.markdown))).toBe(true);
  await expect(service.auditSkill(company.id, skill.id)).rejects.toThrow('Only local-path and catalog-managed');
  // Use the native HTTP assignment route; the process adapter has no external
  // runtime to mutate. Audit remains rejected above and is never forged.
  const app = express();
  app.use(express.json());
  app.use((req, _res, next) => { (req as any).actor = { type: 'board', source: 'local_implicit', userId: 'isolated-board', companyIds: [company.id] }; next(); });
  app.use('/api', agentRoutes(db));
  app.use(errorHandler);
  const existingKey = existing.key;
  for (const name of ['Existing eligible fixture', 'Future eligible fixture']) {
    const [agent] = await db.insert(agents).values({ companyId: company.id, name, role: 'engineer', adapterType: 'process',
      adapterConfig: writePaperclipSkillSyncPreference({}, [{ key: existingKey, versionId: null }]) }).returning();
    for (let replay = 0; replay < 2; replay++) {
      const response = await request(app).post(`/api/agents/${agent.id}/skills/sync`).send({ mode: 'add', desiredSkills: [skill.key] });
      expect(response.status, JSON.stringify(response.body)).toBe(200);
      const [saved] = await db.select().from(agents).where(eq(agents.id, agent.id));
      const keys = readPaperclipSkillSyncPreference(saved.adapterConfig).desiredSkills;
      expect(keys).toContain(existingKey);
      expect(keys.filter(key => key === skill.key)).toHaveLength(1);
      // Exercise native materialization into separate employee run directories,
      // not shared CODEX_HOME and not an external model invocation.
      const entries = await service.listRuntimeSkillEntries(company.id);
      const selected = entries.find(entry => entry.key === skill.key)!;
      expect(selected.sourceStatus).not.toBe('missing');
      const skillsHome = join(scratch, 'adapter-skills', agent.id);
      const errors: string[] = [];
      await ensureCodexSkillsInjected(async (stream, text) => { if (stream === 'stderr') errors.push(text); }, {
        skillsHome, skillsEntries: entries,
        desiredSkillNames: resolveCodexDesiredSkillNames(saved.adapterConfig, entries),
      });
      expect(errors).toEqual([]);
      expect(createHash('sha256').update(readFileSync(join(skillsHome, selected.runtimeName, 'SKILL.md'))).digest('hex')).toBe(pin.sha256);
      expect(readdirSync(skillsHome)).toContain(entries.find(entry => entry.key === existingKey)!.runtimeName);
    }
  }
  const foreign = await db.insert(companies).values({ name: 'Synthetic boundary fixture', issuePrefix: 'FOB' }).returning();
  expect(await service.getById(foreign[0].id, skill.id)).toBeNull();
}, 60000);
