import {readFile,writeFile} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
const root=new URL('../../',import.meta.url),pkg=JSON.parse(await readFile(new URL('package.json',root))),commands=pkg.scripts.test.split(' && '),first=process.argv[2]??'test-jarman.mjs',start=commands.findIndex(c=>c==='node '+first);
if(start<0)throw new Error('Missing suite continuation entry point');
const results=[];let log='';
for(const command of commands.slice(start+1)){
 const run=spawnSync(process.execPath,command.slice(5).split(' '),{cwd:root,encoding:'utf8',windowsHide:true});
 const result={command,status:run.status};results.push(result);log+=command+'\n'+run.stdout+run.stderr+'\n';console.log(JSON.stringify(result));
 await writeFile(new URL('suite-tail.log',import.meta.url),log);await writeFile(new URL('suite-tail.json',import.meta.url),JSON.stringify(results,null,2)+'\n');
}
process.exitCode=results.some(r=>r.status!==0)?1:0;
