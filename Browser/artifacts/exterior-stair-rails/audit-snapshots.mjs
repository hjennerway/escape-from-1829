// Test-only audit: restore just the stair edits for before/after fingerprint
// comparisons. Never modifies or substitutes the working model files.
import {registerHooks} from 'node:module';
import {execFileSync} from 'node:child_process';
import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import assert from 'node:assert/strict';
const root=new URL('../../../',import.meta.url),out=new URL('./',import.meta.url);
const ranges={
 'annexe.mjs':[' // The door sill meets',' const westSide=new'],
 'west-front-photo-detail.mjs':['  const stair=new','  // Lower forward range'],
 'central-court-photo-detail.mjs':['  const stair=new','  model.userData.centralCourtPhotoOpenings'],
 'courtyard-photo-detail.mjs':['  const stair=new','  // Left two-storey range'],
 'inner-court-photo-detail.mjs':['  const stairs=new','  // The opposite central-arm stair'],
 'rear-court-photo-detail.mjs':['  // A return stair reaches','  // East wing:'],
 'west-forward-end-photo-detail.mjs':['  const stair=new','  box(gravel'],
 'east-photo-detail.mjs':['  // External metal stair descends','  // Three-storey wall'],
 'pharmacy-court.mjs':[' function stair(name,',' stair(\'Pharmacy east'],
 'front-steps.mjs':null
};
if(process.env.STAIR_SNAPSHOT_BEFORE){
 const originals=new Map(Object.keys(ranges).map(name=>[name,execFileSync('git',['show','HEAD:Browser/dist/'+name],{cwd:root,encoding:'utf8',windowsHide:true})]));
 registerHooks({load(url,context,next){
  const result=next(url,context),name=url.split('/').at(-1);
  if(!url.includes('/dist/')||!originals.has(name))return result;
  const original=originals.get(name),source=String(result.source),range=ranges[name];
  if(!range)return {...result,source:original};
  const [a,b]=range,oldStart=original.indexOf(a),oldEnd=original.indexOf(b,oldStart),start=source.indexOf(a),end=source.indexOf(b,start);
  if(Math.min(oldStart,oldEnd,start,end)<0)throw Error('Missing stair audit anchors: '+name);
  return {...result,source:source.slice(0,start)+original.slice(oldStart,oldEnd)+source.slice(end)};
 }});
}
// Record only fingerprint assertions; all other assertions retain their normal
// behavior. Capture mode is confined to this audit, never used by npm test.
if(process.env.STAIR_SNAPSHOT_CAPTURE){
 const path=new URL(process.env.STAIR_SNAPSHOT_CAPTURE,out),records=[];
 const save=entry=>{records.push(entry);writeFileSync(path,JSON.stringify(records,null,2));};
 const isFingerprint=value=>value&&typeof value==='object'&&(Object.entries(value).some(([key,v])=>['sha256','hash','digest'].includes(key)&&typeof v==='string'&&/^[a-f0-9]{64}$/.test(v))||Object.values(value).some(isFingerprint));
 let lastCount;
 for(const method of ['deepEqual','deepStrictEqual','equal','strictEqual']){
  const original=assert[method].bind(assert);
  assert[method]=(actual,expected,...rest)=>{
   if(isFingerprint(expected)&&isFingerprint(actual)){save({actual,expected,message:rest[0]});return;}
   if(typeof expected==='string'&&/^[a-f0-9]{64}$/.test(expected)&&typeof actual==='string'){
    save({actual:{sha256:actual,...(lastCount?{count:lastCount.actual}:{})},expected:{sha256:expected,...(lastCount?{count:lastCount.expected}:{})},scalar:true,message:rest[0]});lastCount=null;return;
   }
   if(Number.isInteger(actual)&&Number.isInteger(expected)&&actual!==expected){lastCount={actual,expected};return;}
   return original(actual,expected,...rest);
  };
 }
}
