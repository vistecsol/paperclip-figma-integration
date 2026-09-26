import { and, eq } from "drizzle-orm";
import { plugins, pluginCompanySettings, toolConnections, type Db } from "@paperclipai/db";
import type { WorkerHostCallContext, PluginApiResponse } from "@paperclipai/plugin-sdk";
import { forbidden } from "../errors.js";
import { resolveFigmaApiAuthority } from "./figma-api-authority.js";
import { withFigmaProjectTransaction } from "./figma-project-transaction.js";
import { pluginDatabaseService, derivePluginDatabaseNamespace } from "./plugin-database.js";
import { designApi, designStore, hostDesignOperations, DesignError } from "./figma-domain.mjs";

/** Host-owned implementation; never imports a plugin's executable code in process.
 * RPC accepts no SQL, actor, operation or connection selector. The original route
 * and body were captured before crossing the worker process boundary.
 */
export async function executeFigmaDesignRequest(
  db: Db, pluginId: string, context?: WorkerHostCallContext,
): Promise<PluginApiResponse> {
  try {
    const { authority, request, assertActive } = resolveFigmaApiAuthority(context);
    const operations = hostDesignOperations({ withProject: (_ignored: unknown, write: boolean, work: (scope: unknown) => Promise<unknown>) =>
      withFigmaProjectTransaction(db, authority, write, async tx => {
        assertActive();
        const [plugin] = await tx.select().from(plugins).where(eq(plugins.id, pluginId)).for("update");
        if (!plugin || plugin.pluginKey !== "vistecsol.figma" || !["installed", "ready"].includes(plugin.status)) {
          throw forbidden("Design plugin unavailable");
        }
        // The parent plugin row lock also excludes a concurrent settings insert
        // through its FK; existing settings updates are locked below.
        const [settings] = await tx.select().from(pluginCompanySettings).where(and(
          eq(pluginCompanySettings.pluginId, pluginId), eq(pluginCompanySettings.companyId, authority.companyId),
        )).for("update");
        if (settings?.enabled === false) throw forbidden("Design plugin unavailable");
        const database = pluginDatabaseService(tx);
        const store = designStore({ namespace: derivePluginDatabaseNamespace(plugin.pluginKey, plugin.manifestJson.database?.namespaceSlug),
          query: (sql: string, params: unknown[]) => database.query(pluginId, sql, params),
          execute: (sql: string, params: unknown[]) => database.execute(pluginId, sql, params),
        });
        const result = await work({ companyId: authority.companyId, projectId: authority.projectId, store,
          authorizeConnection: async (connectionId: string) => {
            // Association validation only: never asserts a grant or performs MCP.
            const [connection] = await tx.select({ id: toolConnections.id, transport: toolConnections.transport,
              authKind: toolConnections.authKind, endpoint: toolConnections.config, credentialRefs: toolConnections.credentialRefs,
            }).from(toolConnections).where(and(eq(toolConnections.id, connectionId),
              eq(toolConnections.companyId, authority.companyId))).for("share");
            if (!connection || connection.transport !== "mcp_remote" || connection.authKind !== "oauth"
                || (connection.endpoint.url ?? connection.endpoint.endpoint ?? connection.endpoint.remoteUrl) !== "https://mcp.figma.com/mcp"
                || connection.credentialRefs.some(ref => ref.placement === "url")) throw forbidden("Design connection unavailable");
          },
        });
        assertActive(); // timeout/crash while awaiting SQL must roll back
        return result;
      }).catch((error: unknown) => {
        if (error instanceof DesignError) throw error;
        const status = (error as { status?: number })?.status;
        throw new DesignError(status === 403 ? "design_access_denied" : "design_operation_failed", status === 403 ? 403 : 500);
      }) });
    return await designApi({ ...operations,
      verify: async () => ({ error: "managed_inspection_unavailable" }),
    })(request).then((response: PluginApiResponse) => request.routeKey === "designs.verify"
      ? { status: 501, body: { error: "managed_inspection_unavailable" } } : response);
  } catch {
    // Do not send/log underlying database/provider diagnostics through worker RPC.
    return { status: 403, body: { error: "design_access_denied" } };
  }
}
