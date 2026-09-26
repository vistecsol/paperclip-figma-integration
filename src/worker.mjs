/** The worker cannot supply SQL, actor, route or project authority to the host.
 * execute() runs only the original request captured by the host API route.
 */
export function designWorker({ projectDesigns }) {
  if (typeof projectDesigns?.execute !== 'function') throw new Error('Figma host RPC prerequisite required');
  return Object.freeze({
    async onApiRequest() {
      try { return await projectDesigns.execute(); }
      catch { return { status: 502, body: { error: 'design_operation_failed' } }; }
    },
    async onHealth() {
      return { status: 'degraded', message: 'Attachment RPC available; managed inspection and release qualification incomplete' };
    },
  });
}
