"""Exercise actual session cleanup and watchdog with an offline Docker executable."""
import json, os, pathlib, subprocess, tempfile
root = pathlib.Path(__file__).resolve().parents[1]
source = (root / 'operator/run-selector-lifecycle-session.sh').read_text()
own = source[source.index('own(){'):source.index('\nwindow(){')]
cleanup = source[source.index('cleanup(){'):source.index('\ntrap cleanup EXIT')]
watch = source[source.index('(\n while sleep 2;'):source.index(') & watch=$!')] + ')'
with tempfile.TemporaryDirectory(dir=os.environ.get('PAPERCLIP_RUN_SCRATCH_DIR')) as tmp:
 p = pathlib.Path(tmp)
 (p/'docker').write_text("""#!/usr/bin/env python3
import os,sys,json,pathlib
a=sys.argv[1:];bad=os.environ['BAD'];r=os.environ['RUN'];role=os.environ['ROLE'];c='a'*64;n='d'*64
with open('trace','a') as f:f.write(json.dumps(a)+'\\n')
if a[0]=='inspect':
 if pathlib.Path('removed').exists():sys.exit(1)
 if len(a)==2:sys.exit(0)
 fmt=a[2]
 if bad=='inspect-fail':sys.exit(1)
 if fmt.startswith('{{.Id}}|'):
  name='vts-figma-test-dns-'+r if role=='resolver' else 'vts-figma-test-qual-'+r[:8]+'-'+role
  if bad=='name':name='vts-figma-test-foreign'
  print(('b'*64 if bad=='id' else c)+'|/'+name+'|'+('OTHER' if bad=='issue' else 'VIS-6')+'|'+('foreign' if bad=='run' else r))
 elif fmt=='{{.HostConfig.NetworkMode}}':print('foreign' if bad=='mode' else n)
 else:print('{}')
elif a[:2]==['network','inspect']:
 if bad=='network-inspect':sys.exit(1)
 if 'range' in a[3]:print('foreign ' if bad=='member' else c+' ')
 elif 'len' in a[3]:print(n+'|vts-figma-test-dns-'+r+'|VIS-6|'+r+'|1')
 else:print(n+'|vts-figma-test-dns-'+r+'|VIS-6|'+('foreign' if bad=='network-owner' else r)+'|bridge|false')
elif a[:2]==['network','ls']:pass
elif a[0] in ['stop','rm']:
 pathlib.Path('mutated').write_text('yes')
 if role!='resolver' or a[0]=='rm':pathlib.Path('removed').write_text('yes')
elif a[0] in ['logs','ps']:pass
else:sys.exit(99)
""")
 (p/'docker').chmod(0o755)
 (p/'curl').write_text('#!/bin/bash\nexit 0\n'); (p/'curl').chmod(0o755)
 run='11111111-1111-1111-1111-111111111111'
 for role in ['runtime','resolver']:
  for context in ['cleanup','watchdog']:
   for bad in ['', 'run','issue','name','id','inspect-fail','unregistered'] + (['network-owner','network-inspect','member','mode'] if role=='resolver' else []):
    for f in p.glob('*-id'):f.unlink()
    for f in ['trace','mutated','removed']:(p/f).unlink(missing_ok=True)
    (p/(role+'-id')).write_text(('b' if bad=='unregistered' else 'a')*64)
    (p/'runtime-name').write_text('vts-figma-test-qual-'+run[:8]+'-runtime')
    if role=='resolver':(p/'resolver-network-id').write_text('d'*64)
    env={**os.environ,'BASH_ENV':'/dev/null','PATH':str(p)+':'+os.environ['PATH'],'RUN':run,'ROLE':role,'BAD':bad}
    # No inherited functions or real CLI fallback; watchdog's first sleep is immediate.
    body='set -u\nrun="$RUN"; name="vts-figma-test-qual-${run:0:8}"; teardown=0; probe=unused\n'+own+'\n'
    if context=='cleanup':body+=cleanup+'\nfalse\ncleanup\n'
    else:body+='sleep(){ return 0; }\n'+watch
    out=subprocess.run(['bash','-c',body],cwd=p,env=env,capture_output=True,text=True)
    calls=[json.loads(x) for x in (p/'trace').read_text().splitlines()]
    mutations=[x for x in calls if x[0] in ['stop','rm'] or x[:2]==['network','rm']]
    assert bool(mutations)==(bad==''),(role,context,bad,out.stderr,mutations)
    if bad=='':assert all(x[-1]=='a'*64 for x in mutations),mutations
    if context=='cleanup' and bad=='':assert ['inspect','a'*64] in calls
 print('Actual cleanup/set +e and watchdog/&& refuse foreign labels, names, IDs, failed inspect and resolver network/membership; owned exact-ID cleanup passes. No live Docker.')
