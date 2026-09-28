// Isolated test host only. Imported by its main server, never a production module.
import fs from 'node:fs';
const deadline = Date.parse(fs.readFileSync('/app/access-window-deadline', 'utf8').trim());
const reserve = 1280 * 1024 ** 2;
function check() {
  let reason;
  try {
    const available = Number(fs.readFileSync('/proc/meminfo', 'utf8').match(/MemAvailable:\s+(\d+)/)[1]) * 1024;
    const disk = fs.statfsSync('/paperclip');
    if (!Number.isFinite(deadline) || Date.now() >= deadline) reason = 'access window expired';
    else if (available < reserve) reason = 'host memory reserve breached';
    else if (disk.bavail * disk.bsize < 2 * 1024 ** 3) reason = 'disk reserve breached';
  } catch { reason = 'reserve evidence unavailable'; }
  if (reason) {
    console.error(JSON.stringify({testAccessGuard: reason}));
    process.kill(process.pid, 'SIGTERM');
    setTimeout(() => process.exit(1), 10000).unref();
  }
}
check();
setInterval(check, 2000).unref();
