#!/usr/bin/env python3
"""Read-only capacity evidence; run on hermes01 itself before an approved launch."""
import argparse, json, os, pathlib, shutil, time
p = argparse.ArgumentParser()
p.add_argument('--phase', choices=['build', 'runtime'], required=True)
p.add_argument('--limit-gib', type=int, required=True)
p.add_argument('--reserve-gib', type=int, default=2)
p.add_argument('--disk-path', default='.')
a = p.parse_args()
if a.limit_gib < 1 or a.reserve_gib < 1: p.error('positive limits/reserve required')
gib = 1024 ** 3
mem = {line.split(':')[0]: int(line.split()[1])*1024 for line in pathlib.Path('/proc/meminfo').read_text().splitlines() if line.split()[1].isdigit()}
cgroups = []
# Report visible v2 limits, including ancestors; host placement still must be verified.
root = pathlib.Path('/sys/fs/cgroup')
relative = next((line.split(':', 2)[2] for line in pathlib.Path('/proc/self/cgroup').read_text().splitlines() if line.startswith('0::')), '/')
parts = [part for part in relative.split('/') if part not in ('', '.', '..')]
current = root.joinpath(*parts)
if not current.exists(): current = root
while True:
    row = {'path': str(current)}
    for name in ['memory.max', 'memory.current', 'memory.swap.max', 'memory.events']:
        f = current/name
        if f.exists(): row[name] = f.read_text().strip()
    cgroups.append(row)
    if current == root: break
    current = current.parent
compilers = []
for path in pathlib.Path('/proc').glob('[0-9]*'):
    try:
        name = (path/'comm').read_text().strip()
        if name in ['tsgo', 'tsc', 'rustc', 'cargo', 'cc1', 'esbuild', 'node']:
            status = (path/'status').read_text().splitlines()
            rss = next((int(line.split()[1])*1024 for line in status if line.startswith('VmRSS:')), 0)
            compilers.append({'pid': int(path.name), 'name': name, 'rssBytes': rss})
    except (OSError, ValueError): pass
headroom = mem['MemAvailable']
for row in cgroups:
    maximum, used = row.get('memory.max', 'max'), row.get('memory.current', '0')
    if maximum.isdigit() and used.isdigit(): headroom = min(headroom, max(0, int(maximum)-int(used)))
disk = shutil.disk_usage(a.disk_path).free
reasons = []
if pathlib.Path('/.dockerenv').exists(): reasons.append('inside-container: host headroom and sibling cgroups not established')
if headroom < (a.limit_gib+a.reserve_gib)*gib: reasons.append('insufficient memory headroom for limit plus reserve')
if disk < 30*gib: reasons.append('less than 30 GiB free disk; operator must resolve storage budget')
if a.phase == 'build' and a.limit_gib < 8: reasons.append('build ceiling below proposed 8 GiB native-compiler budget')
print(json.dumps({'time': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()), 'phase': a.phase,
    'proposedLimitBytes': a.limit_gib*gib, 'reserveBytes': a.reserve_gib*gib,
    'memAvailableBytes': mem['MemAvailable'], 'effectiveVisibleHeadroomBytes': headroom,
    'diskFreeBytes': disk, 'visibleCgroups': cgroups, 'processes': compilers,
    'decision': 'stop' if reasons else 'capacity-observation-only-not-launch-authorization', 'reasons': reasons}, indent=2))
raise SystemExit(1 if reasons else 0)
