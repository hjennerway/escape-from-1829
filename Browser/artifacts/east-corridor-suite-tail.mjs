import {readFile,writeFile} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
const browser=new URL('../',import.meta.url),out=new URL('./east-corridor/',import.meta.url),pkg=JSON.parse(await readFile(new URL('package.json',browser),'utf8'));
const commands=pkg.scripts.test.split(' && '),start=commands.findIndex(c=>c==='node test-asylum-layout.mjs'),results=[];
for(const command of commands.slice(start)){
 const [,...args]=command.split(' '),started=Date.now();
 const result=spawnSync(process.execPath,args,{cwd:browser,windowsHide:true,encoding:'utf8',timeout:180000,maxBuffer:8e6});
 const text=(result.stdout??'')+(result.stderr??'')+(result.error?.message??'');
 await writeFile(new URL(args[0]+'.log',out),text);
 results.push({command,exit:result.status,ms:Date.now()-started,error:result.error?.message});
 console.log(`${result.status===0?'PASS':'FAIL'} ${args[0]}`);
 await writeFile(new URL('suite-tail.json',out),JSON.stringify(results,null,2)+'\n');
}
console.log(JSON.stringify({commands:results.length,failures:results.filter(r=>r.exit!==0)},null,2));
