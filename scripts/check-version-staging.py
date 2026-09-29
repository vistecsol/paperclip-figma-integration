import os, pathlib, subprocess, tempfile, shutil, sys
repo=pathlib.Path.cwd(); inputs=pathlib.Path(sys.argv[1]).resolve()
base=pathlib.Path(os.environ['PAPERCLIP_RUN_SCRATCH_DIR'])
for case in ['foreign','running','owned']:
 with tempfile.TemporaryDirectory(prefix='version-stage-',dir=base) as tmp:
  root=pathlib.Path(tmp)
  for name in ['vistecsol-paperclip-figma-integration-0.1.0-lifecycle.1.tgz','vistecsol-paperclip-figma-integration-0.1.0-lifecycle.2.tgz','version-pair.json']: shutil.copy(inputs/name,root/name)
  shell='''set +e
PAIR_PHASE=baseline; cid=exact-owned-id
window(){ return 0; }
own(){ [ "$CASE" != foreign ]; }
docker(){
 echo "$1" >> calls
 if [ "$1" = inspect ]; then
  if [ "$CASE" = running ]; then echo 'running|1610612736|1610612736|1000000000'; else echo 'created|1610612736|1610612736|1000000000'; fi
 fi
 return 0
}
source "$STAGING"
exit $?
'''
  env={k:v for k,v in os.environ.items() if k not in ['BASH_ENV','ENV']};env.update(CASE=case,STAGING=str(repo/'operator/stage-version-package.sh'))
  r=subprocess.run(['bash','-c',shell],cwd=root,env=env,capture_output=True,text=True)
  calls=(root/'calls').read_text() if (root/'calls').exists() else ''
  if case=='owned': assert r.returncode==0,(r.stdout,r.stderr);assert calls.count('cp\n')==5,calls
  else: assert r.returncode!=0;assert 'cp\n' not in calls,calls
print('Stopped-package staging refuses foreign/running targets under set +e; exact created target stages both immutable releases and their receipts.')
