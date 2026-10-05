import {readFile,writeFile} from 'node:fs/promises';
const test=new URL('../../test-west-roof-join.mjs',import.meta.url);
let source=await readFile(test,'utf8');
source=source.replace("top(x,z)>15.49","top(x,z)>14.53");
source=source.replaceAll('[-61.75,4.8]','[-61.8775,4.6]').replaceAll('[-55.05,4.8]','[-54.9225,4.6]').replaceAll('[-55.79,13.45]','[-55.817,13.9]').replaceAll('[-49.21,13.45]','[-49.183,13.9]');
source=source.replace('[[-63.5,-56.4],[-48.6,-40.5]]','[[-63.5,-55.9],[-49.1,-40.5]]');
const start=source.indexOf('for(const z of [5.5,6,6.5,7,8])'),end=source.indexOf('for(let z=12.05;',start);
if(start<0||end<0)throw Error('Missing obsolete raised-corner regression');
source=source.slice(0,start)+`// The blue-circled correction lowers every roof perimeter to the red wall.
// Independent surface probes catch the formerly higher pavilion and bay rims.
for(const [a,b] of [
  [[-72.4,4.6],[-72.4,20.9]],[[-72.4,20.9],[-63.6,20.9]],
  [[-63.6,20.9],[-63.6,13.9]],[[-65.6,4.6],[-72.4,4.6]],
  [[-65.6,4.6],[-65.6,6.6]],[[-65.6,6.6],[-61.8775,6.6]],
  [[-61.8775,6.6],[-61.8775,3.802]],[[-61.8775,3.802],[-60.13875,1.39]],
  [[-60.13875,1.39],[-56.66125,1.39]],[[-56.66125,1.39],[-54.9225,3.802]],
  [[-54.9225,3.802],[-54.9225,4.6]],
  [[-55.817,13.9],[-55.817,15.944]],[[-55.817,15.944],[-53.7305,17.96]],
  [[-53.7305,17.96],[-51.2695,17.96]],[[-51.2695,17.96],[-49.183,15.944]],
  [[-49.183,15.944],[-49.183,13.9]],
  [[-40.4,13.9],[-40.4,21.6]],[[-40.4,21.6],[-34.6,21.6]],[[-34.6,21.6],[-34.6,15.5]]
])for(const t of [.1,.3,.5,.7,.9]){
  const x=a[0]+(b[0]-a[0])*t,z=a[1]+(b[1]-a[1])*t;
  // Float32 roof edges are sampled a few microns inboard of their perimeter.
  const px=x+(x< -58.4?.00001:x> -52.5?-.00001:.00001),pz=z+(z<9.25?.00001:-.00001);
  assert(Math.abs(top(px,pz)-14.53)<.0001,'Every circled roof-to-wall edge matches the red wall: '+[x,z,top(px,pz)]);
}
for(const name of ['West front square pavilion','West end continuous wall','West front middle arm','West curved bay','West courtyard polygonal bay']){
  const box=new THREE.Box3().setFromObject(model.getObjectByName(name));
  assert(Math.abs(box.max.y-14.3)<.00001,'Supporting wall tops follow the shared eave: '+name);
}
assert(!model.getObjectByName('West court roof corner render riser'),'Level eaves remove the old corner riser');
const renderParts=[];
model.traverse(o=>{if(o.isMesh&&/^West outer corner joined cornice|^West middle arm joined cornice|^West courtyard polygonal bay stone band|^West garden inner pavilion cornice/.test(o.name))renderParts.push(o);});
let renderProbes=0;
for(const o of renderParts){
  const g=o.geometry.index?o.geometry.toNonIndexed():o.geometry,p=g.attributes.position;
  const box=new THREE.Box3().setFromObject(o);
  if(box.max.y<14){if(g!==o.geometry)g.dispose();continue;}
  assert(box.max.y<=14.53001,'No circled cornice projects above the common roof edge: '+o.name);
  for(let i=0;i<p.count;i+=3){
    const v=[0,1,2].map(j=>new THREE.Vector3().fromBufferAttribute(p,i+j).applyMatrix4(o.matrixWorld)),[a,b,c]=v;
    if(b.clone().sub(a).cross(c.clone().sub(a)).y<=1e-8)continue;
    for(const w of [[1/3,1/3,1/3],[.1,.2,.7],[.2,.7,.1],[.7,.1,.2]]){
      const q=v.reduce((q,v,j)=>q.addScaledVector(v,w[j]),new THREE.Vector3());
      ray.set(new THREE.Vector3(q.x,30,q.z),new THREE.Vector3(0,-1,0));
      assert(!ray.intersectObjects(roofs,false).some(h=>h.point.y<q.y-.0001&&h.point.y>box.min.y+.0001),'No slate crosses the level render: '+o.name+' '+q.toArray());
      renderProbes++;
    }
  }if(g!==o.geometry)g.dispose();
}
`+source.slice(end);
source=source.replace('descending pitches, closed valleys, wall-top eaves','descending pitches, closed valleys, uniform 14.53 eaves');
await writeFile(test,source);
const refinement=new URL('../../test-west-refinement.mjs',import.meta.url);
let ref=await readFile(refinement,'utf8');
ref=ref.replace('hit([-74,15.2,edge+dz]','hit([-74,14.3,edge+dz]');
await writeFile(refinement,ref);

let capture=await readFile(new URL('../west-bay-roof-connections/capture.mjs',import.meta.url),'utf8');
capture=capture.replace("if(stage==='before')await page.route('**/west-cross-range-roof.mjs',async r=>r.fulfill({contentType:'text/javascript',body:await readFile(new URL('before-roof.mjs',out),'utf8')}));",`if(stage==='before')for(const name of ['west-cross-range-roof.mjs','west-range-plan.mjs','west-refinement.mjs','west-front-photo-detail.mjs','west-court-photo-detail.mjs','escape-exterior.mjs'])await page.route('**/'+name,async r=>r.fulfill({contentType:'text/javascript',body:await readFile(new URL('before-'+name,out),'utf8')}));`);
capture=capture.replace("/^West middle arm joined cornice|^West courtyard polygonal bay stone band|^West (court|garden) bay roof render/","/^West middle arm joined cornice|^West courtyard polygonal bay stone band|^West outer corner joined cornice|^West garden inner pavilion cornice/");
capture=capture.replace('const endpoints=[[-58.4,-61.85,4.6,15.45],[-58.4,-54.95,4.6,15.45],[-52.5,-55.79,13.45,15.05],[-52.5,-49.21,13.45,15.05]];','const endpoints=[[-58.4,-61.8775,4.6,14.53],[-58.4,-54.9225,4.6,14.53],[-52.5,-55.817,13.9,14.53],[-52.5,-49.183,13.9,14.53]];');
capture=capture.replace("if(errors.length)throw Error(errors.join('\\n'));","if(errors.length)throw Error(errors.join('\\n'));\n if(stage!=='before'&&(diagnostics.intersections.length||diagnostics.joins.some(p=>Math.abs(p.y-p.expected)>.002)))throw Error('Level eaves or render regression: '+JSON.stringify(diagnostics));");
await writeFile(new URL('capture.mjs',import.meta.url),capture);
