import {readFileSync,writeFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
const commands=JSON.parse(readFileSync('package.json')).scripts.test.split(' && ');
const start=commands.indexOf('node test-west-side-basement.mjs')+1;
const results=[];
for(const command of commands.slice(start)){
  const args=command.split(' ').slice(1);
  const r=spawnSync(process.execPath,args,{encoding:'utf8',windowsHide:true,maxBuffer:8*1024*1024});
  results.push({command,status:r.status});
  writeFileSync('artifacts/west-basement-'+args[0]+'.log',(r.stdout??'')+(r.stderr??''));
  writeFileSync('artifacts/west-basement-remaining.json',JSON.stringify(results,null,2));
  console.log(command+': '+r.status);
}
console.log(JSON.stringify({passed:results.filter(r=>r.status===0).length,failed:results.filter(r=>r.status!==0)},null,2));
