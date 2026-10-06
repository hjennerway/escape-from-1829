import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
const pkg=JSON.parse(await readFile(new URL('../../package.json',import.meta.url))),commands=[...pkg.scripts.test.split(' && '),'node test-model-binary.mjs','node test-geometry-optimization.mjs'],results=[];
await mkdir(new URL('logs/',import.meta.url),{recursive:true});
for(const command of commands){
 const [bin,...args]=command.split(' '),r=spawnSync(bin==='node'?process.execPath:bin,args,{cwd:new URL('../../',import.meta.url),encoding:'utf8',maxBuffer:20*1024*1024});
 await writeFile(new URL('logs/'+args[0]+'.log',import.meta.url),(r.stdout??'')+(r.stderr??''));results.push({command,exit:r.status,error:r.error?.message});await writeFile(new URL('suite-results.json',import.meta.url),JSON.stringify(results,null,2)+'\n');if(r.status!==0)console.log('FAILED: '+command);
}
console.log(JSON.stringify({commands:results.length,passed:results.filter(r=>r.exit===0).length,failures:results.filter(r=>r.exit!==0)},null,2));
