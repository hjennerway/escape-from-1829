import {readFileSync,writeFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
const scripts=JSON.parse(readFileSync('package.json')).scripts.test.split(' && ');
const start=scripts.indexOf('node test-jarman.mjs'),results=[];
if(start<0)throw new Error('Missing continuation point');
for(const command of scripts.slice(start)){
  const [, ...args]=command.split(' ');
  const result=spawnSync(process.execPath,args,{encoding:'utf8',windowsHide:true,maxBuffer:8*1024*1024});
  results.push({command,code:result.status,output:(result.stdout??'')+(result.stderr??'')});
  writeFileSync('artifacts/front-basement-suite-remaining.json',JSON.stringify(results,null,2)+'\n');
  console.log(command+': '+result.status);
}
process.exitCode=results.some(r=>r.code!==0)?1:0;
