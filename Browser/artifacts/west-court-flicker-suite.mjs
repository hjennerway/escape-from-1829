import {readFileSync,writeFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
const cwd=new URL('../',import.meta.url),commands=JSON.parse(readFileSync(new URL('package.json',cwd))).scripts.test.split(' && ');
const first=spawnSync(process.execPath,['C:/Program Files/nodejs/node_modules/npm/bin/npm-cli.js','test'],{cwd,windowsHide:true,encoding:'utf8',maxBuffer:10*1024*1024});
const output=(first.stdout??'')+(first.stderr??'');writeFileSync(new URL('./west-court-flicker-suite.log',import.meta.url),output);
console.log(output.slice(-5000));
const failing=output.match(/at file:.*\/(test-[^/:]+\.mjs):/);
const results=[];
if(first.status&&failing){
  const start=commands.findIndex(c=>c==='node '+failing[1]);
  results.push({file:failing[1],status:first.status});
  for(const command of commands.slice(start+1)){
    const file=command.split(' ')[1],r=spawnSync(process.execPath,[file],{cwd,windowsHide:true,encoding:'utf8',maxBuffer:10*1024*1024});
    writeFileSync(new URL('./west-court-flicker-'+file+'.log',import.meta.url),(r.stdout??'')+(r.stderr??''));
    results.push({file,status:r.status});console.log((r.status?'FAIL: ':'PASS: ')+file);
  }
}
writeFileSync(new URL('./west-court-flicker-suite.json',import.meta.url),JSON.stringify({firstStatus:first.status,continued:results},null,2)+'\n');
if(first.status)process.exitCode=1;
