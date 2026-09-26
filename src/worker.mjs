import { designApi } from './api.mjs';
import { designService } from './service.mjs';

/** Definition factory for definePlugin. No fallback bridge: host prerequisite
 * negotiation and invocation-bound RPC client must succeed before setup.
 * Call-scoped authority lives on the host, never in this worker singleton.
 */
export function designWorker({ store, bridge }) {
  const service = designService(store, bridge);
  return Object.freeze({
    onApiRequest: designApi(service),
    async onHealth() { return { status: 'ok', message: 'Design attachment worker ready' }; },
  });
}
