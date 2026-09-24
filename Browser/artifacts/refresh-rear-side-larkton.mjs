import {writeFileSync} from 'node:fs';
import * as THREE from '../dist/vendor/three.module.js';
import {createEscapeExterior} from '../dist/escape-exterior.mjs';
import {larktonProtected} from './larkton-scope.mjs';
globalThis.document={createElement:()=>({getContext:()=>({fillRect(){}})})};
writeFileSync('Research/larkton-jodrell/protected-before.json',JSON.stringify(larktonProtected(THREE,createEscapeExterior(THREE,1.5).annexe),null,2)+'\n');
