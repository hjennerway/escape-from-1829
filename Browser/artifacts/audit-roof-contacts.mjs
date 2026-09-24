import * as THREE from '../dist/vendor/three.module.js';
import {createEscapeExterior} from '../dist/escape-exterior.mjs';
globalThis.document={createElement:()=>({getContext:()=>({fillRect(){}})})};
const e=createEscapeExterior(THREE,1.5);e.scene.updateMatrixWorld(true);
const roofs=[],parts=[];const roofMaterials=new Set();e.model.traverse(o=>{if(/slate roof/i.test(o.name))roofMaterials.add(o.material);});
e.model.traverse(o=>{if(!o.isMesh||o.isInstancedMesh)return;if((/roof/i.test(o.name)||roofMaterials.has(o.material))&&!/(chimney|finial|vane)/i.test(o.name))roofs.push(o);if(/chimney|belfry|bell tower|ventilator|dormer/i.test(o.name))parts.push(o);});
const ray=new THREE.Raycaster();
for(const o of parts){o.geometry.computeBoundingBox();const b=o.geometry.boundingBox;if(!/chimney|base|cheek/i.test(o.name)||/pot|cap|breast|projection|shaft|flue|lip|rim|throat|crown/i.test(o.name)&&!/Churton/i.test(o.name))continue;const samples=[];for(const x of [b.min.x,b.max.x])for(const z of [b.min.z,b.max.z]){const p=new THREE.Vector3(x,b.min.y,z).applyMatrix4(o.matrixWorld);ray.set(new THREE.Vector3(p.x,p.y+30,p.z),new THREE.Vector3(0,-1,0));const h=ray.intersectObjects(roofs,false).find(h=>h.point.y<p.y+15);samples.push(h?+(p.y-h.point.y).toFixed(3):null);}console.log(JSON.stringify({name:o.name,parent:o.parent.name,gaps:samples}));}

