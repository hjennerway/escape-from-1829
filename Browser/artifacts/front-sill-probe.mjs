import * as THREE from '../dist/vendor/three.module.js';
import {createEscapeExterior} from '../dist/escape-exterior.mjs';
globalThis.document={createElement:()=>({getContext:()=>({fillRect(){},fillText(){},strokeText(){},measureText(t){return {width:t.length*16}}})})};
const e=createEscapeExterior(THREE,1.5);e.model.updateMatrixWorld(true);
const ray=new THREE.Raycaster(),matrix=new THREE.Matrix4();
for(const [x,y,z,dx,dy,dz] of [[28.1,.3,22,0,0,-1],[28.5,.2,22,0,0,-1],[28.5,.35,22,0,0,-1],[28.5,2,19.85,0,-1,0],[28.5,.24,22,0,0,-1],[28.8,.4,22,0,0,-1]]){
 ray.set(new THREE.Vector3(x,y,z),new THREE.Vector3(dx,dy,dz));
 console.log({origin:[x,y,z],hits:ray.intersectObject(e.model,true).slice(0,8).map(h=>{
  const o=h.object,info={name:o.name,color:o.material.color?.getHexString(),point:h.point.toArray(),distance:h.distance,instance:h.instanceId};
  if(o.isInstancedMesh){o.getMatrixAt(h.instanceId,matrix);info.bounds=new THREE.Box3(new THREE.Vector3(-.5,-.5,-.5),new THREE.Vector3(.5,.5,.5)).applyMatrix4(matrix).applyMatrix4(o.matrixWorld);}
  return info;
 })});
}
