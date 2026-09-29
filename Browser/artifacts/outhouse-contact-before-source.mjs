// junction-location.png supplies the latest placement beside the road junction.
// Dimensions and unseen elevations are photo estimates.
// Local +X runs from the entrance gable towards the rear; +Z is the windowed side.
export const OUTHOUSE=Object.freeze({x:77.7,z:96,rotation:.1,length:8.1,width:5.1,eave:3.25,rise:2.55,ridgeFraction:.75});
export const outhousePoint=(x,y,z)=>[OUTHOUSE.x+Math.cos(OUTHOUSE.rotation)*x+Math.sin(OUTHOUSE.rotation)*z,y,OUTHOUSE.z-Math.sin(OUTHOUSE.rotation)*x+Math.cos(OUTHOUSE.rotation)*z];
export const OUTHOUSE_VIEWS=Object.freeze({
 outhouse:{position:outhousePoint(-13,11,17),target:outhousePoint(3,1.7,0),fov:47},
 'outhouse-site':{position:[-22,115,204],target:[55,0,65],fov:48},
 'outhouse-plan':{position:outhousePoint(3,40,.01),target:outhousePoint(3,0,0),fov:46},
 'outhouse-1':{position:outhousePoint(-17,1.8,-2.4),target:outhousePoint(1.2,2.25,0),fov:47},
 'outhouse-2':{position:outhousePoint(-.8,1.8,-3.5),target:outhousePoint(5.2,2,-2.5),fov:70},
 'outhouse-3':{position:outhousePoint(-6.8,1.8,8.8),target:outhousePoint(2.4,2.5,0),fov:62}
});

export function createOuthouse(THREE,{worldUV,material}){
 const site=new THREE.Group();site.name='Outhouse in front of 1829';
 site.position.set(OUTHOUSE.x,0,OUTHOUSE.z);site.rotation.y=OUTHOUSE.rotation;
 site.userData.reference='Research/outhouse/README.md';site.userData.dimensions=OUTHOUSE;
 const b=OUTHOUSE,w=b.width/2,l=b.length,e=b.eave,peak=e+b.rise,ridgeZ=-w+b.width*b.ridgeFraction;
 let seed=182903;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 function texture(draw){const c=document.createElement('canvas');c.width=c.height=512;draw(c.getContext('2d'));const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=8;return t;}
 const bricks=texture(g=>{g.fillStyle='#8b8172';g.fillRect(0,0,512,512);for(let r=0;r<16;r++)for(let c=-1;c<9;c++){const n=random()*24;g.fillStyle=`rgb(${147+n},${67+n*.72},${45+n*.65})`;g.fillRect(c*64+(r%2)*32+1.4,r*32+1.3,61.2,29.4);}for(let i=0;i<8500;i++){g.fillStyle=i%2?'#f0ca9820':'#32261e22';g.fillRect(random()*512,random()*512,2,1);}});
 const slates=texture(g=>{g.fillStyle='#292d2b';g.fillRect(0,0,512,512);for(let r=0;r<16;r++)for(let c=-1;c<9;c++){const n=random()*18;g.fillStyle=`rgb(${48+n},${53+n},${52+n})`;g.fillRect(c*64+(r%2)*32+1,r*32+1,62,30);}for(let i=0;i<3400;i++){g.fillStyle=['#7a805945','#9697793b','#20252448'][i%3];g.fillRect(random()*512,random()*512,2+random()*9,1+random()*5);}});
 // Fine vertical streaks and worn pale paint keep the plywood distinct from brick.
 const woodMap=texture(g=>{g.fillStyle='#80817e';g.fillRect(0,0,512,512);for(let i=0;i<1700;i++){const x=random()*512,y=random()*512;g.fillStyle=['#c9c9c588','#343837cc','#9a9e9b99','#e0e0db5c'][i%4];g.fillRect(x+Math.sin(y*.025)*2,y,.6+random()*2.5,8+random()*100);}for(let i=0;i<170;i++){g.fillStyle='#30353244';g.fillRect(random()*512,random()*512,2+random()*5,2+random()*8);}});
 const brick=material(0xffffff,{map:bricks}),base=material(0xb0aaa0,{map:bricks}),slate=material(0xe3e2d6,{map:slates,side:THREE.DoubleSide});
 const blue=material(0x548fac),blueWorn=material(0x799fae),blueShade=material(0x365b6b),iron=material(0x343b38);
 const boards=material(0xc4c6bd,{map:woodMap}),boardDark=material(0x363b39),recess=material(0x202b29),sill=material(0x999e94);
 const concrete=material(0x878a7d),light=material(0xd5c990,{roughness:.65}),moss=material(0x536446);
 const batches=new Map(),openings=[];
 function mesh(g,m,name){const o=new THREE.Mesh(g,m);o.name=name;o.castShadow=true;o.receiveShadow=true;site.add(o);return o;}
 function box(m,x,y,z,dx,dy,dz){if(!batches.has(m))batches.set(m,[]);batches.get(m).push({x,y,z,dx,dy,dz});}
 function beam(a,b,width,depth,mat){if(!batches.has(mat))batches.set(mat,[]);batches.get(mat).push({a,b,width,depth});}
 function surface(tris,mat,name,uvScale=1.4,up=false){const p=[];for(let tri of tris){if(up){const v=tri.map(p=>new THREE.Vector3(...p));if(v[1].sub(v[0]).cross(v[2].sub(v[0])).y<0)tri=[...tri].reverse();}p.push(...tri.flat());}const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(new Float32Array(p.length/3*2),2));g.computeVertexNormals();worldUV(g,uvScale);return mesh(g,mat,name);}
 function solid(x0,z0,x1,z1,h,name,mat=brick,bottom=0){const g=new THREE.BoxGeometry(x1-x0,h,z1-z0);g.translate((x0+x1)/2,bottom+h/2,(z0+z1)/2);const o=mesh(worldUV(g,1.4),mat,name);if(h>.6)o.userData.collisionFootprint=[[x0,z0],[x1,z0],[x1,z1],[x0,z1]];return o;}
 solid(0,-w,l,w,e,'Outhouse brick walls');
 const gableBrick=brick.clone();gableBrick.side=THREE.DoubleSide;
 surface([[[0,e,w],[0,peak,ridgeZ],[0,e,-w]],[[l,e,-w],[l,peak,ridgeZ],[l,e,w]]],gableBrick,'Outhouse brick gables');
 const a=-.2,c=l+.2,d=w+.22,y=e+.08,p=peak+.08;
 surface([[[a,y,-d],[c,y,-d],[c,p,ridgeZ]],[[a,y,-d],[c,p,ridgeZ],[a,p,ridgeZ]],[[a,y,d],[a,p,ridgeZ],[c,p,ridgeZ]],[[a,y,d],[c,p,ridgeZ],[c,y,d]]],slate,'Outhouse continuous slate roof',2.2,true);
 beam([a,p+.055,ridgeZ],[c,p+.055,ridgeZ],.14,.15,iron);
 for(const x of [a,c])for(const side of [-1,1])beam([x,e+.02,side*d],[x,peak+.1,ridgeZ],.17,.13,blue);
 for(const z of [-d,d]){box(blue,l/2,e-.035,z,l+.45,.24,.13);box(blueShade,l/2,e+.105,z,l+.5,.085,.17);}
 // Projecting brick base and a sloping coping course continue around each side.
 solid(-.09,-w-.12,l+.09,w+.12,.48,'Outhouse projecting brick plinth',base);
 for(const z of [-w,w]){
  const side=Math.sign(z),outer=z+side*.13;
  surface([[[0,.48,outer],[l,.48,outer],[l,.64,z]],[[0,.48,outer],[l,.64,z],[0,.64,z]]],brick,'Outhouse sloping side plinth',1.4,true);
 }
 for(const x of [0,l]){
  const out=x+(x===0?-.13:.13),segments=x===0?[[-w,.17],[1.43,w]]:[[-w,w]];
  for(const [z0,z1]of segments)surface([[[out,.48,z0],[x,.64,z0],[x,.64,z1]],[[out,.48,z0],[x,.64,z1],[out,.48,z1]]],brick,'Outhouse gable plinth coping',1.4,true);
 }
 function opening(face,u,cy,width,height,door=false){
  const part=(mat,du,dv,n,pw,ph,pd)=>face==='front'?box(mat,-n,cy+dv,u+du,pd,ph,pw):box(mat,u+du,cy+dv,w+n,pw,ph,pd);
  part(recess,0,0,.018,width+.15,height+.13,.07);
  part(face==='front'?boards:boardDark,0,0,.065,width,height,.07);
  for(const s of [-1,1]){part(blueShade,s*(width/2+.015),0,.105,.055,height+.08,.06);part(s===1?blue:blueWorn,0,s*(height/2+.02),.11,width+.13,.055,.08);}
  if(door){
   part(iron,0,0,.112,.018,height,.025);
   for(const v of [-height*.3,height*.31])part(iron,-width*.43,v,.14,.13,.045,.045);
   part(iron,width*.35,-.15,.16,.06,.18,.055);part(iron,width*.28,-.09,.17,.17,.035,.055);
  }else{
   part(sill,0,-height/2-.065,.11,width+.2,.075,.19);
   if(face==='side')part(blueShade,0,0,.12,.045,height,.06);
  }
  // Soldier-brick heads match the shallow lintels above the boarded openings.
  const top=cy+height/2;
  for(let offset=-width/2-.07;offset<width/2+.07;offset+=.105)part(brick,offset,.13+height/2,.01,.095,.21,.07);
  openings.push({face,u,y:cy,width,height,door,top});
 }
 opening('front',.8,1.36,1.16,2.6,true);
 opening('front',-1.14,2.29,.94,.88);
 opening('side',2.63,2.59,1.88,.82);
 opening('side',5.6,2.59,1.5,.8);
 // Door boarding extends over the plinth, with a flush worn threshold.
 box(boards,-.155,1.36,.8,.06,2.6,1.16);box(concrete,-.38,.055,.8,.64,.13,1.5);
 for(const [x,z]of [[.1,-w-.22],[.1,w+.22],[l-.13,-w-.22]]){
  box(blue,x,e/2,z,.105,e-.12,.105);
  for(const h of [.72,2.35])box(blueWorn,x,h,z,.15,.055,.15);
  beam([x,.23,z],[x,.1,z+Math.sign(z)*.16],.105,.105,blueShade);
 }
 // Small vent on the blank wall from the blue camera; no invented windows.
 box(base,3.4,2.79,-w-.025,.55,.23,.07);
 for(let x=3.2;x<3.65;x+=.085)for(const h of [2.75,2.83])box(recess,x,h,-w-.067,.052,.033,.015);
 const lamp=mesh(new THREE.SphereGeometry(1,12,8),light,'Outhouse oval entrance lamp');lamp.position.set(-.115,3.06,.8);lamp.scale.set(.085,.18,.085);
 box(iron,-.07,3.06,.8,.085,.39,.21);
 // Cable tray beside the little front window bends under the left bargeboard.
 for(const z of [-1.91,-1.85,-1.78]){
  beam([-.19,.16,z],[ -.19,3.25,z],.025,.025,iron);
  beam([-.19,3.25,z],[-.19,3.66,-1.63],.025,.025,iron);
 }
 for(const h of [.7,1.6,2.6,3.25])box(sill,-.2,h,-1.84,.035,.04,.28);
 // Grass surrounds the entrance paving after removal of the approach path and fence.
 solid(-1.35,-3.5,-.15,1.55,.06,'Outhouse entrance paving',concrete,-.035);
 // Restrained moss at the foot of the walls, kept below walking collision height.
 for(let i=0;i<40;i++){const x=random()*l,z=(i%2?1:-1)*(w+.08);box(moss,x,.12,z,.12+random()*.22,.12+random()*.13,.08);}
 const dummy=new THREE.Object3D();for(const [mat,items]of batches){const batch=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),mat,items.length);batch.name='Outhouse '+(mat===boards?'weathered boarding':mat===blue?'blue trim':'facade details');batch.castShadow=true;batch.receiveShadow=true;batch.userData.orientedCollision=true;items.forEach((o,i)=>{dummy.rotation.set(0,0,0);if(o.a){const from=new THREE.Vector3(...o.a),to=new THREE.Vector3(...o.b),v=to.sub(from);dummy.position.copy(from).addScaledVector(v,.5);dummy.scale.set(o.width,v.length(),o.depth);dummy.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),v.normalize());}else{dummy.position.set(o.x,o.y,o.z);dummy.scale.set(o.dx,o.dy,o.dz);}dummy.updateMatrix();batch.setMatrixAt(i,dummy.matrix);});site.add(batch);}
 site.userData.openings=openings;site.userData.photoDirections={1:'Purple: entrance approach',2:'Blue: blank left side',3:'Yellow: entrance and two-window side'};
 return site;
}
