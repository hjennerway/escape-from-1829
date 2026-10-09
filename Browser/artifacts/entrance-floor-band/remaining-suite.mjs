import {readFile,writeFile} from 'node:fs/promises';
import {spawn} from 'node:child_process';
const pkg=JSON.parse(await readFile(new URL('../../package.json',import.meta.url),'utf8'));
const commands=pkg.scripts.test.split(' && '),start=commands.indexOf('node test-jarman.mjs')+1;
const remaining=commands.slice(start),results=[];let cursor=0;
await Promise.all(Array.from({length:3},async()=>{
 while(cursor<remaining.length){
  const index=cursor++,command=remaining[index],args=command.split(' ').slice(1);let output='';
  const status=await new Promise((resolve,reject)=>{
   const child=spawn(process.execPath,args,{cwd:new URL('../../',import.meta.url),windowsHide:true,stdio:['ignore','pipe','pipe']});
   child.stdout.on('data',d=>output+=d);child.stderr.on('data',d=>output+=d);child.once('error',reject);child.once('exit',resolve);
  });
  await writeFile(new URL(command.split(' ')[1]+'.log',import.meta.url),output);
  results.push({index:start+index,command,status});console.log((status===0?'PASS: ':'FAIL: ')+command);
 }
}));
results.sort((a,b)=>a.index-b.index);
await writeFile(new URL('remaining-suite.json',import.meta.url),JSON.stringify(results,null,2)+'\n');
console.log(JSON.stringify({checks:results.length,failures:results.filter(r=>r.status!==0)}));
process.exitCode=results.some(r=>r.status!==0)?1:0;
