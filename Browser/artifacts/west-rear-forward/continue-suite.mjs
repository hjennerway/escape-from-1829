import {readFile,writeFile} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
const root=new URL('../../',import.meta.url);
const commands=JSON.parse(await readFile(new URL('package.json',root),'utf8')).scripts.test.split(' && ');
const log=await readFile(new URL('./npm-test.log',import.meta.url),'utf8');
const failed=log.match(/at file:\/\/\/[^\r\n]*\/(test-[^/:]+\.mjs):\d+/)?.[1];
if(!failed)throw Error('No failed test found; do not repeat a passing suite');
const start=commands.indexOf('node '+failed);
if(start<0)throw Error('Failed test is not in the suite: '+failed);
const results=[];
for(const command of commands.slice(start+1)){
 const [runtime,...args]=command.split(' ');if(runtime!=='node')throw Error(command);
 console.log('Checking '+args.join(' '));
 const result=spawnSync(process.execPath,args,{cwd:root,windowsHide:true,stdio:'inherit'});
 results.push({test:args[0],status:result.status});
}
await writeFile(new URL('./remaining-suite.json',import.meta.url),JSON.stringify({firstFailure:failed,results},null,2)+'\n');
console.log(JSON.stringify({passed:results.filter(r=>r.status===0).length,failed:results.filter(r=>r.status!==0)}));
if(results.some(r=>r.status!==0))process.exitCode=1;
