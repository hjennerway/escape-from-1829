import * as THREE from '../dist/vendor/three.module.js';
import {createEscapeExterior} from '../dist/escape-exterior.mjs';
import {jarmanProtected} from './jarman-scope.mjs';
import {leightonProtected} from './leighton-scope.mjs';
globalThis.document={createElement:()=>({getContext:()=>({fillRect(){},fillText(){},strokeText(){},measureText(t){return {width:t.length*16}}})})};
const e=createEscapeExterior(THREE,1.5);
console.log(JSON.stringify({jarman:jarmanProtected(THREE,e.model),leighton:leightonProtected(THREE,e.model)}));
