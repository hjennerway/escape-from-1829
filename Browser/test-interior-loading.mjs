import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {gunzipSync} from 'node:zlib';
import * as THREE from './dist/vendor/three.module.js';
import {buildAsylumLayout} from './dist/asylum-layout.mjs';
import {interiorSections,sectionAt} from './dist/interior-sections.mjs';
import {decodeModel,deserializeScene} from './dist/model-binary.mjs';
import {asylumArchitectureMaterials} from './dist/asylum-architecture.mjs';
import {cellPaddingMaterial} from './dist/padded-cell-models.mjs';
import {buildAsylumArchitecture} from './dist/asylum-architecture.mjs';
const floors=buildAsylumLayout(JSON.parse(await readFile(new URL('./dist/asylum-plan.json',import.meta.url)))).floors;
const sections=interiorSections(floors);assert.equal(sections.length,10);
for(const floor of floors){
 const parts=sections.filter(s=>s.floor===floor.id);assert.equal(parts[0].minX,-Infinity);assert.equal(parts.at(-1).maxX,Infinity);
 for(let i=1;i<parts.length;i++)assert.equal(parts[i-1].maxX,parts[i].minX);
 for(const exit of floor.exits)assert(sectionAt(sections,{...exit.inside,floor:floor.id}));
 for(const stair of floor.stairs)for(const pair of stair.connections)for(const id of pair)assert(sectionAt(sections,{x:stair.label[0],floor:id}));
}
const manifest=JSON.parse(await readFile(new URL('./dist/compiled/interior/manifest.json',import.meta.url)));assert.equal(manifest.sections.length,10);
const restoredFloors=floors.map(()=>new THREE.Group());
for(const record of manifest.sections){
 const bytes=gunzipSync(await readFile(new URL('./dist/compiled/interior/'+record.file,import.meta.url))),data=decodeModel(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength));
 const floor=floors[record.floor],library={...asylumArchitectureMaterials(THREE,floor,null),Padding:cellPaddingMaterial(THREE)},sharedMaterials=Object.fromEntries(data.materialKeys.map(([id,kind])=>[id,library[kind]??new THREE.MeshBasicMaterial()]));
 const scene=deserializeScene(THREE,data.scene,{sharedMaterials}).scene,section=sections.find(s=>s.id===record.id);let meshes=0;
 scene.updateMatrixWorld(true);scene.traverse(o=>{if(!o.isMesh)return;meshes++;assert(o.material,'Every mesh has a restored material');if(!o.isInstancedMesh){const b=new THREE.Box3().setFromObject(o);assert(b.min.x>=section.minX-1e-4&&b.max.x<=section.maxX+1e-4,'Geometry stays inside its section');}});assert(meshes>0);
 restoredFloors[record.floor].add(scene);
}
function surfaceArea(root){let area=0;const a=new THREE.Vector3(),b=new THREE.Vector3(),c=new THREE.Vector3(),matrix=new THREE.Matrix4(),world=new THREE.Matrix4();root.updateMatrixWorld(true);root.traverse(o=>{if(!o.isMesh)return;const p=o.geometry.attributes.position,index=o.geometry.index,count=index?.count??p.count;for(let instance=0;instance<(o.isInstancedMesh?o.count:1);instance++){world.copy(o.matrixWorld);if(o.isInstancedMesh){o.getMatrixAt(instance,matrix);world.multiply(matrix);}for(let i=0;i<count;i+=3){a.fromBufferAttribute(p,index?index.getX(i):i).applyMatrix4(world);b.fromBufferAttribute(p,index?index.getX(i+1):i+1).applyMatrix4(world);c.fromBufferAttribute(p,index?index.getX(i+2):i+2).applyMatrix4(world);area+=b.sub(a).cross(c.sub(a)).length()/2;}}});return area;}
for(const floor of floors){const source=new THREE.Group();buildAsylumArchitecture(THREE,source,floor);const before=surfaceArea(source),after=surfaceArea(restoredFloors[floor.id]);assert(Math.abs(before-after)/before<1e-5,`Floor ${floor.id}: clipped sections preserve complete source surface area (${before} versus ${after})`);}
console.log('PASS: ten contiguous sections, every entrance/stair assigned, compiled bounds/materials and complete source surface-area preservation.');
