import {readdir,readFile,mkdir,writeFile} from 'node:fs/promises';
import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const browser=new URL('../../',import.meta.url),out=new URL('./',import.meta.url);
await mkdir(out,{recursive:true});
const pkg=JSON.parse(await readFile(new URL('package.json',browser)));
const covered=new Set([...pkg.scripts.test.matchAll(/node (\S+\.mjs)/g)].map(m=>m[1]));
const requested=process.argv.slice(2);
const names=requested.length?requested:(await readdir(browser)).filter(n=>/^test(?:-|\.)/.test(n)&&n.endsWith('.mjs')&&!covered.has(n)).sort();
const hardware=process.env.TEST_LOCAL_HARDWARE==='1';
const resultFile=hardware?'hardware-tests.json':requested.length?'rerun-tests.json':'extra-tests.json';
const results=[];
for(const name of names){
  console.log('START '+name);
  const started=Date.now();
  const args=hardware?['--import',new URL('local-hardware.mjs',import.meta.url).href,name]:[name];
  const child=spawn(process.execPath,args,{cwd:browser,windowsHide:true,env:{...process.env,MODEL_CHROME_PATH:process.env.MODEL_CHROME_PATH??'C:/Program Files/Google/Chrome/Application/chrome.exe'},stdio:['ignore','pipe','pipe']});
  let output='';child.stdout.on('data',d=>output+=d);child.stderr.on('data',d=>output+=d);
  const code=await new Promise((resolve,reject)=>{child.once('error',reject);child.once('exit',resolve);});
  await writeFile(new URL(name+(hardware?'.hardware.log':requested.length?'.rerun.log':'.log'),out),output);
  results.push({name,code,seconds:(Date.now()-started)/1000});
  await writeFile(new URL(resultFile,out),JSON.stringify(results,null,2)+'\n');
  console.log((code===0?'PASS ':'FAIL ')+name+' '+results.at(-1).seconds+'s');
  if(code!==0)console.log(output.slice(-2500));
}
console.log(JSON.stringify({total:results.length,failures:results.filter(r=>r.code!==0)},null,2));
process.exitCode=results.some(r=>r.code!==0)?1:0;
