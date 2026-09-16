import assert from 'node:assert/strict';
import * as THREE from './dist/vendor/three.module.js';
import {createEscapeExterior} from './dist/escape-exterior.mjs';
import {createAerialLayouts} from './dist/aerial-layouts.mjs';
import {GREENHOUSE_ROAD,GREENHOUSES,GARDEN_BUILDINGS,GREENHOUSE_VIEWS,gardenPoint} from './dist/greenhouses.mjs';
import {VIVIENNE_LANE} from './dist/road-centerlines.mjs';
import {exteriorObstacles,obstacleContains,createWalker} from './dist/explore-controls.mjs';
globalThis.document={createElement:()=>({getContext:()=>({fillRect(){},measureText:t=>({width:t.length*16}),strokeText(){},fillText(){}})})};
const exterior=createEscapeExterior(THREE,1.5),site=exterior.greenhouses,layouts=createAerialLayouts(THREE,exterior);
exterior.scene.updateMatrixWorld(true);
assert.equal(site.userData.greenhouses.length,3);assert.equal(site.userData.buildings.length,2);assert.equal(site.parent,layouts.historic);
const ray=new THREE.Raycaster();let samples=0;
for(const [i,b] of GREENHOUSES.entries())for(let x=-b.length/2+.1;x<b.length/2;x+=.35)for(let z=-b.width/2+.1;z<b.width/2;z+=.35){
 ray.set(new THREE.Vector3(...gardenPoint(b,x,20,z)),new THREE.Vector3(0,-1,0));assert(ray.intersectObject(site.userData.greenhouses[i],true).some(h=>h.object.name==='Greenhouse glazed roof'),'Continuous glass roof');samples++;
}
for(const [i,b] of GARDEN_BUILDINGS.entries()){
 const group=site.userData.buildings[i];
 for(let x=.1;x<b.depth;x+=.35)for(let z=.1;z<b.length;z+=.35){ray.set(new THREE.Vector3(...gardenPoint(b,x,20,z)),new THREE.Vector3(0,-1,0));assert(ray.intersectObject(group,true).some(h=>h.object.name.endsWith('hipped tile roof')),'Full hipped roof coverage');samples++;}
 for(const o of group.userData.openings){const pos=new THREE.Vector3(...gardenPoint(b,o.end?b.depth/2:0,o.y,o.end?0:o.z)),normal=new THREE.Vector3(o.end?0:-1,0,o.end?-1:0).transformDirection(group.matrixWorld);ray.set(pos.clone().addScaledVector(normal,.7),normal.clone().negate());assert(ray.intersectObject(group,true)[0]?.object.isInstancedMesh,'Door/window exposed on the photo-facing facade');}
}
site.traverse(o=>{if(o.isMesh)for(const a of Object.values(o.geometry.attributes))assert([...a.array].every(Number.isFinite),'Finite geometry');});
const obstacles=exteriorObstacles(THREE,exterior.model),blocked=(x,z)=>obstacles.some(o=>obstacleContains(o,x,z));
for(const b of GREENHOUSES)assert(blocked(b.x,b.z),'Glasshouse collision');
for(const b of GARDEN_BUILDINGS){const p=gardenPoint(b,2,0,3);assert(blocked(p[0],p[2]),'Workshop collision');}
assert(!blocked(...[GREENHOUSE_VIEWS['greenhouses-photo'].position[0],GREENHOUSE_VIEWS['greenhouses-photo'].position[2]]),'Purple camera on open ground');
for(let z=102;z<149;z+=.35)assert(!blocked(115.3,z),'Walkable yard between glass and workshops');
for(let z=80;z<181;z+=.35)assert(!blocked(93,z),'Access road stays clear');
for(const z of [124.4,135.8])for(let x=97;x<115;x+=.5)assert(!blocked(x,z),'Open passage between greenhouse rows');
function distance(p,a,b){const dx=b[0]-a[0],dz=b[1]-a[1],t=Math.max(0,Math.min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dz)/(dx*dx+dz*dz)));return Math.hypot(p[0]-a[0]-t*dx,p[1]-a[1]-t*dz);}
const mouth=GREENHOUSE_ROAD.points[0];assert(Math.min(...VIVIENNE_LANE.slice(1).map((b,i)=>distance(mouth,VIVIENNE_LANE[i],b)))<.1,'Road joins the existing lane centre');
for(const b of GREENHOUSES)for(const x of [-b.length/2,b.length/2])for(const z of [-b.width/2,b.width/2]){const p=gardenPoint(b,x,0,z);assert(Math.min(...GREENHOUSE_ROAD.points.slice(1).map((q,i)=>distance([p[0],p[2]],GREENHOUSE_ROAD.points[i],q)))>GREENHOUSE_ROAD.width/2+.6,'Glasshouse clears the road border');}
const walker=createWalker(exterior.camera,obstacles);walker.setView({position:[93,1.8,165],target:[93,1.8,190]});walker.keys.add('KeyW');for(let i=0;i<34;i++)walker.update(.1);assert(exterior.camera.position.z>181,'Can walk to the southern road end');
const visible=o=>{for(;o;o=o.parent)if(!o.visible)return false;return true;};
for(const historic of [false,true])for(const modern of [false,true]){layouts.setVisible('historic',historic);layouts.setVisible('modern',modern);assert.equal(visible(site),historic);assert.equal(exteriorObstacles(THREE,exterior.model).some(o=>obstacleContains(o,GREENHOUSES[0].x,GREENHOUSES[0].z)),historic);}
console.log('PASS: three glasshouses, two photo-facing workshops, '+samples+' roof samples, road junction and clearance, open yard, southern walk and all layout combinations.');
