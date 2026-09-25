import {WEST_FORWARD_END_PHOTO_VIEW} from './dist/west-forward-end-photo-detail.mjs';
import {exteriorObstacles,obstacleContains} from './dist/explore-controls.mjs';
import {CENTRAL_BACK_VIEWS} from './dist/central-back.mjs';
// Real Three.js geometry/camera checks, without a WebGL context.
import assert from 'node:assert/strict';
import * as THREE from './dist/vendor/three.module.js';
import {createEscapeExterior,ESCAPE_MAST,MAP_REAR_PROPORTIONS} from './dist/escape-exterior.mjs';
import {WEST_FRONT_FACADE_Z} from './dist/west-front-photo-detail.mjs';
import {INNER_COURT_SIDE_PROFILE} from './dist/inner-court-photo-detail.mjs';
import {sampleEscape} from './dist/escape-cutscene.mjs';
import {sampleArrival} from './dist/arrival-cutscene.mjs';
import {REDESMERE_PHOTO_VIEW} from './dist/redesmere-photo-detail.mjs';
import {ESCAPE_WATER_TOWER} from './dist/water-tower.mjs';
globalThis.document={createElement:()=>({width:0,height:0,getContext:()=>({fillRect(){}})})};
const exterior=createEscapeExterior(THREE,16/9);
exterior.scene.updateMatrixWorld(true);
const towerBounds=new THREE.Box3().setFromObject(exterior.waterTower);
assert(Math.abs(towerBounds.max.y-17.75*2.2)<.01,'tower including finial must be 2.2 times the main pediment height');
assert(towerBounds.min.x>136&&towerBounds.max.z<-45,'tower must stand outside the right campus block at the map-corrected rear depth');
assert(exterior.mast.children.length>150,'mast must contain real lattice geometry');
const dragons=exterior.model.getObjectByName('Blue dragons and central coat of arms');
// Rear-corner refinement: test the visible planes and the actual collision
// outline, plus the fixed front apex and the formerly transparent gable.
{
  const roof=exterior.model.getObjectByName('Reception longitudinal ridge and rear hips');
  const gable=exterior.model.getObjectByName('Reception solid pediment backing');
  const gableBounds=new THREE.Box3().setFromObject(gable);
  assert(Math.abs(gableBounds.max.y-17.75)<1e-5,'front apex height is unchanged');
  assert(gableBounds.max.z-gableBounds.min.z>.13,'pediment has solid depth');
  // Photo-matched stacks flank the entrance, with long square-ended sides
  // behind the heraldry. The roof-contact audit samples their whole bases.
  for(const side of ['west','east']){
    const stack=exterior.model.getObjectByName('Reception '+side+' chimney stack');
    const cap=exterior.model.getObjectByName('Reception '+side+' chimney cap');
    assert(stack&&cap,'both marked entrance roof junctions have capped chimneys');
    assert.equal(stack.geometry.type,'BoxGeometry','chimney faces and ends are square');
    const b=new THREE.Box3().setFromObject(stack),c=new THREE.Box3().setFromObject(cap);
    const size=b.getSize(new THREE.Vector3());
    assert(size.z>size.x*5&&size.y>2.5,'front stacks have the photographed long, narrow proportions');
    assert(b.min.z>10.4&&b.max.z<19.56,'stacks stay on the central roof behind the pediment');
    assert(c.max.y<gableBounds.max.y&&c.max.y>16.8,'caps rise above the side roofs below the apex');
    assert.equal(stack.material,gable.material,'stacks reuse the entrance brickwork');
    assert(stack.castShadow&&cap.castShadow,'chimneys cast shadows over the roof');
  }
  const r=new THREE.Raycaster();
  for(const x of [-3,0,3]){
    r.set(new THREE.Vector3(x,15.8,19),new THREE.Vector3(0,0,1));
    assert.equal(r.intersectObject(exterior.model,true)[0]?.object,gable,'the rear of the apex must be opaque');
  }
  for(const x of [-6,-3,0,3,6])for(const z of [11,13.2,16,19.4]){
    r.set(new THREE.Vector3(x,25,z),new THREE.Vector3(0,-1,0));
    const hit=r.intersectObject(exterior.model,true)[0];
    assert.equal(hit.object,roof,'all three roof planes meet without holes or overlaps');
    assert(hit.face.normal.y>0&&hit.point.y<=17.75,'slate faces upward below the existing front apex');
    if(x===0&&z>=13.2)assert(Math.abs(hit.point.y-(17.55+(z-13.2)*.2/6.36))<1e-5,'ridge runs from the rear hip junction to the front apex');
  }
  for(const o of exterior.model.userData.centralBackOpenings.filter(o=>o.face.endsWith('cant'))){
    for(const u of [-.26,.26])for(const v of [-.27,.27]){
      r.set(new THREE.Vector3(o.x+Math.cos(o.rotation)*o.w*u+o.nx*.4,o.y+o.h*v,o.z-Math.sin(o.rotation)*o.w*u+o.nz*.4),new THREE.Vector3(-o.nx,0,-o.nz));
      assert.equal(r.intersectObject(exterior.model,true)[0]?.object.material.color.getHex(),0x78989f,'all bevel panes are exposed ahead of the actual walls');
    }
  }
  const obstacles=exteriorObstacles(THREE,exterior.model);
  for(const side of [-1,1]){
    assert(!obstacles.some(o=>obstacleContains(o,side*8.1,5.6,0)),'the outside of the bevel is open');
    assert(obstacles.some(o=>obstacleContains(o,side*7.7,6,0)),'the inside of the bevel is solid');
  }
  const [x,,z]=CENTRAL_BACK_VIEWS['central-back-photo'].position;
  assert(!obstacles.some(o=>obstacleContains(o,x,z)),'the marked photo view starts in open court');
}
assert.equal(dragons.geometry.attributes.uv.count,3,'heraldic photo must map onto the triangular pediment');
const originalBay=exterior.model.getObjectByName('East curved bay');
const squareBay=exterior.model.getObjectByName('East garden pavilion');
assert(originalBay&&squareBay,'right frontage must retain the original curved bay and add a square projection');
assert.equal(exterior.model.getObjectByName('East curved bay duplicate'),undefined,'the added round bay must be removed');
// The marked east frontage bay shares the west half-octagonal plan, with
// physical brick courses, aligned roof/bands and a solid white ground floor.
{
  const base=exterior.model.getObjectByName('East curved bay white base');
  const west=exterior.model.getObjectByName('West curved bay');
  const normalize=points=>{
    const w=Math.max(...points.map(p=>p[0]))-Math.min(...points.map(p=>p[0]));
    const d=Math.max(...points.map(p=>p[1]));
    return points.map(([x,z])=>[x/w,z/d]);
  };
  assert.deepEqual(normalize(base.userData.collisionFootprint),normalize(west.userData.collisionFootprint),'east and west bays have the same half-octagonal proportions');
  const r=new THREE.Raycaster(),hit=(x,y,z,dx=0,dz=-1)=>{
    r.set(new THREE.Vector3(x,y,z),new THREE.Vector3(dx,0,dz).normalize());
    return r.intersectObject(exterior.model,true)[0];
  };
  const eastLow=hit(53.1,12.7,25),eastHigh=hit(53.1,13.1,25);
  const wallLow=hit(48,12.7,25),wallHigh=hit(48,13.1,25);
  assert.equal(eastLow.object,originalBay);
  assert.equal(eastLow.object.material,wallLow.object.material,'bay reuses the adjoining masonry material');
  assert(Math.abs((eastHigh.uv.y-eastLow.uv.y)-(wallHigh.uv.y-wallLow.uv.y))<1e-6,'bay brick courses match the adjoining wall scale');
  assert(Math.abs((hit(53.5,12.7,25).uv.x-eastLow.uv.x)-(hit(48.4,12.7,25).uv.x-wallLow.uv.x))<1e-6,'front brick lengths match the adjoining wall scale');
  assert.equal(hit(53.1,3.5,25).object,base,'white ground floor follows the bay');
  assert.equal(hit(52.3,13,25).point.z,hit(53.9,13,25).point.z,'the bay has one broad flat front');
  for(const o of exterior.model.userData.eastPhotoOpenings.filter(o=>o.face==='polygonal-bay')){
    const normal=new THREE.Vector3(Math.sign(o.x-53.1)*2.016,0,Math.abs(o.x-53.1)<.1?1:1.275).normalize();
    const tangent=new THREE.Vector3(normal.z,0,-normal.x);
    for(const offset of [-.3,0,.3]){
      const p=new THREE.Vector3(o.x,o.y+o.h/12,o.z).addScaledVector(tangent,offset*o.w).addScaledVector(normal,.5);
      r.set(p,normal.clone().negate());
      assert.equal(r.intersectObject(exterior.model,true)[0].object.material.color.getHex(),0x78989f,'all three window faces remain exposed on all floors');
    }
  }
  for(const [x,z] of [[51.1,20.8],[53.1,22],[55.1,20.8]]){
    r.set(new THREE.Vector3(x,30,z),new THREE.Vector3(0,-1,0));
    const roof=r.intersectObject(exterior.model,true)[0];
    assert.equal(roof.object.name,'East curved bay slate roof');
    assert(roof.face.normal.y>0,'half-octagonal roof covers every face');
  }
  const obstacles=exteriorObstacles(THREE,exterior.model),blocked=(x,z)=>obstacles.some(o=>obstacleContains(o,x,z,.05));
  assert(blocked(53.1,22.1)&&blocked(51.3,21.1),'front and cheek masonry block walking');
  assert(!blocked(50.6,22.1)&&!blocked(55.6,22.1),'canted corners leave their actual outside space clear');
}
const bayBounds=new THREE.Box3().setFromObject(squareBay),baySize=bayBounds.getSize(new THREE.Vector3());
assert.equal(squareBay.geometry.type,'BoxGeometry','replacement has flat walls and square corners');
assert.equal(baySize.x,8.5,'south frontage retains its width');
assert(Math.abs(baySize.z-17.7)<1e-5,'pavilion retains its square front and steps back at the courtyard recess');
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

// The marked rear-arm joins are solid and meet the main ridge without a gap
// or a height step. Sample the completed model, including intersecting roofs.
for(const side of [-1,1]){
  const join=exterior.model.getObjectByName((side<0?'West':'East')+' wing connecting walls');
  const bounds=new THREE.Box3().setFromObject(join);
  assert(bounds.min.z<=5&&bounds.max.z>=7,'connecting walls close the former separation');
  const ridgeHeights=[];
  for(const z of [-24.5,-20,-10,-6,-2,2,4,5,5.5,6,6.5,7,9,11.9,12,12.01]){
    ray.set(new THREE.Vector3(side*31,30,z),new THREE.Vector3(0,-1,0));
    const hit=ray.intersectObject(exterior.model,true)[0];
    assert(hit.object.material.map&&hit.face.normal.clone().transformDirection(hit.object.matrixWorld).y>0,'junction exposes upward-facing slate');
    ridgeHeights.push(hit.point.y);
  }
  assert(Math.max(...ridgeHeights)-Math.min(...ridgeHeights)<.02,'entire rear wing ridge stays level into the connecting roof');
  assert(Math.abs(ridgeHeights[0]-15.66)<1e-5,'rear ridges are lowered to the connecting roof height');
  ray.set(new THREE.Vector3(side*22,30,12),new THREE.Vector3(0,-1,0));
  assert(Math.abs(ray.intersectObject(exterior.model,true)[0].point.y-ridgeHeights[0])<1e-5,'connecting and main ridges have the same height');
  for(const dx of [-5,-3,0,3,5])for(const z of [5.25,6,6.75]){
    ray.set(new THREE.Vector3(side*31+dx,30,z),new THREE.Vector3(0,-1,0));
    assert(ray.intersectObject(exterior.model,true)[0].point.y>13,'slate covers the entire former roof gap');
  }
}
// Previously generic windows on both marked front sections now expose the
// same three-light sash glazing and fine frame material as the photo windows.
for(const [x,y,face] of [[-35.6,10.6,'1829-range-sash'],[43.05,11,'pavilion-flush']]){
  const o=exterior.model.userData.eastPhotoOpenings.find(o=>o.face===face&&Math.abs(o.x-x)<.01&&Math.abs(o.y-y)<.01&&o.z>17);
  assert(o,'remaining front opening uses the shared sash schedule');
  for(const [offset,color] of [[0,0x78989f],[-o.w/6,0xd3dcd8],[o.w/6,0xd3dcd8]]){
    ray.set(new THREE.Vector3(o.x+offset,o.y+o.h/12,22),new THREE.Vector3(0,0,-1));
    const hit=ray.intersectObject(exterior.model,true)[0];
    assert(hit.point.z>o.z&&hit.point.z<o.z+.25,'updated sash is exposed on its wall');
    assert.equal(hit.object.material.color.getHex(),color,'three-light panes and frame finish match the shared style');
  }
}

// img18: windows must remain exposed in front of the actual whole model,
// and the bay's separate roof must face upward beside the original roof.
const lawnOpenings=exterior.model.userData.westLawnPhotoOpenings;
for(const o of lawnOpenings){
  ray.set(new THREE.Vector3(-24,o.y,o.z),new THREE.Vector3(-1,0,0));
  const hit=ray.intersectObject(exterior.model,true)[0];
  assert(hit.object.isInstancedMesh&&hit.point.x>o.x,'img18 glazing must be exposed, not hidden inside the wing or projecting bay');
}
ray.set(new THREE.Vector3(-27.5,30,35.5),new THREE.Vector3(0,-1,0));
const lawnRoof=ray.intersectObject(exterior.model,true)[0];
assert.equal(lawnRoof.object.name,'West lawn bay slate roof');
assert(lawnRoof.face.normal.y>0,'img18 bay roof must face upward');
const lawnBayBounds=new THREE.Box3().setFromObject(exterior.model.getObjectByName('West lawn three-window bay'));
assert(lawnBayBounds.max.x>-28&&Math.abs(lawnBayBounds.min.y)<1e-6,'img18 bay must project from the wall with a solid foundation');
// Both inward elevations are exact reflections across the entrance centre.
for(const [west,east] of [[exterior.model.userData.westLawnPhotoOpenings,exterior.model.userData.eastLawnPhotoOpenings],[exterior.model.userData.entranceWestPhotoOpenings.filter(o=>o.face!=='reception-front-sash'),exterior.model.userData.entranceEastPhotoOpenings]]){
  assert.deepEqual(east,west.map(o=>({...o,x:-o.x,face:o.face.replaceAll('west','east')})),'east opening schedules must reflect the west without duplicating Reception');
}
for(const west of exterior.model.userData.westLawnPhotoOpenings){
  const hits=[];
  for(const side of [-1,1]){
    ray.set(new THREE.Vector3(side*24,west.y,west.z),new THREE.Vector3(side,0,0));
    const hit=ray.intersectObject(exterior.model,true)[0];
    assert(hit.object.isInstancedMesh,'both inward elevations must expose their sash frames');
    hits.push(hit.point.x);
  }
  assert(Math.abs(hits[0]+hits[1])<1e-5,'reflected glazing must occupy matching actual wall planes');
}
for(const o of exterior.model.userData.entranceEastPhotoOpenings.filter(o=>['entrance-east-recess','entrance-east-projection','entrance-east-lower'].includes(o.face))){
  ray.set(new THREE.Vector3(o.x,o.y,22),new THREE.Vector3(0,0,-1));
  const hit=ray.intersectObject(exterior.model,true)[0];
  assert(hit.object.isInstancedMesh&&hit.point.z>o.z,'east frontage glazing must remain visible ahead of the old principal block');
}
for(const [westName,eastName] of [['West lawn three-window bay','East lawn three-window bay'],['Entrance west three-bay projection','Entrance east three-bay projection']]){
  const west=new THREE.Box3().setFromObject(exterior.model.getObjectByName(westName));
  const east=new THREE.Box3().setFromObject(exterior.model.getObjectByName(eastName));
  assert(Math.abs(west.min.x+east.max.x)<1e-5&&Math.abs(west.max.x+east.min.x)<1e-5);
  assert(Math.abs(west.max.y-east.max.y)<1e-5&&Math.abs(west.max.z-east.max.z)<1e-5);
}
for(const [x,z] of [[27.5,35.5],[30,35],[33,24],[16,12]]){
  const heights=[];
  for(const side of [-1,1]){
    ray.set(new THREE.Vector3(side*x,30,z),new THREE.Vector3(0,-1,0));
    const hit=ray.intersectObject(exterior.model,true)[0];
    assert(hit.face.normal.y>0,'reflected roofs must remain outward-facing');
    heights.push(hit.point.y);
  }
  assert(Math.abs(heights[0]-heights[1])<1e-5,'inner roof pitches must match across the entrance');
}
assert.equal(exterior.model.children.filter(o=>o.name==='East front chimney').length,2);
// img19: a real stepped frontage, exposed windows, a low roof behind the
// parapet and two lower doors replacing the old generic ground-floor grid.
const entranceProjection=exterior.model.getObjectByName('Entrance west three-bay projection');
const entranceRecess=exterior.model.getObjectByName('Entrance west recessed wall');
const projectionBounds=new THREE.Box3().setFromObject(entranceProjection);
const recessBounds=new THREE.Box3().setFromObject(entranceRecess);
assert(projectionBounds.max.z-recessBounds.max.z>2,'img19 projection must stand forward of the five-bay recess');
const entranceOpenings=exterior.model.userData.entranceWestPhotoOpenings;
for(const y of [5.45,9.75])assert.equal(entranceOpenings.filter(o=>o.face==='entrance-west-recess'&&o.y===y).length,5);
assert.equal(entranceOpenings.filter(o=>o.face==='entrance-west-sidelight').length,4);
for(const o of entranceOpenings.filter(o=>['entrance-west-recess','entrance-west-projection','entrance-west-lower'].includes(o.face))){
  ray.set(new THREE.Vector3(o.x,o.y,22),new THREE.Vector3(0,0,-1));
  const hit=ray.intersectObject(exterior.model,true)[0];
  assert(hit.object.isInstancedMesh&&hit.point.z>o.z,'img19 glazing must sit in front of its wall');
}
assert(!entranceOpenings.some(o=>o.y<3&&[-27.35,-11.55].includes(o.x)),'lower doors must not be overlaid by generic sashes');
for(const [x,z,name] of [[-27,18.4,'Entrance west projection slate roof'],[-16,12,'Entrance west recessed slate roof']]){
  ray.set(new THREE.Vector3(x,30,z),new THREE.Vector3(0,-1,0));
  const hit=ray.intersectObject(exterior.model,true)[0];
  assert.equal(hit.object.name,name);assert(hit.face.normal.y>0&&hit.point.y>13.35&&hit.point.y<16,'entrance roofs must clear their wall tops and face upwards');
}
// Roof surfaces must sit above the solid cornice slab across their whole
// footprint, not only at the ridge. This catches the former pale cut-outs.
for(const side of [-1,1]){
  const roofName=side<0?'Entrance west recessed slate roof':'Entrance east recessed slate roof';
  const mainCap=exterior.model.getObjectByName(roofName);
  const points=mainCap.geometry.attributes.position;
  for(let i=0;i<points.count;i++)assert(points.getY(i)+mainCap.position.y>13.03,'every main roof vertex must clear the cornice slab');
  const bounds=new THREE.Box3().setFromObject(mainCap);
  assert(bounds.max.y-bounds.min.y>2,'main entrance roof must have a visible pitch');
  for(const x of [8,12,16,20,24,28,31])for(const z of [7.2,8,10,12,14,16]){
    if(x===31&&z===16)continue; // The new open inside corner cuts into this former roof.
    ray.set(new THREE.Vector3(side*x,30,z),new THREE.Vector3(0,-1,0));
    const hit=ray.intersectObject(exterior.model,true)[0];
    assert(hit.object.material.map,'roof footprint must expose textured slate rather than the solid trim slab');
    assert(hit.point.y>13.03,'no entrance roof edge may sink below the cornice');
  }
  for(const x of [24,27,28.7])for(const z of [17.6,18.4,19.2]){
    ray.set(new THREE.Vector3(side*x,30,z),new THREE.Vector3(0,-1,0));
    const hit=ray.intersectObject(exterior.model,true)[0];
    assert.equal(hit.object.name,side<0?'Entrance west projection slate roof':'Entrance east projection slate roof');
    assert(hit.point.y>13.35,'projecting bay roofs must cover the wall tops all the way to the front');
  }
}
// Redesmere: the two bays must have real depth, outward-facing roof geometry
// and exposed glazing. Check rays against the whole estate, not just metadata.
const redesmereBays=exterior.model.children.filter(o=>o.name==='Redesmere canted bay');
assert.equal(redesmereBays.length,2);
for(const bay of redesmereBays){
  const bounds=new THREE.Box3().setFromObject(bay);
  assert(bounds.max.x>97&&Math.abs(bounds.min.y)<1e-6&&bounds.max.y>9,'Redesmere bays project from the brick ground storey to the eaves');
  ray.set(new THREE.Vector3(96.4,30,(bounds.min.z+bounds.max.z)/2),new THREE.Vector3(0,-1,0));
  const hit=ray.intersectObject(exterior.model,true)[0];
  assert.equal(hit.object.name,'Redesmere bay slate roof');
  assert(hit.face.normal.y>0);
}
for(const opening of exterior.model.userData.redesmerePhotoOpenings.filter(o=>o.face==='redesmere-main'||o.face==='redesmere-bay')){
  ray.set(new THREE.Vector3(100,opening.y,opening.z),new THREE.Vector3(-1,0,0));
  const hit=ray.intersectObject(exterior.model,true)[0];
  assert(hit.object.isInstancedMesh&&hit.point.x>opening.x,'Redesmere sash frames must be visible in front of the brick surfaces');
}
assert(!exterior.model.userData.redesmerePhotoOpenings.some(o=>Math.abs(o.z+12)<.1&&o.y<4),'the centre doorway must not have a superimposed sash');
const redesmereCamera=new THREE.PerspectiveCamera(REDESMERE_PHOTO_VIEW.fov,16/9,.1,2000);
redesmereCamera.position.set(...REDESMERE_PHOTO_VIEW.position);redesmereCamera.lookAt(...REDESMERE_PHOTO_VIEW.target);redesmereCamera.updateMatrixWorld(true);
for(const bay of redesmereBays){
  const centre=new THREE.Box3().setFromObject(bay).getCenter(new THREE.Vector3()).project(redesmereCamera);
  assert(Math.abs(centre.x)<.85&&Math.abs(centre.y)<.85,'both Redesmere bays must fit the marked comparison view');
}
ray.set(new THREE.Vector3(20,80,12),new THREE.Vector3(0,-1,0));
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
for(const [x,z] of [[31,-20],[39,40],[53.1,12],[68,8],[89.2,-25],[89.2,0],[83.7,-38],[83.7,-44],[91.2,5]]){
  ray.set(new THREE.Vector3(x,80,z),new THREE.Vector3(0,-1,0));
  assert(ray.intersectObject(exterior.model,true)[0].point.y>8,'corrected east footprint must contain roof geometry');
}
// September 2026 corner photos: open sky between separate rooflines, with
// only a half-storey masonry lintel at first-floor level across the lane.
const lintel=new THREE.Box3().setFromObject(exterior.model.getObjectByName('1829 Redesmere brick lintel'));
assert(Math.abs(lintel.min.y-4)<1e-5&&Math.abs(lintel.max.y-6)<1e-5,'lintel starts at the first floor and is half a storey high');
assert(lintel.max.z-lintel.min.z<1.5,'the lintel is a shallow wall, not a roofed room');
for(const x of [75.5,76,77.5])for(const z of [3,6.5,12,18.5,21]){
  ray.set(new THREE.Vector3(x,30,z),new THREE.Vector3(0,-1,0));
  assert(ray.intersectObject(exterior.model,true)[0].point.y<.5,'the lane must be open to the sky away from the lintel');
}
ray.set(new THREE.Vector3(76,30,8.5),new THREE.Vector3(0,-1,0));
assert.equal(ray.intersectObject(exterior.model,true)[0].object.name,'1829 Redesmere lintel coping');
ray.set(new THREE.Vector3(76,1.8,27),new THREE.Vector3(0,0,-1));
assert(ray.intersectObject(exterior.model,true)[0].point.z<0,'ground-level sightline must pass under the lintel into the court');
// The low front end is solid brick down to ground level, with no sash frames
// on its photographed front face and no tall placeholder roofs left above it.
for(const x of [80.5,82,84,86,89,92,95,98])for(const y of [1,2,3.8]){
  ray.set(new THREE.Vector3(x,y,24),new THREE.Vector3(0,0,-1));
  // img3 adds ivy and boarded panels; check the continuous wall behind them.
  const hit=ray.intersectObject(exterior.model.getObjectByName('Redesmere windowless brick end range'))[0];
  assert.equal(hit.object.name,'Redesmere windowless brick end range');
  assert(hit.object.material.map,'brick texture must continue to the base');
  assert(Math.abs(hit.point.z-22)<1e-5,'front wall must be continuous across the end range');
}
for(const x of [82,86,92,97])for(const z of [16,20]){
  ray.set(new THREE.Vector3(x,30,z),new THREE.Vector3(0,-1,0));
  const hit=ray.intersectObject(exterior.model,true)[0];
  assert.equal(hit.object.name,'Redesmere low end slate roof');
  assert(hit.point.y>4.6&&hit.point.y<6.7&&hit.face.normal.y>0,'front roofs must be low and outward-facing');
}
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
assert(new THREE.Box3().setFromObject(courtBay).min.z<1.1,'courtyard bay projects more than three units beyond the rear wall');
{
  const base=exterior.model.getObjectByName('East courtyard polygonal bay white base');
  const outline=courtBay.userData.collisionFootprint;
  assert.deepEqual(base.userData.collisionFootprint,outline,'white base follows the half-octagonal brick walls');
  assert.equal(outline.length,6,'half octagon has a flat attachment and five exposed sides');
  assert.equal(outline[2][1],outline[3][1],'the front is flat, without a central corner');
  for(const [a,b] of [[outline[1],outline[2]],[outline[3],outline[4]]])
    assert(Math.abs(Math.abs(b[0]-a[0])-Math.abs(b[1]-a[1]))<1e-8,'cheeks are at 45 degrees');
  const hit=(x,y,z)=>{
    ray.set(new THREE.Vector3(x,y,z),new THREE.Vector3(0,0,1));
    return ray.intersectObject(exterior.model,true)[0];
  };
  const front=hit(59.4,12.9,-3),other=hit(60.2,12.9,-3),inset=hit(64.1,12.9,-3),end=hit(68,12.9,-3);
  assert.equal(front.object,courtBay);assert.equal(other.point.z,front.point.z,'both front probes meet one flat wall');
  assert(Math.abs(inset.point.z-7.3)<1e-5,'the recess is cut through the old pavilion and cross range');
  assert.equal(end.object.name,'East courtyard fire-exit corner');
  assert(end.point.z>front.point.z+3&&end.point.z<inset.point.z-2,'fire-exit corner projects slightly from the recess, behind the main bay');
  const wallLow=hit(48.8,12.9,-3),wallHigh=hit(48.8,13.3,-3);
  assert.equal(front.object.material,wallLow.object.material,'bay uses adjoining brick material');
  assert(Math.abs((hit(59.4,13.3,-3).uv.y-front.uv.y)-(wallHigh.uv.y-wallLow.uv.y))<1e-6,'brick courses share the wall texture scale');
  const openings=exterior.model.userData.courtyardPhotoOpenings.filter(o=>['courtyard-bay','courtyard-recess'].includes(o.face));
  assert.equal(openings.length,12,'three bay facets and the recess have windows on all three floors');
  for(const o of openings){
    const nx=o.face==='courtyard-bay'&&Math.abs(o.x-59.8)>.1?Math.sign(o.x-59.8):0;
    const normal=new THREE.Vector3(nx,0,-1).normalize(),tangent=new THREE.Vector3(-normal.z,0,normal.x);
    for(const offset of [-.3,0,.3]){
      const p=new THREE.Vector3(o.x,o.y+o.h/12,o.z).addScaledVector(tangent,offset*o.w).addScaledVector(normal,.45);
      ray.set(p,normal.clone().negate());
      assert.equal(ray.intersectObject(exterior.model,true)[0]?.object.material.color.getHex(),0x78989f,'bay and inset glazing remain exposed');
    }
  }
  // Ray-test the actual roof joins, including the small end hip, rather than
  // accepting a wall cap or downward-facing triangle as roof coverage.
  const roofMaterial=exterior.model.getObjectByName('Garden pavilion slate roof').material;
  for(const [x,z] of [[59.8,1.2],[57.6,2.4],[62,2.4],[63.1,5.9],[64.8,7.5],[65.9,8.6],[66.5,5.2],[68,5.2],[69.5,5.2],[68,7.5],[68,9.9]]){
    ray.set(new THREE.Vector3(x,30,z),new THREE.Vector3(0,-1,0));
    const roof=ray.intersectObject(exterior.model,true)[0];
    assert.equal(roof.object.material,roofMaterial,'slate covers the courtyard wall tops');
    assert(roof.face.normal.y>0&&roof.point.y>14.3,'roof faces upward above the cornice');
  }
  ray.set(new THREE.Vector3(64.75,30,6.1),new THREE.Vector3(0,-1,0));
  assert(ray.intersectObject(exterior.model,true)[0].point.y<.5,'recess is open to the sky');
  const obstacles=exteriorObstacles(THREE,exterior.model),blocked=(x,z)=>obstacles.some(o=>obstacleContains(o,x,z,.05));
  assert(!blocked(64.75,6.4)&&blocked(64.75,7.7),'walking can enter the recess and stops at its back wall');
  assert(blocked(68,6)&&blocked(59.8,1.3),'projecting corner and bay foundations remain solid');
  assert(!blocked(56.8,1.3)&&!blocked(62.8,1.3),'cut-away bay corners leave walking space');
}
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
// Both rear stair sections now continue the main roof. Sample both halves
// of each hip: the old triangulation left one half flat against the cornice.
for(const x of [-31,31]){
  const roof=exterior.model.getObjectByName((x<0?'West':'East')+' wing joined slate roof');
  const roofY=Array.from({length:roof.geometry.attributes.position.count},(_,i)=>roof.geometry.attributes.position.getY(i));
  assert(Math.abs(Math.min(...roofY)-13.06)<1e-5,'rear eaves match the blue-marked connecting eaves');
  assert(Math.abs(Math.max(...roofY)-15.66)<1e-5,'both rear roofs match the connecting ridge');
  const topAt=z=>{
    ray.set(new THREE.Vector3(x,80,z),new THREE.Vector3(0,-1,0));
    return ray.intersectObject(exterior.model,true)[0];
  };
  const levels=new Set();
  for(let z=-35;z<=-10;z+=.5)levels.add(topAt(z).object);
  assert.equal(levels.size,2,'each rear wing must have only the main roof and sloping annex roof');
  for(const z of [-30.4,-29.5,-28,-26,-24.5,-10]){
    assert.equal(topAt(z).object,roof,'the main roof must continue over the stair section');
    for(const dx of [-6,-4,-2,0,2,4,6]){
      ray.set(new THREE.Vector3(x+dx,80,z),new THREE.Vector3(0,-1,0));
      const hit=ray.intersectObject(exterior.model,true)[0];
      assert.equal(hit.object,roof,'slate must cover the entire hip without pale trim breaking through');
      assert(hit.point.y>13.1&&hit.point.y<=15.66+.00001,'lowered hip planes clear the cornice and stay below the connecting ridge');
      const normal=hit.face.normal.clone().transformDirection(hit.object.matrixWorld);
      assert(normal.y>0&&normal.y<.99,'both halves of the hip must slope upward from the eaves');
    }
  }
}
// The retained upper sashes must also stay exposed immediately below the
// lowered eaves, including the taller windows at both rear ends.
for(const [schedule,faces,normal] of [
  [exterior.model.userData.courtyardPhotoOpenings,['courtyard-west-wing'],[1,0,0]],
  [exterior.model.userData.westWingPhotoOpenings,['west-wing-outer'],[-1,0,0]],
  [exterior.model.userData.innerCourtPhotoOpenings,['inner-stair-north'],[0,0,-1]],
  [exterior.model.userData.westWingPhotoOpenings,['west-wing-upper-end','west-wing-end-sidelight'],[0,0,-1]]
])for(const o of schedule.filter(o=>faces.includes(o.face)&&o.y>10)){
  const n=new THREE.Vector3(...normal),p=new THREE.Vector3(o.x+(n.z?.2*o.w:0),o.y+.45*o.h,o.z+(n.x?.2*o.w:0));
  ray.set(p.clone().addScaledVector(n,2),n.negate());
  const hit=ray.intersectObject(exterior.model,true)[0];
  assert(hit?.object.isInstancedMesh&&hit.point.distanceTo(p)<.2,'lowered eaves leave the tops of the existing sashes exposed');
}
// img3: basement glazing must remain exposed and the new garden must not
// obstruct the continuous route from the rear road into the inner court.
assert(exterior.model.getObjectByName('Inner court projecting brick block'));
for(const o of exterior.model.userData.innerCourtPhotoOpenings.filter(o=>['inner-block-north','inner-block-basement','inner-stair-north'].includes(o.face))){
  // Offset within the glass to avoid the existing basement downpipe.
  ray.set(new THREE.Vector3(o.x+.25,o.y,-37),new THREE.Vector3(0,0,1));
  const hit=ray.intersectObject(exterior.model,true)[0];
  assert(hit.object.isInstancedMesh&&Math.abs(hit.point.z-o.z)<.2,'north sashes must remain exposed above and below the raised annex roof');
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
assert(annexHeights[1]-annexHeights[0]>1.3&&annexHeights[1]<10.2,'low roof rises towards the main wing at the west gallery height');
for(const o of exterior.model.userData.innerCourtPhotoOpenings.filter(o=>['inner-block-west','inner-annex-west'].includes(o.face))){
  ray.set(new THREE.Vector3(23.7,o.y,o.z),new THREE.Vector3(1,0,0));
  const hit=ray.intersectObject(exterior.model,true)[0];
  assert(hit.object.isInstancedMesh&&hit.point.x>24.1&&hit.point.x<24.45,'windows on both the moved section and low annex remain exposed');
}
ray.set(new THREE.Vector3(23.7,9.3,-31),new THREE.Vector3(1,0,0));
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
for(let i=0;i<annexHeights.length;i++)assert(Math.abs(annexHeights[i]-westRoofHeights[i])<1e-5,'east and west rear annexes must share the same roof height and pitch');
const eastRoofBounds=new THREE.Box3().setFromObject(annexRoof),westRoofBounds=new THREE.Box3().setFromObject(westRoof);
assert(eastRoofBounds.getSize(new THREE.Vector3()).distanceTo(westRoofBounds.getSize(new THREE.Vector3()))<1e-5,'rear annex roof widths and depths must match');
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
  assert(hit.point.z>-1.4&&hit.point.z<-1,'west paired windows must remain exposed on the aligned red-wall plane');
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
assert.equal(flanking.length,3,'broad lower glazing flanks the bay, with the fourth position occupied by the garden door');
for(const o of flanking){
  ray.set(new THREE.Vector3(o.x,o.y,24),new THREE.Vector3(0,0,-1));
  const hit=ray.intersectObject(exterior.model,true)[0];
  assert(hit.object.isInstancedMesh&&hit.point.z>19.5&&hit.point.z<20,'bay flanking glazing must remain exposed beside the bay and forward range');
}
ray.set(new THREE.Vector3(-57.5,13.2,30),new THREE.Vector3(0,0,-1));
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
// img17: inspect actual exposed glazing and access around the new solid stair.
const forwardEnd=exterior.model.userData.westForwardEndPhotoOpenings;
assert.equal(forwardEnd.filter(o=>o.face==='west-forward-end-lower').length,4);
assert.equal(forwardEnd.filter(o=>o.face==='west-forward-end-upper').length,3);
assert.equal(forwardEnd.filter(o=>o.face==='west-forward-end-transom').length,1);
assert(!exterior.model.userData.eastPhotoOpenings.some(o=>o.face==='west-front-forward-end'),'old three-column glazing must be removed');
for(const o of forwardEnd){
  ray.set(new THREE.Vector3(o.x,o.y,48),new THREE.Vector3(0,0,-1));
  const hit=ray.intersectObject(exterior.model,true)[0];
  assert(hit.object.isInstancedMesh&&hit.point.z>43.1&&hit.point.z<43.4,'img17 glazing must remain visible beyond its brick wall');
}
ray.set(new THREE.Vector3(-39,6.15,48),new THREE.Vector3(0,0,-1));
assert(ray.intersectObject(exterior.model,true)[0].point.z>43.3,'upper door glazing must be exposed above its landing');
const forwardStair=exterior.model.getObjectByName('West forward end masonry return stair');
const forwardStairBounds=new THREE.Box3().setFromObject(forwardStair);
assert(forwardStairBounds.min.x<-46&&forwardStairBounds.max.z<47,'stair must return on the left while leaving the front approach clear');
const obstacles=exteriorObstacles(THREE,exterior.model);
assert(obstacles.some(b=>-45.75>b.minX&&-45.75<b.maxX&&45.28>b.minZ&&45.28<b.maxZ),'masonry landing must block ground-level walking');
for(const x of [-46,-40,-35,-30])assert(!obstacles.some(b=>x>b.minX-.4&&x<b.maxX+.4&&48>b.minZ-.4&&48<b.maxZ+.4),'front approach must remain walkable past the stair');
for(const aspect of [16/9,4/3]){
  const camera=new THREE.PerspectiveCamera(WEST_FORWARD_END_PHOTO_VIEW.fov,aspect,.1,2000);
  camera.position.set(...WEST_FORWARD_END_PHOTO_VIEW.position);camera.lookAt(...WEST_FORWARD_END_PHOTO_VIEW.target);camera.updateMatrixWorld(true);
  for(const x of [-46.5,-29])for(const y of [.2,16]){
    const p=new THREE.Vector3(x,y,43).project(camera);
    assert(Math.abs(p.x)<1&&Math.abs(p.y)<1,'photo preset must frame the complete end facade and stairs');
  }
}
delete globalThis.document;
console.log('PASS: real estate geometry, upward-facing roofs, W-shaped openings to the rear, rear-left lattice mast, building/mast framing throughout landscape and portrait pans.');
// The front entrance follows the user's forked stair plan. Trace the actual
// surfaces through both routes so gaps, hidden treads and wrong rises fail.
const frontStairs=exterior.model.getObjectByName('Front entrance split staircase');
assert(frontStairs);
function stairHeight(x,z){
  ray.set(new THREE.Vector3(x,3,z),new THREE.Vector3(0,-1,0));
  const hit=ray.intersectObject(exterior.model,true)[0];
  assert(hit,'entrance route must have a solid surface');
  assert(hit.object.name.endsWith(' surface'),'entrance route must expose its stone tread or landing');
  return hit.point.y;
}
const frontRise=(1.8-.18)/8;
for(let i=0;i<4;i++)assert(Math.abs(stairHeight(0,27.2-i*.4)-(.18+(i+1)*frontRise))<1e-5);
assert(Math.abs(stairHeight(0,25.2)-.99)<1e-5);
for(const side of [-1,1]){
  for(let i=0;i<4;i++)assert(Math.abs(stairHeight(side*(1.3+i*.4),25.2)-(.99+(i+1)*frontRise))<1e-5);
  for(let z=25.7;z>20.2;z-=.1)assert(Math.abs(stairHeight(side*3.3,z)-1.8)<1e-5,'second turn joins doorstep at a continuous level');
  for(let x=.1;x<3.8;x+=.1)stairHeight(side*x,25.2);
  assert.equal(frontStairs.children.filter(o=>new RegExp('^'+(side<0?'Left':'Right')+' lateral step [1-4] surface$').test(o.name)).length,4);
}
assert.equal(frontStairs.children.filter(o=>/^Front approach step [1-4] surface$/.test(o.name)).length,4);
const doorstep=new THREE.Box3().setFromObject(frontStairs.getObjectByName('Front doorway landing surface'));
assert(doorstep.min.x<-3.8&&doorstep.max.x>3.8&&doorstep.min.z<20,'doorstep must span both returns and reach the door');
// The annotated grass strip must be covered by the landing and every branch
// tread, including the seam against the existing doorstep wall.
for(const object of frontStairs.children.filter(o=>/^(Front stair branching landing|Left lateral step [1-4]|Right lateral step [1-4]) surface$/.test(o.name))){
  const bounds=new THREE.Box3().setFromObject(object);
  assert(Math.abs(bounds.min.z-doorstep.max.z)<1e-5,'every branch surface meets the doorstep wall');
  assert(Math.abs(bounds.max.z-25.8)<1e-5,'the outer stair edge stays fixed');
  for(const z of [doorstep.max.z+.001,23.8,24.1,24.59,25.2]){
    assert(Math.abs(stairHeight(object.position.x,z)-bounds.max.y)<1e-5,'the former grass strip exposes the correct stone surface');
  }
}
const frontObstacles=exteriorObstacles(THREE,exterior.model);
assert(frontObstacles.some(b=>0>b.minX&&0<b.maxX&&25.2>b.minZ&&25.2<b.maxZ),'stair foundations retain exterior scenery collisions');
for(const x of [-2.5,0,2.5])assert(frontObstacles.some(b=>obstacleContains(b,x,24.1,0)),'extended stair foundations block walking through the former gap');
console.log('PASS: front staircase retains both four-tread branches and forward returns, with solid stone surfaces and collisions up to the doorway wall.');
