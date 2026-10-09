import * as THREE from '../../dist/vendor/three.module.js';
import {createEscapeExterior} from '../../dist/escape-exterior.mjs';
import {createAerialLayouts} from '../../dist/aerial-layouts.mjs';
const context=new Proxy({},{get:(_,key)=>key==='measureText'?text=>({width:text.length*16}):/Gradient$/.test(key)?()=>({addColorStop(){}}):()=>{}});
globalThis.document={createElement:()=>({getContext:()=>context})};
const exterior=createEscapeExterior(THREE,1.5);createAerialLayouts(THREE,exterior);exterior.model.updateMatrixWorld(true);
const h=exterior.haleWard;
console.log('Hale bays',JSON.stringify(h.userData.openings.map(o=>({...o,world:h.localToWorld(new THREE.Vector3(o.x,o.y,o.z)).toArray()})).filter(o=>o.world[2]>-70)));
const north=[];exterior.model.traverse(o=>{if(!o.isMesh||!/^North tower range|North.*coping|Roof underside: North tower range|Eave closure: North tower range/.test(o.name))return;const b=new THREE.Box3().setFromObject(o);north.push({name:o.name,min:b.min.toArray(),max:b.max.toArray()});});console.log('North',JSON.stringify(north));
