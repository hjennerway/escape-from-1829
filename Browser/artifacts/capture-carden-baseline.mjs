import assert from 'node:assert/strict';
import {mkdirSync,writeFileSync} from 'node:fs';
import * as THREE from '../dist/vendor/three.module.js';
import {createEscapeExterior} from '../dist/escape-exterior.mjs';
import {protectedCardenGeometry} from './annexe-carden-scope.mjs';
globalThis.document={createElement:()=>({getContext:()=>({fillRect(){}})})};
const {annexe}=createEscapeExterior(THREE,1.5);
assert(!annexe.userData.cardenElevation,'Capture only from the saved pre-refinement model');
const dir=new URL('../../Research/carden-picton/',import.meta.url);mkdirSync(dir,{recursive:true});
writeFileSync(new URL('protected-geometry.json',dir),JSON.stringify(protectedCardenGeometry(THREE,annexe),null,2)+'\n');
// Retain a direct surface reference for the unpictured west slope and the
// two permitted meshes, rather than silently discarding their preservation.
const slope=annexe.getObjectByName('Oakmere raised spine slate roof');
writeFileSync(new URL('spine-roof-before.json',dir),JSON.stringify({position:[...slope.geometry.attributes.position.array],uv:[...slope.geometry.attributes.uv.array],transform:slope.matrix.toArray()},null,2)+'\n');
console.log('Saved Carden preservation baseline before modelling.');
