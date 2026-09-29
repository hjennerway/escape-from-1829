import {readFileSync,writeFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
const commands=JSON.parse(readFileSync(new URL('../package.json',import.meta.url))).scripts.test.split(' && ');
const start=commands.indexOf('node test-jarman.mjs');
if(start<0)throw new Error('Missing continuation point');
const results=[];
for(const command of commands.slice(start)){
 const [,file,...args]=command.split(' ');
 const result=spawnSync(process.execPath,[file,...args],{cwd:new URL('../',import.meta.url),encoding:'utf8',windowsHide:true});
 process.stdout.write(result.stdout??'');process.stderr.write(result.stderr??'');
 results.push({file,exitCode:result.status});
}
writeFileSync(new URL('front-sill-suite-remaining.json',import.meta.url),JSON.stringify(results,null,2)+'\n');
console.log(JSON.stringify({passed:results.filter(r=>r.exitCode===0).length,failed:results.filter(r=>r.exitCode!==0)},null,2));
process.exitCode=results.some(r=>r.exitCode!==0)?1:0;
