import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
const host = process.argv[2] ?? '/app';
const path = 'server/src/routes/tool-access.ts';
const original = readFileSync(join(host, path), 'utf8');
const baseline = JSON.parse(readFileSync('host-prerequisite/board-baseline.json', 'utf8')).files.find(f => f.path === path);
if (!baseline || createHash('sha256').update(original).digest('hex') !== baseline.sha256) throw new Error('Board policy source drift');
const start = original.indexOf('  async function assertBoardAnyToolPermission(');
const end = original.indexOf('  function sendToolGatewayError(', start);
if (start < 0 || end < start) throw new Error('Board policy anchors missing');
const helpers = original.slice(start, end);
writeFileSync('host-prerequisite/server/src/services/board-tool-test-policy.ts', `// Extracted unchanged from pinned native tool-access route. Shared by both paths.
import type { Request } from "express";
import { agents, type Db } from "@paperclipai/db";
import { and, eq } from "drizzle-orm";
import { isAgentStatusAssignableToWork, type PermissionKey } from "@paperclipai/shared";
import { assertBoard, assertCompanyAccess } from "../routes/authz.js";
import { forbidden } from "../errors.js";
import { accessService } from "./access.js";
export function boardToolTestPolicy(db: Db) {
  const access = accessService(db);
${helpers}
  return { assertBoardAnyToolPermission, assertCanTestAsAgent };
}
`);
const updated = 'import { boardToolTestPolicy } from "../services/board-tool-test-policy.js";\n' + original.slice(0, start) + '  const { assertBoardAnyToolPermission, assertCanTestAsAgent } = boardToolTestPolicy(db);\n\n' + original.slice(end);
const scratch = process.env.PAPERCLIP_RUN_SCRATCH_DIR;
if (!scratch) throw new Error('Run scratch required');
const before = join(scratch, 'board-before'), after = join(scratch, 'board-after');
writeFileSync(before, original); writeFileSync(after, updated);
const result = spawnSync('diff', ['-u', '--label', `a/${path}`, '--label', `b/${path}`, before, after], { encoding: 'utf8' });
if (![0, 1].includes(result.status)) throw new Error('diff failed');
writeFileSync('host-prerequisite/figma-board-policy.patch', result.stdout.replace(/^ $/gm, ''));
