import * as THREE from '../../dist/vendor/three.module.js';
import {createEscapeExterior} from '../../dist/escape-exterior.mjs';
import {FRONT_CORNER_OUTLINE} from '../../dist/front-inside-corners.mjs';
globalThis.document={createElement:()=>({getContext:()=>({fillRect(){}})})};
const {model}=createEscapeExterior(THREE,1.6);model.updateMatrixWorld(true);
const summary=[];
for(const side of [-1,1])for(let i=0;i<5;i++){
 const a=FRONT_CORNER_OUTLINE[i],b=FRONT_CORNER_OUTLINE[i+1],dx=side*(b[0]-a[0]),dz=b[1]-a[1],length=Math.hypot(dx,dz),nx=-side*dz/length,nz=side*dx/length;
 const hits=[];
 model.traverse(o=>{if(!o.isMesh||o.isInstancedMesh||o.name!=='Front inside corner trimmed existing detail'||Math.min(o.material.color.r,o.material.color.g,o.material.color.b)<.3)return;
  const p=o.geometry.attributes.position;
  for(let j=0;j<p.count;j++){
   const v=new THREE.Vector3().fromBufferAttribute(p,j).applyMatrix4(o.matrixWorld),ux=v.x-side*a[0],uz=v.z-a[1],t=(ux*dx+uz*dz)/(length*length),distance=ux*nx+uz*nz;
   if(t>.1&&t<.9&&v.y>3&&distance>-.041&&distance<.01)hits.push({color:o.material.color.getHexString(),y:v.y,distance,t});
  }
 });summary.push({side,i,count:hits.length,examples:hits.slice(0,4)});
}
console.log(JSON.stringify(summary,null,2));

