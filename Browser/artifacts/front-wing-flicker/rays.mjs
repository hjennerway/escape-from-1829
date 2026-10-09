import * as THREE from '../../dist/vendor/three.module.js';
import {createEscapeExterior} from '../../dist/escape-exterior.mjs';
globalThis.document={createElement:()=>({getContext:()=>({fillRect(){}})})};
const {model,camera}=createEscapeExterior(THREE,1600/900);model.updateMatrixWorld(true);
camera.position.set(22,1.8,28);camera.lookAt(31.5,7.5,20);camera.fov=66;camera.updateProjectionMatrix();camera.updateMatrixWorld(true);
const ray=new THREE.Raycaster();
for(const [x,y] of [[755,450],[756,458],[776,426],[840,500],[844,570],[860,395],[750,475]]){
 ray.setFromCamera(new THREE.Vector2(x/800-1,1-y/450),camera);
 const hits=ray.intersectObject(model,true).slice(0,7).map(h=>({point:h.point.toArray(),distance:h.distance,name:h.object.name,colour:h.object.material.color.getHexString(),face:h.faceIndex,instance:h.instanceId}));
 console.log(JSON.stringify({pixel:[x,y],hits},null,2));
}
