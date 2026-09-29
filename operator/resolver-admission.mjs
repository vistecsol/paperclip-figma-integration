// Called with a just-collected host/ancestor sample in the existing supervisor.
export function assertResolverAdmission(sample, now = Date.now()) {
  const age = now - Date.parse(sample.time);
  if (sample.completeAncestorEvidence !== true || !Number.isFinite(age) || age < 0 || age >= 6000)
    throw Error('Incomplete or stale resolver admission');
  if (!Number.isFinite(sample.effectiveHeadroomBytes) || sample.effectiveHeadroomBytes < 1344 * 1024 ** 2)
    throw Error('Resolver requires 64 MiB plus full 1280 MiB reserve');
  if (!Number.isFinite(sample.diskFreeBytes) || sample.diskFreeBytes < 2 * 1024 ** 3)
    throw Error('Resolver disk reserve breached');
}
