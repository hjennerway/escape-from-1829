import {readFileSync,writeFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
const refreshed=JSON.parse(readFileSync(new URL('./fingerprints-refreshed.json',import.meta.url),'utf8'));
if(refreshed.length!==11)throw Error('Expected the completed scoped fingerprint refresh');
const tests=['test-annexe-carden.mjs','test-annexe-front-link.mjs','test-annexe-kitchen.mjs','test-annexe-rear-stretch.mjs','test-annexe-rear-side-alignment.mjs','test-annexe-os-refinement.mjs','test-oakmere-court.mjs','test-oakmere-west.mjs','test-oakmere-windows.mjs','test-annexe-access.mjs'],results=[];
for(const name of tests){
 const result=spawnSync(process.execPath,[name],{cwd:new URL('../../',import.meta.url),encoding:'utf8',windowsHide:true,maxBuffer:32*1024*1024});
 writeFileSync(new URL('rechecked-'+name+'.log',import.meta.url),(result.stdout??'')+(result.stderr??''));
 results.push({name,status:result.status});writeFileSync(new URL('scopes-rechecked.json',import.meta.url),JSON.stringify(results,null,2)+'\n');console.log(name+': '+result.status);
}
if(results.some(r=>r.status!==0))process.exitCode=1;
