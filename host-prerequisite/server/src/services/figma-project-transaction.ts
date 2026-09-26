import type { Request } from "express";
import { and, eq } from "drizzle-orm";
import { projects, type Db } from "@paperclipai/db";
import { forbidden } from "../errors.js";
import { accessService } from "./access.js";
import { projectToolContext } from "./project-tool-context.js";

/** Host-only input. Capture the original authenticated req.actor; the reduced
 * PluginScopedApiRequest actor cannot recover source/key scope/membership.
 * Never construct this context from worker RPC parameters.
 */
export type FigmaProjectAuthority = {
  actor: Request["actor"];
  companyId: string;
  projectId: string;
};

/** All attachment storage in work must use tx. Run cancellation/session locks
 * acquired by projectToolContext then cover the attachment commit as well.
 * This does not claim grant-locking or protected MCP runtime authorization.
 */
export async function withFigmaProjectTransaction<T>(
  db: Db,
  authority: FigmaProjectAuthority,
  write: boolean,
  work: (tx: Db) => Promise<T>,
): Promise<T> {
  // Snapshot before the first await, including nested membership/key scopes.
  const { actor, companyId, projectId } = structuredClone(authority);
  if (!companyId || !projectId || !["board", "agent"].includes(actor.type)) {
    throw forbidden("Design project authority is unavailable");
  }
  return db.transaction(async (transaction) => {
    const tx = transaction as unknown as Db;
    if (actor.type === "agent") {
      const context = await projectToolContext(tx, actor, write);
      if (context.issue.companyId !== companyId || context.issue.projectId !== projectId) {
        throw forbidden("Design project differs from the authenticated run task");
      }
    }
    const [project] = await tx.select({ id: projects.id }).from(projects)
      .where(and(eq(projects.id, projectId), eq(projects.companyId, companyId)));
    if (!project) throw forbidden("Design project is unavailable");
    const decision = await accessService(tx).decide({
      actor,
      action: "project:read",
      resource: { type: "project", companyId, projectId },
    });
    if (!decision.allowed) throw forbidden("Design project access denied");
    // Paperclip's project route uses this project visibility boundary; agent
    // mutations additionally require current task/run and writable work mode.
    return work(tx);
  });
}
