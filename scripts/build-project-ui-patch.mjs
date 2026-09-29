import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
const host = process.argv[2] ?? '/app';
const scratch = process.env.PAPERCLIP_RUN_SCRATCH_DIR;
if (!scratch) throw new Error('Run scratch required');
const baseline = JSON.parse(readFileSync('host-prerequisite/project-ui-baseline.json'));
let patch = '';
for (const [i, file] of baseline.files.entries()) {
 const original = readFileSync(join(host, file.path), 'utf8');
 if (createHash('sha256').update(original).digest('hex') !== file.sha256) throw new Error(`Source drift: ${file.path}`);
 let updated = original;
 const replace = (anchor, value) => { if (updated.split(anchor).length !== 2) throw new Error(`Ambiguous anchor in ${file.path}`); updated = updated.replace(anchor, value); };
 if (file.path.endsWith('NewProjectDialog.tsx')) {
  updated = 'import { FigmaDesignEditor, saveCreatedDesigns, type DesignDraft } from "./FigmaDesignEditor";\n' + updated;
  replace('  const [connecting, setConnecting] = useState(false);', '  const [connecting, setConnecting] = useState(false);\n  const [designs, setDesigns] = useState<DesignDraft[]>([]);\n  const createdProject = useRef<Awaited<ReturnType<typeof projectsApi.create>> | null>(null);');
  replace('    mutationFn: () => projectsApi.create(companyId, { name: name.trim(), status: "planned", repositoryIds: repos.map((repo) => repo.id) }),', `    mutationFn: async () => {
      const project = createdProject.current ?? await projectsApi.create(companyId, { name: name.trim(), status: "planned", repositoryIds: repos.map((repo) => repo.id) });
      createdProject.current = project;
      void client.invalidateQueries({ queryKey: queryKeys.projects.all(companyId) });
      if (designs.length) {
        try { await saveCreatedDesigns(companyId, project.id, designs); }
        catch (error) { throw new Error('Project created; some designs may not be saved. Retry design save here, or close and use Project Configuration. ' + (error instanceof Error ? error.message : '')); }
      }
      return project;
    },`);
  replace('disabled={create.isPending} onChange={(event) => setName', 'disabled={create.isPending || !!createdProject.current} onChange={(event) => setName');
  replace('disabled={create.isPending} />\n        </div>', 'disabled={create.isPending || !!createdProject.current} />\n          <FigmaDesignEditor companyId={companyId} selected={designs} onChange={setDesigns} disabled={create.isPending || !!createdProject.current} />\n        </div>');
  replace('{create.isPending ? "Creating…" : "Create project"}', '{create.isPending ? "Saving…" : createdProject.current ? "Retry design save" : "Create project"}');
 } else if (file.path.endsWith('ConnectionSetupFlow.tsx')) {
  replace('  if (!sourceSlug) return null;', `  // Figma setup must never silently adopt a different saved identity.
  // Explicit resume/reconnect is resolved separately and remains server-authorized.
  if (!sourceSlug || sourceSlug === "figma") return null;`);
  replace('  const identityConnection = resumeConnection ?? reconnectConnection;', `  const identityConnection = resumeConnection ?? reconnectConnection;
  // Display only the explicitly selected, native-fetched identity. Never a draft fallback.
  const selectedSetupIdentity = selectedFigmaSetupIdentity(identityConnection);`);
  replace('export type ConnectionSetupCompletion', `type SelectedSetupIdentity = { name: string; audience: string };
function selectedFigmaSetupIdentity(connection: ToolConnection | null): SelectedSetupIdentity | undefined {
  if (!connection || connection.config?.sourceTemplateKey !== "figma") return undefined;
  const audience = connection.credentialPolicy === "shared" ? "Any human in the company"
    : connection.credentialPolicy === "per_user" ? "Just me"
    : connection.credentialPolicy === "per_agent" ? "A dedicated account for an agent"
    : "Unknown audience";
  return { name: connection.name, audience };
}

export type ConnectionSetupCompletion`);
  replace('        entry={automaticOAuthEntry}', '        entry={automaticOAuthEntry}\n        selectedSetupIdentity={selectedSetupIdentity}');
  replace('        identity={{', '        selectedSetupIdentity={selectedSetupIdentity}\n        identity={{');
  replace('          <StepHeader\n            subtitle={', '          <StepHeader\n            selectedSetupIdentity={selectedSetupIdentity}\n            subtitle={');
  replace('  appIdentity,\n  unverifiedHost,', '  appIdentity,\n  selectedSetupIdentity,\n  unverifiedHost,');
  replace('  appIdentity?: { name: string; logoUrl: string | null; darkLogoUrl?: string | null };', '  appIdentity?: { name: string; logoUrl: string | null; darkLogoUrl?: string | null };\n  selectedSetupIdentity?: SelectedSetupIdentity;');
  replace('            <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>', `            <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
            {selectedSetupIdentity ? (
              <div className="mt-2 text-sm" aria-label="Selected connection">
                <p className="font-medium break-words">{selectedSetupIdentity.name}</p>
                <p className="text-muted-foreground">{selectedSetupIdentity.audience}</p>
              </div>
            ) : null}`);
  replace('  identity,\n  resuming = false,', '  identity,\n  selectedSetupIdentity,\n  resuming = false,');
  replace('  identity?: { name: string; unverifiedHost: string | null };', '  identity?: { name: string; unverifiedHost: string | null };\n  selectedSetupIdentity?: SelectedSetupIdentity;');
  replace('        subtitle="Secure MCP sign-in"', '        selectedSetupIdentity={selectedSetupIdentity}\n        subtitle="Secure MCP sign-in"');
 } else {
  updated = 'import { ProjectFigmaDesigns } from "./FigmaDesignEditor";\n' + updated;
  const anchor = '        {repositories ?? <ProjectRepositories key={project.id} project={project} />}';
  replace(anchor, anchor + '\n        <ProjectFigmaDesigns key={`${project.companyId}:${project.id}`} companyId={project.companyId} projectId={project.id} />');
 }
 const before = join(scratch, `project-ui-before-${i}`), after = join(scratch, `project-ui-after-${i}`);
 writeFileSync(before, original); writeFileSync(after, updated);
 const result = spawnSync('diff', ['-u', '--label', `a/${file.path}`, '--label', `b/${file.path}`, before, after], { encoding: 'utf8' });
 if (![0, 1].includes(result.status)) throw new Error('Diff failed');
 patch += result.stdout.replace(/^ $/gm, '');
}
writeFileSync('host-prerequisite/figma-project-ui.patch', patch);
