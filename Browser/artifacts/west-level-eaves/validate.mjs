import {spawn} from 'node:child_process';
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {modelSourceHash} from '../../model-build-inputs.mjs';
const out=new URL('./',import.meta.url),cwd=new URL('../../',import.meta.url),results=[];
async function run(name,args,expected=0){
 const child=spawn(process.execPath,args,{cwd,windowsHide:true,stdio:'pipe'});let log='';
 child.stdout.on('data',d=>log+=d);child.stderr.on('data',d=>log+=d);
 const code=await new Promise((resolve,reject)=>{child.once('error',reject);child.once('exit',resolve);});
 await writeFile(new URL(name+'.log',out),log);results.push({name,code,expected});
 console.log((code===expected?'PASS ':'FAIL ')+name+' ('+code+')');
 if(code!==expected){console.log(log.slice(-2500));throw Error('Unexpected focused validation result: '+name);}
}
for(const name of ['test-west-roof-join','test-west-refinement','test-front-inside-corners','test-west-side-basement','test-west-garden-stair','test-inner-courtyard','test-east-forward-end'])await run(name,[name+'.mjs']);
await run('baseline-regression',['--import',new URL('baseline-loader.mjs',out).href,'test-west-roof-join.mjs'],1);
const manifest=JSON.parse(await readFile(new URL('../../dist/compiled/manifest.json',import.meta.url),'utf8'));
assert.equal(manifest.sourceHash,await modelSourceHash(),'Compiled model matches the current modelling sources');
assert.equal(createHash('sha256').update(await readFile(new URL('../../dist/compiled/'+manifest.file,import.meta.url))).digest('hex'),manifest.sha256,'Compiled model checksum matches its manifest');
await writeFile(new URL('validation-results.json',out),JSON.stringify({scope:'1829 and directly adjoining courtyard/corner/stair geometry',results,manifest},null,2)+'\n');
console.log('PASS: current compiled source fingerprint and binary checksum.');
