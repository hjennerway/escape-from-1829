import {writeFileSync} from 'node:fs';
import * as THREE from '../dist/vendor/three.module.js';
import {createEscapeExterior} from '../dist/escape-exterior.mjs';
import {oakmereCourtProtected} from './oakmere-court-scope.mjs';
globalThis.document={createElement:()=>({getContext:()=>({fillRect(){}})})};
writeFileSync(new URL('../../Research/oakmere/court-protected-before.json',import.meta.url),JSON.stringify(oakmereCourtProtected(THREE,createEscapeExterior(THREE,1.5).annexe),null,2)+'\n');
