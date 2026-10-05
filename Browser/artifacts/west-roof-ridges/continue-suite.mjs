import {spawn} from 'node:child_process';
import {readFile,writeFile} from 'node:fs/promises';
const root=new URL('../../',import.meta.url),output=new URL('./',import.meta.url);
const commands=JSON.parse(await readFile(new URL('package.json',root),'utf8')).scripts.test.split(' && ');
const first=process.argv[2]??'test-farndon.mjs',start=commands.indexOf('node '+first),remaining=commands.slice(start),results=[];
if(start<0)throw Error('Unknown suite entry '+first);
async function worker(){
 while(remaining.length){
  const file=remaining.shift().slice(5);let log='';
  const child=spawn(process.execPath,['--import',new URL('isolate-outputs.mjs',output).href,file],{cwd:root,windowsHide:true,stdio:'pipe'});
  child.stdout.on('data',d=>log+=d);child.stderr.on('data',d=>log+=d);
  const code=await new Promise((resolve,reject)=>{child.once('error',reject);child.once('exit',resolve);});
  await writeFile(new URL(file.replace('.mjs','.log'),output),log);results.push({file,code});console.log((code===0?'PASS ':'FAIL ')+file);
 }
}
await Promise.all([worker(),worker()]);
await writeFile(new URL('remaining-suite.json',output),JSON.stringify({start,checks:results.length,results,failures:results.filter(r=>r.code!==0)},null,2)+'\n');
console.log(JSON.stringify({checks:results.length,failures:results.filter(r=>r.code!==0)}));
