import {readFile,writeFile} from 'node:fs/promises';
import {spawn} from 'node:child_process';
const browser=new URL('../../',import.meta.url),pkg=JSON.parse(await readFile(new URL('package.json',browser))),commands=pkg.scripts.test.split(/\s*&&\s*/),start=commands.findIndex(c=>c==='node test-jarman.mjs')+1;
if(!start)throw Error('No suite continuation point');
const results=[];let log='';
for(const cmd of commands.slice(start)){
 const args=cmd.split(/\s+/).slice(1);
 const result=await new Promise((resolve,reject)=>{
  const child=spawn(process.execPath,args,{cwd:browser,windowsHide:true,stdio:'pipe'});let output='';
  child.stdout.on('data',d=>output+=String(d));child.stderr.on('data',d=>output+=String(d));
  child.once('error',reject);child.once('close',code=>resolve({cmd,code,output}));
 });
 log+=`${cmd}\n${result.output}\n`;results.push({cmd,code:result.code});
 await writeFile(new URL('./suite-tail.log',import.meta.url),log);
 await writeFile(new URL('./suite-tail.json',import.meta.url),JSON.stringify(results,null,2)+'\n');
 console.log(`${result.code===0?'PASS':'FAIL'}: ${args[0]}`);
}
console.log(JSON.stringify({total:results.length,passed:results.filter(r=>r.code===0).length,failed:results.filter(r=>r.code!==0)}));
