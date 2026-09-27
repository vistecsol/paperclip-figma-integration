// Execute only inside the ownership-verified, isolated VIS-6 test container.
// Synthetic credentials stay in its private test volume; sessions stay in memory.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { randomBytes } from 'node:crypto';
const root = '/paperclip/instances/default/test-bootstrap';
const origin = 'http://localhost:3310';
const path = `${root}/synthetic-ui-account.json`;
const fresh = !existsSync(path);
const account = fresh ? { email: 'figma-ui-test@example.invalid', name: 'Figma UI Test Operator', password: randomBytes(32).toString('hex') } : JSON.parse(readFileSync(path, 'utf8'));
if (fresh) writeFileSync(path, JSON.stringify(account), { mode: 0o600, flag: 'wx' });
let cookie = '';
const evidence = [];
async function request(path, body) {
  const response = await fetch(`http://127.0.0.1:3310${path}`, {
    method: body === undefined ? 'GET' : 'POST',
    headers: { 'Content-Type': 'application/json', Origin: origin, Host: 'localhost:3310', ...(cookie ? { Cookie: cookie } : {}) },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  const cookies = response.headers.getSetCookie();
  if (cookies.length) cookie = cookies.map(item => item.split(';')[0]).join('; ');
  const data = await response.json();
  const safePath = path.replace(/board-claim\/[^/]+/, 'board-claim/[redacted]');
  evidence.push({ path: safePath, status: response.status });
  if (!response.ok) throw new Error(`Native request failed: ${safePath}: HTTP ${response.status} ${typeof data.code === 'string' && /^[A-Z_]+$/.test(data.code) ? data.code : 'request_rejected'}`);
  return data;
}
try {
  await request(`/api/auth/${account.registered ? 'sign-in' : 'sign-up'}/email`, account);
  if (!account.registered) { account.registered = true; writeFileSync(path, JSON.stringify(account), { mode: 0o600 }); }
  const health = await request('/api/health');
  if (health.bootstrapStatus === 'bootstrap_pending') await request('/api/bootstrap/claim', {});
  if (process.env.VTS_NATIVE_CLAIM_STDIN === '1') {
    const claim = JSON.parse(readFileSync(0, 'utf8'));
    await request(`/api/board-claim/${claim.token}/claim`, { code: claim.code });
  }
  // Explicit claim is idempotently skipped on later runs using the local receipt.
  if (!existsSync(`${root}/synthetic-ui-state.json`)) {
    const companies = await request('/api/companies');
    const company = companies.find(item => item.id === process.env.VTS_TEST_COMPANY_ID) ?? await request('/api/companies', { name: 'VTS Figma UI Test' });
    writeFileSync(`${root}/synthetic-ui-state.json`, JSON.stringify({ companyId: company.id, companyPrefix: company.issuePrefix }), { mode: 0o600, flag: 'wx' });
  }
  const state = JSON.parse(readFileSync(`${root}/synthetic-ui-state.json`, 'utf8'));
  const members = await request(`/api/companies/${state.companyId}/members`);
  const gallery = await request(`/api/companies/${state.companyId}/tools/gallery`);
  const figma = gallery.apps.find(app => app.key === 'figma' || app.slug === 'figma');
  let attachment = null;
  if (process.env.VTS_TEST_PROJECT_ID && process.env.VTS_TEST_PLUGIN_ID) {
    const designs = await request(`/api/plugins/${process.env.VTS_TEST_PLUGIN_ID}/api/projects/${process.env.VTS_TEST_PROJECT_ID}/designs?companyId=${state.companyId}`);
    attachment = { revision: designs.revision, count: designs.attachments?.length, retained: designs.attachments?.some(item => item.id === 'e9204aa4-f23e-40ee-8960-15757dbda914'), states: designs.attachments?.map(item => item.verification?.state) };
  }
  let connect = null;
  if (process.env.VTS_PREPARE_FIGMA_CONNECT === '1') {
    const receiptPath = `${root}/figma-connect-receipt.json`;
    if (existsSync(receiptPath)) connect = JSON.parse(readFileSync(receiptPath, 'utf8'));
    else {
      const result = await request(`/api/companies/${state.companyId}/tools/apps/connect`, { galleryKey: 'figma', grantKind: 'organization' });
      const url = result.auth?.startUrl ? new URL(result.auth.startUrl) : null;
      connect = { connectionId: result.connectionId, authKind: result.auth?.kind, authorizationOrigin: url?.origin ?? null, authorizationPath: url?.pathname ?? null, humanConsentPerformed: false };
      writeFileSync(receiptPath, JSON.stringify(connect), { mode: 0o600, flag: 'wx' });
    }
  }
  console.log(JSON.stringify({ ...state, attachment, connect, evidence, memberCount: members.members.length, figmaPresent: !!figma, figmaSlug: figma?.slug ?? figma?.key ?? null }, null, 2));
} catch (error) { console.error(JSON.stringify({ evidence, error: error.message })); process.exitCode = 1; }
