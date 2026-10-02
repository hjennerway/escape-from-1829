import * as THREE from '../../dist/vendor/three.module.js';
import {createEscapeExterior} from '../../dist/escape-exterior.mjs';
import {jarmanProtected} from '../jarman-scope.mjs';
import {leightonProtected} from '../leighton-scope.mjs';
import {writeFileSync} from 'node:fs';
globalThis.document={createElement:()=>({getContext:()=>({fillRect(){},clearRect(){},fillText(){},strokeText(){},measureText:t=>({width:t.length*16})})})};
const e=createEscapeExterior(THREE,1.6),snapshot={jarman:jarmanProtected(THREE,e.model),leighton:leightonProtected(THREE,e.model)};
console.log(JSON.stringify(snapshot));writeFileSync(new URL(process.argv.includes('--before')?'baseline-estate-fingerprint.json':'final-estate-fingerprint.json',import.meta.url),JSON.stringify(snapshot,null,2)+'\n');
