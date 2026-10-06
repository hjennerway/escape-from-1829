import {mergeGeometries} from './vendor/BufferGeometryUtils.js';
import {ROOM_USES} from './asylum-room-uses.mjs';
import {asylumRoomNumbers} from './asylum-room-numbers.mjs';

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
export function addAsylumDoorLabels(THREE,scene,floor,box,document=globalThis.document){
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
   g.fillStyle='#c5b47f';g.fillRect(x,y,tileWidth,rowHeight);
   g.strokeStyle='#79653c';g.lineWidth=4;g.strokeRect(x+padding,y+padding,tileWidth-padding*2,rowHeight-padding*2);
   g.fillStyle='#30291c';g.textAlign='center';g.textBaseline='middle';
   for(const [i,line] of lines.entries()){
    let size=i===0?112:68;g.font=`${size}px Georgia, serif`;
    while(g.measureText(line.toUpperCase()).width>tileWidth-80){g.font=`${--size}px Georgia, serif`;}
    g.fillText(line.toUpperCase(),x+tileWidth/2,y+rowHeight/2+(i-(lines.length-1)/2)*100);
   }
  }
  texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=4;
  // Avoid mip rows bleeding into a neighbouring room name at a distance.
  texture.generateMipmaps=false;texture.minFilter=texture.magFilter=THREE.LinearFilter;
 }
 const material=new THREE.MeshBasicMaterial({map:texture,color:texture?0xffffff:0xc5b47f});material.name='Asylum door nameplates';
 const parts=[],labels=[];
 for(const [row,{door,number,lines}] of labelled.entries()){
  const {x,z,rotation,width,depth}=door,normal=[Math.sin(rotation),Math.cos(rotation)];
  const w=Math.min(.82,width-.34),h=lines.length>1?.32:.22,y=1.75;
  for(const face of [-1,1]){
   // A shallow brass backing sits just proud of the raised timber panel.
   const backing=depth/2+.009,offset=backing+.003;
   box('Brass',x+normal[0]*face*backing,y,z+normal[1]*face*backing,w+.02,h+.02,.004,rotation);
   const geometry=new THREE.PlaneGeometry(w,h),uv=geometry.attributes.uv;
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
