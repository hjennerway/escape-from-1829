import {readFileSync,writeFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
const commands=JSON.parse(readFileSync(new URL('../../package.json',import.meta.url),'utf8')).scripts.test.split(' && ');
const start=commands.findIndex(command=>command==='node test-jarman.mjs')+1,results=[];
if(start<1)throw new Error('Could not locate the interrupted suite check.');
for(const command of commands.slice(start)){
 const [runtime,...args]=command.split(' ');if(runtime!=='node')throw new Error('Unexpected suite command: '+command);
 const result=spawnSync(process.execPath,args,{cwd:new URL('../../',import.meta.url),encoding:'utf8',windowsHide:true});
 process.stdout.write(result.stdout??'');process.stderr.write(result.stderr??'');
 results.push({command,status:result.status,error:result.error?.message});
 if(result.status!==0)console.error('FAILED: '+command);
}
writeFileSync(new URL('remaining-suite-results.json',import.meta.url),JSON.stringify(results,null,2)+'\n');
console.log('Remaining suite: '+results.length+' checks, '+results.filter(r=>r.status!==0).length+' failures.');
process.exitCode=results.some(r=>r.status!==0)?1:0;
