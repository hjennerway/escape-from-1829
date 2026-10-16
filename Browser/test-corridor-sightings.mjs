import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import * as THREE from './dist/vendor/three.module.js';
import {buildAsylumLayout,flatWalkable,segmentDistance} from './dist/asylum-layout.mjs';
import {buildCorridorCrossings,buildPassageCrossings,createCorridorSightings,SIGHTING_INTERVAL,SIGHTING_DISTANCE} from './dist/corridor-sightings.mjs';
import {createCorridorFigure} from './dist/corridor-figure.mjs';

const rig=createCorridorFigure(THREE),ankles=[];rig.model.traverse(o=>{if(o.name==='Ankle')ankles.push(o);});
const world=new THREE.Vector3();
for(let i=0;i<100;i++){
 rig.pose(i/100);rig.model.updateMatrixWorld(true);
 const box=new THREE.Box3().setFromObject(rig.model);
 assert(box.min.y>=-.001&&box.max.y<1.95,'Human-sized running silhouette stays above the floor');
 for(const ankle of ankles){ankle.getWorldPosition(world);assert(world.y>=.09-1e-6,'Jointed shoes never cut through the floor');}
}
rig.dispose();

const floors=buildAsylumLayout(JSON.parse(await readFile(new URL('./dist/asylum-plan.json',import.meta.url)))).floors;
const routes=buildCorridorCrossings(floors);
assert(routes.some(r=>r.floor===0)&&routes.some(r=>r.floor===1),'Ground and first-floor junctions support sightings');
for(const route of routes)for(let i=0;i<=100;i++){
 const t=i/100,x=route.a[0]+(route.b[0]-route.a[0])*t,z=route.a[1]+(route.b[1]-route.a[1])*t;
 assert(flatWalkable(floors[route.floor],x,z,.28),'Complete crossings clear walls, stairs and doors');
}
function setup({floor=0,x=35.8,z=-18,lookX=46,lookZ=8.2,ready=true,random=()=>0,layouts=floors}={}){
 const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(74,1.5,.05,150);
 const actor={x,z,floor,y:layouts[floor].elevation,outside:false,stair:null};
 camera.position.set(x,actor.y+1.65,z);camera.lookAt(lookX,actor.y+1.35,lookZ);camera.updateMatrixWorld(true);
 const sightings=createCorridorSightings(THREE,scene,layouts,{random,isReady:()=>ready});
 const figure=scene.getObjectByName('Distant corridor silhouette');
 return {scene,camera,actor,sightings,figure,step:(dt=.1)=>sightings.update(actor,camera,dt)};
}
function awaitSighting(test,seconds=21){for(let t=0;t<seconds&&!test.sightings.active;t+=.1)test.step();return test.sightings.active;}
function visible(test){
 let opacity=0;test.figure.traverse(o=>{if(o.isMesh)opacity=o.material.opacity;});
 const point=new THREE.Vector3(test.figure.position.x,test.actor.y+1.05,test.figure.position.z).project(test.camera);
 return test.figure.visible&&opacity>.5&&point.z>0&&point.z<1&&Math.abs(point.x)<1&&Math.abs(point.y)<1;
}

// Every actual long segment, facing both ways: three consecutive sightings
// must start on the fixed clock regardless of random route/direction choices.
// This includes passages with no junctions and basement halls. The short
// second-floor halls must now defer sightings to preserve the larger distance.
assert.equal(SIGHTING_INTERVAL,20);
assert.equal(SIGHTING_DISTANCE.min,20);
assert.equal(SIGHTING_DISTANCE.farFraction,.8);
assert(buildPassageCrossings(floors).every(r=>r.exposed.every(([x,z])=>flatWalkable(floors[r.floor],x,z,.28))));
let scheduledCases=0;
for(const floor of floors)for(const c of floor.corridors)for(let i=1;i<c.points.length;i++){
 const a=c.points[i-1],b=c.points[i],length=Math.hypot(b[0]-a[0],b[1]-a[1]);if(length<SIGHTING_DISTANCE.min+3)continue;
 for(const reverse of [false,true])for(const randomValue of [0,.5,.999]){
  const start=reverse?b:a,end=reverse?a:b,direction=end.map((v,j)=>(v-start[j])/length);
  const position=[1.2,1.6,2,2.4].map(d=>start.map((v,j)=>v+direction[j]*d)).find(([x,z])=>flatWalkable(floor,x,z,.28));
  assert(position,'Long corridor has a walkable approach');
  const t=setup({floor:floor.id,x:position[0],z:position[1],lookX:end[0],lookZ:end[1],random:()=>randomValue});
  const starts=[],seen=[];let wasActive=false;
  for(let frame=1;frame<=61*60;frame++){
   t.step(1/60);
   if(t.sightings.active&&!wasActive){starts.push(frame/60);seen.push(false);}
   if(visible(t)){
    seen[seen.length-1]=true;
    assert(Math.hypot(t.actor.x-t.figure.position.x,t.actor.z-t.figure.position.z)>=SIGHTING_DISTANCE.min);
   }
   wasActive=t.sightings.active;
  }
  const label=`floor ${floor.id}, ${c.id}/${i}, reverse ${reverse}, random ${randomValue}`;
  assert.deepEqual(starts,[20,40,60],`Fixed 20-second appearances: ${label}`);
  assert(seen.every(Boolean),`Every crossing is exposed in the view: ${label}`);
  t.sightings.dispose();scheduledCases++;
 }
}

// Measure against actual corridor ends, including distances well beyond the
// old fixed 42-metre cap and a wall cutting an otherwise longer hall short.
for(const length of [30,55,100])for(const blocked of [false,true])for(const randomValue of [0,.5,.999]){
 const end=blocked?length*.7:length;if(end-1<25)continue;
 const outline=[[-1.2,0],[1.2,0],[1.2,length],[-1.2,length]];
 const floor={id:0,elevation:0,outline:{loops:[outline]},shafts:[],roomDoors:[],
  corridors:[{points:[[0,0],[0,length]],width:2.4}],
  walls:outline.map((a,i)=>({a,b:outline[(i+1)%outline.length]}))};
 if(blocked)floor.walls.push({a:[-1.2,end],b:[1.2,end]});
 const t=setup({x:0,z:1,lookX:0,lookZ:length,layouts:[floor],random:()=>randomValue});
 assert(awaitSighting(t),'Clear distant corridor produces a crossing');
 const distance=t.figure.position.z-1;
 assert(distance>=(end-1)*.8-1e-6&&distance<=end-1,`Crossing stays in the furthest 20% of ${end-1} clear metres: ${distance}`);
 t.sightings.dispose();
}

// Reproduce ordinary forward walking, rather than posing the camera off-axis
// and waiting at a junction. Room exploration must also advance the first wait.
const approaches=[
 {name:'east rear wing',start:[35.8,-30],direction:[0,1]},
 {name:'west cross-range',start:[-10,8.2],direction:[-1,0]},
 {name:'east cross-range',start:[10,8.2],direction:[1,0]}
];
for(const approach of approaches)for(const floor of [0,1])for(const speed of [5,12])for(const randomValue of [0,.5,.999]){
 const t=setup({floor,x:0,z:14,lookX:0,lookZ:6,random:()=>randomValue});
 for(let i=0;i<300;i++)t.step();
 assert(!t.sightings.active,'Time in Reception never spawns a figure in the room');
 let observed=false;
 for(let distance=0;distance<20;distance+=speed/60){
  const [dx,dz]=approach.direction,x=approach.start[0]+dx*distance,z=approach.start[1]+dz*distance;
  assert(flatWalkable(floors[floor],x,z,.28),'Test follows a real clear corridor');
  t.actor.x=x;t.actor.z=z;t.camera.position.set(x,t.actor.y+1.65,z);t.camera.lookAt(x+dx*10,t.actor.y+1.65,z+dz*10);
  t.step(1/60);
  if(visible(t)){observed=true;break;}
 }
 assert(observed,`Ordinary straight-ahead walk gets a distant crossing: ${approach.name}, floor ${floor}, speed ${speed}, random ${randomValue}`);
 t.sightings.dispose();
}
const test=setup();
for(let i=0;i<199;i++)test.step();assert(!test.sightings.active,'No sighting before 20 seconds');
assert(awaitSighting(test),'A distant, oblique view of the real east junction admits a crossing');
const start=test.figure.position.clone();
test.step(.3);assert(test.figure.position.distanceTo(start)>2,'Figure darts across at least two metres in .3 seconds');
assert(Math.hypot(test.actor.x-test.figure.position.x,test.actor.z-test.figure.position.z)>=SIGHTING_DISTANCE.min);
const destination=test.figure.position.clone();
test.actor.x+=.4;test.step(.1);
assert(destination.clone().sub(start).cross(test.figure.position.clone().sub(destination)).length()<1e-8,'Player movement never changes its fixed crossing route');
test.step(.5);assert(!test.sightings.active&&!test.figure.visible,'Entire crossing finishes within one second');
for(let i=0;i<180;i++)test.step();assert(!test.sightings.active,'No early repeat');
assert(awaitSighting(test,2),'Same corridor repeats after 20 seconds');

const blocked=setup({lookX:35.8}),wall={a:[34.5,-12],b:[37.1,-12]};floors[0].walls.push(wall);
assert(!awaitSighting(blocked),'An intervening corridor wall blocks a sighting');floors[0].walls.pop();
assert(awaitSighting(blocked),'Removing the intervening wall restores the sightline');

for(const [label,options,change] of [
 ['too little corridor ahead',{z:-30,lookX:35.8,lookZ:-40},()=>{}],
 ['short upper corridor',{floor:3,x:-8.25,z:12.2,lookX:7.6,lookZ:12.2},()=>{}],
 ['looking into the side wall',{lookX:50,lookZ:-18},()=>{}],['unloaded rooms',{ready:false},()=>{}],
 ['outside',{},t=>t.actor.outside=true],['stairs',{},t=>t.actor.stair={}],
 ['through walls',{x:20,z:-18},()=>{}]
]){
 const t=setup(options);change(t);assert(!awaitSighting(t),`No sighting ${label}`);t.sightings.dispose();
}
for(const [label,change] of [
 ['pause',t=>t.step(0)],['tab/frame stall',t=>t.step(3)],['outdoors',t=>{t.actor.outside=true;t.step();}],
 ['floor change',t=>{t.actor.floor=1;t.step();}],['approach',t=>{t.actor.x=t.figure.position.x;t.actor.z=t.figure.position.z;t.step();}]
]){
 const t=setup();assert(awaitSighting(t));change(t);assert(!t.sightings.active&&!t.figure.visible,`${label} removes figure immediately`);
 t.sightings.reset();assert(!t.figure.visible);t.sightings.dispose();assert.equal(t.scene.children.length,0);
}
const upper=setup({floor:1});assert(awaitSighting(upper));assert.equal(upper.figure.position.y,4.2);
const missed=setup({lookX:35.8});assert(awaitSighting(missed));
missed.camera.lookAt(50,1.65,-18);
for(let i=0;i<10;i++)missed.step();assert(!missed.sightings.active);
missed.camera.lookAt(35.8,1.65,8.2);
assert(awaitSighting(missed,1),'An unseen crossing does not consume the long cooldown');
const ahead=setup({lookX:35.8});assert(awaitSighting(ahead,20.1),'A distant crossing appears straight ahead at 20 seconds');
// Pause time must not advance the initial wait, including repeated menu draws.
const paused=setup();for(let i=0;i<1000;i++)paused.step(0);paused.step(.1);assert(!paused.sightings.active);
assert(routes.every(r=>segmentDistance(35.8,-18,r.a,r.b)>0));
console.log(`PASS: ${scheduledCases} real corridor/direction/random cases cross at 20/40/60 seconds; 80–100% placement in 30/55/100-metre and obstructed corridors, minimum 20 metres, walking/sprinting, unseen retries, loading, pause and proximity cancellation.`);
