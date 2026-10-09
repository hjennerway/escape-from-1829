import assert from 'node:assert/strict';

// Sample each photographed light, above and below its high transom. Checking
// the real first intersection catches wall/filler/trim occlusion, including
// the nonuniformly scaled workshop copy and the rotated mortuary.
export function checkBlueRoofLanternPanes(THREE,group,openings){
 group.updateWorldMatrix(true,true);
 const meshes=[];group.traverse(o=>{if(o.isMesh&&!o.userData.aerialBatch&&!o.userData.buildingWindowProxy)meshes.push(o);});
 const ray=new THREE.Raycaster();let panes=0;
 for(const o of meshes.filter(o=>o.name.endsWith('pitched soffit'))){
  const p=o.geometry.attributes.position;
  for(let i=0;i<p.count;i+=3){
   const centre=new THREE.Vector3();
   for(let j=0;j<3;j++)centre.add(new THREE.Vector3().fromBufferAttribute(p,i+j).applyMatrix4(o.matrixWorld));
   centre.multiplyScalar(1/3);centre.y-=.01;
   ray.set(centre,new THREE.Vector3(0,1,0));ray.far=.02;
   assert(ray.intersectObject(o,false).length,'Overhanging slate has an opaque underside: '+o.name);
  }
 }
 for(const o of openings){
  const out=new THREE.Vector3(Math.sin(o.r),0,Math.cos(o.r)).transformDirection(group.matrixWorld);
  for(const f of [-.375,-.125,.125,.375])for(const v of [-.2,.36]){
   const p=new THREE.Vector3(o.x+Math.cos(o.r)*o.w*f,o.y+o.h*v,o.z-Math.sin(o.r)*o.w*f).applyMatrix4(group.matrixWorld);
   ray.set(p.clone().addScaledVector(out,.5),out.clone().negate());ray.far=.6;
   const hits=ray.intersectObjects(meshes,false);
   assert(hits[0]?.object.material.userData.windowGlass,'Unobstructed lantern pane: '+o.label+' '+f+','+v);
   panes++;
  }
 }
 return panes;
}
