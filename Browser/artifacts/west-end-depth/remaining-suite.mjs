import {readFile,writeFile} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
const commands=JSON.parse(await readFile(new URL('../../package.json',import.meta.url),'utf8')).scripts.test.split(' && '),start=commands.indexOf('node test-front-inside-corners.mjs'),results=[];
for(const command of commands.slice(start)){
 const [runtime,...args]=command.split(' ');if(runtime!=='node')throw Error(command);
 console.log('Checking '+args.join(' '));
 const result=spawnSync(process.execPath,args,{cwd:new URL('../../',import.meta.url),windowsHide:true,stdio:'inherit'});
 results.push({test:args[0],status:result.status});
}
await writeFile(new URL('remaining-suite.json',import.meta.url),JSON.stringify(results,null,2)+'\n');
console.log(JSON.stringify({passed:results.filter(r=>r.status===0).length,failed:results.filter(r=>r.status!==0)}));
if(results.some(r=>r.status!==0))process.exitCode=1;
