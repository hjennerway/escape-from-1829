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
  for(const [x,z] of [[31.5,16.5],[30,18],[33,19.1],[32.3,19.8],[31.3,21.7],[30.3,23.7]]){
    const hit=down(side*x,z);
    assert(hit.point.y<.3,'the corner and removed bollard footprint must be open to the sky');
    assert(!obstacles.some(o=>obstacleContains(o,side*x,z,.05)),'clipped building collision must leave the actual recess clear');
  }
  // Remaining masonry on both sides of the diagonal is solid, while the
  // approach and both camera positions remain outside the wing foundations.
  for(const [x,z] of [[28.5,18.5],[30.3,15.7],[34.1,18],[33.2,21.3]])
    assert(obstacles.some(o=>obstacleContains(o,side*x,z,0)),'the surviving masonry must still block walking');
  for(const [x,z] of [[30.8,25.7],[30.8,23],[31.5,21],[31.5,19],[31.5,17],[31.5,16.2]])
    assert(!obstacles.some(o=>obstacleContains(o,side*x,z)),'a player-width route must reach the rear door');
  assert(down(side*28,18).point.y>13,'the retained projecting frontage must still have its slate roof');
  ray.set(new THREE.Vector3(side*22.5,30,17.42),new THREE.Vector3(0,-1,0));
  const joinRoof=ray.intersectObjects(roofs,false)[0],joinTrim=ray.intersectObjects(cornices,false)[0];
  assert(joinTrim&&joinRoof&&Math.abs(joinTrim.point.y-joinRoof.point.y)<.08,'The trim transition follows the roof instead of ending in a raised blade');
  // The open ends of the cut extend through the roof overhangs. These two
  // probes catch the slate tongues missed by the broader courtyard checks.
  for(const [x,z] of [[29.25,20],[31.7,21.15]]){
    ray.set(new THREE.Vector3(side*x,30,z),new THREE.Vector3(0,-1,0));
    assert.equal(ray.intersectObjects(roofs,false).length,0,'No slate tip projects across the courtyard wall edge');
  }
  for(const [x,z] of [[28.95,19.95],[31.8,21.3],[32.2,21.05]]){
    ray.set(new THREE.Vector3(side*x,30,z),new THREE.Vector3(0,-1,0));
    const hit=ray.intersectObjects(roofs,false)[0];
    assert(hit&&hit.face.normal.y>0,'Trimming the tips retains the adjoining upward-facing slate');
  }
}
const openings=model.userData.frontInsideCornerOpenings;
assert.equal(openings.length,26);
for(const o of openings)for(const u of [-.26,.26])for(const v of [-.27,.27]){
  const dx=Math.cos(o.rotation)*o.w*u,dz=-Math.sin(o.rotation)*o.w*u;
  ray.set(new THREE.Vector3(o.x+dx+o.nx*.35,o.y+o.h*v,o.z+dz+o.nz*.35),new THREE.Vector3(-o.nx,0,-o.nz));
  const hit=ray.intersectObject(model,true)[0];
  assert.equal(hit?.object.material.color.getHex(),0x78989f,'each sash must expose all its panes ahead of the wall');
  assert(hit.distance<.35,'glazing must be on the court side of the wall');
}
const west=openings.filter(o=>o.x<0),east=openings.filter(o=>o.x>0);
for(let i=0;i<west.length;i++){
  assert(Math.abs(west[i].x+east[i].x)<1e-6);
  assert.equal(west[i].z,east[i].z);assert.equal(west[i].y,east[i].y);
}
for(const [name,view] of Object.entries(FRONT_CORNER_VIEWS))if(name!=='front-corners'){
  assert(!obstacles.some(o=>obstacleContains(o,view.position[0],view.position[2])),name+' must start in open space');
}
// Exercise the walker through the former square corner, not just static points.
const walker=createWalker(camera,obstacles);
walker.setView({position:[31.5,1.8,23],target:[31.5,1.8,15]});walker.keys.add('KeyW');
for(let i=0;i<20;i++)walker.update(.05);
assert(camera.position.z<18.1,'the clipped courtyard must be accessible in Explore');
assert(!model.children.some(o=>/inside corner bollard/i.test(o.name)),'the recent bollard is excluded');
console.log('PASS: marked footprint, open roofs and foundations, diagonal collisions, clear door route, mirrored sash exposure, photo cameras and no bollards.');
