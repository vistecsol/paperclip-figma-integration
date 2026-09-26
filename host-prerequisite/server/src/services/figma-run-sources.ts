import { and, eq } from "drizzle-orm";
import { plugins, pluginCompanySettings, type Db } from "@paperclipai/db";
import { withFigmaProjectTransaction } from "./figma-project-transaction.js";
import { pluginDatabaseService, derivePluginDatabaseNamespace } from "./plugin-database.js";
import { designStore, hostDesignOperations, designDiscovery } from "./figma-domain.mjs";

/** Called only by the host dispatcher with committed run/agent/task IDs.
 * Wake-supplied project IDs, plugin callbacks and credentials are never inputs.
 * Metadata does not grant MCP access. Collection fails closed without blocking
 * ordinary project runs if the plugin is absent, disabled or not migrated.
 */
export async function collectFigmaRunSources(db: Db, input: {
  companyId: string; agentId: string; runId: string; projectId: string | null;
}): Promise<unknown | null> {
  if (!input.projectId) return null;
  try {
    return await withFigmaProjectTransaction(db, {
      companyId: input.companyId, projectId: input.projectId,
      actor: { type: "agent", source: "agent_jwt", companyId: input.companyId,
        agentId: input.agentId, runId: input.runId },
    }, false, async tx => {
      const [plugin] = await tx.select().from(plugins).where(eq(plugins.pluginKey, "vistecsol.figma")).for("update");
      if (!plugin || !["installed", "ready"].includes(plugin.status)) return null;
      const [settings] = await tx.select().from(pluginCompanySettings).where(and(
        eq(pluginCompanySettings.pluginId, plugin.id), eq(pluginCompanySettings.companyId, input.companyId),
      )).for("share");
      if (settings?.enabled === false) return null;
      const database = pluginDatabaseService(tx);
      const store = designStore({ namespace: derivePluginDatabaseNamespace(plugin.pluginKey, plugin.manifestJson.database?.namespaceSlug),
        query: (statement: string, params: unknown[]) => database.query(plugin.id, statement, params),
        execute: (statement: string, params: unknown[]) => database.execute(plugin.id, statement, params),
      });
      const operations = hostDesignOperations({ withProject: (_request: unknown, _write: boolean, work: (scope: unknown) => Promise<unknown>) =>
        work({ store, companyId: input.companyId, projectId: input.projectId }) });
      return designDiscovery({
        // Run, plugin and existing company-setting rows remain locked by this
        // transaction. No additional network I/O or credential resolution.
        authorize: async () => {}, read: () => operations.sources({}), maxBytes: 32768,
      });
    }, { boundedRead: true });
  } catch {
    return null; // never serialize database errors or untrusted wake fallbacks
  }
}
