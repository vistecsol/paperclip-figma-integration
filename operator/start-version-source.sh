#!/bin/sh
# Fresh isolated test container only. Create one node-owned package directory,
# then retain the image's normal init/privilege-drop/bootstrap entrypoint.
set -eu
[ ! -e /app/figma-slot ]
mkdir /app/figma-slot
chown node:node /app/figma-slot
exec /usr/bin/tini -- docker-entrypoint.sh node /app/start-source.mjs
