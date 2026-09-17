import {readFileSync,writeFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
const commands=JSON.parse(readFileSync('Browser/package.json','utf8')).scripts.test.split(' && ');
const start=commands.indexOf('node test-annexe-photo-placement.mjs')+1,results=[];
for(const command of commands.slice(start)){
 const file=command.slice(5),run=spawnSync(process.execPath,[file],{cwd:'Browser',encoding:'utf8'});
 results.push({file,status:run.status,output:run.stdout+run.stderr});
 console.log(`${run.status===0?'PASS':'FAIL'} ${file}`);
}
writeFileSync('Browser/artifacts/irby-red-orange-suite-remaining.json',JSON.stringify(results,null,2));
process.exitCode=results.some(r=>r.status!==0)?1:0;
