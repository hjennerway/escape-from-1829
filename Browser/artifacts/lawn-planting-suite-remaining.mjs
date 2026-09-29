import {readFile,writeFile} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
const pkg=JSON.parse(await readFile(new URL('../package.json',import.meta.url)));
const commands=pkg.scripts.test.split(' && '),start=commands.indexOf('node test-jarman.mjs')+1,report=[];
for(const command of commands.slice(start)){
  const result=spawnSync(process.execPath,command.split(' ').slice(1),{cwd:new URL('../',import.meta.url),encoding:'utf8',windowsHide:true});
  report.push({command,status:result.status,output:result.stdout+result.stderr});console.log((result.status===0?'PASS':'FAIL')+' '+command);
}
await writeFile(new URL('lawn-planting-suite-remaining.json',import.meta.url),JSON.stringify(report,null,2));
console.log(JSON.stringify(report.filter(r=>r.status!==0)));
process.exitCode=report.some(r=>r.status!==0)?1:0;
