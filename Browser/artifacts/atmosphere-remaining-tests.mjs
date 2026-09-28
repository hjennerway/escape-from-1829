import {readFile,writeFile} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
const pkg=JSON.parse(await readFile(new URL('../package.json',import.meta.url)));
const commands=pkg.scripts.test.split(' && ');const start=commands.findIndex(c=>c==='node test-jarman.mjs');
const report=[];
for(const command of commands.slice(start)){
 const args=command.split(' ').slice(1),result=spawnSync(process.execPath,args,{cwd:new URL('../',import.meta.url),encoding:'utf8',windowsHide:true});
 report.push({command,status:result.status,output:result.stdout+result.stderr});console.log((result.status===0?'PASS':'FAIL')+' '+command);
}
await writeFile(new URL('atmosphere-remaining-tests.json',import.meta.url),JSON.stringify(report,null,2));
console.log(JSON.stringify(report.filter(r=>r.status!==0)));
process.exitCode=report.some(r=>r.status!==0)?1:0;
