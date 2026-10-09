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
import {probeIrbyEntrance} from '../../test-support/irby-entrance-probes.mjs';
import {probeWorkshopExterior} from '../../test-support/workshop-exterior-probes.mjs';
const context=new Proxy({},{get:(_,key)=>key==='measureText'?text=>({width:text.length*16}):/Gradient$/.test(key)?()=>({addColorStop(){}}):()=>{}});
globalThis.document={createElement:()=>({getContext:()=>context})};
const exterior=createEscapeExterior(THREE,1.5),layouts=createAerialLayouts(THREE,exterior),timeline=prepareEstateTimeline(THREE,exterior,layouts);
const floors=buildAsylumLayout(JSON.parse(await readFile(new URL('../../dist/asylum-plan.json',import.meta.url)))).floors;
let controller;const walker=createExploreWalker(THREE,exterior,floors,{doorInteractions:{nearbyDoor:actor=>controller?.nearbyDoor(actor),useDoor:door=>controller.useDoor(door)}});
controller=createExploreWorkshops(THREE,exterior,walker,timeline);controller.refresh();
const door=controller.workshops.doors.find(d=>d.id==='irby-corridor-door');
controller.workshops.setDoorOpen(door.id,true);for(let i=0;i<30;i++)controller.update(.04,walker.actor);
exterior.model.updateMatrixWorld(true);const meshes=[];exterior.model.traverseVisible(o=>{if(o.isMesh)meshes.push(o);});
for(const dx of [-2,-1,-.4,-.2,-.1,0,.1,.3,.5])for(const dz of [-.8,0,.8]){
 const hits=new THREE.Raycaster(new THREE.Vector3(door.x+dx,1,door.z+dz),new THREE.Vector3(0,-1,0),0,1.5).intersectObjects(meshes,false).filter(h=>h.point.y>-.1);
 console.log(JSON.stringify({dx,dz,hits:hits.map(h=>({name:h.object.name,y:h.point.y,bias:h.object.material.polygonOffset,factor:h.object.material.polygonOffsetFactor,units:h.object.material.polygonOffsetUnits}))}));
}
