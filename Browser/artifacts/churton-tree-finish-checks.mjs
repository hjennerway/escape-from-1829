import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {spawn} from 'node:child_process';
const root=new URL('../',import.meta.url),report=new URL('./churton-tree-finish-checks.json',import.meta.url);
const prior=JSON.parse(readFileSync(new URL('./churton-tree-suite-remaining.json',import.meta.url)));
const results=existsSync(report)?JSON.parse(readFileSync(report)):[];
const done=new Set([...prior,...results].map(r=>r.command));
const all=JSON.parse(readFileSync(new URL('package.json',root))).scripts.test.split(' && ');
const pending=all.slice(all.indexOf('node test-ward-corridors.mjs')).filter(c=>!done.has(c));
async function worker(){
 while(pending.length){
  const command=pending.shift(),name=command.split(' ')[1];
  const result=await new Promise((resolve,reject)=>{
   const child=spawn(process.execPath,command.split(' ').slice(1),{cwd:root,windowsHide:true,stdio:'pipe'});let output='';
   child.stdout.on('data',d=>output+=d);child.stderr.on('data',d=>output+=d);child.on('error',reject);child.on('close',status=>resolve({status,output}));
  });
  writeFileSync(new URL('./churton-tree-'+name+'.log',import.meta.url),result.output);
  results.push({command,status:result.status});writeFileSync(report,JSON.stringify(results,null,2)+'\n');
  console.log(command+': '+result.status);
 }
}
await Promise.all([worker(),worker(),worker()]);
process.exitCode=results.some(r=>r.status!==0)?1:0;
