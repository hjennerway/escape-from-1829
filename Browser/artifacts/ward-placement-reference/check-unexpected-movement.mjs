// Negative control: current references must reject an unrelated wall movement.
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import * as THREE from '../../dist/vendor/three.module.js';
import {createEscapeExterior} from '../../dist/escape-exterior.mjs';
import {jarmanProtected} from '../jarman-scope.mjs';
import {leightonProtected} from '../leighton-scope.mjs';
import {larktonProtected} from '../larkton-scope.mjs';
globalThis.document={createElement:()=>({getContext:()=>({fillRect(){}})})};
const e=createEscapeExterior(THREE,1.5),read=name=>JSON.parse(readFileSync(new URL('../../../Research/'+name,import.meta.url)));
const cases=[
 ['Jarman',()=>jarmanProtected(THREE,e.model),read('jarman/protected-geometry.json')],
 ['Leighton/Newton',()=>leightonProtected(THREE,e.model),read('leighton-newton/protected-before.json').geometry],
 ['Annexe',()=>larktonProtected(THREE,e.annexe),read('larkton-jodrell/recess-protected-before.json').outside]
];
for(const [,capture,expected] of cases)assert.deepEqual(capture(),expected);
const wall=e.annexe.getObjectByName('East court back range brick walls');assert(wall);
wall.position.x+=.01;
try{for(const [name,capture,expected] of cases)assert.throws(()=>assert.deepEqual(capture(),expected),{code:'ERR_ASSERTION'},name+' still rejects an unexpected wall movement');}
finally{wall.position.x-=.01;}
writeFileSync(new URL('negative-controls.json',import.meta.url),JSON.stringify({movement:.01,object:wall.name,rejected:cases.map(([name])=>name)},null,2)+'\n');
console.log('PASS: all three refreshed scopes reject the unexpected 0.01-unit wall movement.');
