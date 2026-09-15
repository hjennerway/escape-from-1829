import {matchEstateGrass} from './estate-grass.mjs';
import {missingHistoricFootprints} from './historic-footprints.mjs';
import {annexePoint} from './annexe.mjs';
import {VIVIENNE_LANE} from './modern-entrance.mjs';
import {ROAD_STYLE} from './road-style.mjs';

// clean.png supplies straight edges; annotated.png identifies roads and buildings.
// The alarm-board plan is schematic, not a survey. Coordinates are fitted to the
// existing Reception, Churton and annexe rather than moving those buildings.
const ap=(x,z)=>{const p=annexePoint(x,0,z);return [p[0],p[2]];};
const frontWest=ap(150,84),frontEast=ap(-155,84);
// Sample rounded islands, garden edges and the later marked road curves.
function bezier(start,segments,steps=12){
 const points=[start];let a=start;
 for(const [b,c,d] of segments){for(let i=1;i<=steps;i++){const t=i/steps,q=1-t;points.push([0,1].map(k=>q*q*q*a[k]+3*q*q*t*b[k]+3*q*t*t*c[k]+t*t*t*d[k]));}a=d;}
 return points;
}
const circle=(center,radius)=>Array.from({length:65},(_,i)=>[center[0]+radius*Math.cos(i*Math.PI/32),center[1]+radius*Math.sin(i*Math.PI/32)]);
// Yellow marks in the latest aerial move both islands towards the admin forecourt.
export const ADMIN_ISLAND_CENTER=Object.freeze([229,63]);
export const ADMIN_TEARDROP=bezier([261,36],[
 [[256,39],[254,43],[250,48]],[[246,53],[242,54],[240,50]],
 [[237,46],[239,42],[245,41]],[[251,40],[257,37],[261,36]]
]);
const teardropSurround=bezier([266,32],[
 [[262,40],[258,46],[253,51]],[[248,57],[240,59],[237,53]],
 [[232,47],[235,39],[243,37]],[[250,36],[260,33],[266,32]]
]);
const nearGarden=bezier([102,84],[
 [[106,89],[119,93],[119,104]],[[119,113],[119,121],[116,126]],
 [[113,133],[106,136],[100,136]],[[82,136],[62,136],[45,136]],
 [[45,119],[45,101],[45,84]]
]).map(p=>ap(...p));
const nearGardenGrass=bezier([100.5,87],[
 [[105,92],[116.5,94],[116.5,104]],[[116.5,112],[116.5,118],[116.5,119]],
 [[116.5,122],[115,125],[113.8,127]],[[111,131],[105,133.5],[99,133.5]],
 [[82,133.5],[65,133.5],[47.5,133.5]],[[47.5,118],[47.5,103],[47.5,87]],
 [[65,87],[85,87],[100.5,87]]
]).map(p=>ap(...p));
const nearFrontLawn=bezier([14,53],[
 [[40,53],[70,53],[92,53]],[[92,60],[92,67],[92,74]],
 [[70,74],[46,74],[29,74]],[[21,74],[14,69],[14,63]],
 [[14,59],[14,56],[14,53]]
]).map(p=>ap(...p));
// Main/admin photograph: camera looks across the near junction towards the
// annexe. The left-hand circuit encloses parking with a rounded near end and
// a grass strip along the avenue. Trees hide the far edge; retain the map fit.
export const ADMIN_ANNEXE_PHOTO_VIEW=Object.freeze({position:[244,11,37],target:[294,2,1],fov:58});
const parkingEdge=bezier([52,114],[
 [[69,114],[89,114],[103,114]],[[109,114],[112,116],[112,121]],
 [[110,127],[105,129],[98,129]],[[83,129],[65,129],[52,129]],
 [[52,124],[52,118],[52,114]]
]).map(p=>ap(...p));
const parkingMouth=[[110,119],[121,119],[121,127],[108,127]].map(p=>ap(...p));
const junction=bezier([249,39],[
 [[256,36],[262,30],frontWest],[[276,34],[269,47],[261,53]],
 [[256,57],[251,58],[245,55]],[[245,50],[247,44],[249,39]]
]);
// Only exposed boundaries receive kerbs: no kerb crosses a road mouth.
export const HISTORIC_KERBS=Object.freeze([
 {name:'Admin island kerb',points:ADMIN_TEARDROP},
 {name:'Annexe avenue lawn kerb',points:nearFrontLawn},
 // Follow the actual lawn edge, leaving the parking entrance open.
 {name:'Annexe parking-side kerb',points:nearGardenGrass.slice(36,61)},
 {name:'Annexe junction inner kerb',points:nearGardenGrass.slice(72).concat(nearGardenGrass.slice(1,25))}

]);
// Blue markings are route guides. Regularise the new roads to the estate axes
// north of admin and the annexe axes at its courts, with 45-degree corner cuts.
// The purple selection on the alarm board contains parallel elongated lawns.
// A shared cross-lane replaces overlapping loops and the oversized black apron.
// Coordinates follow the annexe axes; dimensions remain visual estimates.
const annexeCourtLoop=[[96,25],[140,25],[146,31],[146,45],[140,51],[96,51]].map(p=>ap(...p));
const annexeEndLoop=[[96,51],[147,51],[153,57],[153,78],[147,84],[96,84]].map(p=>ap(...p));
const annexeCourtGrass=[[99,28],[139,28],[143,32],[143,44],[139,48],[99,48]].map(p=>ap(...p));
const annexeEndGrass=[[99,54],[146,54],[150,58],[150,76],[146,80],[99,80]].map(p=>ap(...p));
// September marked aerial: purple moves to red along the admin frontage;
// yellow supplies the crossing drive and two outer routes; blue is removed.
// Fit to the existing apron, chimney, roundabout and annexe avenue junction.
// The retained shared lane ends exactly at the new crossing in Historic.
const eastCrossing=VIVIENNE_LANE[11],outerCrossing=[216,131];
const adminFrontDrive=bezier(VIVIENNE_LANE[8],[
 [[145,59],[149,58],[155,55]],[[169,47],[184,46],[195,46]],
 [[208,46],[219,47],[223,49]],[[226,51],[229,52],[229,54]]
]);
const adminEastDrive=bezier(frontWest,[
 [[266,39],[259,48],[252,53]],[[248,65],[246,86],eastCrossing],
 [[233,111],[224,124],outerCrossing],[[211,141],[207,153],[204,161]]
]);
const annexeInnerEastRoad=bezier(eastCrossing,[
 [[267,107],[292,113],[318,115]],[[368,115],[425,111],[468,106]],
 [[489,103],[502,94],[510,89]],[[527,79],[543,65],[551,39]]
]);
const annexeOuterEastRoad=bezier(outerCrossing,[
 [[229,138],[253,142],[274,144]],[[306,151],[338,158],[371,159]],
 [[421,160],[475,155],[515,145]],[[546,138],[576,129],[600,120]]
]);
export const HISTORIC_ROADS_SOURCE=Object.freeze({clean:'User attachment: roads/clean.png',annotations:'User attachment: roads/annotated.png',revision:'Research/historic-roads/admin-road-reroute.png',previousLayout:'Research/historic-roads/interbuilding-alarm-board.png',previousPhoto:'Research/historic-roads/admin-to-annexe-photo.png',orientation:'Research/historic-roads/admin-to-annexe-orientation.png',note:'Photo-estimated circulation. The original purple/pink marks identify buildings and blue identifies the shared lane. The later yellow/blue aerial relocates islands and extends the Historic roads. The Main/admin-to-annexe photograph refines the curved junction, parking entrance and exposed kerbs; its blue arrow supplies viewing direction only. The later purple selection refines the roads and elongated lawns between Main/admin (blue) and the annexe (yellow); coloured circles are selection guides only. The September aerial moves the purple frontage drive to red, adds the yellow crossing and outer roads, and removes blue perimeter, spur and entrance sections. The shared lane east of the new crossing appears only with Modern.'});
// The yellow-circled Churton grid is removed; Parsons Lane remains in the shared road layer.
export const HISTORIC_ROADS=Object.freeze([
 {name:'North ward road',width:5,points:[[-12,-99],[28,-99],[28,-122],[68,-122]]},
 {name:'Historic lane continuation',width:6,points:[VIVIENNE_LANE[7],...adminFrontDrive]},
 {name:'Admin roundabout',width:5.5,points:circle(ADMIN_ISLAND_CENTER,9)},
 {name:'Admin roundabout to annexe',width:6,points:bezier([238,63],[[[260,63],[268,51],frontWest]])},
 {name:'Annexe front avenue',width:6,points:[frontWest,ap(62,84),ap(-62,84),frontEast]},
 {name:'Admin east crossing drive',width:6,points:adminEastDrive},
 {name:'Annexe inner east road',width:6,points:annexeInnerEastRoad},
 {name:'Annexe outer east road',width:6,points:annexeOuterEastRoad},
 {name:'Northern diagonal road',width:6,points:[frontEast,ap(-198,84),ap(-245,84)]},
 {name:'Northern cross-road',width:5,points:[[68,-122],[130,-139],[197,-146],[247,-175],ap(-245,84)]},
 {name:'Annexe rectangular garden circuit',width:4,points:nearGarden},
 {name:'Admin north service road',width:6,points:[frontWest,[233,-6],[233,-62],[247,-76],[262,-76],[270,-84],[270,-132],[314,-176],[325,-176]]},
 {name:'Annexe east cross-drive',width:5,points:[[96,84],[96,25]].map(p=>ap(...p))},
 {name:'Annexe east court circuit',width:4.5,points:annexeCourtLoop},
 {name:'Annexe end lawn circuit',width:4.5,points:annexeEndLoop},
]);
export const HISTORIC_GRAVEL=Object.freeze([
 {name:'1829 west side gravel',points:[[-73,-36],[-55,-36],[-55,44],[-73,44]]},
 {name:'1829 rear gravel court',points:[[-54,-38],[55,-38],[55,-48],[-54,-48]]},
 {name:'Main/admin front gravel apron',points:[[145,39],[249,39],[249,53],[145,53]]},
 {name:'Main/admin west gravel approach',points:[[138,-18],[148,-18],[148,53],[138,53]]},
]);
// Filled black aprons sit below the grass islands; road ribbons sit above them.
export const HISTORIC_PAVING=Object.freeze([
 {name:'Admin teardrop black surround',points:teardropSurround},
 {name:'Admin east black link',points:junction},
 {name:'Annexe garden black margin',points:nearGarden},
 {name:'Annexe front black apron',points:[ap(-141,49),ap(96,49),ap(96,84),ap(-141,84)]},
 {name:'Annexe central entrance black approach',points:[ap(-7,25),ap(7,25),ap(7,79),ap(-7,79)]},
 {name:'Annexe west court black approach',points:[ap(-78,18),ap(-52,18),ap(-52,48),ap(-78,48)]},
 {name:'Annexe east court black approach',points:[ap(52,18),ap(78,18),ap(78,48),ap(52,48)]},
 {name:'Annexe end lawn black apron',points:[[96,51],[147,51],[153,57],[153,78],[147,84],[96,84]].map(p=>ap(...p))}
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
 {name:'Annexe east court grass island',points:annexeCourtGrass},
 {name:'Annexe end grass island',points:annexeEndGrass},
 {name:'West annexe front lawn',points:[ap(-14,52),ap(-130,52),ap(-130,72),ap(-14,72)]}
]);
export function createHistoricRoads(THREE,exterior){
 const group=new THREE.Group();group.name='Historic roads and surfaces';group.userData.source=HISTORIC_ROADS_SOURCE;
 const material=color=>new THREE.MeshStandardMaterial({color,roughness:1});
 const asphalt=material(ROAD_STYLE.asphalt),paving=material(ROAD_STYLE.asphalt),gravel=material(0xb4b3aa),grass=material(0x60784b),brown=material(0x87542f),kerb=material(ROAD_STYLE.edge),edge=material(ROAD_STYLE.edge);
 matchEstateGrass(grass,exterior.terrain.material);
 // Separate close ground layers at the higher OS overview camera as well.
 for(const [mat,order] of [[gravel,1],[paving,2],[grass,3],[edge,3],[asphalt,4],[brown,5],[kerb,6]]){mat.polygonOffset=true;mat.polygonOffsetFactor=-order;mat.polygonOffsetUnits=-order*2;}
 // Deterministic stone flecks, at world scale, remain legible on close approach.
 const size=64,data=new Uint8Array(size*size*4);let seed=1829;
 for(let i=0;i<size*size;i++){seed=(Math.imul(seed,1664525)+1013904223)>>>0;const v=175+(seed%66);data.set([v,v,Math.max(0,v-7),255],i*4);}
 const texture=new THREE.DataTexture(data,size,size);texture.wrapS=texture.wrapT=THREE.RepeatWrapping;texture.needsUpdate=true;gravel.map=texture;
 function polygon(name,points,mat,y){
  const shape=new THREE.Shape(points.map(([x,z])=>new THREE.Vector2(x,-z))),geometry=new THREE.ShapeGeometry(shape);
  const uv=geometry.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)/3,uv.getY(i)/3);
  const mesh=new THREE.Mesh(geometry,mat);mesh.rotation.x=-Math.PI/2;mesh.position.y=y;mesh.name=name;mesh.receiveShadow=true;mesh.renderOrder=mat===asphalt?2:mat===edge?1:0;mesh.userData.surface=(mat===asphalt||mat===paving)?'black road':mat===gravel?'gravel':mat===grass?'grass':mat===kerb||mat===edge?'stone kerb':'provisional brown outline';group.add(mesh);return mesh;
 }
 function ribbon(name,points,width,mat,y){
  const part=new THREE.Group();part.name=name;part.userData.centerline=points;part.userData.width=width;group.add(part);
  // Straight strips with small round joints avoid gaps at bends; no spline drift.
  for(let i=1;i<points.length;i++){
   const a=points[i-1],b=points[i],dx=b[0]-a[0],dz=b[1]-a[1],length=Math.hypot(dx,dz);if(length<1e-6)continue;
   const ox=-dz/length*width/2,oz=dx/length*width/2;
   part.add(polygon(name+' surface',[[a[0]+ox,a[1]+oz],[a[0]-ox,a[1]-oz],[b[0]-ox,b[1]-oz],[b[0]+ox,b[1]+oz]],mat,y));
  }
  const geometry=new THREE.CircleGeometry(width/2,ROAD_STYLE.roundSegments);geometry.rotateX(-Math.PI/2);
  for(const [x,z] of points){const cap=new THREE.Mesh(geometry,mat);cap.position.set(x,y,z);cap.receiveShadow=true;cap.renderOrder=mat===asphalt?2:mat===edge?1:0;cap.userData.surface=mat===asphalt?'black road':mat===kerb||mat===edge?'stone kerb':'provisional brown outline';part.add(cap);}
 }
 for(const area of HISTORIC_GRAVEL)polygon(area.name,area.points,gravel,.265);
 for(const area of HISTORIC_PAVING)polygon(area.name,area.points,paving,.28);
 for(const area of HISTORIC_GRASS)polygon(area.name,area.points,grass,.31);
 polygon('Annexe inset parking surface',parkingEdge,asphalt,.325);
 polygon('Annexe parking entrance',parkingMouth,asphalt,.33);
 for(const road of HISTORIC_ROADS)ribbon(road.name+' border',road.points,road.width+2*ROAD_STYLE.edgeWidth,edge,.32);
 for(const road of HISTORIC_ROADS)ribbon(road.name,road.points,road.width,asphalt,.34);
 for(const edge of HISTORIC_KERBS)ribbon(edge.name,edge.points,.32,kerb,.38);
 const missing=missingHistoricFootprints(THREE,exterior);group.userData.missingFootprints=missing;
 for(const segment of missing.segments)ribbon(segment.name,segment.points,.8,brown,.33);
 return group;
}
