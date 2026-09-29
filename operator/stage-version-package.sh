# Source only from reviewed launch/restart body, after own() has registered cid.
# Every replacement is a NEW stopped container; never overwrite a running worker.
# Both immutable releases are staged before application startup. Native upgrade
# re-reads the stable regular local packagePath; the phase driver stages changed
# metadata before calling that API, without restarting the host first.
own "$cid" || return 3
[ "$(docker inspect -f '{{.State.Status}}|{{.HostConfig.Memory}}|{{.HostConfig.MemorySwap}}|{{.HostConfig.NanoCpus}}' "$cid")" = 'created|1610612736|1610612736|1000000000' ] || return 3
window || return 3
for pair_version in 0.1.0-lifecycle.1 0.1.0-lifecycle.2; do
 case "$pair_version" in
  *.1) pair_digest=c911989969ab93504e55a165b0e59a0f63244d58e93bc54b934f5fba44268d8a;;
  *.2) pair_digest=9139da168f9b846e3baf670056961017d014d944f1c24f725315374994ad52f7;;
 esac
 pair_tar="vistecsol-paperclip-figma-integration-$pair_version.tgz"
 [ "$(shasum -a 256 "$pair_tar" | cut -d' ' -f1)" = "$pair_digest" ] || return 3
 pair_extract="release-$pair_version"
 [ ! -e "$pair_extract" ] || return 3
 mkdir "$pair_extract" || return 3
 tar -xzf "$pair_tar" -C "$pair_extract" --strip-components=1 || return 3
 own "$cid" && docker cp "$pair_extract" "$cid:/app/$pair_extract" || return 3
 own "$cid" && docker cp "$pair_tar" "$cid:/app/$pair_tar" || return 3
done
own "$cid" && docker cp version-pair.json "$cid:/app/version-pair.json" || return 3
