import {readFileSync,writeFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
const cwd=new URL('../../',import.meta.url),out=new URL('./',import.meta.url);
const commands=JSON.parse(readFileSync(new URL('package.json',cwd))).scripts.test.split(' && ');
const after=process.argv.find(a=>a.startsWith('--after='))?.slice(8)??'test-asylum-east-ground-wall.mjs';
const start=commands.findIndex(c=>c==='node '+after)+1,results=[];
for(const command of commands.slice(start)){
 const args=command.split(' ').slice(1),run=spawnSync(process.execPath,args,{cwd,windowsHide:true,encoding:'utf8',maxBuffer:32*1024*1024});
 const file=args[0],record={command,status:run.status};writeFileSync(new URL('tail-'+file+'.log',out),run.stdout+run.stderr);
 if(run.status!==0){
  const before=spawnSync(process.execPath,args,{cwd,windowsHide:true,encoding:'utf8',maxBuffer:32*1024*1024,env:{...process.env,NODE_OPTIONS:(process.env.NODE_OPTIONS??'')+' --import '+new URL('baseline-loader.mjs',out).href}});
  record.before=before.status;writeFileSync(new URL('tail-before-'+file+'.log',out),before.stdout+before.stderr);
 }
 results.push(record);writeFileSync(new URL('suite-tail.json',out),JSON.stringify(results,null,2)+'\n');console.log(JSON.stringify(record));
}
