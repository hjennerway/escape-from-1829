import {readFile,writeFile,appendFile} from 'node:fs/promises';
import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const root=new URL('../../',import.meta.url),log=new URL('./remaining-suite.log',import.meta.url);
const {scripts}=JSON.parse(await readFile(new URL('package.json',root)));
const commands=scripts.test.split('&&').map(s=>s.trim()),start=commands.indexOf('node test-facade-courses.mjs')+1,results=[];
await writeFile(log,'Remaining checks after the unrelated exterior cornice-count failure in npm test.\n');
for(const command of commands.slice(start)){
 await appendFile(log,'\n'+command+'\n');
 const result=await new Promise(resolve=>{
  const child=spawn(process.execPath,command.split(/\s+/).slice(1),{cwd:fileURLToPath(root),windowsHide:true,stdio:['ignore','pipe','pipe']});
  let output='';child.stdout.on('data',d=>output+=d);child.stderr.on('data',d=>output+=d);
  child.on('close',code=>resolve({command,code,output}));child.on('error',error=>resolve({command,code:1,output:error.message}));
 });
 await appendFile(log,result.output);results.push({command,code:result.code});
 console.log((result.code===0?'PASS':'FAIL')+': '+command);
}
const failures=results.filter(r=>r.code!==0);
await writeFile(new URL('./remaining-suite.json',import.meta.url),JSON.stringify({checks:results.length,failures,results},null,2)+'\n');
console.log(JSON.stringify({checks:results.length,failures}));process.exitCode=failures.length?1:0;
