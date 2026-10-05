import * as THREE from '../../dist/vendor/three.module.js';
import {createEscapeExterior} from '../../dist/escape-exterior.mjs';
globalThis.document={createElement:()=>({getContext:()=>({fillRect(){}})})};
const {model}=createEscapeExterior(THREE,1.5);model.updateMatrixWorld(true);const ray=new THREE.Raycaster(),material=model.getObjectByName('West end continuous slate roof').material,roofs=[];model.traverse(o=>{if(o.isMesh&&o.material===material)roofs.push(o);});
function top(x,z){ray.set(new THREE.Vector3(x,30,z),new THREE.Vector3(0,-1,0));return ray.intersectObjects(roofs,false)[0]?.point.y;}
for(const [x,z] of [[-64.25,12],[-64.25,13],[-66,6],[-66,7],[-66,8],[-61,4.85],[-61,5.1],[-58,14.3],[-54.6,4.3],[-27.3,12],[-27.3,18.3],[-61,13.9],[-45,13.9]])console.log(JSON.stringify({x,z,y:top(x,z)}));
