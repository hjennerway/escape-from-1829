import assert from 'node:assert/strict';
import {registerHooks} from 'node:module';
import {readFileSync,writeFileSync} from 'node:fs';
import * as THREE from '../dist/vendor/three.module.js';
import {jarmanProtected} from './jarman-scope.mjs';
import {leightonProtected} from './leighton-scope.mjs';
const before=process.argv.includes('--before');
if(before){
  const sources=new Map([['front-lawn-trees.mjs','lawn-pair-before-trees.mjs'],['front-lawn-eztree.mjs','lawn-pair-before-eztree.mjs']].map(([module,file])=>[module,readFileSync(new URL(file,import.meta.url),'utf8')]));
  registerHooks({load(url,context,nextLoad){const result=nextLoad(url,context),source=sources.get(url.split('/').at(-1));return url.includes('/dist/')&&source?{...result,source}:result;}});
}
const {createEscapeExterior}=await import('../dist/escape-exterior.mjs');
globalThis.document={createElement:()=>({getContext:()=>({fillRect(){},measureText:t=>({width:t.length*16}),strokeText(){},fillText(){}})})};
const estate=createEscapeExterior(THREE,16/9);delete globalThis.document;
const jarmanURL=new URL('../../Research/jarman/protected-geometry.json',import.meta.url),leightonURL=new URL('../../Research/leighton-newton/protected-before.json',import.meta.url);
const jarman=JSON.parse(readFileSync(jarmanURL)),leighton=JSON.parse(readFileSync(leightonURL));
const fingerprint=()=>({jarman:jarmanProtected(THREE,estate.model),leighton:leightonProtected(THREE,estate.model)});
const complete=fingerprint(),pair=estate.trees.children.filter(t=>['East front lawn mature beech','West front lawn mature beech'].includes(t.name));
assert.equal(pair.length,2);for(const tree of pair)tree.removeFromParent();
const outsidePair=fingerprint(),ranges=estate.annexe.userData.wards['leighton-newton'].userData.ranges;
const reportURL=new URL('lawn-pair-scope-before.json',import.meta.url);
if(before){
  assert.deepEqual(complete,{jarman,leighton:leighton.geometry},'Before correction must reproduce both current snapshots');
  writeFileSync(reportURL,JSON.stringify({complete,outsidePair,ranges},null,2)+'\n');
  console.log('PASS: pre-correction model reproduces both saved geometry snapshots.');
}else{
  const prior=JSON.parse(readFileSync(reportURL));
  assert.deepEqual(prior.complete,{jarman,leighton:leighton.geometry},'Do not overwrite snapshots changed during the audit');
  assert.deepEqual(outsidePair,prior.outsidePair,'Every protected primitive outside the original pair stays exact');
  assert.deepEqual(ranges,prior.ranges);assert.deepEqual(ranges,leighton.ranges);
  if(process.argv.includes('--write')){
    writeFileSync(jarmanURL,JSON.stringify(complete.jarman,null,2)+'\n');
    writeFileSync(leightonURL,JSON.stringify({...leighton,geometry:complete.leighton},null,2)+'\n');
  }
  writeFileSync(new URL('lawn-pair-scope-after.json',import.meta.url),JSON.stringify({complete,outsidePair,ranges,onlyOriginalPairChanged:true},null,2)+'\n');
  console.log('PASS: only the original lawn pair changes; geometry snapshots refreshed: '+process.argv.includes('--write'));
}
