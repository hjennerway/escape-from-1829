import {readFile,writeFile} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
const root=new URL('../../',import.meta.url),pkg=JSON.parse(await readFile(new URL('package.json',root),'utf8'));
const commands=pkg.scripts.test.split('&&').map(s=>s.trim()),start=commands.indexOf('node test-asylum-furniture.mjs')+1,results=[];
for(const command of commands.slice(start)){
 const args=command.split(/\s+/).slice(1),result=spawnSync(process.execPath,args,{cwd:root,windowsHide:true,encoding:'utf8',env:process.env});
 results.push({command,status:result.status,output:(result.stdout??'')+(result.stderr??'')});
 await writeFile(new URL('suite-tail.json',import.meta.url),JSON.stringify(results,null,2)+'\n');
 if(result.status!==0)console.log(JSON.stringify({command,status:result.status,error:results.at(-1).output.slice(-1600)}));
}
console.log(JSON.stringify({checks:results.length,passed:results.filter(r=>r.status===0).length,failed:results.filter(r=>r.status!==0).map(r=>r.command)}));
process.exitCode=results.some(r=>r.status!==0)?1:0;
