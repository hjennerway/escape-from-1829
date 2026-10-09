import {readFile,writeFile} from 'node:fs/promises';
import {spawn} from 'node:child_process';
const root=new URL('../../',import.meta.url),pkg=JSON.parse(await readFile(new URL('package.json',root),'utf8'));
const commands=pkg.scripts.test.split(' && '),failed=commands.indexOf('node test-jarman.mjs');
if(failed<0)throw Error('Suite checkpoint missing');
const pending=commands.slice(failed+1),results=[];let index=0;
await Promise.all(Array.from({length:3},async()=>{
 while(index<pending.length){
  const command=pending[index++],[program,...args]=command.split(' ');
  if(program!=='node')throw Error('Unexpected test command: '+command);
  const start=Date.now();let output='';const child=spawn(process.execPath,args,{cwd:root,windowsHide:true,stdio:'pipe'});
  for(const stream of [child.stdout,child.stderr])stream.on('data',data=>output+=data);
  const code=await new Promise((resolve,reject)=>{child.once('exit',resolve);child.once('error',reject);});
  await writeFile(new URL(args[0]+'.log',import.meta.url),output);
  results.push({command,code,milliseconds:Date.now()-start});console.log((code?'FAIL: ':'PASS: ')+command);
 }
}));
await writeFile(new URL('remaining-suite.json',import.meta.url),JSON.stringify(results,null,2)+'\n');
if(results.some(r=>r.code))process.exitCode=1;
