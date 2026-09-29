import os,pathlib,subprocess,tempfile
root=pathlib.Path(__file__).resolve().parents[1]
with tempfile.TemporaryDirectory(dir=os.environ['PAPERCLIP_RUN_SCRATCH_DIR']) as d:
 p=pathlib.Path(d)
 (p/'docker').write_text("""#!/bin/bash
echo "$*" >> "$CALLS"
case "$1" in
inspect)
 if [ "$2" != -f ]; then exit 1; fi
 case "$3" in
 *Labels*) echo "/vts-figma-test-case VIS-6 $ACTUAL_RUN";;
 *Running*) echo true;;
 *) echo '{}';;
 esac;;
esac
""")
 (p/'docker').chmod(0o755)
 # Empty cleanup must preserve the original failure without any Docker call.
 log=p/'empty.log'
 env={**os.environ,'PATH':d+':'+os.environ['PATH'],'CALLS':str(log)}
 env.pop('BASH_ENV',None)
 empty=subprocess.run(['bash','-uc','run=proof; source "$1"; exit 69','test',str(root/'operator/mac-owned-cleanup.sh')],cwd=d,env=env,capture_output=True)
 assert empty.returncode==69,(empty.returncode,empty.stderr)
 assert not log.exists(),'Empty cleanup must not call Docker'
 for actual,expected in [('proof',7),('foreign',1)]:
  log=p/(actual+'.log')
  env={**os.environ,'PATH':d+':'+os.environ['PATH'],'CALLS':str(log),'ACTUAL_RUN':actual}
  r=subprocess.run(['bash','-c','export PATH="$2:$PATH"; unset -f docker; run=proof; source "$1"; register_owned exact-id; exit 7','test',str(root/'operator/mac-owned-cleanup.sh'),d],cwd=d,env=env,capture_output=True)
  assert r.returncode==expected,(r.returncode,r.stderr,log.read_text() if log.exists() else 'no fake calls',subprocess.run([str(p/'docker'),'inspect','-f','Labels','exact-id'],env=env,capture_output=True).stderr)
  calls=log.read_text()
  assert ('stop --time 15 exact-id' in calls)==(actual=='proof')
  assert ('rm exact-id' in calls)==(actual=='proof')
 print('Owned failure cleanup exports state, stops/removes exact ID, preserves failure; foreign owner refused.')
