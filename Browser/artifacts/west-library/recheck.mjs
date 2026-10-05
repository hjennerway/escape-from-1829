import {readFile,writeFile} from 'node:fs/promises';
import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const cwd=fileURLToPath(new URL('../../',import.meta.url));
const checks=process.argv.slice(2),results=[];
for(const name of checks){
 let output='';const code=await new Promise((resolve,reject)=>{const child=spawn(process.execPath,[name],{cwd,windowsHide:true,stdio:['ignore','pipe','pipe']});child.stdout.on('data',d=>output+=d);child.stderr.on('data',d=>output+=d);child.once('error',reject);child.once('exit',resolve);});
 results.push({name,code,output});console.log(output);await writeFile(new URL('final-rechecks.json',import.meta.url),JSON.stringify(results,null,2)+'\n');
}
process.exitCode=results.some(r=>r.code)?1:0;
