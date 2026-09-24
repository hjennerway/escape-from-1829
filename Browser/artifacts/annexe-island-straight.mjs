import {readFileSync,writeFileSync,copyFileSync} from 'node:fs';
copyFileSync('C:/Users/Harry/AppData/Local/Temp/codex-clipboard-a8d9e017-40c3-464c-8db5-e840ff3039c1.png','Research/historic-roads/annexe-straight-frontage-marked.png');
let p='Browser/dist/annexe-loop-road.mjs',s=readFileSync(p,'utf8');
const from=s.indexOf('// The later red outline'),to=s.indexOf('// Red ground picks',from);
s=s.slice(0,from)+`// Keep the frontage straight to the yellow-marked outer road. The fork is
// a separate six-metre curved lane, with extra clearance beside Beech2.
const frontageA=annexeSitePoint(0,0,ANNEXE_FRONT_ALIGNMENT.avenueZ);
const frontageB=annexeSitePoint(1,0,ANNEXE_FRONT_ALIGNMENT.avenueZ);
const frontageSlope=(frontageB[2]-frontageA[2])/(frontageB[0]-frontageA[0]);
const frontageZ=x=>frontageA[2]+(x-frontageA[0])*frontageSlope;
const outerSlope=(end[1]-start[1])/(end[0]-start[0]);
const joinX=(start[1]-frontageA[2]+frontageSlope*frontageA[0]-outerSlope*start[0])/(frontageSlope-outerSlope);
export const ANNEXE_TRIANGLE_APEX=Object.freeze([322.5,annexeOuterRoadZ(322.5)]);
const near=[310,frontageZ(310)];
export const ANNEXE_FRONT_OUTER_JOIN=Object.freeze([joinX,annexeOuterRoadZ(joinX)]);
export const ANNEXE_TRIANGLE_CORNERS=Object.freeze([ANNEXE_TRIANGLE_APEX,ANNEXE_FRONT_OUTER_JOIN,near]);
const forkC1=[318,near[1]-10],forkC2=[322.5,-75];
export const ANNEXE_TRIANGLE_FORK=Object.freeze(Array.from({length:49},(_,i)=>{
 const t=i/48,q=1-t;
 return near.map((v,k)=>q*q*q*v+3*q*q*t*forkC1[k]+3*q*t*t*forkC2[k]+t*t*t*ANNEXE_TRIANGLE_APEX[k]);
}));

`+s.slice(to);
s=s.replace('[[312,-94],[316,-91],ANNEXE_TRIANGLE_APEX]','[[310,-99],[319,-84.912],ANNEXE_TRIANGLE_APEX]');writeFileSync(p,s);
p='Browser/dist/annexe-front-roads.mjs';s=readFileSync(p,'utf8').replace(',annexeTrianglePoint','').replace("import {moveAnnexeInward} from './annexe-inward-placement.mjs';\n",'');const a=s.indexOf('// Ease the parallel'),b=s.indexOf('export const ANNEXE_FRONT_AVENUE',a);s=s.slice(0,a)+`// The long frontage continues on one axis through the fork to the outer lane.
export const ANNEXE_FRONT_FAR_JOIN=Object.freeze([ANNEXE_TRIANGLE_FORK[0]]);
`+s.slice(b);writeFileSync(p,s);
p='Browser/dist/historic-road-layout.mjs';s=readFileSync(p,'utf8').replace(',trimIslandEntranceKerb','').replace("...ANNEXE_ACCESS_KERBS.map(kerb=>kerb.name.includes('sweeping entrance')?{...kerb,points:trimIslandEntranceKerb(kerb.points)}:kerb)",'...ANNEXE_ACCESS_KERBS');writeFileSync(p,s);
