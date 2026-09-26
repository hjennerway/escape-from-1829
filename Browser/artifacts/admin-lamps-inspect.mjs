import * as THREE from '../dist/vendor/three.module.js';
import {createEscapeExterior} from '../dist/escape-exterior.mjs';
import {createAerialLayouts} from '../dist/aerial-layouts.mjs';
import {prepareEstateTimeline} from '../dist/estate-timeline.mjs';
import {ADMIN_TEARDROP} from '../dist/historic-road-layout.mjs';
globalThis.document={createElement:()=>({getContext:()=>({fillRect(){},measureText:t=>({width:t.length*16}),strokeText(){},fillText(){}})})};
const exterior=createEscapeExterior(THREE,1.5),layouts=createAerialLayouts(THREE,exterior);prepareEstateTimeline(THREE,exterior,layouts);exterior.model.updateMatrixWorld(true);
exterior.model.traverse(o=>{if(o.userData.streetLamps){const nearby=o.userData.streetLamps.map((p,i)=>({i,...p})).filter(p=>p.x>230&&p.x<280&&p.z>0&&p.z<60);if(nearby.length)console.log(o.name,JSON.stringify(nearby),o.getWorldPosition(new THREE.Vector3()).toArray());}});
console.log('ISLAND',JSON.stringify(ADMIN_TEARDROP)); console.log('TERRAIN',exterior.terrain.position.toArray());
