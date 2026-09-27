import { randomUUID } from 'node:crypto';
import { eq } from 'drizzle-orm';
import { beforeAll, afterAll, expect, it, vi } from 'vitest';
import { createDb, companies, companyMemberships, agents, issues, heartbeatRuns, projects, toolApplications, toolConnections, connectionGrants, connectionGrantMembers, toolCatalogEntries, toolPolicies } from '@paperclipai/db';
import { createToolGatewayService } from '../services/tool-gateway.js';
import { startEmbeddedPostgresTestDatabase } from './helpers/embedded-postgres.js';
let database: Awaited<ReturnType<typeof startEmbeddedPostgresTestDatabase>>;
let db: ReturnType<typeof createDb>;
beforeAll(async () => { database = await startEmbeddedPostgresTestDatabase('figma-inspection-'); db = createDb(database.connectionString); });
afterAll(async () => { await database?.cleanup(); });
async function createRunFixture(db: ReturnType<typeof createDb>) {
  const company = await db.insert(companies).values({
    name: `Gateway ${randomUUID()}`,
    issuePrefix: `TG${randomUUID().slice(0, 6).toUpperCase()}`,
  }).returning().then((rows) => rows[0]!);
  const agent = await db.insert(agents).values({
    companyId: company.id,
    name: `Gateway Agent ${randomUUID()}`,
    role: "engineer",
    adapterType: "process",
    adapterConfig: {},
    runtimeConfig: {},
    permissions: {},
  }).returning().then((rows) => rows[0]!);
  const issue = await db.insert(issues).values({
    companyId: company.id,
    title: "Gateway approval work",
    status: "in_progress",
    assigneeAgentId: agent.id,
  }).returning().then((rows) => rows[0]!);
  const run = await db.insert(heartbeatRuns).values({
    companyId: company.id,
    agentId: agent.id,
    invocationSource: "assignment",
    status: "running",
    contextSnapshot: { issueId: issue.id },
  }).returning().then((rows) => rows[0]!);
  return { company, agent, issue, run };
}

async function createRemoteMcpToolFixture(db: ReturnType<typeof createDb>, companyId: string) {
  const application = await db.insert(toolApplications).values({
    companyId,
    applicationKey: `remote-${randomUUID().slice(0, 8)}`,
    name: "Remote MCP",
    type: "mcp_http",
    status: "active",
  }).returning().then((rows) => rows[0]!);
  const connection = await db.insert(toolConnections).values({
    companyId,
    applicationId: application.id,
    name: "Remote connection",
    uid: `test/${randomUUID()}`,
    transport: "mcp_remote",
    status: "active",
    enabled: true,
    healthStatus: "ok",
    // Use a public IP literal so protocol tests remain independent of DNS while
    // still exercising the production egress guard and their global fetch stub.
    credentialPolicy: "shared",
    config: { url: "https://8.8.8.8/mcp" },
  }).returning().then((rows) => rows[0]!);
  await db.insert(connectionGrants).values({
    companyId,
    connectionId: connection.id,
    kind: "organization",
    credentialSecretRefs: [],
    status: "active",
    isDefault: true,
  });
  const catalogEntry = await db.insert(toolCatalogEntries).values({
    companyId,
    applicationId: application.id,
    connectionId: connection.id,
    entryKind: "tool",
    name: "needs_input",
    toolName: "needs_input",
    title: "Needs input",
    riskLevel: "read",
    isReadOnly: true,
    status: "active",
    versionHash: randomUUID(),
    schemaHash: randomUUID(),
  }).returning().then((rows) => rows[0]!);
  return { application, connection, catalogEntry };
}


it('native inspection binds session scope, permits only metadata, and projects results without provider text', async () => {
  const { company, agent, issue, run } = await createRunFixture(db);
  const [project] = await db.insert(projects).values({ companyId: company.id, name: 'Inspection' }).returning();
  await db.update(issues).set({ projectId: project.id }).where(eq(issues.id, issue.id));
  const { connection, catalogEntry } = await createRemoteMcpToolFixture(db, company.id);
  await db.update(toolConnections).set({ authKind: 'oauth', config: { url: 'https://mcp.figma.com/mcp' } }).where(eq(toolConnections.id, connection.id));
  await db.update(toolCatalogEntries).set({ name: 'get_metadata', toolName: 'get_metadata' }).where(eq(toolCatalogEntries.id, catalogEntry.id));
  await db.insert(toolPolicies).values({ companyId: company.id, name: 'Allow fixture read', policyType: 'allow', selectors: { riskLevel: 'read' } });
  let remoteCalls = 0;
  const gateway = createToolGatewayService(db, { toolActionSigningSecret: 'synthetic-signing-fixture',
    remoteHttpRequest: async (_url, init) => {
      remoteCalls++;
      const message = JSON.parse(String(init.body));
      return new Response(JSON.stringify({ jsonrpc: '2.0', id: message.id,
        result: { content: [{ type: 'text', text: '<node id="1:2" />' }] } }),
        { headers: { 'content-type': 'application/json' } });
    } });
  const session = await gateway.createSession({ companyId: company.id, agentId: agent.id, runId: run.id });
  // Native session, catalog and policy discovery; execution is stubbed here.
  // This checks the binding/delegation contract, not OAuth or runtime execution.
  const dispatch = vi.spyOn(gateway, 'executeTool').mockResolvedValue({ status: 'completed', invocationId: 'fixture', tool: 'fixture', result: { data: { isError: false, content: [{ type: 'text', text: 'private provider content' }] } } });
  const input = { sessionToken: session.token, companyId: company.id, agentId: agent.id, runId: run.id,
    projectId: project.id, connectionId: connection.id, fileKey: 'FixtureFile', nodeId: '1:2' };
  await expect(gateway.executeFigmaInspection({ ...input, projectId: randomUUID() })).rejects.toMatchObject({ status: 403 });
  await expect(gateway.executeFigmaInspection({ ...input, agentId: randomUUID() })).rejects.toMatchObject({ status: 403 });
  expect(dispatch).not.toHaveBeenCalled();
  await expect(gateway.executeFigmaInspection(input)).resolves.toEqual({ state: 'accessible' });
  expect(dispatch.mock.calls[0][0].parameters).toEqual({ fileKey: 'FixtureFile', nodeId: '1:2' });
  dispatch.mockResolvedValueOnce({ status: 'completed', invocationId: 'fixture', tool: 'fixture', result: { data: { isError: true, content: [{ type: 'text', text: '404 secret diagnostic' }] } } });
  await expect(gateway.executeFigmaInspection(input)).resolves.toEqual({ state: 'transient_error' });
  expect(dispatch).toHaveBeenCalledTimes(2);
  dispatch.mockRestore();
  await expect(gateway.executeFigmaInspection(input)).resolves.toEqual({ state: 'accessible' });
  expect(remoteCalls).toBe(1);
  await db.update(connectionGrants).set({ status: 'revoked' }).where(eq(connectionGrants.connectionId, connection.id));
  expect((await gateway.executeFigmaInspection(input)).state).not.toBe('accessible');
  expect(remoteCalls).toBe(1);
  await db.update(toolConnections).set({ config: { url: 'https://other.invalid/mcp' } }).where(eq(toolConnections.id, connection.id));
  await expect(gateway.executeFigmaInspection(input)).rejects.toMatchObject({ status: 403 });
  await db.update(heartbeatRuns).set({ status: 'cancelled' }).where(eq(heartbeatRuns.id, run.id));
  await expect(gateway.executeFigmaInspection(input)).rejects.toMatchObject({ status: 401 });
  expect(remoteCalls).toBe(1);
});

it('board verification uses native tools permission and explicit assignable employee, without impersonation', async () => {
  const { captureFigmaInspector } = await import('../services/figma-inspection.js');
  const { company, agent } = await createRunFixture(db);
  const { connection, catalogEntry } = await createRemoteMcpToolFixture(db, company.id);
  await db.update(toolConnections).set({ authKind: 'oauth', config: { url: 'https://mcp.figma.com/mcp' } }).where(eq(toolConnections.id, connection.id));
  await db.update(toolCatalogEntries).set({ name: 'get_metadata', toolName: 'get_metadata' }).where(eq(toolCatalogEntries.id, catalogEntry.id));
  await db.insert(toolPolicies).values({ companyId: company.id, name: 'Board read', policyType: 'allow', selectors: { riskLevel: 'read' } });
  let calls = 0;
  const gateway = createToolGatewayService(db, { toolActionSigningSecret: 'synthetic-board-key', remoteHttpRequest: async (_url, init) => {
    calls++;
    const message = JSON.parse(String(init.body));
    expect(message.params.name).toBe('get_metadata');
    return new Response(JSON.stringify({ jsonrpc: '2.0', id: message.id, result: { content: [{ type: 'text', text: '<node />' }] } }), { headers: { 'content-type': 'application/json' } });
  } });
  const reference = { connectionId: connection.id, fileKey: 'Fixture', nodeId: '1:2' };
  const request = { actor: { type: 'board', source: 'local_implicit', userId: 'fixture-board' }, app: { locals: { toolGateway: gateway } }, header: () => undefined } as any;
  expect(captureFigmaInspector(request, 'project', db)).toBeUndefined();
  const denied = { ...request, actor: { type: 'board', source: 'session', userId: 'no-tools', companyIds: [company.id] } } as any;
  await expect(captureFigmaInspector(denied, 'project', db, agent.id)!(reference)).rejects.toMatchObject({ status: 403 });
  await expect(captureFigmaInspector(request, 'project', db, randomUUID())!(reference)).rejects.toMatchObject({ status: 403 });
  expect(calls).toBe(0);
  const inspect = captureFigmaInspector(request, 'project', db, agent.id)!;
  // Tools permission does not bypass the board user's native grant audience.
  await expect(inspect(reference)).resolves.toEqual({ state: 'transient_error' });
  expect(calls).toBe(0);
  const [grant] = await db.select().from(connectionGrants).where(eq(connectionGrants.connectionId, connection.id));
  await db.insert(connectionGrantMembers).values({ companyId: company.id, grantId: grant.id, subjectType: 'user', subjectId: 'fixture-board' });
  await db.insert(companyMemberships).values({ companyId: company.id, principalType: 'user', principalId: 'fixture-board', status: 'active', membershipRole: 'member' });
  await expect(inspect(reference)).resolves.toEqual({ state: 'accessible' });
  expect(calls).toBe(1);
  await db.update(agents).set({ status: 'terminated' }).where(eq(agents.id, agent.id));
  await expect(inspect(reference)).rejects.toMatchObject({ status: 403 });
  expect(calls).toBe(1);
});
