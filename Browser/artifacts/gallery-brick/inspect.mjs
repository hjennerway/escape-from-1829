import * as THREE from '../../dist/vendor/three.module.js';
import {createEscapeExterior} from '../../dist/escape-exterior.mjs';
import {createAerialLayouts} from '../../dist/aerial-layouts.mjs';
import {prepareEstateTimeline} from '../../dist/estate-timeline.mjs';
globalThis.document={createElement:()=>({getContext:()=>({fillRect(){},fillText(){},strokeText(){},measureText:t=>({width:t.length*16})})})};
const e=createEscapeExterior(THREE,1.6),layouts=createAerialLayouts(THREE,e);
prepareEstateTimeline(THREE,e,layouts).setPeriod(1900);
e.model.updateMatrixWorld(true);
const meshes=[];e.model.traverseVisible(o=>{if(o.isMesh)meshes.push(o)});
const ray=new THREE.Raycaster();ray.far=1;
for(const y of [-.7,.16,.29,.5,1,2.5])for(const x of [-37.8,-37.65,-37.55,-37.45]){
 ray.set(new THREE.Vector3(x,y,-30),new THREE.Vector3(0,0,-1));
 const hits=ray.intersectObjects(meshes,false);
 console.log(JSON.stringify({x,y,hits:hits.slice(0,4).map(h=>({point:h.point.toArray(),name:h.object.name,parent:h.object.parent.name,material:h.object.material.color?.getHexString(),data:h.object.userData,instance:h.instanceId}))}));
}
