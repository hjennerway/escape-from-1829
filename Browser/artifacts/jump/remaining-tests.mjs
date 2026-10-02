import {readFileSync,writeFileSync,appendFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
const scripts=JSON.parse(readFileSync('package.json')).scripts.test.split(' && '),start=scripts.indexOf('node test-larkton-recess.mjs');
if(start<0)throw Error('Missing starting check');
const results=[],log='artifacts/jump/remaining-tests.log';writeFileSync(log,'');
for(const command of scripts.slice(start+1)){
 const result=spawnSync(process.execPath,command.split(' ').slice(1),{encoding:'utf8',windowsHide:true,maxBuffer:8*1024*1024});
 appendFileSync(log,command+'\n'+(result.stdout??'')+(result.stderr??''));
 results.push({command,status:result.status});writeFileSync('artifacts/jump/remaining-tests.json',JSON.stringify(results,null,2));
 console.log(command+': '+result.status);
}
process.exitCode=results.some(r=>r.status!==0)?1:0;
