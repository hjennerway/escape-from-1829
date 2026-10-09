import {readFile,writeFile} from 'node:fs/promises';
import {spawn} from 'node:child_process';
const root=new URL('../../',import.meta.url),pkg=JSON.parse(await readFile(new URL('package.json',root),'utf8'));
const commands=pkg.scripts.test.split(/\s*&&\s*/);
const remaining=commands.slice(commands.indexOf('node test-facade-courses.mjs')+1),results=[];
const run=command=>new Promise(resolve=>{
 const child=spawn(process.execPath,command.split(/\s+/).slice(1),{cwd:root,windowsHide:true,stdio:['ignore','pipe','pipe']});let output='';
 child.stdout.on('data',d=>output+=d);child.stderr.on('data',d=>output+=d);
 child.on('exit',code=>{results.push({command,code,output});console.log((code===0?'PASS: ':'FAIL: ')+command);resolve();});
});
// Keep performance checks serial; independent geometry checks use two workers.
const serial=remaining.filter(c=>/test-(?:aerial-)?performance\.mjs/.test(c));
const queue=remaining.filter(c=>!serial.includes(c));
await Promise.all([0,1].map(async()=>{while(queue.length)await run(queue.shift());}));
for(const command of serial)await run(command);
await writeFile(new URL('remaining-suite.json',import.meta.url),JSON.stringify(results,null,2)+'\n');
console.log(JSON.stringify({commands:results.length,failures:results.filter(r=>r.code!==0).map(r=>r.command)}));
process.exitCode=results.some(r=>r.code!==0)?1:0;
