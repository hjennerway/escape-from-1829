import {execFileSync} from 'node:child_process';
import {writeFile} from 'node:fs/promises';
const cwd=new URL('../../',import.meta.url),checks=[];
for(const name of ['test-east-roof-brick-joins.mjs','test-east-entrance-roof-boundary.mjs','test-west-entrance-roof-boundary.mjs','test-front-inside-corners.mjs','test-west-roof-join.mjs','test-roof-contacts.mjs','test-roof-tiles.mjs','test-redesmere-garden.mjs','test-escape-exterior.mjs']){
 const output=execFileSync(process.execPath,[name],{cwd,encoding:'utf8',windowsHide:true});checks.push({name,output});console.log(output.trim());
}
const baseline=[];
for(const mode of ['yellow','blue']){
 try{execFileSync(process.execPath,['--import','./artifacts/east-roof-brick-joins/baseline-loader.mjs','test-east-roof-brick-joins.mjs'],{cwd,env:{...process.env,ROOF_BASELINE:mode},encoding:'utf8',windowsHide:true,stdio:'pipe'});throw Error('Saved '+mode+' defect unexpectedly passes');}
 catch(e){if(!e.status||!String(e.stderr).includes('The marked roof pixel has slate ahead of brick'))throw e;baseline.push({mode,status:e.status,assertion:String(e.stderr).split('\n').find(s=>s.includes('AssertionError'))});}
}
await writeFile(new URL('logic-validation.json',import.meta.url),JSON.stringify({checks,baseline},null,2)+'\n');
console.log('PASS: both saved original defects independently fail the new regression.');
