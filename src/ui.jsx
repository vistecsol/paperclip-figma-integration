import React, { useRef, useState } from 'react';
import { useHostContext, usePluginAction, usePluginData } from '@paperclipai/plugin-sdk/ui';

// Plugin bundles load after the host CSS is built. Ship scoped styles rather
// than relying on the host Tailwind scanner to discover plugin-only classes.
const panelCss = `
.vts-figma-designs { display: grid; gap: 1rem; min-width: 0; color: var(--foreground); }
.vts-figma-designs header, .vts-figma-designs li { display: grid; gap: .75rem; }
.vts-figma-designs h2 { font-size: 1.125rem; font-weight: 600; }
.vts-figma-designs p { margin: 0; }
.vts-figma-designs a { text-decoration: underline; overflow-wrap: anywhere; }
.vts-figma-designs ol { display: grid; gap: .75rem; padding: 0; list-style: none; }
.vts-figma-designs li, .vts-figma-designs form { border: 1px solid var(--border, #777); border-radius: .5rem; padding: 1rem; }
.vts-figma-designs form { display: grid; gap: 1rem; width: 100%; max-width: 42rem; box-sizing: border-box; }
.vts-figma-designs label { display: grid; gap: .375rem; min-width: 0; font-size: .875rem; font-weight: 500; }
.vts-figma-designs input, .vts-figma-designs select, .vts-figma-designs textarea {
  display: block; box-sizing: border-box; width: 100%; min-width: 0; min-height: 2.5rem;
  border: 1px solid var(--input, #777); border-radius: .375rem; padding: .5rem .75rem;
  background: var(--background, #fff); color: var(--foreground, #111); font: inherit;
}
.vts-figma-designs textarea { min-height: 5rem; resize: vertical; }
.vts-figma-designs button { display: inline-flex; align-items: center; justify-content: center;
  min-height: 2.25rem; padding: .375rem .75rem; border: 1px solid var(--border, #777);
  border-radius: .375rem; background: var(--background, #fff); color: var(--foreground, #111);
  font-size: .875rem; font-weight: 500; cursor: pointer; width: fit-content; }
.vts-figma-designs button:hover:not(:disabled) { background: var(--accent, #eee); color: var(--accent-foreground, #111); }
.vts-figma-designs button:disabled { opacity: .5; cursor: not-allowed; }
.vts-figma-designs :is(button, input, select, textarea, a):focus-visible { outline: 2px solid var(--ring, #777); outline-offset: 2px; }
.vts-figma-designs button[type="submit"] { background: var(--primary, #222); color: var(--primary-foreground, #fff); }
.vts-figma-designs .figma-actions { display: flex; flex-wrap: wrap; align-items: center; gap: .5rem; }
.vts-figma-designs .figma-help { font-size: .875rem; color: var(--muted-foreground); }
.vts-figma-designs [role="alert"] { border-left: 3px solid var(--destructive, #c33); padding: .5rem .75rem; }
`;

const messages = {
  stale_revision: 'Designs changed. Reload before trying again.',
  duplicate_design: 'This design is already attached to this connection.',
  design_access_denied: 'You do not have access to these designs.',
  managed_session_required: 'Check access from an authorized managed agent session.',
  managed_inspection_unavailable: 'Access checks are not available yet.',
};
const states = { unverified: 'Not checked', accessible: 'Accessible', access_denied: 'Access denied',
  missing: 'Not found', reconnect_required: 'Reconnect required', rate_limited: 'Rate limited', transient_error: 'Check unavailable' };

export function DesignsTab() {
  const context = useHostContext();
  const projectId = context.projectId ?? (context.entityType === 'project' ? context.entityId : null);
  // Keyed remount prevents an old project's draft/results leaking into a new tab.
  if (!context.companyId || !projectId) return <p>Select a project to view designs.</p>;
  return <DesignsPanel key={`${context.companyId}:${projectId}`} projectId={projectId} companyPrefix={context.companyPrefix} />;
}

function DesignsPanel({ projectId, companyPrefix }) {
  const query = usePluginData('designs.list', { projectId });
  const mutate = usePluginAction('designs.mutate');
  const verify = usePluginAction('designs.verify');
  const lock = useRef(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [draft, setDraft] = useState(null);
  const [confirmDetach, setConfirmDetach] = useState(null);
  const [check, setCheck] = useState(null);
  const generation = useRef(0);
  const response = query.data;
  const snapshot = response?.status === 200 ? response.body : null;
  async function submit(command, designId, agentId) {
    if (lock.current || !snapshot) return;
    lock.current = true; setBusy(true); setMessage('');
    try {
      const result = designId
        ? await verify({ projectId, designId, expectedRevision: snapshot.revision, agentId })
        : await mutate({ projectId, command: { ...command, expectedRevision: snapshot.revision } });
      if (result?.status !== 200) {
        setMessage(messages[result?.body?.error] ?? 'Unable to save. Reload and try again.');
      } else { setDraft(null); setConfirmDetach(null); setCheck(null); }
      await query.refresh();
    } catch { setMessage('Designs are unavailable. Reload and try again.'); }
    finally { lock.current = false; setBusy(false); }
  }
  async function selectEmployee(row) {
    const current = ++generation.current;
    setCheck({ id: row.id, agents: [], agentId: '', loading: true }); setMessage('');
    try {
      const response = await fetch(`/api/tool-connections/${encodeURIComponent(row.connectionId)}/test-agents`, { credentials: 'same-origin' });
      if (!response.ok) throw new Error();
      const result = await response.json();
      if (!Array.isArray(result.agents)) throw new Error();
      if (current === generation.current) setCheck({ id: row.id, agents: result.agents, agentId: '', loading: false });
    } catch { if (current === generation.current) { setCheck(null); setMessage('Employee selection is unavailable. Check your tools permission in Apps.'); } }
  }
  if (query.loading && !snapshot) return <p role="status">Loading designs…</p>;
  if (query.error || !snapshot) return <div role="alert"><p>Designs are unavailable or access was denied.</p><button onClick={() => query.refresh()}>Reload</button></div>;
  const connections = snapshot.connections ?? [];
  const rows = snapshot.attachments;
  return <section aria-label="Project designs" className="vts-figma-designs">
    <style>{panelCss}</style>
    <header><h2 className="text-lg font-semibold">Designs</h2>
      <p className="text-sm text-muted-foreground">Attach Figma references for this project. Links do not grant Figma access. Detaching keeps the Figma file.</p>
      <div className="figma-actions"><button disabled={busy} onClick={() => query.refresh()}>Reload</button>
      {companyPrefix && <a className="underline" href={`/${encodeURIComponent(companyPrefix)}/apps`}>Manage Figma connection</a>}</div>
    </header>
    {message && <p role="alert">{message}</p>}
    {!rows.length && <p>No designs attached.</p>}
    <ol className="space-y-3">{rows.map((row, index) => <li key={row.id} className="rounded-md border p-3 space-y-2">
      <a href={row.url} target="_blank" rel="noopener noreferrer" className="font-medium underline">{row.label || row.fileKey}{row.nodeId ? ` · ${row.nodeId}` : ''}</a>
      {row.primary && <span> · Primary design system</span>}
      {row.purpose && <p>{row.purpose}</p>}
      <p className="text-sm">Link access: {states[row.verification.state] ?? 'Not checked'}{row.verification.checkedAt ? ` · ${row.verification.checkedAt}` : ''}</p>
      <div className="figma-actions">
        <button disabled={busy} onClick={() => setDraft({ id: row.id, label: row.label, purpose: row.purpose })}>Rename / purpose</button>
        <button disabled={busy} onClick={() => submit({ type: 'primary', id: row.primary ? null : row.id })}>{row.primary ? 'Clear primary' : 'Set primary'}</button>
        {[-1, 1].map(delta => <button key={delta} disabled={busy || index + delta < 0 || index + delta >= rows.length} onClick={() => {
          const ids = rows.map(item => item.id); [ids[index], ids[index + delta]] = [ids[index + delta], ids[index]];
          submit({ type: 'reorder', ids });
        }}>{delta < 0 ? 'Move up' : 'Move down'}</button>)}
        <button disabled={busy} onClick={() => selectEmployee(row)}>Check access</button>
        <button disabled={busy} onClick={() => setConfirmDetach(row.id)}>Detach</button>
      </div>
      {check?.id === row.id && <div>
        <p>This checks access as the selected employee using your board authorization.</p>
        <label>Employee<select value={check.agentId} disabled={busy || check.loading} onChange={event => setCheck({ ...check, agentId: event.target.value })}>
          <option value="">Select an employee</option>{check.agents.map(agent => <option key={agent.id} value={agent.id}>{agent.name}</option>)}
        </select></label>
        <button disabled={busy || !check.agentId} onClick={() => submit(null, row.id, check.agentId)}>Verify selected employee</button>
        <button disabled={busy} onClick={() => { generation.current++; setCheck(null); }}>Cancel check</button>
        {!check.loading && !check.agents.length && <p>No eligible employees are available for this check.</p>}
      </div>}
      {confirmDetach === row.id && <div><p>Detach this reference from the project?</p><button disabled={busy} onClick={() => submit({ type: 'detach', id: row.id })}>Confirm detach</button><button disabled={busy} onClick={() => setConfirmDetach(null)}>Cancel</button></div>}
    </li>)}</ol>
    {!connections.length && <p>Set up a managed Figma connection in Paperclip Connectors to attach a design.</p>}
    <button disabled={busy || !connections.length} onClick={() => setDraft({ url: '', connectionId: connections[0]?.id, label: '', purpose: '' })}>Attach design</button>
    {draft && <form aria-label={draft.id ? 'Edit design' : 'Attach design'} onSubmit={event => { event.preventDefault(); submit({ type: draft.id ? 'update' : 'add', ...draft }); }}>
      <h3>{draft.id ? 'Edit design' : 'Attach design'}</h3>
      {!draft.id && <><label>Connection<select aria-label="Connection" value={draft.connectionId} disabled={busy} onChange={event => setDraft({ ...draft, connectionId: event.target.value })}>{connections.map(connection => <option key={connection.id} value={connection.id}>{connection.name}</option>)}</select></label>
        <label>Figma link<input aria-label="Figma link" autoFocus placeholder="https://www.figma.com/design/…" required type="url" maxLength={2048} value={draft.url} disabled={busy} onChange={event => setDraft({ ...draft, url: event.target.value })} /></label><p className="figma-help">Paste a Figma file or node link. Saving attaches a reference; it does not verify access.</p></>}
      <label>Label<input aria-label="Label" maxLength={200} value={draft.label} disabled={busy} onChange={event => setDraft({ ...draft, label: event.target.value })} /></label>
      <label>Purpose<textarea aria-label="Purpose" maxLength={1000} value={draft.purpose} disabled={busy} onChange={event => setDraft({ ...draft, purpose: event.target.value })} /></label>
      <div className="figma-actions"><button type="submit" disabled={busy}>Save</button><button type="button" disabled={busy} onClick={() => setDraft(null)}>Cancel</button></div>
    </form>}
  </section>;
}
