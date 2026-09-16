import {ESTATES_SERVICE_COURT,IRBY_SIDE_ROAD} from './estates-service-court.mjs';
import {VIVIENNE_LANE} from './modern-entrance.mjs';
import {TOWER_ADMIN_SHIFT} from './tower-buildings.mjs';
import {clearSharedLanes,SHARED_HISTORIC_LANES} from './historic-road-clearance.mjs';
import {ANNEXE_ACCESS_ROADS,ANNEXE_ACCESS_PAVING,ANNEXE_ACCESS_KERBS} from './annexe-access.mjs';
import {mainAdminLaneJunctions,parsonsNorthEndJunction} from './admin-road-junctions.mjs';
import {ANNEXE_FRONT_AVENUE,ANNEXE_GRAVEL_PATH,shiftAnnexeTeardrop} from './annexe-front-roads.mjs';

// layout.png supplies edges; layout.-annotated.png selects the road network.
// Fit the photographed plan to the established buildings: its perspective and
// the independently refined building models do not support a survey transform.
function bezier(start,segments,steps=16){
 const points=[start];let a=start;
 for(const [b,c,d] of segments){
  for(let i=1;i<=steps;i++){const t=i/steps,q=1-t;points.push([0,1].map(k=>q*q*q*a[k]+3*q*q*t*b[k]+3*q*t*t*c[k]+t*t*t*d[k]));}a=d;
 }return points;
}
export const HISTORIC_ROADS_SOURCE=Object.freeze({
 clean:'Research/historic-roads/layout.png',annotations:'Research/historic-roads/layout.-annotated.png',
 revision:'2026-09-16 yellow Parsons Lane retrace; blue northern detour removed',
 parsonsRetrace:'Research/historic-roads/parsons-yellow-retrace.png',
 annexeFrontRoads:'Research/annexe-placement/front-roads-annotated.png',
 annexeRearRemoval:'Research/annexe-frontage-adjustment/remove-rear-roads.png',annexeSweepRevision:'Research/annexe-frontage-adjustment/narrow-entrance.png',
 annexeAccess:'Research/historic-roads/annexe-access-annotated.png',annexeEntranceRevision:'Research/historic-roads/annexe-entrance-revision.png',adminJunctions:'Research/historic-roads/admin-junctions-annotated.png',parsonsConnection:'Research/historic-roads/parsons-north-connection.png',
 note:'The yellow Parsons retrace replaces the blue northern detour and upper spurs, retaining its southern fork and connecting to the saved northern lane endpoint. The earlier annexe screenshot relocates the frontage avenue to the red line, translates the complete teardrop toward Main/admin without changing its shape or size, and adds the yellow gravel link. The central sweep has a slim neck and smooth flare, while the red-circled apron retains its footprint. Both frontage side approaches and the later yellow-circled rear roads, junction mouths and hardstanding are removed. Colours identify features, not surface colours. Saved Parsons Lane and Vivienne Smith Lane surfaces retain precedence.'
});
export const ADMIN_ANNEXE_PHOTO_VIEW=Object.freeze({position:[244,11,37],target:[294,2,1],fov:58});
export const ADMIN_ISLAND_CENTER=Object.freeze([198,49]);
export const ADMIN_SEMICIRCLE_RADIUS=18;
const semicircle=Array.from({length:49},(_,i)=>{const t=Math.PI-i*Math.PI/48;return [198+18*Math.cos(t),49+18*Math.sin(t)];});
// The point faces the north junction. The rounded, wider base faces the drive.
export const ADMIN_TEARDROP=bezier([270,25],[
 [[268,33],[260,43],[261,48]],[[262,53],[272,54],[274,48]],
 [[276,42],[272,33],[270,25]]
]).map(shiftAnnexeTeardrop);
const teardropRoad=bezier([270,18],[
 [[267,28],[256,40],[257,48]],[[257,59],[276,60],[278,49]],
 [[281,39],[273,27],[270,18]]
]).map(shiftAnnexeTeardrop);
const parsonsNorthEnd=SHARED_HISTORIC_LANES.find(p=>p.name==='Parsons Lane (North)').points.at(-1);
// Ground-plane picks from parsons-yellow-retrace.png, registered against the
// western bend, service-road elbow and the former northern boundary junctions.
const northJunction=[270,-117],parsonsCrossing=[355,-107.85],eastCrossing=VIVIENNE_LANE[11];
const northService=bezier(shiftAnnexeTeardrop([270,18]),[
 [[249.5,3],[247,2.5],[245,2]],[[233,0],[229,-9],[229,-19]],
 [[229,-40],[229,-57],[229,-63]],[[229,-69],[233,-70],[241,-70]],
 [[247,-70],[254,-70],[260,-70]],[[268,-70],[270,-74],[270,-82]],
 [[270,-98],[270,-110],northJunction]
]);
export const HISTORIC_ROAD_TRACES=Object.freeze([
 ...ANNEXE_ACCESS_ROADS,
 {name:'Northern Parsons Lane connection',width:6,points:bezier(northJunction,[
  [[291,-113],[328,-108],[338,-106]],[[344,-105],[350,-106],parsonsCrossing],
  [[403,-119],[460,-132],[510,-145]],[[518,-148],[528,-140],[533,-135]],
  [[548,-122],[553,-109],parsonsNorthEnd]
 ])},
 {name:'Parsons Lane southern fork',width:6,points:bezier(northJunction,[
  [[286,-108],[305,-105],[316,-104]],[[329,-102],[336,-93],[333.63,-84.91]]
 ])},
 {name:'Historic lane continuation',width:6,points:bezier(VIVIENNE_LANE[8],[
  [[145,58],[153,52],[167,49]],[[177,48],[184,49],[198,49]],[[214,49],[226,49],[238,52]],[[240,52],[240,47],shiftAnnexeTeardrop([264,56])]
 ])},
 {name:'Admin forecourt semicircle',width:5.5,points:semicircle},
 {name:'Admin teardrop circulation',width:5,points:teardropRoad},
 {...ANNEXE_FRONT_AVENUE,points:[...ANNEXE_FRONT_AVENUE.points.slice(0,-1),parsonsCrossing]},
 {name:'Admin east crossing drive',width:6,points:bezier(shiftAnnexeTeardrop([278,49]),[
  [[265,50],[258,64],[255,76]],[[252,89],[246,96],eastCrossing]
 ])},
 {name:'Southern estate drive',width:6,points:bezier(eastCrossing,[
  [[233,114],[220,137],[216,154]],[[210,180],[205,202],[199,222]],
  [[191,247],[187,272],[176,297]],[[170,310],[167,327],[166,340]]
 ])},
 {name:'Annexe inner east road',width:6,points:bezier(eastCrossing,[
  [[267,107],[292,113],[318,115]],[[339,117],[365,121],[388,122]]
 ])},
 {name:'Admin north service road',width:6,points:northService},
 // Keep access north of Estates; the blue-selected outer east/south loop is grass.
 {name:'Tower north court lane',width:5,points:[[229,-70.4],[260,-70.4]]},
 {name:'Northern estate boundary',width:6,points:bezier([-79,-94],[
  [[-90,-125],[-94,-188],[-94,-215]],[[ -94,-232],[-102,-242],[-90,-242]],
  [[-15,-244],[102,-244],[159,-239]],[[174,-223],[181,-213],[190,-202]],
  [[202,-183],[215,-166],[225,-155]],[[239,-140],[256,-121],northJunction]
 ])},
 {name:'North west ward approach',width:5,points:bezier([-91,-166],[[[-76,-166],[-51,-165],[-39,-165]],[[-29,-165],[-26,-166],[-23,-173]]])},
 // Hale's spine and cross range replace the inferred junction at [116,-95].
 // Stop the two approaches clear of its walls, including their rounded kerbs.
 {name:'Churton upper cross-road',width:6,points:bezier([-74,-99],[[[-57,-99],[23,-98],[87,-96]],[[98,-96],[103,-95],[107,-95]]])},
 {name:'Churton eastern link',width:5,points:[[116,-76],[116,-52]]},
 {name:'Tower western approach',width:5,points:[[88,-51.74],[113,-52],[135,-52]]},
]);
export const HISTORIC_ROADS=Object.freeze(HISTORIC_ROAD_TRACES.flatMap(clearSharedLanes));
// The yellow-marked footpath is gravel; vehicular approaches remain asphalt.
export const HISTORIC_GRAVEL=Object.freeze([ANNEXE_GRAVEL_PATH]);
export const HISTORIC_PAVING=Object.freeze([
 ESTATES_SERVICE_COURT,
 IRBY_SIDE_ROAD,
 ...ANNEXE_ACCESS_PAVING,
 ...mainAdminLaneJunctions(HISTORIC_ROADS),
 ...parsonsNorthEndJunction(HISTORIC_ROADS),
 // Cover the segmented inner kerb before drawing one smooth grass boundary.
 {name:'Admin teardrop inner resurfacing',surface:'junction',points:teardropRoad},
 {name:'Tower service court',points:[[146,-16.1],[162.3,-16.1],[162.3,-16.1+TOWER_ADMIN_SHIFT],[185.5,-16.1+TOWER_ADMIN_SHIFT],[185.5,-12.5+TOWER_ADMIN_SHIFT],[221.3,-12.5+TOWER_ADMIN_SHIFT],[225.5,-18+TOWER_ADMIN_SHIFT],[231,-17],[235,-6],[233,1],[240,10],[242,13],[234,13],[222,2],[215,-5+TOWER_ADMIN_SHIFT],[162.3,-5+TOWER_ADMIN_SHIFT],[162.3,-5],[146,-5]]}
]);
const lawnArc=Array.from({length:41},(_,i)=>{const t=Math.PI-i*Math.PI/40;return [198+14.6*Math.cos(t),49+14.6*Math.sin(t)];});
export const HISTORIC_GRASS=Object.freeze([
 {name:'Admin semicircular grass island',points:[[183.8,52.5],...lawnArc.filter(p=>p[1]>=52.5),[212.2,52.5]]},
 {name:'Admin teardrop grass island',points:ADMIN_TEARDROP,raisedIsland:true}
]);
export const HISTORIC_KERBS=Object.freeze([...ANNEXE_ACCESS_KERBS,{name:'Admin smooth teardrop inner kerb',points:ADMIN_TEARDROP}]);
