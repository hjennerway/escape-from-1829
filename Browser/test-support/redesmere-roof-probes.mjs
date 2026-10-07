import assert from 'node:assert/strict';

export function checkRedesmereRoofProtrusions(THREE,model){
 model.updateMatrixWorld(true);
 const ray=new THREE.Raycaster(),meshes=[],roofs=[];
 model.traverse(o=>{if(!o.isMesh||o.userData.aerialBatch)return;meshes.push(o);if(o.material?.userData.roofTilePixels&&!o.userData.roofWallClosure)roofs.push(o);});
 // Frozen points on the former projecting brick strip and the entrance trim.
 for(const x of [58.3,59.5,60.7,62,63.1])for(const z of [-32.97,-32.87,-32.77]){
  ray.set(new THREE.Vector3(x,30,z),new THREE.Vector3(0,-1,0));
  assert(ray.intersectObjects(meshes,false)[0]?.object.material?.userData.roofTilePixels,'The rear eaves must expose slate rather than a brick parapet remnant');
 }
 for(const z of [-17.7,-6]){
  ray.set(new THREE.Vector3(94.64,30,z),new THREE.Vector3(0,-1,0));
  const roof=ray.intersectObjects(roofs,false)[0];
  const brick=ray.intersectObjects(meshes.filter(o=>o.material?.color?.getHex()===0xb3a5a0),false)[0];
  assert(roof&&(!brick||brick.point.y<=roof.point.y+.002),'Main-range brick trim must not emerge through the lower entrance hip');
 }
 // Ground rays that formerly struck the white return above the lean-to.
 for(const point of [[83.8,9.34032,-30.88748],[83.8,9.28984,-30.59843]]){
  const origin=new THREE.Vector3(77,1.8,-25),target=new THREE.Vector3(...point);
  ray.set(origin,target.clone().sub(origin).normalize());
  const hit=ray.intersectObjects(meshes,false)[0];
  assert(hit&&hit.distance<origin.distanceTo(target)-.1,'The floating upper return is enclosed by the joined stair roof and wall');
 }
 let checked=0;
 const instance=new THREE.Matrix4(),matrix=new THREE.Matrix4();
 for(const o of meshes){
  if(o.material?.color?.getHex()!==0xe1e3dc||o.userData.roofWallClosure)continue;
  const p=o.geometry.attributes.position,index=o.geometry.index;
  for(let item=0;item<(o.isInstancedMesh?o.count:1);item++){
   if(o.isInstancedMesh){o.getMatrixAt(item,instance);matrix.multiplyMatrices(o.matrixWorld,instance);}else matrix.copy(o.matrixWorld);
   for(let i=0;i<(index?.count??p.count);i+=3){
    const v=[0,1,2].map(j=>new THREE.Vector3().fromBufferAttribute(p,index?index.getX(i+j):i+j).applyMatrix4(matrix));
    const n=v[1].clone().sub(v[0]).cross(v[2].clone().sub(v[0])).multiplyScalar(Math.sign(matrix.determinant()));
    if(n.y<=.0001)continue;
    for(const point of [...v,v[0].clone().add(v[1]).add(v[2]).multiplyScalar(1/3)]){
     const garden=point.x>=69.59&&point.x<=70.16&&point.z>=4.7&&point.z<=25.2&&point.y>=14;
     const stair=o.name==='Rear court white stair enclosure'&&point.y>7;
     if(!garden&&!stair)continue;
     // Float32 instance translations can put a nominal edge a few microns
     // outside the roof triangle. Probe just inside its authored boundary.
     ray.set(new THREE.Vector3(garden?Math.min(point.x,70.15-.00002):point.x,30,point.z),new THREE.Vector3(0,-1,0));
     const hit=ray.intersectObjects(roofs,false)[0];
     assert(hit&&point.y<=hit.point.y+.002,'Every sampled stair-wall and garden-cornice top stays beneath its slate: '+JSON.stringify({name:o.name,item,point:point.toArray(),roof:hit?.object.name,roofY:hit?.point.y}));checked++;
    }
   }
  }
 }
 assert(checked>=60,'Retain broad coverage of the stair and stepped garden cornice');
 console.log(`PASS: Redesmere roof protrusions removed; ${checked} render-top probes remain beneath slate.`);
}
