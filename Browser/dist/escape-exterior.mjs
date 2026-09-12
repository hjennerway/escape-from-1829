// Aerial interpretation of the user's outlined 1829 estate photograph.
// Front road/reception is +Z; the corrected mast position is rear-left (-X, -Z).
import {createChapel} from './chapel.mjs';
import {createWaterTower} from './water-tower.mjs';
export const ESCAPE_MAST = Object.freeze({x:-69,z:-62,height:42});
const EAST_SHIFT=7.1,EXTRA_BAY=3.55,OUTER_SHIFT=EAST_SHIFT+EXTRA_BAY;
// Map the supplied photograph directly onto the triangular tympanum. The UVs
// select just the relief, leaving the surrounding sky and building out of view.
export async function loadEscapeFrontage(THREE,exterior){
  const photo=await new THREE.TextureLoader().loadAsync('./exterior/1829front.webp');
  photo.colorSpace=THREE.SRGBColorSpace;photo.anisotropy=8;
  const relief=exterior.model.getObjectByName('Blue dragons and central coat of arms');
  relief.material.map=photo;relief.material.color.set(0xffffff);relief.material.needsUpdate=true;
}
export function createEscapeExterior(THREE,aspect){
  const scene=new THREE.Scene();scene.background=new THREE.Color(0xb5c7cd);
  scene.fog=new THREE.FogExp2(0xb5c7cd,.0019);
  const camera=new THREE.PerspectiveCamera(46,aspect,.5,2000);
  const model=new THREE.Group();model.name='1829 estate · aerial reconstruction';scene.add(model);
  scene.add(new THREE.HemisphereLight(0xe4eff2,0x59634a,2));
  const sun=new THREE.DirectionalLight(0xffe2b7,2.8);sun.position.set(-85,120,60);sun.castShadow=true;
  sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-130,right:130,top:130,bottom:-130,near:1,far:350});sun.shadow.bias=-.0003;sun.shadow.normalBias=.25;scene.add(sun);
  const material=(color,extra={})=>new THREE.MeshStandardMaterial({color,roughness:.9,...extra});
  const cream=material(0xd6d0ba),stone=material(0xa39f8a),glass=material(0x56737d,{roughness:.4,metalness:.3}),dark=material(0x303b3b),red=material(0x762c30);
  const grass=material(0x667752),hedge=material(0x3f543b),asphalt=material(0x737b79),path=material(0xb0ac97),marking=material(0xc9c8b2),steel=material(0x78848a,{metalness:.65,roughness:.5});
  const batches=new Map();let seed=1829;
  const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
  function texture(draw){const c=document.createElement('canvas');c.width=c.height=512;draw(c.getContext('2d'));const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=4;return t;}
  const bricks=texture(g=>{g.fillStyle='#897a69';g.fillRect(0,0,512,512);for(let r=0;r<16;r++)for(let c=-1;c<9;c++){const n=random()*25;g.fillStyle=`rgb(${108+n},${57+n*.6},${44+n*.5})`;g.fillRect(c*64+(r%2)*32+1,r*32+1,62,30);}for(let i=0;i<9000;i++){g.fillStyle=i%2?'#fff2':'#0002';g.fillRect(random()*512,random()*512,2,1);}});
  const slates=texture(g=>{g.fillStyle='#3e4c54';g.fillRect(0,0,512,512);for(let r=0;r<16;r++)for(let c=-1;c<10;c++){const n=Math.floor(random()*20);g.fillStyle=`rgb(${66+n},${76+n},${80+n})`;g.fillRect(c*60+(r%2)*30+1,r*32+1,58,30);}});
  const brick=material(0xffffff,{map:bricks}),roof=material(0xc4c9c6,{map:slates});
  const noise=texture(g=>{g.fillStyle='#c2bfae';g.fillRect(0,0,512,512);for(let i=0;i<19000;i++){g.fillStyle=i%2?'#242e2020':'#eef0d315';g.fillRect(random()*512,random()*512,2,2);}});noise.repeat.set(40,40);grass.map=noise;
  function box(mat,x,y,z,w,h,d,rotation=0){if(!batches.has(mat))batches.set(mat,[]);batches.get(mat).push({x,y,z,w,h,d,rotation});}
  function mesh(geo,mat,x=0,y=0,z=0,shadow=false){const m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);m.castShadow=shadow;m.receiveShadow=true;model.add(m);return m;}
  function worldUV(geo,scale=3){const p=geo.attributes.position,n=geo.attributes.normal,uv=geo.attributes.uv;for(let i=0;i<p.count;i++)uv.setXY(i,(Math.abs(n.getX(i))>.5?p.getZ(i):p.getX(i))/scale,(Math.abs(n.getY(i))>.5?p.getZ(i):p.getY(i))/scale);return geo;}
  mesh(new THREE.PlaneGeometry(4000,4000),grass,0,-.15,0).rotation.x=-Math.PI/2;
  // Grounds and surrounding access roads. No red annotation or sale graphics.
  box(path,OUTER_SHIFT/2,-.015,2,151+OUTER_SHIFT,.15,103);
  box(grass,OUTER_SHIFT/2,.08,28,117+OUTER_SHIFT,.1,36);box(grass,OUTER_SHIFT/2,.08,-15,117+OUTER_SHIFT,.1,45);
  box(asphalt,0,.09,59,210,.1,11);box(asphalt,-79,.09,-2,10,.1,133);box(asphalt,79+OUTER_SHIFT,.09,0,9,.1,130);
  box(path,OUTER_SHIFT/2,.11,51,151+OUTER_SHIFT,.1,3);box(asphalt,OUTER_SHIFT/2,.11,-46,149+OUTER_SHIFT,.1,8);
  for(let x=-100;x<102;x+=9)box(marking,x,.16,59,4,.02,.15);
  for(let z=-65;z<60;z+=9){box(marking,-79,.16,z,.15,.02,4);box(marking,79+OUTER_SHIFT,.16,z,.15,.02,4);}
  box(path,0,.13,34,3.2,.1,34);box(path,OUTER_SHIFT/2,.13,43,114+OUTER_SHIFT,.1,2);
  box(hedge,OUTER_SHIFT/2,.55,49,142+OUTER_SHIFT,1.1,.9);
  // Start from the western silhouette and reflect it across Reception.
  // Each tuple is [x, z, width, depth, eaves height]; front is +Z.
  const westBlocks=[
    [-46,12,16,15,14.3],[-31,-10,12,30,11.3],
    // A is the inset rear arm; B is slightly outboard, both inside the
    // western end pavilion. B has a narrow root and a wider stepped foot.
    [-36.5,23,9,14,8.6],[-35,35,12,16,8.6],
    [-31,-30,13,11,9.3],
    // Rooms tracing the irregular western silhouette: an outer end room,
    // a shorter front nib, and small rooms beside A's root. The curved bay
    // remains exposed between the outer rooms and B.
    [-56,13,9,16,9.3],[-54.5,23,6,6,7.2],
    [-40,-3,6,8,7.2],[-22.5,3,6,6,7.2]
  ];
  const eastBlocks=westBlocks.map(([x,z,w,d,h])=>[-x,z,w,d,h]);
  // Approximate the red outline: a slightly longer front foot, a shallow
  // courtyard nib and a stepped outer corner joining the yellow extension.
  eastBlocks[3]=[35,36,12,18,8.6];
  eastBlocks[5]=[56,14,10,14,9.3];
  eastBlocks[6]=[54.5,23,6,6,7.2];
  eastBlocks[7]=[44,3,5,8,7.2];
  // Red front wing and yellow curved bay move two window spacings right.
  // Purple outer rooms move one further spacing, adding a full vertical
  // window bay to the pavilion between the curved bay and the outer rooms.
  for(const i of [0,2,3])eastBlocks[i][0]+=EAST_SHIFT;
  eastBlocks[0][0]+=EXTRA_BAY/2;eastBlocks[0][2]+=EXTRA_BAY;
  for(const i of [5,6,7])eastBlocks[i][0]+=OUTER_SHIFT;
  const blocks=[
    [EAST_SHIFT/2,12,76+EAST_SHIFT,10,12.8],[0,-9,10,32,11.5],
    ...westBlocks,...eastBlocks,
    // Yellow-shaded addition: long outer range and a stepped rear return.
    // Set the return back and towards the outer wing, leaving the rear-left
    // corner open beside the inset arm (which ends at x=37.5, z=-35.5).
    [59+OUTER_SHIFT,-14,10,48,9.3],[61+OUTER_SHIFT,12,10,8,9.3],
    // Duplicate the red-bay section beside the original, creating a full
    // extra window row before the blue outer range.
    [48.5+EAST_SHIFT,-3,6,8,7.2],
    [53.5+OUTER_SHIFT,-38,21,10,9.3],[53.5+OUTER_SHIFT,-44,17,4,9.3]
  ];
  function hipRoof(x,z,w,d,y,rise){
    const a=w/2+.4,b=d/2+.4,inset=Math.min(a,b)*.83;
    const corners=[[-a,0,-b],[a,0,-b],[a,0,b],[-a,0,b]];
    const ridge=w>=d?[[-a+inset,rise,0],[a-inset,rise,0]]:[[0,rise,-b+inset],[0,rise,b-inset]];
    const faces=w>=d?[[0,1,5],[0,5,4],[1,2,5],[2,3,4],[2,4,5],[3,0,4]]:[[0,1,4],[1,2,5],[1,5,4],[2,3,5],[3,0,4],[3,4,5]];
    const verts=[...corners,...ridge],positions=[],uv=[];
    for(const face of faces)for(const i of [...face].reverse()){positions.push(...verts[i]);uv.push(verts[i][0]/3,(verts[i][2]+verts[i][1])/3);}
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.computeVertexNormals();mesh(g,roof,x,y,z,true);
  }
  function window(x,y,z,rotation=0){
    box(dark,x,y,z,1.42,2.12,.16,rotation);
    const dx=Math.cos(rotation),dz=-Math.sin(rotation),nx=Math.sin(rotation),nz=Math.cos(rotation);
    box(glass,x+nx*.09,y,z+nz*.09,1.23,1.92,.06,rotation);
    for(const s of [-1,1])box(cream,x+dx*s*.65+nx*.14,y,z+dz*s*.65+nz*.14,.085,2.12,.10,rotation);
    for(const sy of [-1,0,1])box(cream,x+nx*.15,y+sy*1.01,z+nz*.15,1.42,.075,.12,rotation);
    box(cream,x+nx*.16,y,z+nz*.16,.055,2,.08,rotation);
    box(cream,x+nx*.18,y-1.12,z+nz*.18,1.7,.16,.33,rotation);
    box(cream,x+nx*.17,y+1.16,z+nz*.17,1.65,.19,.23,rotation);
  }
  function block(x,z,w,d,h){
    mesh(worldUV(new THREE.BoxGeometry(w,h-2,d)),brick,x,(h+2)/2,z,true);
    box(cream,x,1,z,w,2,d);
    for(const y of [2.1,h-.12])box(cream,x,y,z,w+.23,.22,d+.23);
    box(stone,x,h+.12,z,w+.48,.22,d+.48);hipRoof(x,z,w,d,h+.23,Math.min(3.8,Math.min(w,d)*.3));
    for(const side of [-1,1]){
      for(let px=-w/2+2.4;px<w/2-1.5;px+=3.55)for(let y=3.8;y<h-1;y+=3.4)window(x+px,y,z+side*(d/2+.04),side<0?Math.PI:0);
      for(let pz=-d/2+2.5;pz<d/2-1.5;pz+=3.55)for(let y=3.8;y<h-1;y+=3.4)window(x+side*(w/2+.04),y,z+pz,side*Math.PI/2);
    }
    if(w>13)for(const side of [-1,1]){mesh(worldUV(new THREE.BoxGeometry(.85,2.1,1.3)),brick,x+side*(w*.32),h+2.6,z,true);box(stone,x+side*w*.32,h+3.69,z,1.1,.15,1.5);}
  }
  for(const b of blocks)block(...b);
  // The pediment and columned red doorway identify the central 1829 entrance.
  mesh(worldUV(new THREE.BoxGeometry(14.2,12.6,12.8)),brick,0,8.3,13.2,true);
  box(stone,0,1,13.2,14.2,2,12.8);
  hipRoof(0,13.2,14.2,12.8,14.65,2.9);
  for(const y of [2.1,7.1,10.7,14.5])box(cream,0,y,19.68,14.5,.24,.32);
  for(const x of [-4,0,4])for(const y of [4.3,8.9,12.4])if(x!==0||y!==4.3)window(x,y,19.68);
  const triangle=new THREE.BufferGeometry();triangle.setAttribute('position',new THREE.Float32BufferAttribute([-7.5,0,0,7.5,0,0,0,3.1,0],3));triangle.computeVertexNormals();mesh(triangle,cream,0,14.65,19.72);
  const relief=triangle.clone();
  relief.setAttribute('uv',new THREE.Float32BufferAttribute([29/333,1-89/499,305/333,1-89/499,167/333,1-29/499],2));
  const dragons=mesh(relief,material(0x477180),0,14.72,19.78);dragons.scale.set(.94,.91,1);dragons.name='Blue dragons and central coat of arms';
  for(const side of [-1,1]){const beam=mesh(new THREE.BoxGeometry(8.2,.22,.4),cream,side*3.75,16.2,19.82);beam.rotation.z=-side*Math.atan2(3.1,7.5);}
  box(cream,0,14.65,19.8,15.3,.25,.5);
  box(stone,0,.9,21.4,5.6,1.8,4.3);box(red,0,3.5,19.9,1.9,3.2,.2);
  for(const x of [-.46,.46])for(const y of [2.45,3.45,4.45])box(material(0x581c23),x,y,20.02,.65,.72,.06);
  box(glass,0,5.55,19.96,1.9,.65,.12);
  for(const x of [-1.1,1.1])box(cream,x,3.9,20.03,.18,4.2,.23);
  box(cream,0,5.99,20.03,2.4,.2,.23);
  for(const x of [-2.1,2.1])for(const z of [20.25,22.7]){
    mesh(new THREE.CylinderGeometry(.23,.3,4.6,12),cream,x,4.1,z,true);box(cream,x,6.45,z,.8,.3,.8);box(cream,x,1.91,z,.75,.25,.75);
    for(const side of [-1,1]){const scroll=mesh(new THREE.CylinderGeometry(.14,.14,.22,12),cream,x+side*.27,6.25,z+.18);scroll.rotation.x=Math.PI/2;}
  }
  box(cream,0,6.7,21.2,5.6,.6,4.0);box(stone,0,7.08,21.2,6,.15,4.3);
  for(let i=0;i<6;i++)box(stone,0,(6-i)*.15,23.7+i*.42,3.7,(6-i)*.3,.44);
  // Faceted bays at the two end blocks, with roof caps and pale string courses.
  for(const x of [-46,46+EAST_SHIFT]){
    mesh(new THREE.CylinderGeometry(3.15,3.15,13.2,8),brick,x,7.6,19.0,true);
    for(const y of [1.2,5.1,8.8,14.3])mesh(new THREE.CylinderGeometry(3.25,3.25,.23,8),cream,x,y,19);
    mesh(new THREE.ConeGeometry(3.55,2.8,8),roof,x,15.8,19,true);
    for(const y of [3.4,6.9,10.4])window(x,y,22.04);
  }
  // Open rear approaches connect the gaps between the arms to the back road.
  for(const x of [-23,23]){box(asphalt,x,.18,-20,32,.1,45);box(grass,x<0?-17:x-6,.26,-9,9,.1,11);}
  for(const [x,w] of [[-64,17],[69+OUTER_SHIFT,7]]){box(asphalt,x,.17,12,w,.12,62);box(path,x,.16,44,w,.12,2);}
  box(asphalt,45+OUTER_SHIFT/2,.18,-12,17+OUTER_SHIFT,.12,39);
  box(asphalt,40,.18,-36,7,.12,18);
  box(asphalt,0,.15,-62,106,.12,23);
  const carColors=[material(0xc1c6c4),material(0x3e5363),material(0x713c37),material(0x263338)];
  function car(x,z,rotation=0){const mat=carColors[Math.floor(random()*carColors.length)];box(dark,x,.43,z,1.9,.45,4.0,rotation);box(mat,x,.77,z,1.85,.6,4.0,rotation);box(glass,x,1.23,z,1.55,.47,2.15,rotation);box(mat,x,1.5,z,1.59,.10,1.9,rotation);}
  for(const side of [-1,1])for(let i=0;i<15;i++){
    const z=-15+i*3.65,x=side<0?-64:69+OUTER_SHIFT;box(marking,x,.25,z,5,.02,.10);
    if(i%4!==0)car(x,z+1.65,Math.PI/2);
  }
  for(let i=0;i<8;i++)car(39.5,-26+i*3.8,Math.PI/2);
  for(let i=0;i<22;i++){const x=-48+i*4.4;box(marking,x,.24,-64,.1,.02,5.5);if(i%3)car(x+2,-64);}
  // Broadleaf crowns cast shadows across the front lawn and site edges.
  const bark=material(0x5a4e3d),leaves=[material(0x43583a),material(0x566944),material(0x657448)];
  const crowns=leaves.map(mat=>({mat,items:[]}));
  function tree(x,z,size=1){mesh(new THREE.CylinderGeometry(.18*size,.3*size,4.5*size,6),bark,x,2.25*size,z);
    for(let i=0;i<5;i++)crowns[i%3].items.push({x:x+(random()-.5)*3*size,y:(4.5+random()*2)*size,z:z+(random()-.5)*3*size,s:(1.7+random())*size});}
  for(const [x,z,s] of [[-51,35,1.4],[-47,43,1.1],[-20,33,1.2],[17,35,1.3],[49+EAST_SHIFT,40,1.2],[-65,-35,1.1],[68+OUTER_SHIFT,-38,1.25],[-17,-9,.85],[18,-9,.9]])tree(x,z,s);
  for(let i=0;i<24;i++)tree(-100+i*9,-84-(i%3)*7,1+random()*.6);
  for(let i=0;i<9;i++){tree(-90,-44+i*12,1.1);tree(92+OUTER_SHIFT,-47+i*12,1.1);}
  // Low surrounding blocks establish the campus without reproducing the sale map.
  for(const [x,z,w,d] of [[-45,-99,28,12],[38,-104,18,13],[99+OUTER_SHIFT,-52,14,25],[-109,5,24,15]]){
    mesh(new THREE.BoxGeometry(w,6,d),material(0x8a7965),x,3,z,true);hipRoof(x,z,w,d,6,2.8);
  }
  const chapel=createChapel(THREE,{brick,roof,stone,dark,worldUV});model.add(chapel);
  const waterTower=createWaterTower(THREE,{brick,roof,dark,worldUV});model.add(waterTower);
  box(path,-9,.08,-93,2,.12,15);
  box(path,-7.5,.08,-99.5,3,.12,2);
  // Tapering open lattice, cross bracing and antenna panels from the mast photos.
  const mast=new THREE.Group();mast.name='Radio mast · rear left';mast.position.set(ESCAPE_MAST.x,0,ESCAPE_MAST.z);model.add(mast);
  function strut(a,b,r=.075){const start=new THREE.Vector3(...a),end=new THREE.Vector3(...b),v=end.clone().sub(start);const m=new THREE.Mesh(new THREE.CylinderGeometry(r,r,v.length(),5),steel);m.position.copy(start).addScaledVector(v,.5);m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),v.normalize());mast.add(m);}
  for(let level=0;level<10;level++){
    const y=level*4.2,lo=2.4-level*.17,hi=lo-.17;
    for(let side=0;side<4;side++){
      const angle=side*Math.PI/2+Math.PI/4,next=angle+Math.PI/2;
      const a=[Math.cos(angle)*lo,y,Math.sin(angle)*lo],b=[Math.cos(angle)*hi,y+4.2,Math.sin(angle)*hi];
      const c=[Math.cos(next)*lo,y,Math.sin(next)*lo],d=[Math.cos(next)*hi,y+4.2,Math.sin(next)*hi];
      strut(a,b,.095);strut(a,c,.065);strut(a,d,.055);strut(c,b,.055);
    }
  }
  strut([0,41,0],[0,45,0],.055);
  for(const y of [23,30,37])for(const side of [-1,1]){strut([0,y,0],[side*2.8,y,0]);const antenna=new THREE.Mesh(new THREE.BoxGeometry(.36,2.5,.55),cream);antenna.position.set(side*2.8,y+.65,0);mast.add(antenna);}
  box(stone,ESCAPE_MAST.x,.1,ESCAPE_MAST.z,8,.3,8);
  box(dark,ESCAPE_MAST.x+7,1.8,ESCAPE_MAST.z,5,3.6,6);
  const dummy=new THREE.Object3D();
  for(const [mat,items] of batches){const batch=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),mat,items.length);batch.receiveShadow=true;
    items.forEach((b,i)=>{dummy.position.set(b.x,b.y,b.z);dummy.scale.set(b.w,b.h,b.d);dummy.rotation.set(0,b.rotation,0);dummy.updateMatrix();batch.setMatrixAt(i,dummy.matrix);});model.add(batch);}
  for(const {mat,items} of crowns){const batch=new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1,1),mat,items.length);batch.castShadow=true;batch.receiveShadow=true;
    items.forEach((b,i)=>{dummy.position.set(b.x,b.y,b.z);dummy.scale.set(b.s,b.s*.85,b.s);dummy.rotation.set(0,i,0);dummy.updateMatrix();batch.setMatrixAt(i,dummy.matrix);});model.add(batch);}
  return {scene,camera,model,mast,chapel,waterTower};
}
