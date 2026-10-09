import {readFile,writeFile} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';

const root=new URL('../../',import.meta.url);
const packageJson=JSON.parse(await readFile(new URL('package.json',root),'utf8'));
const commands=packageJson.scripts.test.split(/\s*&&\s*/);
const stopped=commands.indexOf('node test-ground-contact.mjs');
if(stopped<0)throw Error('Ground-contact suite position was not found');
const results=[];
for(const command of commands.slice(stopped+1)){
  const [program,...args]=command.split(/\s+/);
  if(program!=='node')throw Error('Unexpected test command '+command);
  console.log('Running '+command);
  const started=performance.now();
  const result=spawnSync(process.execPath,args,{cwd:root,windowsHide:true,encoding:'utf8',maxBuffer:32*1024*1024});
  process.stdout.write(result.stdout??'');process.stderr.write(result.stderr??'');
  results.push({command,status:result.status,milliseconds:Math.round(performance.now()-started),error:result.error?.message});
}
await writeFile(new URL('remaining-suite.json',import.meta.url),JSON.stringify(results,null,2)+'\n');
const failures=results.filter(r=>r.status!==0);
console.log(JSON.stringify({checks:results.length,failures},null,2));
process.exitCode=failures.length?1:0;
