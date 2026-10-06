import {readFile,writeFile} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
const pkg=JSON.parse(await readFile(new URL('../../package.json',import.meta.url),'utf8'));
const commands=pkg.scripts.test.split(' && '),results=[];
const start=commands.findIndex(command=>command==='node test-roof-tiles.mjs');
for(const command of commands.slice(start)){
 const [bin,...args]=command.split(' '),r=spawnSync(bin,args,{cwd:new URL('../../',import.meta.url),encoding:'utf8',maxBuffer:20*1024*1024});
 await writeFile(new URL(args[0]+'.log',import.meta.url),(r.stdout??'')+(r.stderr??''));
 results.push({command,exit:r.status,error:r.error?.message});
 await writeFile(new URL('suite-results.json',import.meta.url),JSON.stringify(results,null,2));
 if(r.status!==0)console.log('FAILED: '+command);
}
console.log(JSON.stringify({commands:results.length,passed:results.filter(r=>r.exit===0).length,failures:results.filter(r=>r.exit!==0)},null,2));
