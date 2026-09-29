#!/bin/bash
# Admission only: never waits, starts resources, or extends a coordinated window.
set -euo pipefail
if [ "$#" -ne 3 ]; then
  echo 'Usage: assert-session-window.sh START_EPOCH TEARDOWN_EPOCH STOP_EPOCH' >&2
  exit 2
fi
for value in "$@"; do
  case "$value" in ''|*[!0-9]*) echo 'Window epochs must be unsigned integers' >&2; exit 2;; esac
done
start="$1"; teardown="$2"; stop="$3"
if [ "$start" -ge "$teardown" ] || [ "$teardown" -ge "$stop" ]; then
  echo 'Invalid window ordering' >&2; exit 2
fi
now=$(date -u +%s)
if [ "$now" -lt "$start" ]; then
  echo 'Session window has not opened; no launch' >&2; exit 1
fi
if [ "$now" -ge "$teardown" ]; then
  echo 'Session teardown boundary reached; no launch' >&2; exit 1
fi
printf 'Session admission time %s is within [%s, %s); hard stop %s\n' "$now" "$start" "$teardown" "$stop"
