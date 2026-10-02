import {readFileSync,writeFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const commands=JSON.parse(readFileSync(new URL('../../package.json',import.meta.url))).scripts.test.split(' && ');
const start=commands.indexOf('node test-larkton-recess.mjs');
if(start<0)throw Error('Cannot locate continuation point');
const results=[];
for(const command of commands.slice(start)){
 const [program,...args]=command.split(' '),run=spawnSync(program==='node'?process.execPath:program,args,{cwd:fileURLToPath(new URL('../../',import.meta.url)),encoding:'utf8',windowsHide:true,maxBuffer:16*1024*1024});
 console.log(command+'\n'+run.stdout+run.stderr);results.push({command,status:run.status});
}
writeFileSync(new URL('suite-remainder.json',import.meta.url),JSON.stringify(results,null,2)+'\n');
console.log(JSON.stringify({passed:results.filter(r=>r.status===0).length,failed:results.filter(r=>r.status!==0)}));
process.exitCode=results.some(r=>r.status!==0)?1:0;
