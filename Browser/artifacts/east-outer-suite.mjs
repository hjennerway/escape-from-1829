import {readFileSync,writeFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
const tests=JSON.parse(readFileSync(new URL('../package.json',import.meta.url))).scripts.test.split(' && ').map(s=>s.slice(5));
const results=[];
for(const file of tests){
 const result=spawnSync(process.execPath,[file],{cwd:new URL('../',import.meta.url),encoding:'utf8',windowsHide:true});
 let baseline;
 if(result.status!==0&&file!=='test-annexe-east-outer.mjs'){
  baseline=spawnSync(process.execPath,['--import','./artifacts/east-outer-before-loader.mjs',file],{cwd:new URL('../',import.meta.url),encoding:'utf8',windowsHide:true});
 }
 results.push({file,status:result.status,baselineStatus:baseline?.status,output:result.stdout+result.stderr,baselineOutput:baseline?baseline.stdout+baseline.stderr:undefined});
 console.log(file+': '+(result.status===0?'PASS':'FAIL (pre-edit replay '+(baseline?.status===0?'passes':'also fails')+')'));
}
writeFileSync(new URL('east-outer-suite-results.json',import.meta.url),JSON.stringify(results,null,2));
