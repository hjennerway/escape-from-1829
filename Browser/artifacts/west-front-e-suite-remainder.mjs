import {readFile,writeFile} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const root=new URL('../',import.meta.url),pkg=JSON.parse(await readFile(new URL('package.json',root),'utf8'));
const commands=pkg.scripts.test.split(' && '),after=commands.findIndex(c=>c==='node '+(process.argv[2]??'test-jarman.mjs'));
if(after<0)throw new Error('The expected suite stop was not found.');
const results=[];
for(const command of commands.slice(after+1)){
  const [runtime,...args]=command.split(' ');if(runtime!=='node')throw new Error('Unexpected command: '+command);
  const result=spawnSync(process.execPath,args,{cwd:fileURLToPath(root),encoding:'utf8',windowsHide:true,maxBuffer:8*1024*1024});
  results.push({command,status:result.status,output:result.stdout+result.stderr});
  console.log(`${result.status===0?'PASS':'FAIL'}: ${args[0]}`);
}
await writeFile(new URL('west-front-e-width-remainder.json',import.meta.url),JSON.stringify(results,null,2)+'\n');
const failures=results.filter(r=>r.status!==0);console.log(JSON.stringify({total:results.length,failures:failures.map(r=>r.command)}));
process.exitCode=failures.length?1:0;
