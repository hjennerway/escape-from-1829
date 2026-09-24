import {readFileSync,writeFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
const commands=JSON.parse(readFileSync('package.json')).scripts.test.split(' && ');
const start=commands.indexOf('node test-jarman.mjs');
if(start<0)throw new Error('Missing continuation point');
let log='';const failures=[];
for(const command of commands.slice(start+1)){
 const result=spawnSync(process.execPath,command.split(' ').slice(1),{encoding:'utf8',windowsHide:true,maxBuffer:8*1024*1024});
 log+=command+'\n'+(result.stdout??'')+(result.stderr??'');
 writeFileSync('artifacts/southern-junction-remaining.log',log);
 console.log(command+': '+result.status);
 if(result.status!==0)failures.push(command);
}
console.log(JSON.stringify({tests:commands.length-start-1,failures}));
process.exitCode=failures.length?1:0;
