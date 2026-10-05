import {spawn} from 'node:child_process';
import {readFile,writeFile} from 'node:fs/promises';
import {createWriteStream} from 'node:fs';
import {dirname,join} from 'node:path';
import {fileURLToPath} from 'node:url';
const browser=fileURLToPath(new URL('../../',import.meta.url)),out=new URL('./',import.meta.url);
const pkg=JSON.parse(await readFile(new URL('../../package.json',import.meta.url)));
const checks=pkg.scripts.test.split(' && ').map(s=>s.split(' '));
function run(args,file){return new Promise((resolve,reject)=>{
  const stream=createWriteStream(file),child=spawn(process.execPath,args,{cwd:browser,windowsHide:true,stdio:['ignore','pipe','pipe']});
  child.stdout.pipe(stream,{end:false});child.stderr.pipe(stream,{end:false});child.once('error',reject);
  child.once('close',code=>stream.end(()=>resolve(code)));
});}
const suiteCode=await run([join(dirname(process.execPath),'node_modules/npm/bin/npm-cli.js'),'test'],fileURLToPath(new URL('npm-test.log',out)));
const results=[];
if(suiteCode===0)for(const check of checks)results.push({check:check.slice(1).join(' '),code:0});
else{
  const log=await readFile(new URL('npm-test.log',out),'utf8');
  const failing=[...log.matchAll(/file:\/\/\/[^\s]*\/(test-[^/:\s]+\.mjs):/g)].at(-1)?.[1];
  const index=checks.findIndex(c=>c[1]===failing);
  if(index<0)throw new Error('Cannot identify npm failure; inspect npm-test.log');
  for(let i=0;i<=index;i++)results.push({check:checks[i].slice(1).join(' '),code:i===index?suiteCode:0});
  console.log('npm test stopped at '+failing+'; continuing all remaining checks.');
  for(let i=index+1;i<checks.length;i++){
    const check=checks[i],code=await run(check.slice(1),fileURLToPath(new URL(check[1]+'.log',out)));
    results.push({check:check.slice(1).join(' '),code});
    if(code||i%15===0)console.log((code?'FAIL: ':'Progress: ')+check[1]+' ('+(i+1)+'/'+checks.length+')');
  }
}
const report={total:results.length,passed:results.filter(r=>r.code===0).length,failed:results.filter(r=>r.code!==0),results};
await writeFile(new URL('suite-results.json',out),JSON.stringify(report,null,2));
console.log(JSON.stringify({total:report.total,passed:report.passed,failed:report.failed}));
process.exitCode=report.failed.length?1:0;
