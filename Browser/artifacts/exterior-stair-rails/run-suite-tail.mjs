import {readFileSync,writeFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
const cwd=new URL('../../',import.meta.url),out=new URL('./',import.meta.url);
const commands=JSON.parse(readFileSync(new URL('package.json',cwd))).scripts.test.split(' && ');
const start=commands.indexOf(process.argv[2]??'node test-escape-exterior.mjs'),prefix=process.argv[3]??'suite-tail',results=[];let log='';
if(start<0)throw Error('Unknown starting test');
for(const command of commands.slice(start)){
 const [runtime,...args]=command.split(' ');
 const r=spawnSync(runtime==='node'?process.execPath:runtime,args,{cwd,windowsHide:true,encoding:'utf8',maxBuffer:32*1024*1024});
 results.push({command,status:r.status});log+='\n'+command+'\n'+r.stdout+r.stderr;
 writeFileSync(new URL(prefix+'.txt',out),log);
 writeFileSync(new URL(prefix+'.json',out),JSON.stringify(results,null,2));
 if(r.status!==0)console.log('FAIL '+command+'\n'+(r.stderr||r.stdout).slice(-2500));
}
const failures=results.filter(r=>r.status!==0);console.log(JSON.stringify({tests:results.length,failures}));process.exitCode=failures.length?1:0;
