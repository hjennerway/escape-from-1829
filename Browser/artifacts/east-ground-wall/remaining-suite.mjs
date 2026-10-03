import {readFileSync,writeFileSync,appendFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
const root=new URL('../../',import.meta.url),pkg=JSON.parse(readFileSync(new URL('package.json',root),'utf8'));
const commands=pkg.scripts.test.split(' && '),start=commands.findIndex(c=>c==='node test-asylum-wall-joins.mjs'),results=[];
const log=new URL('./remaining-suite.log',import.meta.url),summary=new URL('./remaining-suite.json',import.meta.url);
writeFileSync(log,'');
for(const command of commands.slice(start)){
 const result=spawnSync(process.execPath,command.slice(5).split(' '),{cwd:root,windowsHide:true,encoding:'utf8',timeout:180000,maxBuffer:8e6});
 appendFileSync(log,command+'\n'+result.stdout+result.stderr+'\n');
 results.push({command,exitCode:result.status,error:result.error?.message});writeFileSync(summary,JSON.stringify(results,null,2)+'\n');
 if(result.status!==0)console.log('FAIL: '+command);
}
console.log(JSON.stringify({total:results.length,passed:results.filter(r=>r.exitCode===0).length,failures:results.filter(r=>r.exitCode!==0)},null,2));
