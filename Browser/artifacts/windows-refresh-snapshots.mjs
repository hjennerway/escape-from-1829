// Update only snapshots that matched the pre-change window model. Never accept
// an unrelated baseline discrepancy as part of this window change.
import {execFileSync} from 'node:child_process';
import {readFileSync,writeFileSync} from 'node:fs';
import assert from 'node:assert/strict';
const run=args=>JSON.parse(execFileSync(process.execPath,args,{encoding:'utf8',windowsHide:true,maxBuffer:10*1024*1024}));
const beforeArgs=['--import','./Browser/artifacts/windows-before-loader.mjs'];
assert.deepEqual(run(['Browser/artifacts/windows-scope.mjs']),run([...beforeArgs,'Browser/artifacts/windows-scope.mjs']),'All non-ward geometry and opening dimensions must match before any fixture refresh');
const report=[];
for(const [mode,loader] of [['normal',null],['entrance','larkton-original-entrance-loader.mjs'],['east','rear-side-original-east-loader.mjs']]){
 const args=[...(loader?['--import','./Browser/artifacts/'+loader]:[]),'Browser/artifacts/windows-snapshots.mjs',mode];
 const before=run([...beforeArgs,...args]),after=run(args);
 for(let i=0;i<before.length;i++){
  const old=before[i],now=after[i],path='Research/'+old.file,saved=JSON.parse(readFileSync(path,'utf8'));
  if(JSON.stringify(old.value)===JSON.stringify(now.value))continue;
  let value=saved;for(const k of old.key)value=value[k];
  try{assert.deepEqual(value,old.value);}catch{report.push({file:old.file,key:old.key,status:'pre-existing mismatch; left unchanged'});continue;}
  let updated=structuredClone(saved);
  if(!old.key.length)updated=now.value;else{let part=updated;for(const k of old.key.slice(0,-1))part=part[k];part[old.key.at(-1)]=now.value;}
  writeFileSync(path,JSON.stringify(updated,null,2)+'\n');report.push({file:old.file,key:old.key,status:'updated'});
 }
}
writeFileSync('Browser/artifacts/windows-snapshot-refresh.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));
