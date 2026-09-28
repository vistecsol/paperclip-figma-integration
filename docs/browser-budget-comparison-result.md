# Worker-enabled reload passes at the experimental 768 MiB browser cap

28 September 2026. One comparison authorized by Elena's browser-budget-comparison
decision; hard expiry 22:50 UTC. No second trial or product workaround.

## Revisions and command

Integration/harness input: 9075cae9b74627d971c8d9e19b7455f1b33819a2.
Host: 2026.916.1 / d554c4789ed3930f8a53ac9fdf6503b3187097da.
arm64 image: sha256:4e2e1e59219129a4b687cd54ba439fb7fed0a5710af9f1551277dedd23dc61f1.
Retained build inputs: 81e2b0a3cdc988d1fc33dd16765b4dede547d3fb;
callback repair 8c738cdfcba9b70bc17eae52c81aec21d864cf27;
plugin form b277499c8204c93cbf8a131dcff4439a885613cb.
No asset rebuild or source deployment.

Remote directory:
 /Users/nolan/vts-figma-test/compare-12f3d852-577c-480d-9532-52a91d1a1206

Commands (exact executable scripts included in the artifact):

    /Users/nolan/vts-figma-test/bin/docker-job bash <directory>/restore.sh /Users/nolan/vts-figma-test/job-c69805a3-cd15-444d-98f0-645d61b68cca 12f3d852-577c-480d-9532-52a91d1a1206 <directory>
    /Users/nolan/vts-figma-test/bin/docker-job bash <directory>/reload-proof.sh <directory> 12f3d852-577c-480d-9532-52a91d1a1206
    /Users/nolan/vts-figma-test/bin/docker-job bash <directory>/cleanup.sh <directory> 12f3d852-577c-480d-9532-52a91d1a1206

The previous scripts were adapted only for this run's identity, 768 MiB browser,
matching effective-limit assertion, and explicit 3648 MiB aggregate gate.
App remains 1536 MiB; app/browser one CPU each, no swap. Probe 64 MiB.
1280 MiB host reserve and 2 GiB disk reserve retained. The generic probe JSON
reports its legacy 3328 MiB requirement; shell independently enforces 3648 MiB.
This conservative before-browser check does not count resident app allocation
as available memory. App admission: 7,608,397,824 bytes; browser admission:
6,284,427,264 bytes. Disk respectively 919,200,096,256 / 919,068,323,840 bytes.
Both probes captured complete ancestor evidence.

## Actual result

Native login at 22:17:05.097; fresh navigation at 22:17:05.525.
Saved synthetic attachment visible before reload at 22:17:06.781.
Normal reload returned by 22:17:07.482; saved link assertion and mobile screenshot
completed before keyed readback at 22:17:07.916. Result passed true, inner 200,
revision 1, expected label and intended shared connection; still unverified.
Final browser state explicitly confirms service worker controller true.
Trace shows worker-served plugin response and completed project/list requests.
No worker disabling, canvas call, attachment mutation or new consent.

Browser observed peak 805,576,704 bytes against 805,306,368 configured/effective
cap; max counter 2823, oom/oom_kill zero. Latest stage pressure full total
11,397 microseconds, versus 4,843,479 in the earlier failing 512 MiB capture.
Durations differ: these cumulative values are not normalized performance rates.
Limit hits persist; pressure did not disappear. Successful bounded comparison
supports resource sensitivity, not an exact root cause, minimum budget, broad
browser acceptance or a production sizing recommendation.

Timestamped requests, completions, stage memory.stat/pressure and counters
worked. Independent timer sampled each second, but the successful browser test
finished before its five-second logging cadence; no emitted periodic resource
line is claimed. Stage samples and terminal counters are the observed evidence.
The prior slower failing trace remains the pressure baseline.

## Cleanup and limits

App 882b2451accb76b3b47224698b89559a914d61f53da3e1f6f67c95bdbfeefbe2.
Browser b0570c4f15cf4d56e4c6e75cf9979659013f38ff8a2ef989228f95351c401ee1.
Both AutoRemove; exact ownership labels checked before stop. App peak
1,337,245,696 bytes; own max/oom/oom_kill all zero. Both exact IDs absent and
current-run ephemeral container query empty after cleanup. Named VTS test state
ownership verified and retained. Access stays OFFLINE; no ready URL or retry
handoff. No production resource touched.

Local shell first failed its namespace sandbox; approved escalated path worked.
Initial evidence download used unsupported scp brace expansion and failed;
individual-file download succeeded. Neither caused another runtime trial.
No build, broad suite, login request, timer, publication or QA wake.

## Next engineering action

Normal worker-enabled reload and saved-link readback are now proven for this
bounded synthetic case. Nadia retains native fixed inspection allowlisting
(write/destructive/new tools denied), revision-safe real association correction,
then context/screenshots and fresh-agent proof in a coordinated bounded session.
Automatic draft selection, full-host/CI, revised package reproducibility,
onboarding and clean-instance lifecycle gates remain open. Engineering is not
complete; Theo's complete-candidate dependency remains.
