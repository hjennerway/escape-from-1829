import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import * as THREE from '../dist/vendor/three.module.js';
import {createEscapeExterior} from '../dist/escape-exterior.mjs';
import {larktonProtected} from './larkton-scope.mjs';
globalThis.document={createElement:()=>({getContext:()=>({fillRect(){}})})};
const protectedGeometry=larktonProtected(THREE,createEscapeExterior(THREE,1.5).annexe);
assert.deepEqual(protectedGeometry,JSON.parse(readFileSync(new URL('../../Research/larkton-jodrell/protected-before.json',import.meta.url))));
console.log('PASS: '+protectedGeometry.count+' approved non-Larkton primitives exact after normalizing the concurrent entrance depth');
