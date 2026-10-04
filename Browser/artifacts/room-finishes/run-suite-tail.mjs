import {readFile,writeFile} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const directory=new URL('../../',import.meta.url),pkg=JSON.parse(await readFile(new URL('package.json',directory))),commands=pkg.scripts.test.split(' && '),results=[];
const first=commands.findIndex(command=>command==='node test-jarman.mjs');
// Include the stopped exterior check once to confirm its current result, then
// run every subsequent check without changing any protected fixture.
for(const command of commands.slice(first)){
 const result=spawnSync(process.execPath,command.slice(5).split(' '),{cwd:fileURLToPath(directory),windowsHide:true,encoding:'utf8'});
 await writeFile(new URL(command.slice(5)+'.log',import.meta.url),(result.stdout??'')+(result.stderr??''));
 results.push({command,exit:result.status});console.log(`${result.status===0?'PASS':'FAIL'}: ${command}`);
}
await writeFile(new URL('suite-tail.json',import.meta.url),JSON.stringify(results,null,2)+'\n');
if(results.some(r=>r.exit!==0))process.exitCode=1;
