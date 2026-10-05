import * as THREE from '../../dist/vendor/three.module.js';
import {createEscapeExterior} from '../../dist/escape-exterior.mjs';
globalThis.document={createElement:()=>({getContext:()=>({fillRect(){}})})};
console.time('build');const {model}=createEscapeExterior(THREE,1.5);model.updateMatrixWorld(true);console.timeEnd('build');
const material=model.getObjectByName('West end continuous slate roof').material,roofs=[];
model.traverse(o=>{if(o.isMesh&&o.material===material)roofs.push(o);});
console.log('roofs',roofs.length,'vertices',roofs.reduce((s,o)=>s+o.geometry.attributes.position.count,0));
const ray=new THREE.Raycaster();console.time('ray');ray.set(new THREE.Vector3(-64,30,9.25),new THREE.Vector3(0,-1,0));
console.log(ray.intersectObjects(roofs,false).slice(0,4).map(h=>({name:h.object.name,y:h.point.y})));console.timeEnd('ray');
