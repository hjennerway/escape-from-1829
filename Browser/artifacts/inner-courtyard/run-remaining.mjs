import {readFileSync,writeFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
const root=new URL('../../',import.meta.url),commands=JSON.parse(readFileSync(new URL('package.json',root))).scripts.test.split(' && '),results=[];
const start=commands.indexOf('node test-east-forward-end.mjs');
for(const command of commands.slice(start)){
 const file=command.split(' ')[1],run=spawnSync(process.execPath,[file],{cwd:root,windowsHide:true,encoding:'utf8'});
 writeFileSync(new URL(file+'.log',import.meta.url),(run.stdout??'')+(run.stderr??''));
 const result={file,status:run.status};
 if(run.status!==0){
  const baseline=spawnSync(process.execPath,['--import','./artifacts/inner-courtyard/before-loader.mjs',file],{cwd:root,windowsHide:true,encoding:'utf8'});
  result.beforeStatus=baseline.status;
  writeFileSync(new URL('before-'+file+'.log',import.meta.url),(baseline.stdout??'')+(baseline.stderr??''));
 }
 results.push(result);writeFileSync(new URL('remaining-results.json',import.meta.url),JSON.stringify(results,null,2)+'\n');
 console.log((run.status===0?'PASS: ':'FAIL: ')+file+(result.beforeStatus===undefined?'':' (original courtyard: '+result.beforeStatus+')'));
}
if(results.some(r=>r.status!==0))process.exitCode=1;
