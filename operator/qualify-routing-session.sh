#!/bin/bash
# Runs only inside a separately coordinated Mac docker-job session.
# Does not create containers. The outer job owns admission, supervision and finally cleanup.
set -euo pipefail
[ "$#" -eq 5 ] || { echo 'Usage: qualify-routing-session.sh DIR RUN START TEARDOWN STOP' >&2; exit 2; }
cd "$1"; run="$2"; start="$3"; teardown="$4"; stop="$5"
bash assert-session-window.sh "$start" "$teardown" "$stop"
app=$(cat runtime-id); browser=$(cat browser-id); network=$(cat network-id); volume=$(cat volume-id)
# Validate all exact identities BEFORE copying or executing code.
docker inspect "$app" > routing-app.json
docker inspect "$browser" > routing-browser.json
docker network inspect "$network" > routing-network.json
docker volume inspect "$volume" > routing-volume.json
node --input-type=module - "$run" <<'JS'
import fs from 'node:fs';
import {validateRouting} from './qualification-routing.mjs';
const read=n=>JSON.parse(fs.readFileSync('routing-'+n+'.json'))[0];
console.log(JSON.stringify(validateRouting({app:read('app'),browser:read('browser'),network:read('network'),volume:read('volume'),run:process.argv[2]})));
JS
# Native wrapper refuses partially initialized state and checks app cgroup limits.
bash qualify-native-session.sh "$PWD" "$run" "$start" "$teardown" "$stop"
docker cp qualification-routing.mjs "$browser:/app/qualification-routing.mjs"
docker cp qualify-browser-routing.mjs "$browser:/app/qualify-browser-routing.mjs"
bash assert-session-window.sh "$start" "$teardown" "$stop"
# Credentials travel only through this pipe, not a host file, argv or receipt.
docker exec "$app" node -e '
const f=require("fs"),p="/paperclip/instances/default/test-bootstrap/";
const read=n=>JSON.parse(f.readFileSync(p+"qualification-"+n+".json"));
process.stdout.write(JSON.stringify({account:read("account"),state:read("state"),snapshot:read("snapshot")}));
' | docker exec -i -e "QUALIFICATION_TEARDOWN_EPOCH=$teardown" "$browser" node /app/qualify-browser-routing.mjs > browser-routing-receipt.json
cat browser-routing-receipt.json
