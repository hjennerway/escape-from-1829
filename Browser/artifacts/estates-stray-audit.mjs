import * as THREE from '../dist/vendor/three.module.js';
import {createEscapeExterior} from '../dist/escape-exterior.mjs';
import {createAerialLayouts} from '../dist/aerial-layouts.mjs';
import {prepareEstateTimeline} from '../dist/estate-timeline.mjs';
globalThis.document={createElement:()=>({getContext:()=>({fillRect(){},clearRect(){},fillText(){},strokeText(){},measureText:t=>({width:t.length*16})})})};
const e=createEscapeExterior(THREE,1.6),l=createAerialLayouts(THREE,e),t=prepareEstateTimeline(THREE,e,l);
e.scene.updateMatrixWorld(true);
const visible=o=>{for(;o;o=o.parent)if(!o.visible)return false;return true;};
const result=[];
e.model.traverse(o=>{
 if(!o.userData.groundContact)return;
 const b=new THREE.Box3().setFromObject(o),c=b.getCenter(new THREE.Vector3());
 const owner=o.parent.children.find(s=>!s.userData.groundContact&&s.name===o.userData.groundContactOwner);
 if(visible(o)&&(!owner||!visible(owner)||o.material.color.getHexString()==='426735'))result.push({name:o.name,parent:o.parent.name,visible:visible(o),ownerVisible:owner&&visible(owner),min:b.min.toArray(),max:b.max.toArray(),color:o.material.color.getHexString()});
});
console.log(JSON.stringify(result,null,2));
