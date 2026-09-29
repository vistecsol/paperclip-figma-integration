# Source from a Mac docker-job script. Register exact IDs immediately after create.
owned_ids=()
register_owned() { owned_ids+=("$1"); }
cleanup_owned() {
  local result=$? id record
  trap - EXIT
  for id in ${owned_ids[@]+"${owned_ids[@]}"}; do
    if ! record=$(docker inspect -f '{{.Name}} {{index .Config.Labels "vts.figma.issue"}} {{index .Config.Labels "vts.figma.run"}}' "$id" 2>/dev/null); then
      echo "Cleanup cannot verify $id; manual readback required" >&2
      result=1
      continue
    fi
    case "$record" in
      "/vts-figma-test-"*" VIS-6 $run") ;;
      *) echo "Cleanup ownership mismatch: $id" >&2; result=1; continue;;
    esac
    # Export diagnostics before removal, including on failure.
    docker inspect -f '{{json .State}}' "$id" > "cleanup-$id-state.json" || result=1
    docker logs "$id" > "cleanup-$id.log" 2>&1 || true
    if [ "$(docker inspect -f '{{.State.Running}}' "$id")" = true ]; then
      docker stop --time 15 "$id" >/dev/null || result=1
    fi
    docker rm "$id" >/dev/null || result=1
    if docker inspect "$id" >/dev/null 2>&1; then result=1; fi
  done
  exit "$result"
}
trap cleanup_owned EXIT
trap 'exit 130' INT
trap 'exit 143' TERM
