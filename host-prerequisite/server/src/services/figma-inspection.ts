import type { Request } from "express";

/** Retains the managed token only in a host closure, never in worker input. */
export function captureFigmaInspector(req: Request, projectId: string) {
  const actor = structuredClone(req.actor);
  const sessionToken = req.header("x-paperclip-tool-gateway-token")?.trim();
  const gateway = req.app.locals.toolGateway;
  if (actor.type !== "agent" || !actor.agentId || !actor.runId || !actor.companyId
      || !sessionToken || typeof gateway?.executeFigmaInspection !== "function") return undefined;
  return async (reference: { connectionId: string; fileKey: string; nodeId: string | null }) => {
    // The gateway compares the session with this original authenticated actor.
    // It returns only a fixed state, never MCP content or provider diagnostics.
    return gateway.executeFigmaInspection({ sessionToken, companyId: actor.companyId,
      agentId: actor.agentId, runId: actor.runId, projectId, connectionId: reference.connectionId,
      fileKey: reference.fileKey, nodeId: reference.nodeId });
  };
}
