import {readFile,writeFile} from 'node:fs/promises';
import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const cwd=fileURLToPath(new URL('../../',import.meta.url));
const pkg=JSON.parse(await readFile(new URL('../../package.json',import.meta.url)));
const results=[];
for(const command of pkg.scripts.test.split(' && ')){
 const [exe,...args]=command.split(' ');let output='';
 const code=await new Promise((resolve,reject)=>{
  const child=spawn(exe==='node'?process.execPath:exe,args,{cwd,windowsHide:true,stdio:['ignore','pipe','pipe']});
  child.stdout.on('data',d=>output+=d);child.stderr.on('data',d=>output+=d);child.on('error',reject);child.on('exit',resolve);
 });
 results.push({command,code,output});await writeFile(new URL('suite-results.json',import.meta.url),JSON.stringify(results,null,2)+'\n');
 console.log((code?'FAIL: ':'PASS: ')+command);if(code)console.log(output.slice(-2400));
}
console.log(JSON.stringify({checks:results.length,passed:results.filter(r=>!r.code).length,failed:results.filter(r=>r.code).map(r=>r.command)}));
process.exitCode=results.some(r=>r.code)?1:0;
