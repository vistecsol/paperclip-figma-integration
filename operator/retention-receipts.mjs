// Offline receipt assertions only; never starts or mutates a host.
import assert from 'node:assert/strict';
export function assertRetention(before, after) {
  for (const key of ['pluginId','namespace','companyId','projectId','snapshot','repositories','migrationHistory']) {
    assert.notEqual(before[key], undefined, `Missing baseline ${key}`);
    assert.notEqual(after[key], undefined, `Missing restored ${key}`);
    assert.deepEqual(after[key], before[key], `Retention changed: ${key}`);
  }
}
export function assertVersionTransition(before, after, expected) {
  assert.equal(after.version, expected.version);
  assert.equal(after.packageSha256, expected.packageSha256);
  assert.match(after.packageSha256, /^[a-f0-9]{64}$/);
  assert.notEqual(after.version, before.version, 'Same-version reload is not upgrade/rollback proof');
  assert.notEqual(after.packageSha256, before.packageSha256, 'Identical artifact is not a version transition');
  assert.equal(after.status, 'ready');
}
export function assertIndependentInstances(a,b) {
  for (const key of ['databaseIdentity','volumeId','networkId','instanceId']) {
    assert.ok(a[key] && b[key], `Missing ${key}`);
    assert.notEqual(a[key], b[key], `Shared ${key}`);
  }
  assert.equal(a.packageSha256,b.packageSha256);
  assert.match(a.packageSha256,/^[a-f0-9]{64}$/);
  for (const receipt of [a,b]) {
    assert.equal(receipt.developmentCheckoutMounted,false);
    assert.equal(receipt.credentialsCopied,false);
    assert.equal(receipt.productionStorageMounted,false);
    assert.equal(receipt.dockerSocketMounted,false);
  }
}
