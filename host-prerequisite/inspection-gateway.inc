    /** Host-only fixed read operation. No worker-selected tool or arbitrary URL. */
    async executeFigmaInspection(input: {
      sessionToken: string; companyId: string; agentId: string; runId: string;
      projectId: string; connectionId: string; fileKey: string; nodeId: string | null;
    }): Promise<{ state: string }> {
      const session = await getActiveSession(input.sessionToken);
      if (session.companyId !== input.companyId || session.agentId !== input.agentId
          || session.runId !== input.runId || session.projectId !== input.projectId
          || session.gatewayId || !/^[a-zA-Z0-9]{1,256}$/.test(input.fileKey)
          || (input.nodeId !== null && !/^\d+:\d+$/.test(input.nodeId))) {
        throw new ToolGatewayHttpError(403, "Design session unavailable", "design_access_denied");
      }
      const [connection] = await db.select().from(toolConnections).where(and(
        eq(toolConnections.id, input.connectionId), eq(toolConnections.companyId, input.companyId),
      ));
      if (!connection || connection.transport !== "mcp_remote" || connection.authKind !== "oauth"
          || (connection.config.url ?? connection.config.endpoint ?? connection.config.remoteUrl) !== "https://mcp.figma.com/mcp"
          || connection.credentialRefs.some(ref => ref.placement === "url")) {
        throw new ToolGatewayHttpError(403, "Design connection unavailable", "design_access_denied");
      }
      const tools = await listToolsForContext(session);
      const tool = tools.find(candidate => candidate.connectionId === input.connectionId
        && candidate.upstreamToolName === "get_metadata" && candidate.risk === "read");
      if (!tool) return { state: "access_denied" };
      try {
        const outcome = await this.executeTool({ sessionToken: input.sessionToken, tool: tool.name,
          parameters: { fileKey: input.fileKey, nodeId: input.nodeId ?? "0:1" }, timeoutMs: 15000 });
        // Approval is not access proof. Preserve the native approval path; never retry.
        if (outcome.status !== "completed") return { state: "transient_error" };
        const result = outcome.result as { error?: string; data?: { isError?: boolean; content?: unknown[] } } | null;
        return { state: result && !result.error && result.data?.isError === false && Array.isArray(result.data.content) && result.data.content.length > 0
          ? "accessible" : "transient_error" };
      } catch (error) {
        // Generic transport 404/403 cannot establish Figma resource missing/denied.
        // Avoid guessing from provider text and never return it to the plugin.
        if (error instanceof ToolGatewayHttpError && error.status === 429) return { state: "rate_limited" };
        return { state: "transient_error" };
      }
    },

