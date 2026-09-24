import * as THREE from '../dist/vendor/three.module.js';
import {createEscapeExterior} from '../dist/escape-exterior.mjs';
import {createAerialLayouts} from '../dist/aerial-layouts.mjs';
globalThis.document={createElement:()=>({getContext:()=>({fillRect(){},measureText(t){return {width:t.length*16}},strokeText(){},fillText(){}})})};
const e=createEscapeExterior(THREE,1.5),l=createAerialLayouts(THREE,e);e.model.updateMatrixWorld(true);
const r=new THREE.Raycaster(new THREE.Vector3(260.75,2,56.875),new THREE.Vector3(0,-1,0));console.log(r.intersectObject(l.historicRoads,true).slice(0,4).map(h=>({name:h.object.name,surface:h.object.userData.surface,p:h.point.toArray()})));
