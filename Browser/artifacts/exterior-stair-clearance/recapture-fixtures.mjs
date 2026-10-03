import {readFileSync,writeFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const root=new URL('../../../',import.meta.url),out=new URL('./',import.meta.url),file=new URL('fixture-audit.json',out);
const audits=JSON.parse(readFileSync(file));
for(const audit of audits){
 if(audit.before!==0)continue;
 const captured=spawnSync(process.execPath,['Browser/'+audit.test],{cwd:root,windowsHide:true,encoding:'utf8',maxBuffer:32*1024*1024,env:{...process.env,NODE_OPTIONS:(process.env.NODE_OPTIONS??'')+' --import '+new URL('capture-fingerprints.mjs',out).href,STAIR_CAPTURE:fileURLToPath(new URL(audit.capture,out))}});
 audit.after=captured.status;writeFileSync(new URL('captured-'+audit.test+'.log',out),captured.stdout+captured.stderr);writeFileSync(file,JSON.stringify(audits,null,2)+'\n');console.log(JSON.stringify({test:audit.test,after:audit.after}));
}
