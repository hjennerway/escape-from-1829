import {execFileSync} from 'node:child_process';
import {readFileSync,writeFileSync,readdirSync} from 'node:fs';
import assert from 'node:assert/strict';
import {ANNEXE_INWARD_SHIFT} from '../dist/annexe-inward-placement.mjs';
const run=args=>JSON.parse(execFileSync(process.execPath,args,{encoding:'utf8',windowsHide:true,maxBuffer:10*1024*1024}));
const beforeArgs=['--import','./Browser/artifacts/annexe-inward-before-loader.mjs'];
const report=[];
// Both states must retain the immutable approved local annexe shape.
for(const args of [beforeArgs,[]])execFileSync(process.execPath,[...args,'Browser/artifacts/snapshot-annexe-shape.mjs'],{windowsHide:true});
for(const [mode,loader] of [['normal',null],['entrance','larkton-original-entrance-loader.mjs'],['east','rear-side-original-east-loader.mjs']]){
 const args=[...(loader?['--import','./Browser/artifacts/'+loader]:[]),'Browser/artifacts/windows-snapshots.mjs',mode];
 const before=run([...beforeArgs,...args]),after=run(args);
 for(let i=0;i<before.length;i++){
  const old=before[i],now=after[i],path='Research/'+old.file,saved=JSON.parse(readFileSync(path));
  if(JSON.stringify(old.value)===JSON.stringify(now.value))continue;
  let value=saved;for(const k of old.key)value=value[k];assert.deepEqual(value,old.value,'Baseline must match before translation: '+path);
  let updated=structuredClone(saved);if(!old.key.length)updated=now.value;else{let part=updated;for(const k of old.key.slice(0,-1))part=part[k];part[old.key.at(-1)]=now.value;}
  writeFileSync(path,JSON.stringify(updated,null,2)+'\n');report.push({file:old.file,key:old.key});
 }
}
const oldLeighton=run([...beforeArgs,'Browser/artifacts/windows-scope.mjs']).protected,newLeighton=run(['Browser/artifacts/windows-scope.mjs']).protected;
const lp='Research/leighton-newton/protected-before.json',leighton=JSON.parse(readFileSync(lp));assert.deepEqual(leighton.geometry,oldLeighton);leighton.geometry=newLeighton;writeFileSync(lp,JSON.stringify(leighton,null,2)+'\n');
const old=JSON.parse(readFileSync('Research/historic-roads/annexe-inward-before.json')).annexe;
// Update only exact saved root matrices for the authorized rigid translation.
const walk=(value)=>{if(Array.isArray(value)&&value.length===16&&value[12]===old.x&&value[14]===old.z){value[12]+=ANNEXE_INWARD_SHIFT[0];value[14]+=ANNEXE_INWARD_SHIFT[1];return true;}let changed=false;if(value&&typeof value==='object')for(const v of Object.values(value))changed=walk(v)||changed;return changed;};
for(const entry of readdirSync('Research',{recursive:true}).filter(f=>f.endsWith('.json')&&!f.includes('annexe-inward-before'))){const path='Research/'+entry;let data;try{data=JSON.parse(readFileSync(path));}catch{continue;}if(walk(data)){writeFileSync(path,JSON.stringify(data,null,2)+'\n');report.push({file:entry,key:'root matrix'});}}
writeFileSync('Browser/artifacts/annexe-inward-snapshot-refresh.json',JSON.stringify(report,null,2)+'\n');console.log(report);
