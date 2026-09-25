import {readFileSync,writeFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
const commands=JSON.parse(readFileSync('Browser/package.json','utf8')).scripts.test.split(' && ');
const start=commands.findIndex(s=>s==='node test-jarman.mjs')+1,results=[];
for(const command of commands.slice(start)){
 const [exe,...args]=command.split(' ');
 const run=spawnSync(process.execPath,args,{cwd:'Browser',windowsHide:true,encoding:'utf8'});
 const item={command,status:run.status,output:run.stdout+run.stderr};results.push(item);
 console.log((run.status===0?'PASS ':'FAIL ')+command);
}
writeFileSync('Browser/artifacts/redesmere-frontage-remaining.json',JSON.stringify(results,null,2));
if(results.some(r=>r.status!==0))process.exitCode=1;
