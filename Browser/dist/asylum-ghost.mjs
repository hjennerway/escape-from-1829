import {mergeGeometries} from './vendor/BufferGeometryUtils.js';

// A runtime character, separate from the compiled estate/interior geometry.
// The root belongs to navigation; only its child joints move during animation.
export function createAsylumGhost(THREE){
 const root=new THREE.Group();root.name='Asylum apparition';
 const joint=(name,parent,p)=>{const o=new THREE.Group();o.name=name;o.position.set(...p);parent.add(o);return o;};
 const body=joint('Suspended shroud',root,[0,0,0]);
 const mat=(color,extra={})=>new THREE.MeshStandardMaterial({color,roughness:1,...extra});
 const cloth=mat(0xffffff,{vertexColors:true,side:THREE.DoubleSide,emissive:0x18241f,emissiveIntensity:.16});
 const skin=mat(0x6b786b,{emissive:0x26372c,emissiveIntensity:.12});
 const bone=mat(0x9b9f8a),dark=mat(0x030605),hair=mat(0x080e0b);
 const mist=mat(0x718d81,{transparent:true,opacity:.13,depthWrite:false,side:THREE.DoubleSide});
 function part(name,geometry,material,parent,p=[0,0,0],scale){
  const o=new THREE.Mesh(geometry,material);o.name=name;o.position.set(...p);if(scale)o.scale.set(...scale);parent.add(o);return o;
 }
 const oval=(name,p,scale,m,parent)=>part(name,new THREE.SphereGeometry(1,16,12),m,parent,p,scale);
 function cord(name,points,radius,m,parent){
  const curve=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)));
  return part(name,new THREE.TubeGeometry(curve,points.length*4,radius,5,false),m,parent);
 }
 // Irregular open hems and deep longitudinal folds avoid the old solid cone.
 function shroud(name,rings,parent,phase=0){
  const positions=[],colors=[],uv=[],indices=[],n=48;
  const tint=new THREE.Color();
  for(let j=0;j<rings.length;j++)for(let i=0;i<=n;i++){
   const a=i/n*Math.PI*2,fold=Math.cos(a*12+phase),[y,w,d,z=0]=rings[j];
   const rag=j===0?.075+.15*(.5+.5*Math.sin(a*17+phase))**3:0;
   const r=1+fold*.085;
   positions.push(Math.sin(a)*w*r,y+rag,Math.cos(a)*d*r+z);
   const shade=(.045+.065*(fold*.5+.5)+.012*Math.sin(a*7+j*1.7))*(.38+.62*j/(rings.length-1));
   tint.setRGB(shade*.83,shade*.94,shade*.85);colors.push(tint.r,tint.g,tint.b);uv.push(i/n,j/(rings.length-1));
   if(j<rings.length-1&&i<n){const k=j*(n+1)+i;indices.push(k,k+1,k+n+1,k+1,k+n+2,k+n+1);}
  }
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(new Float32Array(positions.length),3));
  g.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(indices);g.computeVertexNormals();
  return part(name,g,cloth,parent);
 }
 shroud('Torn burial gown',[[.15,.30,.21,-.10],[.47,.28,.19,-.07],[.82,.23,.16,-.02],[1.1,.17,.12],[1.36,.23,.13],[1.55,.29,.145,-.025],[1.63,.19,.12,-.035],[1.68,.077,.07]],body);
 // Narrow scraps hang independently below the hem, with no feet or solid base.
 const tatters=[];
 for(let i=0;i<7;i++){
  const a=i/7*Math.PI*2,t=joint('Trailing shroud scrap',body,[Math.sin(a)*.24,.38,Math.cos(a)*.17-.07]);
  const shape=new THREE.Shape();shape.moveTo(-.045,0);shape.lineTo(.05,-.02);shape.lineTo(.022,-.17-i%3*.036);shape.lineTo(-.01,-.10);shape.lineTo(-.027,-.23);shape.closePath();
  const g=new THREE.ShapeGeometry(shape);part('Fading cloth tip',g,mist,t);t.rotation.y=a;tatters.push(t);
 }
 cord('Exposed sinewy neck',[[0,1.58,-.01],[-.02,1.76,.02],[.015,1.86,.05]],.059,skin,body);
 for(const s of [-1,1]){
  cord('Neck tendon',[[s*.055,1.61,.065],[s*.038,1.77,.08],[s*.06,1.88,.082]],.006,skin,body);
  cord('Collarbone',[[s*.02,1.58,.13],[s*.13,1.60,.137],[s*.26,1.55,.095]],.010,skin,body);
 }
 const head=joint('Lolling head',body,[.016,1.94,.065]);
 // Hollow Eyes: sockets, lids, nose and gaunt cheeks share one continuous
 // surface. The recessed socket colour stays black under the player's torch;
 // there are no eyeballs, pupils, glowing eyes or floating facial primitives.
 const bell=(x,y,cx,cy,rx,ry)=>Math.exp(-(((x-cx)/rx)**2+((y-cy)/ry)**2));
 const smooth=(a,b,v)=>{const t=THREE.MathUtils.clamp((v-a)/(b-a),0,1);return t*t*(3-2*t);};
 function facialSurface(x,y){
  const ax=Math.abs(x),eyeY=y-.033+(ax-.059)*.10;
  const socket=Math.hypot((ax-.059)/.040,eyeY/.020);
  const hollow=bell(ax,y,.092,-.079,.031,.041);
  const temple=bell(ax,y,.117,.067,.029,.057);
  const cheek=bell(ax,y,.089,-.015,.030,.020);
  const brow=bell(ax,y,.059,.067,.046,.014);
  const nose=bell(x,y,0,.003,.018,.066)*.025
   +bell(x,y,0,-.046,.022,.022)*.030
   +bell(ax,y,.019,-.053,.012,.013)*.008;
  const nostril=bell(ax,y,.015,-.061,.006,.0035);
  const mouthY=-.118+.0015*(1-Math.min(1,(x/.046)**2));
  const mouthWidth=Math.exp(-((x/.040)**6));
  const seam=mouthWidth*Math.exp(-(((y-mouthY)/.0025)**2));
  const upperLip=mouthWidth*Math.exp(-(((y-mouthY-.005)/.0045)**2));
  const lowerLip=mouthWidth*Math.exp(-(((y-mouthY+.007)/.005)**2));
  const depth=-.031*Math.exp(-(socket**4)*1.1)
   +.004*Math.exp(-(((socket-1.12)/.20)**2))
   +brow*.012+cheek*.015-hollow*.021-temple*.009+nose
   -nostril*.005+upperLip*.006+lowerLip*.008-seam*.002;
  const socketShade=.0005+.9995*smooth(.86,1.28,socket);
  const lowerLid=bell(ax,eyeY,.059,-.025,.040,.007);
  const noseSide=bell(ax,y,.027,-.006,.012,.050);
  const shade=socketShade*(1-hollow*.72)*(1-temple*.32)
   *(1-bell(ax,y,.058,.006,.044,.023)*.36)*(1-lowerLid*.50)
   *(1-noseSide*.40)*(1-nostril*.90)*(1-seam*.96)
   *(1-upperLip*.68)*(1-lowerLip*.55);
  return {depth,shade};
 }
 const face=new THREE.SphereGeometry(1,96,64),points=face.attributes.position;
 for(let i=0;i<points.count;i++){
  const sx=points.getX(i),sy=points.getY(i),sz=points.getZ(i);
  const x=sx*.145*(sy<0?1+sy*.30:1),y=sy*.227-.012;
  const front=smooth(0,.55,sz),surface=facialSurface(x,y);
  points.setXYZ(i,x,y,sz*.119+(sz>0&&sy<0?.008:0)+surface.depth*front);
 }
 face.computeVertexNormals();
 // Sample the same sculpt in UV space for smooth lid/lip edges independent of
 // mesh density. Linear diffuse colour and a matte material keep empty sockets
 // dark even at close torch range, without a specular eyeball-like highlight.
 const textureSize=512,pixels=new Uint8Array(textureSize*textureSize*4);
 for(let row=0;row<textureSize;row++)for(let col=0;col<textureSize;col++){
  const phi=(col+.5)/textureSize*Math.PI*2,theta=(1-(row+.5)/textureSize)*Math.PI;
  const sy=Math.cos(theta),sz=Math.sin(phi)*Math.sin(theta);
  const x=-Math.cos(phi)*Math.sin(theta)*.145*(sy<0?1+sy*.30:1),y=sy*.227-.012;
  const shade=1+(facialSurface(x,y).shade-1)*smooth(0,.55,sz),index=(row*textureSize+col)*4;
  pixels[index]=pixels[index+1]=pixels[index+2]=Math.round(shade*255);pixels[index+3]=255;
 }
 const faceMap=new THREE.DataTexture(pixels,textureSize,textureSize,THREE.RGBAFormat);
 faceMap.name='Hollow sockets and gaunt facial shading';faceMap.magFilter=THREE.LinearFilter;
 faceMap.minFilter=THREE.LinearMipmapLinearFilter;faceMap.generateMipmaps=true;faceMap.needsUpdate=true;
 const faceSkin=new THREE.MeshLambertMaterial({color:0x6b786b,map:faceMap});
 part('Continuous hollow-eyed face',face,faceSkin,head);
 // Matted strands frame the face and break up the smooth skull silhouette.
 for(let i=0;i<17;i++){
  const a=.70+i/16*(Math.PI*2-1.4),x=Math.sin(a),z=Math.cos(a);
  cord('Matted hanging hair',[[x*.07,.188,z*.066],[x*.146,.08,z*.12],[x*(.16+i%3*.007),-.11,z*.126-.015],[x*.13,-.31-i%4*.039,z*.14-.035]],.008+i%3*.003,hair,head);
 }
 for(let i=0;i<4;i++)cord('Hair across face',[[.055+i*.011,.189,.062],[.035+i*.017,.101,.114],[.038+i*.021,-.015,.127],[.064+i*.016,-.20-i*.026,.095]],.006+i*.001,hair,head);
 const arms=[];
 for(const s of [-1,1]){
  const shoulder=joint('Drooping shoulder',body,[s*.255,1.54,-.015]);
  shroud('Ragged sleeve',[[-.40,.075,.069,.03],[-.23,.085,.085,.01],[0,.104,.094]],shoulder,s);
  cord('Elongated forearm',[[0,-.25,.012],[s*.025,-.43,.045],[s*.055,-.67,.12]],.035,skin,shoulder);
  cord('Forearm tendon',[[s*.018,-.32,.057],[s*.041,-.49,.076],[s*.063,-.64,.146]],.009,bone,shoulder);
  const hand=joint('Claw hand',shoulder,[s*.053,-.66,.13]);
  oval('Emaciated palm',[0,-.058,.009],[.057,.09,.027],skin,hand);
  for(let i=0;i<4;i++){
   const x=(i-1.5)*.029,len=.15+(i===1||i===2?.055:0);
   cord('Long crooked finger',[[x,-.096,.018],[x*1.38,-.17,.038],[x*1.53,-.105-len,.067],[x*1.35,-.09-len,.10]],.010,skin,hand);
   cord('Pointed black nail',[[x*1.53,-.105-len,.068],[x*1.35,-.09-len,.104],[x*1.15,-.073-len,.125]],.006,dark,hand);
   cord('Hand tendon',[[x*.5,.014,.026],[x,-.08,.033]],.004,bone,hand);
  }
  cord('Hooked thumb',[[s*.042,-.016,.01],[s*.096,-.081,.042],[s*.081,-.14,.086]],.013,skin,hand);
  arms.push({shoulder,hand,side:s});
 }
 const light=new THREE.PointLight(0x81b99f,.45,4);light.position.set(0,1.35,.45);root.add(light);
 // Merge rigid parts per joint/material to keep this detail inexpensive.
 function batch(parent){
  const groups=new Map();
  for(const child of [...parent.children]){
   if(!child.isMesh){batch(child);continue;}
   const list=groups.get(child.material)??[];list.push(child);groups.set(child.material,list);
  }
  for(const [material,meshes] of groups){
   if(meshes.length<2)continue;
   const geometries=meshes.map(m=>{m.updateMatrix();return m.geometry.clone().applyMatrix4(m.matrix);});
   const geometry=mergeGeometries(geometries);geometries.forEach(g=>g.dispose());
   const merged=new THREE.Mesh(geometry,material);merged.name=meshes.map(m=>m.name).join(' / ');
   for(const m of meshes){parent.remove(m);m.geometry.dispose();}parent.add(merged);
  }
 }
 batch(body);root.userData.ghostRig={body,head,arms,tatters,time:0};resetAsylumGhost(root);return root;
}

function pose({body,head,arms,tatters,time:t}){
 body.position.y=.05+Math.sin(t*1.7)*.045;
 body.rotation.z=Math.sin(t*.79)*.024;
 // Slow, mismatched rhythms make the suspended body feel unlike a walking NPC.
 head.rotation.set(-.12+Math.sin(t*.91)*.07,Math.sin(t*.63)*.10,-.16+Math.sin(t*1.13)*.055);
 for(const {shoulder,hand,side} of arms){
  shoulder.rotation.set(-.15+Math.sin(t*1.27+side)*.11,side*.09,side*(.12+Math.sin(t*.83+side)*.04));
  hand.rotation.set(-.20+Math.sin(t*1.43+side)*.10,side*.16,side*.07);
 }
 tatters.forEach((o,i)=>{o.rotation.x=Math.sin(t*1.6+i*.9)*.14;o.rotation.z=Math.sin(t*1.13+i)*.08;});
}

export function updateAsylumGhost(model,dt){
 const rig=model.userData.ghostRig;if(!rig||dt<=0)return;rig.time+=dt;pose(rig);
}

export function resetAsylumGhost(model){
 const rig=model.userData.ghostRig;if(!rig)return;rig.time=0;pose(rig);
}
