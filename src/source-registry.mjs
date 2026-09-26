import { designDiscovery } from './discovery.mjs';

/** Host-owned registration. A lifecycle generation prevents old worker cleanup
 * or late completions from publishing sources after disable/replacement.
 * The host must cancel its RPC on signal abort; racing alone cannot kill I/O.
 */
export function designSourceRegistry({ timeoutMs = 2000 } = {}) {
  if (!Number.isSafeInteger(timeoutMs) || timeoutMs < 1 || timeoutMs > 10000) throw new Error('Invalid source timeout');
  const registrations = new Map();
  return {
    register(pluginId, collect) {
      if (typeof pluginId !== 'string' || !pluginId || typeof collect !== 'function') throw new Error('Invalid source registration');
      const registration = { collect, pending: new Set() };
      const old = registrations.get(pluginId);
      if (old) for (const pending of old.pending) pending.abort();
      registrations.set(pluginId, registration);
      return () => {
        if (registrations.get(pluginId) !== registration) return;
        registrations.delete(pluginId);
        for (const pending of registration.pending) pending.abort();
      };
    },
    async collect(pluginId, { authorize, signal, maxBytes }) {
      const registration = registrations.get(pluginId);
      if (!registration) return { status: 'unavailable' };
      const controller = new AbortController();
      const abort = () => controller.abort();
      signal?.addEventListener('abort', abort, { once: true });
      if (signal?.aborted) abort();
      registration.pending.add(controller);
      let timer;
      let rejectAbort;
      const interrupted = new Promise((_, reject) => {
        rejectAbort = () => reject(new Error('Source collection interrupted'));
        controller.signal.addEventListener('abort', rejectAbort, { once: true });
        if (controller.signal.aborted) rejectAbort();
        timer = setTimeout(abort, timeoutMs);
      });
      try {
        const result = await Promise.race([interrupted, designDiscovery({
          authorize: async () => {
            controller.signal.throwIfAborted();
            if (registrations.get(pluginId) !== registration) throw new Error('Registration replaced');
            await authorize();
          },
          read: () => registration.collect({ signal: controller.signal }),
          signal: controller.signal, maxBytes,
        })]);
        return { status: 'available', contribution: result };
      } catch {
        return { status: 'unavailable' };
      } finally {
        clearTimeout(timer);
        controller.signal.removeEventListener('abort', rejectAbort);
        signal?.removeEventListener('abort', abort);
        registration.pending.delete(controller);
      }
    },
  };
}
