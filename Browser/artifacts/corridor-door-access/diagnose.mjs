import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import * as THREE from '../../dist/vendor/three.module.js';
import {createEscapeExterior} from '../../dist/escape-exterior.mjs';
import {createAerialLayouts} from '../../dist/aerial-layouts.mjs';
import {prepareEstateTimeline} from '../../dist/estate-timeline.mjs';
import {createExploreWalker} from '../../dist/explore-walker.mjs';
import {createExploreWorkshops} from '../../dist/explore-workshops.mjs';
import {buildAsylumLayout} from '../../dist/asylum-layout.mjs';
import {EXPLORE_CORRIDOR_ENTRANCE,EXPLORE_CORRIDOR_RUNS,EXPLORE_IRBY_ENTRANCE} from '../../dist/explore-corridor-plan.mjs';
import {ESCAPE_CORRIDOR_DOORS} from '../../dist/escape-corridor-plan.mjs';
import {ADMIN_FRONT_CORRIDOR} from '../../dist/admin-front-corridor.mjs';
const context=new Proxy({},{get:(_,key)=>key==='measureText'?text=>({width:text.length*16}):/Gradient$/.test(key)?()=>({addColorStop(){}}):()=>{}});
globalThis.document={createElement:()=>({getContext:()=>context})};
const exterior=createEscapeExterior(THREE,1.5),layouts=createAerialLayouts(THREE,exterior),timeline=prepareEstateTimeline(THREE,exterior,layouts);
const floors=buildAsylumLayout(JSON.parse(await readFile(new URL('../../dist/asylum-plan.json',import.meta.url)))).floors;
let controller;const walker=createExploreWalker(THREE,exterior,floors,{doorInteractions:{nearbyDoor:actor=>controller?.nearbyDoor(actor),useDoor:door=>controller.useDoor(door)}});
controller=createExploreWorkshops(THREE,exterior,walker,timeline);controller.refresh();
const actor=walker.actor,w=controller.workshops,[cx,frontZ]=EXPLORE_CORRIDOR_ENTRANCE.point;
function pose(x,z,tx=x,tz=z-1){walker.setView({position:[x,1.8,z],target:[tx,1.8,tz]});}
function step(dt=.04){walker.update(dt);controller.update(dt,actor);}
function press(){walker.keys.add('KeyE');step();walker.keys.delete('KeyE');step();}
function settle(){for(let i=0;i<30;i++)step();}
function follow(points){
 for(const [x,z] of points){
  for(let i=0;i<5000&&Math.hypot(actor.x-x,actor.z-z)>.025;i++){
   const dx=x-actor.x,dz=z-actor.z,d=Math.hypot(dx,dz),yaw=Math.atan2(-dx,-dz);
   walker.look((exterior.camera.rotation.y-yaw)/.002,0);walker.keys.add('KeyW');step(Math.min(.04,d/5));
  }
  walker.keys.clear();assert(Math.hypot(actor.x-x,actor.z-z)<.04,'Physical walk reaches '+JSON.stringify({target:[x,z],actor}));
 }
}

const {exteriorObstacles,obstacleContains}=await import('../../dist/explore-controls.mjs');
exterior.model.traverse(o=>{if(o.userData.aerialBatch||o.userData.aerialBatchSource)o.visible=!!o.userData.aerialBatchSource;});const blocked=[];exterior.model.traverseVisible(o=>{if(!o.isMesh)return;const obs=exteriorObstacles(THREE,{updateMatrixWorld(){},traverseVisible(fn){fn(o);}},{preciseFootprints:true});for(const b of obs)if(b.minY<1.5&&b.maxY>.35&&obstacleContains(b,75.1,-198.3,.27))blocked.push({name:o.name,parent:o.parent.name,b,minY:b.minY,maxY:b.maxY});});console.log(JSON.stringify(blocked,null,2));
console.log('Scenario',JSON.stringify(w.solids.filter(b=>obstacleContains(b,75.1,-198.3,.27))));