// Main-corridor photograph: three courses of buff headers at the top of the
// exposed red brick, and alternating red/buff masonry through the arch reveals.
export const CORRIDOR_FINISH={textureWidth:2.08,textureHeight:5.05,bandTop:1.68,course:.10,bandCourses:3,brickLength:.26};

function texture(THREE,canvas,resources){
 const t=new THREE.CanvasTexture(canvas);t.wrapS=THREE.RepeatWrapping;t.wrapT=THREE.ClampToEdgeWrapping;t.colorSpace=THREE.SRGBColorSpace;resources.add(t);return t;
}
function canvas(width,height){const c=document.createElement('canvas');c.width=width;c.height=height;return c;}
const hash=(x,y)=>{const n=Math.sin(x*127.1+y*311.7)*43758.5453;return n-Math.floor(n);};

export function createWorkshopInteriorFinish(THREE,{resources,material}){
 const f=CORRIDOR_FINISH,colour=canvas(1024,2048),relief=canvas(1024,2048),c=colour.getContext('2d'),b=relief.getContext('2d');
 c.fillStyle='#b5afa1';c.fillRect(0,0,colour.width,colour.height);b.fillStyle='#636363';b.fillRect(0,0,relief.width,relief.height);
 // Eight stretchers / sixteen headers close at the repeat boundary, including
 // the staggered rows. A two-unit repeat cut through the last striped brick.
 const sx=colour.width/f.textureWidth,sy=colour.height/f.textureHeight;
 for(let row=-18;row<35;row++){
  const top=f.bandTop+row*f.course,painted=row>0,band=row<=0&&row>-f.bandCourses,width=band?f.brickLength/2:f.brickLength;
  const y=Math.round((f.textureHeight-top)*sy),h=Math.round((f.textureHeight-top+f.course)*sy)-y,shift=(Math.abs(row)%2)*width/2;
  c.fillStyle=painted?'#c5c1b6':'#aaa294';c.fillRect(0,y,colour.width,h);
  for(let col=-1;col<Math.ceil(f.textureWidth/width)+1;col++){
   const count=Math.round(f.textureWidth/width),wrapped=(col%count+count)%count;
   const x=(col*width+shift)*sx,inset=1.6,index=Math.floor(hash(wrapped,row)*4);
   c.fillStyle=painted?['#d3d0c4','#cfccbf','#d8d4c8','#d1cec3'][index]:band&&Math.abs(col)%2===0?['#bbae80','#c1b488','#b5a777','#c4b88c'][index]:['#906457','#986a5b','#885e53','#94695d'][index];
   c.fillRect(x+inset,y+inset,width*sx-inset*2,h-inset*2);
   b.fillStyle=['#b7b7b7','#bcbcbc','#b3b3b3','#b9b9b9'][index];b.fillRect(x+inset,y+inset,width*sx-inset*2,h-inset*2);
   // Small repeatable flecks retain the worn brick/paint grain without large
   // stains being tiled conspicuously along the whole passage.
   for(let k=0;k<22;k++){
    const u=hash(wrapped*31+k,row),v=hash(wrapped,row*29+k),size=1+hash(k+wrapped,row)*2;
    c.fillStyle=painted?'rgba(91,85,73,.055)':'rgba(222,211,187,.065)';c.fillRect(x+4+u*(width*sx-8),y+4+v*(h-8),size*2,size);
   }
  }
 }
 const map=texture(THREE,colour,resources),bumpMap=texture(THREE,relief,resources);bumpMap.colorSpace=THREE.NoColorSpace;
 const finish=material(0xffffff,{map,bumpMap,bumpScale:.012,emissive:0x453b2a,emissiveMap:map,emissiveIntensity:.16});
 function revealBrick(palette){
  const image=canvas(128,128),ctx=image.getContext('2d');ctx.fillStyle=palette[0];ctx.fillRect(0,0,128,128);
  for(let i=0;i<600;i++){ctx.fillStyle=palette[1];ctx.fillRect(hash(i,1)*128,hash(i,2)*128,1+hash(i,3)*3,1);}
  const map=texture(THREE,image,resources);map.wrapT=THREE.RepeatWrapping;
  return material(0xffffff,{map,roughness:.96,emissive:0x453b2a,emissiveMap:map,emissiveIntensity:.12});
 }
 // A four-metre repeat: mottled, worn concrete with fine aggregate and pores.
 // No regular slab joints or painted lines run across the passage.
 const concrete=canvas(512,512),pores=canvas(512,512),cc=concrete.getContext('2d'),pc=pores.getContext('2d');
 cc.fillStyle='#85877e';cc.fillRect(0,0,512,512);pc.fillStyle='#888888';pc.fillRect(0,0,512,512);
 for(let i=0;i<35;i++){
  const x=hash(i,71)*512,y=hash(i,72)*512,r=18+hash(i,73)*70;
  // Duplicate edge stains on the opposite edge for a seamless repeat.
  for(const dx of [-512,0,512])for(const dy of [-512,0,512]){const stain=cc.createRadialGradient(x+dx,y+dy,0,x+dx,y+dy,r);stain.addColorStop(0,i%3?'rgba(58,61,53,.045)':'rgba(207,204,184,.07)');stain.addColorStop(1,'rgba(0,0,0,0)');cc.fillStyle=stain;cc.fillRect(x+dx-r,y+dy-r,r*2,r*2);}
 }
 for(let i=0;i<9000;i++){
  const x=hash(i,81)*512,y=hash(i,82)*512,size=.5+hash(i,83)*1.8;
  cc.fillStyle=i%3?'rgba(218,216,199,.095)':'rgba(38,43,36,.14)';cc.fillRect(x,y,size,size*.7);
  pc.fillStyle=i%3?'#919191':'#6e6e6e';pc.fillRect(x,y,size,size*.7);
 }
 const floorMap=texture(THREE,concrete,resources),floorBump=texture(THREE,pores,resources);floorMap.wrapT=floorBump.wrapT=THREE.RepeatWrapping;floorBump.colorSpace=THREE.NoColorSpace;
 const floor=material(0xffffff,{map:floorMap,bumpMap:floorBump,bumpScale:.008,roughness:.97});
 return {finish,floor,reveal:{red:revealBrick(['#8a5145','rgba(193,152,122,.20)']),buff:revealBrick(['#bead78','rgba(235,220,178,.18)']),mortar:material(0xaaa292),sill:material(0x9b9b90)}};
}

// Local X/Y follows the opening and +Z points into the room. The brick goes
// back through the wall thickness, so the stripes are visible on the soffit
// as well as the front face. It stays outside the original clear aperture.
export function addStripedWindowReveal(THREE,{parent,resources,reveal,width=1.12,spring=.65,depth=.285,front=.065}){
 const radius=width/2,inner=radius+.002,outer=radius+.22;
 function mesh(geometry,mat,name){resources.add(geometry);const o=new THREE.Mesh(geometry,mat);o.name=name;o.castShadow=o.receiveShadow=true;o.userData.noWalkingCollision=true;parent.add(o);return o;}
 function ring(r0,r1,a0,a1,mat,name,z0=-depth,z1=front){
  const shape=new THREE.Shape();shape.moveTo(r0*Math.cos(a0),spring+r0*Math.sin(a0));shape.absarc(0,spring,r1,a0,a1,false);shape.lineTo(r0*Math.cos(a1),spring+r0*Math.sin(a1));shape.absarc(0,spring,r0,a1,a0,true);shape.closePath();
  const geometry=new THREE.ExtrudeGeometry(shape,{depth:z1-z0,bevelEnabled:false,curveSegments:Math.max(2,Math.ceil((a1-a0)/Math.PI*24))}),p=geometry.attributes.position,uv=geometry.attributes.uv;
  for(let i=0;i<p.count;i++)uv.setXY(i,p.getX(i)*2,p.getY(i)*2);
  const o=mesh(geometry,mat,name);o.position.z=z0;return o;
 }
 // Recessed mortar is exposed only at the joints between separate bricks.
 ring(inner,outer,0,Math.PI,reveal.mortar,'Striped window arch mortar',-depth,front-.006);
 const segments=14,gap=.009/((inner+outer)/2);
 for(let i=0;i<segments;i++)ring(inner,outer,i*Math.PI/segments+gap/2,(i+1)*Math.PI/segments-gap/2,i%2?reveal.red:reveal.buff,'Alternating red buff arch brick');
 // The photograph has a thin, continuous red arris around the striped arch.
 ring(outer+.006,outer+.045,0,Math.PI,reveal.red,'Red brick outer arch edge',-depth,front+.006);
 const count=6,course=spring/count;
 for(const side of [-1,1]){
  const backing=mesh(new THREE.BoxGeometry(outer-inner,spring,depth+front-.006),reveal.mortar,'Striped window jamb mortar');backing.position.set(side*(inner+outer)/2,spring/2,(front-.006-depth)/2);
  for(let i=0;i<count;i++){
   const brick=mesh(new THREE.BoxGeometry(outer-inner,course-.008,depth+front),i%2?reveal.buff:reveal.red,'Alternating red buff jamb brick');brick.position.set(side*(inner+outer)/2,(i+.5)*course,(front-depth)/2);
  }
  const edge=mesh(new THREE.BoxGeometry(.039,spring,depth+front+.006),reveal.red,'Red brick outer jamb edge');edge.position.set(side*(outer+.0255),spring/2,(front+.006-depth)/2);
 }
}

// Shared corridor details supply the exterior stonework. Only the inward
// face of an Escape workshop receives the photographed striped brickwork.
export function finishWorkshopWindowReveals(THREE,{wall,resources,reveal}){
 for(const face of wall.children){
  if(face.rotation.y!==0)continue;
  for(const window of face.children){
   if(window.name!=='Corridor round-headed window')continue;
   for(const child of [...window.children]){
    if(/Corridor stone arch|Corridor stone jamb|Corridor arch joint/.test(child.name))window.remove(child);
    else if(child.name==='Corridor projecting stone sill')child.material=reveal.sill;
   }
   addStripedWindowReveal(THREE,{parent:window,resources,reveal,front:.15});
  }
 }
}
