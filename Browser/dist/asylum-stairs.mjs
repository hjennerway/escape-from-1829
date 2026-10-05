// Connection footprints drive the slabs, flights, landings, rails and walking.
export const STAIR_WIDTH=1.3;
export const RAIL_HEIGHT=1.05;
export const STAIR_SLAB_THICKNESS=.18;
export const STAIR_WELL_WALL_THICKNESS=.18;

// A closed concrete flight: stepped walking surface above one planar soffit.
// Build from the low end so either direction uses the same tread profile.
export function stairFlightGeometry(THREE,x,width,z0,z1,y0,y1,steps,endX=x){
 if(endX!==x){
  const geometry=stairFlightGeometry(THREE,0,width,0,Math.hypot(endX-x,z1-z0),y0,y1,steps);
  geometry.rotateY(Math.atan2(endX-x,z1-z0));geometry.translate(x,0,z0);return geometry;
 }
 const run=Math.abs(z1-z0),direction=Math.sign(z1-z0),tread=run/steps,riser=(y1-y0)/steps;
 const profile=new THREE.Shape();
 profile.moveTo(0,y0-STAIR_SLAB_THICKNESS);
 profile.lineTo(run,y1-STAIR_SLAB_THICKNESS);profile.lineTo(run,y1);
 for(let i=steps-1;i>=0;i--){
  profile.lineTo(i*tread,y0+(i+1)*riser);
  if(i>0)profile.lineTo(i*tread,y0+i*riser);
 }
 profile.closePath();
 const geometry=new THREE.ExtrudeGeometry(profile,{depth:width,bevelEnabled:false,steps:1});
 geometry.rotateY(-direction*Math.PI/2);geometry.translate(x+direction*width/2,0,z0);
 return geometry;
}
export function stairShape(stair){
 const xs=stair.points.map(p=>p[0]),zs=stair.points.map(p=>p[1]);
 const minX=Math.min(...xs),maxX=Math.max(...xs),minZ=Math.min(...zs),maxZ=Math.max(...zs),w=STAIR_WIDTH;
 return {minX,maxX,minZ,maxZ,left:minX+w/2,right:maxX-w/2,front:minZ+w,back:maxZ-w,
  portal:minZ+w/2,rear:maxZ-w/2,innerLeft:minX+w,innerRight:maxX-w};
}
export function stairConnection(stair,lower,upper){
 // A changed upper continuation leaves the earlier storeys' flights intact.
 return {...stair,...stair.connectionVariants?.[lower+':'+upper]};
}
// Enclose the central void, keeping the complete flight/landing widths. The
// masonry thickness sits inside the well, with its outer faces at the edges.
export function stairWell(stair){
 if(stair.straightFlight)return null;
 const s=stairShape(stair);
 return {minX:s.innerLeft,maxX:s.innerRight,minZ:s.front,maxZ:s.back};
}
export function floorStairWells(floor){
 const wells=floor.stairs.flatMap(stair=>stair.connections
  .filter(([a,b])=>a===floor.id||b===floor.id)
  .map(([a,b])=>stairWell(stairConnection(stair,a,b))).filter(Boolean));
 return [...new Map(wells.map(well=>[JSON.stringify(well),well])).values()];
}
export function stairWellWalls({minX,maxX,minZ,maxZ}){
 const inset=STAIR_WELL_WALL_THICKNESS/2,x0=minX+inset,x1=maxX-inset,z0=minZ+inset,z1=maxZ-inset;
 const points=[[x0,z0],[x1,z0],[x1,z1],[x0,z1]];
 return points.map((a,i)=>({a,b:points[(i+1)%points.length]}));
}
export function stairWellHeight(floor){
 const next=Math.min(...floor.levelElevations.filter(y=>y>floor.elevation));
 return Math.max((floor.id===2?2.9:3.8)+.02,Number.isFinite(next)?next-floor.elevation+.001:0);
}
export function stairFlights(stair,lowerHeight,upperHeight){
 if(stair.straightFlight){const {start,end}=stair.straightFlight;return [[[start[0],lowerHeight,start[1]],[end[0],upperHeight,end[1]]]];}
 const s=stairShape(stair),mid=(lowerHeight+upperHeight)/2,r=stair.upperReturn;
 return [
  [[s.left,lowerHeight,s.front],[s.left,mid,s.back]],
  [[r?.startX??s.right,mid,s.back],[r?.endX??s.right,upperHeight,r?.endZ??s.front]],
 ];
}
export function stairLandingPolygons(stair){
 const s=stairShape(stair);
 if(!stair.upperReturn)return [];
 const [, [a,b]]=stairFlights(stair,0,1),run=Math.hypot(b[0]-a[0],b[2]-a[2]);
 const nx=(b[2]-a[2])/run*STAIR_WIDTH/2,nz=-(b[0]-a[0])/run*STAIR_WIDTH/2;
 return [
  [[s.minX,s.back],[s.innerLeft,s.back],[a[0]+nx,a[2]+nz],[a[0]-nx,a[2]-nz],[s.maxX,s.back],[s.maxX,s.maxZ],[s.minX,s.maxZ]],
  [[b[0]+nx,b[2]+nz],[b[0]-nx,b[2]-nz],[b[0]-nx,s.front],[b[0]+nx,s.front]],
 ];
}
export function stairRoute(stair,lowerHeight,upperHeight,lower,upper){
 stair=stairConnection(stair,lower,upper);
 if(stair.straightFlight){
  const [[a,b]]=stairFlights(stair,lowerHeight,upperHeight),run=Math.hypot(b[0]-a[0],b[2]-a[2]),dx=(b[0]-a[0])/run,dz=(b[2]-a[2])/run;
  return [[a[0]-dx*STAIR_WIDTH/2,a[1],a[2]-dz*STAIR_WIDTH/2],a,b,[b[0]+dx*STAIR_WIDTH/2,b[1],b[2]+dz*STAIR_WIDTH/2]];
 }
 const s=stairShape(stair),mid=(lowerHeight+upperHeight)/2,rear=stair.upperReturn?.returnZ??s.rear;
 const [, [a,b]]=stairFlights(stair,lowerHeight,upperHeight);
 return [[s.left,lowerHeight,s.portal],[s.left,lowerHeight,s.front],
  [s.left,mid,s.back],[s.left,mid,rear],[a[0],mid,rear],
  a,b,[b[0],upperHeight,s.portal]];
}
export function stairOpening(stair){
 if(stair.straightFlight){
  const {start:a,end:b}=stair.straightFlight,run=Math.hypot(b[0]-a[0],b[1]-a[1]),nx=(b[1]-a[1])/run*STAIR_WIDTH/2,nz=-(b[0]-a[0])/run*STAIR_WIDTH/2;
  return {minX:Math.min(a[0],b[0])-Math.abs(nx),maxX:Math.max(a[0],b[0])+Math.abs(nx),minZ:Math.min(a[1],b[1])-Math.abs(nz),maxZ:Math.max(a[1],b[1])+Math.abs(nz)};
 }
 const s=stairShape(stair);
 return {minX:s.minX,maxX:s.maxX,minZ:s.front,maxZ:s.maxZ};
}
// A floor can have different incoming and outgoing footprints. The original
// well ends on the first floor; only the new straight flight opens above it.
export function stairOpenings(stair,floor,ceiling){
 const connections=stair.connections.filter(([a,b])=>ceiling===undefined?a===floor||b===floor:(ceiling?a:b)===floor);
 const openings=connections.map(([a,b])=>stairOpening(stairConnection(stair,a,b)));
 return [...new Map(openings.map(o=>[JSON.stringify(o),o])).values()];
}
export function flightRails(stair,lowerHeight,upperHeight){
 if(stair.straightFlight){
  const [[a,b]]=stairFlights(stair,lowerHeight,upperHeight),run=Math.hypot(b[0]-a[0],b[2]-a[2]),nx=(b[2]-a[2])/run*STAIR_WIDTH/2,nz=-(b[0]-a[0])/run*STAIR_WIDTH/2;
  return [-1,1].map(sign=>[a,b].map(p=>[p[0]+nx*sign,p[1],p[2]+nz*sign]));
 }
 const s=stairShape(stair),mid=(lowerHeight+upperHeight)/2;
 if(stair.upperReturn){
  const [, [a,b]]=stairFlights(stair,lowerHeight,upperHeight),run=Math.hypot(b[0]-a[0],b[2]-a[2]);
  const nx=(b[2]-a[2])/run*STAIR_WIDTH/2,nz=-(b[0]-a[0])/run*STAIR_WIDTH/2;
  const edge=(p,sign)=>[p[0]+nx*sign,p[1],p[2]+nz*sign];
  return [
   [[s.innerLeft,lowerHeight,s.front],[s.innerLeft,mid,s.back],edge(a,1),edge(b,1)],
   [[s.minX,lowerHeight,s.front],[s.minX,mid,s.back],[s.minX,mid,s.maxZ],[s.maxX,mid,s.maxZ],[s.maxX,mid,s.back],edge(a,-1),edge(b,-1)],
  ];
 }
 // The inner edges meet the full-height well walls; only exposed outer
 // edges need banisters. Shared vertices keep the outer return continuous.
 return [
  [[s.minX,lowerHeight,s.front],[s.minX,mid,s.back],[s.minX,mid,s.maxZ],[s.maxX,mid,s.maxZ],[s.maxX,mid,s.back],[s.maxX,upperHeight,s.front]],
 ];
}
export function landingRails(stair,floor){
 const descending=stair.connections.find(([,b])=>b===floor),incoming=descending&&stairConnection(stair,...descending);
 if(incoming?.straightFlight){
  const {minX,maxX,minZ,maxZ}=stairOpening(incoming);
  return [[[minX,0,minZ],[minX,0,maxZ],[maxX,0,maxZ],[maxX,0,minZ]]];
 }
 const s=stairShape(stair),up=stair.connections.some(([a,b])=>a===floor&&!stairConnection(stair,a,b).straightFlight),down=!!descending,rails=[];
 if(down)rails.push([[s.minX,0,s.front],[s.minX,0,s.maxZ],[s.maxX,0,s.maxZ],[s.maxX,0,s.front]]);
 // The central front edge is masonry. Guard only the unused flight mouths,
 // leaving the real ascent/descent entrances open.
 const westExit=descending&&stairConnection(stair,...descending).upperReturn;
 if(!up&&!westExit)rails.push([[s.minX,0,s.front],[s.innerLeft,0,s.front]]);
 if(!down||westExit)rails.push([[s.innerRight,0,s.front],[s.maxX,0,s.front]]);
 return rails;
}
export function floorStairRails(floor){
 return floor.stairs.flatMap(stair=>[
  ...landingRails(stair,floor.id),
  ...stair.connections.filter(([a])=>a===floor.id).flatMap(([a,b])=>flightRails(stairConnection(stair,a,b),0,floor.levelElevations[b]-floor.elevation)),
 ]);
}

// Sweep one rectangular rail through each entire polyline. Shared, mitred
// rings remove the detached ends and intersecting bars at return corners.
export function handrailGeometry(THREE,paths){
 const positions=[],half=.035,triangle=(a,b,c)=>positions.push(...a,...b,...c);
 for(const path of paths){
  const directions=path.slice(1).map((b,i)=>{const a=path[i],d=Math.hypot(b[0]-a[0],b[2]-a[2]);return [(b[0]-a[0])/d,(b[2]-a[2])/d];});
  const rings=path.map((p,i)=>{
   const a=directions[Math.max(0,i-1)],b=directions[Math.min(i,directions.length-1)],n=[-a[1]-b[1],a[0]+b[0]],den=n[0]*-b[1]+n[1]*b[0];
   const dx=n[0]*half/den,dz=n[1]*half/den,y=p[1]+RAIL_HEIGHT;
   return [[p[0]+dx,y-half,p[2]+dz],[p[0]-dx,y-half,p[2]-dz],[p[0]-dx,y+half,p[2]-dz],[p[0]+dx,y+half,p[2]+dz]];
  });
  for(let i=1;i<rings.length;i++)for(let j=0;j<4;j++){const a=rings[i-1][j],b=rings[i-1][(j+1)%4],c=rings[i][(j+1)%4],d=rings[i][j];triangle(a,b,c);triangle(a,c,d);}
  const a=rings[0],b=rings.at(-1);triangle(a[0],a[2],a[1]);triangle(a[0],a[3],a[2]);triangle(b[0],b[1],b[2]);triangle(b[0],b[2],b[3]);
 }
 const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.computeVertexNormals();return geometry;
}
