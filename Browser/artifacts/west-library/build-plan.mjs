// Historical creation script: starts from before-plan.json and recreates the
// original enclosed stair. Do not rerun it against the later open-stair revision;
// the shared plan JSON files are the current modelling inputs.
import {readFile,writeFile,copyFile,mkdir} from 'node:fs/promises';
import * as THREE from '../../dist/vendor/three.module.js';
import {addWestFrontPhotoDetails} from '../../dist/west-front-photo-detail.mjs';
import {addWestCourtPhotoDetails} from '../../dist/west-court-photo-detail.mjs';
import {segmentDistance} from '../../dist/asylum-layout.mjs';

const here=new URL('./',import.meta.url),planURL=new URL('../../dist/asylum-plan.json',import.meta.url);
await mkdir(here,{recursive:true});
try{await copyFile(planURL,new URL('before-plan.json',here),1);}catch(error){if(error.code!=='EEXIST')throw error;}
const plan=JSON.parse(await readFile(new URL('before-plan.json',here)));
// Third storey uses the established second-floor ID/elevation. Follow the
// current exterior, rather than duplicating the superseded lower-floor plan.
const pierLeft=12.75-4.65/2,pierRight=12.75+4.65/2;
const west=[[-72.165,5],[-66,5],[-66,7],[-61.65,7],[-61.65,4.9],[-61.65,3.962],[-60.025,1.55],[-56.775,1.55],[-55.15,3.962],[-55.15,5],[-38,5],[-38,7],[-28.1,7],[-28.1,13.8],[-35,13.8],[-35,21.2],[-40,21.2],[-40,13.5],[-49.4,13.5],[-49.4,15.784],[-51.35,17.8],[-53.65,17.8],[-55.6,15.784],[-55.6,13.5],[-64,13.5],[-64,20.5],[-72.165,20.5],[-72.165,pierRight],[-72.405,pierRight],[-72.405,pierLeft],[-72.165,pierLeft]];
const area=points=>Math.abs(points.reduce((sum,a,i)=>{const b=points[(i+1)%points.length];return sum+a[0]*b[1]-b[0]*a[1];},0))/2;
const upper=plan.floors[3];upper.outline.loops.push(west);upper.outline.area+=area(west);upper.bounds=[-74,11,0,23];
const room=(id,name,points,label,doorSide,door)=>({id,name,points,label,doorSide,door,floors:[3],corridorClipping:false,windows:[],description:'Owner-directed third-storey west-wing room from the yellow divisions in the 5 October 2026 reference.'});
const library=room('R46','Library',west.slice(0,10).concat([[-55.6,5],[-55.6,13.5],[-64,13.5],[-64,14.6],[-72.405,14.6],[-72.405,pierLeft],[-72.165,pierLeft]]),[-65,10.3],'east',6.85);
library.tablePositions=[[-68,10],[-59.5,9.5]];
const sitting=room('R47','Library sitting room',[[-72.405,14.6],[-64,14.6],[-64,20.5],[-72.165,20.5],[-72.165,pierRight],[-72.405,pierRight]],[-68,17.4],'north',-68.25);
const reading=room('R48','Bay reading room',[[-55.6,8.2],[-49.4,8.2],[-49.4,15.784],[-51.35,17.8],[-53.65,17.8],[-55.6,15.784]],[-52.5,12],'north',-52.5);
const office=room('R49','Librarian office',[[-49.4,8.2],[-40,8.2],[-40,13.5],[-49.4,13.5]],[-44.7,10.8],'north',-44.5);
const store=room('R50','Library book store',[[-40,8.2],[-35,8.2],[-35,21.2],[-40,21.2]],[-37.5,17],'north',-37.5);
plan.rooms.push(library,sitting,reading,office,store);
// Reuse the junction stair in the vicinity of the blue X. Solid room edges
// enclose both sides/back without allowing general stair clipping to erase them.
plan.rooms.push({id:'R51',name:'West junction stair hall',points:[[-34.2,8.2],[-28.1,8.2],[-28.1,13.8],[-34.2,13.8]],label:[-31.15,8.5],floors:[1,3],openEdges:[0],solidEdges:[1,2,3],corridorClipping:false,windows:[],description:'Enclosed continuation of S5 to the Library storey; its north landing stays open.'});
const stair=plan.stairs.find(s=>s.id==='S5');stair.floors.push(3);stair.connections.push([1,3]);stair.description='West junction return stair connecting basement, ground, first and the third-storey Library. Its upper continuation is enclosed by side walls.';
plan.corridors.push({id:'C26',name:'Library rear passage',points:[[-55.6,7.1],[-38.8,7.1],[-37.2,7.65],[-31.15,7.65],[-31.15,8.5]],width:2.2,floors:[3],description:'Rear passage serving the Library and adjoining rooms, with an open approach to the enclosed junction stair.'});
const exit=plan.exits.find(e=>e.id==='F4');exit.levels.push({floor:3,height:8.5,destination:[-63,8.5,14.3],interior:{x:-63,z:13.5,axis:'z',facing:1}});exit.description='E ↔ matching middle or upper landing of the existing west garden fire escape. The upper door now enters the third-storey Library.';
// Capture the real upper exterior sash schedule without rendering. Project its
// tiny decal offsets onto the hosting outline; keep width/height/orientation.
const model=new THREE.Group();model.userData.eastPhotoOpenings=[];
const material=()=>new THREE.MeshBasicMaterial(),mesh=(g,m,x=0,y=0,z=0)=>{const o=new THREE.Mesh(g,m);o.position.set(x,y,z);model.add(o);return o;};
const box=(m,x,y,z,w,h,d)=>mesh(new THREE.BoxGeometry(w,h,d),m,x,y,z);
const sash=(face,x,y,z,rotation,w,h)=>model.userData.eastPhotoOpenings.push({face,x,y,z,rotation,w,h});
const api={model,mesh,box,sash,worldUV:g=>g,material,white:material(),brick:material(),roof:material(),iron:material(),stone:material(),door:()=>new THREE.Group(),rod:()=>new THREE.Group(),frame:()=>new THREE.Group(),hipRoof:()=>new THREE.Group()};
addWestFrontPhotoDetails(THREE,api);addWestCourtPhotoDetails(THREE,api);
const edges=west.map((a,i)=>[a,west[(i+1)%west.length]]);
for(const opening of model.userData.eastPhotoOpenings.filter(w=>w.y>=10)){
 const nearest=edges.map(([a,b])=>({a,b,d:segmentDistance(opening.x,opening.z,a,b)})).sort((a,b)=>a.d-b.d)[0];
 if(nearest.d>.18)continue; // Buried/other-wing faces are not this envelope.
 const {a,b}=nearest,dx=b[0]-a[0],dz=b[1]-a[1],t=((opening.x-a[0])*dx+(opening.z-a[1])*dz)/(dx*dx+dz*dz);
 const x=a[0]+dx*t,z=a[1]+dz*t;
 const host=[library,sitting,reading,office,store].map(r=>({r,d:Math.min(...r.points.map((p,i)=>segmentDistance(x,z,p,r.points[(i+1)%r.points.length])))})).sort((a,b)=>a.d-b.d)[0].r;
 host.windows.push({x,z,axis:Math.abs(dx)<1e-7?'x':Math.abs(dz)<1e-7?'z':'diagonal',width:opening.w,height:opening.h,sill:Math.min(3.55-opening.h,opening.y-upper.elevation-opening.h/2),exteriorFace:opening.face});
}
await writeFile(new URL('exterior-windows.json',here),JSON.stringify(model.userData.eastPhotoOpenings.filter(w=>w.y>=10),null,2)+'\n');
const json=JSON.stringify(plan)+'\n';await writeFile(planURL,json);await writeFile(new URL('../../../Research/1829-interior-proposal/plan-data.json',here),json);
console.log('Added Library storey:',{rooms:plan.rooms.filter(r=>r.floors.includes(3)).map(r=>r.id),windows:plan.rooms.filter(r=>r.floors.includes(3)).reduce((n,r)=>n+(r.windows?.length??0),0),area:upper.outline.area});
