import { definePlugin, runWorker } from '@paperclipai/plugin-sdk';
import { designWorker } from './worker.mjs';
let worker;
const plugin = definePlugin({
  async setup(ctx) {
    worker = designWorker(ctx);
    ctx.data.register('designs.list', () => worker.onApiRequest());
    ctx.actions.register('designs.mutate', () => worker.onApiRequest());
    ctx.actions.register('designs.verify', () => worker.onApiRequest());
    // A missing method fails initialization on an unpatched host. A supported
    // host denies this deliberately unscoped probe without touching storage.
    const probe = await ctx.projectDesigns.execute();
    if (probe?.status !== 403 || probe.body?.error !== 'design_access_denied') {
      throw new Error('Figma host RPC prerequisite negotiation failed');
    }
  },
  async onApiRequest() { return worker.onApiRequest(); },
  async onHealth() { return worker.onHealth(); },
});
export default plugin;
runWorker(plugin, import.meta.url);
