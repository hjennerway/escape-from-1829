import {mergeGeometries} from './vendor/BufferGeometryUtils.js';
import {ROOM_USES} from './asylum-room-uses.mjs';
import {asylumRoomNumbers} from './asylum-room-numbers.mjs';
import {paintAsylumSign,asylumSignGeometry} from './asylum-sign-paint.mjs';

const treatments={hydrotherapy:'Hydrotherapy',showerTreatment:'Cold-water shower',surgery:'Surgery',dispensary:'Bloodletting',ect:'ECT',electricalTreatment:'Electrical therapy',treatment:'Treatment'};

// Number enclosed rooms in natural plan-ID order, closing gaps left by merged
// rooms and open stair/circulation spaces. Sort a copy so door batches stay fixed.
export function asylumDoorLabels(floor){
 const numbers=asylumRoomNumbers(floor),ids=[...numbers.keys()];
 return [...(floor.roomDoors??[])].sort((a,b)=>ids.indexOf(a.roomId)-ids.indexOf(b.roomId)).map(door=>{
  const room=floor.rooms.find(r=>r.id===door.roomId),number=numbers.get(door.roomId);
  const name=treatments[ROOM_USES[floor.id]?.[door.roomId]]??room?.doorLabel?.join(' ');
  return {door,number,lines:name?[number,name]:[number]};
 });
}

// Both readable faces follow the actual open leaf, rather than its doorway.
export function addAsylumDoorLabels(THREE,scene,floor,document=globalThis.document){
 const labelled=asylumDoorLabels(floor);
 if(!labelled.length)return;
 // A compact grid keeps every floor atlas below 4096 px, including phones.
 const tileWidth=768,rowHeight=256,padding=12,columns=Math.ceil(Math.sqrt(labelled.length*rowHeight/tileWidth)),rows=Math.ceil(labelled.length/columns);
 const atlasWidth=tileWidth*columns,atlasHeight=rowHeight*rows,canvas=document?.createElement('canvas');
 let texture=null;
 if(canvas){
  canvas.width=atlasWidth;canvas.height=atlasHeight;
  const g=canvas.getContext('2d');
  for(const [row,{lines}] of labelled.entries()){
   const x=row%columns*tileWidth,y=Math.floor(row/columns)*rowHeight;
   paintAsylumSign(g,lines,{x:x+padding,y:y+padding,width:tileWidth-padding*2,height:rowHeight-padding*2,seed:1829+floor.id*719+row*131});
  }
  texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=4;
  // Avoid mip rows bleeding into a neighbouring room name at a distance.
  texture.generateMipmaps=false;texture.minFilter=texture.magFilter=THREE.LinearFilter;
 }
 const material=new THREE.MeshStandardMaterial({map:texture,color:texture?0xffffff:0xc6b997,roughness:.94});material.name='Asylum door nameplates';
 const parts=[],labels=[];
 for(const [row,{door,number,lines}] of labelled.entries()){
  const {x,z,rotation,width,depth}=door,normal=[Math.sin(rotation),Math.cos(rotation)];
  const w=Math.min(.82,width-.34),h=lines.length>1?.32:.22,y=1.75;
  for(const face of [-1,1]){
   // The painted timber board sits just proud of the raised door panel.
   const offset=depth/2+.011;
   const geometry=asylumSignGeometry(THREE,w,h,.008),uv=geometry.attributes.uv;
   const column=row%columns,tileRow=Math.floor(row/columns),left=(column*tileWidth+padding)/atlasWidth,right=((column+1)*tileWidth-padding)/atlasWidth;
   const lo=1-(tileRow+1)/rows+padding/atlasHeight,hi=1-tileRow/rows-padding/atlasHeight;
   for(let i=0;i<uv.count;i++)uv.setXY(i,left+uv.getX(i)*(right-left),lo+uv.getY(i)*(hi-lo));
   geometry.rotateY(rotation+(face<0?Math.PI:0));geometry.translate(x+normal[0]*face*offset,y,z+normal[1]*face*offset);
   parts.push(geometry);
   labels.push({roomId:door.roomId,number,text:lines.join(' '),face,x:x+normal[0]*face*offset,y,z:z+normal[1]*face*offset,width:w,height:h});
  }
 }
 const geometry=mergeGeometries(parts);for(const part of parts)part.dispose();
 const mesh=new THREE.Mesh(geometry,material);mesh.name='Asylum RoomDoorLabels';mesh.userData.labels=labels;scene.add(mesh);
}
