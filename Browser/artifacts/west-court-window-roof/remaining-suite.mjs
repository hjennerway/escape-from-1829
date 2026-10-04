import {readFile,writeFile} from 'node:fs/promises';
import {spawn} from 'node:child_process';
const browser=new URL('../../',import.meta.url);
const {scripts}=JSON.parse(await readFile(new URL('package.json',browser),'utf8'));
const commands=scripts.test.split(' && '),start=commands.findIndex(s=>s==='node test-jarman.mjs');
if(start<0)throw Error('Jarman stopping point missing');
const results=[];
for(const command of commands.slice(start+1)){
  const script=command.replace(/^node /,'');
  const result=await new Promise((resolve,reject)=>{
    const child=spawn(process.execPath,[script],{cwd:browser,windowsHide:true,stdio:['ignore','pipe','pipe']});
    let output='';for(const stream of [child.stdout,child.stderr])stream.on('data',d=>output+=d);
    child.once('error',reject);child.once('close',code=>resolve({script,code,output}));
  });
  results.push(result);console.log(`${result.code===0?'PASS':'FAIL'} ${script}`);
  await writeFile(new URL('remaining-suite.json',import.meta.url),JSON.stringify(results,null,2)+'\n');
}
console.log(JSON.stringify({passed:results.filter(r=>r.code===0).length,failed:results.filter(r=>r.code!==0).map(r=>r.script)}));
process.exitCode=results.some(r=>r.code!==0)?1:0;
