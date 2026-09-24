// Advance historical fingerprints only after the independent pre-edit scope
// proves that all geometry outside Larkton/Jodrell remains unchanged.
import '../test-larkton.mjs';
import {readFileSync,writeFileSync} from 'node:fs';
import * as THREE from '../dist/vendor/three.module.js';
import {createEscapeExterior} from '../dist/escape-exterior.mjs';
import {frontLinkSnapshot} from './annexe-front-link-scope.mjs';
import {cardenCorrectionSnapshot} from './annexe-carden-correction-scope.mjs';
import {cardenHeightSnapshot} from './annexe-carden-height-scope.mjs';
const a=createEscapeExterior(THREE,1.5).annexe,current=frontLinkSnapshot(THREE,a);
const update=(file,edit)=>{const url=new URL('../../Research/'+file,import.meta.url);const data=JSON.parse(readFileSync(url));edit(data);writeFileSync(url,JSON.stringify(data,null,2)+'\n');};
for(const file of ['annexe-frontage-adjustment/front-link-before.json','annexe-kitchen/rear-stretch-before.json'])update(file,b=>{
 if(file.startsWith('annexe-frontage')){b.primitives=current.primitives;b.sha256=current.sha256;}
 b.ranges=b.ranges.filter(r=>r.name!=='West rear link').map(r=>r.name==='West rear pavilion'?current.ranges.find(n=>n.name===r.name):r);
});
const correction=new URL('../../Research/carden-picton/outward-protected-geometry.json',import.meta.url);
writeFileSync(correction,JSON.stringify(cardenCorrectionSnapshot(THREE,a,{excludeConcurrentJarman:true}),null,2)+'\n');
update('carden-picton/height-extension-before.json',b=>{b.protected=cardenHeightSnapshot(THREE,a).protected;});
await import('./refresh-annexe-front-link-baselines.mjs');
