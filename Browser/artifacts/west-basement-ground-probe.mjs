import * as THREE from '../dist/vendor/three.module.js';
import {createEscapeExterior} from '../dist/escape-exterior.mjs';
import {createAerialLayouts} from '../dist/aerial-layouts.mjs';
globalThis.document={createElement:()=>({getContext:()=>({fillRect(){},fillText(){},strokeText(){},measureText(t){return {width:t.length*16}}})})};
const e=createEscapeExterior(THREE,1.6);const layouts=createAerialLayouts(THREE,e);layouts.setVisible('historic',false);layouts.setVisible('modern',true);e.model.updateMatrixWorld(true);
const meshes=[];e.model.traverseVisible(o=>{if(o.isMesh)meshes.push(o)});
const ray=new THREE.Raycaster();
for(const [x,z] of [[-40.5,-26.05],[-40.5,-25.95],[-43,-26.05],[-43,-25.95],[-50,-26.05],[-50,-25.95]]){
 ray.set(new THREE.Vector3(x,.6,z),new THREE.Vector3(0,-1,0));
 console.log([x,z],ray.intersectObjects(meshes,false).slice(0,5).map(h=>({name:h.object.name,y:h.point.y,position:h.object.position.toArray(),instance:h.instanceId,geometry:h.object.geometry.type,material:h.object.material.color.getHex()})));
}
