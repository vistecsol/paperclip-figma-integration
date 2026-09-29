// Pure inspection validation; does not contact Docker or mutate resources.
import assert from 'node:assert/strict';
export const origin = 'http://localhost:3310';
export function validateRouting({app,browser,network,volume,run,issue='VIS-6'}) {
 const owned=(r,name)=>{
  assert.ok(name.startsWith('vts-figma-test-'),'Test namespace required');
  const labels=r.Config?.Labels??r.Labels;
  assert.equal(labels?.['vts.figma.issue'],issue,'Issue ownership');
  assert.equal(labels?.['vts.figma.run'],run,'Run ownership');
 };
 const limits=(r,memory)=>{
  assert.equal(r.State.Running,true,'Container not running');
  assert.equal(r.HostConfig.Memory,memory,'Memory cap');
  assert.equal(r.HostConfig.MemorySwap,memory,'Swap disabled');
  assert.equal(r.HostConfig.NanoCpus,1000000000,'One CPU required');
  assert.equal(r.HostConfig.PidsLimit,256,'PID cap');
  assert.equal(r.HostConfig.Privileged,false,'No privileged containers');
  assert.ok(!r.HostConfig.Binds?.length,'No bind mounts');
  assert.ok(!r.HostConfig.Devices?.length,'No host devices');
  assert.ok(!r.HostConfig.CapAdd?.length,'No extra capabilities');
 };
 owned(app,app.Name.replace(/^\//,'')); limits(app,1536*1024**2);
 owned(network,network.Name);assert.equal(network.Internal,true,'Internal network required');
 owned(volume,volume.Name);
 assert.deepEqual(Object.keys(app.NetworkSettings.Networks),[network.Name],'No external app network');
 assert.equal(app.NetworkSettings.Networks[network.Name].NetworkID,network.Id);
 assert.equal(app.Mounts.length,1,'Only fresh state volume permitted');
 assert.equal(app.Mounts[0].Type,'volume');assert.equal(app.Mounts[0].Name,volume.Name);
 assert.equal(app.Mounts[0].Destination,'/paperclip');
 if(browser){
  owned(browser,browser.Name.replace(/^\//,''));limits(browser,768*1024**2);
  assert.equal(browser.HostConfig.NetworkMode,'container:'+app.Id,'Browser must share exact test app network namespace');
  assert.deepEqual(browser.Mounts,[],'Browser may not mount state or sockets');
 }
 return {origin,networkId:network.Id,appId:app.Id,browserId:browser?.Id??null,providerEgress:false};
}
