import {readFileSync,writeFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
const commands=JSON.parse(readFileSync('package.json')).scripts.test.split(' && ');
const remaining=commands.slice(commands.findIndex(command=>command==='node test-larkton.mjs')+1);
const results=remaining.map(command=>{const result=spawnSync(process.execPath,command.split(' ').slice(1),{encoding:'utf8',windowsHide:true});console.log(command+' '+(result.status===0?'PASS':'FAIL'));if(result.status!==0)console.log(result.stdout,result.stderr);return {command,status:result.status,stdout:result.stdout,stderr:result.stderr};});
writeFileSync('artifacts/irby-rounding-remaining.json',JSON.stringify(results,null,2));
if(results.some(result=>result.status!==0))process.exitCode=1;
