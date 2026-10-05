import {readFile,readdir,writeFile} from 'node:fs/promises';
import {spawn} from 'node:child_process';
const browser=new URL('../../',import.meta.url),out=new URL('./',import.meta.url);
const pkg=JSON.parse(await readFile(new URL('package.json',browser)));
const covered=new Set([...pkg.scripts.test.matchAll(/node (\S+\.mjs)/g)].map(m=>m[1]));
const passed=new Set();
for(const file of ['extra-tests.json','rerun-tests.json','hardware-tests.json'])for(const r of JSON.parse(await readFile(new URL(file,out))))if(r.code===0)passed.add(r.name);
const names=(await readdir(browser)).filter(n=>/^test(?:-|\.)/.test(n)&&n.endsWith('.mjs')&&!covered.has(n)&&!passed.has(n)).sort();
await writeFile(new URL('parallel-plan.json',out),JSON.stringify(names,null,2)+'\n');
const results=[];let next=0,save=Promise.resolve();
async function worker(){
  while(next<names.length){
    const name=names[next++],started=Date.now();console.log('START '+name);
    const child=spawn(process.execPath,['--import',new URL('local-hardware.mjs',out).href,name],{cwd:browser,windowsHide:true,env:{...process.env,MODEL_CHROME_PATH:'C:/Program Files/Google/Chrome/Application/chrome.exe'},stdio:['ignore','pipe','pipe']});
    let output='';child.stdout.on('data',d=>output+=d);child.stderr.on('data',d=>output+=d);
    const code=await new Promise((resolve,reject)=>{child.once('error',reject);child.once('exit',resolve);});
    await writeFile(new URL(name+'.parallel.log',out),output);
    results.push({name,code,seconds:(Date.now()-started)/1000});
    const snapshot=JSON.stringify(results,null,2)+'\n';save=save.then(()=>writeFile(new URL('parallel-tests.json',out),snapshot));await save;
    console.log((code===0?'PASS ':'FAIL ')+name+' '+results.find(r=>r.name===name).seconds+'s');
    if(code!==0)console.log(output.slice(-3500));
  }
}
await Promise.all([worker(),worker()]);await save;
console.log(JSON.stringify({total:results.length,failures:results.filter(r=>r.code!==0)},null,2));
process.exitCode=results.some(r=>r.code!==0)?1:0;
