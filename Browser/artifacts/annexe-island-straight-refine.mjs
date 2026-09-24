import {readFileSync,writeFileSync} from 'node:fs';
let p='Browser/dist/annexe-loop-road.mjs',s=readFileSync(p,'utf8').replace('[322.5,annexeOuterRoadZ(322.5)]','[319.3,annexeOuterRoadZ(319.3)]').replace('const near=[310,frontageZ(310)];','const near=[314,frontageZ(314)];').replace('const forkC1=[318,near[1]-10],forkC2=[322.5,-75];','const forkC1=[316,-66],forkC2=[319.3,-77];').replace('[[310,-99],[319,-84.912],ANNEXE_TRIANGLE_APEX]','[[310,-99],[317,-88],ANNEXE_TRIANGLE_APEX]');writeFileSync(p,s);
p='Browser/dist/irby-junction-rounding.mjs';s=readFileSync(p,'utf8').replace('const island=[],arcs=[];',`// Keep enough straight length around the three tips for visible corner arcs.
for(let pass=0;pass<3;pass++){
 const tips=sharp.filter((p,i)=>{const u=unit(sub(sharp[(i+sharp.length-1)%sharp.length],p)),v=unit(sub(sharp[(i+1)%sharp.length],p));return u[0]*v[0]+u[1]*v[1]>Math.cos(2.7);});
 sharp=sharp.filter(p=>tips.includes(p)||!tips.some(t=>Math.hypot(...sub(p,t))<5));
}
const island=[],arcs=[];`);writeFileSync(p,s);
