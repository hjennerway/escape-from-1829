import {readFile,writeFile} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
const root=new URL('../',import.meta.url),pkg=JSON.parse(await readFile(new URL('package.json',root),'utf8'));
const commands=pkg.scripts.test.split(' && '),start=commands.findIndex(s=>s==='node test-east-forward-end.mjs')+1,results=[];
for(const command of commands.slice(start)){
 const args=command.split(' ').slice(1),r=spawnSync(process.execPath,args,{cwd:root,encoding:'utf8',windowsHide:true,maxBuffer:20*1024*1024});
 await writeFile(new URL('facade-trim/'+args[0]+'.log',import.meta.url),(r.stdout??'')+(r.stderr??''));
 results.push({command,status:r.status});console.log((r.status===0?'PASS ':'FAIL ')+command);
}
await writeFile(new URL('facade-trim/remaining-suite.json',import.meta.url),JSON.stringify(results,null,2));
