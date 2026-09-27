import { eq } from "drizzle-orm";
import { toolConnections, type Db } from "@paperclipai/db";
import { boardToolTestPolicy } from "./board-tool-test-policy.js";
import { forbidden } from "../errors.js";
import type { Request } from "express";

/** Retains the managed token only in a host closure, never in worker input. */
export function captureFigmaInspector(req: Request, projectId: string, db?: Db, selectedAgentId?: unknown) {
  const actor = structuredClone(req.actor);
  if (actor.type === "board" && db && typeof selectedAgentId === "string" && selectedAgentId.length > 0) {
    const agentId = selectedAgentId;
    const boardRequest = { actor } as Request;
    const gateway = req.app.locals.toolGateway;
    if (typeof gateway?.executeTestCall !== "function") return undefined;
    return async (reference: { connectionId: string; fileKey: string; nodeId: string | null }) => {
      const [connection] = await db.select().from(toolConnections).where(eq(toolConnections.id, reference.connectionId));
      if (!connection || connection.transport !== "mcp_remote" || connection.authKind !== "oauth"
          || (connection.config.url ?? connection.config.endpoint ?? connection.config.remoteUrl) !== "https://mcp.figma.com/mcp"
          || connection.credentialRefs.some(ref => ref.placement === "url")
          || !/^[a-zA-Z0-9]{1,256}$/.test(reference.fileKey)
          || (reference.nodeId !== null && !/^\d+:\d+$/.test(reference.nodeId))) throw forbidden("Design connection unavailable");
      const policy = boardToolTestPolicy(db);
      await policy.assertBoardAnyToolPermission(boardRequest, connection.companyId, ["tools:use", "tools:manage_connections"]);
      await policy.assertCanTestAsAgent(boardRequest, connection.companyId, agentId);
      const summary = await gateway.summarizeConnectionAccessForAgent({ companyId: connection.companyId, connectionId: connection.id, agentId });
      const tool = summary.tools.find((item: { toolName: string; risk: string; decision: string }) => item.toolName === "get_metadata" && item.risk === "read");
      if (!tool || tool.decision === "off") return { state: "access_denied" };
      // Ask-first stays in native Apps, where its approval/result lifecycle is visible.
      // Do not create an approval that this compact verification response cannot expose.
      if (tool.decision !== "allowed") return { state: "transient_error" };
      try {
        const outcome = await gateway.executeTestCall({ companyId: connection.companyId, connectionId: connection.id,
          agentId, userId: actor.userId ?? "board", toolName: "get_metadata",
          parameters: { fileKey: reference.fileKey, nodeId: reference.nodeId ?? "0:1" } });
        const result = outcome.result;
        return { state: outcome.decision === "allowed" && !outcome.error && result && !result.error
          && result.data?.isError === false && Array.isArray(result.data.content) && result.data.content.length > 0
          ? "accessible" : "transient_error" };
      } catch { return { state: "transient_error" }; }
    };
  }
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
