import {readFile,writeFile} from 'node:fs/promises';
import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const cwd=fileURLToPath(new URL('../../',import.meta.url));
const commands=JSON.parse(await readFile(new URL('../../package.json',import.meta.url),'utf8')).scripts.test.split(' && ');
const start=commands.findIndex(c=>c==='node test-facade-courses.mjs')+1,results=[];
for(const command of commands.slice(start)){
 const args=command.slice('node '.length).split(' '),file=args[0],child=spawn(process.execPath,args,{cwd,windowsHide:true,stdio:'pipe'});let output='';
 child.stdout.on('data',d=>output+=d);child.stderr.on('data',d=>output+=d);
 const code=await new Promise((resolve,reject)=>{child.once('exit',resolve);child.once('error',reject);});
 await writeFile(new URL(file+'.log',import.meta.url),output);results.push({command,code});
 console.log((code===0?'PASS ':'FAIL ')+file);
 await writeFile(new URL('remaining-suite.json',import.meta.url),JSON.stringify({total:commands.length,precedingPassed:start-1,initialFailure:commands[start-1],results},null,2)+'\n');
}
console.log(JSON.stringify({remaining:results.length,passed:results.filter(r=>r.code===0).length,failures:results.filter(r=>r.code!==0)}));
