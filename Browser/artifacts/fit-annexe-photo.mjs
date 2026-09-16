import {writeFileSync} from 'node:fs';
import * as THREE from '../dist/vendor/three.module.js';
import {createEscapeExterior} from '../dist/escape-exterior.mjs';
import {ANNEXE} from '../dist/annexe.mjs';
import {HISTORIC_ROAD_TRACES,ADMIN_TEARDROP} from '../dist/historic-road-layout.mjs';
import {SHARED_HISTORIC_LANES} from '../dist/historic-road-clearance.mjs';
globalThis.document={createElement:()=>({getContext:()=>({fillRect(){}})})};
const e=createEscapeExterior(THREE,1.5);e.model.updateMatrixWorld(true);
const ranges=e.annexe.userData.ranges.map(b=>({name:b.name,points:[[-1,-1],[1,-1],[1,1],[-1,1]].map(([u,v])=>[b.x+Math.cos(b.r)*u*b.w/2+Math.sin(b.r)*v*b.d/2,b.z-Math.sin(b.r)*u*b.w/2+Math.cos(b.r)*v*b.d/2])}));
const roads=[...HISTORIC_ROAD_TRACES,...SHARED_HISTORIC_LANES].filter(r=>r.points.some(p=>p[0]>240));
writeFileSync(new URL('annexe-fit-data.json',import.meta.url),JSON.stringify({original:ANNEXE,ranges,roads,teardrop:ADMIN_TEARDROP},null,2));
let svg='<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="800" viewBox="230 -170 380 350"><rect x="230" y="-170" width="380" height="350" fill="#f5f2e8"/>';
for(const r of roads)svg+=`<polyline points="${r.points.map(p=>p.join(',')).join(' ')}" fill="none" stroke="#a4a39b" stroke-width="${r.width??6}"/><text x="${r.points[0][0]}" y="${r.points[0][1]}" font-size="3">${r.name.replaceAll('&','&amp;')}</text>`;
for(const [x,z,s,color] of [[ANNEXE.x,ANNEXE.z,1,'#c33'],[434,0,.65,'#248d50'],[455,20,.62,'#4169ba']])for(const r of ranges){const c=Math.cos(ANNEXE.rotation),sn=Math.sin(ANNEXE.rotation),p=r.points.map(([u,v])=>[x+s*(c*u+sn*v),z+s*(-sn*u+c*v)]);svg+=`<polygon points="${p.map(p=>p.join(',')).join(' ')}" fill="${color}" fill-opacity=".15" stroke="${color}" stroke-width=".45"/>`;}
writeFileSync(new URL('annexe-fit-inspection.svg',import.meta.url),svg+'</svg>');
