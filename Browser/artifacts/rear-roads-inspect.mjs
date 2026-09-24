import * as THREE from '../dist/vendor/three.module.js';
import {createEscapeExterior} from '../dist/escape-exterior.mjs';
import {createAerialLayouts} from '../dist/aerial-layouts.mjs';
import {writeFileSync} from 'node:fs';
globalThis.document={createElement:()=>({getContext:()=>({fillRect(){},measureText(t){return {width:t.length*16}},strokeText(){},fillText(){}})})};
const e=createEscapeExterior(THREE,1.5),l=createAerialLayouts(THREE,e);e.model.updateMatrixWorld(true);
const rows=[];e.annexe.traverse(o=>{if(o.isMesh&&/roof|walls/i.test(o.name)&&/Rear court west|Oakmere|Rear service|Rear east/i.test(o.name)){const box=new THREE.Box3().setFromObject(o); rows.push({name:o.name,box:[box.min.toArray(),box.max.toArray()],matrix:o.matrixWorld.toArray(),positions:Array.from(o.geometry.attributes.position.array)});}});
writeFileSync('Browser/artifacts/rear-roads-geometry.json',JSON.stringify(rows));
console.log(rows.map(({name,box,matrix})=>({name,box,matrix})));console.log(e.annexe.userData.ranges.filter(r=>/Rear|East rear|East front/i.test(r.name)));
