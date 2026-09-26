const readline = require('node:readline');
const pending = new Map();
const send = message => process.stdout.write(JSON.stringify(message) + '\n');
readline.createInterface({ input: process.stdin }).on('line', line => {
  const message = JSON.parse(line);
  if (pending.has(message.id)) {
    const original = pending.get(message.id); pending.delete(message.id);
    send({ jsonrpc: '2.0', id: original.id, ...(message.error ? { error: message.error } :
      { result: { serialized: JSON.stringify(original), value: message.result } }) });
  } else if (message.method === 'initialize') {
    send({ jsonrpc: '2.0', id: message.id, result: { ok: true, supportedMethods: ['handleApiRequest'] } });
  } else if (message.method === 'handleApiRequest') {
    const id = `nested-${message.id}`; pending.set(id, message);
    send({ jsonrpc: '2.0', id, method: message.params.testHostMethod || 'companies.get', paperclipInvocationId: message.paperclipInvocation.id,
      params: { companyId: message.params.companyId, actor: { type: 'board', isInstanceAdmin: true }, projectId: 'foreign' } });
  } else if (message.method === 'shutdown') {
    send({ jsonrpc: '2.0', id: message.id, result: {} }); setImmediate(() => process.exit(0));
  }
});
