import {readFileSync,writeFileSync,appendFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
const commands=JSON.parse(readFileSync('package.json','utf8')).scripts.test.split(' && ');
const remaining=commands.slice(commands.indexOf('node test-larkton-recess.mjs')+1),results=[];
const log='artifacts/wall-mitres/remaining-suite.log';writeFileSync(log,'');
for(const command of remaining){
 const args=command.split(' ').slice(1),run=spawnSync(process.execPath,args,{encoding:'utf8',windowsHide:true});
 appendFileSync(log,'\n'+command+'\n'+run.stdout+run.stderr);
 results.push({command,status:run.status});console.log((run.status===0?'PASS':'FAIL')+': '+args[0]);
}
writeFileSync('artifacts/wall-mitres/remaining-suite.json',JSON.stringify(results,null,2)+'\n');
process.exitCode=results.some(r=>r.status!==0)?1:0;
