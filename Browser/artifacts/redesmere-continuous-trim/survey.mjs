import * as THREE from '../../dist/vendor/three.module.js';
import {createEscapeExterior} from '../../dist/escape-exterior.mjs';
import {writeFileSync} from 'node:fs';
globalThis.document={createElement:()=>({getContext:()=>({fillRect(){}})})};
const {model}=createEscapeExterior(THREE,1.5); model.updateMatrixWorld(true);
const meshes=[],roofs=[]; model.traverse(o=>{if(o.isMesh&&!o.userData.roofWallClosure){meshes.push(o);if(o.material?.userData.roofTilePixels)roofs.push(o);}});
const ray=new THREE.Raycaster(),p=new THREE.Vector3(),m=new THREE.Matrix4(),w=new THREE.Matrix4(),bad=[];
for(const o of meshes){if(o.material?.color?.getHex()!==0xe1e3dc)continue;
for(let n=0;n<(o.isInstancedMesh?o.count:1);n++){
if(o.isInstancedMesh){o.getMatrixAt(n,m);w.multiplyMatrices(o.matrixWorld,m);}else w.copy(o.matrixWorld);
const pos=o.geometry.attributes.position;
for(let i=0;i<pos.count;i++){p.fromBufferAttribute(pos,i).applyMatrix4(w);if(p.x<57||p.x>101||p.z< -47||p.z>22.5||p.y<8.9||p.y>9.55)continue;
ray.set(new THREE.Vector3(p.x,20,p.z),new THREE.Vector3(0,-1,0));const hit=ray.intersectObjects(roofs,false)[0];if(hit&&p.y>hit.point.y+.002)bad.push({name:o.name,instance:n,point:p.toArray(),roofY:hit.point.y,roof:hit.object.name});
}}}
writeFileSync(new URL('trim-survey.json',import.meta.url),JSON.stringify(bad,null,2));console.log(JSON.stringify({violations:bad.length,samples:bad.slice(0,12)}));
