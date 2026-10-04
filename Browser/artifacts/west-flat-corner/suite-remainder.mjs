import {readFileSync,writeFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
const root=new URL('../../',import.meta.url),pkg=JSON.parse(readFileSync(new URL('package.json',root),'utf8'));
const commands=pkg.scripts.test.split(' && ').slice(6),results=[];
for(const command of commands){
 const args=command.split(' ').slice(1),run=spawnSync(process.execPath,args,{cwd:root,windowsHide:true,encoding:'utf8',timeout:180000,maxBuffer:8*1024*1024});
 const result={command,code:run.status,error:run.error?.message,output:run.stdout+run.stderr};results.push(result);
 console.log((run.status===0?'PASS':'FAIL')+' '+command);if(run.status!==0)console.log(result.output.slice(-1800));
 writeFileSync(new URL('suite-remainder.json',import.meta.url),JSON.stringify(results,null,2)+'\n');
}
console.log(JSON.stringify({total:results.length,passed:results.filter(r=>r.code===0).length,failed:results.filter(r=>r.code!==0).map(r=>r.command)}));
