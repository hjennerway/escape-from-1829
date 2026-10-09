import assert from 'node:assert/strict';

// These points were frozen on competing surfaces in the pre-repair estate.
// Probe both authored coverage and the absence of a generated surface, so
// deleting a fascia cannot conceal a hole and a changed triangulation cannot
// move the samples away from the original defect.
export function checkRoofWallFlicker(THREE,model,probes,{visible=false}={}){
 model.updateMatrixWorld(true);const authored=[],fillers=[];
 const inspect=o=>{
  if(!o.isMesh||(!visible&&o.userData.aerialBatch)||o.userData.buildingWindowProxy)return;
  if(o.userData.roofWallClosure){if(o.name.startsWith('Eave closure:')||visible)fillers.push(o);}
  else authored.push(o);
 };
 if(visible)model.traverseVisible(inspect);else model.traverse(inspect);
 const bounds=new Map([...authored,...fillers].map(o=>[o,new THREE.Box3().setFromObject(o)]));
 const ray=new THREE.Raycaster();ray.far=.021;let samples=0;
 for(const probe of probes){
  const point=new THREE.Vector3(...probe.point),normal=new THREE.Vector3(...probe.normal);
  const region=new THREE.Box3().setFromCenterAndSize(point,new THREE.Vector3(.05,.05,.05));
  ray.set(point.clone().addScaledVector(normal,.02),normal.clone().negate());
  const near=list=>list.filter(o=>region.intersectsBox(bounds.get(o)));
  const original=ray.intersectObjects(near(authored),false).filter(h=>Math.abs(h.distance-.02)<.0004);
  assert(original.length,'Retain opaque authored coverage at '+JSON.stringify(probe));
  // Rendering batches combine authored and generated triangles. Count their
  // real visible faces too, using the original authored hit count at each ray.
  if(visible)assert.equal(original.length,probe.authoredHits,'Retained visible face count without a duplicate batched fascia at '+JSON.stringify(probe));
  const hits=ray.intersectObjects(near(fillers),false).filter(h=>Math.abs(h.distance-.02)<.0004);
  assert.equal(hits.length,0,'No competing automatic fascia at '+JSON.stringify(probe)+'; '+hits.map(h=>h.object.name).join(', '));samples++;
 }
 assert.equal(samples,444,'Retain every independently frozen estate overlap probe');
 return samples;
}
