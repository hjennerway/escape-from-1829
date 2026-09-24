import {readFileSync,writeFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
const tests=JSON.parse(readFileSync('Browser/package.json')).scripts.test.split(' && ').map(t=>t.replace(/^node /,''));
const results=[];for(const test of tests.slice(tests.indexOf('test-annexe-access.mjs')+1)){const r=spawnSync(process.execPath,[test],{cwd:'Browser',encoding:'utf8',windowsHide:true});results.push({test,exit:r.status,output:r.stdout+r.stderr});}
writeFileSync('Browser/artifacts/annexe-inward-suite-remaining.log',results.map(r=>r.test+'\n'+r.output).join('\n'));console.log(results.map(({test,exit})=>({test,exit})));
