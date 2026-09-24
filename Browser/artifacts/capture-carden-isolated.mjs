import {writeFileSync} from 'node:fs';
import * as THREE from '../dist/vendor/three.module.js';
import {createEscapeExterior} from '../dist/escape-exterior.mjs';
import {cardenCorrectionSnapshot} from './annexe-carden-correction-scope.mjs';
globalThis.document={createElement:()=>({getContext:()=>({fillRect(){}})})};
writeFileSync(new URL('../../Research/carden-picton/outward-protected-geometry.json',import.meta.url),JSON.stringify(cardenCorrectionSnapshot(THREE,createEscapeExterior(THREE,1.5).annexe,{excludeConcurrentJarman:true}),null,2)+'\n');
