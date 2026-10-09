import assert from 'node:assert/strict';

// Probe the actual authored brick faces. A generated fascia on the same
// plane competes in the depth buffer, even if one screenshot looks clean.
export function checkFrontCornerFlicker(THREE,model){
 model.updateMatrixWorld(true);
 const walls=[],fillers=[];
 model.traverse(o=>{
  if(!o.isMesh||o.userData.aerialBatch)return;
  if(/^(East|West) inside corner roof junction \d$/.test(o.name))walls.push(o);
  if(o.userData.roofWallClosure&&o.name.startsWith('Eave closure:'))fillers.push(o);
 });
 // The compiled timeline can split a named wall into multiple sections.
 assert.equal(new Set(walls.map(o=>o.name)).size,9,'Survey both front-wing roof junctions');
 const ray=new THREE.Raycaster();ray.far=.038;
 let probes=0;
 for(const wall of walls){
  const p=wall.geometry.attributes.position,index=wall.geometry.index;
  const bounds=new THREE.Box3().setFromObject(wall).expandByScalar(.02);
  const nearby=fillers.filter(o=>bounds.intersectsBox(new THREE.Box3().setFromObject(o)));
  for(let i=0;i<(index?.count??p.count);i+=3){
   const [a,b,c]=[0,1,2].map(j=>new THREE.Vector3().fromBufferAttribute(p,index?index.getX(i+j):i+j).applyMatrix4(wall.matrixWorld));
   const normal=b.clone().sub(a).cross(c.clone().sub(a));
   if(normal.lengthSq()<1e-12)continue;normal.normalize();
   for(const weights of [[.2,.3,.5],[.55,.35,.1],[.15,.7,.15]]){
    const point=a.clone().multiplyScalar(weights[0]).addScaledVector(b,weights[1]).addScaledVector(c,weights[2]);
    ray.set(point.clone().addScaledVector(normal,.02),normal.clone().negate());
    assert(ray.intersectObject(wall,false).length,'Sample lies on the retained brick closure');
    const hits=ray.intersectObjects(nearby,false);
    assert.equal(hits.length,0,'No automatic fascia competes with '+wall.name+' at '+JSON.stringify(point.toArray())+'; '+hits.map(h=>h.object.name).join(', '));
    probes++;
   }
  }
 }
 assert(probes>1000,'Cover the full sampled brick roof boundary');
 return probes;
}
