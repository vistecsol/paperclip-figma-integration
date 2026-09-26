/** Bounded data contribution for the forthcoming host source extension.
 * authorize and read are host-bound closures; do not construct them from wake data.
 * No remote Figma calls or token-bearing connection records belong here.
 */
export async function designDiscovery({ authorize, read, signal, maxBytes = 32768 }) {
  if (typeof authorize !== 'function' || typeof read !== 'function') throw new Error('Host discovery authority required');
  if (!Number.isSafeInteger(maxBytes) || maxBytes < 512 || maxBytes > 65536) throw new Error('Invalid discovery byte limit');
  signal?.throwIfAborted();
  await authorize();
  signal?.throwIfAborted();
  const index = await read();
  signal?.throwIfAborted();
  const result = { kind: 'figma_design_sources', trust: 'untrusted_data', revision: index.revision,
    sources: [], omitted: index.sources.length };
  for (const source of index.sources) {
    // Explicit projection: never forward future provider fields or secrets.
    const { id, label, purpose, fileKey, nodeId, url, order, primary, connectionId, verification } = source;
    const row = { id, label, purpose, fileKey, nodeId, url, order, primary, connectionId,
      verification: { state: verification.state, checkedAt: verification.checkedAt } };
    result.sources.push(row);
    result.omitted--;
    if (Buffer.byteLength(JSON.stringify(result), 'utf8') > maxBytes) {
      result.sources.pop(); result.omitted++; break;
    }
  }
  // Recheck after I/O: revocation/disable during collection must stop delivery.
  await authorize();
  signal?.throwIfAborted();
  return result;
}
