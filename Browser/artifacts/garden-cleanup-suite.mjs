import {spawnSync} from 'node:child_process';
import {readFileSync,writeFileSync} from 'node:fs';
const commands=JSON.parse(readFileSync('package.json','utf8')).scripts.test.split(' && ');
const npm=spawnSync(process.execPath,['C:/Program Files/nodejs/node_modules/npm/bin/npm-cli.js','test'],{encoding:'utf8',windowsHide:true,maxBuffer:20e6});
writeFileSync('artifacts/garden-cleanup-suite.log',npm.stdout+npm.stderr);
if(npm.status===0){console.log('PASS: npm test ('+commands.length+' commands)');process.exit();}
const match=(npm.stdout+npm.stderr).match(/at file:\/\/\/[^\n]+\/(test-[a-z0-9-]+\.mjs):\d+/);
if(!match)throw new Error('Unexpected npm failure; inspect garden-cleanup-suite.log');
const stop=commands.findIndex(command=>command==='node '+match[1]);
if(stop<0)throw new Error('Could not locate suite failure');
const results=commands.slice(0,stop).map(command=>({command,status:0}));
results.push({command:commands[stop],status:1});console.log('npm test stopped at '+match[1]+'; continuing every remaining command.');
for(const command of commands.slice(stop+1)){
 const args=command.split(' ').slice(1),result=spawnSync(process.execPath,args,{encoding:'utf8',windowsHide:true,maxBuffer:20e6});
 writeFileSync('artifacts/garden-cleanup-'+args[0]+'.log',result.stdout+result.stderr);
 results.push({command,status:result.status});console.log((result.status===0?'PASS: ':'FAIL: ')+command);
}
writeFileSync('artifacts/garden-cleanup-suite-results.json',JSON.stringify(results,null,2)+'\n');
console.log(results.filter(r=>r.status===0).length+'/'+results.length+' commands passed.');
process.exitCode=results.some(r=>r.status!==0)?1:0;
