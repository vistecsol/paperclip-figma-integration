import { randomUUID } from 'node:crypto';

export class DesignError extends Error {
  constructor(code, status = 400) { super(code); this.code = code; this.status = status; }
}
const fail = (code, status) => { throw new DesignError(code, status); };
const text = (value, max, field) => {
  if (value == null) return '';
  if (typeof value !== 'string' || value.length > max || /[\u0000-\u001f\u007f]/u.test(value)) fail(`invalid_${field}`);
  return value.trim();
};
export function requiredId(value, field = 'id') {
  if (typeof value !== 'string' || !/^[a-zA-Z0-9_-]{1,128}$/.test(value)) fail(`invalid_${field}`);
  return value;
}

/** Parse references only. Never fetch a supplied URL or retain query secrets. */
export function normalizeDesignUrl(input) {
  if (typeof input !== 'string' || input.length > 2048) fail('invalid_url');
  let url;
  try { url = new URL(input); } catch { fail('invalid_url'); }
  if (url.protocol !== 'https:' || !['figma.com', 'www.figma.com'].includes(url.hostname)
      || url.username || url.password || url.port) fail('invalid_url');
  const match = /^\/(design|file)\/([a-zA-Z0-9]{1,128})(?:\/[^/]*)?\/?$/.exec(url.pathname);
  if (!match) fail('unsupported_design_url');
  if (url.searchParams.getAll('node-id').length > 1) fail('ambiguous_node');
  const raw = url.searchParams.get('node-id');
  if (raw !== null && !/^\d{1,20}[:-]\d{1,20}$/.test(raw)) fail('invalid_node');
  const nodeId = raw === null ? null : raw.replace('-', ':').split(':').map(n => BigInt(n).toString()).join(':');
  const fileKey = match[2];
  return { fileKey, nodeId, url: `https://www.figma.com/design/${fileKey}${nodeId ? `?node-id=${nodeId.replace(':', '-')}` : ''}` };
}

export const emptyDesigns = () => ({ revision: 0, attachments: [] });
const key = a => JSON.stringify([a.connectionId, a.fileKey, a.nodeId]);

/** Pure project-wide transition. Persistence must CAS the whole revision atomically. */
export function changeDesigns(current, command, options = {}) {
  if (!command || !Number.isSafeInteger(command.expectedRevision) || command.expectedRevision < 0) fail('revision_required');
  if (command.expectedRevision !== current.revision) fail('stale_revision', 409);
  if (current.revision >= Number.MAX_SAFE_INTEGER) fail('revision_exhausted', 409);
  const attachments = structuredClone(current.attachments);
  const find = () => {
    const row = attachments.find(a => a.id === command.id);
    if (!row) fail('design_not_found', 404);
    return row;
  };
  switch (command.type) {
    case 'add': {
      if (attachments.length >= 100) fail('design_limit', 409);
      const reference = normalizeDesignUrl(command.url);
      const connectionId = requiredId(command.connectionId, 'connection');
      const row = {
        id: (options.newId ?? randomUUID)(), connectionId, ...reference,
        label: text(command.label, 200, 'label'), purpose: text(command.purpose, 1000, 'purpose'),
        primary: false, order: attachments.length,
        verification: { state: 'unverified', checkedAt: null },
      };
      if (attachments.some(a => key(a) === key(row))) fail('duplicate_design', 409);
      attachments.push(row);
      break;
    }
    case 'update': {
      const row = find();
      if (Object.hasOwn(command, 'label')) row.label = text(command.label, 200, 'label');
      if (Object.hasOwn(command, 'purpose')) row.purpose = text(command.purpose, 1000, 'purpose');
      break;
    }
    case 'detach': attachments.splice(attachments.indexOf(find()), 1); break;
    case 'primary': {
      if (command.id !== null) find();
      for (const row of attachments) row.primary = row.id === command.id;
      break;
    }
    case 'reorder': {
      if (!Array.isArray(command.ids) || command.ids.length !== attachments.length
          || new Set(command.ids).size !== attachments.length
          || command.ids.some(id => !attachments.some(a => a.id === id))) fail('invalid_order');
      const rows = new Map(attachments.map(a => [a.id, a]));
      attachments.splice(0, attachments.length, ...command.ids.map(id => rows.get(id)));
      break;
    }
    default: fail('unknown_design_command');
  }
  attachments.forEach((row, order) => { row.order = order; });
  return { revision: current.revision + 1, attachments };
}

/** Verification input comes from the managed bridge, never the request body. */
export function verifiedDesigns(current, id, result, checkedAt) {
  const states = ['accessible', 'access_denied', 'missing', 'reconnect_required', 'transient_error', 'rate_limited'];
  if (!states.includes(result) || !Number.isFinite(Date.parse(checkedAt))) fail('invalid_verification');
  if (current.revision >= Number.MAX_SAFE_INTEGER) fail('revision_exhausted', 409);
  const next = structuredClone(current);
  const row = next.attachments.find(a => a.id === id);
  if (!row) fail('design_not_found', 404);
  row.verification = { state: result, checkedAt };
  next.revision++;
  return next;
}

/** JSON data, not instructions. Host must authorize before calling and bound delivery. */
export function designSourceIndex(snapshot) {
  return {
    kind: 'figma_design_sources', revision: snapshot.revision,
    sources: snapshot.attachments.map(({ id, label, purpose, fileKey, nodeId, url, order, primary, connectionId, verification }) =>
      ({ id, label, purpose, fileKey, nodeId, url, order, primary, connectionId, verification })),
  };
}
