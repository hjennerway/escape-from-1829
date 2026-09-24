import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import * as THREE from '../dist/vendor/three.module.js';
import {createEscapeExterior} from '../dist/escape-exterior.mjs';
import {jarmanProtected} from './jarman-scope.mjs';
globalThis.document={createElement:()=>({getContext:()=>({fillRect(){},clearRect(){},fillText(){},strokeText(){},measureText(t){return {width:t.length*16}}})})};
const current=jarmanProtected(THREE,createEscapeExterior(THREE,16/9).model),url=new URL('../../Research/jarman/protected-geometry.json',import.meta.url);
if(process.argv.includes('--save'))writeFileSync(url,JSON.stringify(current,null,2)+'\n');else assert.deepEqual(current,JSON.parse(readFileSync(url)));
console.log('PASS: Jarman whole-estate snapshot',current);
