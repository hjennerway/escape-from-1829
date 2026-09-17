import * as THREE from '../dist/vendor/three.module.js';
import {addAdminPineTrees} from '../dist/admin-pine-trees.mjs';
import {VIVIENNE_LANE} from '../dist/road-centerlines.mjs';

const trees=new THREE.Group();
addAdminPineTrees(THREE,trees);trees.updateMatrixWorld(true);
const vertex=new THREE.Vector3(),matrix=new THREE.Matrix4();
for(const name of ['Pine1','Pine2','Pine12']){
  const tree=trees.getObjectByName(name);let clearance=Infinity;
  tree.traverse(object=>{
    if(!object.isMesh)return;
    const positions=object.geometry.attributes.position;
    for(let i=0;i<(object.isInstancedMesh?object.count:1);i++){
      if(object.isInstancedMesh){object.getMatrixAt(i,matrix);matrix.premultiply(object.matrixWorld);}
      else matrix.copy(object.matrixWorld);
      for(let j=0;j<positions.count;j++){
        vertex.fromBufferAttribute(positions,j).applyMatrix4(matrix);
        for(let k=9;k<=11;k++){
          const a=VIVIENNE_LANE[k-1],b=VIVIENNE_LANE[k];
          const dx=b[0]-a[0],dz=b[1]-a[1],length=Math.hypot(dx,dz);
          const t=((vertex.x-a[0])*dx+(vertex.z-a[1])*dz)/length**2;
          if(t>=0&&t<=1)clearance=Math.min(clearance,((vertex.x-a[0])*dz-(vertex.z-a[1])*dx)/length-3.6);
        }
      }
    }
  });
  console.log(name,clearance);
}
