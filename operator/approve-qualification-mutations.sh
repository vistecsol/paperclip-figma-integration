#!/bin/bash
set -euo pipefail
cd "$1"; run="$2"; start="$3"; teardown="$4"; stop="$5"
app=$(cat runtime-id); probe=$(cat probe-id)
last=''
while [ "$(date +%s)" -lt "$teardown" ]; do
 nonce=$(docker exec "$app" node -e 'const f=require("fs");try{process.stdout.write(f.readFileSync("/app/qualification-guard-request","utf8"))}catch{}')
 if [ -n "$nonce" ] && [ "$nonce" != "$last" ]; then
  bash assert-session-window.sh "$start" "$teardown" "$stop"
  for id in "$app" "$probe"; do
   test "$(docker inspect -f '{{index .Config.Labels "vts.figma.run"}}|{{index .Config.Labels "vts.figma.issue"}}|{{.State.Running}}' "$id")" = "$run|VIS-6|true"
  done
  test "$(docker inspect -f '{{.HostConfig.Memory}}|{{.HostConfig.MemorySwap}}|{{.HostConfig.NanoCpus}}|{{.HostConfig.ReadonlyRootfs}}|{{.Config.User}}|{{len .Mounts}}' "$probe")" = '67108864|67108864|250000000|true|node|0'
  docker inspect "$app" > guard-app.json
  docker inspect "$(cat browser-id)" > guard-browser.json
  docker network inspect "$(cat network-id)" > guard-network.json
  docker volume inspect "$(cat volume-id)" > guard-volume.json
  docker logs --tail 1 "$probe" > guard-sample.json
  {
   printf '{"source":"'; base64 < qualification-routing.mjs | tr -d '\r\n'
   printf '","run":"%s","sample":' "$run"; cat guard-sample.json
   for kind in app browser network volume; do printf ',"%s":' "$kind";cat "guard-$kind.json";done
   printf '}'
  } | docker exec -i "$probe" node --input-type=module -e '
import fs from "node:fs";import assert from "node:assert/strict";import path from "node:path";
const x=JSON.parse(fs.readFileSync(0,"utf8"));
const rel=fs.readFileSync("/proc/self/cgroup","utf8").trim().split(":").pop();
for(const[k,v]of Object.entries({"memory.max":"67108864","memory.swap.max":"0","cpu.max":"25000 100000","pids.max":"32"}))assert.equal(fs.readFileSync(path.join("/sys/fs/cgroup",rel,k),"utf8").trim(),v);
assert.ok(x.sample.complete&&Date.now()-Date.parse(x.sample.time)<6000);
assert.ok(x.sample.headroom>=1280*1024**2&&x.sample.diskFree>=2*1024**3);
for(const k of ["app","browser","network","volume"])x[k]=x[k][0];
const {validateRouting}=await import("data:text/javascript;base64,"+x.source);validateRouting(x);
' >> mutation-guards.txt
  bash assert-session-window.sh "$start" "$teardown" "$stop"
  printf '%s' "$nonce" | docker exec -i "$app" node -e 'const f=require("fs"),nonce=f.readFileSync(0,"utf8");if(!/^[a-f0-9-]{36}$/.test(nonce))throw Error("nonce");f.writeFileSync("/app/qualification-guard-approval",JSON.stringify({nonce,time:Date.now()}));'
  last="$nonce"
 fi
 sleep .2
done
