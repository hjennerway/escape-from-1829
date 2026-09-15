import {missingHistoricFootprints} from './historic-footprints.mjs';
import {annexePoint} from './annexe.mjs';
import {VIVIENNE_LANE} from './modern-entrance.mjs';

// clean.png supplies straight edges; annotated.png identifies roads and buildings.
// The alarm-board plan is schematic, not a survey. Coordinates are fitted to the
// existing Reception, Churton and annexe rather than moving those buildings.
const ap=(x,z)=>{const p=annexePoint(x,0,z);return [p[0],p[2]];};
const frontWest=ap(150,84),frontEast=ap(-155,84);
// Curves are reserved for the source's circular/teardrop islands and softened
// garden corners. The established long roads keep their straight centre lines.
function bezier(start,segments,steps=12){
 const points=[start];let a=start;
 for(const [b,c,d] of segments){for(let i=1;i<=steps;i++){const t=i/steps,q=1-t;points.push([0,1].map(k=>q*q*q*a[k]+3*q*q*t*b[k]+3*q*t*t*c[k]+t*t*t*d[k]));}a=d;}
 return points;
}
const circle=(center,radius)=>Array.from({length:65},(_,i)=>[center[0]+radius*Math.cos(i*Math.PI/32),center[1]+radius*Math.sin(i*Math.PI/32)]);
export const ADMIN_ISLAND_CENTER=Object.freeze([237,62]);
export const ADMIN_TEARDROP=bezier([273,-20],[
 [[271,-8],[272,4],[270,15]],[[269,24],[264,28],[258,24]],
 [[250,21],[251,13],[255,6]],[[260,-3],[268,-14],[273,-20]]
]);
const teardropWalk=bezier([277,-25],[
 [[275,-9],[277,5],[274,17]],[[273,29],[263,33],[255,28]],
 [[244,23],[247,11],[251,3]],[[258,-8],[270,-21],[277,-25]]
]);
const nearGarden=bezier([102,84],[
 [[104,89],[110,92],[110,99]],[[110,108],[110,119],[110,125]],
 [[110,131],[106,136],[100,136]],[[82,136],[62,136],[45,136]],
 [[45,119],[45,101],[45,84]]
]).map(p=>ap(...p));
const nearGardenGrass=bezier([99,90],[
 [[101,94],[105,96],[105,101]],[[105,109],[105,118],[105,123]],
 [[105,128],[103,131],[98,131]],[[82,131],[64,131],[50,131]],
 [[50,118],[50,104],[50,90]],[[65,90],[85,90],[99,90]]
]).map(p=>ap(...p));
const nearFrontLawn=bezier([14,53],[
 [[48,53],[94,53],[122,53]],[[131,53],[138,55],[138,61]],
 [[138,68],[130,74],[120,74]],[[87,74],[46,74],[29,74]],
 [[21,74],[14,69],[14,63]],[[14,59],[14,56],[14,53]]
]).map(p=>ap(...p));
export const HISTORIC_ROADS_SOURCE=Object.freeze({clean:'User attachment: roads/clean.png',annotations:'User attachment: roads/annotated.png',note:'Photo-estimated circulation; northern extent obscured by glare. Purple/pink are identification only; blue identifies the shared Vivienne Smith Lane.'});
export const HISTORIC_ROADS=Object.freeze([
 {name:'Churton west road',width:5,points:[[-77,-155],[-77,-99],[-77,-41],[-77,36]]},
 {name:'Churton north cross-road',width:5,points:[[-115,-99],[-77,-99],[-12,-99]]},
 {name:'Churton estate cross-road',width:5,points:[[-115,-41],[-77,-41],[-51,-41],[-12,-41]]},
 {name:'North ward road',width:5,points:[[-12,-99],[28,-99],[28,-122],[68,-122]]},
 {name:'Historic lane continuation',width:6,points:[VIVIENNE_LANE[7],VIVIENNE_LANE[8],[171,60],[210,62],[228,62]]},
 {name:'Admin roundabout',width:5.5,points:circle(ADMIN_ISLAND_CENTER,9)},
 {name:'Admin roundabout to annexe',width:6,points:bezier([246,62],[[[263,62],[268,51],frontWest]])},
 {name:'Annexe front avenue',width:6,points:[frontWest,ap(62,84),ap(-62,84),frontEast]},
 {name:'Annexe perimeter road',width:6,points:[frontWest,ap(172,72),ap(182,40),ap(182,-22),ap(170,-66),ap(143,-80),ap(95,-80),ap(80,-68)]},
 {name:'Annexe rear service spur',width:5,points:[ap(95,-80),ap(70,-80),ap(58,-61)]},
 {name:'Northern diagonal road',width:6,points:[frontEast,ap(-198,84),ap(-245,84)]},
 {name:'Northern cross-road',width:5,points:[[68,-122],[130,-139],[197,-146],[247,-175],ap(-245,84)]},
 {name:'Eastern entrance road',width:6,points:bezier([237,71],[[[246,73],[252,83],[255,97]]]).concat([[273,151],[285,206]])},
 {name:'Annexe rectangular garden circuit',width:4,points:nearGarden},
]);
export const HISTORIC_GRAVEL=Object.freeze([
 {name:'1829 west side gravel',points:[[-73,-36],[-55,-36],[-55,44],[-73,44]]},
 {name:'1829 rear gravel court',points:[[-54,-38],[55,-38],[55,-48],[-54,-48]]},
 {name:'Main/admin front gravel apron',points:[[145,39],[249,39],[249,53],[145,53]]},
 {name:'Main/admin west gravel approach',points:[[138,-18],[148,-18],[148,53],[138,53]]},
 {name:'Admin teardrop gravel surround',points:teardropWalk},
 {name:'Admin east gravel link',points:[[247,39],[257,29],[264,30],[254,48],[247,49]]},
 {name:'Annexe garden gravel margin',points:nearGarden},
 {name:'Annexe front gravel apron',points:[ap(-141,49),ap(141,49),ap(141,79),ap(-141,79)]},
 {name:'Annexe central entrance gravel',points:[ap(-7,25),ap(7,25),ap(7,79),ap(-7,79)]},
 {name:'Annexe west court gravel',points:[ap(-78,18),ap(-52,18),ap(-52,48),ap(-78,48)]},
 {name:'Annexe east court gravel',points:[ap(52,18),ap(78,18),ap(78,48),ap(52,48)]}
]);
export const HISTORIC_GRASS=Object.freeze([
 {name:'Churton western green',points:[[-112,-95],[-81,-95],[-81,-45],[-112,-45]]},
 {name:'Churton eastern green',points:[[-17,-95],[22,-95],[22,-49],[-17,-49]]},
 {name:'Admin tapered forecourt lawn',points:bezier([150,56],[
  [[165,52],[176,49],[190,49]],[[207,49],[220,51],[225,56]],
  [[207,56],[172,56],[150,56]]
 ])},
 {name:'Admin roundabout grass island',points:circle(ADMIN_ISLAND_CENTER,5.9)},
 {name:'Admin teardrop grass island',points:ADMIN_TEARDROP},
 {name:'Annexe rectangular grass island',points:nearGardenGrass},
 {name:'East annexe front lawn',points:nearFrontLawn},
 {name:'West annexe front lawn',points:[ap(-14,52),ap(-130,52),ap(-130,72),ap(-14,72)]}
]);
export function createHistoricRoads(THREE,exterior){
 const group=new THREE.Group();group.name='Historic roads and surfaces';group.userData.source=HISTORIC_ROADS_SOURCE;
 const material=color=>new THREE.MeshStandardMaterial({color,roughness:1});
 const asphalt=material(0x17191a),gravel=material(0xb4b3aa),grass=material(0x60784b),brown=material(0x87542f);
 // Separate close ground layers at the higher OS overview camera as well.
 for(const [mat,order] of [[gravel,1],[grass,2],[asphalt,3],[brown,4]]){mat.polygonOffset=true;mat.polygonOffsetFactor=-order;mat.polygonOffsetUnits=-order*2;}
 // Deterministic stone flecks, at world scale, remain legible on close approach.
 const size=64,data=new Uint8Array(size*size*4);let seed=1829;
 for(let i=0;i<size*size;i++){seed=(Math.imul(seed,1664525)+1013904223)>>>0;const v=175+(seed%66);data.set([v,v,Math.max(0,v-7),255],i*4);}
 const texture=new THREE.DataTexture(data,size,size);texture.wrapS=texture.wrapT=THREE.RepeatWrapping;texture.needsUpdate=true;gravel.map=texture;
 function polygon(name,points,mat,y){
  const shape=new THREE.Shape(points.map(([x,z])=>new THREE.Vector2(x,-z))),geometry=new THREE.ShapeGeometry(shape);
  const uv=geometry.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)/3,uv.getY(i)/3);
  const mesh=new THREE.Mesh(geometry,mat);mesh.rotation.x=-Math.PI/2;mesh.position.y=y;mesh.name=name;mesh.receiveShadow=true;mesh.userData.surface=mat===asphalt?'black road':mat===gravel?'gravel':mat===grass?'grass':'provisional brown outline';group.add(mesh);return mesh;
 }
 function ribbon(name,points,width,mat,y){
  const part=new THREE.Group();part.name=name;part.userData.centerline=points;part.userData.width=width;group.add(part);
  // Straight strips with small round joints avoid gaps at bends; no spline drift.
  for(let i=1;i<points.length;i++){
   const a=points[i-1],b=points[i],dx=b[0]-a[0],dz=b[1]-a[1],length=Math.hypot(dx,dz);if(length<1e-6)continue;
   const ox=-dz/length*width/2,oz=dx/length*width/2;
   part.add(polygon(name+' surface',[[a[0]+ox,a[1]+oz],[a[0]-ox,a[1]-oz],[b[0]-ox,b[1]-oz],[b[0]+ox,b[1]+oz]],mat,y));
  }
  const geometry=new THREE.CircleGeometry(width/2,16);geometry.rotateX(-Math.PI/2);
  for(const [x,z] of points){const cap=new THREE.Mesh(geometry,mat);cap.position.set(x,y,z);cap.receiveShadow=true;cap.userData.surface=mat===asphalt?'black road':'provisional brown outline';part.add(cap);}
 }
 for(const area of HISTORIC_GRAVEL)polygon(area.name,area.points,gravel,.265);
 for(const area of HISTORIC_GRASS)polygon(area.name,area.points,grass,.28);
 for(const road of HISTORIC_ROADS)ribbon(road.name,road.points,road.width,asphalt,.31);
 const missing=missingHistoricFootprints(THREE,exterior);group.userData.missingFootprints=missing;
 for(const segment of missing.segments)ribbon(segment.name,segment.points,.8,brown,.30);
 return group;
}
