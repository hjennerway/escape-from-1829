import {readFileSync,writeFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
const commands=JSON.parse(readFileSync(new URL('../package.json',import.meta.url))).scripts.test.split(' && ');
const start=commands.indexOf('node test-ward-corridors.mjs');
if(start<0)throw new Error('Suite continuation point missing');
let output='';const results=[];
for(const command of commands.slice(start)){
 const result=spawnSync(process.execPath,command.split(' ').slice(1),{cwd:new URL('../',import.meta.url),encoding:'utf8',windowsHide:true,maxBuffer:8*1024*1024});
 output+=command+'\n'+(result.stdout??'')+(result.stderr??'');
 results.push({command,status:result.status});
 writeFileSync(new URL('./churton-tree-suite-remaining.log',import.meta.url),output);
 writeFileSync(new URL('./churton-tree-suite-remaining.json',import.meta.url),JSON.stringify(results,null,2)+'\n');
 console.log(command+': '+result.status);
}
process.exitCode=results.some(r=>r.status!==0)?1:0;
