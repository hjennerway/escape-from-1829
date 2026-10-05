import * as THREE from '../../dist/vendor/three.module.js';
import {createEscapeExterior} from '../../dist/escape-exterior.mjs';
globalThis.document={createElement:()=>({getContext:()=>({fillRect(){}})})};
const e=createEscapeExterior(THREE,1400/950),ray=new THREE.Raycaster();
e.camera.position.set(-48,31,-18);e.camera.up.set(0,1,0);e.camera.fov=55;e.camera.lookAt(-54,12,10);e.camera.updateProjectionMatrix();e.camera.updateMatrixWorld();e.model.updateMatrixWorld(true);
for(const [x,y] of [[1057,415],[1061,425],[1051,423],[1068,419],[765,485],[764,478],[760,490]]){
 ray.setFromCamera(new THREE.Vector2(x/1400*2-1,1-y/950*2),e.camera);
 console.log(JSON.stringify({pixel:[x,y],hits:ray.intersectObject(e.model,true).slice(0,3).map(h=>({name:h.object.name,point:h.point.toArray(),material:h.object.material.color?.getHexString()}))}));
}
