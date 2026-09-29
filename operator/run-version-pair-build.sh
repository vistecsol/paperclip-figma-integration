#!/bin/bash
# Credential-free build only. Invoke via the authorized Mac docker-job wrapper.
set -euo pipefail
export PATH="/Applications/Docker.app/Contents/Resources/bin:$PATH"
cd "${1:?fresh staging directory}"; run="${2:?run}"; revision="${3:?revision}"
start="${4:-$(date +%s)}"; teardown=$((start+1200)); stop=$((start+1500))
[ "$(date +%s)" -ge "$start" ] && [ "$(date +%s)" -lt "$teardown" ]
printf '%s %s %s\n' "$start" "$teardown" "$stop" > window.txt
shasum -a 256 -c inputs.sha256 > input-verification.txt
[ ! -e integration ]; tar -xzf integration.tar.gz
image=ghcr.io/paperclipai/paperclip@sha256:4e2e1e59219129a4b687cd54ba439fb7fed0a5710af9f1551277dedd23dc61f1
name="vts-figma-test-pair-${run:0:8}"; probe=''; build=''
own(){ local target="$1" role="$2" actual; actual=$(docker inspect -f '{{.Id}}|{{.Name}}|{{index .Config.Labels "vts.figma.issue"}}|{{index .Config.Labels "vts.figma.run"}}' "$target") || return 3; [ "$actual" = "$target|/$name-$role|VIS-6|$run" ] || return 3; }
cleanup(){ result=$?; trap - EXIT; set +e
 for role in build probe; do eval 'id=$'"$role"; [ -n "$id" ] || continue
  own "$id" "$role" || { result=5; continue; }
  docker inspect -f '{{json .State}}' "$id" > "$role-state.json"
  docker logs "$id" > "$role.log" 2>&1
  if [ "$(docker inspect -f '{{.State.Running}}' "$id")" = true ]; then own "$id" "$role" && docker stop --time 10 "$id" >/dev/null || result=5; fi
  own "$id" "$role" && docker rm "$id" >/dev/null || result=5
  if docker inspect "$id" >/dev/null 2>&1; then result=5; fi
 done
 docker ps -aq --filter label=vts.figma.issue=VIS-6 --filter "label=vts.figma.run=$run" > remaining.txt
 [ ! -s remaining.txt ] || result=5
 exit "$result"
}
trap cleanup EXIT
window(){ [ "$(date +%s)" -lt "$teardown" ]; }
[ -z "$(docker ps -q)" ] || { echo 'Competing workload; no mutation' >&2; exit 3; }
window
probe=$(docker create --name "$name-probe" --label vts.figma.issue=VIS-6 --label "vts.figma.run=$run" --user node --entrypoint node --network none --memory 64m --memory-swap 64m --cpus .25 --pids-limit 32 --read-only --cap-drop ALL --security-opt no-new-privileges --cgroupns host -e VTS_UI_DIRECT_ICONS_1408=1 "$image" --input-type=module -e "$(cat integration/operator/ui-capacity.mjs)
if(!complete||headroom<2880*1024**2||diskFree<2*1024**3)process.exit(2);")
own "$probe" probe; window; docker start -a "$probe" > admission.json
[ "$(docker inspect -f '{{.State.ExitCode}}' "$probe")" = 0 ]
window
build=$(docker create --name "$name-build" --label vts.figma.issue=VIS-6 --label "vts.figma.run=$run" --entrypoint node --network none --memory 1408m --memory-swap 1408m --cpus 1 --pids-limit 128 --cgroupns host --security-opt no-new-privileges -e NODE_OPTIONS=--max-old-space-size=896 -e "PAIR_TEARDOWN=$teardown" -e "PAIR_REVISION=$revision" "$image" /app/integration/operator/version-pair-supervisor.mjs)
own "$build" build; docker cp integration "$build:/app/integration"
# Exact retained SDK source is hash-pinned during staging, not taken from a running app.
own "$build" build; docker cp sdk-src/. "$build:/app/packages/plugins/sdk/src"
window
own "$build" build; docker start -a "$build" > build-live.log 2>&1
[ "$(docker inspect -f '{{.State.ExitCode}}' "$build")" = 0 ]
own "$build" build; mkdir outputs; docker cp "$build:/app/version-pair/." outputs/
echo 'pair-build-passed'
