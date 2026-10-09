import * as THREE from '../../dist/vendor/three.module.js';
import {createEscapeExterior} from '../../dist/escape-exterior.mjs';
import {FRONT_CORNER_OUTLINE} from '../../dist/front-inside-corners.mjs';
globalThis.document={createElement:()=>({getContext:()=>({fillRect(){}})})};
const {model}=createEscapeExterior(THREE,1.6);model.updateMatrixWorld(true);
const ray=new THREE.Raycaster();ray.far=.06;
const nearby=[],matrix=new THREE.Matrix4(),world=new THREE.Matrix4();
const near=b=>b.max.y>0&&b.min.y<14&&b.max.z>15.4&&b.min.z<21.2&&((b.max.x>28.9&&b.min.x<34)||(b.max.x> -34&&b.min.x< -28.9));
model.traverse(o=>{
 if(!o.isMesh)return;
 if(o.isInstancedMesh){
  o.geometry.computeBoundingBox();
  for(let i=0;i<o.count;i++){
   o.getMatrixAt(i,matrix);world.multiplyMatrices(o.matrixWorld,matrix);
   if(!near(o.geometry.boundingBox.clone().applyMatrix4(world)))continue;
   const copy=new THREE.Mesh(o.geometry,o.material);copy.matrixAutoUpdate=false;copy.matrixWorld.copy(world);copy.name=o.name+' instance '+i;nearby.push(copy);
  }
 }else if(near(new THREE.Box3().setFromObject(o)))nearby.push(o);
});
const found=new Map();
for(const side of [-1,1])for(let i=0;i<5;i++){
 const a=FRONT_CORNER_OUTLINE[i],b=FRONT_CORNER_OUTLINE[i+1],dx=side*(b[0]-a[0]),dz=b[1]-a[1],len=Math.hypot(dx,dz),nx=-side*dz/len,nz=side*dx/len;
 for(let u=.03;u<len-.02;u+=.055)for(let y=.4;y<14;y+=.055){
  const x=side*a[0]+dx*u/len,z=a[1]+dz*u/len;
  ray.set(new THREE.Vector3(x+nx*.03,y,z+nz*.03),new THREE.Vector3(-nx,0,-nz));
  const hits=ray.intersectObjects(nearby,false).filter(h=>Math.abs(h.distance-.03)<.026&&h.object.material.color.getHex()!==0xb3a5a0);
  for(const h of hits){
   const key=[side,i,h.object.name,h.object.material.color.getHexString(),h.instanceId??''].join('|');
   if(!found.has(key))found.set(key,{count:0,point:h.point.toArray(),name:h.object.name,colour:h.object.material.color.getHexString(),instance:h.instanceId,bounds:new THREE.Box3().setFromObject(h.object)});
   found.get(key).count++;
  }
 }
}
console.log(JSON.stringify([...found],null,2));
