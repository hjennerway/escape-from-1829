import assert from 'node:assert/strict';
import * as THREE from './dist/vendor/three.module.js';
import {createEscapeExterior} from './dist/escape-exterior.mjs';
import {createAerialLayouts} from './dist/aerial-layouts.mjs';
import {ESCAPE_WATER_TOWER} from './dist/water-tower.mjs';
import {ESTATE_CHIMNEY} from './dist/estate-chimney.mjs';
import {HISTORIC_ROADS} from './dist/historic-roads.mjs';
import {TOWER_RANGES,TOWER_ROOF_CONTACTS,TOWER_SERVICE_FRONT,TOWER_ADMIN_SHIFT,TOWER_BUILDING_VIEWS,TOWER_WORKSHOP_COPY} from './dist/tower-buildings.mjs';
import {SERVICE_COURT_MOVES} from './dist/service-court-placement.mjs';
import {IRBY_CORRIDOR} from './dist/irby-corridor.mjs';
import {exteriorObstacles,obstacleContains,createWalker} from './dist/explore-controls.mjs';
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
const ray=new THREE.Raycaster(),purple=SERVICE_COURT_MOVES.purple,workshopMove=SERVICE_COURT_MOVES.workshops;
const purpleRoofAt=(x,z)=>roofAt(x+purple.x,z+purple.z);
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
function roofAt(x,z){ray.set(new THREE.Vector3(x,30,z),new THREE.Vector3(0,-1,0));return ray.intersectObject(group,true).find(hit=>hit.point.y>.5);}
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
// Latest yellow-to-blue ridge extension and green/red corner correction.
assert(!group.getObjectByName('Low west stores ridge'),'Remove the short perpendicular ridge in the green corner');
const extendedRidge=new THREE.Box3().setFromObject(group.getObjectByName('Tower east dormered range ridge'));
assert(Math.abs(extendedRidge.min.x-156)<1e-5,'Main ridge must reach the blue point beside the tower');
assert(Math.abs(extendedRidge.getCenter(new THREE.Vector3()).z+50.1)<1e-5,'Extended ridge must meet the tower-corner ridge junction');
for(const x of [157,160,168])for(const z of [-43,-45.5,-47]){
 const hit=roofAt(x,z),expected=9+(group.userData.towerJunction.peak-9)*(-40.5-z)/9.6;
 assert.equal(hit?.object.name,'Tower south continuous slate roof','The green area must be one continuous roof slope');
 assert(Math.abs(hit.point.y-expected)<1e-5,'No extra ridge or dip may cross the green slope');
}
for(const x of [150,155,161])for(const z of [-40,-38,-36.6]){
 const hit=roofAt(x,z);
 assert.equal(hit?.object.name,'Low west stores south flat return','The red area must be flat');
 assert(Math.abs(hit.point.y-9)<1e-5&&hit.face.normal.y>.999,'The red return must have a level roof surface');
}
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
for(const d of group.userData.dormers){
 const glazing=group.userData.openings.find(o=>o.label===d.name+' glazing');
 const normal=new THREE.Vector3(Math.sin(glazing.r),0,Math.cos(glazing.r)),ridgeAxis=d.axis==='x'?new THREE.Vector3(1,0,0):new THREE.Vector3(0,0,1);
 assert(Math.abs(normal.dot(ridgeAxis))<1e-5,'Blue protrusion glazing must face down the slope, not along the ridge');
 if(d.axis==='x')assert(glazing.z>d.z&&Math.abs(glazing.x-d.x)<1e-5,'Paired roof vents belong on the marked south cheeks');
 else assert(glazing.x>d.x&&Math.abs(glazing.z-d.z)<1e-5,'North/south roof vents belong on the east cheeks');
 const oldFront=new THREE.Vector3(d.x,glazing.y,d.z).addScaledVector(ridgeAxis,2.8);
 ray.set(oldFront,ridgeAxis.clone().negate());
 assert.equal(ray.intersectObject(group,true)[0]?.object.name,d.name+' walls','The former ridge-end glazing face must now be plain blue');
}
const centralHall=TOWER_RANGES.find(r=>r.name==='Dormered central service hall');
assert.equal(single[0].x,191+purple.x);assert(Math.abs(single[0].z-(centralHall.rect[1]+centralHall.rect[3])/2)<1e-8,'Keep the single protrusion centred on the reshaped hall');
const centralWallBounds=new THREE.Box3().setFromObject(group.getObjectByName(centralHall.name+' walls'));
const adjacentBounds=new THREE.Box3().setFromObject(group.getObjectByName('Tower east dormered range walls'));
assert(Math.abs(centralWallBounds.min.z-(-49+purple.z))<1e-5&&centralWallBounds.min.z>adjacentBounds.min.z+11,'The complete purple hall moves towards admin while its tower neighbour stays fixed');
assert.equal(centralHall.rect[3],-32+purple.z,'Central hall moves with the purple group');
assert(TOWER_ADMIN_SHIFT>HISTORIC_ROADS.find(r=>r.name==='Admin north service road').width,'User chose additional movement to clear the fixed chimney');
assert.deepEqual([exterior.estateChimney.position.x,exterior.estateChimney.position.z],[177.5,-35.5],'Chimney must stay fixed while the outlined buildings move');
for(const x of [165,172,182])for(const z of [-78,-72,-66]){
 const hit=roofAt(x,z);
 assert(!hit||hit.object.parent.name===TOWER_WORKSHOP_COPY.name,'Only the new yellow-footprint workshop may occupy the removed northern hall area');
}
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
 const shift=name==='West stores flat front'?0:TOWER_ADMIN_SHIFT+purple.z;
 assert(Math.abs(bounds.max.z-(TOWER_SERVICE_FRONT+shift))<1e-5,'Only the outlined front walls move towards admin: '+name);
}
for(const x of [187,191,194])for(const z of [-30,-25,-20]){
 const hit=purpleRoofAt(x,z+TOWER_ADMIN_SHIFT);
 assert.equal(hit?.object.name,'Ramp entrance link flat roof','The entrance roof must move with its building');
 assert(Math.abs(hit.point.y-6.56)<1e-5,'The infill must continue the existing level roof');
}
for(const x of [187,194,200])for(const z of [-41,-37,-33])assert.equal(purpleRoofAt(x,z)?.object.name,'Dormered central service hall slate roof','The blue-footprint extension must have the hall roof');
const flatLink=TOWER_RANGES.find(r=>r.name==='Ramp entrance link');
assert(Math.abs(flatLink.rect[1]-centralHall.rect[3]-TOWER_ADMIN_SHIFT)<1e-8,'The central hall and entrance link preserve their separation in the purple group');
assert(!group.getObjectByName('Round boiler gable light'),'The purple central gable must have no circular window');
const roundWindow=group.getObjectByName('Chimney hall circular window');
assert(roundWindow,'The translated hall keeps its circular window');
const chimneyHall=TOWER_RANGES.find(r=>r.name==='Chimney service hall');
assert(roundWindow.position.x>chimneyHall.rect[2],'Anticlockwise rotation moves the circular gable to the east end');
assert(Math.abs(roundWindow.position.z-(chimneyHall.rect[1]+chimneyHall.rect[3])/2)<1e-8);
const windowNormal=new THREE.Vector3(0,0,1).applyQuaternion(roundWindow.quaternion);
assert(windowNormal.x>.999&&Math.abs(windowNormal.z)<1e-5,'The round glazing must face east after the quarter-turn');
const chimneyRidgeBounds=new THREE.Box3().setFromObject(group.getObjectByName('Chimney service hall ridge'));
const chimneyRidgeSize=chimneyRidgeBounds.getSize(new THREE.Vector3());
assert(chimneyRidgeSize.x>15&&chimneyRidgeSize.z<.3,'The chimney roof ridge now runs east/west');
assert(!roofAt(ESTATE_CHIMNEY.x,ESTATE_CHIMNEY.z),'No building roof may cover the fixed chimney');
// Sample the actual foundation and tapered shaft, including every façade,
// plinth, roof and instanced detail, rather than testing only wall rectangles.
const clearanceRay=new THREE.Raycaster();
for(const y of [.1,.4,.79,.86,1,3,6.5,8,10,14,25,40]){
 const radius=y<.8?2.8-.05*y/.8:ESTATE_CHIMNEY.baseRadius+(ESTATE_CHIMNEY.topRadius-ESTATE_CHIMNEY.baseRadius)*(y-.8)/(ESTATE_CHIMNEY.height-2.4);
 clearanceRay.far=radius+.01;
 for(let i=0;i<128;i++){
  const angle=i*Math.PI/64;
  clearanceRay.set(new THREE.Vector3(ESTATE_CHIMNEY.x,y,ESTATE_CHIMNEY.z),new THREE.Vector3(Math.cos(angle),0,Math.sin(angle)));
  const hit=clearanceRay.intersectObject(group,true)[0];
  assert(!hit,'Chimney and foundation must clear all building geometry: '+hit?.object.name+' at height '+y+' angle '+angle);
 }
}
assert(!group.getObjectByName('Chimney service hall flat roof'),'The new pitch replaces the former flat front section');
for(const x of [162.7,167,174,184.8])for(const z of [-40,-34,-26,-17.1]){
 assert(['Chimney service hall slate roof','Dormered central service hall slate roof'].includes(purpleRoofAt(x,z+TOWER_ADMIN_SHIFT)?.object.name),'The translated roof must cover the chimney hall: '+x+','+z);
}
ray.set(new THREE.Vector3(roundWindow.position.x+2,roundWindow.position.y+.2,roundWindow.position.z-.3),new THREE.Vector3(-1,0,0));
assert.equal(ray.intersectObject(group,true)[0]?.object,roundWindow,'The circular glazing must be exposed in front of its brick gable');
ray.set(new THREE.Vector3(191+purple.x,10.1,-30+purple.z),new THREE.Vector3(0,0,-1));
assert.equal(ray.intersectObject(group,true)[0]?.object.name,'Dormered central service hall brick gable','The purple area must retain plain brick');
assert(!group.getObjectByName('West stores circular window'),'No circular window on the tower-connected roof');
assert(!group.getObjectByName('Low west stores south brick gable'),'Restore the tower-connected hip in place of the mistaken gable');
assert(roofAt(151,-44).point.y<roofAt(155.5,-44).point.y,'The restored roof must fall west towards Redesmere');
assert(roofAt(156,-37).point.y<roofAt(156,-42).point.y,'The continuous slope must end above the flat red return');
// towerbuildings2: equal adjoining workshops, moved along the blue arrow.
const workshops=TOWER_RANGES.filter(r=>r.name.startsWith('Rear ')&&r.roof==='gable');
assert.equal(workshops.length,2);
assert(!group.getObjectByName('Rear hipped service building walls'),'The original footprint must be vacated');
const workshopBounds=workshops.map(r=>new THREE.Box3().setFromObject(group.getObjectByName(r.name+' walls')));
assert.deepEqual(workshopBounds[0].getSize(new THREE.Vector3()).toArray(),workshopBounds[1].getSize(new THREE.Vector3()).toArray(),'Duplicate the complete building dimensions');
assert(Math.abs(workshopBounds[0].min.z-(IRBY_CORRIDOR.start[1]+IRBY_CORRIDOR.width/2))<1e-5,'The workshop backs extend to the new corridor');
assert(Math.abs(workshopBounds[0].min.x-workshopBounds[1].max.x)<1e-5,'The two photographed fronts must adjoin');
const rearDormers=group.userData.dormers.filter(d=>d.name.startsWith('Rear building'));
assert.equal(rearDormers.length,2,'Duplicate the selected roof protrusion with its building');
assert.equal(group.userData.dormers.length,6);
for(const [i,r] of workshops.entries()){
 const [x0,z0,x1,z1]=r.rect,cx=(x0+x1)/2,roofMesh=group.getObjectByName(r.name+' slate roof');
 const normals=roofMesh.geometry.attributes.normal;
 for(let j=0;j<normals.count;j++)assert(normals.getY(j)>0&&Math.abs(normals.getZ(j))<1e-6&&Math.abs(normals.getX(j))>.1,'Only east/west pitches may form each roof; no end hips');
 const ridge=new THREE.Box3().setFromObject(group.getObjectByName(r.name+' ridge'));
 assert(ridge.min.z<z0&&ridge.max.z>z1,'The ridge must reach both brick gable ends');
 for(const z of [z0+1,z1-1]){
  assert(roofAt(cx-5,z).point.y<roofAt(cx-2,z).point.y,'West pitch must fall towards the tower');
  assert(roofAt(cx+5,z).point.y<roofAt(cx+2,z).point.y,'East pitch must fall towards Estates');
 }
 const d=rearDormers[i];assert.equal(d.x,cx);assert.equal(d.z,-80.5+workshopMove.z,'Roof dormer position is retained while the back extends');
 assert.equal(group.userData.openings.filter(o=>o.label===r.name+' upper sash').length,3);
 assert(group.userData.openings.some(o=>o.label===r.name+' blue door'));
}
for(const segment of layouts.historicRoads.userData.missingFootprints.segments)for(const t of [.01,.5,.99]){
 const [a,b]=segment.points,x=a[0]+t*(b[0]-a[0]),z=a[1]+t*(b[1]-a[1]);
 assert(!(x>180.3&&x<222&&z>-73.5&&z<-49),'Old building outlines must not cross the photographed open yard');
}
const photo=TOWER_BUILDING_VIEWS['tower-twin-gables'];
assert(photo.position[0]>218.5+workshopMove.x&&photo.position[2]>-73.5+workshopMove.z&&photo.position[2]<-60.3+workshopMove.z,'The photo camera must clear the enlarged workshop and use the eastern court');
const obstacles=exteriorObstacles(THREE,exterior.model);
const copy=TOWER_WORKSHOP_COPY,copyWalls=new THREE.Box3().setFromObject(group.getObjectByName(copy.name+' walls'));
assert.deepEqual(copyWalls.getSize(new THREE.Vector3()).toArray().map(n=>+n.toFixed(5)),[21,6.4,16.4],'The wider workshop keeps its height and width, with its back extended to the corridor and the pharmacy approach open');
for(const [originalName,copiedName] of [[copy.source,copy.name],[copy.sourceDormer,copy.dormer]])for(const part of [' walls',' slate roof',' ridge']){
 const originalBounds=new THREE.Box3().setFromObject(group.getObjectByName(originalName+part));
 const copiedBounds=new THREE.Box3().setFromObject(group.getObjectByName(copiedName+part));
 assert(Math.abs(originalBounds.min.y-copiedBounds.min.y)<1e-5&&Math.abs(originalBounds.max.y-copiedBounds.max.y)<1e-5,'Copied walls, roof and dormer retain the original vertical extents: '+copiedName+part);
}
assert(Math.abs(copyWalls.max.x-workshopBounds[1].min.x)<1e-5&&Math.abs(copyWalls.min.z-workshopBounds[1].min.z)<1e-5,'The copy adjoins the selected west workshop and aligns with its rear edge');
assert(group.getObjectByName(copy.dormer+' walls'),'The copy retains its blue roof dormer');
assert.equal(group.userData.openings.filter(o=>o.label===copy.name+' upper sash').length,3,'The complete front glazing duplicates with the workshop');
assert(group.userData.openings.some(o=>o.label===copy.name+' blue door'));
assert(obstacles.some(b=>obstacleContains(b,180+workshopMove.x,-77+workshopMove.z)),'The enlarged workshop has solid walking collisions');
assert(!obstacles.some(b=>obstacleContains(b,photo.position[0],photo.position[2])),'Photo camera must be outside every building collision');
for(const r of workshops){
 const cx=(r.rect[0]+r.rect[2])/2,front=r.rect[3]+.24;
 for(const y of [1.8,6.7,r.height+r.rise+.14-.2]){
  // Aim at the rendered door/frame plane. At the new oblique angle, aiming
  // behind that surface shifts the hit sideways even when it is unobstructed.
  const target=new THREE.Vector3(cx,y,front+(y<3?.14:y<8?.205:0)),origin=new THREE.Vector3(...photo.position),direction=target.clone().sub(origin);
  ray.set(origin,direction.clone().normalize());ray.far=direction.length()+.4;
  const hit=ray.intersectObject(group,true)[0];
  assert(hit&&hit.point.distanceTo(target)<.5,'Both workshop doors, windows and peaks must be visible from the marked camera: '+r.name+' at y='+y+' hit '+hit?.object.name+' '+hit?.point.toArray());
 }
 const camera=new THREE.PerspectiveCamera();
 const walking=createWalker(camera,obstacles);
 walking.setView({position:photo.position,target:[cx,1.8,front]});walking.keys.add('KeyW');
 const steps=Math.ceil(Math.hypot(cx-photo.position[0],front-photo.position[2])/.5);
 for(let i=0;i<steps;i++)walking.update(.1);
 assert(Math.abs(camera.position.x-cx)<1&&camera.position.z>front&&camera.position.z<front+1.1,'Walk across the open court and stop at each workshop door');
 assert(obstacles.some(b=>obstacleContains(b,cx,(r.rect[1]+r.rect[3])/2)),'Both workshop interiors remain solid');
}
ray.far=Infinity;
for(const z of [-69,-65,-60,-55])assert(!roofAt(191,z)?.object.name.includes('central service hall'),'Retracted masonry and roof must leave the camera approach open');
const ramp=group.getObjectByName('Sloping service ramp');
const rampBounds=new THREE.Box3().setFromObject(ramp);
const adminRearBounds=new THREE.Box3().setFromObject(exterior.mainAdmin.getObjectByName('Rear flat court block walls'));
assert(rampBounds.max.z<adminRearBounds.min.z-.2,'The translated ramp must stop before Main/admin');
for(const x of [187,195,205,217]){
 ray.set(new THREE.Vector3(x+purple.x,4,-14+TOWER_ADMIN_SHIFT+purple.z),new THREE.Vector3(0,-1,0));
 const hit=ray.intersectObject(ramp)[0];assert(hit,'Ramp must be a continuous upward-facing surface');
 assert(Math.abs(hit.point.y-(1.3+(x-185.9)/(219.4-185.9)*(.28-1.3)))<1e-5);
}
// The blue-circled block east of the service road remains an unmodelled outline.
ray.set(new THREE.Vector3(245,30,-40),new THREE.Vector3(0,-1,0));
assert.equal(ray.intersectObject(group,true).length,0);
ray.set(new THREE.Vector3(227,2,-10),new THREE.Vector3(0,-1,0));
assert.equal(ray.intersectObject(layouts.historicRoads,true)[0]?.object.userData.surface,'black road','Court entrance must not have a crossing kerb');
const eastEnd=exterior.mainAdmin.getObjectByName('Low east side room walls');
assert(!eastEnd,'The blue-marked extra admin bay must be removed');
console.log('PASS: Historical ownership, exposed service glazing, upward roofs, three tower abutments, three traced face profiles, continuous corner joins, flat arch junctions, shallow final-third pitches, ridge-aligned dormers with downslope glazing, aligned front walls, retracted central-hall rear, retained front, marked-group translation with fixed chimney clearance, removed northern hall, translated entrance link and ramp, rotated full-span chimney roof and east gable window, extended tower ridge, single green-corner slope, flat red return, paired outward-moved gabled workshops, photo sightlines and walkable court, continuous ramp and retained blue-block exclusion.');
