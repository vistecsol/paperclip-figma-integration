import { useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, X, Figma } from "lucide-react";
import { Button } from "./ui/button";
import { ConnectionSetupFlow } from "@/features/connections/ConnectionSetupFlow";
import { Dialog, DialogContent, DialogTitle } from "./ui/dialog";
import { api } from "../api/client";
import { pluginsApi } from "../api/plugins";

export type DesignDraft = { id?: string; connectionId: string; url: string; label: string; purpose: string; primary?: boolean; verification?: { state: string } };
type Snapshot = { revision: number; attachments: DesignDraft[]; connections: { id: string; name: string }[] };
export function normalizeFigmaLink(value: string) {
  const url = new URL(value);
  const match = /^\/(?:design|file)\/([a-zA-Z0-9]{1,128})(?:\/[^/]*)?\/?$/.exec(url.pathname);
  const node = url.searchParams.get("node-id");
  if (value.length > 2048 || url.protocol !== "https:" || !["figma.com", "www.figma.com"].includes(url.hostname) || url.username || url.password || url.port || !match || url.searchParams.getAll("node-id").length > 1 || (node !== null && !/^\d{1,20}[:-]\d{1,20}$/.test(node))) throw new Error("Use a Figma file or design link with an optional node.");
  return `https://www.figma.com/design/${match[1]}${node === null ? "" : `?node-id=${node.split(/[:-]/).map(n => BigInt(n).toString()).join("-")}`}`;
}
async function designCall(companyId: string, projectId: string, command?: Record<string, unknown>): Promise<Snapshot> {
  const plugin = (await pluginsApi.listUiContributions()).find(row => row.pluginKey === "vistecsol.figma");
  if (!plugin) throw new Error("Figma integration is unavailable. Your project and source repos are preserved.");
  const response = command
    ? await pluginsApi.bridgePerformAction(plugin.pluginId, "designs.mutate", { projectId, command }, companyId)
    : await pluginsApi.bridgeGetData(plugin.pluginId, "designs.list", { projectId }, companyId);
  const result = response.data as { status: number; body: Snapshot & { error?: string } };
  if (result?.status !== 200) throw new Error(result?.body?.error === "stale_revision" ? "Designs changed. Reload before saving again." : `Unable to save designs (${result?.body?.error ?? "unavailable"}). Reload to review saved links.`);
  return result.body;
}
export const readProjectDesigns = (companyId: string, projectId: string) => designCall(companyId, projectId);
// Creation retries reuse the created project and reconcile successful earlier adds.
export async function saveCreatedDesigns(companyId: string, projectId: string, drafts: DesignDraft[]) {
  let snapshot = await readProjectDesigns(companyId, projectId);
  for (const draft of drafts) {
    const url = normalizeFigmaLink(draft.url);
    let row = snapshot.attachments.find(item => item.connectionId === draft.connectionId && item.url === url);
    if (!row) {
      snapshot = await designCall(companyId, projectId, { type: "add", connectionId: draft.connectionId, url, label: draft.label, purpose: draft.purpose, expectedRevision: snapshot.revision });
      row = snapshot.attachments.find(item => item.connectionId === draft.connectionId && item.url === url);
    }
    if (draft.primary && row && !row.primary) snapshot = await designCall(companyId, projectId, { type: "primary", id: row.id, expectedRevision: snapshot.revision });
  }
  return snapshot;
}

export function FigmaDesignEditor({ companyId, selected, onChange, disabled = false }: { companyId: string; selected: DesignDraft[]; onChange: (rows: DesignDraft[]) => void; disabled?: boolean }) {
  const [adding, setAdding] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [draft, setDraft] = useState<DesignDraft>({ connectionId: "", url: "", label: "", purpose: "" });
  const [error, setError] = useState("");
  const connections = useQuery({ queryKey: ["figma-design-connections", companyId], queryFn: async () => {
    const result = await api.get<{ connections: { id: string; name: string; enabled: boolean; transport: string; authKind: string; config: Record<string, unknown>; credentialRefs?: { placement: string }[] }[] }>(`/companies/${companyId}/tools/connections`);
    return result.connections.filter(row => row.enabled && row.transport === "mcp_remote" && row.authKind === "oauth" && (row.config.url ?? row.config.endpoint ?? row.config.remoteUrl) === "https://mcp.figma.com/mcp" && !row.credentialRefs?.some(ref => ref.placement === "url"));
  } });
  function add() {
    try {
      const url = normalizeFigmaLink(draft.url);
      if (!draft.connectionId) throw new Error("Choose a managed Figma connection.");
      if (selected.some(row => row.connectionId === draft.connectionId && normalizeFigmaLink(row.url) === url)) throw new Error("This design is already selected.");
      onChange([...selected, { ...draft, url }]); setAdding(false); setError(""); setDraft({ connectionId: "", url: "", label: "", purpose: "" });
    } catch (error) { setError(error instanceof Error ? error.message : "Check the Figma link."); }
  }
  return <fieldset disabled={disabled} className="flex min-w-0 flex-col gap-3 py-4">
    <div className="flex items-baseline gap-2"><span className="text-sm font-medium">Figma designs</span><span className="text-xs text-muted-foreground">optional</span></div>
    {selected.map((row, index) => <div key={row.id ?? `${row.connectionId}:${row.url}`} className="flex min-w-0 flex-col gap-2 rounded-md border border-border px-3 py-2">
      <div className="flex items-center gap-3"><Figma className="size-4 shrink-0 text-muted-foreground" /><a className="min-w-0 flex-1 truncate text-sm font-medium" href={row.url} target="_blank" rel="noopener noreferrer">{row.label || row.url}</a><Button type="button" variant="ghost" size="icon-sm" aria-label={`Detach ${row.label || row.url}`} onClick={() => onChange(selected.filter((_, i) => i !== index))}><X className="size-4" /></Button></div>
      <label className="text-xs">Label<input className="block w-full rounded border px-2 py-1" maxLength={200} value={row.label} onChange={event => onChange(selected.map((item, i) => i === index ? { ...item, label: event.target.value } : item))} /></label>
      <label className="text-xs">Purpose<input className="block w-full rounded border px-2 py-1" maxLength={1000} value={row.purpose} onChange={event => onChange(selected.map((item, i) => i === index ? { ...item, purpose: event.target.value } : item))} /></label>
      <label className="text-xs"><input type="checkbox" checked={!!row.primary} onChange={event => onChange(selected.map((item, i) => ({ ...item, primary: i === index && event.target.checked })))} /> Primary design system</label>
      <span className="text-xs text-muted-foreground">{row.verification?.state ?? "unverified"} · Detaching removes only the project link.</span>
      <div>{[-1, 1].map(delta => <Button key={delta} type="button" variant="ghost" size="sm" disabled={index + delta < 0 || index + delta >= selected.length} onClick={() => { const rows = [...selected]; [rows[index], rows[index + delta]] = [rows[index + delta], rows[index]]; onChange(rows); }}>{delta < 0 ? "Move up" : "Move down"}</Button>)}</div>
    </div>)}
    {adding ? <div className="flex flex-col gap-2 rounded-md border p-3">
      <label>Connection<select aria-label="Figma connection" className="block w-full rounded border p-2" value={draft.connectionId} onChange={event => setDraft({ ...draft, connectionId: event.target.value })}><option value="">Select a connection</option>{connections.data?.map(row => <option key={row.id} value={row.id}>{row.name}</option>)}</select></label>
      <label>Figma link<input className="block w-full rounded border p-2" type="url" maxLength={2048} value={draft.url} onChange={event => setDraft({ ...draft, url: event.target.value })} /></label>
      <p className="text-xs text-muted-foreground">Paste a file or node link. Saving does not verify Figma access.</p>
      {error && <p role="alert">{error}</p>}
      <div><Button type="button" onClick={add}>Add design</Button><Button type="button" variant="ghost" onClick={() => setAdding(false)}>Cancel</Button></div>
    </div> : <Button type="button" variant="outline" className={selected.length ? "self-start" : "h-24 w-full flex-col gap-2"} onClick={() => setAdding(true)}><Plus className="size-4" />Add Figma design</Button>}
    {connections.isError && <Button type="button" variant="ghost" onClick={() => void connections.refetch()}>Retry connections</Button>}
    <Button type="button" variant="ghost" className="self-start" onClick={() => setConnecting(true)}>Connect Figma</Button>
    <Dialog open={connecting} onOpenChange={setConnecting}><DialogContent aria-describedby={undefined}><DialogTitle>Connect Figma</DialogTitle><ConnectionSetupFlow host="dialog" serviceSlug="figma" forceNewConnection onCancel={() => setConnecting(false)} onComplete={() => { void connections.refetch(); setConnecting(false); }} /></DialogContent></Dialog>
  </fieldset>;
}

export function ProjectFigmaDesigns({ companyId, projectId }: { companyId: string; projectId: string }) {
  const query = useQuery({ queryKey: ["project-figma-designs", companyId, projectId], queryFn: () => readProjectDesigns(companyId, projectId) });
  const [draft, setDraft] = useState<DesignDraft[] | null>(null);
  const base = useRef<Snapshot | null>(null);
  const saving = useRef(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  async function save() {
    if (!draft || !base.current || saving.current) return;
    saving.current = true;
    setBusy(true); setMessage("");
    try {
      let snapshot = base.current;
      const apply = async (command: Record<string, unknown>) => { snapshot = await designCall(companyId, projectId, { ...command, expectedRevision: snapshot.revision }); };
      for (const row of snapshot.attachments) if (!draft.some(item => item.id === row.id)) await apply({ type: "detach", id: row.id });
      const ids: string[] = [];
      for (const row of draft) {
        if (row.id) { const saved = snapshot.attachments.find(item => item.id === row.id); if (saved?.label !== row.label || saved?.purpose !== row.purpose) await apply({ type: "update", id: row.id, label: row.label, purpose: row.purpose }); ids.push(row.id); }
        else { await apply({ type: "add", connectionId: row.connectionId, url: row.url, label: row.label, purpose: row.purpose }); ids.push(snapshot.attachments[snapshot.attachments.length - 1].id!); }
      }
      if (snapshot.attachments.some((row, i) => row.id !== ids[i])) await apply({ type: "reorder", ids });
      const primary = ids[draft.findIndex(row => row.primary)] ?? null;
      if ((snapshot.attachments.find(row => row.primary)?.id ?? null) !== primary) await apply({ type: "primary", id: primary });
      base.current = null; setDraft(null); setMessage("Changes saved"); await query.refetch();
    } catch (error) { setMessage(`${error instanceof Error ? error.message : "Save failed"} Some changes may have saved. Reload designs to continue.`); }
    finally { saving.current = false; setBusy(false); }
  }
  return <section aria-label="Figma designs">
    {query.data && <FigmaDesignEditor companyId={companyId} selected={draft ?? query.data.attachments} onChange={rows => { if (!base.current) base.current = query.data; setDraft(rows); }} disabled={busy} />}
    {query.isLoading && <p role="status">Loading designs…</p>}
    {(query.isError || message) && <p role="status">{message || "Designs are unavailable. Source repos are unchanged."}</p>}
    <div className="flex justify-end gap-2"><Button type="button" variant="ghost" disabled={busy} onClick={() => { base.current = null; setDraft(null); setMessage(""); void query.refetch(); }}>Reload designs</Button><Button type="button" disabled={busy || !draft || !!message && message !== "Changes saved"} onClick={() => void save()}>Save designs</Button></div>
  </section>;
}
