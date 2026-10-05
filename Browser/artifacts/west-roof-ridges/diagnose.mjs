import * as THREE from '../../dist/vendor/three.module.js';
import {createEscapeExterior} from '../../dist/escape-exterior.mjs';
globalThis.document={createElement:()=>({getContext:()=>({fillRect(){}})})};
const {model}=createEscapeExterior(THREE,1.5);model.updateMatrixWorld(true);
const ray=new THREE.Raycaster();
function top(x,z){ray.set(new THREE.Vector3(x,30,z),new THREE.Vector3(0,-1,0));const h=ray.intersectObject(model,true)[0];return {x,z,y:h?.point.y,name:h?.object.name};}
console.log(JSON.stringify([6.601,8,9.25,11,12,14,15.499].map(z=>[top(-27.0001,z),top(-26.9999,z)]),null,2));
console.log(JSON.stringify([-24.5,-20,-10,-6,-2,2,4,5,5.5,6,6.5,7,9,11.9,12,12.01].map(z=>top(-31,z)),null,2));
