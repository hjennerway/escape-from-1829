import {readFileSync,writeFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
const root=new URL('../../',import.meta.url),out=new URL('./',import.meta.url);
const commands=JSON.parse(readFileSync(new URL('package.json',root),'utf8')).scripts.test.split(' && ');
const index=commands.findIndex(c=>c==='node '+(process.argv[2]??'test-jarman.mjs'));
if(index<0)throw Error('Cannot locate the suite continuation point');
const results=[];
const last=process.argv[3]?commands.findIndex(c=>c==='node '+process.argv[3]):commands.length-1;
if(last<index)throw Error('Invalid continuation endpoint');
const suffix=process.argv[3]?'-middle':'';
for(const command of commands.slice(index+1,last+1)){
 const [program,...args]=command.split(/\s+/);if(program!=='node')throw Error('Unexpected suite command: '+command);
 const start=performance.now(),result=spawnSync(process.execPath,args,{cwd:root,encoding:'utf8',windowsHide:true,maxBuffer:32*1024*1024});
 const entry={command,status:result.status,seconds:Math.round((performance.now()-start)/100)/10};results.push(entry);
 writeFileSync(new URL(args[0]+'.log',out),(result.stdout??'')+(result.stderr??''));
 writeFileSync(new URL('suite-tail'+suffix+'.json',out),JSON.stringify(results,null,2)+'\n');console.log(JSON.stringify(entry));
}
console.log(JSON.stringify({commands:results.length,passed:results.filter(r=>r.status===0).length,failed:results.filter(r=>r.status!==0).map(r=>r.command)}));
