import assert from 'node:assert/strict';
import * as THREE from './dist/vendor/three.module.js';
import {createEscapeExterior} from './dist/escape-exterior.mjs';

globalThis.document={createElement:()=>({getContext:()=>({fillRect(){}})})};
const {model}=createEscapeExterior(THREE,1.5);model.updateMatrixWorld(true);
const entranceEdge=model.getObjectByName('Entrance west slate pitches to render edge');
const lowerRoof=model.getObjectByName('Entrance west recessed slate roof');
const ray=new THREE.Raycaster();
const height=(object,x,z)=>{
  ray.set(new THREE.Vector3(x,30,z),new THREE.Vector3(0,-1,0));
  const hit=ray.intersectObject(object,false)[0];
  assert(hit&&hit.face.normal.y>0,'The lower entrance roof stays complete with upward-facing slate');
  return hit.point.y;
};
let probes=0;
// Physical samples around the circled tip: the attached lower roof must
// descend to its own cornice instead of climbing through Reception's trim.
for(const x of [-8.1,-7.9,-7.7,-7.51,-7.3,-7.11]){
  assert(Math.abs(height(entranceEdge,x,16.7001)-height(lowerRoof,x,16.6999))<.001,
    'The entrance seam meets the lower roof, without sampling the higher Reception roof');
  for(const z of [16.7001,16.85,17,17.2]){
    const y=height(entranceEdge,x,z);
    assert(y>13.13&&y<13.4,'The entrance roof stays below Reception\'s cornice without the circled slate tip');
    probes++;
  }
}
console.log('PASS: '+probes+' entrance roof-tip probes and six adjoining lower-roof seam contacts.');
