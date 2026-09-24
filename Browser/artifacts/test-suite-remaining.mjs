import {readFileSync,writeFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
const scripts=JSON.parse(readFileSync('package.json')).scripts.test.split(' && ');
const start=scripts.indexOf('node test-jarman.mjs');if(start<0)throw new Error('Jarman test missing');
let log='';
for(const command of scripts.slice(start)){
 const [executable,...args]=command.split(' ');
 const result=spawnSync(process.execPath,args,{encoding:'utf8',windowsHide:true,maxBuffer:8*1024*1024});
 log+=command+'\n'+(result.stdout??'')+(result.stderr??'');
 writeFileSync('artifacts/test-suite-remaining.log',log);
 console.log(command+': '+result.status);
 if(result.status!==0) {console.log(result.stdout,result.stderr);process.exit(result.status??1);}
}
