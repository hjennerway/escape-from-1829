import assert from 'node:assert/strict';
import {KML_TREES} from './dist/kml-tree-data.mjs';
import * as THREE from './dist/vendor/three.module.js';
import {createEscapeExterior} from './dist/escape-exterior.mjs';
import {createAerialLayouts} from './dist/aerial-layouts.mjs';
import {HISTORIC_ROADS,HISTORIC_ROAD_TRACES} from './dist/historic-road-layout.mjs';
import {pointInFootprint} from './dist/historic-footprints.mjs';
import {SHARED_HISTORIC_LANES} from './dist/historic-road-clearance.mjs';
globalThis.document={createElement:()=>({getContext:()=>({fillRect(){},measureText(text){return {width:text.length*16}},strokeText(){},fillText(){}})})};
const exterior=createEscapeExterior(THREE,1.5),layouts=createAerialLayouts(THREE,exterior);
exterior.model.updateMatrixWorld(true);
const ray=new THREE.Raycaster(),occupied=layouts.historicRoads.userData.missingFootprints.occupied;
function surface(x,z){ray.set(new THREE.Vector3(x,2,z),new THREE.Vector3(0,-1,0));return ray.intersectObject(layouts.historicRoads,true)[0]?.object.userData.surface;}
for(const p of [[325,-176],[428.5,-186.87],[625,-183],[270,-132],[391,-148]])assert(!['black road','stone kerb'].includes(surface(...p)),'Removed road remains: '+p);
for(const road of HISTORIC_ROADS.filter(r=>['Northern Parsons Lane connection','Parsons Lane southern fork','Northern estate boundary'].includes(r.name))){
 for(let i=1;i<road.points.length;i++){
  const a=road.points[i-1],b=road.points[i],dx=b[0]-a[0],dz=b[1]-a[1],length=Math.hypot(dx,dz);if(length<1e-8)continue;
  const steps=Math.ceil(length/.5);
  for(let j=0;j<=steps;j++){
   const t=j/steps,p=[a[0]+dx*t,a[1]+dz*t];
   assert.equal(surface(...p),'black road','Lane must remain continuous: '+road.name+' '+p);
   for(const offset of [-3.6,0,3.6]){
    const q=[p[0]-dz/length*offset,p[1]+dx/length*offset];
    assert(!occupied.some(poly=>pointInFootprint(q,poly)),'Lane must clear buildings: '+road.name+' '+q);
   }
  }
 }
}
const savedEnd=SHARED_HISTORIC_LANES.find(r=>r.name==='Parsons Lane (North)').points.at(-1),end=HISTORIC_ROADS.find(r=>r.name==='Northern Parsons Lane connection').points.at(-1);
for(let j=0;j<=32;j++){const t=j/32;assert.equal(surface(...end.map((v,i)=>v+t*(savedEnd[i]-v))),'black road','Saved lane junction must remain open');}
for(const p of HISTORIC_ROAD_TRACES.find(r=>r.name==='Annexe front avenue').points)assert.equal(surface(...p),'black road');
console.log('PASS: retraced Parsons Lane and fork have continuous asphalt, full-width building clearance, an open saved-lane junction, and grass at removed blue sections.');

// The shortened fork must clear complete crowns, including its pale border.
const fork=HISTORIC_ROAD_TRACES.find(r=>r.name==='Parsons Lane southern fork');
for(let i=1;i<fork.points.length;i++){
 const a=fork.points[i-1],b=fork.points[i],dx=b[0]-a[0],dz=b[1]-a[1],len2=dx*dx+dz*dz;
 for(const tree of KML_TREES){
  const t=Math.max(0,Math.min(1,((tree.x-a[0])*dx+(tree.z-a[1])*dz)/len2));
  assert(Math.hypot(tree.x-a[0]-t*dx,tree.z-a[1]-t*dz)>tree.radius+fork.width/2+.6,'Fork clears the crown of '+tree.name);
 }
}
for(const p of [[310,-103],[319,-100]])assert(!['black road','stone kerb'].includes(surface(...p)),'Former double-width fork returns to grass');
