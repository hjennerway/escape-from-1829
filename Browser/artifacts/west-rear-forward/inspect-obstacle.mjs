import * as THREE from '../../dist/vendor/three.module.js';
import {createEscapeExterior} from '../../dist/escape-exterior.mjs';
import {exteriorObstacles,obstacleContains} from '../../dist/explore-controls.mjs';
globalThis.document={createElement:()=>({getContext:()=>({fillRect(){}})})};
const e=createEscapeExterior(THREE,1.5);e.model.updateMatrixWorld(true);
const obstacles=exteriorObstacles(THREE,e.model);
for(const [x,z] of [[-55.5,17.7],[-49.5,17.7],[-55.5,16.8],[-49.5,16.8]])
console.log(JSON.stringify({x,z,blockers:obstacles.filter(o=>obstacleContains(o,x,z)).map(o=>({...o,object:undefined}))}));
