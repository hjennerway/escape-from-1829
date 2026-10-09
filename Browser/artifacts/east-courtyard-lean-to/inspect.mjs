import * as THREE from '../../dist/vendor/three.module.js';
import {createEscapeExterior} from '../../dist/escape-exterior.mjs';
globalThis.document={createElement:()=>({getContext:()=>({fillRect(){}})})};
const {model}=createEscapeExterior(THREE,1.5);model.updateMatrixWorld(true);
const ray=new THREE.Raycaster();
for(const [x,y,z,dx,dy,dz] of [[41.3,5.8,3,0,0,1],[41.3,5.4,3,0,0,1],[43.8,5,3,0,0,1],[38.8,6,3,0,0,1]]){
 ray.set(new THREE.Vector3(x,y,z),new THREE.Vector3(dx,dy,dz));
 console.log([x,y,z],ray.intersectObject(model,true).slice(0,6).map(h=>({name:h.object.name,p:h.point.toArray(),mat:h.object.material.color?.getHexString()})));
}
