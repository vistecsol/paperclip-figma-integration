#!/bin/bash
# Execute once against fresh qualification state. No host-published-port dependency.
set -euo pipefail
if [ "$#" -ne 5 ]; then
  echo 'Usage: qualify-native-session.sh SESSION_DIR RUN_ID START TEARDOWN STOP' >&2
  exit 2
fi
cd "$1"; run="$2"
bash assert-session-window.sh "$3" "$4" "$5"
cid=$(cat runtime-id)
test "$(docker inspect -f '{{index .Config.Labels "vts.figma.run"}}' "$cid")" = "$run"
test "$(docker inspect -f '{{index .Config.Labels "vts.figma.issue"}}' "$cid")" = VIS-6
case "$(docker inspect -f '{{.Name}}' "$cid")" in /vts-figma-test-*) ;; *) exit 3;; esac
test "$(docker inspect -f '{{.State.Running}}' "$cid")" = true
docker exec "$cid" node -e '
const fs=require("fs");
for(const[k,v]of Object.entries({"memory.max":"1610612736","memory.swap.max":"0","cpu.max":"100000 100000","pids.max":"256"}))
 if(fs.readFileSync("/sys/fs/cgroup/"+k,"utf8").trim()!==v)throw Error("Ineffective "+k);
if(["qualification-account.json","qualification-attempt.json"].some(n=>fs.existsSync("/paperclip/instances/default/test-bootstrap/"+n)))
 throw Error("Qualification requires fresh state; do not replay");
'
# This file performs bounded native loopback health/auth checks before mutations.
# An internal Docker network need not expose its published port on the Mac host.
docker cp qualification-dns.mjs "$cid:/app/qualification-dns.mjs"
docker cp qualification-dns.json "$cid:/app/qualification-dns.json"
docker cp native-proof.mjs "$cid:/app/native-proof.mjs"
bash assert-session-window.sh "$3" "$4" "$5"
docker exec -e "QUALIFICATION_RUN_ID=$run" "$cid" node /app/native-proof.mjs > native-proof.json
cat native-proof.json
