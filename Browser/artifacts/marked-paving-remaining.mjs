import {readFileSync,writeFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
const scripts=JSON.parse(readFileSync('package.json')).scripts.test.split(' && ');
const remaining=scripts.slice(scripts.indexOf('node test-jarman.mjs')+1);
const results=remaining.map(command=>{
 const r=spawnSync(process.execPath,[command.slice(5)],{encoding:'utf8',windowsHide:true});
 return {command,status:r.status,output:r.stdout+r.stderr};
});
writeFileSync('artifacts/marked-paving-remaining.json',JSON.stringify(results,null,2));
console.log(results.filter(r=>r.status).map(r=>({command:r.command,status:r.status})));

