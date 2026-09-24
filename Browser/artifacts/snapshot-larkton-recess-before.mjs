import {writeFileSync} from 'node:fs';
import * as THREE from '../dist/vendor/three.module.js';
import {createEscapeExterior} from '../dist/escape-exterior.mjs';
import {recessProtected} from './larkton-recess-scope.mjs';
import {larktonProtected} from './larkton-scope.mjs';
globalThis.document={createElement:()=>({getContext:()=>({fillRect(){}})})};
const a=createEscapeExterior(THREE,1.5).annexe;
writeFileSync(new URL('../../Research/larkton-jodrell/recess-protected-before.json',import.meta.url),JSON.stringify({retained:recessProtected(THREE,a),outside:larktonProtected(THREE,a),ranges:a.userData.ranges.filter(b=>b.wardId==='larkton-jodrell').map(({name,x,z,w,d,h,r})=>({name,x,z,w,d,h,r}))},null,2)+'\n');
