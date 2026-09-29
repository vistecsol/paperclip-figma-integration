// Read-only, exact synthetic plugin/company/project scope. No vault or credential queries.
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const postgres=createRequire('/app/packages/db/package.json')('postgres');
export async function collectRetention(state) {
 for(const id of [state.installed.id,state.companyId,state.projectId])assert.match(id,/^[a-f0-9-]{36}$/);
 const sql=postgres({host:'127.0.0.1',port:54329,database:'paperclip',username:'paperclip',password:'paperclip',max:1,connect_timeout:5});
 try{return await sql.begin('read only',async q=>{
  const ns=await q`SELECT namespace_name FROM plugin_database_namespaces WHERE plugin_id=${state.installed.id}`;
  assert.equal(ns.length,1);const namespace=ns[0].namespace_name;
  assert.equal(namespace,'plugin_figma_2fe47c3b41');
  const rows=await q`SELECT revision,attachments FROM ${q(namespace+'.project_designs')} WHERE company_id=${state.companyId} AND project_id=${state.projectId}`;
  assert.equal(rows.length,1);
  const migrationHistory=await q`SELECT migration_key,checksum,plugin_version,status,applied_at FROM plugin_migrations WHERE plugin_id=${state.installed.id} ORDER BY migration_key`;
  assert.ok(migrationHistory.length);assert.ok(migrationHistory.every(x=>x.status==='applied'));
  const config=await q`SELECT config_json FROM plugin_config WHERE plugin_id=${state.installed.id} AND company_id=${state.companyId}`;
  assert.equal(config.length,1);assert.deepEqual(config[0].config_json,{enabled:true});
  const plugin=await q`SELECT id,plugin_key,version,status FROM plugins WHERE id=${state.installed.id}`;
  assert.equal(plugin.length,1);
  return JSON.parse(JSON.stringify({pluginId:state.installed.id,namespace,companyId:state.companyId,projectId:state.projectId,
   snapshot:{revision:Number(rows[0].revision),attachments:rows[0].attachments},migrationHistory,config:config[0].config_json,plugin:plugin[0]}));
 });}finally{await sql.end({timeout:3});}
}
