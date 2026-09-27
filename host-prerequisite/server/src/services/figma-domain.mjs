// src/attachments.mjs
import { randomUUID } from "node:crypto";
var DesignError = class extends Error {
  constructor(code, status = 400) {
    super(code);
    this.code = code;
    this.status = status;
  }
};
var fail = (code, status) => {
  throw new DesignError(code, status);
};
var text = (value, max, field) => {
  if (value == null) return "";
  if (typeof value !== "string" || value.length > max || /[\u0000-\u001f\u007f]/u.test(value)) fail(`invalid_${field}`);
  return value.trim();
};
function requiredId(value, field = "id") {
  if (typeof value !== "string" || !/^[a-zA-Z0-9_-]{1,128}$/.test(value)) fail(`invalid_${field}`);
  return value;
}
function normalizeDesignUrl(input) {
  if (typeof input !== "string" || input.length > 2048) fail("invalid_url");
  let url;
  try {
    url = new URL(input);
  } catch {
    fail("invalid_url");
  }
  if (url.protocol !== "https:" || !["figma.com", "www.figma.com"].includes(url.hostname) || url.username || url.password || url.port) fail("invalid_url");
  const match = /^\/(design|file)\/([a-zA-Z0-9]{1,128})(?:\/[^/]*)?\/?$/.exec(url.pathname);
  if (!match) fail("unsupported_design_url");
  if (url.searchParams.getAll("node-id").length > 1) fail("ambiguous_node");
  const raw = url.searchParams.get("node-id");
  if (raw !== null && !/^\d{1,20}[:-]\d{1,20}$/.test(raw)) fail("invalid_node");
  const nodeId = raw === null ? null : raw.replace("-", ":").split(":").map((n) => BigInt(n).toString()).join(":");
  const fileKey = match[2];
  return { fileKey, nodeId, url: `https://www.figma.com/design/${fileKey}${nodeId ? `?node-id=${nodeId.replace(":", "-")}` : ""}` };
}
var emptyDesigns = () => ({ revision: 0, attachments: [] });
var key = (a) => JSON.stringify([a.connectionId, a.fileKey, a.nodeId]);
function changeDesigns(current, command, options = {}) {
  if (!command || !Number.isSafeInteger(command.expectedRevision) || command.expectedRevision < 0) fail("revision_required");
  if (command.expectedRevision !== current.revision) fail("stale_revision", 409);
  if (current.revision >= Number.MAX_SAFE_INTEGER) fail("revision_exhausted", 409);
  const attachments = structuredClone(current.attachments);
  const find = () => {
    const row = attachments.find((a) => a.id === command.id);
    if (!row) fail("design_not_found", 404);
    return row;
  };
  switch (command.type) {
    case "add": {
      if (attachments.length >= 100) fail("design_limit", 409);
      const reference = normalizeDesignUrl(command.url);
      const connectionId = requiredId(command.connectionId, "connection");
      const row = {
        id: (options.newId ?? randomUUID)(),
        connectionId,
        ...reference,
        label: text(command.label, 200, "label"),
        purpose: text(command.purpose, 1e3, "purpose"),
        primary: false,
        order: attachments.length,
        verification: { state: "unverified", checkedAt: null }
      };
      if (attachments.some((a) => key(a) === key(row))) fail("duplicate_design", 409);
      attachments.push(row);
      break;
    }
    case "update": {
      const row = find();
      if (Object.hasOwn(command, "label")) row.label = text(command.label, 200, "label");
      if (Object.hasOwn(command, "purpose")) row.purpose = text(command.purpose, 1e3, "purpose");
      break;
    }
    case "detach":
      attachments.splice(attachments.indexOf(find()), 1);
      break;
    case "primary": {
      if (command.id !== null) find();
      for (const row of attachments) row.primary = row.id === command.id;
      break;
    }
    case "reorder": {
      if (!Array.isArray(command.ids) || command.ids.length !== attachments.length || new Set(command.ids).size !== attachments.length || command.ids.some((id) => !attachments.some((a) => a.id === id))) fail("invalid_order");
      const rows = new Map(attachments.map((a) => [a.id, a]));
      attachments.splice(0, attachments.length, ...command.ids.map((id) => rows.get(id)));
      break;
    }
    default:
      fail("unknown_design_command");
  }
  attachments.forEach((row, order) => {
    row.order = order;
  });
  return { revision: current.revision + 1, attachments };
}
function verifiedDesigns(current, id, result, checkedAt) {
  const states = ["accessible", "access_denied", "missing", "reconnect_required", "transient_error", "rate_limited"];
  if (!states.includes(result) || !Number.isFinite(Date.parse(checkedAt))) fail("invalid_verification");
  if (current.revision >= Number.MAX_SAFE_INTEGER) fail("revision_exhausted", 409);
  const next = structuredClone(current);
  const row = next.attachments.find((a) => a.id === id);
  if (!row) fail("design_not_found", 404);
  row.verification = { state: result, checkedAt };
  next.revision++;
  return next;
}
function designSourceIndex(snapshot) {
  return {
    kind: "figma_design_sources",
    revision: snapshot.revision,
    sources: snapshot.attachments.map(({ id, label, purpose, fileKey, nodeId, url, order, primary, connectionId, verification }) => ({ id, label, purpose, fileKey, nodeId, url, order, primary, connectionId, verification }))
  };
}

// src/api.mjs
var designApiRoutes = [
  ["designs.list", "GET", "/projects/:projectId/designs"],
  ["designs.mutate", "POST", "/projects/:projectId/designs"],
  ["designs.verify", "POST", "/projects/:projectId/designs/:designId/verify"],
  ["designs.sources", "GET", "/projects/:projectId/designs/sources"]
].map(([routeKey, method, path]) => ({
  routeKey,
  method,
  path,
  auth: "board-or-agent",
  capability: "api.routes.register",
  companyResolution: { from: "query", key: "companyId" }
}));
var commandFields = {
  add: ["expectedRevision", "connectionId", "url", "label", "purpose"],
  update: ["expectedRevision", "id", "label", "purpose"],
  detach: ["expectedRevision", "id"],
  primary: ["expectedRevision", "id"],
  reorder: ["expectedRevision", "ids"]
};
function object(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new DesignError("invalid_body");
  return value;
}
function exactFields(body, allowed) {
  if (Object.keys(body).some((key2) => !allowed.includes(key2))) throw new DesignError("unknown_field");
}
function designApi(service) {
  return async (input) => {
    try {
      const route = designApiRoutes.find((r) => r.routeKey === input?.routeKey);
      if (!route) return { status: 404, body: { error: "route_not_found" } };
      if (input.method !== route.method) return { status: 405, body: { error: "method_not_allowed" } };
      const actor = input.actor;
      if (!actor || !["user", "agent"].includes(actor.actorType) || !actor.actorId || actor.actorType === "agent" && (!actor.agentId || !actor.runId)) {
        throw new DesignError("unauthorized", 403);
      }
      const request = {
        companyId: requiredId(input.companyId, "company"),
        projectId: requiredId(input.params?.projectId, "project"),
        actor
      };
      let body;
      switch (route.routeKey) {
        case "designs.list":
          body = await service.list(request);
          break;
        case "designs.sources":
          body = await service.sources(request);
          break;
        case "designs.mutate": {
          const command = object(input.body);
          if (!Object.hasOwn(commandFields, command.type)) throw new DesignError("unknown_design_command");
          exactFields(command, ["type", ...commandFields[command.type]]);
          body = await service.mutate(request, command);
          break;
        }
        case "designs.verify": {
          const payload = object(input.body);
          exactFields(payload, ["expectedRevision", "agentId"]);
          if (payload.agentId !== void 0) requiredId(payload.agentId, "agent");
          if (!Number.isSafeInteger(payload.expectedRevision) || payload.expectedRevision < 0) throw new DesignError("revision_required");
          body = await service.verify(request, requiredId(input.params?.designId, "design"), payload.expectedRevision);
          break;
        }
      }
      return { status: 200, body };
    } catch (error) {
      return error instanceof DesignError ? { status: error.status, body: { error: error.code } } : { status: 500, body: { error: "design_operation_failed" } };
    }
  };
}

// src/storage.mjs
function designStore(db) {
  if (!/^plugin_[a-z0-9_]+$/.test(db.namespace)) throw new Error("Unsafe plugin namespace");
  const table = `"${db.namespace}".project_designs`;
  const scope = (companyId, projectId) => [requiredId(companyId, "company"), requiredId(projectId, "project")];
  return {
    async read(companyId, projectId) {
      const rows = await db.query(`SELECT revision, attachments FROM ${table} WHERE company_id = $1 AND project_id = $2`, scope(companyId, projectId));
      return rows.length ? { revision: Number(rows[0].revision), attachments: rows[0].attachments } : emptyDesigns();
    },
    async compareAndSwap(companyId, projectId, before, after) {
      if (!Number.isSafeInteger(before.revision) || before.revision < 0 || after.revision !== before.revision + 1) throw new DesignError("invalid_revision");
      const values = [...scope(companyId, projectId), after.revision, JSON.stringify(after.attachments)];
      const result = before.revision === 0 ? await db.execute(`INSERT INTO ${table} (company_id, project_id, revision, attachments) VALUES ($1, $2, $3, $4::jsonb) ON CONFLICT (company_id, project_id) DO NOTHING`, values) : await db.execute(`UPDATE ${table} SET revision = $3, attachments = $4::jsonb WHERE company_id = $1 AND project_id = $2 AND revision = $5`, [...values, before.revision]);
      if (result.rowCount !== 1) throw new DesignError("stale_revision", 409);
      return after;
    }
  };
}

// src/host-operations.mjs
function hostDesignOperations({ withProject }) {
  if (typeof withProject !== "function") throw new Error("Host project transaction required");
  const execute = (request, write, operation) => withProject(request, write, operation);
  return Object.freeze({
    list: (request) => execute(request, false, ({ store, companyId, projectId }) => store.read(companyId, projectId)),
    sources: (request) => execute(request, false, async ({ store, companyId, projectId }) => designSourceIndex(await store.read(companyId, projectId))),
    verify: (request, id, expectedRevision) => execute(request, true, async ({ store, companyId, projectId, authorizeConnection, inspect }) => {
      const before = await store.read(companyId, projectId);
      if (before.revision !== expectedRevision) throw new DesignError("stale_revision", 409);
      const row = before.attachments.find((item) => item.id === id);
      if (!row) throw new DesignError("design_not_found", 404);
      if (typeof inspect !== "function") throw new DesignError("managed_session_required", 409);
      await authorizeConnection(row.connectionId);
      const result = await inspect({ connectionId: row.connectionId, fileKey: row.fileKey, nodeId: row.nodeId });
      const after = verifiedDesigns(before, id, result.state, (/* @__PURE__ */ new Date()).toISOString());
      return store.compareAndSwap(companyId, projectId, before, after);
    }),
    mutate: (request, command) => {
      const input = structuredClone(command);
      return execute(request, true, async ({ store, companyId, projectId, authorizeConnection }) => {
        const before = await store.read(companyId, projectId);
        const after = changeDesigns(before, input);
        if (input.type === "add") {
          if (typeof authorizeConnection !== "function") throw new DesignError("design_access_denied", 403);
          await authorizeConnection(input.connectionId);
        }
        return store.compareAndSwap(companyId, projectId, before, after);
      });
    }
  });
}

// src/discovery.mjs
async function designDiscovery({ authorize, read, signal, maxBytes = 32768 }) {
  if (typeof authorize !== "function" || typeof read !== "function") throw new Error("Host discovery authority required");
  if (!Number.isSafeInteger(maxBytes) || maxBytes < 512 || maxBytes > 65536) throw new Error("Invalid discovery byte limit");
  signal?.throwIfAborted();
  await authorize();
  signal?.throwIfAborted();
  const index = await read();
  signal?.throwIfAborted();
  const result = {
    kind: "figma_design_sources",
    trust: "untrusted_data",
    revision: index.revision,
    sources: [],
    omitted: index.sources.length
  };
  for (const source of index.sources) {
    const { id, label, purpose, fileKey, nodeId, url, order, primary, connectionId, verification } = source;
    const row = {
      id,
      label,
      purpose,
      fileKey,
      nodeId,
      url,
      order,
      primary,
      connectionId,
      verification: { state: verification.state, checkedAt: verification.checkedAt }
    };
    result.sources.push(row);
    result.omitted--;
    if (Buffer.byteLength(JSON.stringify(result), "utf8") > maxBytes) {
      result.sources.pop();
      result.omitted++;
      break;
    }
  }
  await authorize();
  signal?.throwIfAborted();
  return result;
}
export {
  DesignError,
  designApi,
  designDiscovery,
  designStore,
  hostDesignOperations
};
