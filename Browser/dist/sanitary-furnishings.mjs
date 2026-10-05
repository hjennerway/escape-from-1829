// Interpretive 1829 ward privies; fixed fixtures share rendering and walking data.
export const SANITARY_CATALOG={
 privySeat:{procedural:true,width:.82,depth:.72,height:.58,era:'Early nineteenth-century timber-box privy'},
 privyScreen:{procedural:true,width:.075,depth:1.40,height:1.80,era:'Plain boarded privacy partition'},
 washstand:{procedural:true,width:1.10,depth:.62,height:1.26,era:'Regency washstand with basin and ewer'}
};
export const PRIVY_ROOMS=['R5','R16','R33','R35'];
export function sanitaryFurnishings(floor,room){
 if(![0,1].includes(floor.id)||!PRIVY_ROOMS.includes(room.id))return [];
 const rear=['R5','R16'].includes(room.id),side=['R16','R35'].includes(room.id)?1:-1;
 const rotation=Math.PI;
 const fixtures=[];
 // The rear gallery's long south partition keeps the north and end windows free.
 // The forward rooms use their south partition, clear of the diagonal entrance.
 const seatX=rear?[28.5,29.8,31.1]:[38.0,39.3];
 const seatZ=rear?-32.85:26.52,screenZ=rear?-33.19:26.21;
 for(const [i,x] of seatX.entries())fixtures.push(['privySeat',side*x,seatZ,rotation,i]);
 const screenX=rear?[27.85,29.15,30.45,31.75]:[37.35,38.65,39.95];
 for(const [i,x] of screenX.entries())fixtures.push(['privyScreen',side*x,screenZ,rotation,i]);
 fixtures.push(['washstand',side*(rear?26.65:38.30),rear?-32.85:20.65,rear?Math.PI:0,0]);
 return fixtures.map(([kind,x,z,rotation,slot])=>({
  ...SANITARY_CATALOG[kind],id:`${floor.id}:${room.id}:sanitary:${kind}:${slot}`,
  kind,roomId:room.id,variable:false,x,z,rotation,y:.008
 }));
}
