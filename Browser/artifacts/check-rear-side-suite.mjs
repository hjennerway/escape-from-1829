import {readFileSync,writeFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
const pkg=JSON.parse(readFileSync('Browser/package.json')),results=[];
for(const command of pkg.scripts.test.split(' && ')){const file=command.replace(/^node /,''),p=spawnSync(process.execPath,[file],{cwd:'Browser',encoding:'utf8',windowsHide:true});results.push({file,status:p.status,output:p.stdout+p.stderr});if(p.status)console.log('FAIL '+file);}
writeFileSync('Browser/artifacts/rear-side-results.json',JSON.stringify(results,null,2));console.log(results.filter(r=>!r.status).length+'/'+results.length+' passed');
