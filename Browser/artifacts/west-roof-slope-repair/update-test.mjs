import {readFile,writeFile} from 'node:fs/promises';
let p='Browser/test-west-entrance-roof-boundary.mjs',s=await readFile(p,'utf8');s=s.replaceAll('\r\n','\n');const start=s.indexOf('// The later blue circle'),finish=s.indexOf('const cornice=',start);if(start<0||finish<0)throw Error('Missing test context');s=s.slice(0,start)+`// Compare the blue patch with the unaffected yellow pitch above it.
// Height and normals catch both a projecting step and a replacement face
// with a different angle, even when its boundary happens to be continuous.
let contacts=0;
for(const x of [-34.599,-34.5,-34.2,-33.9,-33.7,-33.65,-33.6,-33.55,-33.5,-33.2,-32.8,-32.4,-32,-31.5,-31]){
  const reference=top(x,14.6),normal=reference.face.normal;
  for(const z of [14.85,15,15.2,15.35,15.3849]){
    const expected=reference.point.y-normal.z/normal.y*(z-14.6),h=top(x,z);
    assert(h&&Math.abs(h.point.y-expected)<.0001,'The blue patch continues the yellow roof plane: '+[x,z,h?.point.y,expected]);
    assert(h.face.normal.dot(normal)>1-1e-8,'The blue patch has the yellow roof angle: '+[x,z]);contacts++;
  }
}
for(const x of [-33.65,-33.55]){
  assert(Math.abs(top(x-.0001,15.3849).point.y-top(x+.0001,15.3849).point.y)<.001,'The marked slate has no abrupt step');
  const coping=model.getObjectByName('West inside corner continuous coping '+(x===-33.65?5:2));
  ray.set(new THREE.Vector3(x-.00001,30,15.55),new THREE.Vector3(0,-1,0));
  const h=ray.intersectObject(coping,false)[0],edge=top(x-.00001,15.3849);
  assert(h&&Math.abs(h.point.y-edge.point.y)<.002,'White trim meets the retained pitch without a raised block');
}
// The red-circled side return now shares the projection's front eave.
// Probe both sides of its actual inner mitre, including the formerly open bend.
const trim=model.getObjectByName('Entrance west mitred cornice layer 3');
for(const z of [17.2251,17.3,17.42,17.8,18.2,18.8,19.2]){
  const h=top(-22.6751,z);
  ray.set(new THREE.Vector3(-22.6749,30,z),new THREE.Vector3(0,-1,0));
  const edge=ray.intersectObject(trim,false)[0];
  assert(h&&edge&&Math.abs(h.point.y-edge.point.y)<.001,'The red bend has no slit or height step: '+[z,h?.point.y,edge?.point.y]);
  assert(Math.abs(h.point.y-13.69)<.001,'The red return meets the level projection eave');contacts++;
}
`+s.slice(finish);
s=s.replace('const end=[-30.8273654403271,14.3,15.385];','const end=[-30.8273654403271,top(-30.8272654403271,15.3849).point.y,15.385];');
s=s.replace("' yellow-boundary contacts, '","' continuous-pitch/bend contacts, '");await writeFile(p,s);
p='Browser/dist/escape-exterior.mjs';s=await readFile(p,'utf8');s=s.replace("['Entrance west projection slate roof','Entrance west slate pitches to render edge','West cross-range continuous roof join','West entrance corner slate to yellow boundary']","['Entrance west projection slate roof','Entrance west slate pitches to render edge']");await writeFile(p,s);
