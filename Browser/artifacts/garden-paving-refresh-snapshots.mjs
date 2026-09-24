import {execFileSync} from 'node:child_process';
import {readFileSync,writeFileSync} from 'node:fs';
import assert from 'node:assert/strict';
const oldArgs=['--import','./Browser/artifacts/garden-paving-before-loader.mjs'];
const run=args=>JSON.parse(execFileSync(process.execPath,args,{encoding:'utf8',windowsHide:true,maxBuffer:10*1024*1024}));
const changes=[];
for(const [mode,loader] of [['normal',null],['entrance','larkton-original-entrance-loader.mjs'],['east','rear-side-original-east-loader.mjs']]){
 const args=[...(loader?['--import','./Browser/artifacts/'+loader]:[]),'Browser/artifacts/windows-snapshots.mjs',mode];
 const before=run([...oldArgs,...args]),after=run(args);
 for(let i=0;i<before.length;i++){
  const old=before[i],now=after[i],path='Research/'+old.file,saved=JSON.parse(readFileSync(path));
  if(JSON.stringify(old.value)===JSON.stringify(now.value))continue;
  let value=saved;for(const k of old.key)value=value[k];if(JSON.stringify(value)===JSON.stringify(now.value))continue;assert.deepEqual(value,old.value,'Validate pre-repair baseline: '+path);
  let updated=structuredClone(saved);if(!old.key.length)updated=now.value;else{let part=updated;for(const k of old.key.slice(0,-1))part=part[k];part[old.key.at(-1)]=now.value;}
  writeFileSync(path,JSON.stringify(updated,null,2)+'\n');changes.push({file:old.file,key:old.key});
 }
}
const old=run([...oldArgs,'Browser/artifacts/windows-scope.mjs']).protected,now=run(['Browser/artifacts/windows-scope.mjs']).protected;
const path='Research/leighton-newton/protected-before.json',saved=JSON.parse(readFileSync(path));if(JSON.stringify(saved.geometry)!==JSON.stringify(now))assert.deepEqual(saved.geometry,old);saved.geometry=now;writeFileSync(path,JSON.stringify(saved,null,2)+'\n');
execFileSync(process.execPath,[...oldArgs,'Browser/artifacts/snapshot-annexe-front.mjs'],{windowsHide:true});
execFileSync(process.execPath,['Browser/artifacts/snapshot-annexe-front.mjs'],{windowsHide:true});
writeFileSync('Browser/artifacts/garden-paving-snapshot-refresh.json',JSON.stringify(changes,null,2)+'\n');console.log(changes);




