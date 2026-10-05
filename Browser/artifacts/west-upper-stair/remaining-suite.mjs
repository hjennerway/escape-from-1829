import {readFile,writeFile} from 'node:fs/promises';
import {spawn} from 'node:child_process';
const root=new URL('../../',import.meta.url),out=new URL('./',import.meta.url);
const pkg=JSON.parse(await readFile(new URL('package.json',root),'utf8'));
const commands=pkg.scripts.test.split(' && '),start=commands.indexOf('node test-facade-courses.mjs')+1;
const results=[];let log='';
for(const command of commands.slice(start)){
 const [program,...args]=command.split(' '),child=spawn(program==='node'?process.execPath:program,args,{cwd:root,windowsHide:true,stdio:['ignore','pipe','pipe']});
 let output='';for(const stream of [child.stdout,child.stderr])stream.on('data',d=>output+=d);
 const code=await new Promise((resolve,reject)=>{child.once('error',reject);child.once('exit',resolve);});
 results.push({command,code});log+=command+'\n'+output+'\n';
 await writeFile(new URL('remaining-suite.log',out),log);await writeFile(new URL('remaining-suite.json',out),JSON.stringify(results,null,2)+'\n');
 console.log((code===0?'PASS':'FAIL')+': '+command);
}
console.log(JSON.stringify({count:results.length,failures:results.filter(r=>r.code!==0)}));
process.exitCode=results.some(r=>r.code!==0)?1:0;
