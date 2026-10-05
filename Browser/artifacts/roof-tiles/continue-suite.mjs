import {readFile,writeFile} from 'node:fs/promises';
import {spawn} from 'node:child_process';
const cwd=new URL('../../',import.meta.url),pkg=JSON.parse(await readFile(new URL('package.json',cwd),'utf8'));
const tests=pkg.scripts.test.split(' && '),start=tests.indexOf('node '+(process.argv[2]??'test-jarman.mjs'))+1,results=[];
if(start===0)throw Error('Unknown suite continuation point');
for(const command of tests.slice(start)){
 const args=command.split(' ').slice(1),result=await new Promise(resolve=>{
  const child=spawn(process.execPath,args,{cwd,windowsHide:true,stdio:'pipe'});let output='';
  child.stdout.on('data',d=>output+=d);child.stderr.on('data',d=>output+=d);
  child.on('error',error=>resolve({command,code:-1,output:String(error)}));
  child.on('exit',code=>resolve({command,code,output}));
 });
 results.push(result);console.log((result.code===0?'PASS: ':'FAIL: ')+command);
 await writeFile(new URL('./remaining-suite.json',import.meta.url),JSON.stringify(results,null,2)+'\n');
}
console.log(JSON.stringify({passed:results.filter(r=>r.code===0).length,failed:results.filter(r=>r.code!==0).map(r=>r.command)}));
if(results.some(r=>r.code!==0))process.exitCode=1;
