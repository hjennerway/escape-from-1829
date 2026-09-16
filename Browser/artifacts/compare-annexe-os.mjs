import {readFileSync,writeFileSync} from 'node:fs';
import * as THREE from '../dist/vendor/three.module.js';
import {createEscapeExterior} from '../dist/escape-exterior.mjs';
import {ANNEXE_MAP_SCALE} from '../dist/annexe.mjs';
globalThis.document={createElement:()=>({getContext:()=>({fillRect(){}})})};
const {annexe}=createEscapeExterior(THREE,1.5);
const pixel=([x,z])=>{x/=ANNEXE_MAP_SCALE;z=z/ANNEXE_MAP_SCALE-17;return [90.5+(29*x-7*z)/40,76.5+(7*x+29*z)/40];};
const points=annexe.userData.ranges.map(b=>{
 const c=Math.cos(b.r),s=Math.sin(b.r);
 const p=[[-1,-1],[1,-1],[1,1],[-1,1]].map(([u,v])=>pixel([b.x+c*u*b.w/2+s*v*b.d/2,b.z-s*u*b.w/2+c*v*b.d/2]));
 return `<polygon points="${p.map(p=>p.join(',')).join(' ')}" fill="${b.custom?'#4649ac':'#354840'}" stroke="#e7e8dc" stroke-width=".18"/>`;
}).join('');
const src=readFileSync(new URL('../../Research/annexe-os-refinement/marked-os-map.png',import.meta.url)).toString('base64');
const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="1320" height="510" viewBox="0 0 1320 510"><rect width="1320" height="510" fill="#f3f0e5"/><g font-family="Arial,sans-serif" fill="#263a32"><text x="35" y="43" font-size="24">Supplied OS map</text><text x="685" y="43" font-size="24">Revised footprint</text><text x="685" y="73" font-size="16">Blue: fixed front section · Heights and materials retained</text></g><svg x="20" y="100" width="635" height="340" viewBox="0 0 205 110"><image href="data:image/png;base64,${src}" width="310" height="395"/></svg><svg x="680" y="100" width="635" height="340" viewBox="0 0 205 110">${points}</svg><text x="35" y="483" font-family="Arial,sans-serif" font-size="16" fill="#4b5c53">Approximate masonry fit to the low-resolution scan. Roads and facade projections omitted from the footprint diagram.</text></svg>`;
writeFileSync(new URL('../../Research/annexe-os-refinement/footprint-comparison.svg',import.meta.url),svg);
