import {readFileSync,writeFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
const root=new URL('../../',import.meta.url),pkg=JSON.parse(readFileSync(new URL('package.json',root),'utf8'));
const checks=pkg.scripts.test.split(' && '),results=[],output=[];
for(const check of checks){const [, ...args]=check.split(' '),r=spawnSync(process.execPath,args,{cwd:root,windowsHide:true,encoding:'utf8'});results.push({check,status:r.status});output.push(check+'\n'+r.stdout+r.stderr);console.log((r.status===0?'PASS ':'FAIL ')+check);}
writeFileSync(new URL('all-checks.txt',import.meta.url),output.join('\n'));
writeFileSync(new URL('all-checks.json',import.meta.url),JSON.stringify(results,null,2)+'\n');
console.log(JSON.stringify({passed:results.filter(r=>r.status===0).length,failed:results.filter(r=>r.status!==0)},null,2));
process.exitCode=results.some(r=>r.status!==0)?1:0;
