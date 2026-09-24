import assert from 'node:assert/strict';
import * as THREE from './dist/vendor/three.module.js';
import {createEscapeExterior} from './dist/escape-exterior.mjs';
import {createAerialLayouts} from './dist/aerial-layouts.mjs';
import {batchAerialMeshes,cacheAerialTransforms} from './dist/aerial-performance.mjs';
import {sampleLanding} from './dist/aerial-controls.mjs';
import {updateRoadLabels} from './dist/road-labels.mjs';

globalThis.document={createElement:()=>({getContext:()=>({fillRect(){},measureText(text){return {width:text.length*16};},strokeText(){},fillText(){}})})};
const exterior=createEscapeExterior(THREE,16/9),layouts=createAerialLayouts(THREE,exterior);
const trees=exterior.trees.children.filter(o=>o.userData.adminPineTree||o.userData.beechTree||o.userData.oakTree||o.userData.willowTree);
assert.equal(trees.length,60);
for(const key of ['adminPineTree','beechTree','oakTree','willowTree']){
  const family=trees.filter(o=>o.userData[key]),template=family[0],templateMeshes=[];
  template.traverse(o=>{if(o.isMesh)templateMeshes.push(o);});
  for(const [index,tree] of family.entries()){
    const meshes=[];tree.traverse(o=>{if(o.isMesh)meshes.push(o);});
    assert.equal(meshes.length,templateMeshes.length);
    for(let i=0;i<meshes.length;i++){
      assert.equal(meshes[i].geometry,templateMeshes[i].geometry);
      if(meshes[i].isInstancedMesh)assert.equal(meshes[i].instanceMatrix,templateMeshes[i].instanceMatrix,'Whole-tree copies must share GPU transform buffers');
    }
    const spec=tree.userData[key],base=template.userData[key];
    assert.equal(tree.position.x,spec.x);assert.equal(tree.position.z,spec.z);
    assert.equal(tree.scale.y,spec.height/base.height);assert.equal(tree.scale.x,spec.radius/base.radius);
    if(index)assert.notEqual(tree.rotation.y,template.rotation.y);
  }
}
const beeches=trees.filter(o=>o.userData.frontLawnTree),leafBatch=tree=>tree.getObjectByProperty('isLOD',true).levels[0].object;
assert.notDeepEqual(leafBatch(beeches[0]).instanceColor.array,leafBatch(beeches[1]).instanceColor.array,'Copper and green foliage retain different colours');
exterior.scene.updateMatrixWorld(true);
const lod=trees[0].getObjectByProperty('isLOD',true),position=new THREE.Vector3().setFromMatrixPosition(lod.matrixWorld),camera=exterior.camera;
function distance(value){camera.position.copy(position).add(new THREE.Vector3(0,0,value));camera.updateMatrixWorld();lod.update(camera);}
distance(30);assert.equal(lod.getCurrentLevel(),0);
distance(120);assert.equal(lod.getCurrentLevel(),1);
distance(220);assert.equal(lod.getCurrentLevel(),2);
distance(195);assert.equal(lod.getCurrentLevel(),2,'Hysteresis prevents flickering near a boundary');
distance(170);assert.equal(lod.getCurrentLevel(),1);
distance(30);assert.equal(lod.getCurrentLevel(),0,'Close views restore full foliage');
assert(lod.levels[2].object.count<lod.levels[0].object.count/11);

// Every material retains exactly the same number of triangles in all layouts.
// This also catches a toggled source being accidentally shown over its batch.
function surfaces(){
  const totals=new Map();
  exterior.model.traverseVisible(o=>{
    if(!o.isMesh)return;
    const key=[o.material.id,o.castShadow,o.receiveShadow,o.layers.mask,o.renderOrder].join(':');
    const triangles=(o.geometry.index?.count??o.geometry.attributes.position.count)/3*(o.isInstancedMesh?o.count:1);
    totals.set(key,(totals.get(key)??0)+triangles);
  });
  return [...totals].sort((a,b)=>a[0].localeCompare(b[0]));
}
const states=[[true,false],[false,true],[true,true],[false,false]],before=[];
for(const [historic,modern] of states){layouts.setVisible('historic',historic);layouts.setVisible('modern',modern);before.push(surfaces());}
layouts.setVisible('historic',true);layouts.setVisible('modern',false);
const stats=batchAerialMeshes(THREE,exterior.model,{exclude:[exterior.trees,exterior.terrain,...layouts.visibilityObjects]});
assert(stats.sourceMeshes-stats.batches>5000,'Aerial batching should eliminate thousands of draw submissions');
for(const [index,[historic,modern]] of states.entries()){
  layouts.setVisible('historic',historic);layouts.setVisible('modern',modern);assert.deepEqual(surfaces(),before[index]);
}
assert.deepEqual(batchAerialMeshes(THREE,exterior.model,{exclude:[exterior.trees,exterior.terrain,...layouts.visibilityObjects]}),{sourceMeshes:0,batches:0},'Batch compilation is idempotent');
layouts.setVisible('historic',true);layouts.setVisible('modern',true);
cacheAerialTransforms(exterior.scene);
const matrices=[];exterior.model.traverse(o=>{if(!o.isSprite)matrices.push([o,o.matrixWorld.clone()]);});
let compositions=0;const update=THREE.Object3D.prototype.updateMatrix;
THREE.Object3D.prototype.updateMatrix=function(){compositions++;return update.call(this);};
try{exterior.scene.updateMatrixWorld();}finally{THREE.Object3D.prototype.updateMatrix=update;}
assert(compositions<=15,'Static buildings and trees must not recompose transforms during camera movement');
for(const [object,matrix] of matrices)assert(object.matrixWorld.equals(matrix));
const shot=sampleLanding(0);camera.position.set(...shot.position);camera.lookAt(...shot.target);camera.updateMatrixWorld();
exterior.trees.traverse(o=>{if(o.isLOD)o.update(camera);});
let treeTriangles=0;exterior.trees.traverseVisible(o=>{if(o.isMesh)treeTriangles+=(o.geometry.index?.count??o.geometry.attributes.position.count)/3*(o.isInstancedMesh?o.count:1);});
// Added KML oaks allow 11k triangles each at distant detail; Pine14 allows 10k.
assert(treeTriangles<180000+32*11000+3*10000+8*6500,'Distant trees should submit substantially less geometry');
updateRoadLabels(THREE,layouts.roads,camera,1300,900);exterior.scene.updateMatrixWorld();
let labels=0;layouts.roads.traverseVisible(o=>{if(o.isSprite){labels++;assert(o.matrixAutoUpdate);assert(o.matrixWorld.elements.every(Number.isFinite));assert(o.scale.y<.1);}});
assert(labels>0,'Camera-facing labels remain dynamic after static transform caching');
exterior.trees.visible=false;let visibleTreeMeshes=0;exterior.trees.traverseVisible(o=>{if(o.isMesh)visibleTreeMeshes++;});assert.equal(visibleTreeMeshes,0);
delete globalThis.document;
console.log(`PASS: shared tree buffers, colours and placement; distance detail and hysteresis; ${stats.sourceMeshes} static meshes compiled into ${stats.batches} batches; all layout surfaces retained; cached transforms and dynamic labels; ${treeTriangles} default-view tree triangles.`);
