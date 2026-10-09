import {readFile,writeFile} from 'node:fs/promises';
import {spawn} from 'node:child_process';
const pkg=JSON.parse(await readFile(new URL('../../package.json',import.meta.url),'utf8'));
const commands=pkg.scripts.test.split(' && '),failedIndex=commands.indexOf('node test-facade-courses.mjs'),results=[];
const prefix=process.argv.includes('--prefix'),selection=prefix?commands.slice(0,failedIndex+1):commands.slice(failedIndex+1);
if(process.argv.includes('--resume')){
 const serial=await readFile(new URL('./serial-continuation.log',import.meta.url),'utf8');
 const completed=[...serial.matchAll(/^node [^\r\n]+/gm)].map(m=>m[0]);
 assertComplete: {
  if(/AssertionError|node:internal|^FAIL[: ]/m.test(serial))throw new Error('Inspect serial failures before resuming');
  const index=selection.indexOf(completed.at(-1));if(index<0)throw new Error('No completed continuation checks found');
  selection.splice(0,index+1);console.log('Resuming after '+completed.at(-1)+'; '+selection.length+' checks remain.');
 }
}
let cursor=0;
await Promise.all(Array.from({length:prefix?1:3},async()=>{
 while(cursor<selection.length){
  const index=cursor++,command=selection[index],args=command.split(' ').slice(1);let output='';
  const status=await new Promise((resolve,reject)=>{
   const child=spawn(process.execPath,args,{cwd:new URL('../../',import.meta.url),windowsHide:true,stdio:['ignore','pipe','pipe']});
   child.stdout.on('data',d=>{output+=d;});child.stderr.on('data',d=>{output+=d;});child.once('error',reject);child.once('exit',resolve);
  });
  process.stdout.write(command+'\n'+output);results.push({index,command,status,output});
 }
}));
results.sort((a,b)=>a.index-b.index);
await writeFile(new URL(prefix?'./prefix-suite.json':'./remaining-suite.json',import.meta.url),JSON.stringify(results,null,2));
console.log(JSON.stringify({checks:results.length,failures:results.filter(r=>r.status!==0).map(r=>r.command)}));
process.exitCode=results.some(r=>r.status!==0)?1:0;
