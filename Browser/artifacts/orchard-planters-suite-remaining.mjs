import {readFileSync,writeFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
const commands=JSON.parse(readFileSync(new URL('../package.json',import.meta.url))).scripts.test.split(' && ');
const start=commands.findIndex(c=>c==='node test-jarman.mjs')+1;
const results=[];
for(const command of commands.slice(start)){
 const args=command.split(' ').slice(1);
 const result=spawnSync(process.execPath,args,{cwd:new URL('../',import.meta.url),windowsHide:true,encoding:'utf8'});
 writeFileSync(new URL('orchard-planters-'+args[0]+'.log',import.meta.url),(result.stdout??'')+(result.stderr??''));
 results.push({command,code:result.status});console.log((result.status===0?'PASS':'FAIL')+': '+command);
}
writeFileSync(new URL('orchard-planters-suite-remaining.json',import.meta.url),JSON.stringify(results,null,2)+'\n');
process.exitCode=results.some(r=>r.code!==0)?1:0;
