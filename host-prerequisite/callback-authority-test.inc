  it.each(["instance", "owner", "admin", "manager", "operator", "missing", "inactive", "viewer", "wrong-company", "revoked-instance", "revoked-manager", "forged", "concurrent-instance", "concurrent-manager", "concurrent-membership"] as const)(
    "shared callback current authority: %s", async (kind) => {
      vi.stubEnv("PAPERCLIP_TOOL_OAUTH_SLACK_CLIENT_ID", "synthetic-client");
      vi.stubEnv("PAPERCLIP_TOOL_OAUTH_SLACK_CLIENT_SECRET", "synthetic-secret");
      const company = await createCompany(db);
      const userId = randomUUID();
      await grantBoardUser(db, company.id, userId, [], "owner");
      const service = createTestToolAccessService(db);
      const actor = { actorType: "user" as const, actorId: userId };
      const connected = await service.connectGalleryApp(company.id, {
        galleryKey: "slack", name: "Synthetic callback authority", grantKind: "organization",
      }, actor);
      const redirectUri = "https://paperclip.example/api/tools/oauth/callback";
      const started = await service.startOAuth(company.id, connected.connectionId, { redirectUri, actor });
      const membershipWhere = and(eq(companyMemberships.companyId, company.id), eq(companyMemberships.principalId, userId));
      await db.update(companyMemberships).set({ membershipRole: kind === "owner" || kind === "admin" ? kind : "operator" }).where(membershipWhere);
      if (["instance", "missing", "inactive", "viewer", "wrong-company", "revoked-instance", "concurrent-instance", "concurrent-membership"].includes(kind)) {
        await db.insert(instanceUserRoles).values({ userId, role: "instance_admin" });
      }
      if (kind === "manager" || kind === "revoked-manager" || kind === "concurrent-manager") {
        await db.insert(principalPermissionGrants).values({companyId: company.id, principalType: "user", principalId: userId, permissionKey: "tools:manage_connections"});
      }
      if (kind === "missing") await db.delete(companyMemberships).where(membershipWhere);
      if (kind === "inactive") await db.update(companyMemberships).set({status: "suspended"}).where(membershipWhere);
      if (kind === "viewer") await db.update(companyMemberships).set({membershipRole: "viewer"}).where(membershipWhere);
      if (kind === "wrong-company") {
        const other = await createCompany(db);
        await db.update(companyMemberships).set({companyId: other.id}).where(membershipWhere);
      }
      // Mutate authority during the provider exchange, after OAuth start.
      vi.spyOn(globalThis, "fetch").mockImplementation(async (url) => {
        if (String(url) === "https://slack.com/api/oauth.v2.access") {
          if (kind === "revoked-instance") await db.delete(instanceUserRoles).where(eq(instanceUserRoles.userId, userId));
          if (kind === "revoked-manager") await db.delete(principalPermissionGrants).where(eq(principalPermissionGrants.principalId, userId));
          return mcpHttpResponse({ok: true, access_token: "synthetic-access", refresh_token: "synthetic-refresh", token_type: "Bearer", expires_in: 3600});
        }
        if (String(url) === "https://mcp.slack.com/mcp") return mcpHttpResponse({jsonrpc:"2.0",id:"paperclip-catalog-refresh",result:{tools:[]}});
        throw new Error("Unexpected synthetic transport request");
      });
      const beforeSecrets = await db.select().from(companySecrets).where(eq(companySecrets.companyId, company.id));
      const beforeGrants = await db.select().from(connectionGrants).where(eq(connectionGrants.connectionId, connected.connectionId));
      let release!: () => void;
      let locked!: () => void;
      const mayCommit = new Promise<void>(resolve => { release = resolve; });
      const isLocked = new Promise<void>(resolve => { locked = resolve; });
      const table = kind === "concurrent-instance" ? instanceUserRoles : kind === "concurrent-manager" ? principalPermissionGrants : companyMemberships;
      const predicate = kind === "concurrent-instance" ? eq(instanceUserRoles.userId, userId) : kind === "concurrent-manager" ? eq(principalPermissionGrants.principalId, userId) : membershipWhere;
      const concurrent = kind.startsWith("concurrent-");
      const removal = concurrent ? db.transaction(async tx => {
        await tx.select().from(table).where(predicate).for("update");
        locked();
        await mayCommit;
        await tx.delete(table).where(predicate);
      }) : Promise.resolve();
      if (concurrent) await isLocked;
      const result = service.completeOAuthCallback({
        state: new URL(started.authorizationUrl).searchParams.get("state")!,
        code: "synthetic-code", redirectUri,
        actor: {...actor, ...(kind === "forged" ? {isInstanceAdmin: true} : {})},
      });
      if (concurrent) {
        // Attach rejection handler before releasing the concurrent mutation.
        const observed = result.then(value => ({value, error: null}), error => ({value: null, error}));
        let waiting = false;
        try {
          const queryTable = kind === "concurrent-instance" ? "instance_user_roles" : kind === "concurrent-manager" ? "principal_permission_grants" : "company_memberships";
          for (let attempt = 0; attempt < 100; attempt++) {
            const [row] = await db.execute<{waiting: boolean}>(sql`select exists(select 1 from pg_stat_activity where state='active' and wait_event_type='Lock' and query ilike ${'%' + queryTable + '%'} and query ilike '%for update%') as waiting`);
            if (row?.waiting) { waiting = true; break; }
            await new Promise(resolve => setTimeout(resolve, 20));
          }
        } finally { release(); await removal; }
        const outcome = await observed;
        expect(waiting).toBe(true);
        expect(outcome.error).toMatchObject({status:403});
        expect(await db.select().from(companySecrets).where(eq(companySecrets.companyId, company.id))).toEqual(beforeSecrets);
        expect(await db.select().from(connectionGrants).where(eq(connectionGrants.connectionId, connected.connectionId))).toEqual(beforeGrants);
      } else if (["instance", "owner", "admin", "manager"].includes(kind)) {
        await expect(result).resolves.toMatchObject({connection:{status:"active",credentialPolicy:"shared"}});
      } else {
        await expect(result).rejects.toMatchObject({status:403});
        expect(await db.select().from(companySecrets).where(eq(companySecrets.companyId, company.id))).toEqual(beforeSecrets);
        expect(await db.select().from(connectionGrants).where(eq(connectionGrants.connectionId, connected.connectionId))).toEqual(beforeGrants);
      }
    },
  );

  it("shared callback repair preserves foreign personal identity isolation for instance admin", async () => {
    vi.stubEnv("PAPERCLIP_TOOL_OAUTH_SLACK_CLIENT_ID", "synthetic-client");
    vi.stubEnv("PAPERCLIP_TOOL_OAUTH_SLACK_CLIENT_SECRET", "synthetic-secret");
    const company = await createCompany(db);
    const owner = randomUUID(), admin = randomUUID();
    await grantBoardUser(db, company.id, owner, [], "owner");
    await grantBoardUser(db, company.id, admin, [], "operator");
    await db.insert(instanceUserRoles).values({userId: admin, role: "instance_admin"});
    const service = createTestToolAccessService(db);
    const connected = await service.connectGalleryApp(company.id, {
      galleryKey: "slack", name: "Synthetic personal isolation", grantKind: "user",
    }, {actorType:"user",actorId:owner});
    const before = await db.select().from(connectionGrants).where(eq(connectionGrants.connectionId, connected.connectionId));
    await expect(service.startOAuth(company.id, connected.connectionId, {
      redirectUri:"https://paperclip.example/api/tools/oauth/callback",
      actor:{actorType:"user",actorId:admin},
    })).rejects.toMatchObject({status:403});
    expect(await db.select().from(connectionGrants).where(eq(connectionGrants.connectionId, connected.connectionId))).toEqual(before);
    expect(await db.select().from(companySecrets).where(eq(companySecrets.companyId, company.id))).toEqual([]);
  });
