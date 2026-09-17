import {IRBY_ASHLEY_ORIGINAL_FOOTPRINT as IRBY_ASHLEY_FOOTPRINT,IRBY_ASHLEY_ORIGINAL_ROOFS as IRBY_ASHLEY_ROOFS} from './irby-ashley.mjs';

// Source-space coordinates retain the accepted duplicate's placement/scale.
// veranda.jpg replaces only the church-facing elevation of Grafton/Edge.
const wallZ=-122.7,centre=236.25,radius=4.2,inset=radius*(Math.SQRT2-1);
const bay=[[centre-radius,wallZ],[centre-radius,wallZ-inset],
 [centre-inset,wallZ-radius],[centre+inset,wallZ-radius],
 [centre+radius,wallZ-inset],[centre+radius,wallZ]];
const rear=[[211.9,-125.6],[219.2,-125.6],[219.2,wallZ],...bay,
 [253.3,wallZ],[253.3,-125.6],[260.6,-125.6]];
export const GRAFTON_REAR_FOOTPRINT=Object.freeze([
 ...IRBY_ASHLEY_FOOTPRINT.slice(0,12),...rear
].map(p=>Object.freeze(p)));
const roofs=IRBY_ASHLEY_ROOFS.slice(0,5).map(r=>r.name==='Roadside north wing'
 ?{...r,rect:[250.4,-122.7,260.6,-98.6]}:r);
roofs.push(
 {name:'Grafton south square projection',rect:[211.9,-125.6,219.2,-119.1],axis:'z',rise:2.05},
 {name:'Grafton north square projection',rect:[253.3,-125.6,260.6,-119.1],axis:'z',rise:2.05}
);

function build(THREE,{building,brick,roof,worldUV,material,mesh,box,surface,sash,trim,detail,eave,cx,cz}){
 const local=([x,z])=>[x-cx,z-cz];
 const wood=material(0xb6b6a8),darkWood=material(0x4e5754),stone=material(0x989a91);
 const rearLocal=rear.map(local);
 for(let i=1;i<rear.length;i++){
  const a=rearLocal[i-1],b=rearLocal[i],dx=b[0]-a[0],dz=b[1]-a[1],length=Math.hypot(dx,dz);
  trim(a,b,{outward:-1});
  const nx=dz/length,nz=-dx/length,r=Math.atan2(nx,nz);
  const count=Math.max(1,Math.floor(length/3.5));
  for(let j=0;j<count;j++){
   const t=(j+.5)/count,x=a[0]+dx*t+nx*.04,z=a[1]+dz*t+nz*.04;
   const bayFace=i>=4&&i<=8;
   // Upper windows sit above the canopy; the lower openings face its walk.
   sash(x,6.15,z,r,bayFace?1.42:1.3,2.55,'Grafton rear upper sash');
   if(!bayFace&&length>7&&j===1)detail.door(x,z,r);
   else sash(x,1.85,z,r,bayFace?1.28:1.3,2.35,'Grafton veranda lower sash');
  }
 }
 // A single full-height half-octagon grows through the canopy. Its hip joins
 // the existing cross-range roof; there is no second bay or corner octagon.
 const ring=bay.map(([x,z])=>[x-cx,eave+.04,z-cz]);
 ring[0]=[bay[0][0]-cx,9.45,wallZ+1.8-cz];
 ring[5]=[bay[5][0]-cx,9.45,wallZ+1.8-cz];
 ring.push([centre-cx,10.55,wallZ+.35-cz]);
 surface(ring,[[0,1,6],[1,2,6],[2,3,6],[3,4,6],[4,5,6],[5,0,6]],roof,'Grafton central half-octagonal slate hip',true);

 const x0=211.7,x1=260.8,front=-130.1,ridgeZ=-126.4,high=4.25,edge=3.08;
 const height=z=>z<ridgeZ?edge+(high-edge)*(z-front)/(ridgeZ-front)
  :high-(high-3.5)*(z-ridgeZ)/(wallZ-ridgeZ);
 // The back outline follows the square ends and central bay. Triangles are
 // split at the canopy ridge so both roof pitches meet at the same height.
 const canopy=[[x0,front],[x1,front],[x1,-125.6],...rear.slice().reverse(),[x0,-125.6]];
 const triangles=THREE.ShapeUtils.triangulateShape(canopy.map(p=>new THREE.Vector2(...p)),[]);
 function clip(points,keepFront){
  const output=[];
  for(let i=0;i<points.length;i++){
   const a=points[i],b=points[(i+1)%points.length],inside=p=>keepFront?p[1]<=ridgeZ:p[1]>=ridgeZ;
   if(inside(a))output.push(a);
   if(inside(a)!==inside(b)){const t=(ridgeZ-a[1])/(b[1]-a[1]);output.push([a[0]+t*(b[0]-a[0]),ridgeZ]);}
  }
  return output;
 }
 const canopyRoof=roof.clone();canopyRoof.side=THREE.DoubleSide;
 for(const tri of triangles)for(const frontSide of [true,false]){
  const polygon=clip(tri.map(i=>canopy[i]),frontSide);if(polygon.length<3)continue;
  const vertices=polygon.map(([x,z])=>[x-cx,height(z),z-cz]);
  surface(vertices,Array.from({length:vertices.length-2},(_,i)=>[0,i+1,i+2]),canopyRoof,'Grafton veranda pitched slate canopy',true);
 }
 const slab=mesh(new THREE.BoxGeometry(x1-x0+.5,.16,wallZ-front+.8),stone,(x0+x1)/2-cx,.08,(wallZ+front)/2-cz,'Grafton veranda paving');
 slab.receiveShadow=true;
 box(darkWood,(x0+x1)/2-cx,edge-.08,front-cz,x1-x0,.2,.18);
 box(wood,(x0+x1)/2-cx,edge-.23,front-cz,x1-x0,.12,.13);
 const posts=10;
 for(let i=0;i<=posts;i++){
  const x=x0+(x1-x0)*i/posts;
  box(darkWood,x-cx,edge/2,front-cz,.16,edge,.16);
  box(stone,x-cx,.23,front-cz,.31,.3,.31);
  for(const dir of [-1,1]){
   if((i===0&&dir<0)||(i===posts&&dir>0))continue;
   detail.rod([x-cx,edge-.73,front-cz],[x-cx+dir*.53,edge-.1,front-cz],.045,darkWood);
  }
 }
 // The photograph's ends have low masonry and pale open timber screens.
 for(const x of [x0,x1]){
  const back=-125.6,mid=(front+back)/2;
  const end=mesh(worldUV(new THREE.BoxGeometry(.23,.96,back-front),1.7),brick,x-cx,.64,mid-cz,'Grafton veranda low end wall');
  end.userData.orientedCollision=true;
  box(wood,x-cx,1.16,mid-cz,.31,.15,back-front);
  for(let z=front+.15;z<back;z+=.29){const top=height(z)-.12;box(wood,x-cx,(1.23+top)/2,z-cz,.055,top-1.23,.06);}
  detail.rod([x-cx,height(front),front-cz],[x-cx,high,ridgeZ-cz],.075,wood);
  detail.rod([x-cx,high,ridgeZ-cz],[x-cx,height(back),back-cz],.075,wood);
  box(wood,x-cx,edge-.12,mid-cz,.1,.11,back-front);
 }
 // Two slender stacks and a small louvred roof vent resolve the skyline.
 for(const x of [217.5,251.5]){
  mesh(worldUV(new THREE.BoxGeometry(1.05,3.7,1.0),1.7),brick,x-cx,10.65,-117.7-cz,'Grafton rear brick chimney');
  box(brick,x-cx,12.44,-117.7-cz,1.4,.22,1.32);
 }
 const vx=242.5-cx,vz=-117.7-cz;
 box(darkWood,vx,11.45,vz,2.4,1.1,1.7);
 for(let y=11.05;y<11.95;y+=.2)box(wood,vx,y,vz-.88,2.3,.06,.11);
 const ventTop=mesh(new THREE.ConeGeometry(2, .7,4),roof,vx,12.35,vz,'Grafton louvred roof ventilator');ventTop.rotation.y=Math.PI/4;
 return {bays:[{x:centre,z:wallZ,footprint:bay}],corner:null,conservatory:null,
  veranda:{footprint:canopy,frontZ:front,wallZ,ridgeZ,postCount:posts+1},rearPhoto:'Research/grafton-edge/veranda.jpg'};
}

export const GRAFTON_REAR_ELEVATION=Object.freeze({footprint:GRAFTON_REAR_FOOTPRINT,roofs,build});
