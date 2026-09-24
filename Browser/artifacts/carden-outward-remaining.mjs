import {readFileSync,writeFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
const tests=JSON.parse(readFileSync('package.json')).scripts.test.split(' && ').map(s=>s.replace(/^node /,'')),start=tests.indexOf('test-annexe-carden.mjs'),results=[];
for(const name of tests.slice(start)){
 const r=spawnSync(process.execPath,[name],{encoding:'utf8',windowsHide:true,timeout:45000,maxBuffer:4e6});
 results.push({name,exit:r.status,signal:r.signal,error:r.error?.message,output:(r.stdout+r.stderr).slice(-7000)});
 console.log((r.status===0?'PASS ':'FAIL ')+name);writeFileSync('artifacts/carden-outward-remaining.json',JSON.stringify(results,null,2));
}
