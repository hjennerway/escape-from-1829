import assert from 'node:assert/strict';
import * as THREE from './dist/vendor/three.module.js';
import {createEscapeExterior} from './dist/escape-exterior.mjs';
import {createAerialLayouts} from './dist/aerial-layouts.mjs';
import {pointInFootprint} from './dist/historic-footprints.mjs';
globalThis.document={createElement:()=>({getContext:()=>({fillRect(){},measureText:t=>({width:t.length*16}),strokeText(){},fillText(){}})})};
const exterior=createEscapeExterior(THREE,1.5),layouts=createAerialLayouts(THREE,exterior);
exterior.scene.updateMatrixWorld(true);
const ray=new THREE.Raycaster();
function roadsAt(x,z){ray.set(new THREE.Vector3(x,2,z),new THREE.Vector3(0,-1,0));return ray.intersectObject(layouts.historicRoads,true).filter(h=>['black road','stone kerb'].includes(h.object.userData.surface));}
for(const p of [[226,-106],[229,-94],[245,-94],[248,-94],[222,-98],[233,-109]])assert.equal(roadsAt(...p).length,0,'Rear and former under-building surface removed: '+p);
for(const p of [[263.25,-108],[260.65,-87],[267,-108],[267,-94],[267,-80],[265,-72],[246,-72],[229,-77],[245,-77]])assert(roadsAt(...p).some(h=>h.object.userData.surface==='black road'),'Flush side/front connection: '+p);
for(let x=205;x<263;x+=.8)for(let z=-113;z<-63;z+=.8){
 if(pointInFootprint([x,z],exterior.irbyAshley.userData.footprint))assert.equal(roadsAt(x,z).length,0,'No road beneath ward: '+[x,z]);
}
for(const p of [[223,-66.6],[223,-71],[223,-77],[221.2,-62.5]])assert(roadsAt(...p).some(h=>h.object.userData.surface==='black road'),'Service court wraps flush around the new corridor end: '+p);
for(const p of [[220,-66.6],[216,-70],[220,-75]])assert.equal(roadsAt(...p).length,0,'Asphalt is trimmed beneath the blue ward and red corridor footprints: '+p);
console.log('PASS: rear grass, no road beneath Irby/Ashley, flush east-side access and continuous front connection.');
