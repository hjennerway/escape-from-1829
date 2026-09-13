// Real Three.js geometry/camera checks, without a WebGL context.
import assert from 'node:assert/strict';
import * as THREE from './dist/vendor/three.module.js';
import {createEscapeExterior,ESCAPE_MAST,MAP_REAR_PROPORTIONS} from './dist/escape-exterior.mjs';
import {WEST_FRONT_FACADE_Z} from './dist/west-front-photo-detail.mjs';
import {INNER_COURT_SIDE_PROFILE} from './dist/inner-court-photo-detail.mjs';
import {sampleEscape} from './dist/escape-cutscene.mjs';
import {sampleArrival} from './dist/arrival-cutscene.mjs';
import {ESCAPE_WATER_TOWER} from './dist/water-tower.mjs';
globalThis.document={createElement:()=>({width:0,height:0,getContext:()=>({fillRect(){}})})};
const exterior=createEscapeExterior(THREE,16/9);
exterior.scene.updateMatrixWorld(true);
const towerBounds=new THREE.Box3().setFromObject(exterior.waterTower);
assert(Math.abs(towerBounds.max.y-17.75*2.2)<.01,'tower including finial must be 2.2 times the main pediment height');
assert(towerBounds.min.x>106&&towerBounds.max.z<-84,'tower must occupy the clearing beyond the rear-right campus block');
assert(exterior.mast.children.length>150,'mast must contain real lattice geometry');
const dragons=exterior.model.getObjectByName('Blue dragons and central coat of arms');
assert.equal(dragons.geometry.attributes.uv.count,3,'heraldic photo must map onto the triangular pediment');
const originalBay=exterior.model.getObjectByName('East curved bay');
const squareBay=exterior.model.getObjectByName('East square projecting bay');
assert(originalBay&&squareBay,'right frontage must retain the original curved bay and add a square projection');
assert.equal(exterior.model.getObjectByName('East curved bay duplicate'),undefined,'the added round bay must be removed');
const bayBounds=new THREE.Box3().setFromObject(squareBay),baySize=bayBounds.getSize(new THREE.Vector3());
assert.equal(squareBay.geometry.type,'BoxGeometry','replacement has flat walls and square corners');
assert.equal(baySize.x,baySize.z,'replacement footprint is square');
assert(bayBounds.max.z>24&&bayBounds.max.y>=14.3,'square bay projects outward at full three-storey height');
assert(bayBounds.min.x>originalBay.position.x+3.15&&bayBounds.max.x<72.65,'projection occupies the blue-marked section left of the removed round bay');
for(const aspect of [16/9,4/3,9/16])for(const seconds of [0,1,1.75,2.5]){
  const shot=sampleArrival(seconds,{aspect}),camera=exterior.camera;
  camera.aspect=aspect;camera.updateProjectionMatrix();camera.position.set(...shot.position);camera.lookAt(...shot.target);camera.updateMatrixWorld(true);
  const door=new THREE.Vector3(0,3.5,19.9).project(camera);
  assert(Math.abs(door.x)<1e-10&&Math.abs(door.y)<1e-10,'front door stays centred throughout the rush');
  if(seconds===0)for(const x of [-72,97])for(const z of [-46,45]){
    const p=new THREE.Vector3(x,15,z).project(camera);
    assert(Math.abs(p.x)<.95&&Math.abs(p.y)<.95,'arrival initially frames the whole building');
  }
}
const ray=new THREE.Raycaster(new THREE.Vector3(20,80,12),new THREE.Vector3(0,-1,0));
const roof=ray.intersectObject(exterior.model,true)[0];
assert(roof&&roof.point.y>12,'principal range must have a visible roof from above');
assert(roof.face.normal.y>0,'roof triangles must face the aerial camera');
// The east court routes outside its garden; the mirrored west projection and
// stairs leave a continuous route nearer the central arm.
for(const x of [-11,9])for(const z of [-17,-26,-30,-34,-40]){
  // Pass outside the relocated central stair before turning beside the garden.
  ray.set(new THREE.Vector3(x===9&&z<=-34?11:x,80,z),new THREE.Vector3(0,-1,0));
  assert(ray.intersectObject(exterior.model,true)[0].point.y<1,'both W-shaped gaps must open through to the rear road');
}
// The corrected east wing and L-shaped addition must have continuous roofs,
// while the parking court inside the addition remains uncovered.
for(const [x,z] of [[31,-20],[42,40],[53.1,12],[72.65,8],[89.2,-25],[89.2,0],[83.7,-38],[83.7,-44],[91.2,12]]){
  ray.set(new THREE.Vector3(x,80,z),new THREE.Vector3(0,-1,0));
  assert(ray.intersectObject(exterior.model,true)[0].point.y>8,'corrected east footprint must contain roof geometry');
}
// Photo 20260912_172141: the service link has a low roof, with the taller
// range set behind it. Check the actual geometry as well as the sash schedule.
ray.set(new THREE.Vector3(76,80,16),new THREE.Vector3(0,-1,0));
const linkRoof=ray.intersectObject(exterior.model,true)[0].point.y;
assert(linkRoof>4.5&&linkRoof<8,'link roof must sit below the square pavilion first-floor heads');
const photoOpenings=exterior.model.userData.eastPhotoOpenings;
const frontWindows=photoOpenings.filter(o=>o.face==='square-front');
assert.equal(frontWindows.length,6,'square front has exactly two windows on each of three storeys');
for(const y of [2,6.5,11])assert.equal(frontWindows.filter(o=>o.y===y).length,2);
const wingWindows=photoOpenings.filter(o=>o.face==='forward-wing-east');
assert.equal(wingWindows.length,16,'nine wing positions on each floor include one door instead of a sash');
assert(!wingWindows.some(o=>o.z===38.1),'upper stair and ground door must not have superimposed windows');
assert.equal(photoOpenings.filter(o=>o.face==='polygonal-bay').length,9,'three visible facets carry windows on all three floors');
ray.set(new THREE.Vector3(63.65,2,30),new THREE.Vector3(0,0,-1));
assert(ray.intersectObject(exterior.model,true)[0].object.isInstancedMesh,'ground-floor sash must be visible in front of the white wall');
// img2.jpg observes the opposite side: a real projecting polygonal bay and
// two close pairs plus one sash on every floor of the courtyard wall.
const courtBay=exterior.model.getObjectByName('East courtyard polygonal bay');
assert(courtBay,'rear courtyard must have its own projecting bay');
assert(new THREE.Box3().setFromObject(courtBay).min.z<0,'courtyard bay must project beyond the rear wall');
const paired=exterior.model.userData.courtyardPhotoOpenings.filter(o=>o.face==='courtyard-paired-wall');
assert.equal(paired.length,15,'courtyard paired wall has five sashes on each of three floors');
for(const y of [2,6.5,11]){
  const xs=paired.filter(o=>o.y===y).map(o=>o.x).sort((a,b)=>a-b);
  assert.equal(xs.length,5);
  assert(Math.abs(xs[2]-xs[1]-1.5)<.01&&Math.abs(xs[4]-xs[3]-1.5)<.01,'windows must form two close pairs');
  for(const x of xs){
    ray.set(new THREE.Vector3(x,y,-5),new THREE.Vector3(0,0,1));
    const visible=ray.intersectObject(exterior.model,true)[0];
    assert(visible.point.z>4&&visible.point.z<4.5,'each paired sash must remain exposed, not buried in the projecting bay');
  }
}
assert(exterior.model.getObjectByName('East courtyard two-flight fire escape').children.length>12,'courtyard stair must have structural flights and rails');
// img8.jpg: explicit windows replace the generic rear-return grid. Verify
// the five upper openings remain visible and the stair door has no sash on it.
const rearOpenings=exterior.model.userData.rearCourtPhotoOpenings;
const rearUpper=rearOpenings.filter(o=>o.face==='rear-return-upper');
assert.equal(rearUpper.length,5,'rear return has five upper sashes plus its stair door');
assert(!rearUpper.some(o=>Math.abs(o.x-66.4)<.1),'upper door must not be overlaid by a window');
for(const o of rearUpper){
  ray.set(new THREE.Vector3(o.x,o.y,-27),new THREE.Vector3(0,0,-1));
  const hit=ray.intersectObject(exterior.model,true)[0];
  assert(hit.point.z<-32.6&&hit.point.z>-33,'each upper return sash must be exposed in front of the rear wall');
}
assert.equal(exterior.model.children.filter(o=>o.name==='Rear court blue gabled porch').length,2,'both blue entrance porches must be present');
assert.equal(exterior.model.children.filter(o=>o.name==='Rear court tall chimney').length,2,'the east wing has two tall chimney stacks');
const rightGround=rearOpenings.filter(o=>o.face==='rear-court-wing-ground');
assert(!rightGround.some(o=>o.z===-4.8),'right porch must replace the ground-floor sash');
for(const x of [42,49,55]){
  ray.set(new THREE.Vector3(x,80,-38),new THREE.Vector3(0,-1,0));
  assert(ray.intersectObject(exterior.model,true)[0].point.y<1,'wider return must leave the rear approach open');
}
// A roof-free route enters from the rear-left and turns into the side court.
for(const [x,z] of [[27,-39],[33,-39],[40,-39],[40,-34],[40,-30],[46,-29]]){
  ray.set(new THREE.Vector3(x,80,z),new THREE.Vector3(0,-1,0));
  assert(ray.intersectObject(exterior.model,true)[0].point.y<1,'rear-left courtyard entrance must remain open');
}
for(const z of [-23,-12,-4]){
  ray.set(new THREE.Vector3(48,80,z),new THREE.Vector3(0,-1,0));
  assert(ray.intersectObject(exterior.model,true)[0].point.y<1,'east extension must preserve its open-air side court');
}
for(const aspect of [16/9,4/3,9/16])for(const seconds of [0,5,10]){
  const shot=sampleEscape(seconds,{aspect}),camera=exterior.camera;camera.aspect=aspect;camera.updateProjectionMatrix();camera.position.set(...shot.position);camera.lookAt(...shot.target);camera.updateMatrixWorld(true);
  const tip=new THREE.Vector3(ESCAPE_MAST.x,ESCAPE_MAST.height,ESCAPE_MAST.z).project(camera);
  assert(tip.x<0&&tip.y>0,'mast must read as upper-left from the aerial perspective');
  assert(Math.abs(tip.x)<.95&&Math.abs(tip.y)<.95,'mast must stay in frame');
  for(const y of [0,ESCAPE_WATER_TOWER.height]){
    const p=new THREE.Vector3(ESCAPE_WATER_TOWER.x,y,ESCAPE_WATER_TOWER.z).project(camera);
    assert(p.x>0&&Math.abs(p.x)<.95&&Math.abs(p.y)<.95,'water tower must stay visible on the right throughout the pan');
  }
  for(const x of [-72,97])for(const z of [-46,45]){
    const p=new THREE.Vector3(x,15,z).project(camera);
    assert(Math.abs(p.x)<.95&&Math.abs(p.y)<.95,'building must stay in frame throughout the pan');
  }
}
// The eastern stair section retains its established ridge height.
for(const x of [31]){
  const topAt=z=>{
    ray.set(new THREE.Vector3(x,80,z),new THREE.Vector3(0,-1,0));
    return ray.intersectObject(exterior.model,true)[0];
  };
  const main=topAt(-10),end=topAt(-27.5),slope=topAt(-29.8);
  assert(Math.abs(end.point.y/main.point.y-2/3)<.001,'rear end ridge must be two-thirds of the adjoining wing ridge');
  assert(slope.point.y<end.point.y-.5,'roof must visibly fall from ridge to rear eaves');
  assert(slope.face.normal.y>0&&slope.face.normal.y<.99,'rear roof must have upward-facing pitched surfaces');
}
// img3: basement glazing must remain exposed and the new garden must not
// obstruct the continuous route from the rear road into the inner court.
assert(exterior.model.getObjectByName('Inner court projecting brick block'));
for(const o of exterior.model.userData.innerCourtPhotoOpenings.filter(o=>o.face==='inner-block-north'||o.face==='inner-block-basement')){
  ray.set(new THREE.Vector3(o.x,o.y,-37),new THREE.Vector3(0,0,1));
  const hit=ray.intersectObject(exterior.model,true)[0];
  assert(hit.point.z<-35.5&&hit.point.z>-36,'north sashes must sit in front of the brick facade');
}
assert(exterior.model.getObjectByName('Inner court iron stairs').children.length>=15);
const stairSection=new THREE.Box3().setFromObject(exterior.model.getObjectByName('Inner court projecting brick block'));
assert.equal(stairSection.min.z,INNER_COURT_SIDE_PROFILE.join,'tall stair wall must vacate the former rear position');
assert.equal(stairSection.max.z,INNER_COURT_SIDE_PROFILE.front,'moved stair section replaces the former blank stretch');
const annexRoof=exterior.model.getObjectByName('Inner court rear annex sloped roof');
const annexHeights=[];
for(const z of [-35,-31.2]){
  ray.set(new THREE.Vector3(31,80,z),new THREE.Vector3(0,-1,0));
  const hit=ray.intersectObject(exterior.model,true)[0];
  assert.equal(hit.object,annexRoof,'old stair position must expose the lower annex roof');
  const normal=hit.face.normal.clone().transformDirection(hit.object.matrixWorld);
  assert(normal.y>.9&&normal.y<.99,'annex roof must have a real pitch');
  annexHeights.push(hit.point.y);
}
assert(annexHeights[1]-annexHeights[0]>.7&&annexHeights[1]<8,'low roof rises towards the moved stair section');
for(const o of exterior.model.userData.innerCourtPhotoOpenings.filter(o=>['inner-block-west','inner-annex-west'].includes(o.face))){
  ray.set(new THREE.Vector3(23.7,o.y,o.z),new THREE.Vector3(1,0,0));
  const hit=ray.intersectObject(exterior.model,true)[0];
  assert(hit.object.isInstancedMesh&&hit.point.x>24.1&&hit.point.x<24.45,'windows on both the moved section and low annex remain exposed');
}
ray.set(new THREE.Vector3(23.7,6.7,-31),new THREE.Vector3(1,0,0));
assert(ray.intersectObject(exterior.model,true)[0].object.name==='Inner court sloping annex walls','sloping roof must have outward-facing brick infill beneath it');
// img14: a tall, narrow enclosure projects into the inner east court while
// the preceding lowered rear end, glazing and walkable passage are retained.
const innerProjection=new THREE.Box3().setFromObject(exterior.model.getObjectByName('Inner east tall rectangular projection'));
assert(innerProjection.min.x<19&&Math.abs(innerProjection.max.x-25)<.001&&innerProjection.max.y>14,'enclosure must project from the wing at full height');
assert(exterior.model.getObjectByName('Inner east stepped return'));
// img15/img16: a reflected copy of the east inner details, with independently
// observed outer windows and a glazed rear gallery below a single-pitch roof.
const westProjection=new THREE.Box3().setFromObject(exterior.model.getObjectByName('West mirrored Inner east tall rectangular projection'));
assert(Math.abs(westProjection.min.x+innerProjection.max.x)<.001&&Math.abs(westProjection.max.x+innerProjection.min.x)<.001,'west projection must reflect across Reception at x=0');
assert.equal(westProjection.min.z,innerProjection.min.z);
assert.equal(westProjection.max.y,innerProjection.max.y);
const westOpenings=exterior.model.userData.westWingPhotoOpenings;
assert.equal(westOpenings.filter(o=>o.face==='west-wing-outer').length,24,'eight aligned bays across basement and two upper floors');
assert(!photoOpenings.some(o=>o.face==='west-long-wing'),'superseded west windows must not overlap the replacement');
for(const o of westOpenings.filter(o=>o.face==='west-wing-outer'&&(o.y>2||o.z<-3))){
  ray.set(new THREE.Vector3(-45,o.y,o.z),new THREE.Vector3(1,0,0));
  const hit=ray.intersectObject(exterior.model,true)[0];
  assert(hit.object.isInstancedMesh&&Math.abs(hit.point.x-o.x)<.2,'outer sashes must remain exposed on the stepped wall');
}
const westGallery=westOpenings.filter(o=>o.face==='west-wing-gallery');
assert.equal(westGallery.filter(o=>o.z<-35).length,3,'rear gallery has three broad glazed bays');
assert.equal(westGallery.filter(o=>o.x<-37).length,1,'gallery glazing wraps onto the outer side');
for(const o of westGallery.filter(o=>o.z<-35)){
  ray.set(new THREE.Vector3(o.x,o.y,-40),new THREE.Vector3(0,0,1));
  assert(ray.intersectObject(exterior.model,true)[0].point.z<-35.7,'gallery glass must sit in front of its cream frame');
}
const westRoof=exterior.model.getObjectByName('West mirrored Inner court rear annex sloped roof');
const westRoofHeights=[];
for(const z of [-35,-31.2]){
  ray.set(new THREE.Vector3(-31.13,80,z),new THREE.Vector3(0,-1,0));
  const hit=ray.intersectObject(exterior.model,true)[0];
  assert.equal(hit.object,westRoof,'rear annex must expose the reflected sloped roof');
  assert(hit.face.normal.clone().transformDirection(hit.object.matrixWorld).y>.8,'reflected roof must face upward');
  westRoofHeights.push(hit.point.y);
}
assert(westRoofHeights[1]-westRoofHeights[0]>1.3,'gallery roof must rise towards the taller wing');
const innerEastOpenings=exterior.model.userData.innerEastPhotoOpenings;
assert.equal(innerEastOpenings.filter(o=>o.face==='inner-east-projection-front').length,3,'plain enclosure front has one opening on each floor');
for(const o of innerEastOpenings){
  const sideReturn=['inner-east-projection-return','inner-east-stepped-return'].includes(o.face);
  ray.set(new THREE.Vector3(sideReturn?o.x:o.x-1,o.y,sideReturn?o.z-1:o.z),new THREE.Vector3(sideReturn?0:1,0,sideReturn?1:0));
  const hit=ray.intersectObject(exterior.model,true)[0];
  assert(hit.object.isInstancedMesh&&hit.point.distanceTo(new THREE.Vector3(o.x,o.y,o.z))<.3,'new glazing must be exposed on its own wall, not hidden in the original facade');
}
for(const bottom of [2.4,5.9]){
  ray.set(new THREE.Vector3(23.5,bottom+1.4,-29.8+INNER_COURT_SIDE_PROFILE.stairShift),new THREE.Vector3(1,0,0));
  const hit=ray.intersectObject(exterior.model,true)[0];
  assert(hit.object.isInstancedMesh&&hit.point.x>24&&hit.point.x<24.42,'both aligned stair doors remain visible above their landings');
}
// img6: the west courtyard bay projects into the court and the paired
// openings remain visible rather than buried behind the corner link or bay.
const westBay=exterior.model.getObjectByName('West courtyard polygonal bay');
assert(westBay&&new THREE.Box3().setFromObject(westBay).min.z<1.2);
const westSashes=exterior.model.userData.westCourtPhotoOpenings.filter(o=>o.face==='west-court-paired');
assert.equal(westSashes.length,14,'five sashes per upper floor and four beside the ground door');
for(const o of westSashes){
  ray.set(new THREE.Vector3(o.x,o.y,-2),new THREE.Vector3(0,0,1));
  const hit=ray.intersectObject(exterior.model,true)[0];
  assert(hit.point.z>4.1&&hit.point.z<4.5,'west paired windows must remain exposed');
}
assert(exterior.model.getObjectByName('West courtyard glazed lean-to'));
// The annotated corner link is doubled in width and the outside end has
// independent recessed and projecting sections, not a narrow flat wall.
const westLinkBounds=new THREE.Box3().setFromObject(exterior.model.getObjectByName('West courtyard widened link'));
assert(Math.abs(westLinkBounds.max.x-westLinkBounds.min.x-7.2)<.001);
const recessedBounds=new THREE.Box3().setFromObject(exterior.model.getObjectByName('West courtyard recessed end'));
const cornerBounds=new THREE.Box3().setFromObject(exterior.model.getObjectByName('West courtyard projecting corner'));
assert(recessedBounds.max.x-recessedBounds.min.x>=7&&cornerBounds.max.x-cornerBounds.min.x>=6);
assert(cornerBounds.min.z<recessedBounds.min.z-1.9,'outer corner must project from the recessed wall');
for(const o of exterior.model.userData.westCourtPhotoOpenings.filter(o=>['west-court-recess','west-court-outer'].includes(o.face))){
  ray.set(new THREE.Vector3(o.x,o.y,-2),new THREE.Vector3(0,0,1));
  const hit=ray.intersectObject(exterior.model,true)[0];
  assert(Math.abs(hit.point.z-o.z)<.3,'reworked end windows must remain visible on their own wall planes');
}
// img9: exposed square-front and low-extension glazing, plus real iron
// stair structure and chimney stacks. The original west front bay is retained.
const westFront=exterior.model.userData.westFrontPhotoOpenings;
assert.equal(westFront.filter(o=>o.face==='west-front-square').length,6);
assert.equal(exterior.model.children.filter(o=>o.name==='West curved bay').length,1);
assert.equal(exterior.model.children.filter(o=>o.name==='West front chimney').length,2);
assert(exterior.model.getObjectByName('West front iron return stair').children.length>=12);
for(const o of westFront.filter(o=>o.face==='west-front-square')){
  ray.set(new THREE.Vector3(o.x,o.y,27),new THREE.Vector3(0,0,-1));
  const hit=ray.intersectObject(exterior.model,true)[0];
  assert(hit.object.isInstancedMesh&&hit.point.z>WEST_FRONT_FACADE_Z&&hit.point.z<20,'front glazing must be exposed on the aligned facade');
}
const westSquareBounds=new THREE.Box3().setFromObject(exterior.model.getObjectByName('West front square pavilion'));
assert.equal(westSquareBounds.max.z,WEST_FRONT_FACADE_Z);
const flanking=westFront.filter(o=>o.face==='west-front-bay-flank');
assert.equal(flanking.length,6,'a sash on both sides of the curved bay on all three floors');
for(const o of flanking){
  ray.set(new THREE.Vector3(o.x,o.y,24),new THREE.Vector3(0,0,-1));
  const hit=ray.intersectObject(exterior.model,true)[0];
  assert(hit.object.isInstancedMesh&&hit.point.z>19.5&&hit.point.z<20,'bay flanking glazing must remain exposed beside the bay and forward range');
}
ray.set(new THREE.Vector3(-54.5,12.7,30),new THREE.Vector3(0,0,-1));
assert(Math.abs(ray.intersectObject(exterior.model,true)[0].point.z-WEST_FRONT_FACADE_Z)<.01,'stair wall must sit flush with the pavilion');
assert(new THREE.Box3().setFromObject(exterior.model.getObjectByName('West front iron return stair')).max.z<23,'retained iron stairs move back with the doors');
// Check actual roof edges against the relative lengths in the yellow marks.
const {wingRear,centralRear,courtyardRear}=MAP_REAR_PROPORTIONS;
assert(centralRear<wingRear&&centralRear>courtyardRear,'centre must end between the two wing ends and east courtyard return');
assert.equal(wingRear-centralRear,4,'centre extends only a short distance beyond the side wings');
ray.set(new THREE.Vector3(0,80,6),new THREE.Vector3(0,-1,0));
assert(ray.intersectObject(exterior.model,true)[0].point.y>8,'shortened two-storey centre must remain connected to the principal range');
for(const [x,end] of [[0,centralRear],[-31,wingRear],[31,wingRear]]){
  ray.set(new THREE.Vector3(x,80,end+.5),new THREE.Vector3(0,-1,0));
  assert(ray.intersectObject(exterior.model,true)[0].point.y>(Math.abs(x)===31?5.8:8),'each marked section must reach its mapped rear extent, including the lowered east annex');
  ray.set(new THREE.Vector3(x,80,end-1),new THREE.Vector3(0,-1,0));
  assert(ray.intersectObject(exterior.model,true)[0].point.y<1,'rear ends must stop at their mapped extent');
}
for(const [x,z] of [[-10,-46],[10,-46],[0,-46],[0,-55]]){
  ray.set(new THREE.Vector3(x,80,z),new THREE.Vector3(0,-1,0));
  assert(ray.intersectObject(exterior.model,true)[0].point.y<1,'cross-drive is clear behind the shortened centre');
}
const centralWindows=exterior.model.userData.centralCourtPhotoOpenings;
assert.equal(centralWindows.filter(o=>o.face==='central-court-upper').length,7,'img11 long elevation has seven upper windows');
assert.equal(centralWindows.filter(o=>o.face==='central-court-rear-upper').length,3,'raised rear section has three upper windows beside the door');
for(const o of centralWindows.filter(o=>!['central-court-west','central-court-rear-end'].includes(o.face))){
  ray.set(new THREE.Vector3(o.x+.6,o.y,o.z),new THREE.Vector3(-1,0,0));
  const hit=ray.intersectObject(exterior.model,true)[0];
  assert(hit.object.isInstancedMesh&&hit.point.x>o.x&&hit.point.x<o.x+.3,'central range windows must stand outside their wall faces');
}
const centralBody=new THREE.Box3().setFromObject(exterior.model.getObjectByName('Central court two-storey range'));
const centralRearBody=new THREE.Box3().setFromObject(exterior.model.getObjectByName('Central court raised rear section'));
assert(centralBody.max.y<9&&centralRearBody.max.y>9&&centralRearBody.max.y<10,'photo elevation has two occupied storeys and a modest rear height step');
assert(centralRearBody.max.x>centralBody.max.x&&centralRearBody.max.x-centralBody.max.x<1.5,'rear section projects only slightly into the court');
for(const o of westFront.filter(o=>o.face==='west-front-extension')){
  ray.set(new THREE.Vector3(-46,o.y,o.z),new THREE.Vector3(1,0,0));
  const hit=ray.intersectObject(exterior.model,true)[0];
  assert(hit.point.x<-45.4&&hit.point.x>-45.8,'low extension must have exposed wide glazing');
}
delete globalThis.document;
console.log('PASS: real estate geometry, upward-facing roofs, W-shaped openings to the rear, rear-left lattice mast, building/mast framing throughout landscape and portrait pans.');
