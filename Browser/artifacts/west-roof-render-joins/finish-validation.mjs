import {spawn} from 'node:child_process';
import {writeFile} from 'node:fs/promises';
const cwd=new URL('../../',import.meta.url),out=new URL('./',import.meta.url),results=[];
async function run(name,args,expected=null){
 const child=spawn(process.execPath,args,{cwd,windowsHide:true,stdio:'pipe'});let log='';
 child.stdout.on('data',d=>log+=d);child.stderr.on('data',d=>log+=d);
 const code=await new Promise((resolve,reject)=>{child.once('error',reject);child.once('exit',resolve);});
 await writeFile(new URL(name+'.log',out),log);results.push({name,code,expected});
 await writeFile(new URL('latest-checks.json',out),JSON.stringify(results,null,2)+'\n');
 console.log((code===0?'PASS ':code===expected?'EXPECTED FAILURE ':'FAIL ')+name+' ('+code+')');
 if(expected!==null&&code!==expected){console.log(log.slice(-2500));throw Error(name+' did not meet its required result');}
}
await run('final-corner-baseline',['--import',new URL('baseline-loader.mjs',out).href,'test-west-roof-render-joins.mjs'],1);
await run('final-corner-regression',['test-west-roof-render-joins.mjs'],0);
await run('source-capture',['artifacts/west-roof-render-joins/capture.mjs','final-source','source'],0);
await run('compiled-capture',['artifacts/west-roof-render-joins/capture.mjs','final-compiled','compiled'],0);
for(const file of ['test-west-roof-join.mjs','test-west-refinement.mjs','test-roof-contacts.mjs','test-roof-tiles.mjs'])
 await run('latest-'+file.replace('.mjs',''),[file]);
await run('latest-compiled-tile-check',['test-roof-tiles.mjs','--compiled']);
