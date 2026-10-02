import {readFile,writeFile} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
const root=new URL('../../',import.meta.url),pkg=JSON.parse(await readFile(new URL('package.json',root),'utf8'));
const tests=pkg.scripts.test.split(' && ').filter(cmd=>/^node test-/.test(cmd));
const remaining=tests.slice(tests.indexOf('node test-larkton.mjs')),results=[];
for(const cmd of remaining){const file=cmd.slice(5),result=spawnSync(process.execPath,[file],{cwd:root,windowsHide:true,encoding:'utf8'});await writeFile(new URL(file+'.log',import.meta.url),result.stdout+result.stderr);results.push({file,exitCode:result.status});console.log((result.status===0?'PASS ':'FAIL ')+file);}
await writeFile(new URL('remaining-summary.json',import.meta.url),JSON.stringify(results,null,2));
process.exitCode=results.some(r=>r.exitCode!==0)?1:0;
