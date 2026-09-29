import assert from 'node:assert/strict';
import {registerHooks} from 'node:module';
import {readFileSync,writeFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import * as THREE from '../dist/vendor/three.module.js';
import {modelSourceHash} from '../model-build-inputs.mjs';
import {exteriorObstacles,obstacleContains} from '../dist/explore-controls.mjs';
const sourceHash=await modelSourceHash();
const sourceURL=new URL('../dist/escape-exterior.mjs',import.meta.url);
const source=readFileSync(sourceURL,'utf8');
const refreshShared=process.argv.includes('--refresh-shared-snapshots');
const savedBasement=refreshShared?execFileSync('git',['show','HEAD:Browser/dist/front-basement.mjs'],{cwd:new URL('../../',import.meta.url),encoding:'utf8',windowsHide:true}):null;
const addition=/  \/\/ September 29 marked gaps:[\s\S]*?\n  }\r?\n/;
assert(addition.test(source));
let beforeMode=true,captureScope;
const rowsByScope={};
globalThis.captureOrchardRows=(scope,rows)=>{
 if(captureScope===scope)rowsByScope[scope]=rows;
};
registerHooks({load(url,context,nextLoad){
 const result=nextLoad(url,context);
 if(url.endsWith('/front-basement.mjs?orchard-saved'))return {...result,source:savedBasement};
 if(url.startsWith(sourceURL.href)&&beforeMode){
  const baseline=source.replace(addition,'');
  return {...result,source:refreshShared?baseline.replace("'./front-basement.mjs'","'./front-basement.mjs?orchard-saved'"):baseline};
 }
 if(url.endsWith('/jarman-scope.mjs'))return {...result,source:String(result.source).replace('return {primitives:',"globalThis.captureOrchardRows('jarman',rows);return {primitives:")};
 if(url.endsWith('/leighton-scope.mjs'))return {...result,source:String(result.source).replace('return {count:',"globalThis.captureOrchardRows('leighton',rows);return {count:")};
 return result;
}});
const {jarmanProtected}=await import('./jarman-scope.mjs');
const {leightonProtected}=await import('./leighton-scope.mjs');
const {createEscapeExterior:oldBuilder}=await import(sourceURL.href+'?orchard-before');
globalThis.document={createElement:()=>({getContext:()=>({fillRect(){},measureText:t=>({width:t.length*16}),strokeText(){},fillText(){}})})};
const before=oldBuilder(THREE,16/9);beforeMode=false;
const {createEscapeExterior}=await import(sourceURL.href+'?orchard-after');
const after=createEscapeExterior(THREE,16/9);
const jarmanURL=new URL('../../Research/jarman/protected-geometry.json',import.meta.url);
const leightonURL=new URL('../../Research/leighton-newton/protected-before.json',import.meta.url);
const saved={jarman:JSON.parse(readFileSync(jarmanURL)),leighton:JSON.parse(readFileSync(leightonURL))};
const report={sourceHash,before:{},after:{},added:{},baselineMatches:{}};
for(const [scope,helper] of [['jarman',jarmanProtected],['leighton',leightonProtected]]){
 captureScope=scope;report.before[scope]=helper(THREE,before.model);
 report.baselineMatches[scope]=JSON.stringify(report.before[scope])===JSON.stringify(scope==='jarman'?saved.jarman:saved.leighton.geometry);
 const remaining=new Map();for(const row of rowsByScope[scope])remaining.set(row,(remaining.get(row)??0)+1);
 report.after[scope]=helper(THREE,after.model);
 const added=[];
 for(const row of rowsByScope[scope]){const count=remaining.get(row)??0;if(count)remaining.set(row,count-1);else added.push(JSON.parse(row));}
 const removed=[...remaining].flatMap(([row,count])=>Array.from({length:count},()=>JSON.parse(row)));
 const wallName=/^(East|West) semi-basement retaining wall 7( foundation)?$/;
 if(refreshShared){
  assert.deepEqual(removed.map(row=>row[0]).sort(),['East semi-basement retaining wall 7','West semi-basement retaining wall 7']);
  assert.deepEqual(added.filter(row=>wallName.test(row[0])).map(row=>row[0]).sort(),['East semi-basement retaining wall 7','East semi-basement retaining wall 7 foundation','West semi-basement retaining wall 7','West semi-basement retaining wall 7 foundation']);
 }else assert.equal(removed.length,0,'Every existing '+scope+' primitive stays exact');
 const planting=added.filter(row=>!refreshShared||!wallName.test(row[0]));
 assert.equal(planting.length,42,'Three fixtures add one trunk, five crowns, two bed surfaces and six shrubs each');
 const counts={0:0,56:0,70:0};
 for(const row of planting){
  const [x,y,z]=row[3].slice(12,15),center=[0,56,70].find(cx=>Math.abs(x-cx)<3.2);
  assert(center!==undefined&&Math.abs(z+64)<2.7&&y>=.2&&y<6,'Added geometry stays inside the three marked fixtures');
  counts[center]++;
 }
 assert.deepEqual(Object.values(counts),[14,14,14]);report.added[scope]=counts;
 delete rowsByScope[scope];
}
if(refreshShared){
 for(const side of ['East','West']){
  const upper=after.model.getObjectByName(side+' semi-basement retaining wall 7');
  const foundation=after.model.getObjectByName(side+' semi-basement retaining wall 7 foundation');
  const original=before.model.getObjectByName(side+' semi-basement retaining wall 7');
  const oldBounds=new THREE.Box3().setFromObject(original),topBounds=new THREE.Box3().setFromObject(upper),baseBounds=new THREE.Box3().setFromObject(foundation);
  assert.equal(upper.material.color.getHex(),original.material.color.getHex());
  assert.equal(foundation.material.color.getHex(),original.material.color.getHex());
  for(const key of ['x','z'])assert(Math.abs(baseBounds.min[key]-oldBounds.min[key])<1e-6&&Math.abs(baseBounds.max[key]-oldBounds.max[key])<1e-6);
  assert(Math.abs(baseBounds.min.y-oldBounds.min.y)<1e-6&&Math.abs(baseBounds.max.y)<1e-6);
  assert(Math.abs(topBounds.min.y)<1e-6&&Math.abs(topBounds.max.y-oldBounds.max.y)<1e-6);
  assert(Math.abs(topBounds.min.z-oldBounds.min.z)<1e-6&&Math.abs(topBounds.max.z-(oldBounds.max.z-.03))<1e-6);
  assert.equal(upper.userData.walkBarrier,original.userData.walkBarrier);assert.equal(foundation.userData.walkBarrier,original.userData.walkBarrier);
 }
}
const originals=before.trees.children.filter(t=>t.userData.broadleafTree).map(t=>t.userData.broadleafTree);
const current=after.trees.children.filter(t=>t.userData.broadleafTree).map(t=>t.userData.broadleafTree);
assert.deepEqual(current.slice(0,originals.length),originals,'Every existing seeded crown stays identical');
const orchard=current.filter(t=>t.z===-64).map(t=>t.x).sort((a,b)=>a-b);
assert.deepEqual(orchard,[-28,-14,0,14,28,42,56,70]);
const visibleObstacles=exteriorObstacles(THREE,after.trees);
for(const x of [0,56,70])assert(visibleObstacles.some(o=>obstacleContains(o,x,-64,0)),'New trunk blocks walking');
after.trees.visible=false;
const hiddenObstacles=exteriorObstacles(THREE,after.trees);
for(const x of [0,56,70])assert(!hiddenObstacles.some(o=>obstacleContains(o,x,-64,0)),'Hidden tree no longer blocks walking');
assert.deepEqual(after.annexe.userData.wards['leighton-newton'].userData.ranges,saved.leighton.ranges);
assert.equal(await modelSourceHash(),sourceHash,'Source changed during audit');
assert.deepEqual(JSON.parse(readFileSync(jarmanURL)),saved.jarman,'Snapshot changed during audit');
assert.deepEqual(JSON.parse(readFileSync(leightonURL)),saved.leighton,'Snapshot changed during audit');
if(process.argv.includes('--write')){
 assert(Object.values(report.baselineMatches).every(Boolean),'Only refresh snapshots when pre-addition geometry matches the saved baseline');
 writeFileSync(jarmanURL,JSON.stringify(report.after.jarman,null,2)+'\n');
 writeFileSync(leightonURL,JSON.stringify({...saved.leighton,geometry:report.after.leighton},null,2)+'\n');
}
writeFileSync(new URL(refreshShared?'orchard-planters-shared-snapshot-audit.json':'orchard-planters-audit.json',import.meta.url),JSON.stringify({...report,orchard,existingGeometryUnchanged:!refreshShared,concurrentStairWallsAudited:refreshShared,treeCollisionsPass:true},null,2)+'\n');
console.log('PASS: three matching fixtures, seeded trees, even spacing and tree visibility collisions verified; '+(refreshShared?'two concurrent stair walls audited.':'every old primitive preserved.')+' Snapshots updated: '+process.argv.includes('--write'));
