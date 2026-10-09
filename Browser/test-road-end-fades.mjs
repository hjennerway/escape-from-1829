import assert from 'node:assert/strict';
import * as THREE from './dist/vendor/three.module.js';
import {createModernRoads} from './dist/modern-roads.mjs';
import {GRASS_ROAD_ENDS,prepareRoadEnds,createRoadEndFades} from './dist/road-end-fades.mjs';
import {HISTORIC_ROADS} from './dist/historic-road-layout.mjs';
import {assertRoadEndSurface} from './test-support/road-end-assertions.mjs';
import {exteriorObstacles} from './dist/explore-controls.mjs';
import {ROAD_STYLE} from './dist/road-style.mjs';
import {createRoadRibbonGeometry} from './dist/road-ribbon.mjs';
import {closeGroundEdges} from './dist/ground-contact.mjs';
import {assertRoadEndJoins} from './test-support/road-end-assertions.mjs';
globalThis.document={createElement:()=>({getContext:()=>({fillRect(){},measureText:t=>({width:t.length*16}),strokeText(){},fillText(){}})})};
const roads=createModernRoads(THREE);
let fades=0;
for(const [name,ends] of Object.entries(GRASS_ROAD_ENDS)){
 const owner=roads.getObjectByName(name);
 const historic=HISTORIC_ROADS.find(r=>r.name===name);
 const group=owner?.getObjectByName(name+' gravel ends')??createRoadEndFades(THREE,name,historic.width,prepareRoadEnds(name,historic.points));
 assert.equal(group.children.length,ends.length*4,'Each open end has gravel, wearing asphalt and two solid kerb tapers');
 group.traverse(o=>{if(o.userData.roadEndFade){assertRoadEndSurface(o);fades++;}});
 assert.deepEqual(exteriorObstacles(THREE,group),[],'Road transitions must not introduce walking barriers');
}
// Compare an unchanged T-junction and both ends of a connected through-road.
for(const name of ['Warren Lane','Ross Avenue','Upton Grange (Part 2)']){
 const road=roads.getObjectByName(name);
 assert(!road.getObjectByName(name+' gravel ends'),'Connected roads retain their mouths');
 road.updateMatrixWorld(true);
 const points=road.userData.centerline,ray=new THREE.Raycaster();
 for(const end of [0,points.length-1]){
  const p=points[end],q=points[end===0?1:end-1],len=Math.hypot(q[0]-p[0],q[1]-p[1]);
  for(const across of [-2.95,0,2.95]){
   ray.set(new THREE.Vector3(p[0]-(q[1]-p[1])/len*across,2,p[1]+(q[0]-p[0])/len*across),new THREE.Vector3(0,-1,0));
   assert(ray.intersectObject(road.children[1],true).length,'Full-width connected mouth remains paved: '+name);
  }
 }
}
const church=roads.getObjectByName('Parsons Lane'),p=church.userData.centerline.at(-1);
const ray=new THREE.Raycaster(new THREE.Vector3(p[0]+1,2,p[1]),new THREE.Vector3(0,-1,0));
church.updateMatrixWorld(true);
assert(!ray.intersectObjects(church.children.slice(0,2),true).length,'The former rounded asphalt/kerb cap is absent');
assert(ray.intersectObject(church.getObjectByName('Parsons Lane gravel ends'),true).some(h=>h.object.userData.roadEndFade?.kind==='gravel'),'The old cap position now has gravel');
const tail=roads.getObjectByName('Parsons Lane northern modern endpoint');
assert(tail.userData.modernOnly&&tail.getObjectByName(tail.name+' gravel ends'),'A modern tail owns its transition so it hides with the tail');
closeGroundEdges(THREE,roads);
assertRoadEndJoins(THREE,[roads]);
// Protect both seam directions on a bent road, and prove the join probe rejects
// the original full-width vertical face rather than merely accepting no sides.
const points=[[0,0],[0,25],[2,35],[2,60]],ends=prepareRoadEnds('Lockwood View',points),fixture=new THREE.Group();
for(const [width,y,color] of [[7.2,.32,ROAD_STYLE.edge],[6,ROAD_STYLE.asphaltY,ROAD_STYLE.asphalt]]){
 fixture.add(new THREE.Mesh(createRoadRibbonGeometry(THREE,ends.points,width,y,ends),new THREE.MeshStandardMaterial({color})));
}
const transition=createRoadEndFades(THREE,'Lockwood View',6,ends);fixture.add(transition);closeGroundEdges(THREE,fixture);
assertRoadEndJoins(THREE,[fixture]);
const solidKerb=transition.children.find(m=>m.userData.roadEndFade.kind==='edge');
const ghostKerb=solidKerb.clone();ghostKerb.material=solidKerb.material.clone();ghostKerb.material.transparent=true;ghostKerb.material.depthWrite=false;
assert.throws(()=>assertRoadEndSurface(ghostKerb),/Kerbs remain solid/,'Reject the original transparent stone treatment');
for(const fade of transition.children.filter(m=>m.userData.roadEndFade.kind==='asphalt')){
 const gravel=transition.getObjectByName(fade.name.replace('asphalt fade','gravel fade'));
 const p=fade.geometry.attributes.position,q=gravel.geometry.attributes.position;
 for(let i=0;i<p.count;i++)assert(p.getX(i)===q.getX(i)&&p.getY(i)===q.getY(i)&&p.getZ(i)===q.getZ(i),'Asphalt and gravel use identical sloping triangles');
}
const wall=new THREE.Mesh(new THREE.PlaneGeometry(7.2,.49),new THREE.MeshBasicMaterial({side:THREE.DoubleSide}));
wall.position.set(0,.075,7);wall.userData.groundContact=true;fixture.add(wall);
assert.throws(()=>assertRoadEndJoins(THREE,[fixture]),/No vertical road\/kerb face/,'Detect the original cross-road retaining face');
console.log(`PASS: ${fades/4} grass-facing ends blend road into lawn beside opaque, buried kerb tapers, with open junctions and unobstructed walking.`);
