import {readFileSync,writeFileSync} from 'node:fs';import {spawnSync} from 'node:child_process';
const tests=JSON.parse(readFileSync('Browser/package.json')).scripts.test.split(' && ').map(x=>x.replace('node ',''));const start=tests.indexOf('test-annexe-east-outer.mjs'),results=[];
for(const test of tests.slice(start)){const r=spawnSync(process.execPath,[test],{cwd:'Browser',encoding:'utf8',windowsHide:true});results.push({test,status:r.status});writeFileSync('Browser/artifacts/roof-contact-'+test+'.log',r.stdout+r.stderr);console.log(test,r.status);}
writeFileSync('Browser/artifacts/roof-contact-remaining.json',JSON.stringify(results,null,2));
