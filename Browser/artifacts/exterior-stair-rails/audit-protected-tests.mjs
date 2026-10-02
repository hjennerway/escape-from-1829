import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
const cwd=new URL('../../',import.meta.url),out=new URL('./',import.meta.url),loader=new URL('audit-snapshots.mjs',out).href;
const failed=JSON.parse(readFileSync(new URL('suite-tail.json',out))).filter(r=>r.status!==0&&!r.command.includes('test-west-refinement.mjs'));
const results=[];
for(const {command} of failed){
 const file=command.split(' ')[1],key=file.replace('.mjs',''),base={...process.env,NODE_OPTIONS:(process.env.NODE_OPTIONS??'')+' --import '+loader};
 const before=spawnSync(process.execPath,[file],{cwd,windowsHide:true,encoding:'utf8',maxBuffer:32*1024*1024,env:{...base,STAIR_SNAPSHOT_BEFORE:'1',STAIR_SNAPSHOT_CAPTURE:''}});
 writeFileSync(new URL('before-'+key+'.txt',out),before.stdout+before.stderr);
 if(before.status!==0){results.push({file,before:before.status});console.log('Before still fails: '+file);continue;}
 const capture=key+'-fingerprints.json';
 const after=spawnSync(process.execPath,[file],{cwd,windowsHide:true,encoding:'utf8',maxBuffer:32*1024*1024,env:{...base,STAIR_SNAPSHOT_BEFORE:'',STAIR_SNAPSHOT_CAPTURE:capture}});
 writeFileSync(new URL('after-'+key+'.txt',out),after.stdout+after.stderr);
 results.push({file,before:before.status,capture,after:after.status});
 writeFileSync(new URL('snapshot-audit.json',out),JSON.stringify(results,null,2));
 console.log('Audited '+file+'; original='+before.status+', current checks='+after.status);
}
writeFileSync(new URL('snapshot-audit.json',out),JSON.stringify(results,null,2));
