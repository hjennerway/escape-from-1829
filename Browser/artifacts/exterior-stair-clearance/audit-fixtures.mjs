import {readFileSync,writeFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const root=new URL('../../../',import.meta.url),out=new URL('./',import.meta.url);
const previous=JSON.parse(readFileSync(new URL('Research/exterior-stair-rails/snapshot-updates.json',root)));
const tests=[...new Set(previous.map(r=>r.test)), 'test-jarman.mjs','test-leighton-newton.mjs'];
const results=[];
for(const test of tests){
 const before=spawnSync(process.execPath,['Browser/'+test],{cwd:root,windowsHide:true,encoding:'utf8',maxBuffer:32*1024*1024,env:{...process.env,NODE_OPTIONS:(process.env.NODE_OPTIONS??'')+' --import '+new URL('baseline-loader.mjs',out).href}});
 writeFileSync(new URL('before-'+test+'.log',out),before.stdout+before.stderr);
 const current=spawnSync(process.execPath,['Browser/'+test],{cwd:root,windowsHide:true,encoding:'utf8',maxBuffer:32*1024*1024});
 writeFileSync(new URL('current-'+test+'.log',out),current.stdout+current.stderr);
 const record={test,before:before.status,current:current.status};
 if(before.status===0&&current.status!==0){
  const capture=test+'-fingerprints.json';
  const after=spawnSync(process.execPath,['Browser/'+test],{cwd:root,windowsHide:true,encoding:'utf8',maxBuffer:32*1024*1024,env:{...process.env,NODE_OPTIONS:(process.env.NODE_OPTIONS??'')+' --import '+new URL('capture-fingerprints.mjs',out).href,STAIR_CAPTURE:fileURLToPath(new URL(capture,out))}});
  writeFileSync(new URL('captured-'+test+'.log',out),after.stdout+after.stderr);
  Object.assign(record,{capture,after:after.status});
 }
 results.push(record);writeFileSync(new URL('fixture-audit.json',out),JSON.stringify(results,null,2)+'\n');console.log(JSON.stringify(record));
}
