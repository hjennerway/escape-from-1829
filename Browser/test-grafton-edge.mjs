import assert from 'node:assert/strict';
import * as THREE from './dist/vendor/three.module.js';
import {createEscapeExterior} from './dist/escape-exterior.mjs';
import {createAerialLayouts} from './dist/aerial-layouts.mjs';
import {graftonEdgePoint,GRAFTON_EDGE_VIEWS} from './dist/grafton-edge.mjs';
import {exteriorObstacles,obstacleContains} from './dist/explore-controls.mjs';
globalThis.document={createElement:()=>({getContext:()=>({fillRect(){},measureText:t=>({width:t.length*16}),strokeText(){},fillText(){}})})};
const exterior=createEscapeExterior(THREE,1.5),ward=exterior.graftonEdge,original=exterior.irbyAshley;
const layouts=createAerialLayouts(THREE,exterior);exterior.scene.updateMatrixWorld(true);
assert.equal(ward.name,'Grafton/Edge');
assert.equal(ward.rotation.y,Math.PI/2);assert.equal(ward.scale.y,1);
assert.deepEqual(original.position.toArray(),[234,0,-118]);
assert.deepEqual(original.scale.toArray(),[1,1,1]);assert.equal(original.rotation.y,0);
assert.equal(original.userData.bays.length,2);assert(original.userData.conservatory);
assert.equal(ward.userData.bays.length,1);assert.equal(ward.userData.corner,null);
assert.equal(ward.userData.conservatory,null);
assert(ward.userData.veranda);
ward.traverse(o=>assert(!/conservatory|glazed courtyard|quarter-octagonal/i.test(o.name),'Obsolete greenhouse and corner removed'));
const ray=new THREE.Raycaster();
function down(p){const [x,z]=graftonEdgePoint(p);ray.set(new THREE.Vector3(x,30,z),new THREE.Vector3(0,-1,0));return ray.intersectObject(ward,true);}
// Check the actual rendered canopy and bay, including the clear route passing
// in front of the bay. A rectangular collision proxy would block this route.
const verandaWalk=Array.from({length:45},(_,i)=>[214+i,-128.4]);
for(const p of verandaWalk){
 const hit=down(p)[0];assert.equal(hit?.object.name,'Grafton veranda pitched slate canopy','Continuous shelter: '+p);
 assert(hit.point.y>3&&hit.point.y<4.3);
}
assert.equal(down([236.25,-125.5])[0]?.object.name,'Grafton central half-octagonal slate hip');
assert(!down([236.25,-125.5]).some(hit=>hit.object.name==='Grafton veranda pitched slate canopy'),'Canopy must meet the bay walls without crossing its interior');
const solids=[[216,-124.5],[256,-124.5],[236.25,-125.5],[238,-105]];
const cleared=[[240,-137],[255,-134],[215,-130.9]];
for(const p of cleared)assert(!down(p).length,'Removed long rear wings and greenhouse leave open ground: '+p);
for(const historic of [true,false])for(const modern of [true,false]){
 layouts.setVisible('historic',historic);layouts.setVisible('modern',modern);
 const obstacles=exteriorObstacles(THREE,exterior.model);
 for(const p of solids)assert.equal(obstacles.some(o=>obstacleContains(o,...graftonEdgePoint(p))),historic);
 for(const p of [...verandaWalk,...cleared])assert(!obstacles.some(o=>obstacleContains(o,...graftonEdgePoint(p))),'Open walk: '+p);
 const photo=GRAFTON_EDGE_VIEWS['grafton-edge-photo'].position;
 assert(!obstacles.some(o=>obstacleContains(o,photo[0],photo[2])),'Photo camera must be outside walls');
}
console.log('PASS: Grafton placement, unchanged Irby/Ashley, flat rear with one central bay, continuous veranda canopy, bay junction, cleared greenhouse, walking route and independent visibility.');
