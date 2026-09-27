import * as THREE from '../dist/vendor/three.module.js';
import {createEscapeExterior} from '../dist/escape-exterior.mjs';
import {createAerialLayouts} from '../dist/aerial-layouts.mjs';
globalThis.document={createElement:()=>({getContext:()=>({fillRect(){},fillText(){},strokeText(){},measureText(t){return {width:t.length*16}}})})};
const e=createEscapeExterior(THREE,1.6);createAerialLayouts(THREE,e);e.model.updateMatrixWorld(true);
const meshes=[];e.model.traverseVisible(o=>{if(o.isMesh)meshes.push(o)});
const ray=new THREE.Raycaster();
for(const [x,z] of [[-38.82,-35.5],[-38.3,-32],[-38.3,-18],[-38.3,-2]]){
 ray.set(new THREE.Vector3(x,.6,z),new THREE.Vector3(0,-1,0));
 console.log([x,z],ray.intersectObjects(meshes,false).slice(0,5).map(h=>({name:h.object.name,y:h.point.y,position:h.object.position.toArray(),instance:h.instanceId,geometry:h.object.geometry.type,bounds:new THREE.Box3().setFromObject(h.object).min.toArray(),material:h.object.material.color.getHex()})));
}
