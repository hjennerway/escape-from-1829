import {spawn} from 'node:child_process';
import {readFile,writeFile,copyFile} from 'node:fs/promises';
const cwd=new URL('../../',import.meta.url),out=new URL('./',import.meta.url);
const results=[];
async function run(name,args,expected=0){
 const child=spawn(process.execPath,args,{cwd,windowsHide:true,stdio:'pipe'});let log='';
 child.stdout.on('data',d=>log+=d);child.stderr.on('data',d=>log+=d);
 const code=await new Promise((resolve,reject)=>{child.once('error',reject);child.once('exit',resolve);});
 await writeFile(new URL(name+'.log',out),log);results.push({name,code,expected});
 console.log((code===expected?'PASS ':'FAIL ')+name+' ('+code+')');
 if(code!==expected){console.log(log.slice(-3500));throw Error('Unexpected validation result: '+name);}
}
await copyFile('C:/Users/Harry/AppData/Local/Temp/codex-clipboard-8ec72fd3-da76-4023-ad20-9b64a06ac4c3.png',new URL('court-reference.png',out));
await copyFile('C:/Users/Harry/AppData/Local/Temp/codex-clipboard-33d9bbe5-96f3-47c9-a1d1-1dc95a0455b9.png',new URL('garden-reference.png',out));
await run('baseline-regression',['--import',new URL('baseline-loader.mjs',out).href,'test-west-roof-join.mjs'],1);
for(const file of ['test-west-roof-join.mjs','test-west-refinement.mjs','test-roof-contacts.mjs'])
 await run('focused-'+file.replace('.mjs',''),[file]);
await run('source-capture',['artifacts/west-roof-render-joins/capture.mjs','final-source','source']);
await run('compiled-capture',['artifacts/west-roof-render-joins/capture.mjs','final-compiled','compiled']);
const p=JSON.parse(await readFile(new URL('package.json',cwd),'utf8'));
const isolated=new URL('isolate-outputs.mjs',out).href;
for(const command of p.scripts['test:models'].split(' && '))await run(command.slice(5).replace('.mjs',''),['--import',isolated,...command.slice(5).split(' ')]);
for(const command of p.scripts['test:compiled'].split(' && '))await run('compiled-'+command.slice(5).replace('.mjs','').replaceAll(' ','-'),['--import',isolated,...command.slice(5).split(' ')]);
for(const file of ['test-jarman.mjs','test-leighton-newton.mjs'])await run('baseline-'+file.replace('.mjs',''),['--import',new URL('baseline-loader.mjs',out).href,file],1);
for(const file of ['test-jarman.mjs','test-leighton-newton.mjs'])await run('final-'+file.replace('.mjs',''),[file],1);
await writeFile(new URL('validation-results.json',out),JSON.stringify(results,null,2)+'\n');
