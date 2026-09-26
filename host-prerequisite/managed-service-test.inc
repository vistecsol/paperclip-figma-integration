  it.each(["refresh", "revoked", "issuer-mismatch"])("uses Hermes-compatible Figma DCR through managed credentials: %s", async (scenario) => {
    vi.stubEnv("PAPERCLIP_TOOL_OAUTH_FIGMA_CLIENT_ID", "");
    vi.stubEnv("PAPERCLIP_TOOL_OAUTH_FIGMA_CLIENT_SECRET", "");
    vi.stubEnv("PAPERCLIP_TOOL_OAUTH_CLIENT_ID", "");
    vi.stubEnv("PAPERCLIP_TOOL_OAUTH_CLIENT_SECRET", "");
    const company = await createCompany(db);
    await grantBoardUser(db, company.id, "board", ["tools:manage_connections"]);
    const service = createTestToolAccessService(db);
    const connectionDraft = await service.createConnection(company.id, {
      name: "Figma DCR", transport: "mcp_remote", status: "draft", enabled: false,
      config: { url: "https://mcp.figma.com/mcp", quarantineNewEntries: true, oauth: { provider: "figma" } },
    });
    const connected = { connectionId: connectionDraft.id };
    const redirectUri = "https://paperclip.example/api/tools/oauth/callback";
    let refreshCount = 0;
    let accessToken = "figma-access-token";
    let tokenExchangeCount = 0;
    vi.spyOn(globalThis, "fetch").mockImplementation(async (url, init) => {
      const href = String(url);
      if (
        href === "https://mcp.figma.com/.well-known/oauth-protected-resource"
      ) {
        return mcpHttpResponse({
          resource: "https://mcp.figma.com/mcp", scopes_supported: ["mcp:connect"],
          authorization_servers: ["https://api.figma.com"],
        });
      }
      if (
        href === "https://api.figma.com/.well-known/oauth-authorization-server"
      ) {
        return mcpHttpResponse({
          issuer: "https://api.figma.com", scopes_supported: ["mcp:connect"],
          authorization_endpoint: "https://www.figma.com/oauth/mcp",
          token_endpoint: "https://api.figma.com/v1/oauth/token",
          registration_endpoint: "https://api.figma.com/v1/oauth/mcp/register",
          grant_types_supported: ["authorization_code", "refresh_token"],
          code_challenge_methods_supported: ["S256"],
          token_endpoint_auth_methods_supported: [
            "client_secret_basic",
            "client_secret_post",
          ],
        });
      }
      if (href === "https://api.figma.com/v1/oauth/mcp/register") {
        const requestBody = JSON.parse(String(init?.body)) as Record<
          string,
          unknown
        >;
        expect(requestBody.client_name).toBe("Claude Code");
        expect(requestBody.redirect_uris).toEqual([redirectUri]);
        expect(requestBody.token_endpoint_auth_method).toBe(
          "client_secret_post",
        );
        return mcpHttpResponse({
          client_id: "figma-dcr-client",
          client_secret: "figma-dcr-secret",
          redirect_uris: [redirectUri],
          grant_types: ["authorization_code", "refresh_token"],
          response_types: ["code"],
          token_endpoint_auth_method: "client_secret_post",
        });
      }
      if (href === "https://api.figma.com/v1/oauth/token") {
        const headers = new Headers(init?.headers);
        const body = init?.body as URLSearchParams;
        expect(headers.get("authorization")).toBeNull();
        expect(body.get("client_id")).toBe("figma-dcr-client");
        expect(body.get("client_secret")).toBe("figma-dcr-secret");
        tokenExchangeCount += 1;
        if (body.get("grant_type") === "refresh_token") {
          expect(body.get("refresh_token")).toBe("figma-refresh-token");
          refreshCount += 1;
          await new Promise((resolve) => setTimeout(resolve, 10));
          if (scenario === "revoked") return new Response(JSON.stringify({ error: "invalid_grant" }), { status: 400, headers: { "content-type": "application/json" } });
          accessToken = "figma-rotated-access-token";
          return mcpHttpResponse({ access_token: accessToken, refresh_token: "figma-rotated-refresh-token", expires_in: 3600, token_type: "Bearer" });
        }
        expect(body.get("code")).toBe("figma-code");
        expect(body.get("code_verifier")).toBeTruthy();
        return mcpHttpResponse({
          access_token: "figma-access-token",
          refresh_token: "figma-refresh-token",
          expires_in: 3600,
          token_type: "Bearer",
        });
      }
      if (href === "https://mcp.figma.com/mcp") {
        expect(new Headers(init?.headers).get("authorization")).toBe(
          `Bearer ${accessToken}`,
        );
        return mcpHttpResponse({
          jsonrpc: "2.0",
          id: "paperclip-catalog-refresh",
          result: {
            tools: [{ name: "whoami", annotations: { readOnlyHint: true } }],
          },
        });
      }
      throw new Error(`unexpected fetch ${href}`);
    });

    const started = await service.startOAuth(
      company.id,
      connected.connectionId,
      {
        redirectUri,
        actor: { actorType: "user", actorId: "board" },
      },
    );
    const authorization = new URL(started.authorizationUrl);
    expect(authorization.searchParams.get("scope")).toBe("mcp:connect");
    expect(authorization.searchParams.get("code_challenge_method")).toBe("S256");
    const state = authorization.searchParams.get("state");
    expect(state).toBeTruthy();
    if (scenario === "issuer-mismatch") {
      await expect(service.completeOAuthCallback({
        state: state!, code: "figma-code", redirectUri, iss: "https://attacker.test",
        actor: { actorType: "user", actorId: "board" },
      })).rejects.toMatchObject({ details: { code: "oauth_issuer_mismatch" } });
      expect(tokenExchangeCount).toBe(0);
      return;
    }
    // Figma's omitted iss works through existing host handling, without a bypass.
    const completed = await service.completeOAuthCallback({
      state: state!,
      code: "figma-code",
      redirectUri,
      actor: { actorType: "user", actorId: "board" },
    });

    expect(completed.connectionId).toBe(connected.connectionId);
    const [connection] = await db
      .select()
      .from(toolConnections)
      .where(eq(toolConnections.id, connected.connectionId));
    expect(connection.config).toMatchObject({
      oauth: { clientTokenEndpointAuthMethod: "client_secret_post" },
    });
    expect(JSON.stringify(connection.config)).not.toContain("figma-dcr-secret");
    expect(JSON.stringify(completed)).not.toContain("figma-dcr-secret");
    expect(JSON.stringify(connection.config)).not.toContain("figma-access-token");
    expect(JSON.stringify(connection.config)).not.toContain("figma-refresh-token");
    await db.update(toolConnections).set({ config: {
      ...connection.config,
      oauth: { ...(connection.config.oauth as Record<string, unknown>), expiresAt: "2000-01-01T00:00:00.000Z" },
    } }).where(eq(toolConnections.id, connected.connectionId));
    const freshService = createTestToolAccessService(db);
    const results = await Promise.allSettled([
      service.checkHealth(connected.connectionId), freshService.checkHealth(connected.connectionId),
    ]);
    expect(refreshCount).toBe(1);
    if (scenario === "revoked") {
      for (const result of results) {
        expect(result.status).toBe("rejected");
        expect(result.status === "rejected" ? result.reason : null).toMatchObject({ details: { code: "oauth_reauthorization_required" } });
      }
      const [revoked] = await db.select().from(toolConnections).where(eq(toolConnections.id, connected.connectionId));
      expect(revoked).toMatchObject({ status: "draft", enabled: false, healthStatus: "error" });
      expect(revoked.credentialSecretRefs.map((ref) => ref.configPath)).not.toContain("oauth.refresh_token");
    } else {
      for (const result of results) {
        expect(result.status).toBe("fulfilled");
        if (result.status === "fulfilled") expect(result.value.connection.healthStatus).toBe("ok");
      }
      const [rotated] = await db.select().from(toolConnections).where(eq(toolConnections.id, connected.connectionId));
      expect(JSON.stringify(rotated.config)).not.toContain("figma-rotated-refresh-token");
      const ref = rotated.credentialSecretRefs.find((entry) => entry.configPath === "oauth.refresh_token")!;
      const versions = await db.select().from(companySecretVersions).where(eq(companySecretVersions.secretId, ref.secretId));
      expect(versions).toHaveLength(2);
    }

  });
