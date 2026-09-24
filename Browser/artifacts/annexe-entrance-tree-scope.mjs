import * as THREE from '../dist/vendor/three.module.js';
import {createEscapeExterior} from '../dist/escape-exterior.mjs';
import {jarmanProtected} from './jarman-scope.mjs';
import {leightonProtected} from './leighton-scope.mjs';
globalThis.document={createElement:()=>({getContext:()=>({fillRect(){}})})};
const e=createEscapeExterior(THREE,1.5);
const snapshot=()=>({jarman:jarmanProtected(THREE,e.model),leighton:leightonProtected(THREE,e.model)});
const original=snapshot(),target=e.model.getObjectByName('Annexe roadside tree 4');
if(target){
 target.removeFromParent();
 e.model.traverse(o=>{if(!o.isInstancedMesh||!o.userData.treeIds)return;let n=0;const matrix=new THREE.Matrix4();for(let i=0;i<o.count;i++){if(o.userData.treeIds[i]===target.uuid)continue;o.getMatrixAt(i,matrix);o.setMatrixAt(n++,matrix);}o.count=n;});
}
console.log(JSON.stringify({original,withoutMarkedTree:snapshot()}));
