import {mergeGeometries} from './vendor/BufferGeometryUtils.js';

// Explicit plan labels keep this limited to the five approved upper rooms.
// Both readable faces follow the actual open leaf, rather than its doorway.
export function addAsylumDoorLabels(THREE,scene,floor,box,document=globalThis.document){
 const labelled=(floor.roomDoors??[]).flatMap(door=>{
  const lines=floor.rooms.find(room=>room.id===door.roomId)?.doorLabel;
  return lines?.length?[{door,lines}]:[];
 });
 if(!labelled.length)return;
 const rowHeight=256,padding=12,atlasHeight=rowHeight*labelled.length,canvas=document?.createElement('canvas');
 let texture=null;
 if(canvas){
  canvas.width=768;canvas.height=atlasHeight;
  const g=canvas.getContext('2d');
  for(const [row,{lines}] of labelled.entries()){
   const y=row*rowHeight;
   g.fillStyle='#c5b47f';g.fillRect(0,y,canvas.width,rowHeight);
   g.strokeStyle='#79653c';g.lineWidth=4;g.strokeRect(padding,y+padding,canvas.width-padding*2,rowHeight-padding*2);
   g.fillStyle='#30291c';g.textAlign='center';g.textBaseline='middle';
   for(const [i,line] of lines.entries()){
    let size=76;g.font=`${size}px Georgia, serif`;
    while(g.measureText(line.toUpperCase()).width>canvas.width-80){g.font=`${--size}px Georgia, serif`;}
    g.fillText(line.toUpperCase(),canvas.width/2,y+rowHeight/2+(i-(lines.length-1)/2)*88);
   }
  }
  texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=4;
  // Avoid mip rows bleeding into a neighbouring room name at a distance.
  texture.generateMipmaps=false;texture.minFilter=texture.magFilter=THREE.LinearFilter;
 }
 const material=new THREE.MeshBasicMaterial({map:texture,color:texture?0xffffff:0xc5b47f});material.name='Asylum door nameplates';
 const parts=[],labels=[];
 for(const [row,{door,lines}] of labelled.entries()){
  const {x,z,rotation,width,depth}=door,normal=[Math.sin(rotation),Math.cos(rotation)];
  const w=Math.min(.82,width-.34),h=.26,y=1.75;
  for(const face of [-1,1]){
   // A shallow brass backing sits just proud of the raised timber panel.
   const backing=depth/2+.009,offset=backing+.003;
   box('Brass',x+normal[0]*face*backing,y,z+normal[1]*face*backing,w+.02,h+.02,.004,rotation);
   const geometry=new THREE.PlaneGeometry(w,h),uv=geometry.attributes.uv;
   const lo=1-(row+1)/labelled.length+padding/atlasHeight,hi=1-row/labelled.length-padding/atlasHeight;
   for(let i=0;i<uv.count;i++)uv.setXY(i,.016+uv.getX(i)*.968,lo+uv.getY(i)*(hi-lo));
   geometry.rotateY(rotation+(face<0?Math.PI:0));geometry.translate(x+normal[0]*face*offset,y,z+normal[1]*face*offset);
   parts.push(geometry);
   labels.push({roomId:door.roomId,text:lines.join(' '),face,x:x+normal[0]*face*offset,y,z:z+normal[1]*face*offset,width:w,height:h});
  }
 }
 const geometry=mergeGeometries(parts);for(const part of parts)part.dispose();
 const mesh=new THREE.Mesh(geometry,material);mesh.name='Asylum RoomDoorLabels';mesh.userData.labels=labels;scene.add(mesh);
}
