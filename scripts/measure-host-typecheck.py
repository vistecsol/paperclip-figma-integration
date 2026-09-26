"""One foreground compiler attempt; no limit changes or automatic retries.

Usage: python3 scripts/measure-host-typecheck.py PREPARED_HOST EVIDENCE_JSON
Only process names and RSS are recorded; command arguments/environment are not.
"""
import json
import os
from pathlib import Path
import resource
import subprocess
import sys
import time


def snapshot():
    available = next(int(line.split()[1]) * 1024 for line in Path('/proc/meminfo').read_text().splitlines() if line.startswith('MemAvailable:'))
    relative = next(line.split(':', 2)[2] for line in Path('/proc/self/cgroup').read_text().splitlines() if line.startswith('0::'))
    root = Path('/sys/fs/cgroup')
    current = root / relative.lstrip('/')
    groups = []
    while current == root or root in current.parents:
        item = {'path': str(current)}
        for key in ('memory.current', 'memory.max', 'memory.high', 'memory.events'):
            path = current / key
            if path.exists():
                item[key] = path.read_text().strip()
        groups.append(item)
        if current == root:
            break
        current = current.parent
    processes = []
    for proc in Path('/proc').iterdir():
        if not proc.name.isdigit() or int(proc.name) == os.getpid():
            continue
        try:
            status = dict(line.split(':', 1) for line in (proc / 'status').read_text().splitlines() if ':' in line)
            # Inspect arguments only to classify compilers; never retain them.
            args = (proc / 'cmdline').read_bytes().split(b'\0')
            compiler = any(Path(arg.decode(errors='replace')).name in ('tsc', 'tsc.js', 'tsserver.js', 'esbuild', 'vitest') for arg in args)
            if compiler:
                processes.append({'pid': int(proc.name), 'name': status['Name'].strip(), 'rssKiB': int(status.get('VmRSS', '0 kB').split()[0])})
        except (OSError, ValueError):
            pass
    headroom = available
    for group in groups:
        for limit in ('memory.max', 'memory.high'):
            value = group.get(limit, 'max')
            if value != 'max':
                headroom = min(headroom, max(0, int(value) - int(group.get('memory.current', 0))))
    return {'memAvailableBytes': available, 'visibleCgroupAncestors': groups,
            'ancestorVisibilityLimit': 'Only ancestors exposed by this cgroup namespace can be inspected.',
            'compilerProcesses': processes, 'effectiveVisibleHeadroomBytes': headroom}


host, destination = Path(sys.argv[1]).resolve(), Path(sys.argv[2]).resolve()
if destination.exists():
    raise SystemExit('Evidence exists; refusing an accidental repeated attempt')
record = {'before': snapshot(), 'host': str(host), 'heapMiB': 2048}
launcher = host / 'node_modules/typescript/lib/tsc.js'
native = launcher.exists() and ('#getExePath' in launcher.read_text() or 'process.execve' in launcher.read_text())
record['nativeCompilerLauncher'] = native
if native:
    record['result'] = 'skipped_native_compiler_not_bounded_by_node_heap'
elif record['before']['effectiveVisibleHeadroomBytes'] < 3 * 1024 ** 3 or sum(p['rssKiB'] for p in record['before']['compilerProcesses']) > 128 * 1024:
    record['result'] = 'skipped_insufficient_headroom_or_competing_compiler'
else:
    command = ['node', '--max-old-space-size=2048', str(host / 'node_modules/typescript/bin/tsc'), '--noEmit', '-p', str(host / 'server/tsconfig.json')]
    record['command'] = command
    start = time.monotonic()
    # Do not inherit an unbounded or larger NODE_OPTIONS heap setting.
    env = dict(os.environ)
    env.pop('NODE_OPTIONS', None)
    log = destination.with_suffix('.log')
    with log.open('w') as output:
        process = subprocess.run(command, env=env, stdout=output, stderr=subprocess.STDOUT)
    record.update(result='passed' if process.returncode == 0 else 'failed', exitCode=process.returncode if process.returncode >= 0 else None,
                  signal=-process.returncode if process.returncode < 0 else None, elapsedSeconds=round(time.monotonic()-start, 3),
                  peakChildRssKiB=resource.getrusage(resource.RUSAGE_CHILDREN).ru_maxrss, diagnosticsFile=str(log))
record['after'] = snapshot()
destination.write_text(json.dumps(record, indent=2) + '\n')
print(json.dumps(record, indent=2))
