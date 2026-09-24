import * as THREE from '../dist/vendor/three.module.js';
import {createEscapeExterior} from '../dist/escape-exterior.mjs';
import {leightonProtected} from './leighton-scope.mjs';
globalThis.document={createElement:()=>({getContext:()=>({fillRect(){},fillText(){},strokeText(){},measureText(t){return {width:t.length*16}}})})};
const e=createEscapeExterior(THREE,1.5),g=e.annexe.userData.leightonNewton;
console.log(JSON.stringify({protected:leightonProtected(THREE,e.model),openings:g.userData.openings.map(({blocked,...o})=>o),ranges:e.annexe.userData.wards['leighton-newton'].userData.ranges}));
