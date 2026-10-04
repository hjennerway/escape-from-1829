import * as THREE from '../../dist/vendor/three.module.js';
import {createEscapeExterior} from '../../dist/escape-exterior.mjs';
import {auditTripartitePanes} from './audit.mjs';
globalThis.document={createElement:()=>({getContext:()=>({fillRect(){}})})};
console.log('PASS:',auditTripartitePanes(THREE,createEscapeExterior(THREE,4/3).model));
