import {TOWER_ROOF_CONTACTS} from './tower-roof-profiles.mjs';
// Four ground-level photographs, registered using tower/locationa.png.
// Perspective convergence in the photos is not a taper in the masonry.
export const ESCAPE_WATER_TOWER=Object.freeze({x:148,z:-55.2,height:17.75*2.2,width:10.2});
// Local +Z faces outwards: 2 faces 1829 (-X), 4 faces the annexe (+X).
export const WATER_TOWER_SIDES=Object.freeze([
  {number:1,rotation:0,label:'Entrance'},
  {number:2,rotation:-Math.PI/2,label:'1829'},
  {number:3,rotation:Math.PI,label:'Bricked doorway'},
  {number:4,rotation:Math.PI/2,label:'Annexe'}
]);
export const WATER_TOWER_VIEWS=Object.freeze(Object.fromEntries(WATER_TOWER_SIDES.map(({number,rotation})=>{
  const d=30,c=Math.cos(rotation),s=Math.sin(rotation),{x,z}=ESCAPE_WATER_TOWER;
  return ['tower-'+number,{position:[x+s*d,1.8,z+c*d],target:[x,18,z],fov:67}];
})));
export function createWaterTower(THREE,{brick,roof,dark,worldUV}){
  const tower=new THREE.Group();tower.name='Water tower · rear-right clearing';
  tower.position.set(ESCAPE_WATER_TOWER.x,0,ESCAPE_WATER_TOWER.z);
  // Dedicated varied brick texture: buff repairs, dark bricks and pale mortar.
  const canvas=document.createElement('canvas');canvas.width=canvas.height=512;
  const ctx=canvas.getContext('2d');let seed=1829;
  const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
  ctx.fillStyle='#9d907b';ctx.fillRect(0,0,512,512);
  const palette=['#86614f','#98715a','#9b785e','#8d705b','#7e6252','#a08265','#8d6653','#a1886b'];
  for(let row=0;row<32;row++)for(let col=-1;col<17;col++){
    ctx.fillStyle=palette[Math.floor(random()*palette.length)];
    ctx.fillRect(col*32+(row%2)*16+1,row*16+1,30,14);
  }
  for(let i=0;i<15000;i++){ctx.fillStyle=i%2?'#e0cda023':'#2e211b25';ctx.fillRect(random()*512,random()*512,2,1);}
  const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;
  texture.wrapS=texture.wrapT=THREE.RepeatWrapping;texture.anisotropy=8;
  const masonry=brick.clone();masonry.map=texture;masonry.color.set(0xffffff);
  const tint=color=>{const m=masonry.clone();m.color.set(color);return m;};
  const dress=tint(0xd4b9a3),recessed=tint(0xc4b8a7);
  const soot=tint(0x8b8376),faint=tint(0xded0ba);
  // Red repairs and lime-mortared blocked openings are distinct from the
  // older brown shaft. Multiplying its buff texture made both too dark.
  const redBricks=['#935d4b','#a16650','#9c6c53','#8c5646','#a36e56','#9b6251','#845343','#a8755c'];
  function brickFinish(palette,mortar){
    const c=document.createElement('canvas');c.width=c.height=512;
    const p=c.getContext('2d');p.fillStyle=mortar;p.fillRect(0,0,512,512);
    for(let row=0;row<32;row++)for(let col=-1;col<17;col++){
      p.fillStyle=palette[Math.floor(random()*palette.length)];
      p.fillRect(col*32+(row%2)*16+1,row*16+1,30,14);
    }
    for(let i=0;i<12000;i++){p.fillStyle=i%2?'#d2bfa33b':'#39282127';p.fillRect(random()*512,random()*512,2,1);}
    const m=masonry.clone();m.map=new THREE.CanvasTexture(c);m.map.colorSpace=THREE.SRGBColorSpace;
    m.map.wrapS=m.map.wrapT=THREE.RepeatWrapping;m.map.anisotropy=8;return m;
  }
  const repair=brickFinish([...redBricks,'#b8a084','#bea78b','#776053','#ae9176'],'#b9ab95');
  const redDress=brickFinish(redBricks,'#a38a73');
  // Photos 3 and 4 show alternating red and buff-yellow voussoirs in the
  // ground-level arch heads. Map bands radially, not as horizontal wall courses.
  const archBrickCount=21,archCanvas=document.createElement('canvas');
  archCanvas.width=512;archCanvas.height=128;
  const archCtx=archCanvas.getContext('2d');archCtx.fillStyle='#a79980';archCtx.fillRect(0,0,512,128);
  const archYellow=['#c6b383','#beaa78','#cdbb8d'],archRed=['#8b5140','#965b46','#824b3c'];
  for(let i=0;i<archBrickCount;i++){
    const colours=i%2?archRed:archYellow;
    archCtx.fillStyle=colours[i%colours.length];archCtx.fillRect(i*512/archBrickCount+1,0,512/archBrickCount-2,128);
  }
  // Use an independent noise seed to preserve the surrounding wall textures.
  let archSeed=1834;
  const archRandom=()=>{archSeed=(Math.imul(archSeed,1664525)+1013904223)>>>0;return archSeed/4294967296;};
  for(let i=0;i<6000;i++){archCtx.fillStyle=i%2?'#ecddbd25':'#48342828';archCtx.fillRect(archRandom()*512,archRandom()*128,2,1);}
  const stripedArch=masonry.clone();stripedArch.name='Alternating red and yellow arch bricks';
  stripedArch.map=new THREE.CanvasTexture(archCanvas);stripedArch.map.colorSpace=THREE.SRGBColorSpace;stripedArch.map.anisotropy=8;
  const whiteCanvas=document.createElement('canvas');whiteCanvas.width=whiteCanvas.height=512;
  const whiteCtx=whiteCanvas.getContext('2d');whiteCtx.fillStyle='#a4a397';whiteCtx.fillRect(0,0,512,512);
  for(let r=0;r<32;r++)for(let c=-1;c<17;c++){whiteCtx.fillStyle=r%3?'#d7d6c9':'#cccdbf';whiteCtx.fillRect(c*32+(r%2)*16+1,r*16+1,30,14);}
  const pale=masonry.clone();pale.map=new THREE.CanvasTexture(whiteCanvas);pale.map.colorSpace=THREE.SRGBColorSpace;pale.map.wrapS=pale.map.wrapT=THREE.RepeatWrapping;pale.map.anisotropy=8;
  const iron=new THREE.MeshStandardMaterial({color:0x292b29,roughness:.88});
  const stone=new THREE.MeshStandardMaterial({color:0x9d998a,roughness:1});
  const paint=new THREE.MeshStandardMaterial({color:0xc2c8bf,roughness:.9});
  const cap=roof.clone();cap.color.set(0x9b8c7b);
  function mesh(g,m,x,y,z,parent=tower,name=''){
    const o=new THREE.Mesh(g,m);o.position.set(x,y,z);o.name=name;o.castShadow=true;o.receiveShadow=true;parent.add(o);return o;
  }
  function box(m,x,y,z,w,h,d,parent=tower,name=''){return mesh(worldUV(new THREE.BoxGeometry(w,h,d),4.4),m,x,y,z,parent,name);}
  function arch(w,spring){const s=new THREE.Shape();s.moveTo(-w/2,0);s.lineTo(w/2,0);s.lineTo(w/2,spring);s.absarc(0,spring,w/2,0,Math.PI,false);s.closePath();return s;}
  function flat(shape,m,x,y,z,parent,name){return mesh(worldUV(new THREE.ShapeGeometry(shape),4.4),m,x,y,z,parent,name);}
  function polygon(points,m,z,parent,name){const s=new THREE.Shape();s.moveTo(...points[0]);for(const p of points.slice(1))s.lineTo(...p);s.closePath();return flat(s,m,0,0,z,parent,name);}
  function repairedWall(face,number,profile){
    // Only the photographed inward-falling contact bounds these repairs.
    // The outer-to-centre rising triangles in the earlier model were spurious.
    const left=number===1?-1.9:-4.57,right=number===3?1.9:4.57;
    const heightAt=x=>{
      const end=profile.findIndex(p=>p[0]>=x);
      if(end<=0)return profile[end===0?0:profile.length-1][1];
      const [a,b]=[profile[end-1],profile[end]];
      return a[1]+(b[1]-a[1])*(x-a[0])/(b[0]-a[0]);
    };
    const edge=[[left,heightAt(left)],...profile.filter(([x])=>x>left&&x<right),[right,heightAt(right)]];
    const c=document.createElement('canvas');c.width=c.height=1024;
    const p=c.getContext('2d');p.fillStyle='#ac947b';p.fillRect(0,0,1024,1024);
    // Broad, irregular lime residue is strongest on side 4's lower right.
    // It follows brick courses rather than introducing another diagonal seam.
    const patches=number===1?[[2.5,5.9,2,1.7,.35]]:number===3?[[-3.2,7.2,1.8,1.5,.5],[-2.4,2.7,1.8,2,.3]]:[[2.8,3.1,2.4,3,.7],[2,7.2,2.5,1.3,.45],[-3,6,1.5,1.7,.2]];
    const sx=1024/10.2,sy=1024/TOWER_ROOF_CONTACTS.corner;
    for(let row=0;row<Math.ceil(TOWER_ROOF_CONTACTS.corner/.1375);row++)for(let col=-20;col<20;col++){
      const x=col*.275+(row%2)*.1375,y=row*.1375;
      const chalk=patches.reduce((n,[cx,cy,w,h,a])=>n+a*Math.exp(-(((x-cx)/w)**2+((y-cy)/h)**2)),0);
      const mix=Math.min(.72,chalk*(.35+random()*.9));
      const rgb=redBricks[Math.floor(random()*redBricks.length)].match(/[a-f\d]{2}/g).map(v=>parseInt(v,16));
      p.fillStyle='rgb('+rgb.map((v,i)=>Math.round(v*(1-mix)+[193,175,149][i]*mix)).join(',')+')';
      p.fillRect((x+5.1+.009)*sx,1024-(y+.1285)*sy,.257*sx,.1195*sy);
    }
    for(let i=0;i<24000;i++){p.fillStyle=i%2?'#e0cfaf36':'#36251e25';p.fillRect(random()*1024,random()*1024,2,1);}
    const m=masonry.clone();m.map=new THREE.CanvasTexture(c);m.map.colorSpace=THREE.SRGBColorSpace;m.map.anisotropy=8;
    const wall=polygon([[left,.55],[right,.55],...edge.reverse()],m,5.112,face,'Weathered red brick below roof contact');
    const g=wall.geometry,pos=g.attributes.position;
    for(let i=0;i<pos.count;i++)g.attributes.uv.setXY(i,(pos.getX(i)+5.1)/10.2,pos.getY(i)/TOWER_ROOF_CONTACTS.corner);
  }
  function ring(radius,thickness,x,y,z,parent,m=dress,name='Brick arch',striped=false){
    const s=new THREE.Shape();s.absarc(0,0,radius,0,Math.PI,false);s.lineTo(-radius+thickness,0);s.absarc(0,0,radius-thickness,Math.PI,0,true);s.closePath();
    const g=new THREE.ExtrudeGeometry(s,{depth:.1,bevelEnabled:false,curveSegments:36});
    worldUV(g,4.4);
    if(striped){
      const p=g.attributes.position,uv=g.attributes.uv;
      for(let i=0;i<p.count;i++)uv.setXY(i,Math.max(0,Math.min(1,Math.atan2(p.getY(i),p.getX(i))/Math.PI)),(Math.hypot(p.getX(i),p.getY(i))-radius+thickness)/thickness);
    }
    const o=mesh(g,striped?stripedArch:m,x,y,z,parent,name);
    // Radial mortar joints follow the round head and each coloured brick.
    const count=striped?archBrickCount:Math.ceil(radius*12);
    for(let i=0;i<=count;i++){
      const a=i*Math.PI/count,r=radius-thickness/2;
      const joint=box(stone,x+Math.cos(a)*r,y+Math.sin(a)*r,z+.108,thickness,.016,.008,parent);
      joint.rotation.z=a;joint.castShadow=false;
    }
    return o;
  }
  function opening(face,{w,spring,y,fill,name,surround=dress,striped=false}){
    flat(arch(w,spring),recessed,0,y,5.16,face,name+' reveal');
    flat(arch(w-.18,spring-.04),fill,0,y+.04,5.18,face,name);
    for(const x of [-w/2-.13,w/2+.13])box(surround,x,y+spring/2,5.22,.26,spring,.18,face);
    ring(w/2+.28,.3,0,y+spring,5.2,face,surround,name+' arch',striped);
    box(dress,0,y,5.25,w+.55,.16,.3,face);
  }
  // Shallow stepped staining bands, not projecting roof geometry.
  function scar(face,points,width,m,name,z=5.135){
    const group=new THREE.Group();group.name=name;face.add(group);
    for(let i=1;i<points.length;i++){
      const [ax,ay]=points[i-1],[bx,by]=points[i],steps=Math.ceil(Math.abs(bx-ax)/.27);
      for(let j=0;j<steps;j++){
        const t=(j+.5)/steps,x=ax+(bx-ax)*t,y=Math.round((ay+(by-ay)*t)/.1375)*.1375;
        box(m,x,y,z,Math.abs(bx-ax)/steps+.015,width,.018,group);
      }
    }
  }
  box(masonry,0,16.9,0,10.2,33.8,10.2,tower,'Square brick shaft');
  box(soot,0,.25,0,10.35,.5,10.35);
  box(dress,0,20.15,0,10.48,.25,10.48,tower,'Upper stage string course');
  box(iron,0,20.32,0,10.58,.1,10.58);
  for(const {number,rotation,label} of WATER_TOWER_SIDES){
    const face=new THREE.Group();face.rotation.y=rotation;face.name=`Water tower side ${number} · ${label}`;face.userData.photoSide=number;tower.add(face);
    for(const x of [-4.83,4.83])box(dress,x,16.85,5.14,.54,33.1,.13,face);
    // Compact upper stage: broad round head, paired long blind panels and
    // exactly three pairs of small bricked slit recesses.
    flat(arch(4.05,9.55),recessed,0,20.5,5.145,face,'Upper blind arcade');
    for(const x of [-2.12,2.12])box(dress,x,25.25,5.24,.27,9.5,.18,face);
    for(const [r,t,z] of [[2.92,.3,5.18],[2.57,.23,5.29],[2.25,.2,5.37]])ring(r,t,0,30.02,z,face);
    for(const x of [-3.98,3.98])box(iron,x,30.03,5.28,2.32,.12,.22,face);
    for(const x of [-.91,.91]){
      flat(arch(1.46,9.35),dress,x,20.55,5.29,face,'Tall paired blind panel');
      ring(.84,.18,x,29.88,5.43,face);
      for(const y of [21.15,24.1,27.1]){
        flat(arch(.54,1.35),soot,x,y,5.45,face,'Blind slit shadow');
        flat(arch(.38,1.29),recessed,x,y+.06,5.465,face,'Bricked slit recess');
        ring(.34,.1,x,y+1.35,5.47,face);
        box(dress,x,y-.04,5.49,.82,.12,.2,face);
      }
    }
    for(let x=-4.6;x<4.7;x+=.66){box(dress,x,33.05,5.27,.34,.52,.34,face);box(dress,x,33.36,5.39,.48,.16,.55,face);}
    if(number!==2){
      // Keep the red-marked contacts exactly aligned with the adjoining roofs,
      // including their flat strip in front of the upper arch.
      const falling=TOWER_ROOF_CONTACTS.faces.find(f=>f.side===number).profile;
      repairedWall(face,number,falling);
      scar(face,falling,number===3?.28:.4,soot,'Descending intersecting roof scars');
      opening(face,{w:3.35,spring:4.85,y:7.15,fill:repair,name:'Large bricked upper opening',surround:redDress});
      box(repair,0,6.8,5.145,3.8,.4,.04,face,'Former opening sill repair');
      opening(face,{w:2.95,spring:4.15,y:.3,fill:number===1?iron:repair,name:number===1?'Arched entrance':'Bricked ground doorway',surround:faint,striped:number===3||number===4});
      if(number===1){
        for(const x of [-1.38,1.38])box(paint,x,2.42,5.37,.15,4.22,.12,face);
        box(paint,0,4.43,5.36,2.82,.15,.1,face);
        ring(1.43,.1,0,4.43,5.34,face,paint,'Painted entrance fanlight');
        box(paint,-.91,2.34,5.35,.84,3.95,.08,face);box(paint,.94,2.34,5.35,.8,3.95,.08,face);
        box(paint,.4,2.4,5.39,.09,4,.08,face);
        polygon([[2.48,.2],[4.57,.2],[4.57,3.6],[2.48,3.6]],pale,5.15,face,'Pale lower right repair');
        box(dress,-3.44,5.5,5.23,.78,2.15,.08,face,'Small blocked side opening');
      }
      if(number===4)polygon([[-4.57,.2],[-1.8,.2],[-1.8,4.1],[-4.57,4.1]],pale,5.15,face,'Pale lower left repair');
    }else{
      // 1829 side: glazed lower arch, single small blocked opening above.
      opening(face,{w:2.35,spring:4.25,y:1.5,fill:iron,name:'1829-facing arched window'});
      for(const x of [-.68,-.34,0,.34,.68])box(stone,x,3.86,5.36,.035,4.13,.045,face);
      for(const y of [2.6,3.5,4.4,5.3])box(stone,0,y,5.38,1.95,.04,.04,face);
      ring(1,.045,0,5.55,5.35,face,stone,'Glazed window arched frame');
      box(dress,0,11.25,5.2,1.1,2.25,.14,face,'Small blocked upper opening surround');
      box(recessed,0,11.25,5.3,.62,1.83,.045,face,'Small blocked upper opening');
      box(stone,0,12.51,5.29,1.45,.45,.25,face,'Weathered stone lintel');
      box(iron,0,10.04,5.29,1,.12,.2,face);
    }
    if(number===1||number===2){
      const pipeX=number===2?4.48:-4.48;
      mesh(new THREE.CylinderGeometry(.065,.065,32.6,8),iron,pipeX,16.5,5.4,face,'Rainwater downpipe');
      for(let y=1;y<33;y+=4)box(iron,pipeX,y,5.43,.22,.075,.18,face);
    }
    if(number===2||number===4)box(iron,0,19.15,5.36,.25,.36,.34,face,'Small wall fixture');
  }
  box(dress,0,33.55,0,10.9,.35,10.9);box(iron,0,33.84,0,11.6,.23,11.6);
  // These ground-level photos do not expose the pitch; retain the established
  // roof silhouette and finial height.
  const positions=[],uv=[],a=6.05,eave=33.96,peak=38.25;
  const corners=[[-a,eave,-a],[-a,eave,a],[a,eave,a],[a,eave,-a]];
  for(let i=0;i<4;i++)for(const p of [corners[i],corners[(i+1)%4],[0,peak,0]]){positions.push(...p);uv.push(p[0]/3,(p[2]+p[1])/3);}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.computeVertexNormals();mesh(g,cap,0,0,0,tower,'Pyramidal slate roof');
  mesh(new THREE.CylinderGeometry(.09,.17,.8,8),dark,0,38.45,0,tower,'Water tower roof finial');
  mesh(new THREE.SphereGeometry(.13,8,6),dark,0,38.92,0);
  // Merge small details per face/material, preserving world-scale brick UVs
  // and named openings while avoiding a draw call for every mortar joint.
  const groups=[];tower.traverse(o=>{if(o.isGroup)groups.push(o);});
  for(const parent of groups){
    const batches=new Map();
    for(const o of [...parent.children])if(o.isMesh&&!o.name){
      const key=o.material.uuid+':'+o.castShadow;
      if(!batches.has(key))batches.set(key,{material:o.material,shadow:o.castShadow,geometries:[]});
      o.updateMatrix();batches.get(key).geometries.push(o.geometry.clone().applyMatrix4(o.matrix));
      parent.remove(o);o.geometry.dispose();
    }
    for(const {material,shadow,geometries} of batches.values()){
      const parts=geometries.map(g=>g.index?g.toNonIndexed():g),merged=new THREE.BufferGeometry();
      for(const attr of ['position','normal','uv']){
        const size=parts[0].attributes[attr].itemSize,data=new Float32Array(parts.reduce((n,g)=>n+g.attributes[attr].array.length,0));
        let offset=0;for(const g of parts){data.set(g.attributes[attr].array,offset);offset+=g.attributes[attr].array.length;}
        merged.setAttribute(attr,new THREE.BufferAttribute(data,size));
      }
      for(const g of parts)g.dispose();
      const detail=mesh(merged,material,0,0,0,parent,'Batched masonry details');detail.castShadow=shadow;
      for(const g of geometries)g.dispose();
    }
  }
  return tower;
}
