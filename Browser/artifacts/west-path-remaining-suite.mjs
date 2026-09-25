import {readFileSync,writeFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
const commands=JSON.parse(readFileSync(new URL('../package.json',import.meta.url))).scripts.test.split(' && '),start=commands.findIndex(c=>c==='node test-jarman.mjs')+1,results=[];
for(const command of commands.slice(start)){
 const [runner,...args]=command.split(' '),result=spawnSync(process.execPath,args,{cwd:new URL('../',import.meta.url),windowsHide:true,encoding:'utf8'});
 const entry={command,status:result.status};results.push(entry);console.log(JSON.stringify(entry));
 if(result.status!==0)console.log(result.stdout,result.stderr);
}
writeFileSync(new URL('west-path-remaining-results.json',import.meta.url),JSON.stringify(results,null,2));
console.log('Passed '+results.filter(r=>r.status===0).length+'/'+results.length+' remaining checks.');
