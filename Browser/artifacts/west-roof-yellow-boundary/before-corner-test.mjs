import assert from 'node:assert/strict';
import * as THREE from './dist/vendor/three.module.js';
import {createEscapeExterior} from './dist/escape-exterior.mjs';
import {FRONT_CORNER_VIEWS,FRONT_CORNER_OUTLINE} from './dist/front-inside-corners.mjs';
import {exteriorObstacles,obstacleContains,createWalker} from './dist/explore-controls.mjs';
globalThis.document={createElement:()=>({width:0,height:0,getContext:()=>({fillRect(){}})})};
const {model,camera}=createEscapeExterior(THREE,4/3);
model.updateMatrixWorld(true);
const obstacles=exteriorObstacles(THREE,model),ray=new THREE.Raycaster();
const slate=model.getObjectByName('Entrance east projection slate roof').material;
const roofs=model.children.filter(o=>o.isMesh&&o.material===slate);
const cornices=model.children.filter(o=>o.isMesh&&/^Entrance (east|west) mitred cornice/.test(o.name));
function down(x,z){ray.set(new THREE.Vector3(x,30,z),new THREE.Vector3(0,-1,0));return ray.intersectObject(model,true)[0];}
// The six bends use a uniform 0.075 scale from the user's yellow pixel trace.
const pixels=[[99,156],[99,124],[123,100],[160,100],[161,151],[138,174]];
for(let i=0;i<pixels.length;i++){
  assert(Math.abs(FRONT_CORNER_OUTLINE[i][0]-(pixels[i][0]-138)*.075-32)<1e-6);
  assert(Math.abs(FRONT_CORNER_OUTLINE[i][1]-(pixels[i][1]-156)*.075-19.7)<1e-6);
}
for(const side of [-1,1]){
  // Rays through previously solid main-range and wing-root footprints must
  // reach the new asphalt, with no old roof, cornice or white plinth bridging it.
  for(const [x,z] of [[31.5,16.5],[30,18],...(side>0?[[33,19.1],[32.3,19.8]]:[]),[31.3,21.7],[30.3,23.7]]){
    const hit=down(side*x,z);
    assert(hit.point.y<.3,'the corner and removed bollard footprint must be open to the sky');
    assert(!obstacles.some(o=>obstacleContains(o,side*x,z,.05)),'clipped building collision must leave the actual recess clear');
  }
  // Remaining masonry on both sides of the diagonal is solid, while the
  // approach and both camera positions remain outside the wing foundations.
  for(const [x,z] of [[28.5,18.5],[30.3,15.7],[34.1,side<0?15.3:18],[33.2,21.3]])
    assert(obstacles.some(o=>obstacleContains(o,side*x,z,0)),'the surviving masonry must still block walking');
  for(const [x,z] of [[30.8,25.7],[30.8,23],[31.5,21],[31.5,19],[31.5,17],[31.5,16.2]])
    assert(!obstacles.some(o=>obstacleContains(o,side*x,z)),'a player-width route must reach the rear door');
  assert(down(side*28,18).point.y>13,'the retained projecting frontage must still have its slate roof');
  ray.set(new THREE.Vector3(side*22.5,30,17.42),new THREE.Vector3(0,-1,0));
  const joinRoof=ray.intersectObjects(roofs,false)[0],joinTrim=ray.intersectObjects(cornices,false)[0];
  if(side>0)assert(joinTrim&&joinRoof&&Math.abs(joinTrim.point.y-joinRoof.point.y)<.08,'The trim transition follows the roof instead of ending in a raised blade');
  else{
    assert(joinTrim&&!joinRoof,'The corrected west slate stops before the exposed render return');
    ray.set(new THREE.Vector3(-22.6751,30,17.42),new THREE.Vector3(0,-1,0));
    const edgeRoof=ray.intersectObjects(roofs,false)[0];
    ray.set(new THREE.Vector3(-22.6749,30,17.42),new THREE.Vector3(0,-1,0));
    const edgeTrim=ray.intersectObjects(cornices,false)[0];
    assert(edgeRoof&&edgeTrim&&Math.abs(edgeTrim.point.y-edgeRoof.point.y)<.001,'Slate meets the inner render edge without an open seam');
  }
  // The open ends of the cut extend through the roof overhangs. These two
  // probes catch the slate tongues missed by the broader courtyard checks.
  for(const [x,z] of [[29.25,20],[31.7,21.15]]){
    ray.set(new THREE.Vector3(side*x,30,z),new THREE.Vector3(0,-1,0));
    assert.equal(ray.intersectObjects(roofs,false).length,0,'No slate tip projects across the courtyard wall edge');
  }
  for(const [x,z] of [side<0?[28.6,19.55]:[28.95,19.95],[31.8,21.3],[32.2,21.05]]){
    ray.set(new THREE.Vector3(side*x,30,z),new THREE.Vector3(0,-1,0));
    const hit=ray.intersectObjects(roofs,false)[0];
    assert(hit&&hit.face.normal.y>0,'Trimming the tips retains the adjoining upward-facing slate');
  }
}
const openings=model.userData.frontInsideCornerOpenings;
// The later yellow guide adds a lower stepped section with a level roof.
// Above that roof, the short upper face still joins the back-wall plane.
assert(!model.getObjectByName('West forward inset root east slate roof'),'Remove the circled west roof wedge');
for(const [x,z] of [[-34.4,16.5],[-34,17.5],[-34.4,20.5],[-33,19.1],[-32.3,20.5]]){
  const top=down(x,z);
  assert.equal(top.object.name,'West inside corner flat roof');
  assert(Math.abs(top.point.y-8.83)<1e-5,'The new roof is level across both steps');
  assert(obstacles.some(o=>obstacleContains(o,x,z,0)),'New masonry supplies the actual walking footprint');
}
for(const [x,z] of [[-33.3,17],[-32.5,18],[-31.5,20],[-31.5,22]]){
  assert(down(x,z).point.y<.3,'The remaining court is open to the sky');
  assert(!obstacles.some(o=>obstacleContains(o,x,z,.05)),'The stepped outline leaves the doorway route clear');
}
for(const [origin,direction,axis,value] of [
  [[-32.5,4.6,16],[-1,0,0],'x',-33.65],
  [[-32.5,4.6,17.5],[0,0,1],'z',18.5],
  [[-31,4.6,20],[-1,0,0],'x',-32]
]){
  ray.set(new THREE.Vector3(...origin),new THREE.Vector3(...direction));
  const hit=ray.intersectObject(model,true)[0];
  assert.equal(hit.object.name,'West inside corner stepped infill masonry');
  assert(Math.abs(hit.point[axis]-value)<1e-5,'All three new wall planes follow the yellow step');
}
for(const x of [-34.8,-34.2])for(const y of [11.7]){
  ray.set(new THREE.Vector3(x,y,20.5),new THREE.Vector3(0,0,-1));
  const hit=ray.intersectObject(model,true)[0];
  assert.equal(hit.object.name,'West inside corner brick facet 5','The formerly projecting face is solid at every storey');
  assert(Math.abs(hit.point.z-FRONT_CORNER_OUTLINE[2][1])<1e-5,'Purple face aligns exactly with the yellow wall');
}
assert.equal(openings.length,26);
for(const o of openings)for(const u of [-.26,.26])for(const v of [-.27,.27]){
  const dx=Math.cos(o.rotation)*o.w*u,dz=-Math.sin(o.rotation)*o.w*u;
  ray.set(new THREE.Vector3(o.x+dx+o.nx*.35,o.y+o.h*v,o.z+dz+o.nz*.35),new THREE.Vector3(-o.nx,0,-o.nz));
  const hit=ray.intersectObject(model,true)[0];
  assert.equal(hit?.object.material.color.getHex(),0x78989f,'each sash must expose all its panes ahead of the wall '+JSON.stringify({o,u,v,hit:hit&&{name:hit.object.name,point:hit.point.toArray()}}));
  assert(hit.distance<.35,'glazing must be on the court side of the wall');
}
const west=openings.filter(o=>o.x<0),east=openings.filter(o=>o.x>0);
for(let i=0;i<west.length;i++){
  assert.equal(west[i].y,east[i].y);
  if(i<9){assert(Math.abs(west[i].x+east[i].x)<1e-6);assert.equal(west[i].z,east[i].z);}
  else{
    assert(Math.abs(west[i].rotation-Math.PI/2)<1e-6,'The retained lower sashes face the stepped outer walls');
    assert(Math.abs(west[i].x-(i<11?-33.585:-31.935))<1e-6,'The two sash columns follow their new wall planes');
  }
}
for(const [name,view] of Object.entries(FRONT_CORNER_VIEWS))if(name!=='front-corners'){
  assert(!obstacles.some(o=>obstacleContains(o,view.position[0],view.position[2])),name+' must start in open space');
}
// Exercise the walker through the former square corner, not just static points.
const walker=createWalker(camera,obstacles);
walker.setView({position:[31.5,1.8,23],target:[31.5,1.8,15]});walker.keys.add('KeyW');
for(let i=0;i<20;i++)walker.update(.05);
assert(camera.position.z<18.1,'the clipped courtyard must be accessible in Explore');
walker.setView({position:[-31.45,1.8,23],target:[-31.45,1.8,14]});walker.keys.add('KeyW');
for(let i=0;i<35;i++)walker.update(.05);walker.keys.clear();
assert(camera.position.z>15.7&&camera.position.z<16.2,'The new stepped section retains walking access to the landing doorway');
walker.setView({position:[-31,1.8,20],target:[-34,1.8,20]});walker.keys.add('KeyW');
for(let i=0;i<15;i++)walker.update(.05);walker.keys.clear();
assert(camera.position.x>-31.61&&camera.position.x<-31.4,'The walker stops at the new outer wall');
assert(!model.children.some(o=>/inside corner bollard/i.test(o.name)),'the recent bollard is excluded');
// Old cornice/slab triangles must end behind the wall skin. Open triangle
// edges on that plane rasterized as the reported horizontal ghost lines.
let hiddenEdges=0,junctionSamples=0;
for(const side of [-1,1])for(let i=0;i<5;i++){
 const a=FRONT_CORNER_OUTLINE[i],b=FRONT_CORNER_OUTLINE[i+1];
 const dx=side*(b[0]-a[0]),dz=b[1]-a[1],length=Math.hypot(dx,dz),nx=-side*dz/length,nz=side*dx/length;
 for(const object of model.children){
  if(object.name!=='Front inside corner trimmed existing detail'||Math.min(object.material.color.r,object.material.color.g,object.material.color.b)<.3)continue;
  const positions=object.geometry.attributes.position;
  for(let j=0;j<positions.count;j++){
   const v=new THREE.Vector3().fromBufferAttribute(positions,j).applyMatrix4(object.matrixWorld),ux=v.x-side*a[0],uz=v.z-a[1];
   const t=(ux*dx+uz*dz)/(length*length),distance=ux*nx+uz*nz;
   if(t<=.1||t>=.9||v.y<=3||distance<-.08||distance>.02)continue;
   assert(distance<-.025,'Existing render/slab edges cannot compete with the brick facade '+JSON.stringify({side,i,v:v.toArray(),distance}));hiddenEdges++;
  }
 }
}
assert(hiddenEdges>40,'Audit existing cornice edges on the canted and straight returns');
for(const side of ['West','East'])for(const i of side==='West'?[0,1,2,5]:[0,1,2,3,4]){
 const wall=model.getObjectByName(side+' inside corner brick facet '+i),junction=model.getObjectByName(side+' inside corner roof junction '+i);
 const positions=junction.geometry.attributes.position,uv=junction.geometry.attributes.uv;
 for(let j=0;j<positions.count;j++){
  const p=wall.worldToLocal(new THREE.Vector3().fromBufferAttribute(positions,j).applyMatrix4(junction.matrixWorld));
  assert(Math.abs(p.z-.085)<3e-6,'Roof closure shares the exterior wall plane; no exposed slate edges');
  assert(Math.abs(uv.getX(j)-p.x/1.7)<2e-6&&Math.abs(uv.getY(j)-p.y/1.7)<2e-6,'Brick courses align through the former wall/roof seam');junctionSamples++;
 }
}
console.log(`PASS: marked stepped walls, level flat roof, exact masonry collisions, walked doorway route, 104 pane probes, ${hiddenEdges} concealed trim edges and ${junctionSamples} flush/textured roof-closure samples.`);
