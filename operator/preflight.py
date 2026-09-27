#!/usr/bin/env python3
"""Read-only capacity evidence; run on hermes01 itself before an approved launch."""
import argparse, json, os, pathlib, shutil, time
def evaluate(headroom, disk, inside_container, limit_gib, reserve_gib, disk_budget_gib, disk_reserve_gib):
    if min(limit_gib, reserve_gib, disk_budget_gib, disk_reserve_gib) < 1 or disk_budget_gib <= disk_reserve_gib:
        raise ValueError('positive budgets required; disk budget must exceed disk reserve')
    reasons = []
    if inside_container: reasons.append('inside-container: host headroom and sibling cgroups not established')
    if headroom < (limit_gib + reserve_gib) * 1024**3: reasons.append('insufficient memory headroom for limit plus reserve')
    if disk < disk_budget_gib * 1024**3: reasons.append('insufficient free disk for explicit stage budget')
    return reasons


def main():
    p = argparse.ArgumentParser()
    p.add_argument('--phase', choices=['build', 'runtime', 'compiler'], required=True)
    p.add_argument('--limit-gib', type=int, required=True)
    p.add_argument('--reserve-gib', type=int, required=True)
    p.add_argument('--disk-budget-gib', type=int, required=True)
    p.add_argument('--disk-reserve-gib', type=int, required=True)
    p.add_argument('--disk-path', required=True)
    a = p.parse_args()
    try: evaluate(0, 0, False, a.limit_gib, a.reserve_gib, a.disk_budget_gib, a.disk_reserve_gib)
    except ValueError as error: p.error(str(error))
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
        for name in ['memory.max', 'memory.high', 'memory.current', 'memory.swap.max', 'memory.events']:
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
        for key in ('memory.max', 'memory.high'):
            maximum, used = row.get(key, 'max'), row.get('memory.current', '0')
            if maximum.isdigit() and used.isdigit(): headroom = min(headroom, max(0, int(maximum)-int(used)))
    disk = shutil.disk_usage(a.disk_path).free
    reasons = evaluate(headroom, disk, pathlib.Path('/.dockerenv').exists(), a.limit_gib, a.reserve_gib, a.disk_budget_gib, a.disk_reserve_gib)
    if not all('memory.max' in row and 'memory.current' in row for row in cgroups):
        reasons.append('incomplete cgroup-v2 ancestor evidence')
    print(json.dumps({'time': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()), 'phase': a.phase,
        'proposedLimitBytes': a.limit_gib*gib, 'reserveBytes': a.reserve_gib*gib,
        'memAvailableBytes': mem['MemAvailable'], 'effectiveVisibleHeadroomBytes': headroom,
        'diskFreeBytes': disk, 'diskPath': str(pathlib.Path(a.disk_path).resolve()),
        'diskBudgetBytes': a.disk_budget_gib*gib, 'diskStopReserveBytes': a.disk_reserve_gib*gib, 'visibleCgroups': cgroups, 'processes': compilers,
        'decision': 'stop' if reasons else 'capacity-observation-only-not-launch-authorization', 'reasons': reasons}, indent=2))
    raise SystemExit(1 if reasons else 0)

if __name__ == '__main__': main()
