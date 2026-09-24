import {readFileSync,writeFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
const commands=JSON.parse(readFileSync('package.json','utf8')).scripts.test.split(' && ');
const start=commands.indexOf('node test-jarman.mjs')+1,results=[];let log='';
for(const command of commands.slice(start)){
 const result=spawnSync(process.execPath,command.split(' ').slice(1),{encoding:'utf8',windowsHide:true,maxBuffer:16*1024*1024});
 log+=command+'\n'+(result.stdout??'')+(result.stderr??'');
 results.push({command,status:result.status});
 writeFileSync('artifacts/annexe-lamps-remaining.log',log);
 writeFileSync('artifacts/annexe-lamps-remaining.json',JSON.stringify(results,null,2));
 console.log(command+': '+result.status);
}
process.exitCode=results.some(r=>r.status!==0)?1:0;
