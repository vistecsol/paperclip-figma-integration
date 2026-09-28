// Run only in an owned, bounded Docker probe with --cgroupns=host and no mounts.
import fs from 'node:fs';
import path from 'node:path';
const read = p => fs.readFileSync(p, 'utf8').trim();
const root = '/sys/fs/cgroup';
const relative = read('/proc/self/cgroup').split('\n').find(l => l.startsWith('0::'))?.slice(3);
const rows = [];
let complete = Boolean(relative && relative !== '/' && !relative.split('/').includes('..'));
let current = complete ? path.join(root, relative) : root;
while (true) {
  const row = {path: current};
  for (const key of ['memory.max', 'memory.high', 'memory.current', 'memory.peak', 'memory.events', 'memory.swap.max', 'cpu.max', 'pids.max']) {
    try { row[key] = read(path.join(current, key)); } catch { /* Missing evidence fails closed below. */ }
  }
  rows.push(row);
  if (current === root) break;
  current = path.dirname(current);
}
const available = Number(read('/proc/meminfo').match(/MemAvailable:\s+(\d+)/)[1]) * 1024;
let headroom = available;
// The probe's own 64 MiB ceiling is excluded; every parent constrains the future sibling.
for (const row of rows.slice(1)) {
  if (row.path === root && row['memory.max'] === undefined) continue; // cgroup v2 root has no limit
  if (!row['memory.max'] || !row['memory.current']) complete = false;
  for (const key of ['memory.max', 'memory.high']) {
    if (/^\d+$/.test(row[key] ?? '')) headroom = Math.min(headroom, Math.max(0, Number(row[key]) - Number(row['memory.current'])));
  }
}
const disk = fs.statfsSync('/');
const diskFree = disk.bavail * disk.bsize;
// Explicit smoke workload selection; old 2048 MiB trial keeps its original gate.
const smoke = process.env.VTS_UI_SMOKE_1536 === '1';
const directIcons = process.env.VTS_UI_DIRECT_ICONS_1408 === '1';
const required = (directIcons ? 2752 : smoke ? 2816 : 3328) * 1024 ** 2;
const reasons = [];
if (!complete) reasons.push('Daemon ancestor hierarchy not fully visible; no launch authorization');
if (headroom < required) reasons.push('Insufficient host/ancestor memory headroom');
if (diskFree < 2 * 1024 ** 3) reasons.push('Disk stop reserve breached');
console.log(JSON.stringify({time: new Date().toISOString(), relative, completeAncestorEvidence: complete, memAvailableBytes: available, effectiveHeadroomBytes: headroom, requiredHeadroomBytes: required, shortfallBytes: Math.max(0, required-headroom), diskFreeBytes: diskFree, diskStopReserveBytes: 2*1024**3, cgroups: rows, decision: reasons.length ? 'skip-heavy-run' : 'capacity-observation-only', reasons}, null, 2));
