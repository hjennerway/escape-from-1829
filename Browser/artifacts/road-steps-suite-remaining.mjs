import {readFile,writeFile} from 'node:fs/promises';
import {spawn} from 'node:child_process';
const directory=new URL('../',import.meta.url);
const pkg=JSON.parse(await readFile(new URL('package.json',directory),'utf8'));
const firstLog=await readFile(new URL('road-steps-suite.log',import.meta.url),'utf8');
const failed=firstLog.match(/at (?:\S+ \()?file:\/\/\/[^\n]*\/Browser\/(test-[^/:]+\.mjs):/)?.[1];
if(!failed)throw new Error('Cannot locate the suite failure');
const commands=pkg.scripts.test.split(' && '),index=commands.findIndex(command=>command==='node '+failed);
if(index<0)throw new Error('Failed command is not in the suite');
const results=[{command:commands[index],code:1}];
async function run(command,prefix=''){
 const args=command.split(' ').slice(1),child=spawn(process.execPath,prefix?['--no-warnings','--loader','./artifacts/road-steps-baseline-loader.mjs',...args]:args,{cwd:directory,windowsHide:true,stdio:'pipe'});
 let output='';child.stdout.on('data',chunk=>output+=chunk);child.stderr.on('data',chunk=>output+=chunk);
 const code=await new Promise((resolve,reject)=>{child.on('exit',resolve);child.on('error',reject);});
 await writeFile(new URL('road-steps-'+prefix+args[0]+'.log',import.meta.url),output);
 console.log(`${code===0?'PASS':'FAIL'}: ${prefix}${command}`);
 return {command,code};
}
for(const command of commands.slice(index+1))results.push(await run(command));
const baseline=[];
for(const result of results.filter(result=>result.code!==0))baseline.push(await run(result.command,'baseline-'));
await writeFile(new URL('road-steps-suite-results.json',import.meta.url),JSON.stringify({passedBeforeFailure:index,results,baseline},null,2));
if(results.some(result=>result.code!==0))process.exitCode=1;
