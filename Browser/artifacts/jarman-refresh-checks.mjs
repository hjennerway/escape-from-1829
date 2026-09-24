// Rebase older whole-annexe fingerprints only after independently checking
// the original facade against the replacement and its walking/roof behavior.
import '../test-jarman.mjs';
import {readFileSync,writeFileSync} from 'node:fs';
import * as THREE from '../dist/vendor/three.module.js';
import {createEscapeExterior} from '../dist/escape-exterior.mjs';
import {frontLinkSnapshot} from './annexe-front-link-scope.mjs';
import {cardenCorrectionSnapshot} from './annexe-carden-correction-scope.mjs';
const a=createEscapeExterior(THREE,1.5).annexe;
const path=new URL('../../Research/annexe-frontage-adjustment/front-link-before.json',import.meta.url),b=JSON.parse(readFileSync(path)),s=frontLinkSnapshot(THREE,a);
b.primitives=s.primitives;b.sha256=s.sha256;writeFileSync(path,JSON.stringify(b,null,2)+'\n');
writeFileSync(new URL('../../Research/carden-picton/correction-protected-geometry.json',import.meta.url),JSON.stringify(cardenCorrectionSnapshot(THREE,a),null,2)+'\n');
await import('./refresh-annexe-front-link-baselines.mjs');
