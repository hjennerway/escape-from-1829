import {spawnSync} from 'node:child_process';
import {readFileSync,writeFileSync} from 'node:fs';
const browser=new URL('../../',import.meta.url),commands=JSON.parse(readFileSync(new URL('package.json',browser))).scripts.test.split(/\s*&&\s*/);
const stopped=commands.findIndex(c=>c==='node test-jarman.mjs');
if(stopped<0)throw new Error('Missing expected suite entry');
const results=[];
for(const command of commands.slice(stopped+1)){
 const args=command.trim().split(/\s+/).slice(1),result=spawnSync(process.execPath,args,{cwd:browser,encoding:'utf8',windowsHide:true,maxBuffer:16*1024*1024});
 writeFileSync(new URL(args[0]+'.log',import.meta.url),(result.stdout??'')+(result.stderr??''));
 results.push({command,status:result.status,error:result.error?.message});
 if(result.status!==0)console.log('FAIL: '+command);
}
const report={initialCommandsPassed:stopped,initialFailure:'node test-jarman.mjs',remaining:results,totalCommands:commands.length};
writeFileSync(new URL('remaining.json',import.meta.url),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({initialCommandsPassed:stopped,remainingPassed:results.filter(r=>r.status===0).length,failures:results.filter(r=>r.status!==0).map(r=>r.command),totalCommands:commands.length},null,2));
process.exitCode=results.some(r=>r.status!==0)?1:0;
