import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync,writeFileSync} from 'node:fs';
import * as THREE from './dist/vendor/three.module.js';
import {createEscapeExterior} from './dist/escape-exterior.mjs';
import {createAerialLayouts} from './dist/aerial-layouts.mjs';
import {ANNEXE,ANNEXE_SITE,ANNEXE_VIEWS,ANNEXE_MAP_SCALE,annexePoint} from './dist/annexe.mjs';
import {exteriorObstacles,obstacleContains,createWalker} from './dist/explore-controls.mjs';
globalThis.document={createElement:()=>({getContext:()=>({fillRect(){},clearRect(){},strokeText(){},fillText(){},measureText(t){return {width:t.length*16}}})})};
const e=createEscapeExterior(THREE,16/9),detail=e.annexe.userData.oakmereWestElevation;
e.scene.updateMatrixWorld(true);
// Freeze the original annexe outside the red-circled low connector, including
// the green-circled towers, mirrored details and separately edited spine.
const records=[],instance=new THREE.Matrix4(),world=new THREE.Matrix4();
// Compare building primitives in the preceding annexe root frame so an
// authorized whole-building transform does not masquerade as a local edit.
// The gameplay drives are independently world-fixed and stay in world space.

const previousRoot=new THREE.Matrix4().compose(
 new THREE.Vector3(ANNEXE_SITE.x,0,ANNEXE_SITE.z),
 new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0),ANNEXE.rotation),
 new THREE.Vector3(ANNEXE_SITE.scale,1,ANNEXE_SITE.scale)
);
e.annexe.traverse(o=>{
 if(!o.isMesh||o.name.startsWith('Rear service court link'))return;
 for(let p=o;p;p=p.parent)if(p===detail)return;
 const hash=createHash('sha256');
 for(const [key,a] of Object.entries(o.geometry.attributes).sort()){hash.update(key);hash.update(Buffer.from(a.array.buffer,a.array.byteOffset,a.array.byteLength));}
 if(o.geometry.index)hash.update(Buffer.from(o.geometry.index.array.buffer));
 const geometry=hash.digest('hex'),materials=[o.material].flat().map(m=>[m.type,m.color?.getHex(),m.roughness,m.metalness,m.side]);
 const local=o.matrix.clone();
 for(let p=o.parent;p&&p!==e.annexe;p=p.parent)local.premultiply(p.matrix);
 const reference=new THREE.Matrix4().multiplyMatrices(previousRoot,local);
 const record=(m,comparison)=>{
  if(o.isInstancedMesh){
   const p=e.annexe.worldToLocal(new THREE.Vector3().setFromMatrixPosition(m));
   // Include the surrounding sash frames exposed by shortening this link.
   if(p.x>-26*ANNEXE_MAP_SCALE-1.75&&p.x<-14*ANNEXE_MAP_SCALE+1.75&&p.z>-49*ANNEXE_MAP_SCALE-1.75&&p.z<-42*ANNEXE_MAP_SCALE+1.75&&p.y<6.7)return;
  }
  if(o.name==='Annexe drive')comparison=m;
  records.push(JSON.stringify([geometry,materials,comparison.elements.map(n=>+n.toFixed(8)),o.castShadow,o.receiveShadow,!!o.userData.orientedCollision]));
 };
 if(o.isInstancedMesh)for(let i=0;i<o.count;i++){o.getMatrixAt(i,instance);record(world.multiplyMatrices(o.matrixWorld,instance),new THREE.Matrix4().multiplyMatrices(reference,instance));}else record(o.matrixWorld,reference);
});
const fingerprint={primitives:records.length,sha256:createHash('sha256').update(records.sort().join('\n')).digest('hex')};
const baseline=new URL('../Research/oakmere/west-protected-geometry.json',import.meta.url);
if(process.argv.includes('--save-baseline')){
 assert(!detail,'Baseline must load the saved pre-edit annexe module');
 writeFileSync(baseline,JSON.stringify(fingerprint,null,2)+'\n');
 console.log('Saved protected pre-edit annexe:',fingerprint);
}else{
 assert.deepEqual(fingerprint,JSON.parse(readFileSync(baseline)),'Annexe primitives outside the red-circled low connector must remain unchanged');
 assert.equal(detail.userData.hostRange,'Rear court west range','New detail belongs to the red-circled face');
 assert.equal(detail.userData.openings.filter(o=>o.blind).length,0,'The two marked upper openings now use glazed sashes');
 const ray=new THREE.Raycaster(),outward=new THREE.Vector3(0,0,1).transformDirection(detail.matrixWorld);
 for(const o of detail.userData.openings){
  // Start beyond the adjoining connector, not inside a potentially enclosing
  // wall: a ray beginning just outside the glass can miss buried windows.
  ray.set(detail.localToWorld(new THREE.Vector3(o.x,o.y+.22,o.z+20)),outward.clone().negate());
  const hit=ray.intersectObject(e.annexe,true)[0];
  assert(hit?.object.parent===detail&&hit.object.isInstancedMesh,'New opening is exposed: '+JSON.stringify(o));
 }
 const host=e.annexe.userData.ranges.find(b=>b.name==='Rear court west range'),link=e.annexe.userData.ranges.find(b=>b.name==='Rear service court link');
 assert(!link,'Later green-circle correction removes the complete low connector');
 detail.traverse(o=>{if(!o.name.endsWith('slate roof'))return;const n=o.geometry.attributes.normal;for(let i=0;i<n.count;i++)assert(n.getY(i)>0,o.name+' faces upward');});
 const obstacles=exteriorObstacles(THREE,e.model),view=ANNEXE_VIEWS['oakmere-photo'];
 assert(!obstacles.some(o=>obstacleContains(o,view.position[0],view.position[2])),'Blue camera position is on open lawn');
 const walker=createWalker(e.camera,obstacles);walker.setView(view);const start=e.camera.position.clone();walker.keys.add('KeyW');walker.update(.1);assert(e.camera.position.distanceTo(start)>.45);
 const p=detail.localToWorld(new THREE.Vector3(0,1.8,3)),t=detail.localToWorld(new THREE.Vector3(0,1.8,0));
 walker.setView({position:p.toArray(),target:t.toArray()});for(let i=0;i<15;i++)walker.update(.1);
 assert(detail.worldToLocal(e.camera.position.clone()).z>1,'New facade blocks walking');
 const court=annexePoint(-1.62,40,-55.1);ray.set(new THREE.Vector3(...court),new THREE.Vector3(0,-1,0));
 assert(!ray.intersectObject(e.annexe,true).some(h=>h.object.name.endsWith('slate roof')),'Rear court remains open');
 const layouts=createAerialLayouts(THREE,e);
 for(const historic of [false,true]){layouts.setVisible('historic',historic);let visible=true;for(let o=detail;o;o=o.parent)visible&&=o.visible;assert.equal(visible,historic);}
 console.log('PASS: Oakmere west photo face, glazing, roofs, open court, walking and visibility; '+fingerprint.primitives+' original primitives unchanged.');
}
