import * as THREE from '../dist/vendor/three.module.js';
import {createEscapeExterior} from '../dist/escape-exterior.mjs';
import {createAerialLayouts} from '../dist/aerial-layouts.mjs';
import {HISTORIC_ROADS,HISTORIC_PAVING} from '../dist/historic-road-layout.mjs';
import {SHARED_HISTORIC_LANES} from '../dist/historic-road-clearance.mjs';
import {readFileSync,writeFileSync,copyFileSync} from 'node:fs';
globalThis.document={createElement:()=>({getContext:()=>({fillRect(){},measureText(t){return {width:t.length*16}},strokeText(){},fillText(){}})})};
const e=createEscapeExterior(THREE,1.5),l=createAerialLayouts(THREE,e);e.model.updateMatrixWorld(true);
const walls=[];e.annexe.traverse(o=>{if(!o.isMesh||o.isInstancedMesh||!(/walls/i.test(o.name)||o.userData.orientedCollision))return;const g=o.geometry;g.computeBoundingBox();const b=g.boundingBox,size=b.getSize(new THREE.Vector3()),wb=b.clone().applyMatrix4(o.matrixWorld);if(size.x<1||size.z<1||wb.min.y>1||wb.max.y<3)return;const corners=o.userData.collisionFootprint??[[b.min.x,b.min.z],[b.max.x,b.min.z],[b.max.x,b.max.z],[b.min.x,b.max.z]];walls.push({name:o.name,points:corners.map(([x,z])=>{const q=new THREE.Vector3(x,0,z).applyMatrix4(o.matrixWorld);return [q.x,q.z];})});});
const fit=JSON.parse(readFileSync('Browser/artifacts/rear-roads-fit.json')),p=fit.parameters,a=p[3],b=p[4];
const r=[Math.cos(a),0,-Math.sin(a)],u=[-Math.sin(a)*Math.sin(b),Math.cos(b),-Math.cos(a)*Math.sin(b)],f=[-Math.sin(a)*Math.cos(b),-Math.sin(b),-Math.cos(a)*Math.cos(b)];
const ground=([x,y])=>{const d=f.map((v,i)=>v+r[i]*(x-p[6])/p[5]-u[i]*(y-p[7])/p[5]),t=-p[1]/d[1];return [p[0]+t*d[0],p[2]+t*d[2]];};
const routes=[[[699,282],[720,277],[825,262],[900,263],[987,273],[1054,289],[1126,322]],[[720,277],[733,327],[740,370],[745,401]],[[987,273],[1003,352],[997,418],[998,472],[994,553],[981,652],[978,715]],[[998,472],[1100,491],[1261,526]]].map(ps=>ps.map(ground));
const existing=[...SHARED_HISTORIC_LANES.map(r=>({...r,width:6})),...HISTORIC_ROADS];const lanes=existing.map(r=>r.points);
function nearest(p){let best;for(const lane of lanes)for(let i=1;i<lane.length;i++){const a=lane[i-1],b=lane[i],v=b.map((v,k)=>v-a[k]),t=Math.max(0,Math.min(1,p.reduce((s,n,k)=>s+(n-a[k])*v[k],0)/v.reduce((s,n)=>s+n*n,0))),q=a.map((n,k)=>n+t*v[k]),d=Math.hypot(...q.map((n,k)=>n-p[k]));if(!best||d<best.d)best={q,d};}return best.q;}
for(const i of [0,3])routes[i][routes[i].length-1]=nearest(routes[i].at(-1));
const court=[[712,266],[703,330],[698,390],[683,421],[642,424],[608,275]].map(ground);
writeFileSync('Research/historic-roads/annexe-rear-network-input.json',JSON.stringify({source:'annexe-rear-network-marked.png',width:6,routes,court,walls,shared:existing,existingPaving:HISTORIC_PAVING.filter(p=>!p.name.startsWith("Annexe rear network")),fit},null,2));
copyFileSync('C:/Users/Harry/AppData/Local/Temp/codex-clipboard-41ca6b73-6c42-47c0-af6c-52a744d27bb3.png','Research/historic-roads/annexe-rear-network-marked.png');
