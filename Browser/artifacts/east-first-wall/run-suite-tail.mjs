import {readFile,writeFile,appendFile} from 'node:fs/promises';
import {spawn} from 'node:child_process';
const pkg=JSON.parse(await readFile(new URL('../../package.json',import.meta.url)));
const commands=pkg.scripts.test.split(' && '),start=commands.indexOf('node test-asylum-layout.mjs'),results=[];
const focused=process.argv.includes('--interior');
const finalTail=process.argv.includes('--after-jarman');
const selected=focused?commands.filter(c=>/^node test-(asylum-|reception-second-floor|notebook|explore-interior)/.test(c)):commands.slice(finalTail?commands.indexOf('node test-jarman.mjs')+1:start);
const log=new URL(focused?'./final-interior-tests.txt':finalTail?'./r27/final-suite-tail.txt':'./npm-test-continuation.txt',import.meta.url);
await writeFile(log,'');
for(const command of selected){
 const [exe,...args]=command.split(' ');
 const run=spawn(exe==='node'?process.execPath:exe,args,{cwd:new URL('../../',import.meta.url),windowsHide:true,stdio:['ignore','pipe','pipe']});
 let output='';run.stdout.on('data',b=>output+=b);run.stderr.on('data',b=>output+=b);
 const code=await new Promise(resolve=>run.on('close',resolve));
 results.push({command,code});await appendFile(log,`${command}\n${output}\n`);
 await writeFile(new URL(focused?'./final-interior-results.json':finalTail?'./r27/final-suite-tail.json':'./suite-results.json',import.meta.url),JSON.stringify(results,null,2)+'\n');
 console.log(`${code===0?'PASS':'FAIL'} ${command}`);
}
console.log(JSON.stringify({checks:results.length,passed:results.filter(r=>r.code===0).length,failed:results.filter(r=>r.code!==0)},null,2));
process.exitCode=results.some(r=>r.code!==0)?1:0;
