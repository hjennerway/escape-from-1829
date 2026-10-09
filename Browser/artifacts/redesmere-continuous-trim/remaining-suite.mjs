import {readFileSync,writeFileSync,appendFileSync} from 'node:fs';
import {spawn} from 'node:child_process';
const cwd=new URL('../../',import.meta.url),directory=new URL('./',import.meta.url);
const script=JSON.parse(readFileSync(new URL('package.json',cwd))).scripts.test;
const commands=script.split(' && '),start=commands.indexOf('node test-jarman.mjs');
if(start<0)throw new Error('Resume point not found');
const pending=commands.slice(start),results=[];let next=0;
writeFileSync(new URL('remaining-suite.log',directory),'Remaining npm test checks after refreshing independently verified whole-estate snapshots.\n');
async function worker(){
 while(next<pending.length){
  const command=pending[next++],match=command.match(/^node ([\w-]+\.mjs)$/);if(!match)throw new Error('Unexpected command '+command);
  const result=await new Promise(resolve=>{
   const child=spawn(process.execPath,[match[1]],{cwd,windowsHide:true,stdio:['ignore','pipe','pipe']});let output='';
   child.stdout.on('data',d=>output+=d);child.stderr.on('data',d=>output+=d);
   child.on('exit',code=>resolve({command,code,output}));
  });
  results.push({command,code:result.code});appendFileSync(new URL('remaining-suite.log',directory),`\n${command} (exit ${result.code})\n${result.output}`);
  console.log(`${results.length}/${pending.length}: ${command} exit ${result.code}`);
 }
}
await Promise.all([worker(),worker()]);
writeFileSync(new URL('remaining-suite.json',directory),JSON.stringify(results,null,2)+'\n');
process.exitCode=results.some(r=>r.code!==0)?1:0;
