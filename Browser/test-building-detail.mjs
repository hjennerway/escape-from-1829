import assert from 'node:assert/strict';
import * as THREE from './dist/vendor/three.module.js';
import {createBuildingDetail} from './dist/building-detail.mjs';
import {createEscapeExterior} from './dist/escape-exterior.mjs';
import {createAerialLayouts} from './dist/aerial-layouts.mjs';
import {batchAerialMeshes,cacheAerialTransforms} from './dist/aerial-performance.mjs';
import {sampleLanding} from './dist/aerial-controls.mjs';

function visibleMeshes(root){const meshes=[];root.traverseVisible(o=>{if(o.isMesh)meshes.push(o);});return meshes;}
function triangles(root){return visibleMeshes(root).reduce((sum,o)=>sum+(o.geometry.index?.count??o.geometry.attributes.position.count)/3*(o.isInstancedMesh?o.count:1),0);}

// Two identical windows on a rotated facade. Sample the actual proxy texture
// through a ray hit, so misplaced, flipped or empty panels cannot pass on counts.
const testScene=new THREE.Scene(),facade=new THREE.Group();testScene.add(facade);
facade.position.set(12,0,-7);facade.rotation.y=.6;
const geometry=new THREE.BoxGeometry(1,1,1),dummy=new THREE.Object3D();
const glass=new THREE.MeshStandardMaterial({color:0x78989f,roughness:.48,metalness:.15});
const frame=new THREE.MeshStandardMaterial({color:0xd3dcd8});
const panes=[],frames=[];
for(const x of [-2,2]){
  panes.push([x,2.2,.09,1.4,2.8,.06]);
  for(const side of [-1,1]){frames.push([x+side*.7,2.2,.14,.07,2.9,.08]);frames.push([x,2.2+side*1.4,.14,1.5,.07,.08]);}
  frames.push([x,2.2,.16,1.4,.065,.07],[x,2.2,.16,.025,2.8,.04]);
}
for(const [material,items] of [[glass,panes],[frame,frames]]){
  const mesh=new THREE.InstancedMesh(geometry,material,items.length);mesh.castShadow=true;
  items.forEach(([x,y,z,w,h,d],i)=>{dummy.position.set(x,y,z);dummy.scale.set(w,h,d);dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix);});facade.add(mesh);
}
const wall=new THREE.Mesh(new THREE.BoxGeometry(8,6,1),new THREE.MeshStandardMaterial());wall.position.set(0,3,-.6);facade.add(wall);
testScene.updateMatrixWorld(true);
const original=visibleMeshes(testScene),originalTriangles=triangles(testScene),detail=createBuildingDetail(THREE,testScene);
assert.equal(detail.stats.windows,2);assert.equal(detail.stats.patterns,1,'Matching windows share an atlas tile');
assert.equal(createBuildingDetail(THREE,testScene),detail,'Preparation must be idempotent');
assert.deepEqual(visibleMeshes(testScene),[wall,...original.filter(o=>o!==wall)]);
assert.equal(triangles(testScene),originalTriangles);
const entry=detail.entries[0],camera=new THREE.PerspectiveCamera(46,16/9,.1,3000),height=900;
function setPixels(pixels){const z=entry.sphere.radius+entry.windowHeight*camera.projectionMatrix.elements[5]*height/2/pixels;camera.position.copy(entry.sphere.center).add(new THREE.Vector3(0,0,z));camera.lookAt(entry.sphere.center);detail.update(camera,height);}
setPixels(60);assert.equal(entry.level,0);
setPixels(35);assert.equal(entry.level,1);
setPixels(44);assert.equal(entry.level,1,'A small zoom change must not flicker back to full detail');
setPixels(50);assert.equal(entry.level,0);
setPixels(10);assert.equal(entry.level,2);
setPixels(14);assert.equal(entry.level,2);
setPixels(17);assert.equal(entry.level,1);
setPixels(10);detail.update(camera,height*2);assert.equal(entry.level,1,'A taller viewport needs more detail');
camera.zoom=3;camera.updateProjectionMatrix();detail.update(camera,height);assert.equal(entry.level,1);
camera.zoom=6;camera.updateProjectionMatrix();detail.update(camera,height);assert.equal(entry.level,0,'Optical zoom must restore the original geometry');
camera.zoom=1;camera.updateProjectionMatrix();setPixels(30);testScene.updateMatrixWorld(true);
assert.equal(wall.parent,facade,'Structural walls stay outside the detail switch');
assert(triangles(testScene)<originalTriangles/2);
const normal=new THREE.Vector3(0,0,1).transformDirection(facade.matrixWorld);
const point=new THREE.Vector3(-2+.2,2.2+.3,.3).applyMatrix4(facade.matrixWorld);
const ray=new THREE.Raycaster(point.clone().addScaledVector(normal,2),normal.clone().negate());
const hit=ray.intersectObjects(visibleMeshes(testScene)).find(h=>h.object.userData.buildingWindowProxy);
assert(hit,'The replacement panel occupies the original window position');
assert(hit.face.normal.clone().transformDirection(hit.object.matrixWorld).dot(normal)>.999);
const texture=hit.object.material.map,{data,width}=texture.image,index=(Math.floor(hit.uv.y*width)*width+Math.floor(hit.uv.x*width))*4;
assert.deepEqual([...data.slice(index,index+4)],[0x78,0x98,0x9f,255],'The window panel retains its original glazing colour and orientation');
assert(texture.generateMipmaps);assert(texture.image.data.some((v,i)=>i%4===3&&v===0),'Atlas cutouts leave gaps transparent');
facade.visible=false;detail.update(camera,height);assert.equal(visibleMeshes(testScene).length,0);
facade.visible=true;detail.setEnabled(false);assert.equal(triangles(testScene),originalTriangles);

globalThis.document={createElement:()=>({getContext:()=>({fillRect(){},measureText(text){return {width:text.length*16};},strokeText(){},fillText(){}})})};
const exterior=createEscapeExterior(THREE,16/9),layouts=createAerialLayouts(THREE,exterior);
const exclude=[exterior.trees,exterior.terrain,...layouts.visibilityObjects];
const sun=exterior.scene.children.find(o=>o.isDirectionalLight&&o.castShadow);
const states=[[true,false],[false,true],[true,true],[false,false]],before=[];
function surfaces(){
  const totals=new Map();
  for(const o of visibleMeshes(exterior.model)){
    const key=[o.material.id,o.castShadow,o.receiveShadow,o.layers.mask,o.renderOrder].join(':');
    const n=(o.geometry.index?.count??o.geometry.attributes.position.count)/3*(o.isInstancedMesh?o.count:1);
    totals.set(key,(totals.get(key)??0)+n);
  }
  return [...totals].sort((a,b)=>a[0].localeCompare(b[0]));
}
for(const [historic,modern] of states){layouts.setVisible('historic',historic);layouts.setVisible('modern',modern);before.push(surfaces());}
layouts.setVisible('historic',true);layouts.setVisible('modern',false);
const buildingDetail=createBuildingDetail(THREE,exterior.model,{exclude,shadowLight:sun});
assert(buildingDetail.stats.windows>2400&&buildingDetail.stats.parts>35000);
assert(buildingDetail.stats.atlasPages<=4,'Distant windows share a bounded set of atlases');
batchAerialMeshes(THREE,exterior.model,{exclude});cacheAerialTransforms(exterior.scene);
buildingDetail.setEnabled(false);
for(const [i,[historic,modern]] of states.entries()){
  layouts.setVisible('historic',historic);layouts.setVisible('modern',modern);assert.deepEqual(surfaces(),before[i],'Full detail must retain all original surfaces and shadow flags across every layout');
}
layouts.setVisible('historic',true);layouts.setVisible('modern',false);buildingDetail.setEnabled(true);
const shot=sampleLanding(0);exterior.camera.position.set(...shot.position);exterior.camera.lookAt(...shot.target);
const fullTriangles=triangles(exterior.model);buildingDetail.update(exterior.camera,900);
assert(buildingDetail.entries.every(e=>e.level===0),'Shadow invalidation renders the full geometry once');
sun.shadow.needsUpdate=false;buildingDetail.update(exterior.camera,900);
assert.equal(sun.shadow.needsUpdate,false,'LOD transitions must reuse cached shadows');
assert(fullTriangles-triangles(exterior.model)>300000,'Distant building windows remove substantial geometry');
const shared=buildingDetail.entries.find(e=>e.parent===layouts.shared);
exterior.camera.position.set(0,10,58);exterior.camera.lookAt(0,9,19.8);buildingDetail.update(exterior.camera,900);
assert.equal(shared.level,0,'The close 1829 camera restores full building details');
layouts.setVisible('modern',true);buildingDetail.update(exterior.camera,900);
assert(buildingDetail.entries.every(e=>e.level===0),'Layout changes refresh shadows from the full model');
assert.equal(exterior.trees.parent,layouts.shared,'Tree detail remains independent');
delete globalThis.document;
console.log(`PASS: ${buildingDetail.stats.windows} textured windows; close geometry and all layouts preserved; atlas pixels and rotated placement; viewport/zoom detail with hysteresis; static shadows, structural walls and independent trees.`);
