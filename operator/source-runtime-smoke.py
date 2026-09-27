#!/usr/bin/env python3
"""One source startup smoke; immutable image deps, fresh state, no published port."""
import hashlib,json,os,pathlib,subprocess,time
root=pathlib.Path(__file__).resolve().parent.parent
scratch=pathlib.Path(os.environ["PAPERCLIP_RUN_SCRATCH_DIR"])/"runtime"
host=scratch/"host"
run=os.environ["PAPERCLIP_RUN_ID"]
name="vts-figma-test-source-"+run[:8]
image="sha256:a02ac35ac41df911af477422ea0e781cf41d2b2c600c66f0a5ac9d8c63f52c2c"
labels={"vts.figma.issue":"VIS-6","vts.figma.run":run,"vts.figma.purpose":"source-runtime-smoke"}
record={"image":image,"name":name,"sourceCommit":"d554c4789ed3930f8a53ac9fdf6503b3187097da","memoryBytes":1536*1024**2,"cpus":1,"reserveBytes":1280*1024**2,"started":False}
def call(*args):
    return subprocess.check_output(args,text=True,stderr=subprocess.STDOUT).strip()
def docker(*args): return call("docker",*args)
def owned():
    item=json.loads(docker("inspect",record["containerId"]))[0]
    assert all(item["Config"]["Labels"].get(k)==v for k,v in labels.items())
    assert item["Name"]=="/"+name
    return item
def save(): (scratch/"runtime-result.json").write_text(json.dumps(record,indent=2)+"\n")
mem=int(next(x.split()[1] for x in pathlib.Path("/proc/meminfo").read_text().splitlines() if x.startswith("MemAvailable:")))*1024
record["visibleMemAvailable"]=mem
assert mem>=record["memoryBytes"]+record["reserveBytes"],"Insufficient runtime headroom"
assert hashlib.sha256((scratch/"source.tar.gz").read_bytes()).hexdigest()==json.loads((root/"operator/source-pin.json").read_text())["archiveSha256"]
assert json.loads((host/"server/package.json").read_text())["scripts"]["dev"]=="tsx src/index.ts"
flags=[v for k,val in labels.items() for v in ("--label",k+"="+val)]
record["networkId"]=docker("network","create","--internal",*flags,name+"-net")
record["volume"]=docker("volume","create",*flags,name+"-state")
lock=hashlib.sha256((host/"pnpm-lock.yaml").read_bytes()).hexdigest()
launcher=f"""
import {{readFileSync,statfsSync}} from 'node:fs';
import {{createHash,randomBytes}} from 'node:crypto';
const digest=createHash('sha256').update(readFileSync('/app/pnpm-lock.yaml')).digest('hex');
if(digest!=={json.dumps(lock)}) throw Error('Image dependency lock differs from pinned source');
const limits=Object.fromEntries(['memory.max','memory.swap.max','cpu.max','pids.max','memory.events'].map(n=>[n,readFileSync('/sys/fs/cgroup/'+n,'utf8').trim()]));
if(limits['memory.max']!=='1610612736'||limits['memory.swap.max']!=='0'||limits['cpu.max']!=='100000 100000') throw Error('Ineffective containment');
const free=Number(readFileSync('/proc/meminfo','utf8').match(/MemAvailable:\\s+(\\d+)/)[1])*1024;
const disk=statfsSync('/paperclip');const diskFree=disk.bavail*disk.bsize;
console.log(JSON.stringify({{event:'runtime-preflight',limits,memAvailable:free,diskFree,dependencyLock:digest}}));
if(free<2952790016||diskFree<2147483648) throw Error('Daemon runtime headroom/storage reserve failed');
for(const key of ['BETTER_AUTH_SECRET','PAPERCLIP_TOOL_ACTION_SIGNING_SECRET']) process.env[key]=randomBytes(32).toString('hex');
process.chdir('/app');
process.execve(process.execPath,[process.execPath,'--import','./server/node_modules/tsx/dist/loader.mjs','server/src/index.ts'],process.env);
"""
(scratch/"runtime-smoke.mjs").write_text(launcher)
try:
    record["containerId"]=docker("create","--name",name,*flags,"--network",name+"-net","--memory","1536m","--memory-swap","1536m","--cpus","1","--pids-limit","256","--security-opt","no-new-privileges","--mount","type=volume,src="+name+"-state,dst=/paperclip","-e","PAPERCLIP_DEPLOYMENT_MODE=local_trusted","-e","HOST=127.0.0.1","-e","SERVE_UI=false","-e","PAPERCLIP_ANNOUNCEMENTS_ENABLED=false","-e","PAPERCLIP_MIGRATION_AUTO_APPLY=true","-e","NODE_OPTIONS=--max-old-space-size=1024",image,"node","/app/runtime-smoke.mjs")
    owned()
    for relative in ["server/src","packages/shared/src","packages/adapter-utils/src","packages/plugins/sdk/src"]:
        docker("cp",str(host/relative)+"/.",record["containerId"]+":/app/"+relative)
    docker("cp",str(host/"figma-candidate"),record["containerId"]+":/app/figma-candidate")
    docker("cp",str(scratch/"runtime-smoke.mjs"),record["containerId"]+":/app/runtime-smoke.mjs")
    owned()
    docker("start",record["containerId"])
    record["started"]=True
    started=time.monotonic()
    for attempt in range(18):
        time.sleep(5)
        state=owned()["State"]
        if not state["Running"]: break
        check=subprocess.run(["docker","exec",record["containerId"],"node","-e","fetch('http://127.0.0.1:3100/api/health').then(async r=>{console.log(await r.text());process.exit(r.ok?0:1)}).catch(()=>process.exit(1))"],capture_output=True,text=True)
        if check.returncode==0:
            record["health"]=json.loads(check.stdout)
            break
    record["elapsedSeconds"]=round(time.monotonic()-started,2)
    record["state"]=owned()["State"]
    logs=docker("logs",record["containerId"])
    # Logs remain private scratch; only dependency errors and safe measurements enter evidence.
    (scratch/"runtime-private.log").write_text(logs)
    for line in logs.splitlines():
        if line.startswith('{"event":"runtime-preflight"'): record["runtimePreflight"]=json.loads(line)
    record["errors"]=[line for line in logs.splitlines() if "Error" in line or "Cannot find" in line or "ERR_" in line]
    if record["state"]["Running"]:
        record["cgroup"]=docker("exec",record["containerId"],"cat","/sys/fs/cgroup/memory.peak","/sys/fs/cgroup/memory.events")
except subprocess.CalledProcessError as e:
    record["failure"]={"command":e.cmd,"returncode":e.returncode,"output":e.output}
finally:
    save()
print(json.dumps(record,indent=2))
