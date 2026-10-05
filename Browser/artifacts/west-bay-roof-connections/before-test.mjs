import assert from 'node:assert/strict';
import * as THREE from './dist/vendor/three.module.js';
import {createEscapeExterior} from './dist/escape-exterior.mjs';
globalThis.document={createElement:()=>({getContext:()=>({fillRect(){}})})};
const {model}=createEscapeExterior(THREE,1.5);model.updateMatrixWorld(true);
const material=model.getObjectByName('West end continuous slate roof').material;
const roofs=[];model.traverse(o=>{if(o.isMesh&&o.material===material)roofs.push(o);});
const ray=new THREE.Raycaster();
const join=model.getObjectByName('West cross-range continuous roof join');
assert(new THREE.Box3().setFromObject(join).min.y>13,'The roof joins the lower Reception pitches without reaching the separate stair-bay deck');
const lowBay=model.getObjectByName('West court low bay flat roof');
assert.equal(lowBay.geometry.type,'BoxGeometry','The independent low roof retains its complete original solid deck');
function top(x,z){
  ray.set(new THREE.Vector3(x,30,z),new THREE.Vector3(0,-1,0));
  const hit=ray.intersectObjects(roofs,false)[0];
  assert(hit?.face.normal.y>0,'Every roof-join probe has upward-facing slate');return hit.point.y;
}
// These are the actual tall masonry contacts marked yellow, independent of
// the new roof's triangulation: the outer pavilion and court bay's rear edge.
for(const x of [-64.25,-64.1,-63.9])for(const z of [12,12.5,13])
  assert(top(x,z)>14.53,'The lower shoulder covers the main wall up to its cornice');
for(const x of [-61,-60,-59,-58,-57,-56])for(const z of [4.85,5.1])
  assert(top(x,z)>15.49,'The bay rear masonry and cornice sit beneath the joined slate');
for(let x=-67.9;x< -30.6;x+=.37){
  assert(Math.abs(top(x,9.25)-17.08)<.00001,'The full yellow cross-range ridge is level');
  assert(Math.abs(top(x,9.249)-top(x,9.251))<.003,'Both pitches meet without an open ridge or vertical step');
}
// Independent coordinates from the owner's four yellow branches. The former
// patched hips fail here even though they passed the two earlier strip checks.
for(const [x,end] of [[-68,17],[-58.4,3.7],[-52.5,14.5],[-37.5,18.5]]){
  for(let t=.02;t<=1;t+=.035){
    const z=9.25+(end-9.25)*t;
    assert(Math.abs(top(x,z)-17.08)<.00001,'Every yellow branch meets the main ridge at the same height');
    for(const side of [-1,1]){
      if(t>=.3)assert(top(x+side*.7,z)<top(x+side*.2,z),'Slate pitches down on both sides of each branch beyond the meeting valleys');
      assert(Math.abs(top(x+side*.001,z)-top(x,z))<.002,'Both branch pitches share the ridge');
    }
  }
  assert(top(x,end+Math.sign(end-9.25)*.2)<17.08,'Each branch finishes with a pitched hip');
}
// Valleys are shared edges from the T junctions to the re-entrant corners.
for(const [a,b] of [
  [[-68,9.25],[-63.6,13.9]],[[-58.4,9.25],[-61.8775,4.74]],
  [[-58.4,9.25],[-54.9225,4.74]],[[-52.5,9.25],[-55.817,13.9]],
  [[-52.5,9.25],[-49.183,13.9]],[[-37.5,9.25],[-40.4,13.9]],
  [[-37.5,9.25],[-34.6,15.5]]
])for(let t=.05;t<1;t+=.05){
  const x=a[0]+(b[0]-a[0])*t,z=a[1]+(b[1]-a[1])*t;
  const length=Math.hypot(b[0]-a[0],b[1]-a[1]),dx=(b[1]-a[1])/length*.0001,dz=-(b[0]-a[0])/length*.0001;
  assert(Math.abs(top(x-dx,z-dz)-top(x+dx,z+dz))<.001,'Joined valley pitches leave no triangular opening or step');
}
for(const z of [6.601,8,9.25,11,12,14,15.499])
  assert(Math.abs(top(-27.0001,z)-top(-26.9999,z))<.001,'The new east hip meets the retained lower roof planes');
// Raised corners need solid brick beneath the eaves, rather than the former
// open triangular strips between slate and the level facade cornices.
const edgeBrick=model.getObjectByName('West courtyard upper link infill').material;
for(const [x,y,z,direction] of [[-54.6,13.9,4.3,1],[-58,13.9,14.3,-1],[-35.5,14.2,4.3,1]]){
  ray.set(new THREE.Vector3(x,y,z),new THREE.Vector3(0,0,direction));
  const hit=ray.intersectObject(model,true)[0];
  assert(hit?.object.material===edgeBrick,'Raised roof edges meet matching solid masonry: '+hit?.object.name);
}
// The later blue guide fixes the long eaves at the actual wall-top trim.
// These probes fail the former rising roof edges, despite its passing ridges.
for(const [left,right] of [[-63.5,-55.9],[-49.1,-40.5]])for(let x=left;x<right;x+=.17)
  assert(Math.abs(top(x,13.8999)-14.53)<.001,'Both marked slate edges reach the level main cornice');
for(const z of [5.5,6,6.5,7,8])assert(top(-66,z)>15.2,'The projecting corner masonry stays below the repaired shoulder');
const viewCamera=new THREE.PerspectiveCamera(55,1400/950,.1,500);
viewCamera.position.set(-48,31,-18);viewCamera.lookAt(-54,12,10);viewCamera.updateMatrixWorld(true);
for(const [x,y,render=false] of [[1057,415],[1061,425,true],[1051,423,true],[1068,419],[765,485],[764,478],[760,490]]){
  ray.setFromCamera(new THREE.Vector2(x/1400*2-1,1-y/950*2),viewCamera);
  ray.far=50; // The marked roof is within 40 units; distant foliage is irrelevant.
  const hit=ray.intersectObject(model,true)[0];
  assert(render?hit?.object.material.color.getHex()===0xe1e3dc:hit?.object.material===material,
    'Both circled corners finish in slate or their intended render, without exposed brick or roof undersides: '+hit?.object.name);
}
ray.far=Infinity;
// The owner's later blue lines descend to the tall render on both sides.
// Independent end coordinates catch the former ridge-to-low-eave wedges.
for(const [x,z,y] of [[-65.6,6.6,15.47],[-63.6,13.425,15.47]]){
  const dx=x+68,dz=z-9.25,length=Math.hypot(dx,dz);
  for(let t=.02;t<=1;t+=.035){
    const px=-68+dx*t,pz=9.25+dz*t,expected=17.08+(y-17.08)*t;
    assert(Math.abs(top(px,pz)-expected)<.00001,'Each descending arris ends on the upper render');
    const left=top(px+dz/length*.0001,pz-dx/length*.0001),right=top(px-dz/length*.0001,pz+dx/length*.0001);
    assert(Math.abs(left-right)<.001,'Both pitches share the descending arris: '+[x,z,t,left,right]);
  }
}
// Test the physical cornices and new solid returns against all slate, rather
// than trusting their names or the separate roof and render builders.
const renderParts=[];
model.traverse(o=>{if(o.isMesh&&(/^West outer corner joined cornice|^West (court|garden) descending roof render return|^West court roof corner render riser/.test(o.name)))renderParts.push(o);});
assert.equal(renderParts.length,6);
let renderProbes=0;
for(const o of renderParts){
  const g=o.geometry.index?o.geometry.toNonIndexed():o.geometry,p=g.attributes.position;
  const bottom=new THREE.Box3().setFromObject(o).min.y;
  for(let i=0;i<p.count;i+=3){
    const vertices=[0,1,2].map(j=>new THREE.Vector3().fromBufferAttribute(p,i+j).applyMatrix4(o.matrixWorld));
    const [a,b,c]=vertices,normal=b.clone().sub(a).cross(c.clone().sub(a));
    if(normal.y<1e-8)continue;
    for(const weights of [[1/3,1/3,1/3],[.1,.2,.7],[.2,.7,.1],[.7,.1,.2]]){
      const sample=vertices.reduce((v,p,j)=>v.addScaledVector(p,weights[j]),new THREE.Vector3());
      ray.set(new THREE.Vector3(sample.x,30,sample.z),new THREE.Vector3(0,-1,0));
      assert(!ray.intersectObjects(roofs,false).some(h=>h.point.y>bottom+.0001&&h.point.y<sample.y-.0001),
        'No slate crosses through the middle of '+o.name+' at '+sample.toArray());
      renderProbes++;
    }
  }
  if(g!==o.geometry)g.dispose();
}
for(const side of ['court','garden'])for(const t of [.15,.35,.55,.75,.9]){
  const y=(14.31+15.47+(14.53-15.47)*t)/2;
  const start=side==='court'?[-65.6+.3*t,y,6.1]:[-63.25,y,13.425+.475*t];
  ray.set(new THREE.Vector3(...start),new THREE.Vector3(...(side==='court'?[0,0,1]:[-1,0,0])));ray.far=.6;
  const hit=ray.intersectObject(model,true)[0];ray.far=Infinity;
  assert(hit?.object.material.color.getHex()===0xe1e3dc,'Each solid render return faces outward: '+side+' '+t+' '+hit?.object.name);
}
ray.set(new THREE.Vector3(-65.58,14.62,6.1),new THREE.Vector3(0,0,1));ray.far=.7;
assert(ray.intersectObject(model,true)[0]?.object.material.color.getHex()===0xe1e3dc,'The recessed gutter cannot cross the render riser');
ray.far=Infinity;
for(let z=12.05;z<=18.3;z+=.13){
  assert(Math.abs(top(-25.8,z)-15.66)<.00001,'The relocated blue entrance-bay ridge continues at the retained main roof height');
  for(const dx of [-.4,.4])assert(top(-25.8+dx,z)<15.66,'Both relocated ridge sides descend');
  if(z>13)assert(top(-27.3,z)<15.66,'Remove the former orange ridge');
}
for(let x=-25.5;x< -22.9;x+=.13){
  assert(Math.abs(top(x,12)-15.66)<.00001,'The existing yellow entrance ridge stays level');
  const z=12+(x+25.8)*2.26/3.6*5.4/2.6;
  assert(Math.abs(top(x,z-.0001)-top(x,z+.0001))<.001,'The new branch joins the retained pitch without a vertical step');
}
assert(top(-25.8,19.5)<15,'The relocated ridge ends in a descending hip');
// Check the actual cornice solids against every slate mesh. The old roof
// crosses both the horizontal front moulding and the rising side return.
for(const [layer,height] of [[0,.58],[1,.1],[2,.1],[3,.1]]){
  const o=model.getObjectByName('Entrance west mitred cornice layer '+layer),g=o.geometry.index?o.geometry.toNonIndexed():o.geometry,p=g.attributes.position;
  for(let i=0;i<p.count;i+=3){
    const v=[0,1,2].map(j=>new THREE.Vector3().fromBufferAttribute(p,i+j).applyMatrix4(o.matrixWorld)),[a,b,c]=v;
    if(b.clone().sub(a).cross(c.clone().sub(a)).y<=1e-8)continue;
    for(const w of [[1/3,1/3,1/3],[.1,.2,.7],[.2,.7,.1],[.7,.1,.2]]){
      const q=v.reduce((q,v,j)=>q.addScaledVector(v,w[j]),new THREE.Vector3());
      ray.set(new THREE.Vector3(q.x,30,q.z),new THREE.Vector3(0,-1,0));
      assert(!ray.intersectObjects(roofs,false).some(h=>h.point.y<q.y-.0001&&h.point.y>q.y-height+.0001),'No entrance slate crosses the render: '+o.name+' '+q.toArray());
      renderProbes++;
    }
  }if(g!==o.geometry)g.dispose();
}
for(let x=-28.7;x< -22.8;x+=.17){
  assert(Math.abs(top(x,19.6249)-13.69)<.002,'The front hip stops at the inner top edge of the render');
  ray.set(new THREE.Vector3(x,30,19.8),new THREE.Vector3(0,-1,0));
  assert(ray.intersectObject(model,true)[0]?.object.name==='Entrance west mitred cornice layer 3','The exposed cornice has no slate fringe');
}
console.log('PASS: retained yellow ridges, relocated blue entrance ridge, descending pitches, closed valleys, wall-top eaves, '+renderProbes+' physical roof/render probes, circled contacts and retained low deck.');
