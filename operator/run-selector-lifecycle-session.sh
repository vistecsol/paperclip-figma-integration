#!/bin/bash
set -euo pipefail
[ "$#" -eq 5 ] || { echo 'Usage: run-selector-lifecycle-session.sh DIR RUN START TEARDOWN STOP' >&2; exit 2; }
cd "$1"; run="$2"; start="$3"; teardown="$4"; stop="$5"
# The launch-body and supervisor are staged from reviewed templates with new epochs.
# Refuse unreviewed/stale input bundles before ANY Docker operation.
shasum -a 256 -c session-input-sha256.txt > session-input-verification.txt
# Exact runtime role identity is reviewed staging input, not learned from inspect.
grep -Eq '^[0-9a-f]{64}  runtime-name$' session-input-sha256.txt || exit 3
[ "$((stop-start))" -le 2700 ] && [ "$((stop-teardown))" -ge 300 ]
if grep -Eq '1790699520|"$teardown"|1790702220' launch-body.sh supervisor.mjs; then
 echo 'Closed-window epochs in staged inputs' >&2; exit 2
fi
image=ghcr.io/paperclipai/paperclip@sha256:4e2e1e59219129a4b687cd54ba439fb7fed0a5710af9f1551277dedd23dc61f1
src=/Users/nolan/vts-figma-test/identity-6a7686f1-6947-4223-ba87-63b89733c75d
# Bind the approved identity output before any Docker operation or cleanup trap.
cmp expected-output-sha256.txt "$src/output-sha256.txt"
[ "$(shasum -a 256 "$src/output/candidate.tgz" | cut -d' ' -f1)" = e0c835c8a32647fecbc294361328fefb7fda970026b69464fe4933c3efc46e2b ]
(cd "$src"; shasum -a 256 -c output-sha256.txt) > output-verification.txt
name="vts-figma-test-qual-${run:0:8}"
own(){
 local target="$1" role="" candidate recorded expected identity dns_network members mode
 # Resolve only IDs explicitly registered by this session, never a prefix alone.
 for candidate in resolver browser prep runtime probe; do
  [ -f "$candidate-id" ] || continue
  recorded=$(cat "$candidate-id") || return 3
  if [ "$recorded" = "$target" ]; then
   [ -z "$role" ] || return 3
   role="$candidate"
  fi
 done
 [ -n "$role" ] || return 3
 case "$target" in ''|*[!0-9a-f]*) return 3;; esac
 [ "${#target}" -eq 64 ] || return 3
 case "$role" in
  resolver) expected="vts-figma-test-dns-$run";;
  runtime)
   # Staging must pin this exact launcher name in session-input-sha256.txt.
   expected=$(cat runtime-name) || return 3
   case "$expected" in vts-figma-test-*) ;; *) return 3;; esac;;
  *) expected="$name-$role";;
 esac
 identity=$(docker inspect -f '{{.Id}}|{{.Name}}|{{index .Config.Labels "vts.figma.issue"}}|{{index .Config.Labels "vts.figma.run"}}' "$target") || return 3
 [ "$identity" = "$target|/$expected|VIS-6|$run" ] || return 3
 if [ "$role" = resolver ]; then
  dns_network=$(cat resolver-network-id) || return 3
  case "$dns_network" in ''|*[!0-9a-f]*) return 3;; esac
  [ "${#dns_network}" -eq 64 ] || return 3
  identity=$(docker network inspect -f '{{.Id}}|{{.Name}}|{{index .Labels "vts.figma.issue"}}|{{index .Labels "vts.figma.run"}}|{{.Driver}}|{{.Internal}}' "$dns_network") || return 3
  [ "$identity" = "$dns_network|vts-figma-test-dns-$run|VIS-6|$run|bridge|false" ] || return 3
  mode=$(docker inspect -f '{{.HostConfig.NetworkMode}}' "$target") || return 3
  [ "$mode" = "$dns_network" ] || return 3
  members=$(docker network inspect -f '{{range $id, $c := .Containers}}{{$id}} {{end}}' "$dns_network") || return 3
  [ -z "$members" ] || [ "$members" = "$target " ] || return 3
 fi
 return 0
}
window(){ bash assert-session-window.sh "$start" "$teardown" "$stop"; }
cleanup(){
 result=$?; trap - EXIT; set +e
 [ -z "${guardwatch:-}" ] || kill "$guardwatch" 2>/dev/null
 [ -z "${watch:-}" ] || kill "$watch" 2>/dev/null
 for role in resolver browser prep runtime probe; do
  [ -f "$role-id" ] || continue
  id=$(cat "$role-id")
  if docker inspect "$id" >/dev/null 2>&1; then
   own "$id" || { echo "Ownership failure"; result=5; continue; }
   docker inspect -f '{"id":"{{.Id}}","running":{{.State.Running}},"exit":{{.State.ExitCode}},"oom":{{.State.OOMKilled}},"memory":{{.HostConfig.Memory}},"swap":{{.HostConfig.MemorySwap}},"cpu":{{.HostConfig.NanoCpus}},"pids":{{.HostConfig.PidsLimit}}}' "$id" > "$role-final.json"
   docker logs "$id" > "$role-private.log" 2>&1
   own "$id" || { result=5; continue; }
   docker stop --time 10 "$id" >/dev/null 2>&1 || result=5
   # DNS resolver is explicitly removed (not AutoRemove); preserve exact ownership.
   if [ "$role" = resolver ]; then
    own "$id" && docker rm "$id" >/dev/null || result=5
   fi
  fi
  if docker inspect "$id" >/dev/null 2>&1; then result=5; echo "Exact resource remains: $role"; fi
 done
 # Fallback for interrupted resolver helper: remove only its exact owned empty network.
 if [ -f resolver-network-id ]; then
  dns_network=$(cat resolver-network-id)
  present=$(docker network ls -q --no-trunc --filter "id=$dns_network") || result=5
  if [ -n "$present" ]; then
   if [ "$present" = "$dns_network" ] &&
      network_identity=$(docker network inspect -f '{{.Id}}|{{.Name}}|{{index .Labels "vts.figma.issue"}}|{{index .Labels "vts.figma.run"}}|{{len .Containers}}' "$dns_network") &&
      [ "$network_identity" = "$dns_network|vts-figma-test-dns-$run|VIS-6|$run|0" ]; then
    docker network rm "$dns_network" >/dev/null || result=5
   else result=5; fi
  fi
  remaining=$(docker network ls -q --no-trunc --filter "id=$dns_network") || result=5
  [ -z "$remaining" ] || result=5
 fi
 docker ps -aq --filter label=vts.figma.issue=VIS-6 --filter "label=vts.figma.run=$run" > remaining-containers.txt
 [ ! -s remaining-containers.txt ] || result=5
 curl --max-time 3 -s -o /dev/null -w '%{http_code}' http://127.0.0.1:3310/api/health > offline.txt
 echo "sessionExit=$result"
 exit "$result"
}
trap cleanup EXIT
window
test -z "$(docker ps -q)"
probe=$(docker create --rm --name "$name-probe" --label vts.figma.issue=VIS-6 --label "vts.figma.run=$run" --user node --entrypoint node --network none --memory 64m --memory-swap 64m --cpus .25 --pids-limit 32 --read-only --cap-drop ALL --security-opt no-new-privileges --cgroupns host "$image" --input-type=module -e "$(cat supervisor.mjs)")
echo "$probe" > probe-id
own "$probe"; docker inspect -f '{{.Image}}' "$probe" > probe-image-id
window; docker start "$probe" >/dev/null
sleep 3
test "$(docker inspect -f '{{.State.Running}}' "$probe")" = true
docker logs "$probe" > admission.json
grep -q '"admitted":true' admission.json
# Staged supervisor must include the DNS-only resolver's extra 64 MiB.
grep -q '3712' supervisor.mjs
# Supervisor exit/deadline immediately tears down only this session's registered workloads.
(
 while sleep 2; do
  if [ "$(date +%s)" -ge "$teardown" ] || [ "$(docker inspect -f '{{.State.Running}}' "$probe" 2>/dev/null)" != true ]; then
   echo supervisor-stop > safety-stop.txt
   for role in resolver browser prep runtime; do
    if [ -f "$role-id" ]; then id=$(cat "$role-id"); own "$id" && docker stop --time 5 "$id" >/dev/null 2>&1; fi
   done
   exit
  fi
 done
) & watch=$!
window
prep=$(docker create --rm --name "$name-prep" --label vts.figma.issue=VIS-6 --label "vts.figma.run=$run" --memory 768m --memory-swap 768m --cpus 1 --pids-limit 256 --security-opt no-new-privileges --entrypoint node "$image" -e 'setInterval(()=>{},1000)')
echo "$prep" > prep-id
own "$prep"; window; docker start "$prep" >/dev/null
docker exec "$prep" node -e 'const f=require("fs");for(const[k,v]of Object.entries({"memory.max":"805306368","memory.swap.max":"0","cpu.max":"100000 100000","pids.max":"256"}))if(f.readFileSync("/sys/fs/cgroup/"+k,"utf8").trim()!==v)throw Error(k)'
docker exec "$prep" node /app/node_modules/.pnpm/playwright@1.62.1/node_modules/playwright/cli.js install --with-deps chromium --only-shell > browser-install-private.log 2>&1
docker exec "$prep" node -e 'const {chromium}=require("/app/node_modules/.pnpm/playwright@1.62.1/node_modules/playwright");(async()=>{const b=await chromium.launch({headless:true,args:["--disable-dev-shm-usage"]});await b.close();console.log("dependency launch/close passed")})().catch(()=>process.exit(1))' > dependency-receipt.txt
own "$prep"
docker commit "$prep" "$name-browser-deps" > browser-image-id
docker image inspect -f '{{.Id}} {{.Parent}}' "$(cat browser-image-id)" > browser-image-receipt.txt
# Collect once after browser dependencies, before provider-isolated app preparation.
for module in collect-qualification-dns.mjs qualification-dns.mjs dns-host-arguments.mjs; do docker cp "$module" "$prep:/app/$module"; done
own "$prep"
docker exec "$prep" node /app/collect-qualification-dns.mjs "$run" /app/server/src/services/remote-http-endpoint-guard.ts > qualification-dns.json
docker cp qualification-dns.json "$prep:/app/qualification-dns.json"
docker exec "$prep" node /app/dns-host-arguments.mjs /app/qualification-dns.json "$run" > dns-hosts.txt
dns_args=()
while IFS= read -r entry; do dns_args+=(--add-host "$entry"); done < dns-hosts.txt
docker stop "$prep" >/dev/null
test "$(docker inspect -f '{{.State.Running}}' "$probe")" = true
docker logs --tail 1 "$probe" > immediate-admission.json
# Fresh sample gate, from the existing supervisor's JSON, through a small built-in exec.
docker exec "$probe" node -e 'const f=require("fs");let h=Number(f.readFileSync("/proc/meminfo","utf8").match(/MemAvailable:\s+(\d+)/)[1])*1024;const r=f.readFileSync("/proc/self/cgroup","utf8").trim().split(":").pop();let p=require("path").dirname("/sys/fs/cgroup"+r);while(p!=="/sys/fs"){for(const k of ["memory.max","memory.high"]){if(f.existsSync(p+"/"+k)){const x=f.readFileSync(p+"/"+k,"utf8").trim();if(/^\d+$/.test(x))h=Math.min(h,Math.max(0,Number(x)-Number(f.readFileSync(p+"/memory.current","utf8"))));}}if(p==="/sys/fs/cgroup")break;p=require("path").dirname(p);}if(h<3712*1024**2)process.exit(2);console.log(JSON.stringify({immediateHeadroom:h}));' > immediate-gate.json
. ./launch-body.sh
# Bounded readiness only; no fixture until listener is healthy.
docker exec "$cid" node -e 'const end=Date.now()+60000; (async()=>{while(Date.now()<end){try{const r=await fetch("http://127.0.0.1:3310/api/health",{signal:AbortSignal.timeout(2000)});if(r.ok){console.log(JSON.stringify({health:await r.json()}));return}}catch{}await new Promise(r=>setTimeout(r,1000))}process.exit(1)})()' > health.json
window
browser=$(docker create --rm --name "$name-browser" --label vts.figma.issue=VIS-6 --label "vts.figma.run=$run" --network "container:$cid" --memory 768m --memory-swap 768m --cpus 1 --pids-limit 256 --security-opt no-new-privileges --entrypoint node "$(cat browser-image-id)" -e 'setInterval(()=>{},1000)')
echo "$browser" > browser-id
own "$browser"; window; docker start "$browser" >/dev/null
docker inspect "$cid" > routing-app.json
docker inspect "$browser" > routing-browser.json
docker network inspect "$(cat network-id)" > routing-network.json
docker volume inspect "$(cat volume-id)" > routing-volume.json
bash validate-routing-in-probe.sh "$PWD" "$run" "$start" "$teardown" "$stop" > routing-validation.json
for module in qualification-mutation-guard.mjs qualification-lifecycle.mjs qualify-lifecycle-session.mjs selector-fixtures.mjs; do own "$cid"; docker cp "$module" "$cid:/app/$module"; done
bash approve-qualification-mutations.sh "$PWD" "$run" "$start" "$teardown" "$stop" > mutation-guard-private.log 2>&1 & guardwatch=$!
export QUALIFICATION_TEARDOWN_EPOCH="$teardown"
bash qualify-native-session.sh "$PWD" "$run" "$start" "$teardown" "$stop" > native-receipt.txt
for module in qualification-selector.mjs qualify-selector-browser.mjs selector-fixtures.mjs; do own "$browser"; docker cp "$module" "$browser:/app/$module"; done
window
docker exec "$cid" node -e 'const f=require("fs"),p="/paperclip/instances/default/test-bootstrap/";const read=n=>JSON.parse(f.readFileSync(p+"qualification-"+n+".json"));process.stdout.write(JSON.stringify({account:read("account"),state:read("state")}));' | docker exec -i -e QUALIFICATION_TEARDOWN_EPOCH="$teardown" "$browser" node /app/qualify-selector-browser.mjs > selector-receipt.json
window
docker exec -e QUALIFICATION_TEARDOWN_EPOCH="$teardown" "$cid" node /app/qualify-lifecycle-session.mjs > lifecycle-receipt.json
test "$(docker inspect -f '{{.State.Running}}' "$probe")" = true
docker logs --tail 1 "$probe" > supervisor-survival.json
echo "qualification completed"
