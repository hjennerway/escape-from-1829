import {readFile,appendFile,writeFile} from 'node:fs/promises';
import {spawn} from 'node:child_process';
const root=new URL('../../',import.meta.url),p=JSON.parse(await readFile(new URL('package.json',root)));
const jobs=p.scripts.test.split(' && '),start=jobs.findIndex(j=>j==='node test-jarman.mjs')+1,results=[];
const log=new URL('../door-surrounds-suite.txt',import.meta.url);
for(const command of jobs.slice(start)){
 const args=command.split(' ').slice(1);let output='';
 const code=await new Promise((resolve,reject)=>{const child=spawn(process.execPath,args,{cwd:root,windowsHide:true,stdio:'pipe'});child.stdout.on('data',d=>output+=d);child.stderr.on('data',d=>output+=d);child.on('error',reject);child.on('exit',resolve);});
 await appendFile(log,`\n${command}\n${output}`);results.push({command,code});
 if(code)console.log('FAIL: '+command);
}
await writeFile(new URL('suite-tail.json',import.meta.url),JSON.stringify(results,null,2)+'\n');
console.log(`Completed ${results.length} remaining browser checks; ${results.filter(r=>r.code).length} failures.`);
process.exitCode=results.some(r=>r.code)?1:0;
