import {readFileSync,writeFileSync,appendFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
const commands=JSON.parse(readFileSync('package.json','utf8')).scripts.test.split('&&').map(s=>s.trim());
const start=commands.findIndex(s=>s==='node test-escape-exterior.mjs');
const log='artifacts/west-front-setback/npm-test-resumed.log';writeFileSync(log,'Continuing the required suite from the corrected exterior survey.\n');
for(const command of commands.slice(start)){
 appendFileSync(log,'\n'+command+'\n');
 const args=command.split(/\s+/).slice(1),r=spawnSync(process.execPath,args,{encoding:'utf8',windowsHide:true,maxBuffer:16*1024*1024});
 appendFileSync(log,(r.stdout??'')+(r.stderr??''));
 console.log(command+': '+r.status);
 if(r.status!==0)process.exit(r.status??1);
}
