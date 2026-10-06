import * as THREE from '../../dist/vendor/three.module.js';
import {createEscapeExterior} from '../../dist/escape-exterior.mjs';
globalThis.document={createElement:()=>({getContext:()=>({fillRect(){}})})};
const {model}=createEscapeExterior(THREE,1.6);model.updateMatrixWorld(true);
const ray=new THREE.Raycaster();
for(const [origin,direction] of [
 [[8,8,21],[0,0,-1]],[[10,8,21],[0,0,-1]],[[8,11,21],[0,0,-1]],
 [[8,6,18],[-1,0,0]],[[8,6,17.15],[-1,0,0]],
 [[-8,8,21],[0,0,-1]],[[-8,6,18],[1,0,0]]
]){
 ray.set(new THREE.Vector3(...origin),new THREE.Vector3(...direction));ray.far=5;
 console.log(JSON.stringify({origin,direction,hits:ray.intersectObject(model,true).map(h=>({name:h.object.name,id:h.object.id,instance:h.instanceId,point:h.point.toArray(),distance:h.distance,colour:h.object.material.color.getHexString(),uv:h.uv?.toArray(),geometry:h.object.geometry.type}))}));
}
