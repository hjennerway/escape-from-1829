import {readFileSync,writeFileSync} from 'node:fs';
const file='Browser/test-redesmere-garden.mjs';
const checks=`
// The marked low-range join must have only one exposed wall plane. White
// foundation/trim and the taller service room used to overlap this brick face.
for(const z of [10.1,10.6,11.4])for(const y of [1,3.5,4.04,4.3]){
  ray.set(new THREE.Vector3(76,y,z),new THREE.Vector3(1,0,0));
  const hits=ray.intersectObject(model,true);
  assert.equal(hits[0]?.object.name,'Redesmere windowless brick end range','The low range has an uninterrupted brick side');
  const planes=new Set(hits.filter(hit=>Math.abs(hit.point.x-79.55)<.001).map(hit=>hit.object.uuid+':'+hit.instanceId));
  assert.equal(planes.size,1,'No coplanar service wall or white base may flicker through the brick');
}
const gravel=model.getObjectByName('East wing path to Redesmere courtyard');
function groundAt(x,z){
  ray.set(new THREE.Vector3(x,.7,z),new THREE.Vector3(0,-1,0));
  return ray.intersectObject(model,true)[0];
}
for(const [x,z] of [[42,18],[43.8,18.7],[44,24],[48.7,29.5],[60,29.5],[73.6,30.4],[76,30.4],[79.4,30.4],[76,13]]){
  const hit=groundAt(x,z);
  assert.equal(hit?.object,gravel,'The filled recess, cross-walk, square corner and passage are one gravel surface');
  assert(Math.abs(hit.point.y-.28)<1e-6,'Joined gravel remains level');
}
for(const x of [48,60,73.6,76,79.4]){
  assert.equal(groundAt(x,30.5)?.object,gravel,'The complete cross-walk ends at the same straight edge');
  assert(groundAt(x,30.65)?.object.material.userData.estateGrass,'Lawn immediately beyond the straight edge stays grass');
}
for(const [x,z] of [[47,24],[54,27],[80,30]])assert(groundAt(x,z)?.object.material.userData.estateGrass,'Unmarked garden lawn is retained');
console.log('PASS: clean Redesmere brick join, square level gravel corner, matching cross-walk and gravel-filled recess.');
`;
writeFileSync(file,readFileSync(file,'utf8')+checks);
