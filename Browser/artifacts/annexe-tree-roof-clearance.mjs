import * as THREE from '../dist/vendor/three.module.js';
import {createEscapeExterior} from '../dist/escape-exterior.mjs';
globalThis.document={createElement:()=>({getContext:()=>({fillRect(){},measureText(t){return {width:t.length*16};},strokeText(){},fillText(){}})})};
const e=createEscapeExterior(THREE,1),tree=e.trees.getObjectByName('Oak24');
e.model.updateMatrixWorld(true);
const roofs=[];e.annexe.traverse(o=>{if(o.isMesh&&o.name.toLowerCase().includes('roof')&&new THREE.Box3().setFromObject(o).distanceToPoint(tree.position)<25){o.geometry.computeBoundingBox();roofs.push(o);}});
for(const scale of [1,.8,.75,.7,.65,.6,.55,.5]){
 tree.scale.setScalar(scale);tree.updateMatrix();e.model.updateMatrixWorld(true);
 const hits=new Map(),instance=new THREE.Matrix4(),matrix=new THREE.Matrix4(),box=new THREE.Box3();
 for(const roof of roofs){const inverse=roof.matrixWorld.clone().invert();tree.traverse(o=>{if(!o.isMesh)return;o.geometry.computeBoundingBox();
  for(let i=0;i<(o.isInstancedMesh?o.count:1);i++){
   matrix.multiplyMatrices(inverse,o.matrixWorld);if(o.isInstancedMesh){o.getMatrixAt(i,instance);matrix.multiply(instance);}
   box.copy(o.geometry.boundingBox).applyMatrix4(matrix);
   if(box.intersectsBox(roof.geometry.boundingBox))hits.set(roof.name,(hits.get(roof.name)||0)+1);
  }
 });}
 console.log(JSON.stringify({scale,position:tree.position.toArray(),hits:Object.fromEntries(hits)}));
}
