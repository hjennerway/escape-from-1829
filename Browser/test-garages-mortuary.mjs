import assert from 'node:assert/strict';
import * as THREE from './dist/vendor/three.module.js';
import {createEscapeExterior} from './dist/escape-exterior.mjs';
import {createAerialLayouts} from './dist/aerial-layouts.mjs';
import {garagePoint,mortuaryPoint,GARAGE_MORTUARY_VIEWS,MORTUARY,MORTUARY_PREVIOUS} from './dist/garages-mortuary.mjs';
import {exteriorObstacles,obstacleContains} from './dist/explore-controls.mjs';
import {pointInFootprint} from './dist/historic-footprints.mjs';
import {HISTORIC_ROAD_TRACES} from './dist/historic-road-layout.mjs';
import {VIVIENNE_LANE} from './dist/road-centerlines.mjs';
globalThis.document={createElement:()=>({getContext:()=>({fillRect(){},measureText:t=>({width:t.length*16}),strokeText(){},fillText(){}})})};
const exterior=createEscapeExterior(THREE,1.5),site=exterior.garagesMortuary,layouts=createAerialLayouts(THREE,exterior);
exterior.scene.updateMatrixWorld(true);
const ray=new THREE.Raycaster(),m=site.userData.mortuary,g=site.userData.garages;
assert.equal(site.parent,layouts.historic);
function roofAt(transform,x,z){const p=transform(x,18,z);ray.set(new THREE.Vector3(...p),new THREE.Vector3(0,-1,0));return ray.intersectObject(site,true).find(h=>h.object.name.endsWith('slate roof')&&!h.object.name.includes('ridge vent'));}
let roofSamples=0;
for(const r of g.userData.ranges)for(let x=r.x0+.05;x<r.x1;x+=.35)for(let z=.05;z<r.depth;z+=.35){assert(roofAt(garagePoint,x,z),'Garage roof coverage '+[x,z]);roofSamples++;}
for(let x=-MORTUARY.halfWidth+.05;x<MORTUARY.halfWidth;x+=.23)for(let z=-3.95;z<6;z+=.23)if(pointInFootprint([x,z],m.userData.footprint)){assert(roofAt(mortuaryPoint,x,z),'T roof coverage '+[x,z]);roofSamples++;}
for(const x of [-3.5,3.5])assert(!roofAt(mortuaryPoint,x,-2),'T entrance recess stays uncovered');
for(let z=-3.8;z<=3.5;z+=.13)assert(Math.abs(roofAt(mortuaryPoint,0,z).point.y-5.03)<.001,'Entrance ridge meets crossbar at one height');
for(const group of [g,m]){
 group.traverse(o=>{if(!o.isMesh)return;for(const a of Object.values(o.geometry.attributes))assert([...a.array].every(Number.isFinite));if(o.name.endsWith('slate roof'))for(let i=0;i<o.geometry.attributes.normal.count;i++)assert(o.geometry.attributes.normal.getY(i)>0);});
 // The first hit from outside every photo opening must be its door/glazing,
 // not a covering wall or the back of a wrongly rotated window.
 for(const o of group.userData.openings){const r=o.r??0,n=new THREE.Vector3(-Math.sin(r),0,-Math.cos(r));n.transformDirection(group.matrixWorld);const p=new THREE.Vector3(o.x,o.y,o.z).applyMatrix4(group.matrixWorld);ray.set(p.clone().addScaledVector(n,.6),n.clone().negate());assert(ray.intersectObject(group,true)[0]?.object.isInstancedMesh,'Exposed opening '+JSON.stringify(o));}
}
// Measure the same entrance-to-kerb distance before and after the move.
const a=VIVIENNE_LANE[9],b=VIVIENNE_LANE[10],dx=b[0]-a[0],dz=b[1]-a[1],length=Math.hypot(dx,dz);
function gap(site){const x=site.x-4*Math.sin(site.rotation),z=site.z-4*Math.cos(site.rotation);return ((z-a[1])*dx-(x-a[0])*dz)/length-3.6;}
assert(Math.abs(gap(MORTUARY)/gap(MORTUARY_PREVIOUS)-.5)<1e-10,'Entrance gap to road is exactly halved');
assert.equal(MORTUARY.halfWidth,8.2,'Both blue guides extend the crossbar three units');
for(const [x,z]of m.userData.footprint)assert(m.userData.footprint.some(p=>p[0]===-x&&p[1]===z),'Symmetric side arms');
const vent=m.getObjectByName('Mortuary blue ridge vent walls');assert(vent&&vent.material.color.getHex()===0x739eae,'Tower-style blue ridge vent');
const ventPoint=mortuaryPoint(0,15,3.5);ray.set(new THREE.Vector3(...ventPoint),new THREE.Vector3(0,-1,0));const ventHit=ray.intersectObject(m,true).find(h=>h.object.name==='Mortuary ridge vent slate roof');assert(ventHit&&Math.abs(ventHit.point.y-5.98)<.001,'Pitched vent roof sits on the marked ridge');
const obstacles=exteriorObstacles(THREE,exterior.model);
for(const [transform,points] of [[garagePoint,[[1,3],[15,3],[35,3],[51,5]]],[mortuaryPoint,[[0,-2],[-7,3],[7,3]]]])for(const [x,z]of points){const p=transform(x,0,z);assert(obstacles.some(o=>obstacleContains(o,p[0],p[2])),'Solid building collision');}
for(const [x,z]of [[-3.5,-2],[3.5,-2]]){const p=mortuaryPoint(x,0,z);assert(!obstacles.some(o=>obstacleContains(o,p[0],p[2])),'T recess remains walkable');}
for(const key of ['garages-1','garages-2','mortuary-ground']){const p=GARAGE_MORTUARY_VIEWS[key].position;assert(!obstacles.some(o=>obstacleContains(o,p[0],p[2])),'Photo camera is walkable');}
function distance(p,a,b){const dx=b[0]-a[0],dz=b[1]-a[1],t=Math.max(0,Math.min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dz)/(dx*dx+dz*dz)));return Math.hypot(p[0]-a[0]-t*dx,p[1]-a[1]-t*dz);}
const roads=[...HISTORIC_ROAD_TRACES,{name:'Vivienne Smith Lane',points:VIVIENNE_LANE,width:6}];
let clearance=Infinity;
for(const [group,transform,footprints]of [[g,garagePoint,g.userData.ranges.map(r=>[[r.x0,0],[r.x1,0],[r.x1,r.depth],[r.x0,r.depth]])],[m,mortuaryPoint,[m.userData.footprint]]])for(const fp of footprints)for(let i=0;i<fp.length;i++)for(let t=0;t<=1;t+=.1){const a=fp[i],b=fp[(i+1)%fp.length],v=transform(a[0]+(b[0]-a[0])*t,0,a[1]+(b[1]-a[1])*t),p=[v[0],v[2]];for(const road of roads)for(let j=1;j<road.points.length;j++){const gap=distance(p,road.points[j-1],road.points[j])-road.width/2-.6;clearance=Math.min(clearance,gap);assert(gap>.1,group.name+' overlaps '+road.name+' at '+p);}}
const visible=o=>{for(;o;o=o.parent)if(!o.visible)return false;return true;};
for(const historic of [false,true])for(const modern of [false,true]){layouts.setVisible('historic',historic);layouts.setVisible('modern',modern);assert.equal(visible(site),historic);const p=garagePoint(35,0,3);assert.equal(exteriorObstacles(THREE,exterior.model).some(o=>obstacleContains(o,p[0],p[2])),historic);}
console.log('PASS: garages and T mortuary, '+roofSamples+' roof samples, exposed photo openings, joined ridge, road clearance ('+clearance.toFixed(2)+'), walking and Historic layout.');
