import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import * as THREE from './dist/vendor/three.module.js';
import {indexExactGeometry,createBufferPool} from './dist/geometry-sharing.mjs';
import {closeRoofWallGaps,releaseRoofSupportCache} from './dist/roof-wall-joins.mjs';
import {simplifyKerb,HISTORIC_KERBS} from './dist/historic-roads.mjs';
import {createFurnitureFloor,updateFurnitureDetail} from './dist/furniture-models.mjs';
import {FURNITURE_CATALOG} from './dist/asylum-furniture.mjs';
const geometry=new THREE.BoxGeometry().toNonIndexed(),original=geometry.clone();indexExactGeometry(THREE,geometry);
const expanded=geometry.toNonIndexed();for(const name of Object.keys(original.attributes))assert.deepEqual(expanded.attributes[name].array,original.attributes[name].array,'Exact indexing retains all triangle attribute bits');
const pool=createBufferPool(),a=new Float32Array([0,-0,1]),b=a.slice(),c=new Float32Array([0,0,1]);assert.equal(pool.share(a),pool.share(b));assert.notEqual(pool.share(c),a,'Signed-zero bits are not interchangeable');
assert.notEqual(pool.share(new Uint32Array(a.buffer)),a,'Typed array semantics stay distinct');

const root=new THREE.Group(),roof=new THREE.Mesh(new THREE.PlaneGeometry(3,3),new THREE.MeshStandardMaterial()),support=new THREE.Mesh(new THREE.BoxGeometry(2,2,2),new THREE.MeshStandardMaterial());
roof.name='Test slate roof';roof.rotation.x=-Math.PI/2;roof.position.y=2.4;support.position.y=1;root.add(roof,support);
closeRoofWallGaps(THREE,root);let report=closeRoofWallGaps(THREE,root);assert.equal(report.scannedMeshes,0);assert.equal(report.reusedMeshes,2);
support.position.x=.02;report=closeRoofWallGaps(THREE,root);assert.equal(report.scannedMeshes,1,'Moving supports invalidates cached triangles');
support.geometry.attributes.position.setX(0,1.01);report=closeRoofWallGaps(THREE,root);assert.equal(report.scannedMeshes,1,'Unversioned vertex changes invalidate the cache');
releaseRoofSupportCache(root);assert.equal(closeRoofWallGaps(THREE,root).reusedMeshes,0);

let before=0,after=0;
for(const edge of HISTORIC_KERBS){
 const points=simplifyKerb(edge.points);before+=edge.points.length;after+=points.length;assert.deepEqual(points[0],edge.points[0]);assert.deepEqual(points.at(-1),edge.points.at(-1));
 for(const p of edge.points){let nearest=Infinity;for(let i=1;i<points.length;i++){const a=points[i-1],b=points[i],dx=b[0]-a[0],dz=b[1]-a[1],length=dx*dx+dz*dz,t=length?Math.max(0,Math.min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dz)/length)):0;nearest=Math.min(nearest,Math.hypot(p[0]-a[0]-t*dx,p[1]-a[1]-t*dz));}assert(nearest<=.005000001,'Every authored kerb sample remains within the 5mm bound');}
}
assert(after<before*.75,'Remove redundant kerb sampling');
const scene=new THREE.Scene(),floorGroup=new THREE.Group();scene.add(floorGroup);const chair=FURNITURE_CATALOG.chair;
const items=[0,30].map((x,i)=>({id:'chair-'+i,kind:'chair',roomId:'R'+i,x,y:0,z:0,rotation:0,width:chair.width,height:chair.height,depth:chair.depth})),full=new THREE.BoxGeometry(.624,1.17,.611),distant=new THREE.BoxGeometry(.624,1.17,.611);
const {group,update}=createFurnitureFloor(THREE,floorGroup,{furniture:items,furnitureSeed:1},{chair:[{geometry:full,distantGeometry:distant,material:new THREE.MeshBasicMaterial()}]});assert.equal(group.children.length,2);assert.deepEqual(group.children.flatMap(m=>m.userData.furnitureIds),items.map(i=>i.id));
const camera=new THREE.PerspectiveCamera(60,1,.1,1000);camera.position.set(0,1,2);camera.lookAt(0,1,0);updateFurnitureDetail(THREE,scene,camera,900);assert.equal(group.children[0].geometry,full);
camera.position.z=100;camera.lookAt(0,1,0);updateFurnitureDetail(THREE,scene,camera,900);assert.equal(group.children[0].geometry,distant);camera.zoom=20;camera.updateProjectionMatrix();updateFurnitureDetail(THREE,scene,camera,900);assert.equal(group.children[0].geometry,full,'Optical zoom restores nearby-quality furniture');update();assert.equal(group.children.length,2,'Replay updates replace batches without leaving copies');
const manifest=JSON.parse(await readFile(new URL('./dist/models/furniture/lod-manifest.json',import.meta.url)));assert(manifest.records.every(r=>r.trianglesAfter<r.trianglesBefore*.4&&r.error<=.004));
console.log(`PASS: exact indexing/sharing, mutable instance independence, roof cache invalidation/release, ${before} → ${after} kerb samples within 5mm, room furniture IDs/replay/zoom detail and bounded-error licensed seating.`);
