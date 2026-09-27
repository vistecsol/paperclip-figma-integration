import json,os,pathlib,subprocess,time
p=pathlib.Path(os.environ["PAPERCLIP_RUN_SCRATCH_DIR"])/"runtime";r=json.loads((p/"runtime-result.json").read_text());run=os.environ["PAPERCLIP_RUN_ID"]
def d(*a):return subprocess.check_output(["docker",*a],text=True,stderr=subprocess.STDOUT).strip()
def own(cid):
 i=json.loads(d("inspect",cid))[0]
 assert i["Config"]["Labels"]["vts.figma.run"]==run and i["Name"].startswith("/vts-figma-test-")
 return i
cid=r["containerId"];own(cid)
d("cp",cid+":/app/packages/plugins/sdk/dist",str(p/"sdk-dist"))
r["finalSmokeMemory"]=d("exec",cid,"cat","/sys/fs/cgroup/memory.peak","/sys/fs/cgroup/memory.events")
d("stop","--time","30",cid)
# Authenticated login uses native persistent secret bootstrap and the source entry point.
start=pathlib.Path("operator/start.mjs").read_text().replace("'server/dist/index.js'","'server/src/index.ts'")
(p/"start-source.mjs").write_text(start)
name=r["name"]+"-login"
flags=["--label","vts.figma.issue=VIS-6","--label","vts.figma.run="+run,"--label","vts.figma.purpose=source-runtime-login"]
mem=int(next(x.split()[1] for x in pathlib.Path("/proc/meminfo").read_text().splitlines() if x.startswith("MemAvailable:")))*1024
assert mem>=2952790016, "Login startup headroom insufficient"
login=d("create","--name",name,*flags,"--network",r["name"]+"-egress","--memory","1536m","--memory-swap","1536m","--cpus","1","--pids-limit","256","--security-opt","no-new-privileges","--mount","type=volume,src="+r["volume"]+",dst=/paperclip","-p","127.0.0.1:3310:3310","-e","PAPERCLIP_DEPLOYMENT_MODE=authenticated","-e","PAPERCLIP_DEPLOYMENT_EXPOSURE=private","-e","HOST=0.0.0.0","-e","PORT=3310","-e","SERVE_UI=true","-e","PAPERCLIP_PUBLIC_URL=http://localhost:3310","-e","PAPERCLIP_AUTH_PUBLIC_BASE_URL=http://localhost:3310","-e","PAPERCLIP_AUTH_BASE_URL_MODE=explicit","-e","PAPERCLIP_ALLOWED_HOSTNAMES=localhost,127.0.0.1","-e","PAPERCLIP_ANNOUNCEMENTS_ENABLED=false","-e","PAPERCLIP_MIGRATION_AUTO_APPLY=true","-e","NODE_OPTIONS=--max-old-space-size=1024",r["image"],"node","/app/start-source.mjs")
r["login"]={"containerId":login,"name":name,"origin":"http://localhost:3310","bind":"127.0.0.1:3310","visibleMemAvailable":mem}
(p/"runtime-result.json").write_text(json.dumps(r,indent=2))
own(login)
for rel in ["server/src","packages/shared/src","packages/adapter-utils/src"]:
 d("cp",str(p/"host"/rel)+"/.",login+":/app/"+rel)
d("cp",str(p/"sdk-dist")+"/.",login+":/app/packages/plugins/sdk/dist")
d("cp",str(p/"host/figma-candidate"),login+":/app/figma-candidate")
d("cp",str(p/"start-source.mjs"),login+":/app/start-source.mjs")
d("start",login)
for _ in range(15):
 time.sleep(4)
 if not own(login)["State"]["Running"]:break
 x=subprocess.run(["docker","exec",login,"node","-e","Promise.all(['/api/health','/'].map(async p=>{const r=await fetch('http://127.0.0.1:3310'+p);return {path:p,status:r.status,type:r.headers.get('content-type'),body:p.includes('health')?await r.json():undefined}})).then(x=>console.log(JSON.stringify(x)))"],capture_output=True,text=True)
 if x.returncode==0:
  r["login"]["http"]=json.loads(x.stdout);break
r["login"]["state"]=own(login)["State"]
if r["login"]["state"]["Running"]:
 r["login"]["cgroup"]=d("exec",login,"cat","/sys/fs/cgroup/memory.max","/sys/fs/cgroup/cpu.max","/sys/fs/cgroup/memory.peak","/sys/fs/cgroup/memory.events")
(p/"runtime-result.json").write_text(json.dumps(r,indent=2))
print(json.dumps(r["login"],indent=2))
