import assert from 'node:assert/strict';
import * as THREE from './dist/vendor/three.module.js';
import {createEscapeExterior} from './dist/escape-exterior.mjs';
import {createAerialLayouts} from './dist/aerial-layouts.mjs';
import {FARNDON_CORRIDOR,FARNDON_CORRIDOR_RUNS,FARNDON_CORRIDOR_WALK,WARD_CORRIDOR_WALK} from './dist/farndon-corridor.mjs';
import {HALE_CORRIDOR_RUNS} from './dist/hale-corridors.mjs';
import {WARD_CORRIDOR_NODES,WARD_CORRIDOR_RUNS} from './dist/ward-corridors.mjs';
import {UPTON_FOOTPRINT} from './dist/upton-frith-oscroft.mjs';
import {pointInFootprint} from './dist/historic-footprints.mjs';
import {exteriorObstacles,obstacleContains} from './dist/explore-controls.mjs';
globalThis.document={createElement:()=>({getContext:()=>({fillRect(){},measureText:t=>({width:t.length*16}),strokeText(){},fillText(){}})})};
const exterior=createEscapeExterior(THREE,1.4),layouts=createAerialLayouts(THREE,exterior);
exterior.scene.updateMatrixWorld(true);
const corridor=exterior.adminCorridor,straight=corridor.getObjectByName('Straight corridor to Farndon');
const n=WARD_CORRIDOR_NODES,route=FARNDON_CORRIDOR,ray=new THREE.Raycaster();
assert.equal(straight.parent,corridor);
assert.equal(straight.userData.centerline[0][0],straight.userData.centerline[1][0],'Blue branch is straight north/south, perpendicular to the east/west admin link');
assert.equal(FARNDON_CORRIDOR_RUNS.length,1,'Main to tower to Farndon is one straight run without corners');
assert.deepEqual(FARNDON_CORRIDOR_RUNS[0].start,[156.3,9.8]);
assert(!corridor.getObjectByName('Farndon gallery offset'),'No offset connector remains');
assert(corridor.userData.sections.some(s=>route.x>=s.start&&route.x<=s.end&&route.startZ>=s.cz-s.depth/2&&route.startZ<=s.cz+s.depth/2),'Straight gallery joins the fixed Main/admin connector');
assert(Math.abs(route.x-route.width/2-(148+10.2/2)-.5)<1e-9,'Gallery passes directly beside the tower on its chimney side');
assert(exteriorObstacles(THREE,exterior.towerBuildings).some(o=>obstacleContains(o,route.x,-55.2)),'Same straight axis enters the existing tower service range');
assert.deepEqual(n.upton,[38.15764920096168,-198.3],'Upton attachment stays fixed');
for(const dx of [-route.width/2+.01,0,route.width/2-.01])assert(pointInFootprint([route.x+dx,route.endZ],exterior.farndonWard.userData.footprint),'Full corridor width enters Farndon’s moved rear wing');
for(const [point,footprint] of [[n.upton,UPTON_FOOTPRINT],[n.witby,exterior.witbyWard.userData.footprint],[n.grafton,exterior.graftonEdge.userData.footprint]])assert(pointInFootprint(point,footprint),'Every branch enters its current host ward');
for(const run of HALE_CORRIDOR_RUNS)assert(pointInFootprint(run.start,exterior.haleWard.userData.footprint),'Both Hale links enter their moved wings');
assert(Math.abs((n.farndon[0]-n.elbow[0])-(n.farndon[1]-n.elbow[1]))<1e-9,'Red spine retains the 45-degree direction');
assert.equal(n.graftonJunction[1],n.grafton[1]);assert.equal(n.witbyJunction[0],n.witby[0]);
const obstacles=exteriorObstacles(THREE,exterior.model);
const runs=[...FARNDON_CORRIDOR_RUNS,...WARD_CORRIDOR_RUNS,...HALE_CORRIDOR_RUNS];
let samples=0;
for(const run of runs){
 const [a,b]=[run.start,run.end],length=Math.hypot(b[0]-a[0],b[1]-a[1]),dx=(b[0]-a[0])/length,dz=(b[1]-a[1])/length;
 for(let d=0;d<=length;d+=.5){
  const x=a[0]+dx*d,z=a[1]+dz*d;
  assert(obstacles.some(o=>obstacleContains(o,x,z)),'Continuous corridor masonry and collisions');
  for(const side of [-2,0,2]){
   ray.set(new THREE.Vector3(x-dz*side,30,z+dx*side),new THREE.Vector3(0,-1,0));
   const hit=ray.intersectObject(corridor,true).find(h=>h.object.name.endsWith('slate roof'));
   assert(hit&&hit.point.y>=route.height,'Continuous roof across every corridor width');samples++;
  }
 }
}
// A diagonal must not fill its enclosing rectangle with invisible collisions.
for(const p of [[90,-135],[122,-183]])assert(!obstacles.some(o=>obstacleContains(o,...p)),'Grass beside the diagonal must remain walkable: '+p);
for(const view of [FARNDON_CORRIDOR_WALK,WARD_CORRIDOR_WALK])assert(!obstacles.some(o=>obstacleContains(o,view.position[0],view.position[2])),'Walking views begin on open ground');
const tower=new THREE.Box3().setFromObject(exterior.waterTower.getObjectByName('Water tower shaft')??exterior.waterTower);
assert(route.x-route.width/2>148+10.2/2,'Straight corridor clears the water tower masonry');
assert(tower.max.y>30,'The existing tower remains in place');
const branchGroup=corridor.getObjectByName('Grafton Witby and Upton connecting corridors');
corridor.traverse(o=>{
 if(!o.isMesh)return;
 for(const attribute of Object.values(o.geometry.attributes))assert([...attribute.array].every(Number.isFinite));
 if(o.name.endsWith('slate roof'))for(let i=0;i<o.geometry.attributes.normal.count;i++)assert(o.geometry.attributes.normal.getY(i)>0,'Roof faces point up');
});
const visible=o=>{for(;o;o=o.parent)if(!o.visible)return false;return true;};
for(const historic of [false,true])for(const modern of [false,true]){
 layouts.setVisible('historic',historic);layouts.setVisible('modern',modern);
 assert.equal(visible(branchGroup),historic);assert.equal(visible(straight),historic);
 const obstacles=exteriorObstacles(THREE,exterior.model);
 for(const p of [[route.x,-110],[n.witby[0],-186],[95,n.grafton[1]]])assert.equal(obstacles.some(o=>obstacleContains(o,...p)),historic,'Hidden corridors leave no collision');
}
console.log('PASS: one straight Main/tower/Farndon gallery, fixed Upton anchor, six current ward contacts, '+samples+' roof samples, angled collisions, open grass, walking starts and Historic visibility.');
