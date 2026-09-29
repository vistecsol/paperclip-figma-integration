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
case "$run" in ''|*[!0-9a-f-]*) exit 3;; esac
[ "${#run}" -eq 36 ]
test -r ui-capacity.mjs && test -r resolver-admission.mjs
resolver=''; dns_network=''
network_name="vts-figma-test-dns-$run"
network_check(){
 test "$(docker network inspect -f '{{.Id}}|{{.Name}}|{{index .Labels "vts.figma.issue"}}|{{index .Labels "vts.figma.run"}}|{{.Driver}}|{{.Internal}}' "$dns_network")" = "$dns_network|$network_name|VIS-6|$run|bridge|false" || return 3
 members=$(docker network inspect -f '{{range $id, $c := .Containers}}{{$id}} {{end}}' "$dns_network") || return 3
 # Created/stopped containers may have no attached endpoint. Never permit another member.
 if [ "$1" = empty ]; then test -z "$members"
 else test -z "$members" || test "$members" = "$resolver "; fi
}
resolver_check(){
 test "$(docker inspect -f '{{.Id}}|{{index .Config.Labels "vts.figma.run"}}|{{index .Config.Labels "vts.figma.issue"}}|{{.Name}}|{{.HostConfig.NetworkMode}}' "$resolver")" = "$resolver|$run|VIS-6|/$network_name|$dns_network"
}
cleanup(){
 result=$?; trap - EXIT; set +e
 if [ -n "$resolver" ]; then
  if resolver_check && network_check owned; then
   docker rm -f "$resolver" >/dev/null || result=5
   # Successful listing must independently confirm exact-ID absence.
   remaining=$(docker ps -aq --no-trunc --filter "id=$resolver") || result=5
   [ -z "$remaining" ] || result=5
  else result=5; fi
 fi
 if [ -n "$dns_network" ]; then
  if network_check empty; then
   docker network rm "$dns_network" >/dev/null || result=5
   remaining=$(docker network ls -q --no-trunc --filter "id=$dns_network") || result=5
   [ -z "$remaining" ] || result=5
  else result=5; fi
 fi
 exit "$result"
}
trap cleanup EXIT
trap 'exit 143' TERM
trap 'exit 130' INT
# Dedicated DNS-egress bridge: never the shared default or an app/production network.
# Only credential-free DNS code runs here; app/browser remain internal-only.
dns_network=$(docker network create --driver bridge --label vts.figma.issue=VIS-6 --label "vts.figma.run=$run" "$network_name")
echo "$dns_network" > resolver-network-id
network_check empty
resolver=$(docker create -i --name "vts-figma-test-dns-$run" --label vts.figma.issue=VIS-6 --label "vts.figma.run=$run" --user node --entrypoint node --network "$dns_network" --memory 64m --memory-swap 64m --cpus .25 --pids-limit 32 --read-only --cap-drop ALL --security-opt no-new-privileges "$image" --max-old-space-size=32 --input-type=module -e "$(cat resolver-stdin.mjs)")
echo "$resolver" > resolver-id
resolver_check
network_check owned
 test "$(docker inspect -f '{{.HostConfig.Memory}}|{{.HostConfig.MemorySwap}}|{{.HostConfig.NanoCpus}}|{{.HostConfig.PidsLimit}}|{{.HostConfig.ReadonlyRootfs}}|{{.Config.User}}|{{len .Mounts}}' "$resolver")" = '67108864|67108864|250000000|32|true|node|0'
# Credential-free reviewed inputs travel through stdin; rootfs stays read-only.
{
 printf '{"run":"%s","library":"' "$run"; base64 < qualification-dns.mjs | tr -d '\r\n'
 printf '","source":"'; base64 < fresh-draft-dns.mjs | tr -d '\r\n'
 printf '","mapping":'; cat qualification-dns.json
 printf '}'
} > resolver-input.json
bash assert-session-window.sh "$start" "$teardown" "$stop"
resolver_check
network_check owned
# Fresh sample in the existing supervisor immediately before adding the resolver.
test "$(docker inspect -f '{{.HostConfig.Memory}}|{{.HostConfig.MemorySwap}}|{{.HostConfig.NanoCpus}}|{{.HostConfig.PidsLimit}}|{{.HostConfig.ReadonlyRootfs}}|{{.HostConfig.CgroupnsMode}}|{{.Config.User}}|{{len .Mounts}}' "$probe")" = '67108864|67108864|250000000|32|true|host|node|0'
docker exec "$probe" node --input-type=module -e "$(cat ui-capacity.mjs)
$(cat resolver-admission.mjs)
assertResolverAdmission({completeAncestorEvidence:complete,effectiveHeadroomBytes:headroom,diskFreeBytes:diskFree,time:new Date().toISOString()});
" > resolver-admission.json
docker start -ai "$resolver" < resolver-input.json > qualification-dns-fresh.json
test "$(docker inspect -f '{{.State.ExitCode}}|{{.State.OOMKilled}}' "$resolver")" = '0|false'
# No receipt copy after failure; the native caller validates freshness again at POST.
docker cp qualification-dns-fresh.json "$app:/app/qualification-dns-fresh.json"
