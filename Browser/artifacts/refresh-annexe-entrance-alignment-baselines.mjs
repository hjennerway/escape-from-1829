// Refresh broad historical fingerprints only after the independent entrance-scope
// comparison has proved that every unrelated primitive remains unchanged.
import './annexe-entrance-alignment-scope.mjs';
import {readFileSync,writeFileSync} from 'node:fs';
import * as THREE from '../dist/vendor/three.module.js';
import {createEscapeExterior} from '../dist/escape-exterior.mjs';
import {frontLinkSnapshot} from './annexe-front-link-scope.mjs';
import {rearStretchSnapshot} from './annexe-rear-stretch-scope.mjs';
import {cardenCorrectionSnapshot} from './annexe-carden-correction-scope.mjs';
import {cardenHeightSnapshot} from './annexe-carden-height-scope.mjs';
const annexe=createEscapeExterior(THREE,1.5).annexe;
const update=(relative,edit)=>{const p=new URL('../../Research/'+relative,import.meta.url),before=JSON.parse(readFileSync(p));writeFileSync(p,JSON.stringify(edit(before),null,2)+'\n');};
const links=frontLinkSnapshot(THREE,annexe),rear=rearStretchSnapshot(THREE,annexe);
update('annexe-frontage-adjustment/front-link-before.json',before=>({...before,primitives:links.primitives,sha256:links.sha256,ranges:before.ranges.map(r=>r.name==='Entrance range'?links.ranges.find(n=>n.name===r.name):r)}));
update('annexe-kitchen/rear-stretch-before.json',before=>({...before,ranges:before.ranges.map(r=>r.name==='Entrance range'?rear.ranges.find(n=>n.name===r.name):r)}));
update('carden-picton/outward-protected-geometry.json',()=>cardenCorrectionSnapshot(THREE,annexe,{excludeConcurrentJarman:true}));
update('carden-picton/height-extension-before.json',before=>({...before,protected:cardenHeightSnapshot(THREE,annexe).protected}));
await import('./refresh-annexe-front-link-baselines.mjs');
