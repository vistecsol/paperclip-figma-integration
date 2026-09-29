#!/bin/bash
# No resource creation, host Node, application graph, mounts or copied files.
set -euo pipefail
[ "$#" -eq 5 ] || { echo 'Usage: validate-routing-in-probe.sh DIR RUN START TEARDOWN STOP' >&2; exit 2; }
cd "$1"; run="$2"
bash assert-session-window.sh "$3" "$4" "$5"
case "$run" in ''|*[!0-9a-f-]*) echo 'Run UUID required' >&2; exit 3;; esac
[ "${#run}" -eq 36 ]
probe=$(cat probe-id)
case "$probe" in ''|*[!0-9a-f]*) echo 'Exact probe ID required' >&2; exit 3;; esac
[ "${#probe}" -eq 64 ]
case "$(docker inspect -f '{{.Name}}' "$probe")" in /vts-figma-test-*) ;; *) exit 3;; esac
[ "$(docker inspect -f '{{.Id}}|{{index .Config.Labels "vts.figma.issue"}}|{{index .Config.Labels "vts.figma.run"}}|{{.State.Running}}' "$probe")" = "$probe|VIS-6|$run|true" ]
# Independent Docker checks run in Bash BEFORE even the bootstrap is executed.
[ "$(docker inspect -f '{{.HostConfig.Memory}}|{{.HostConfig.MemorySwap}}|{{.HostConfig.NanoCpus}}|{{.HostConfig.PidsLimit}}|{{.HostConfig.Privileged}}|{{.HostConfig.ReadonlyRootfs}}|{{.HostConfig.NetworkMode}}|{{.HostConfig.CgroupnsMode}}|{{.Config.User}}' "$probe")" = '67108864|67108864|250000000|32|false|true|none|host|node' ]
[ "$(docker inspect -f '{{len .Mounts}}|{{len .HostConfig.Binds}}|{{len .HostConfig.Devices}}|{{len .HostConfig.CapAdd}}|{{len .HostConfig.Tmpfs}}|{{.HostConfig.CapDrop}}|{{.HostConfig.SecurityOpt}}' "$probe")" = '0|0|0|0|0|[ALL]|[no-new-privileges]' ]
[ "$(docker inspect -f '{{.Image}}' "$probe")" = "$(cat probe-image-id)" ]
bash assert-session-window.sh "$3" "$4" "$5"
# Inspect arrays are wrapped as data; source is encoded, never interpolated as JS.
{
 printf '{"source":"'
 base64 < qualification-routing.mjs | tr -d '\r\n'
 printf '","records":{"run":"%s",' "$run"
 for kind in app browser network volume; do
  printf '"%s":' "$kind"
  # Feed the complete inspect array; unwrap inside trusted bootstrap call below.
  cat "routing-$kind.json"
  [ "$kind" = volume ] || printf ','
 done
 printf '}}'
} | docker exec -i "$probe" node --input-type=module -e "$(cat routing-probe.mjs)
await runProbe();"
