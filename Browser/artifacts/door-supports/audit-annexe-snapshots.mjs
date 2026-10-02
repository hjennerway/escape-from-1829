import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import * as THREE from '../../dist/vendor/three.module.js';
import {createEscapeExterior} from '../../dist/escape-exterior.mjs';
import {larktonProtected} from '../larkton-scope.mjs';
import {recessProtected} from '../larkton-recess-scope.mjs';
import {cardenCorrectionSnapshot} from '../annexe-carden-correction-scope.mjs';
import {cardenHeightSnapshot} from '../annexe-carden-height-scope.mjs';
import {frontLinkSnapshot} from '../annexe-front-link-scope.mjs';
import {protectedKitchenGeometry} from '../annexe-kitchen-scope.mjs';
import {eastOuterProtected} from '../east-outer-scope.mjs';
import {rearStretchSnapshot} from '../annexe-rear-stretch-scope.mjs';
import {rearSideSnapshot} from '../rear-side-alignment-scope.mjs';
import {oakmereCourtProtected} from '../oakmere-court-scope.mjs';
import {protectedWindowGeometry} from '../oakmere-window-scope.mjs';
import {ANNEXE,ANNEXE_SITE,ANNEXE_MAP_SCALE} from '../../dist/annexe.mjs';
globalThis.document={createElement:()=>({getContext:()=>({fillRect(){}})})};
const annexe=createEscapeExterior(THREE,1.5).annexe,doors=[],landings=[];
annexe.traverse(o=>{if(o.name==='Tower fire exit door')doors.push(o);if(o.name==='Fire stair landing')landings.push(o);});
assert.equal(doors.length,2);
for(const o of doors){assert.equal(o.position.y,6.525);assert.equal(o.geometry.parameters.height,2.8);}
assert.equal(landings.length,2);
const currentLandings=landings.map(o=>({o,geometry:o.geometry,position:o.position.clone()}));
// The existing UV mapper writes metre-scaled coordinates on each box.
const oldLandingGeometry=currentLandings[0].geometry.clone();
const geometrySource=new THREE.BoxGeometry(2,.15,2),oldPos=geometrySource.attributes.position,newPos=oldLandingGeometry.attributes.position;
for(let i=0;i<newPos.count;i++)newPos.setXYZ(i,oldPos.getX(i),oldPos.getY(i),oldPos.getZ(i));
// Recreate the original annexe's box UVs with the same building mapper.
const uv=oldLandingGeometry.attributes.uv,n=oldLandingGeometry.attributes.normal;
for(let i=0;i<newPos.count;i++){uv.setXY(i,(Math.abs(n.getX(i))>.5?newPos.getZ(i):newPos.getX(i))/1.7,(Math.abs(n.getY(i))>.5?newPos.getZ(i):newPos.getY(i))/1.7);}
function restoreOld(){for(const o of doors)o.position.set(-29.15,3.6,-.2);for(const o of landings){o.position.set(-30.1,5.05,-.2);o.geometry=oldLandingGeometry;}}
function restoreNew(){for(const o of doors)o.position.set(-29.19,6.525,-.2);for(const s of currentLandings){s.o.position.copy(s.position);s.o.geometry=s.geometry;}}
function localSnapshot(front=false){
 annexe.updateMatrixWorld(true);const rows=[],instance=new THREE.Matrix4(),inverse=annexe.matrixWorld.clone().invert();
 const protectedName=name=>/^(Central hall|Entrance |Hall dormer|West front pavilion|East front pavilion|West square tower|East square tower|West pavilion|East pavilion|West tower|East tower|Tower |Portal |Bell|Belfry |Visible hanging bell|Weather vane)/.test(name);
 annexe.traverse(o=>{
  if(!o.isMesh||(!front&&o.name==='Annexe drive'))return;
  let side=false;for(let p=o.parent;p&&p!==annexe;p=p.parent)if(/mirrored side details/.test(p.name))side=true;
  const rootInstances=o.isInstancedMesh&&o.parent===annexe;
  if(front&&!protectedName(o.name)&&!side&&!rootInstances)return;
  const hash=createHash('sha256');for(const [key,a] of Object.entries(o.geometry.attributes).sort()){hash.update(key);hash.update(Buffer.from(a.array.buffer,a.array.byteOffset,a.array.byteLength));}if(o.geometry.index)hash.update(Buffer.from(o.geometry.index.array.buffer));
  const geometry=hash.digest('hex'),local=front?new THREE.Matrix4().multiplyMatrices(inverse,o.matrixWorld):o.matrix.clone();
  if(!front)for(let p=o.parent;p&&p!==annexe;p=p.parent)local.premultiply(p.matrix);
  const record=m=>rows.push(JSON.stringify([geometry,o.material.color?.getHex(),m.elements.map(n=>+n.toFixed(6))]));
  if(o.isInstancedMesh){for(let i=0;i<o.count;i++){o.getMatrixAt(i,instance);const p=new THREE.Vector3().setFromMatrixPosition(instance);if(!front||Math.abs(p.x)<32&&p.z>=-19&&(Math.abs(p.x)>11||p.z>=-8))record(new THREE.Matrix4().multiplyMatrices(local,instance));}}else record(local);
 });return {count:rows.length,digest:createHash('sha256').update(rows.sort().join('\n')).digest('hex')};
}
function withoutCourt(compute){const c=annexe.getObjectByName('Oakmere rear court additions'),p=c?.parent;if(c)p.remove(c);try{return compute();}finally{if(c)p.add(c);}}
const westTest=readFileSync(new URL('../../test-oakmere-west.mjs',import.meta.url),'utf8');
const westCompute=new Function('THREE','e','createHash','ANNEXE','ANNEXE_SITE','ANNEXE_MAP_SCALE','detail',westTest.slice(westTest.indexOf('const records='),westTest.indexOf('const baseline='))+'return fingerprint;');
const entranceTest=readFileSync(new URL('../annexe-entrance-alignment-scope.mjs',import.meta.url),'utf8');
const entranceCompute=new Function('THREE','annexe','createHash','ANNEXE_MAP_SCALE',entranceTest.slice(entranceTest.indexOf('const rows='),entranceTest.indexOf('const before=')).replace(/const path=new URL\([^\n]+\);\r?\n/,'')+'return protectedGeometry;');
const variant=process.argv.includes('--extra')?'extra':process.argv.includes('--larkton')?'larkton':process.argv.includes('--rear')?'rear':'standard';
const extra=[
 ['larkton-jodrell/recess-protected-before.json','outside',()=>withoutCourt(()=>larktonProtected(THREE,annexe))],
 ['larkton-jodrell/recess-protected-before.json','retained',()=>withoutCourt(()=>recessProtected(THREE,annexe))],
 ['oakmere/court-protected-before.json',null,()=>oakmereCourtProtected(THREE,annexe)],
 ['oakmere/window-protected-geometry.json',null,()=>protectedWindowGeometry(THREE,annexe)],
 ['annexe-frontage-adjustment/entrance-alignment-before.json','protectedGeometry',()=>entranceCompute(THREE,annexe,createHash,ANNEXE_MAP_SCALE)],
 ['oakmere/west-protected-geometry.json',null,()=>westCompute(THREE,{annexe},createHash,ANNEXE,ANNEXE_SITE,ANNEXE_MAP_SCALE,annexe.userData.oakmereWestElevation)]
];
const checks=variant==='extra'?extra:variant==='larkton'?[
 ['larkton-jodrell/protected-before.json',null,()=>larktonProtected(THREE,annexe)]
]:variant==='rear'?[
 ['annexe-kitchen/side-alignment-before.json','snapshot',()=>rearSideSnapshot(THREE,annexe,{normalise:true})]
]:[
 ['carden-picton/outward-protected-geometry.json',null,()=>cardenCorrectionSnapshot(THREE,annexe,{excludeConcurrentJarman:true})],
 ['carden-picton/height-extension-before.json','protected',()=>cardenHeightSnapshot(THREE,annexe).protected],
 ['annexe-frontage-adjustment/front-link-before.json',null,()=>{const {primitives,sha256}=frontLinkSnapshot(THREE,annexe);return {primitives,sha256};}],
 ['annexe-kitchen/protected-geometry.json',null,()=>protectedKitchenGeometry(THREE,annexe)],
 ['annexe-east-outer/protected-before.json',null,()=>eastOuterProtected(THREE,annexe)],
 ['annexe-kitchen/rear-stretch-before.json','front',()=>rearStretchSnapshot(THREE,annexe).front],
 ['annexe-photo-placement/protected-front-local.json',null,()=>localSnapshot(true)],
 ['annexe-photo-placement/approved-shape.json',null,()=>localSnapshot()]
];
const report=[];
const reportURL=new URL('annexe-'+variant+'-snapshot-audit.json',import.meta.url);
const prior=existsSync(reportURL)?JSON.parse(readFileSync(reportURL)):null;
for(const [path,key,compute] of checks){
 const file=new URL('../../../Research/'+path,import.meta.url),saved=JSON.parse(readFileSync(file));
 annexe.updateMatrixWorld(true);const after=compute();restoreOld();
 annexe.updateMatrixWorld(true);const before=compute();restoreNew();
 const expected=key?saved[key]:Object.fromEntries(Object.keys(before).map(k=>[k,saved[k]]));
 const previous=prior?.report.find(r=>r.path===path&&r.key===key);
 if(previous)assert(JSON.stringify(expected)===JSON.stringify(previous.after)||JSON.stringify(expected)===JSON.stringify(after),'Snapshot has not changed outside the reviewed door correction: '+path);
 assert.deepEqual(before,previous?.before??expected,'Restoring only the two fire doors and two landing slabs reproduces '+path);
 const updated=key?{...saved,[key]:after}:{...saved,...after};
 report.push({path,key,before,after});
 if(process.argv.includes('--write'))writeFileSync(file,JSON.stringify(updated,null,2)+'\n');
}
writeFileSync(reportURL,JSON.stringify({changedDoors:2,changedLandings:2,oldCentre:3.6,newCentre:6.525,report},null,2)+'\n');
console.log('PASS: '+report.length+' annexe snapshots reproduce exactly when only the two reviewed doors and two landing slabs are restored.');
