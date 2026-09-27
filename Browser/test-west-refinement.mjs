import assert from 'node:assert/strict';
import * as THREE from './dist/vendor/three.module.js';
import {createEscapeExterior} from './dist/escape-exterior.mjs';
import {exteriorObstacles,obstacleContains} from './dist/explore-controls.mjs';
import {WEST_REFINEMENT_VIEWS} from './dist/west-refinement.mjs';
import {WEST_COURT_ALIGNMENT} from './dist/west-court-photo-detail.mjs';
import {WEST_FRONT_E_PLAN} from './dist/west-front-photo-detail.mjs';
import {LOCATION_VIEWS,LOCATION_WALKS} from './dist/location-views.mjs';
globalThis.document={createElement:()=>({width:0,height:0,getContext:()=>({fillRect(){}})})};
const {model}=createEscapeExterior(THREE,4/3);model.updateMatrixWorld(true);
const ray=new THREE.Raycaster();
const hit=(origin,direction)=>{ray.set(new THREE.Vector3(...origin),new THREE.Vector3(...direction));return ray.intersectObject(model,true)[0];};
// img3's blank upper wall must remain masonry; the photographed central
// glazing must be visible in front of the white base and shallow brick pier.
for(const o of model.userData.westEndPhotoOpenings){
  const first=hit([-73,o.y,o.z],[1,0,0]);
  assert(first.object.isInstancedMesh&&first.point.x<o.x,'end windows remain exposed');
}
for(const z of [4.5,15.5,18.5])for(const y of [6.3,11.8])
  assert.equal(hit([-73,y,z],[1,0,0]).object.name,'West end continuous wall','unfenestrated end stays brick');
assert(!model.userData.eastPhotoOpenings.some(o=>['west-outer-side','west-front-square-return'].includes(o.face)),'remove the superseded window grid');
for(const z of [4,8,12]){
  const top=hit([-70,30,z],[0,-1,0]);
  assert.equal(top.object.name,'West end continuous slate roof');
  assert(top.face.normal.y>0&&top.point.y>15.4,'one upward-facing hip covers the end');
}
for(const [name,face,bx,bz,side,depth] of [
  ['West curved bay','west-front-bay',WEST_FRONT_E_PLAN.bayX,WEST_FRONT_E_PLAN.bayRoot,1,2.8],
  ['West courtyard polygonal bay','west-court-bay',-58.4,WEST_COURT_ALIGNMENT.wallZ-.1,-1,3.35]
]){
  const openings=model.userData.eastPhotoOpenings.filter(o=>o.face===face);
  assert.equal(openings.length,9,'three glazed facets on three storeys');
  for(const o of openings){
    const normal=new THREE.Vector3(o.x<bx-1.6?-.84:o.x>bx+1.6?.84:0,0,side*(Math.abs(o.x-bx)>1.6?.54:1)).normalize();
    const origin=new THREE.Vector3(o.x,o.y,o.z).addScaledVector(normal,.65);
    ray.set(origin,normal.clone().negate());
    const first=ray.intersectObject(model,true)[0];
    assert(first.object.isInstancedMesh&&first.distance<.7,face+' glass lies outside the masonry');
  }
  const roof=hit([bx,30,bz+side*depth*.75],[0,-1,0]);
  assert.equal(roof.object.name,name+' slate roof');
  assert(roof.face.normal.y>0,'bay roof triangles face upwards');
  const flat=hit([bx+.5,9.3,bz+side*(depth+1)],[0,0,-side]);
  assert.equal(flat.object.name,name);
  assert(Math.abs(flat.point.z-(bz+side*depth))<.001,'the central bay face is flat');
}
for(const o of model.userData.westCourtPhotoOpenings.filter(o=>['west-court-recess','west-court-low-bay','west-court-outer'].includes(o.face))){
  const first=hit([o.x,o.y,-1],[0,0,1]);
  assert(first.object.isInstancedMesh&&Math.abs(first.point.z-o.z)<.25,'the low projection does not bury retained recess glazing');
}
const obstacles=exteriorObstacles(THREE,model),blocked=(x,z)=>obstacles.some(o=>obstacleContains(o,x,z));
for(const [key,view] of Object.entries(WEST_REFINEMENT_VIEWS)){
  assert.deepEqual(LOCATION_VIEWS[key],view);
  if(key==='west-refinement')continue;
  assert.deepEqual(LOCATION_WALKS[key],view);
  assert(!blocked(view.position[0],view.position[2]),key+' starts on accessible ground');
}
for(let x=-97;x<=-73;x+=.3)assert(!blocked(x,11.5),'the extended entrance path stays accessible to the road');
assert(!blocked(-74.05,6.65)&&!blocked(-74.05,16.65),'removed end hedges leave no walking collisions');
assert(blocked(WEST_FRONT_E_PLAN.bayX,21.5),'the moved garden bay blocks walking through its wall');
assert(!blocked(WEST_FRONT_E_PLAN.bayX-3,WEST_FRONT_E_PLAN.bayFront-.1),'the canted corner does not collide as its bounding rectangle');
// The owner's red E is on the front west garden: broad outer arm,
// shorter canted middle arm, and the retained long inner forward range.
const outerBounds=new THREE.Box3().setFromObject(model.getObjectByName('West front square pavilion'));
assert.equal(outerBounds.max.z,WEST_FRONT_E_PLAN.outerFront);
assert.equal(outerBounds.min.z,15.5,'the outer arm retains its rear connection');
assert.equal(outerBounds.min.x,-72,'the established outside wall stays fixed');
assert.equal(outerBounds.max.x,-64,'the yellow face narrows to eight units');
const {bayX,bayWidth,outerRight,innerX}=WEST_FRONT_E_PLAN;
const bayOutline=model.getObjectByName('West curved bay').userData.collisionFootprint;
assert.equal(bayOutline[3][0]-bayOutline[2][0],2.3,'the blue central face has the narrower photographic proportion');
const branchRoof=model.getObjectByName('West curved bay slate roof'),roofPoints=branchRoof.geometry.attributes.position;
for(let i=0;i<roofPoints.count;i++)if(roofPoints.getZ(i)===9.25){
  const point=new THREE.Vector3().fromBufferAttribute(roofPoints,i).applyMatrix4(branchRoof.matrixWorld);
  ray.set(new THREE.Vector3(point.x,30,point.z),new THREE.Vector3(0,-1,0));
  const covering=ray.intersectObjects(model.children.filter(o=>o!==branchRoof),true)[0];
  assert(covering.point.y>=point.y-.002,'the branch rear edge sits inside the retained roof, with no open seam');
}
const leftRecessWidth=bayX-bayWidth/2-outerRight,rightRecessWidth=innerX-bayX-bayWidth/2;
assert(Math.abs(leftRecessWidth-8.4)<1e-5&&Math.abs(rightRecessWidth-8.4)<1e-5,'the purple and green faces have matching broad recesses beside the blue bay');
for(const x of [-63,-61,-59.1]){
  assert(blocked(x,19),'masonry closes the widened recess back to the cross range');
  assert(hit([x,30,18.5],[0,-1,0]).point.y>14.3,'the widened recess has continuous roof coverage');
}
assert(WEST_FRONT_E_PLAN.bayFront<outerBounds.max.z&&outerBounds.max.z<43,'three unequal arm lengths follow the aerial reference');
for(const [x,z,name] of [[-70,25,'West front outer arm slate roof'],[-65.5,WEST_FRONT_E_PLAN.outerFront-.5,'West front outer arm slate roof'],[-65,21,'West front outer arm slate roof'],[bayX,20,'West curved bay slate roof'],[bayX,WEST_FRONT_E_PLAN.bayFront-.5,'West curved bay slate roof']]){
  const top=hit([x,30,z],[0,-1,0]);
  assert.equal(top.object.name,name,'continuous roof covers each extended arm');
  assert(top.face.normal.y>0&&top.point.y>15,'roof faces upward above the occupied floors');
  assert(blocked(x,z),'new masonry has walking collisions');
}
for(const [x,z] of [[-59.8,24],[-45.2,24],[-62.5,26],[-68,WEST_FRONT_E_PLAN.outerFront+1.5],[bayX,WEST_FRONT_E_PLAN.bayFront+1.5]]){
  assert(!blocked(x,z),'the recesses and garden beyond the arm ends remain walkable');
  assert(hit([x,30,z],[0,-1,0]).point.y<1,'roof outline leaves both E recesses open to the sky');
}
for(const o of model.userData.westFrontPhotoOpenings.filter(o=>o.face==='west-front-stair-inset')){
  const first=hit([o.x+.6,o.y,o.z],[-1,0,0]);
  assert(first.object.isInstancedMesh&&first.distance<.7,'the turned stair opening is exposed on the inner return');
}
assert.equal(model.userData.westFrontPhotoOpenings.filter(o=>o.face==='west-front-extension').length,8,'four paired lean-to windows');
// The user's red/yellow alignment is a physical wall plane, not only moved
// window decals. The garden elevation remains fixed at the opposite side.
const alignedBounds=new THREE.Box3().setFromObject(model.getObjectByName('West courtyard aligned range'));
const cornerBounds=new THREE.Box3().setFromObject(model.getObjectByName('West courtyard widened link'));
assert.equal(alignedBounds.min.z,cornerBounds.min.z,'yellow masonry aligns with the fixed red face');
assert.equal(alignedBounds.max.z,19.5,'retain the garden wall');
for(const x of [-44.4,-48,-53.6]){
  const wall=hit([x,9.1,-8],[0,0,1]);
  assert.equal(wall.object.name,'West courtyard aligned range');
  assert(Math.abs(wall.point.z-cornerBounds.min.z)<.001);
  assert(hit([x,30,-.5],[0,-1,0]).point.y>14.4,'the roof reaches the moved face');
}
const leanTo=model.getObjectByName('West courtyard glazed lean-to'),leanBounds=new THREE.Box3().setFromObject(leanTo);
assert.equal(leanBounds.max.z,cornerBounds.min.z,'lean-to stays attached to the red wall');
assert.equal(leanBounds.min.z,-4.5,'blue edge reaches the green guide from the fixed datum');
assert(Math.abs(leanBounds.min.x+43.8)<1e-5&&Math.abs(leanBounds.max.x+39)<1e-5,'the two sides follow the shifted red guides');
for(const z of [-4.1,-3,-1.4]){
  assert(blocked(-40,z),'the enlarged lean-to has solid walking collisions');
  const roof=hit([-40.5,10,z],[0,-1,0]);
  assert.equal(roof.object.name,'West courtyard extended glazed roof');
  assert(roof.face.normal.y>0,'the glazed roof faces upwards');
}
// The new gap remains open at walking and roof height, and the door is on
// the west side marked green instead of the courtyard-facing front panel.
for(const z of [-5,-4,-3,-2]){
  assert(!blocked(-38.1,z),'leave a walkable gap beside the yellow rear-arm wall');
  assert(hit([-38.1,10,z],[0,-1,0]).point.y<.5,'the lean-to roof does not bridge the gap');
}
const sideDoor=hit([-45.2,1.2,-2.75],[1,0,0]);
assert.equal(sideDoor.object.name,'West courtyard lean-to side door','blue door is exposed on the green side');
assert(sideDoor.face.normal.z>0,'the door local front faces outward after rotation');
assert.equal(hit([-40.1,1.2,-6],[0,0,1]).object.name,'West courtyard glazed lean-to','the former front entrance is continuous brick');
for(const z of [-5.4,-4,-2.75])assert(!blocked(-45.2,z),'the side door has a clear approach from the court');
const redWindow=model.userData.westCourtPhotoOpenings.find(o=>o.face==='west-court-inset');
assert(hit([redWindow.x,redWindow.y,-8],[0,0,1]).object.isInstancedMesh,'the fixed red window stays exposed');
assert(!model.userData.westCourtPhotoOpenings.some(o=>o.face==='west-court-inset-side'),'remove the now internal return windows');
console.log('PASS: west reference cameras, exposed glazing, flat and canted bays, continuous roof, blank end walls and walking access.');
