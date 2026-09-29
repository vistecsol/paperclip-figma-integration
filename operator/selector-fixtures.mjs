import assert from 'node:assert/strict';
// Native GET /tools/connections returns an object envelope; retain its exact order.
export function connectionRows(body) {
 assert.ok(body && !Array.isArray(body) && Array.isArray(body.connections),
  'Native connections response must contain a connections array');
 return body.connections;
}
export const selectorOrders=['foreign-first','shared-first'];
export function draftPayload({kind,applicationId}) {
 assert.ok(['shared','foreign'].includes(kind));
 if(applicationId!==undefined)assert.ok(typeof applicationId==='string'&&applicationId.length>0);
 return {name:kind==='shared'?'Qualification shared draft':'Foreign personal draft',
  ...(applicationId===undefined?{applicationName:'Figma'}:{applicationId}),
  transport:'mcp_remote',authKind:'oauth',credentialPolicy:kind==='shared'?'shared':'per_user',
  status:'draft',enabled:true,config:{sourceTemplateKey:'figma',url:'https://mcp.figma.com/mcp'},
  transportConfig:{url:'https://mcp.figma.com/mcp'},credentialRefs:[]};
}
// Native list order is updatedAt DESC. Create the expected first item last.
export async function seedDraftPair({order,create}) {
 assert.ok(selectorOrders.includes(order));
 const kinds=order==='foreign-first'?['shared','foreign']:['foreign','shared'];
 const first=await create(kinds[0],draftPayload({kind:kinds[0]}));
 assert.ok(first.applicationId,'First native response lacks applicationId');
 const second=await create(kinds[1],draftPayload({kind:kinds[1],applicationId:first.applicationId}));
 assert.equal(second.applicationId,first.applicationId,'Drafts must share native application');
 return Object.fromEntries([[kinds[0],first],[kinds[1],second]]);
}
export function assertDraftPair(rows,state) {
 assert.ok(Array.isArray(rows));assert.equal(rows.length,2,'Fresh selector company must contain exactly two drafts');
 const shared=rows.find(x=>x.id===state.connectionId),foreign=rows.find(x=>x.id===state.foreignConnectionId);
 assert.ok(shared&&foreign);assert.notEqual(state.ownerUserId,state.foreignUserId);
 for(const [row,policy,name,creator] of [[shared,'shared','Qualification shared draft',state.ownerUserId],[foreign,'per_user','Foreign personal draft',state.foreignUserId]]){
  assert.equal(row.applicationId,state.applicationId);assert.equal(row.companyId,state.companyId);
  assert.equal(row.credentialPolicy,policy);assert.equal(row.name,name);assert.equal(row.createdByUserId,creator);
  assert.equal(row.status,'draft');assert.deepEqual(row.credentialSecretRefs,[]);assert.deepEqual(row.credentialRefs??[],[]);
 }
 const expected=state.order==='foreign-first'?[foreign.id,shared.id]:[shared.id,foreign.id];
 assert.ok(selectorOrders.includes(state.order));assert.deepEqual(rows.map(x=>x.id),expected,'Native order differs; never mock or reorder the response');
 return {order:state.order,ids:expected};
}
