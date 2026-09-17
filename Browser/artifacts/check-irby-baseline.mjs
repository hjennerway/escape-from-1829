import {spawnSync} from 'node:child_process';
import {writeFileSync} from 'node:fs';
const results=[];
for(const file of ['test-annexe-photo-placement.mjs','test-historic-roads.mjs']){
 const result=spawnSync(process.execPath,['--no-warnings','--loader','./Browser/artifacts/irby-baseline-loader.mjs','./Browser/'+file],{encoding:'utf8'});
 results.push({file,status:result.status,failure:result.stderr.match(/AssertionError[^\r\n]*/)?.[0]??result.stderr.slice(0,250)});
}
writeFileSync(new URL('./irby-baseline-results.json',import.meta.url),JSON.stringify(results,null,2)+'\n');
console.log(JSON.stringify(results,null,2));
