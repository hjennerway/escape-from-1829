import {createHash} from 'node:crypto';
import * as THREE from '../../dist/vendor/three.module.js';
import {createEscapeExterior} from '../../dist/escape-exterior.mjs';
import {exteriorObstacles} from '../../dist/explore-controls.mjs';
globalThis.document={createElement:()=>({getContext:()=>({fillRect(){}})})};
const e=createEscapeExterior(THREE,1.5);e.scene.updateMatrixWorld(true);
const obstacles=exteriorObstacles(THREE,e.model);
console.log(JSON.stringify({count:obstacles.length,hash:createHash('sha256').update(JSON.stringify(obstacles)).digest('hex')}));
