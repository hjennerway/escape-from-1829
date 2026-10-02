import {readFile,writeFile} from 'node:fs/promises';
import {spawn} from 'node:child_process';
const root=new URL('../../',import.meta.url),pkg=JSON.parse(await readFile(new URL('package.json',root),'utf8'));
const tests=pkg.scripts.test.split(' && ').map(command=>command.slice(5));
const remaining=tests.slice(tests.indexOf('test-jarman.mjs')+1),results=[];
for(const test of remaining){
 const child=spawn(process.execPath,[test],{cwd:root,windowsHide:true,stdio:['ignore','pipe','pipe']});let output='';
 child.stdout.on('data',data=>output+=data);child.stderr.on('data',data=>output+=data);
 const code=await new Promise(resolve=>child.on('close',resolve));results.push({test,code});
 await writeFile(new URL(test+'.log',import.meta.url),output);console.log(`${code===0?'PASS':'FAIL'}: ${test}`);
}
await writeFile(new URL('remaining-suite.json',import.meta.url),JSON.stringify(results,null,2)+'\n');
process.exitCode=results.some(result=>result.code!==0)?1:0;
