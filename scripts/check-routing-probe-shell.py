"""Deterministic Docker stub proves independent guards precede validator exec."""
import os, pathlib, subprocess, tempfile, json, shutil
root=pathlib.Path(__file__).resolve().parents[1]
with tempfile.TemporaryDirectory(dir=os.environ.get('PAPERCLIP_RUN_SCRATCH_DIR')) as temp:
 p=pathlib.Path(temp); run='11111111-1111-1111-1111-111111111111'; cid='a'*64
 for name in ['validate-routing-in-probe.sh','routing-probe.mjs','qualification-routing.mjs']:
  shutil.copy(root/'operator'/name,p/name)
 (p/'assert-session-window.sh').write_text('exit 0\n')
 (p/'probe-id').write_text(cid);(p/'probe-image-id').write_text('sha256:fixed')
 for kind in ['app','browser','network','volume']:(p/f'routing-{kind}.json').write_text('[{}]')
 docker=p/'docker';docker.write_text('''#!/usr/bin/env python3
import os,sys,json
args=sys.argv[1:];bad=os.environ.get('BAD','')
if args[0]=='exec':
 payload=json.load(sys.stdin)
 assert len(payload['records'])==5 and len(payload['records']['app'])==1
 open(os.environ['MARKER'],'w').write('executed')
 print('stub validator executed');sys.exit(0)
f=args[2]
if f=='{{.Name}}':out='/vts-figma-test-probe' if bad!='namespace' else '/paperclip-production'
elif f.startswith('{{.Id}}'):out=args[-1]+'|VIS-6|'+os.environ['RUN']+'|true' if bad!='owner' else 'foreign'
elif f.startswith('{{.HostConfig.Memory}}'):out='67108864|67108864|250000000|32|false|true|none|host|node' if bad!='limits' else 'unsafe'
elif f.startswith('{{len .Mounts}}'):out='0|0|0|0|0|[ALL]|[no-new-privileges]' if bad!='mount' else '1|unsafe'
elif f=='{{.Image}}':out='sha256:fixed' if bad!='image' else 'sha256:foreign'
else:raise Exception(f)
print(out)
''');docker.chmod(0o755)
 env={**os.environ,'BASH_ENV':'/dev/null','PATH':str(p)+':'+os.environ['PATH'],'RUN':run,'MARKER':str(p/'executed')}
 for bad in ['namespace','owner','limits','mount','image','']:
  (p/'executed').unlink(missing_ok=True)
  result=subprocess.run(['bash',str(p/'validate-routing-in-probe.sh'),str(p),run,'1','2','3'],env={**env,'BAD':bad},capture_output=True,text=True)
  assert (result.returncode==0)==(bad==''),(bad,result.stderr)
  assert (p/'executed').exists()==(bad==''),bad
print('Independent shell ownership, cap/filesystem and image refusals precede exec; valid streamed payload passed. Docker mocked.')
