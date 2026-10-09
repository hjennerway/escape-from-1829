import {readFileSync,writeFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
const commands=JSON.parse(readFileSync(new URL('../../package.json',import.meta.url))).scripts.test.split('&&').map(s=>s.trim());
const failed=commands.indexOf('node test-explore-workshops.mjs');if(failed<0)throw Error('Suite entry not found');
const results=[];
for(const command of commands.slice(failed+1)){
 const [binary,...args]=command.split(/\s+/);if(binary!=='node')throw Error('Unexpected command '+command);
 console.log('Checking '+args.join(' '));
 const result=spawnSync(process.execPath,args,{cwd:new URL('../../',import.meta.url),windowsHide:true,stdio:'inherit'});
 results.push({command,status:result.status,error:result.error?.message});
}
writeFileSync(new URL('remaining-suite.json',import.meta.url),JSON.stringify({passedPrefixChecks:failed,results},null,2)+'\n');
console.log('Remaining suite: '+results.filter(r=>r.status===0).length+'/'+results.length+' passed.');
process.exitCode=results.some(r=>r.status!==0)?1:0;
