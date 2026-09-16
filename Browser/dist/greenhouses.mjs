import {ROAD_STYLE} from './road-style.mjs';

// Ground-plane fit of img1-loc.png against the unchanged hospital shop.
// The blue strokes describe the yard-facing walls; hidden depths are estimated.
export const GREENHOUSE_ROAD=Object.freeze({width:4.5,points:[[92.2,76.82],[92.8,101],[93.24,127.9],[93.1,153],[92.86,181.15]]});
export const GREENHOUSES=Object.freeze([118.7,130.25,140.4].map((z,i)=>({name:'Greenhouse '+(i+1),x:105.4,z,length:17.2,width:4.8,rotation:-Math.atan(.21)})));
export const GARDEN_BUILDINGS=Object.freeze([
 {name:'Gardeners workshop',x:117.65,z:103,length:22,depth:6.8,eave:3.35,rise:1.9,rotation:-.03},
 {name:'Garden stores',x:116.77,z:130.97,length:18,depth:6.3,eave:3.15,rise:1.55,rotation:-.045}
]);
export const gardenPoint=(building,x,y,z)=>[building.x+Math.cos(building.rotation)*x+Math.sin(building.rotation)*z,y,building.z-Math.sin(building.rotation)*x+Math.cos(building.rotation)*z];
export const GREENHOUSE_VIEWS=Object.freeze({
 greenhouses:{position:[70,47,169],target:[108,1.5,124],fov:49},
 'greenhouses-site':{position:[114,122,265],target:[121,0,88],fov:46},
 'greenhouses-plan':{position:[108,105,129.01],target:[108,0,129],fov:48},
 'greenhouses-photo':{position:[106.79,1.85,93.9],target:[117.2,2.1,117.5],fov:65}
});

export function createGreenhouses(THREE,{brick,roof,worldUV,material}){
 const site=new THREE.Group();site.name='Greenhouses and gardeners buildings';
 site.userData.layout='historic';site.userData.reference='Research/greenhouses/README.md';
 const frame=material(0xb8c7c0),iron=material(0x354343),stone=material(0xaaa799),cream=material(0xd6dbcc);
 const blue=material(0x3886a6),blueDark=material(0x315f70),recess=material(0x283431),windowGlass=material(0x536c70,{roughness:.4});
 const glass=material(0x93b8b4,{transparent:true,opacity:.33,depthWrite:false,side:THREE.DoubleSide,metalness:.12,roughness:.25});
 const soil=material(0x4f4b32),leaves=material(0x48623a),wood=material(0x77705b),concrete=material(0x8d9086);
 const wall=brick.clone();wall.color.set(0xc8aca0);
 const tiles=roof.clone();tiles.color.set(0x9c8178);
 const ridge=material(0x895947),baseBrick=material(0x6a4a3e);
 function builder(name,placement={x:0,z:0,rotation:0}){
  const group=new THREE.Group();group.name=name;group.position.set(placement.x,0,placement.z);group.rotation.y=placement.rotation;site.add(group);
  const batches=new Map();
  function mesh(g,m,name){const o=new THREE.Mesh(g,m);o.name=name;o.castShadow=m!==glass;o.receiveShadow=true;group.add(o);return o;}
  function box(m,x,y,z,w,h,d){if(!batches.has(m))batches.set(m,[]);batches.get(m).push({x,y,z,w,h,d});}
  function solid(x0,z0,x1,z1,h,name,mat=wall,bottom=0){const g=worldUV(new THREE.BoxGeometry(x1-x0,h,z1-z0),1.7);g.translate((x0+x1)/2,bottom+h/2,(z0+z1)/2);const o=mesh(g,mat,name);o.userData.collisionFootprint=[[x0,z0],[x1,z0],[x1,z1],[x0,z1]];return o;}
  function faces(triangles,m,name,up=false){
   const p=[];for(let tri of triangles){const v=tri.map(a=>new THREE.Vector3(...a));if(up&&v[1].clone().sub(v[0]).cross(v[2].clone().sub(v[0])).y<0)tri=[...tri].reverse();p.push(...tri.flat());}
   const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(p.flatMap((_,i)=>i%3===0?[p[i]/1.7,(p[i+1]+p[i+2])/1.7]:[]),2));g.computeVertexNormals();return mesh(g,m,name);
  }
  function beam(a,b,w=.055,mat=frame){if(!batches.has(mat))batches.set(mat,[]);batches.get(mat).push({a,b,w});}
  function finish(){
   const dummy=new THREE.Object3D();for(const [m,items] of batches){const batch=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),m,items.length);batch.name=name+' frames and details';batch.castShadow=true;batch.receiveShadow=true;batch.userData.orientedCollision=true;
    items.forEach((p,i)=>{dummy.rotation.set(0,0,0);if(p.a){const a=new THREE.Vector3(...p.a),b=new THREE.Vector3(...p.b),d=b.clone().sub(a);dummy.position.copy(a).addScaledVector(d,.5);dummy.scale.set(p.w,d.length(),p.w);dummy.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());}else{dummy.position.set(p.x,p.y,p.z);dummy.scale.set(p.w,p.h,p.d);}dummy.updateMatrix();batch.setMatrixAt(i,dummy.matrix);});group.add(batch);
   }return group;
  }
  return {group,mesh,box,solid,faces,beam,finish};
 }

 const ground=builder('Greenhouse access road and yard');
 function polygon(name,points,mat,y){const shape=new THREE.Shape(points.map(([x,z])=>new THREE.Vector2(x,-z)));const g=new THREE.ShapeGeometry(shape);g.rotateX(-Math.PI/2);g.translate(0,y,0);return ground.mesh(g,mat,name);}
 const asphalt=material(ROAD_STYLE.asphalt,{polygonOffset:true,polygonOffsetFactor:-5,polygonOffsetUnits:-10});
 const edge=material(ROAD_STYLE.edge,{polygonOffset:true,polygonOffsetFactor:-3,polygonOffsetUnits:-6});
 function ribbon(name,points,width,mat,y){for(let i=1;i<points.length;i++){const a=points[i-1],b=points[i],dx=b[0]-a[0],dz=b[1]-a[1],l=Math.hypot(dx,dz),ox=-dz/l*width/2,oz=dx/l*width/2;polygon(name,[[a[0]+ox,a[1]+oz],[a[0]-ox,a[1]-oz],[b[0]-ox,b[1]-oz],[b[0]+ox,b[1]+oz]],mat,y);}for(const [x,z] of points){const g=new THREE.CircleGeometry(width/2,20);g.rotateX(-Math.PI/2);g.translate(x,y,z);ground.mesh(g,mat,name+' round join');}}
 ribbon('Garden access road border',GREENHOUSE_ROAD.points,GREENHOUSE_ROAD.width+1.2,edge,.32);
 ribbon('Garden access road',GREENHOUSE_ROAD.points,GREENHOUSE_ROAD.width,asphalt,.365);
 // A narrow working yard, reached from both ends of the greenhouse rows.
 polygon('Gardeners entrance hardstanding',[[104,94.5],[114,97],[125,101],[124.5,113.8],[114.8,116.8],[102.5,113.8]],concrete,.16);
 polygon('Gardeners paved yard',[[114.4,101],[125,101],[124,150.5],[113.5,150.5],[112.8,142.9],[114.5,127],[114.8,117]],concrete,.16);
 polygon('North greenhouse approach',[[94.7,111.7],[114.7,115.9],[114.7,119],[94.7,114.7]],concrete,.15);
 polygon('South greenhouse approach',[[95.3,143.2],[114,147.3],[114,150.3],[95.3,146.2]],concrete,.15);
 // Worn setts down the workshop edge of the yard, as visible in img1.
 for(let z=106;z<149;z+=.55)for(let x=114.9;x<116.5;x+=.42)ground.box(stone,x,.18,z,.35,.045,.43);
 ground.group.userData.road=GREENHOUSE_ROAD;ground.finish();

 const glasshouses=[];
 for(const b of GREENHOUSES){
  const g=builder(b.name,b),a=-b.length/2,c=b.length/2,d=b.width/2,eave=2.65,peak=4.05;
  g.solid(a,-d,c,d,.5,'Low greenhouse brick foundation',baseBrick);
  const corners=[[a,.5,-d],[c,.5,-d],[c,.5,d],[a,.5,d],[a,eave,-d],[c,eave,-d],[c,eave,d],[a,eave,d]];
  const walls=g.faces([[0,1,5],[0,5,4],[2,3,7],[2,7,6],[0,4,7],[0,7,3],[1,2,6],[1,6,5]].map(f=>f.map(i=>corners[i])),glass,'Greenhouse glass walls');
  walls.userData.collisionFootprint=[[a,-d],[c,-d],[c,d],[a,d]];
  const v=[[a,eave,-d],[c,eave,-d],[c,eave,d],[a,eave,d],[a,peak,0],[c,peak,0]];
  g.faces([[0,1,5],[0,5,4],[2,3,4],[2,4,5]].map(f=>f.map(i=>v[i])),glass,'Greenhouse glazed roof',true);
  g.faces([[v[0],v[4],v[3]],[v[1],v[2],v[5]]],glass,'Greenhouse glazed gables');
  for(let i=0;i<=16;i++){const x=a+(c-a)*i/16;for(const s of [-1,1]){g.beam([x,.5,s*d],[x,eave,s*d]);g.beam([x,eave,s*d],[x,peak,0]);}}
  for(const z of [-d,d])for(const y of [.52,1.45,eave])g.beam([a,y,z],[c,y,z],y===eave?.09:.05);
  g.beam([a,peak,0],[c,peak,0],.1);
  for(const s of [-1,1])for(const t of [.33,.67])g.beam([a,eave+(peak-eave)*t,s*d*(1-t)],[c,eave+(peak-eave)*t,s*d*(1-t)],.045);
  for(const x of [a-.025,c+.025]){
   for(const z of [-d,-1.6,-.53,.53,1.6,d])g.beam([x,.5,z],[x,eave+(peak-eave)*(1-Math.abs(z)/d),z],.065);
   for(const y of [1.45,2.65])g.beam([x,y,-d],[x,y,d]);
   g.beam([x,2.45,-.53],[x,2.45,.53],.085);g.box(iron,x,.99,.39,.08,.18,.05);
   g.box(stone,x,.12,0,.6,.16,1.2);
  }
  // Raised growing benches and planting rows remain visible through the glass.
  for(const s of [-1,1]){g.box(wood,0,.91,s*1.53,b.length-.8,.15,1.18);g.box(soil,0,1.01,s*1.53,b.length-1,.06,.95);for(let x=a+.9;x<c-.6;x+=.7){g.box(leaves,x,1.15,s*1.53,.36,.24,.53);if(Math.round((x-a)/.7)%3===0)g.box(wood,x,.45,s*1.53,.08,.8,.85);}}
  g.group.userData.dimensions=b;glasshouses.push(g.finish());
 }

 const buildings=[];
 for(const [index,b] of GARDEN_BUILDINGS.entries()){
  const g=builder(b.name,b),w=b.depth,l=b.length,e=b.eave,y=e+.08,peak=y+b.rise,openings=[];
  g.solid(0,0,w,l,e,b.name+' brick walls');g.solid(-.02,-.02,w+.02,l+.02,.32,b.name+' dark brick base',baseBrick);
  const a=-.22,c=w+.22,z0=-.22,z1=l+.22,inset=w*.47;
  const v=[[a,y,z0],[c,y,z0],[c,y,z1],[a,y,z1],[w/2,peak,z0+inset],[w/2,peak,z1-inset]];
  g.faces([[0,1,4],[1,2,5],[1,5,4],[2,3,5],[3,0,4],[3,4,5]].map(f=>f.map(i=>v[i])),tiles,b.name+' hipped tile roof',true);
  g.beam(v[4],v[5],.15,ridge);for(const [i,j] of [[0,4],[1,4],[2,5],[3,5]])g.beam(v[i],v[j],.13,ridge);
  for(const x of [a,c])g.box(iron,x,e,l/2,.13,.14,l+.44);
  for(const z of [z0,z1])g.box(iron,w/2,e,z,w+.44,.14,.13);
  function opening(z,kind,width=1,height=2.4,cy=1.35,end=false){
   const part=(mat,u,v,n,pw,ph,pd)=>end?g.box(mat,w/2+u,cy+v,-n,pw,ph,pd):g.box(mat,-n,cy+v,z+u,pd,ph,pw);
   part(recess,0,0,.025,width+.16,height+.14,.08);part(kind==='door'?blue:windowGlass,0,0,.08,width,height,.07);
   for(const s of [-1,1]){part(kind==='door'?blueDark:cream,s*width/2,0,.14,.055,height+.1,.08);part(kind==='door'?blueDark:cream,0,s*height/2,.14,width+.1,.055,.08);}
   if(kind==='door'){
    for(let u=-width/2+.15;u<width/2;u+=.16)part(blueDark,u,0,.122,.014,height-.08,.012);
    part(iron,width*.3,-.1,.19,.04,.17,.06);
   }else{
    for(let u=-width/2+width/4;u<width/2;u+=width/4)part(cream,u,0,.16,.035,height,.045);
    for(const t of [-1/6,1/6])part(cream,0,t*height,.16,width,.035,.05);
    part(stone,0,-height/2-.1,.15,width+.24,.14,.23);
   }
   part(stone,0,height/2+.13,.055,width+.22,.13,.16);openings.push({z,kind,width,height,y:cy,end});
  }
  const positions=index===0?[[2,'door'],[5,'door'],[8.2,'window'],[10.3,'window'],[12.7,'door'],[15.3,'window'],[18.1,'door'],[20.7,'door']]:[[2,'door'],[4.8,'window'],[7.6,'door'],[10.5,'door'],[13.4,'window'],[16,'door']];
  for(const [z,kind] of positions)opening(z,kind,kind==='window'?(z===15.3?1.65:.95):.96,kind==='window'?1.65:2.45,kind==='window'?1.93:1.36);
  opening(0,'window',2.35,1.75,1.91,true);
  for(const z of [.5,l-.5])g.box(iron,-.3,e/2,z,.085,e,.085);
  if(index===0){g.solid(w/2-.44,15.6,w/2+.44,16.5,1.6,'Workshop brick chimney',wall,peak-.4);g.box(ridge,w/2,peak+1.17,16.05,1.02,.18,1.04);g.box(iron,w/2,peak+1.28,16.05,.48,.045,.5);g.box(ridge,w/2,peak+1.5,16.05,.28,.5,.28);}
  g.group.userData.openings=openings;g.group.userData.dimensions=b;buildings.push(g.finish());
 }
 site.userData.greenhouses=glasshouses;site.userData.buildings=buildings;
 return site;
}
