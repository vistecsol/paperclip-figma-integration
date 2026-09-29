"""Exercise the real native-proof exec boundary without Docker or a runtime."""
import os
import pathlib
import subprocess
import tempfile
root = pathlib.Path(__file__).resolve().parents[1]
source = (root / "operator/qualify-native-session.sh").read_text()
command = next(line for line in source.splitlines() if line.startswith('docker exec -e '))
with tempfile.TemporaryDirectory(dir=os.environ["PAPERCLIP_RUN_SCRATCH_DIR"]) as scratch:
    p = pathlib.Path(scratch)
    # Capture Docker argv without running it; check its explicit environment flags.
    script = """set -eu
docker() {
 test "$1" = exec
 shift
 deadline=''
 identity=''
 while [ "$1" = -e ]; do
  case "$2" in
   QUALIFICATION_TEARDOWN_EPOCH=*) deadline="${2#*=}";;
   QUALIFICATION_RUN_ID=*) identity="${2#*=}";;
   *) return 8;;
  esac
  shift 2
 done
 test "$deadline" = "$4_EXPECTED"
 test "$identity" = "$run"
 test "$1" = "$cid"
 test "$2" = node
 test "$3" = /app/native-proof.mjs
 printf '{"explicitDeadline":true}\n'
}
run=test-run
cid=test-container
""".replace('$4_EXPECTED', '$expected')
    script += "expected=$4\n" + command + "\n"
    env = {"PATH": "/usr/bin:/bin", "QUALIFICATION_TEARDOWN_EPOCH": "obsolete-parent-value"}
    result = subprocess.run(["/bin/bash", "-c", script, "check", "dir", "test-run", "start", "1790713800", "stop"], cwd=p, env=env, capture_output=True, text=True)
    assert result.returncode == 0, result.stderr
    assert '"explicitDeadline":true' in (p / "native-proof.json").read_text()
    # Historical command fails even with an exported parent deadline: explicit flag absent.
    historical = command.replace(' -e "QUALIFICATION_TEARDOWN_EPOCH=$4"', '')
    result = subprocess.run(["/bin/bash", "-c", script.replace(command, historical), "check", "dir", "test-run", "start", "1790713800", "stop"], cwd=p, env=env, capture_output=True, text=True)
    assert result.returncode != 0
print("native Docker exec deadline forwarding and historical refusal passed")
