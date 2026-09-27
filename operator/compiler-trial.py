#!/usr/bin/env python3
"""Host-side one-shot trial. No image pull/build, host mounts, or automatic cleanup."""
import argparse
import hashlib
import json
import os
from pathlib import Path
import re
import subprocess
import sys
import time

HOST = 'd554c4789ed3930f8a53ac9fdf6503b3187097da'
ISSUE = 'afd637b1-d3bc-42eb-a253-e2646555c3ba'
LABEL = 'vts.figma.issue'
GIB = 1024**3
COMMAND = ['pnpm', 'exec', 'tsc', '--singleThreaded', '--noEmit', '-p', 'server/tsconfig.json']
# Fail closed inside the *test* container before invoking native descendants.
INNER = r'''set -eu
[ "$(cat /sys/fs/cgroup/memory.max)" = 4294967296 ]
[ "$(cat /sys/fs/cgroup/memory.swap.max)" = 0 ]
[ "$(cat /sys/fs/cgroup/cpu.max)" = '100000 100000' ]
[ "$(cat /sys/fs/cgroup/pids.max)" = 256 ]
printf 'containment-verified\n'
cat /sys/fs/cgroup/memory.events
set +e
pnpm exec tsc --singleThreaded --noEmit -p server/tsconfig.json
result=$?
set -e
cat /sys/fs/cgroup/memory.peak /sys/fs/cgroup/memory.events
exit "$result"
'''


def docker(*args):
    return subprocess.check_output(['docker', *args], text=True, timeout=30).strip()


def create_args(image, name, run):
    return ['create', '--name', name, '--label', LABEL+'='+ISSUE,
            '--label', 'vts.figma.run='+run, '--network', 'none',
            '--memory', '4g', '--memory-swap', '4g', '--cpu-period', '100000',
            '--cpu-quota', '100000', '--pids-limit', '256', '--cap-drop', 'ALL',
            '--security-opt', 'no-new-privileges', '--workdir', '/work',
            '--env', 'GOMAXPROCS=1', '--env', 'GOGC=50', '--env', 'GOMEMLIMIT=3GiB',
            '--env', 'NODE_OPTIONS=', '--entrypoint', '/bin/sh', image, '-c', INNER]


def owned(info, name, run):
    labels = info['Config'].get('Labels') or {}
    return (info['Name'] == '/'+name and labels.get(LABEL) == ISSUE
            and labels.get('vts.figma.run') == run)


def validate_image(info, receipt, image):
    if not re.fullmatch(r'sha256:[a-f0-9]{64}', image) or info['Id'] != image:
        raise ValueError('immutable local image ID required')
    if info['Config'].get('Volumes'):
        raise ValueError('image-declared volumes are forbidden')
    if receipt.get('imageId') != image or receipt.get('hostCommit') != HOST:
        raise ValueError('prepared image provenance mismatch')
    for field in ('integrationCommit', 'lockfileSha256'):
        if not re.fullmatch('[a-f0-9]{'+('40' if field == 'integrationCommit' else '64')+'}', receipt.get(field, '')):
            raise ValueError('missing exact '+field)
    for stage in ('frozenInstall', 'runnerVendorPreparation', 'sdkBuildDependencies'):
        if receipt.get(stage) != 'passed': raise ValueError('unpassed prerequisite: '+stage)


def run(a):
    # Exclusive evidence directory doubles as an attempt latch. Never reuse it.
    a.evidence.mkdir(mode=0o700)
    record = {'hostCommit': HOST, 'imageId': a.image, 'command': COMMAND,
              'result': 'refused', 'attemptedCompiler': False}
    def save():
        (a.evidence/'result.json').write_text(json.dumps(record, indent=2)+'\n')
    save()
    try:
        if not re.fullmatch('vts-figma-test-[a-z0-9-]+', a.name):
            raise ValueError('test namespace required')
        # No Docker access at all until local host-side capacity passes.
        preflight = subprocess.run([sys.executable, str(Path(__file__).with_name('preflight.py')),
            '--phase', 'compiler', '--limit-gib', '4', '--reserve-gib', '2',
            '--disk-budget-gib', '12', '--disk-reserve-gib', '2',
            '--disk-path', str(a.daemon_storage)], capture_output=True, text=True)
        (a.evidence/'preflight.json').write_text(preflight.stdout)
        if preflight.returncode: raise ValueError('capacity preflight refused; no Docker operation performed')
        info = json.loads(docker('info', '--format', '{{json .}}'))
        if info.get('CgroupVersion') != '2' or not any('rootless' in x for x in info.get('SecurityOptions', [])):
            raise ValueError('rootless cgroup-v2 daemon required')
        endpoint = json.loads(docker('context', 'inspect'))[0]['Endpoints']['docker']['Host']
        endpoint = os.environ.get('DOCKER_HOST', endpoint)
        if not endpoint.startswith('unix://'): raise ValueError('host-local daemon required for capacity evidence')
        if Path(info['DockerRootDir']).resolve() != a.daemon_storage.resolve():
            raise ValueError('disk path must be the actual local daemon storage root')
        receipt = json.loads(a.receipt.read_text())
        validate_image(json.loads(docker('image', 'inspect', a.image))[0], receipt, a.image)
        record['preparationReceiptSha256'] = hashlib.sha256(a.receipt.read_bytes()).hexdigest()
        record['preparation'] = {k: receipt[k] for k in ('imageId', 'hostCommit', 'integrationCommit', 'lockfileSha256', 'frozenInstall', 'runnerVendorPreparation', 'sdkBuildDependencies')}
        # Existing names (even tests) are never adopted, restarted or removed.
        existing = docker('container', 'ls', '-a', '--filter', 'name=^/'+a.name+'$', '--format', '{{.ID}}')
        if existing: raise ValueError('test name already exists')
        cid = docker(*create_args(a.image, a.name, a.run_id))
        if not re.fullmatch('[a-f0-9]{64}', cid): raise ValueError('invalid created container ID')
        record['containerId'] = cid
        save()
        inspect = json.loads(docker('container', 'inspect', cid))[0]
        config = inspect['HostConfig']
        if not owned(inspect, a.name, a.run_id) or inspect['Mounts'] or config['NetworkMode'] != 'none':
            raise ValueError('test ownership/isolation check failed; container retained unstarted')
        if (config['Memory'], config['MemorySwap'], config['CpuQuota'], config['CpuPeriod'], config['PidsLimit']) != (4*GIB, 4*GIB, 100000, 100000, 256):
            raise ValueError('configured containment mismatch; container retained unstarted')
        record['limits'] = {k: config[k] for k in ('Memory', 'MemorySwap', 'CpuQuota', 'CpuPeriod', 'PidsLimit')}
        record['result'] = 'started'
        save()
        start = time.monotonic()
        with (a.evidence/'compiler.log').open('x') as log:
            process = subprocess.Popen(['docker', 'start', '-a', cid], stdout=log, stderr=subprocess.STDOUT)
            try: process.wait(timeout=900)
            except subprocess.TimeoutExpired:
                # Revalidate exact ownership before touching a running test resource.
                if not owned(json.loads(docker('container', 'inspect', cid))[0], a.name, a.run_id):
                    raise ValueError('ownership changed; refusing timeout stop')
                docker('container', 'stop', '--time', '5', cid)
                process.wait(timeout=30)
                record['timedOut'] = True
        state = json.loads(docker('container', 'inspect', cid))[0]['State']
        record.update(elapsedSeconds=round(time.monotonic()-start, 3), state=state)
        record['attemptedCompiler'] = 'containment-verified' in (a.evidence/'compiler.log').read_text()
        record['result'] = 'passed' if state['ExitCode'] == 0 and record['attemptedCompiler'] and not record.get('timedOut') else 'failed'
    except (ValueError, OSError, subprocess.SubprocessError, KeyError) as error:
        record['reason'] = str(error)
        record['result'] = 'failed' if record.get('containerId') else 'refused'
    finally:
        save()
    return 0 if record['result'] == 'passed' else 1


if __name__ == '__main__':
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument('--image', required=True)
    p.add_argument('--receipt', type=Path, required=True)
    p.add_argument('--daemon-storage', type=Path, required=True)
    p.add_argument('--name', required=True)
    p.add_argument('--run-id', required=True)
    p.add_argument('--evidence', type=Path, required=True)
    sys.exit(run(p.parse_args()))
