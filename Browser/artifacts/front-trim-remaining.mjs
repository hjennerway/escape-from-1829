import {readFileSync,writeFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
const commands=JSON.parse(readFileSync(new URL('../package.json',import.meta.url))).scripts.test.split(' && ');
const start=commands.findIndex(s=>s==='node test-jarman.mjs')+1,results=[];
for(const command of commands.slice(start)){
 const file=command.split(' ')[1],r=spawnSync(process.execPath,[file],{cwd:new URL('../',import.meta.url),windowsHide:true,encoding:'utf8'});
 writeFileSync(new URL('./front-trim-'+file+'.log',import.meta.url),(r.stdout??'')+(r.stderr??''));
 results.push({file,status:r.status});console.log((r.status===0?'PASS: ':'FAIL: ')+file);
}
writeFileSync(new URL('./front-trim-remaining.json',import.meta.url),JSON.stringify(results,null,2)+'\n');
if(results.some(r=>r.status!==0))process.exitCode=1;