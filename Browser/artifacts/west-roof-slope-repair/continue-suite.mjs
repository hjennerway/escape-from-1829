import {readFile,writeFile} from 'node:fs/promises';
import {spawn} from 'node:child_process';
const out=new URL('./',import.meta.url),cwd=new URL('../../',import.meta.url);
const packageJSON=JSON.parse(await readFile(new URL('package.json',cwd),'utf8'));
const commands=packageJSON.scripts.test.split(' && '),start=commands.findIndex(c=>c==='node test-facade-courses.mjs')+1,results=[];
for(const command of commands.slice(start)){
 const args=command.split(' ');if(args.shift()!=='node')throw Error('Unexpected test command');
 const child=spawn(process.execPath,args,{cwd,windowsHide:true,stdio:['ignore','pipe','pipe']});let output='';
 child.stdout.on('data',d=>output+=d);child.stderr.on('data',d=>output+=d);
 const code=await new Promise((resolve,reject)=>{child.once('error',reject);child.once('exit',resolve);});
 await writeFile(new URL(args[0].replace('.mjs','.log'),out),output);
 results.push({command,code});if(code)console.log('FAIL: '+command);
 await writeFile(new URL('suite-continuation.json',out),JSON.stringify({prefixCommands:start,commands:commands.length,results},null,2)+'\n');
}
console.log(JSON.stringify({total:commands.length,continuation:results.length,passed:results.filter(r=>!r.code).length,failed:results.filter(r=>r.code)}));
