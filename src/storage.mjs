import { DesignError, emptyDesigns, requiredId } from './attachments.mjs';

/** Uses only the pinned SDK's query/execute contract, no public-table writes. */
export function designStore(db) {
  if (!/^plugin_[a-z0-9_]+$/.test(db.namespace)) throw new Error('Unsafe plugin namespace');
  const table = `"${db.namespace}".project_designs`;
  const scope = (companyId, projectId) => [requiredId(companyId, 'company'), requiredId(projectId, 'project')];
  return {
    async read(companyId, projectId) {
      const rows = await db.query(`SELECT revision, attachments FROM ${table} WHERE company_id = $1 AND project_id = $2`, scope(companyId, projectId));
      return rows.length ? { revision: Number(rows[0].revision), attachments: rows[0].attachments } : emptyDesigns();
    },
    async compareAndSwap(companyId, projectId, before, after) {
      if (!Number.isSafeInteger(before.revision) || before.revision < 0 || after.revision !== before.revision + 1) throw new DesignError('invalid_revision');
      const values = [...scope(companyId, projectId), after.revision, JSON.stringify(after.attachments)];
      const result = before.revision === 0
        ? await db.execute(`INSERT INTO ${table} (company_id, project_id, revision, attachments) VALUES ($1, $2, $3, $4::jsonb) ON CONFLICT (company_id, project_id) DO NOTHING`, values)
        : await db.execute(`UPDATE ${table} SET revision = $3, attachments = $4::jsonb WHERE company_id = $1 AND project_id = $2 AND revision = $5`, [...values, before.revision]);
      if (result.rowCount !== 1) throw new DesignError('stale_revision', 409);
      return after;
    },
  };
}
