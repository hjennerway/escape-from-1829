import assert from 'node:assert/strict';
import * as THREE from './dist/vendor/three.module.js';
import {createEscapeExterior} from './dist/escape-exterior.mjs';
import {createAerialLayouts} from './dist/aerial-layouts.mjs';
import {ESCAPE_WATER_TOWER} from './dist/water-tower.mjs';
import {ESTATE_CHIMNEY} from './dist/estate-chimney.mjs';
import {TOWER_RANGES,TOWER_ROOF_CONTACTS,TOWER_SERVICE_FRONT} from './dist/tower-buildings.mjs';
globalThis.document={createElement:()=>({getContext:()=>({fillRect(){},measureText:t=>({width:t.length*16}),strokeText(){},fillText(){}})})};
const exterior=createEscapeExterior(THREE,1.5),layouts=createAerialLayouts(THREE,exterior),group=layouts.towerBuildings;
exterior.model.updateMatrixWorld(true);
assert.equal(group.parent,layouts.historic);
const visible=o=>{for(;o;o=o.parent)if(!o.visible)return false;return true;};
for(const historic of [false,true])for(const modern of [false,true]){
 layouts.setVisible('historic',historic);layouts.setVisible('modern',modern);
 assert.equal(visible(group),historic,'All service buildings and ramp follow Historical');
}
layouts.setVisible('historic',true);layouts.setVisible('modern',false);
const ray=new THREE.Raycaster();
group.traverse(o=>{
 if(!o.isMesh)return;
 for(const attribute of Object.values(o.geometry.attributes))assert([...attribute.array].every(Number.isFinite),'No invalid geometry');
 if(o.name.endsWith('slate roof')){
  const n=o.geometry.attributes.normal;
  for(let i=0;i<n.count;i++)assert(n.getY(i)>0,'Every slate roof must face skywards: '+o.name);
 }
});
for(const o of group.userData.openings){
 const n=new THREE.Vector3(Math.sin(o.r),0,Math.cos(o.r));
 ray.set(new THREE.Vector3(o.x,o.y,o.z).addScaledVector(n,.7),n.negate());
 assert(ray.intersectObject(group,true)[0]?.object.isInstancedMesh,'Service opening must be exposed: '+o.label+' '+o.x+','+o.z);
}
const abutment=TOWER_RANGES.find(r=>r.name==='Tower east traced abutment');
assert.equal(abutment.rect[0],ESCAPE_WATER_TOWER.x+ESCAPE_WATER_TOWER.width/2,'Flat link must meet tower masonry');
assert.equal(abutment.roof,'traced');
function roofAt(x,z){ray.set(new THREE.Vector3(x,30,z),new THREE.Vector3(0,-1,0));return ray.intersectObject(group,true)[0];}
// Img1: leave the western third clear, put a level deck directly in front
// of each high arch, and restrict pitch contact to the eastern third.
for(const z of [-50.09,-60.31]){
 assert(!roofAt(145.5,z),'Corridor must start one third into the tower face');
 for(const x of [146.8,148,149.4]){
  const hit=roofAt(x,z);assert(hit?.object.name.endsWith('arch-front flat roof'));
  assert(Math.abs(hit.point.y-9)<1e-5,'The upper arch must have a flat deck in front');
 }
 const slope=roofAt(151.2,z);assert(slope?.object.name.endsWith('slate roof'));
 assert(slope.point.y>9&&slope.point.y<10.5,'Only the final third receives a shallow pitched connection');
 assert(roofAt(153,z).point.y<11.3,'Tower corner must not be covered by the old steep roof');
}
assert(Math.abs(roofAt(153.3,-55.2).point.y-9)<.4,'East upper arch also has a flat abutment');
// Check actual rendered intersections against each photo's complete blue
// profile, including the two inward slopes on the face away from Redesmere.
const contactPoint=(side,u)=>side===1?[148+u,-50.07]:side===3?[148-u,-60.33]:[153.13,-55.2-u];
for(const {side,profile} of TOWER_ROOF_CONTACTS.faces){
 for(let i=1;i<profile.length;i++)for(const t of [.02,.25,.5,.75,.98]){
  const [u0,y0]=profile[i-1],[u1,y1]=profile[i],u=u0+(u1-u0)*t;
  const p=contactPoint(side,u),hit=roofAt(...p);
  assert(hit,'Missing roof contact on tower face '+side);
  assert(Math.abs(hit.point.y-(y0+(y1-y0)*t))<.04,'Rendered roof must follow the traced line on face '+side+' at '+u+': '+hit.point.y+' / '+(y0+(y1-y0)*t)+' '+hit.object.name);
 }
}
// The two east corners must be continuous beyond the tower itself as well.
for(const x of [153.2,155,156,157.5])for(const z of [-60.3,-50.1]){
 assert(Math.abs(roofAt(x,z-.012).point.y-roofAt(x,z+.012).point.y)<.035,'Adjoining roof slopes must meet at one height around each corner '+x+','+z+' '+roofAt(x,z-.012).point.y+':'+roofAt(x,z-.012).object.name+' / '+roofAt(x,z+.012).point.y+':'+roofAt(x,z+.012).object.name);
}
const towerRay=new THREE.Raycaster();
for(const [x,z,n] of [[148,-48,[0,0,-1]],[148,-62,[0,0,1]],[155,-55.2,[-1,0,0]]]){
 towerRay.set(new THREE.Vector3(x,10.5,z),new THREE.Vector3(...n));
 assert.equal(towerRay.intersectObjects([group,exterior.waterTower],true)[0]?.object.name,'Large bricked upper opening','Pitched roofs must not hide the high arches');
}
ray.set(new THREE.Vector3(141.5,30,-55.2),new THREE.Vector3(0,-1,0));
assert.equal(ray.intersectObject(group,true).length,0,'Only the Redesmere/1829 tower face remains unobstructed');
const paired=group.userData.dormers.filter(d=>d.name.startsWith('East range'));
const single=group.userData.dormers.filter(d=>d.name.startsWith('Central hall'));
assert.equal(paired.length,2);assert.equal(single.length,1);
assert(paired.every(d=>d.axis==='x'),'Both east-range dormer ridges must run east/west');
assert.equal(single[0].axis,'z','Central dormer ridge must run north/south');
const hostRidgeBounds=new THREE.Box3().setFromObject(group.getObjectByName('Tower east dormered range ridge'));
const hostRidgeCentre=hostRidgeBounds.getCenter(new THREE.Vector3());
for(const d of paired){
 const ridgeBounds=new THREE.Box3().setFromObject(group.getObjectByName(d.name+' ridge'));
 const centre=ridgeBounds.getCenter(new THREE.Vector3());
 assert(Math.abs(centre.z-hostRidgeCentre.z)<1e-5,'Both protrusions must sit on the host ridge, not alongside it');
 assert(centre.x>hostRidgeBounds.min.x&&centre.x<hostRidgeBounds.max.x,'Protrusions must lie within the host ridge length');
 const glazing=group.userData.openings.find(o=>o.label===d.name+' glazing');
 assert(glazing.y-.5>hostRidgeBounds.max.y,'Ridge placement must keep the blue protrusion glazing above the slate');
}
const centralHall=TOWER_RANGES.find(r=>r.name==='Dormered central service hall');
assert.equal(single[0].x,191);assert.equal(single[0].z,(centralHall.rect[1]+centralHall.rect[3])/2,'Keep the single protrusion centred on the reshaped hall');
const centralWallBounds=new THREE.Box3().setFromObject(group.getObjectByName(centralHall.name+' walls'));
const adjacentBounds=new THREE.Box3().setFromObject(group.getObjectByName('Tower east dormered range walls'));
assert(Math.abs(centralWallBounds.min.z-adjacentBounds.min.z)<1e-5,'Both far edges must align with the green line');
assert.equal(centralHall.rect[3],-32,'Central hall must extend to the near edge of the blue footprint');
assert(centralWallBounds.max.z>ESTATE_CHIMNEY.z+ESTATE_CHIMNEY.baseRadius&&centralWallBounds.max.z<ESTATE_CHIMNEY.z+5,'The hall must finish just beyond the relocated chimney');
assert.deepEqual([exterior.estateChimney.position.x,exterior.estateChimney.position.z],[177.5,-35.5],'Chimney must occupy the new red-X position');
for(const x of [165,172,182])for(const z of [-78,-72,-66])assert(!roofAt(x,z),'The yellow-circled building and its details must be removed');
assert(!group.children.some(o=>o.name.startsWith('Northern boiler hall')));
ray.set(new THREE.Vector3(158,10,-66),new THREE.Vector3(-1,0,0));
assert.equal(ray.intersectObject(group,true)[0]?.object.name,'North tower range exposed return walls','Removing the hall must leave a closed corridor wall below the roof cut');
const eastRange=TOWER_RANGES.find(r=>r.name==='Tower east dormered range');
const centre=[(eastRange.rect[0]+eastRange.rect[2])/2,(eastRange.rect[1]+eastRange.rect[3])/2];
assert(Math.hypot(centre[0]-ESTATE_CHIMNEY.x,centre[1]-ESTATE_CHIMNEY.z)<Math.hypot((153.1+176)/2-ESTATE_CHIMNEY.x,-55.2-ESTATE_CHIMNEY.z),'East range remains nearer the relocated chimney');
const stores=TOWER_RANGES.find(r=>r.name==='Low west stores');
assert.equal(stores.axis,'z');assert.equal(stores.attach,'north');
const flatFront=TOWER_RANGES.find(r=>r.name==='West stores flat front');
assert.equal(flatFront.roof,'flat');assert.equal(stores.rect[3],flatFront.rect[1],'Rotated stores must join their flat front section');
// The marked yellow line is one shared front wall plane, including the
// unchanged blue-circled stores. Check the meshes, not only range metadata.
for(const name of ['West stores flat front','Chimney service hall','Ramp entrance link','South cross-gabled stores']){
 const bounds=new THREE.Box3().setFromObject(group.getObjectByName(name+' walls'));
 assert(Math.abs(bounds.max.z-TOWER_SERVICE_FRONT)<1e-5,'All four front walls must follow the yellow line: '+name);
}
for(const x of [187,191,194])for(const z of [-30,-25,-20]){
 const hit=roofAt(x,z);
 assert.equal(hit?.object.name,'Ramp entrance link flat roof','The flat entrance link must meet the newly extended hall');
 assert(Math.abs(hit.point.y-6.56)<1e-5,'The infill must continue the existing level roof');
}
for(const x of [187,194,200])for(const z of [-41,-37,-33])assert.equal(roofAt(x,z)?.object.name,'Dormered central service hall slate roof','The blue-footprint extension must have the hall roof');
const flatLink=TOWER_RANGES.find(r=>r.name==='Ramp entrance link');
assert.equal(flatLink.rect[1],centralHall.rect[3],'Entrance link must end at the new hall gable');
assert(!group.getObjectByName('Round boiler gable light'),'The purple central gable must have no circular window');
const roundWindow=group.getObjectByName('Chimney hall circular window');
assert(roundWindow,'The building pierced by the chimney must carry the circular window');
const chimneyHall=TOWER_RANGES.find(r=>r.name==='Chimney service hall');
assert(roundWindow.position.x>chimneyHall.rect[2],'Anticlockwise rotation moves the circular gable to the east end');
assert.equal(roundWindow.position.z,(chimneyHall.rect[1]+chimneyHall.rect[3])/2);
const windowNormal=new THREE.Vector3(0,0,1).applyQuaternion(roundWindow.quaternion);
assert(windowNormal.x>.999&&Math.abs(windowNormal.z)<1e-5,'The round glazing must face east after the quarter-turn');
const chimneyRidgeBounds=new THREE.Box3().setFromObject(group.getObjectByName('Chimney service hall ridge'));
const chimneyRidgeSize=chimneyRidgeBounds.getSize(new THREE.Vector3());
assert(chimneyRidgeSize.x>15&&chimneyRidgeSize.z<.3,'The chimney roof ridge now runs east/west');
assert.equal(roofAt(ESTATE_CHIMNEY.x,ESTATE_CHIMNEY.z)?.object.name,'Chimney service hall slate roof','The relocated chimney must pass through the pitched roof with the circular-window gable');
assert(!group.getObjectByName('Chimney service hall flat roof'),'The new pitch replaces the former flat front section');
for(const x of [162.7,167,174,184.8])for(const z of [-40,-34,-26,-17.1]){
 assert(['Chimney service hall slate roof','Dormered central service hall slate roof'].includes(roofAt(x,z)?.object.name),'The joined roof must cover the chimney hall: '+x+','+z);
}
ray.set(new THREE.Vector3(roundWindow.position.x+2,roundWindow.position.y+.2,roundWindow.position.z-.3),new THREE.Vector3(-1,0,0));
assert.equal(ray.intersectObject(group,true)[0]?.object,roundWindow,'The circular glazing must be exposed in front of its brick gable');
ray.set(new THREE.Vector3(191,10.1,-30),new THREE.Vector3(0,0,-1));
assert.equal(ray.intersectObject(group,true)[0]?.object.name,'Dormered central service hall brick gable','The purple area must retain plain brick');
assert(!group.getObjectByName('West stores circular window'),'No circular window on the tower-connected roof');
assert(!group.getObjectByName('Low west stores south brick gable'),'Restore the tower-connected hip in place of the mistaken gable');
assert(roofAt(151,-44).point.y<roofAt(155.5,-44).point.y,'The restored roof must fall west towards Redesmere');
assert(roofAt(156,-37).point.y<roofAt(156,-42).point.y,'The restored outer hip must slope down to the flat stores roof');
const rear=TOWER_RANGES.find(r=>r.name==='Rear hipped service building');
const rearRoof=group.getObjectByName(rear.name+' slate roof');
const rearBounds=new THREE.Box3().setFromObject(group.getObjectByName(rear.name+' walls'));
const centralBounds=new THREE.Box3().setFromObject(group.getObjectByName('Dormered central service hall walls'));
const eastBounds=new THREE.Box3().setFromObject(group.getObjectByName('Long east service range walls'));
assert(rearBounds.min.x-centralBounds.max.x>2&&eastBounds.min.z-rearBounds.max.z>3,'Keep short passages separating the small rear building');
const rearDormers=group.userData.dormers.filter(d=>d.name.startsWith('Rear building'));
assert.equal(rearDormers.length,1,'The small distant roof carries exactly one blue protrusion');
assert.equal(group.userData.dormers.length,4,'Two paired protrusions, one central and one on the separate rear roof');
const rearDormer=rearDormers[0];
ray.set(new THREE.Vector3(rearDormer.x,30,rearDormer.z),new THREE.Vector3(0,-1,0));
assert(ray.intersectObject(rearRoof).length,'The new blue protrusion must sit on the separate roof');
assert(roofAt(211.5,-73.8).point.y<roofAt(211.5,-70.8).point.y,'Rear roof must have a north hip');
assert(roofAt(211.5,-63).point.y<roofAt(211.5,-66.2).point.y,'Rear roof must have a south hip');
const ramp=group.getObjectByName('Sloping service ramp');
for(const x of [187,195,205,217]){
 ray.set(new THREE.Vector3(x,4,-14),new THREE.Vector3(0,-1,0));
 const hit=ray.intersectObject(ramp)[0];assert(hit,'Ramp must be a continuous upward-facing surface');
 assert(Math.abs(hit.point.y-(1.3+(x-185.9)/(219.4-185.9)*(.28-1.3)))<1e-5);
}
// The blue-circled block east of the service road remains an unmodelled outline.
ray.set(new THREE.Vector3(245,30,-40),new THREE.Vector3(0,-1,0));
assert.equal(ray.intersectObject(group,true).length,0);
ray.set(new THREE.Vector3(227,2,-10),new THREE.Vector3(0,-1,0));
assert.equal(ray.intersectObject(layouts.historicRoads,true)[0]?.object.userData.surface,'black road','Court entrance must not have a crossing kerb');
const eastEnd=exterior.mainAdmin.getObjectByName('Low east side room walls');
assert.equal(eastEnd.userData.collisionFootprint.length,6,'Admin east end has two angled corners');
console.log('PASS: Historical ownership, exposed service glazing, upward roofs, three tower abutments, three traced face profiles, continuous corner joins, flat arch junctions, shallow final-third pitches, ridge-aligned dormers, aligned front walls, green-edge alignment, blue-footprint extension, red-X chimney position, removed northern hall, joined entrance link, rotated full-span chimney roof and east gable window, restored tower hip, separate rear hipped building, continuous ramp and retained blue-block exclusion.');
