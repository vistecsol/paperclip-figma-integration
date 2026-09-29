#!/bin/bash
# Invoke through /Users/nolan/vts-figma-test/bin/docker-job.
set -euo pipefail
export PATH="/Applications/Docker.app/Contents/Resources/bin:$PATH"
cd "${1:?fresh source-input directory required}"
run="${2:?Paperclip run ID required}"
image='ghcr.io/paperclipai/paperclip@sha256:4e2e1e59219129a4b687cd54ba439fb7fed0a5710af9f1551277dedd23dc61f1'
source "$(dirname "$0")/mac-owned-cleanup.sh"
name="vts-figma-test-mac-${run:0:8}-native"
test ! -e integration && test ! -e inputs || { echo "Use a fresh job directory; no replay"; exit 1; }
mkdir inputs
# Prepared on the engineering checkout with Git metadata retained. Native macOS
# Git may require an unrelated Xcode license; validate exact HEAD inside the
# bounded Linux builder before compilation instead.
test -f integration-checkout.tar.gz
tar -xzf integration-checkout.tar.gz
test -d integration/.git
cp mac-build-supervisor.mjs integration/operator/
tar -xzf patched-inputs.tar.gz -C inputs
test -z "$(docker ps -q)" || { echo 'Competing containers: stop without mutation'; exit 1; }
own() {
  test "$(docker inspect -f '{{index .Config.Labels "vts.figma.run"}}' "$1")" = "$run"
  test "$(docker inspect -f '{{index .Config.Labels "vts.figma.issue"}}' "$1")" = VIS-6
}
probe=$(docker create --name "$name-probe" --label vts.figma.issue=VIS-6 --label "vts.figma.run=$run" --user node --entrypoint node --network none --memory 64m --memory-swap 64m --cpus .25 --pids-limit 32 --read-only --cap-drop ALL --security-opt no-new-privileges --cgroupns host -e VTS_UI_DIRECT_ICONS_1408=1 "$image" --input-type=module -e "$(cat integration/operator/ui-capacity.mjs)
if (!complete || headroom < 2880*1024**2 || diskFree < 2*1024**3) process.exit(2);")
register_owned "$probe"
own "$probe"
docker start -a "$probe" > admission.json
cat admission.json
test "$(docker inspect -f '{{.State.ExitCode}}' "$probe")" = 0
build=$(docker create --name "$name-build" --label vts.figma.issue=VIS-6 --label "vts.figma.run=$run" --entrypoint node --network none --memory 1408m --memory-swap 1408m --cpus 1 --pids-limit 128 --security-opt no-new-privileges -e "VTS_QUALIFICATION_DEADLINE=${VTS_QUALIFICATION_DEADLINE:?explicit teardown deadline required}" -e "VTS_INTEGRATION_REVISION=$3" -e NODE_OPTIONS=--max-old-space-size=896 -e VTS_UI_PREFLIGHT_APPROVED=1 "$image" /app/integration/operator/mac-build-supervisor.mjs)
register_owned "$build"
own "$build"
docker cp inputs/. "$build:/app"
docker cp integration "$build:/app/integration"
printf '%s\n' "$build" > build-id
own "$build"
set +e
docker start -a "$build" > build.log 2>&1
attached_status=$?
set -e
printf '%s\n' "$attached_status" > attach-status
docker inspect -f '{{json .State}}' "$build" > build-state.json
cat build-state.json
test "$(docker inspect -f '{{.State.ExitCode}}' "$build")" = 0
mkdir output
docker cp "$build:/app/integration/dist" output/dist
docker cp "$build:/app/integration/candidate.tgz" output/candidate.tgz
docker cp "$build:/app/ui/dist" output/ui
docker cp "$build:/app/packages/plugins/sdk/dist" output/sdk-dist
echo 'Build complete; outputs exported before exact owned cleanup. No runtime launch.'
