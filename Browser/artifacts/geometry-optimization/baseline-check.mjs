import {spawnSync} from 'node:child_process';
import {writeFile} from 'node:fs/promises';
const results=[];
for(const test of ['test-reception-second-floor.mjs','test-jarman.mjs','test-leighton-newton.mjs','test-aerial-layouts.mjs']){
 const result=spawnSync(process.execPath,['--no-warnings','--experimental-loader','./artifacts/geometry-optimization/baseline-loader.mjs',test],{cwd:new URL('../../',import.meta.url),encoding:'utf8',maxBuffer:10*1024*1024});
 await writeFile(new URL('logs/baseline-'+test+'.log',import.meta.url),result.stdout+result.stderr);results.push({test,exit:result.status});
}
await writeFile(new URL('baseline-results.json',import.meta.url),JSON.stringify(results,null,2)+'\n');console.log(JSON.stringify(results,null,2));
