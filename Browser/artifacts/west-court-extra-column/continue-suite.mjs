import {spawn} from 'node:child_process';
import {readFile,writeFile} from 'node:fs/promises';
const root=new URL('../../',import.meta.url),output=new URL('./',import.meta.url);
const commands=JSON.parse(await readFile(new URL('package.json',root),'utf8')).scripts.test.split(' && ');
const section=process.argv[2]==='middle'?'middle':'remaining',jarman=commands.indexOf('node test-jarman.mjs');
const remaining=section==='middle'?commands.slice(commands.indexOf('node test-ground-contact.mjs'),jarman+1):commands.slice(jarman+1),results=[];
async function worker(){
 while(remaining.length){
  const command=remaining.shift(),file=command.slice(5);let log='';
  const child=spawn(process.execPath,['--import',new URL('isolate-suite-output.mjs',output).href,file],{cwd:root,windowsHide:true,stdio:'pipe'});
  child.stdout.on('data',d=>log+=d);child.stderr.on('data',d=>log+=d);
  const code=await new Promise((resolve,reject)=>{child.once('error',reject);child.once('exit',resolve);});
  await writeFile(new URL(file.replace('.mjs','.txt'),output),log);
  results.push({file,code});console.log((code===0?'PASS ':'FAIL ')+file);
 }
}
await Promise.all([worker(),worker()]);
await writeFile(new URL(section+'-suite.json',output),JSON.stringify(results,null,2)+'\n');
console.log(JSON.stringify({checks:results.length,failures:results.filter(r=>r.code!==0)}));
