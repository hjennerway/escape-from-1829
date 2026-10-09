import {ESCAPE_WATER_TOWER} from './water-tower.mjs';

// Fictional Escape interior. The reconstructed tower remains the source of
// its position and envelope; Aerial, Explore and native exports are unchanged.
const {x,z}=ESCAPE_WATER_TOWER;
export const TOWER_CLIMB={x,z,base:.2,rise:2.2,flights:12,steps:13,half:4.5,lane:3.3,width:1.8,landing:1.9,top:26.6,
 entrance:{x,z:z+5.25,y:.2},lookout:{x:x-4.33,z:z-.75,y:26.6},noise:{x:x-7,z:z+9}};
// Face-local horizontal and outward axes follow the photographed shell.
export const TOWER_FACES={
 south:{ux:1,uz:0,nx:0,nz:1},west:{ux:0,uz:1,nx:-1,nz:0},
 north:{ux:-1,uz:0,nx:0,nz:-1},east:{ux:0,uz:-1,nx:1,nz:0}
};
// Open the existing three pairs on every face, plus the lower west window.
// The arched surrounds, sills and brick piers retain their original positions.
export const TOWER_WINDOWS=[
 ...Object.keys(TOWER_FACES).flatMap(side=>[21.15,24.1,27.1].flatMap(y=>
  [-.91,.91].map(u=>({side,u,width:.38,bottom:y+.06,spring:y+1.35,radius:.19})))),
 {side:'west',u:0,width:.62,bottom:10.335,spring:12.165,radius:0}
];
export const TOWER_CORNERS=[[3.3,3.3],[3.3,-3.3],[-3.3,-3.3],[-3.3,3.3]];
export const TOWER_FLIGHTS=Array.from({length:TOWER_CLIMB.flights},(_,i)=>{
 const a=TOWER_CORNERS[i%4],b=TOWER_CORNERS[(i+1)%4],dx=(b[0]-a[0])/6.6,dz=(b[1]-a[1])/6.6;
 return {a:{x:x+a[0],z:z+a[1]},b:{x:x+b[0],z:z+b[1]},dx,dz,startY:TOWER_CLIMB.base+i*TOWER_CLIMB.rise,endY:TOWER_CLIMB.base+(i+1)*TOWER_CLIMB.rise};
});
export function insideEscapeTower(actor){return !!actor?.outside&&Math.abs(actor.x-x)<4.8&&Math.abs(actor.z-z)<4.8;}
export function towerObjective(run,actor){
 if(!insideEscapeTower(actor))return null;
 if(run.towerSurveyed)return {id:'tower-descent',title:'Descend and choose your escape route',detail:'Retrace the stairs to the workshops. Listen for security in the yard, then head for either north gate. The tower entrance stays open.'};
 return {id:'tower-climb',title:'Climb to the water tower lookout',detail:'Follow the stairs and landing lamps upwards. Inspect the west lookout to identify the gates and the mast. You can return down the same stairs at any time.'};
}
