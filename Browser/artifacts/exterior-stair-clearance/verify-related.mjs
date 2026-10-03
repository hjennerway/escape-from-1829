import {readFileSync,writeFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
const root=new URL('../../../',import.meta.url),out=new URL('./',import.meta.url);
const audits=JSON.parse(readFileSync(new URL('fixture-audit.json',out))),results=[];
const tests=[...audits.filter(a=>a.before===0).map(a=>a.test),'test-explore-interior.mjs','test-exterior-door-supports.mjs','test-exterior-stair-clearance.mjs'];
for(const test of tests){
 const run=spawnSync(process.execPath,['Browser/'+test],{cwd:root,windowsHide:true,encoding:'utf8',maxBuffer:32*1024*1024});
 writeFileSync(new URL('verified-'+test+'.log',out),run.stdout+run.stderr);results.push({test,status:run.status});writeFileSync(new URL('verified-related.json',out),JSON.stringify(results,null,2)+'\n');console.log(JSON.stringify(results.at(-1)));
}
if(results.some(r=>r.status!==0))process.exitCode=1;
