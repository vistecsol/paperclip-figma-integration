#!/bin/bash
# Produce source-only transfer with Git metadata; no credentials or working-tree files.
set -euo pipefail
destination="${1:?new output directory required}"
revision="${2:?exact committed revision required}"
test ! -e "$destination"
case "$revision" in (*[!a-f0-9]*|'') exit 2;; esac
test "${#revision}" = 40
mkdir -p "$destination"
git bundle create "$destination/integration.bundle" HEAD
git clone "$destination/integration.bundle" "$destination/integration"
git -C "$destination/integration" checkout --detach "$revision"
test "$(git -C "$destination/integration" rev-parse HEAD)" = "$revision"
git -C "$destination/integration" remote remove origin
git -C "$destination/integration" diff --check
tar -czf "$destination/integration-checkout.tar.gz" -C "$destination" integration
