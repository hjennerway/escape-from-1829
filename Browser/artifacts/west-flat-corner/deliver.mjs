import {spawn} from 'node:child_process';
import {createWriteStream} from 'node:fs';
const root=new URL('../../../',import.meta.url);
async function run(args,log){
 const output=createWriteStream(new URL(log,import.meta.url));
 const child=spawn(process.execPath,args,{cwd:root,windowsHide:true,env:{...process.env,MODEL_CHROME_PATH:'C:/Program Files/Google/Chrome/Application/chrome.exe'},stdio:['ignore','pipe','pipe']});
 child.stdout.pipe(output,{end:false});child.stderr.pipe(output,{end:false});
 const code=await new Promise((resolve,reject)=>{child.once('exit',resolve);child.once('error',reject);});
 await new Promise(resolve=>output.end(resolve));return code;
}
if(await run(['Browser/build-models.mjs'],'build-delivery-current.txt')!==0)throw Error('Model build failed');
if(await run(['Browser/artifacts/west-flat-corner/validate-delivery.mjs'],'delivery-current.txt')!==0)throw Error('Compiled corner check failed');
if(await run(['Browser/artifacts/west-flat-corner/finalize-notes.mjs'],'final-notes.txt')!==0)throw Error('Final notes/fingerprint check failed');
console.log('PASS: latest model rebuilt, compiled corner validated and final validation notes saved.');
