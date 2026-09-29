"""Offline Docker stub: dedicated ownership, fresh admission, exact cleanup only."""
import os,pathlib,subprocess,tempfile,shutil
root=pathlib.Path(__file__).resolve().parents[1]
with tempfile.TemporaryDirectory(dir=os.environ.get('PAPERCLIP_RUN_SCRATCH_DIR')) as tmp:
 p=pathlib.Path(tmp);run='11111111-1111-1111-1111-111111111111'
 for n in ['collect-fresh-draft-dns.sh','ui-capacity.mjs','resolver-admission.mjs']:
  shutil.copy(root/'operator'/n,p/n)
 for n in ['qualification-dns.mjs','fresh-draft-dns.mjs','qualification-dns.json']:(p/n).write_text('{}')
 (p/'assert-session-window.sh').write_text('exit 0\n')
 (p/'runtime-id').write_text('a'*64);(p/'probe-id').write_text('b'*64)
 (p/'docker').write_text("""#!/usr/bin/env python3
import os,sys,json
a=sys.argv[1:];bad=os.environ['BAD'];r=os.environ['RUN'];n='d'*64;c='c'*64
with open(os.environ['TRACE'],'a') as f:f.write(json.dumps(a)+'\\n')
if a[0]=='network':
 if a[1]=='create':print(n)
 elif a[1]=='inspect':
  fmt=a[3]
  if fmt.startswith('{{.Id}}'):print(n+'|vts-figma-test-dns-'+r+'|VIS-6|'+('foreign' if bad=='network-owner' else r)+'|bridge|false')
  else:print('foreign ' if bad=='membership' else '')
 elif a[1] in ['rm','ls']:pass
 else:sys.exit(99)
elif a[0]=='create':
 assert a[a.index('--network')+1]==n
 print(c)
elif a[0]=='inspect':
 fmt=a[2]
 if fmt.startswith('{{index'):print(r+'|VIS-6|true')
 elif fmt.startswith('{{.Id}}'):print(c+'|'+('foreign' if bad=='resolver-owner' else r)+'|VIS-6|/vts-figma-test-dns-'+r+'|'+n)
 elif 'CgroupnsMode' in fmt:print('67108864|67108864|250000000|32|true|host|node|0')
 elif fmt.startswith('{{.HostConfig'):print('67108864|67108864|250000000|32|true|node|0')
 elif fmt.startswith('{{.State.ExitCode}}'):print('0|false')
 else:sys.exit(98)
elif a[0]=='exec':
 assert 'assertResolverAdmission' in a[-1] and '1344' in a[-1]
 if bad=='admission':sys.exit(2)
 print('{}')
elif a[0]=='start':
 if bad=='start':sys.exit(4)
 print('{}')
elif a[0]=='ps':
 if bad=='cleanup-residue':print(c)
elif a[0] in ['cp','rm']:pass
else:sys.exit(97)
""");(p/'docker').chmod(0o755)
 for bad in ['', 'network-owner','membership','resolver-owner','admission','start','cleanup-residue']:
  trace=p/'trace';trace.write_text('')
  env={**os.environ,'BASH_ENV':'/dev/null','PATH':str(p)+':'+os.environ['PATH'],'RUN':run,'BAD':bad,'TRACE':str(trace)}
  out=subprocess.run(['bash',str(p/'collect-fresh-draft-dns.sh'),str(p),run,'1','2','3'],env=env,capture_output=True,text=True)
  import json
  calls=[json.loads(x) for x in trace.read_text().splitlines()]
  assert (out.returncode==0)==(bad==''),(bad,out.stderr,calls)
  starts=[x for x in calls if x[0]=='start']
  assert bool(starts)==(bad in ['', 'start','cleanup-residue']),bad
  if bad in ['network-owner','membership']:
   assert not any(x[0] in ['create','cp','rm'] or x[:2]==['network','rm'] for x in calls),calls
  if bad=='resolver-owner':assert not any(x[0] in ['cp','rm'] for x in calls),calls
  if bad in ['', 'admission','start','cleanup-residue']:
   assert ['rm','-f','c'*64] in calls and ['network','rm','d'*64] in calls,calls
  if bad=='':
   i=next(i for i,x in enumerate(calls) if x[0]=='start')
   assert calls[i-1][0]=='exec'
print('Mocked resolver ownership/membership, pre-start admission refusal, failure cleanup and independent absence checks passed. No Docker/DNS executed.')
# Exercise the outer interrupted-helper network fallback separately.
with tempfile.TemporaryDirectory(dir=os.environ.get('PAPERCLIP_RUN_SCRATCH_DIR')) as tmp:
 p=pathlib.Path(tmp);(p/'resolver-network-id').write_text('d'*64)
 src=(root/'operator/run-selector-lifecycle-session.sh').read_text()
 block=src[src.index(' # Fallback for interrupted'):src.index(' docker ps -aq --filter label=')]
 (p/'docker').write_text("""#!/usr/bin/env python3
import sys,os
a=sys.argv[1:];n='d'*64
if a[1]=='ls':print('' if os.path.exists('removed') else n)
elif a[1]=='inspect':
 print(n+'|vts-figma-test-dns-'+os.environ['RUN']+'|VIS-6|'+('foreign' if os.environ['BAD']=='foreign' else os.environ['RUN'])+'|'+('1' if os.environ['BAD']=='member' else '0'))
elif a[1]=='rm':
 assert a[2]==n
 open('removed','w').write('ok')
else:sys.exit(99)
""");(p/'docker').chmod(0o755)
 for bad in ['', 'foreign','member']:
  (p/'removed').unlink(missing_ok=True)
  env={**os.environ,'BASH_ENV':'/dev/null','PATH':str(p)+':'+os.environ['PATH'],'RUN':run,'BAD':bad}
  result=subprocess.run(['bash','-c','set -u\nresult=0\nrun="$RUN"\n'+block+'\nexit "$result"'],cwd=p,env=env,capture_output=True,text=True)
  assert (result.returncode==0)==(bad==''),(bad,result.stderr)
  assert (p/'removed').exists()==(bad=='')
print('Outer interrupted-helper fallback removes only exact owned empty DNS network; foreign/member cases refused.')
