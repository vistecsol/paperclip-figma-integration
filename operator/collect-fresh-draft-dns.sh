#!/bin/bash
# Preparation only until a replacement session approves the extra 64 MiB resolver.
# One DNS collection per requested draft, never a retry on failure or address drift.
set -euo pipefail
cd "$1"; run="$2"; start="$3"; teardown="$4"; stop="$5"
bash assert-session-window.sh "$start" "$teardown" "$stop"
app=$(cat runtime-id); probe=$(cat probe-id)
for id in "$app" "$probe"; do
 test "$(docker inspect -f '{{index .Config.Labels "vts.figma.run"}}|{{index .Config.Labels "vts.figma.issue"}}|{{.State.Running}}' "$id")" = "$run|VIS-6|true"
done
image=ghcr.io/paperclipai/paperclip@sha256:4e2e1e59219129a4b687cd54ba439fb7fed0a5710af9f1551277dedd23dc61f1
resolver=''
cleanup(){
 result=$?; trap - EXIT; set +e
 if [ -n "$resolver" ] && docker inspect "$resolver" >/dev/null 2>&1; then
  if [ "$(docker inspect -f '{{index .Config.Labels "vts.figma.run"}}|{{index .Config.Labels "vts.figma.issue"}}|{{.Name}}' "$resolver")" = "$run|VIS-6|/vts-figma-test-dns-${run}" ]; then
   docker rm -f "$resolver" >/dev/null || result=5
  else result=5; fi
 fi
 exit "$result"
}
trap cleanup EXIT
resolver=$(docker create --name "vts-figma-test-dns-$run" --label vts.figma.issue=VIS-6 --label "vts.figma.run=$run" --user node --entrypoint node --network bridge --memory 64m --memory-swap 64m --cpus .25 --pids-limit 32 --read-only --cap-drop ALL --security-opt no-new-privileges "$image" --max-old-space-size=32 /app/fresh-draft-dns.mjs "$run")
echo "$resolver" > resolver-id
 test "$(docker inspect -f '{{.HostConfig.Memory}}|{{.HostConfig.MemorySwap}}|{{.HostConfig.NanoCpus}}|{{.HostConfig.PidsLimit}}|{{.HostConfig.ReadonlyRootfs}}|{{.Config.User}}|{{len .Mounts}}' "$resolver")" = '67108864|67108864|250000000|32|true|node|0'
for module in qualification-dns.mjs fresh-draft-dns.mjs; do docker cp "$module" "$resolver:/app/$module"; done
docker cp qualification-dns.json "$resolver:/app/qualification-dns.json"
bash assert-session-window.sh "$start" "$teardown" "$stop"
docker start -a "$resolver" > qualification-dns-fresh.json
test "$(docker inspect -f '{{.State.ExitCode}}|{{.State.OOMKilled}}' "$resolver")" = '0|false'
# No receipt copy after failure; the native caller validates freshness again at POST.
docker cp qualification-dns-fresh.json "$app:/app/qualification-dns-fresh.json"
