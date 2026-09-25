import {SOUTHERN_DRIVE_JUNCTION} from './southern-drive-junction.mjs';
import {WEST_PARSONS_JUNCTIONS} from './west-parsons-junctions.mjs';
import {ANNEXE_REAR_SURFACES} from './annexe-rear-roads.mjs';
import {ANNEXE_LOOP_ROAD,ANNEXE_TRIANGLE_APEX,ANNEXE_TRIANGLE_FORK,ANNEXE_FRONT_OUTER_JOIN,IRBY_ANNEXE_APPROACH} from './annexe-loop-road.mjs';
import {IRBY_ROUNDING_PAVING,IRBY_ROUNDED_ISLAND,IRBY_ROUNDED_KERB} from './irby-junction-rounding.mjs';
import {ESTATES_SERVICE_COURT,IRBY_SIDE_ROAD} from './estates-service-court.mjs';
import {VIVIENNE_LANE} from './modern-entrance.mjs';
import {GARAGE_LANE_SHIFT} from './road-centerlines.mjs';
import {TOWER_ADMIN_SHIFT} from './tower-buildings.mjs';
import {clearSharedLanes} from './historic-road-clearance.mjs';
import {ANNEXE_ACCESS_ROADS,ANNEXE_ACCESS_PAVING,ANNEXE_ACCESS_KERBS} from './annexe-access.mjs';
import {mainAdminLaneJunctions} from './admin-road-junctions.mjs';
import {adminTeardropPaving} from './admin-teardrop-paving.mjs';
import {PARSONS_NORTH_BEND,PARSONS_NORTH_BEND_PAVING} from './parsons-north-bend.mjs';
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
 revision:'2026-09-24 red tree-gap approach to Irby/Ashley, blue outer triangle and yellow gravel alignment',
 irbyTreeJunction:'Research/historic-roads/irby-tree-junction-marked.png',
 irbyRounding:'Research/historic-roads/irby-junction-rounding-marked.png',
 annexeStraightFrontage:'Research/historic-roads/annexe-straight-frontage-marked.png',
 annexeOuterLoop:ANNEXE_LOOP_ROAD.source,annexeFrontageRevision:ANNEXE_LOOP_ROAD.frontageRevision,
 adminPineRoad:'Research/historic-roads/pine-road-reroute.png',
 adminFrontage:'Research/historic-roads/admin-frontage-closer.png',
 parsonsRetrace:'Research/historic-roads/parsons-yellow-retrace.png',
 annexeFrontRoads:'Research/annexe-placement/front-roads-annotated.png',
 annexeRearRemoval:'Research/annexe-frontage-adjustment/remove-rear-roads.png',annexeSweepRevision:'Research/annexe-frontage-adjustment/narrow-entrance.png',
 annexeAccess:'Research/historic-roads/annexe-access-annotated.png',annexeEntranceRevision:'Research/historic-roads/annexe-entrance-revision.png',adminJunctions:'Research/historic-roads/admin-junctions-annotated.png',parsonsConnection:'Research/historic-roads/parsons-north-connection.png',
 note:'The yellow Parsons retrace replaces the blue northern detour and upper spurs, retaining its southern fork and connecting to the saved northern lane endpoint. The earlier annexe screenshot relocates the frontage avenue to the red line, translates the complete teardrop toward Main/admin without changing its shape or size, and adds the yellow gravel link. The central sweep has a slim neck and smooth flare, while the red-circled apron retains its footprint. Both frontage side approaches and the later yellow-circled rear roads, junction mouths and hardstanding are removed. Colours identify features, not surface colours. Saved Parsons Lane and Vivienne Smith Lane surfaces retain precedence.'
});
export const ADMIN_ANNEXE_PHOTO_VIEW=Object.freeze({position:[244,11,37],target:[294,2,1],fov:58});
// Translate the complete D-shaped court 5.5 units towards Main/admin. Its
// radius, carriageway width and lawn outline retain their approved dimensions.
export const ADMIN_ISLAND_CENTER=Object.freeze([198,43.5]);
export const ADMIN_SEMICIRCLE_RADIUS=18;
const adminCourtPoint=([x,z])=>[ADMIN_ISLAND_CENTER[0]+x,ADMIN_ISLAND_CENTER[1]+z];
const semicircle=Array.from({length:49},(_,i)=>{const t=Math.PI-i*Math.PI/48;return adminCourtPoint([ADMIN_SEMICIRCLE_RADIUS*Math.cos(t),ADMIN_SEMICIRCLE_RADIUS*Math.sin(t)]);});
// The point faces the north junction. The rounded, wider base faces the drive.
export const ADMIN_TEARDROP=bezier([270,25],[
 [[268,33],[260,43],[261,48]],[[262,53],[272,54],[274,48]],
 [[276,42],[272,33],[270,25]]
]).map(shiftAnnexeTeardrop);
const teardropRoad=bezier([270,18],[
 [[267,28],[256,40],[257,48]],[[257,59],[276,60],[278,49]],
 [[281,39],[273,27],[270,18]]
]).map(shiftAnnexeTeardrop);

// Ground-plane picks from parsons-yellow-retrace.png, registered against the
// western bend, service-road elbow and the former northern boundary junctions.
const northJunction=[270,-117],eastCrossing=VIVIENNE_LANE[11];
const annexeInnerEastRoad=bezier([eastCrossing[0],eastCrossing[1]-GARAGE_LANE_SHIFT],[
 [[267,107],[292,113],[318,115]],[[339,117],[365,121],[388,122]]
]).map(([x,z],index)=>{
 // Ease the moved lane junction back to the existing pine-road meeting point.
 // Everything from that meeting point eastwards retains its current trace.
 const t=Math.min(1,index/13);
 return [x,z+GARAGE_LANE_SHIFT*(1-t*t*(3-2*t))];
});
// The red path leaves the upper drive before the pines and meets the existing
// east road farther along the lawn. Its former lower arm returns to grass.
const pineRoadJoin=annexeInnerEastRoad[13];
// Keep the full six-unit road between the tower ranges and Estates. The
// 232.67 neck clears both padded walls; it opens east of the wider workshop
// farther north, then clears Irby's fixed front at z=-74.
const northService=bezier(shiftAnnexeTeardrop([270,18]),[
 [[249.5,3],[247,2.5],[245,2]],[[237,0],[232.67,-9],[232.67,-19]],
 [[232.67,-25],[232.67,-31],[232.67,-35]],[[232.67,-39],[235,-40],[235,-44]],
 [[235,-51],[235,-57],[235,-63]],[[235,-66],[239,-68.8],[245,-68.8]],
 [[251,-68.8],[255,-68.8],[260,-68.8]],[[268,-68.8],[270,-74],[270,-82]],
 [[270,-98],[270,-110],northJunction]
]);
// The outer road remains straight; its new approach arrives through the trees.
const parsonsNorthRoad=[ANNEXE_TRIANGLE_APEX,PARSONS_NORTH_BEND.start];
export {ANNEXE_TRIANGLE_FORK,ANNEXE_TRIANGLE_CORNERS} from './annexe-loop-road.mjs';
export const HISTORIC_ROAD_TRACES=Object.freeze([
 ...ANNEXE_ACCESS_ROADS,
 {name:'Northern Parsons Lane connection',width:6,points:parsonsNorthRoad},
 {name:'Parsons Lane southern fork',width:6,points:ANNEXE_TRIANGLE_FORK},
 IRBY_ANNEXE_APPROACH,
 {name:'Historic lane continuation',width:6,points:bezier(VIVIENNE_LANE[8],[
  [[145,55],[153,49],[167,45]],[[173,45],[174,43.5],semicircle[0]],
  [[192,43.5],[204,43.5],[214,43.5]],
  // Clear the projecting east bay, then turn into the existing side road.
  [[217,43.5],[218,46.6],[224,46.6]],[[231,46.6],[236,46],[238,42]],
  [[240,37],[239.5,34],teardropRoad[12]]
 ])},
 {name:'Admin forecourt semicircle',width:5.5,points:semicircle},
 {name:'Admin teardrop circulation',width:5,points:teardropRoad},
 {...ANNEXE_FRONT_AVENUE,points:[...ANNEXE_FRONT_AVENUE.points,ANNEXE_FRONT_OUTER_JOIN]},
 {name:'Admin east crossing drive',width:6,points:bezier(shiftAnnexeTeardrop([278,49]),[
  [[264,45],[261.5,51],[267,57]],[[277,66],[277,83],[288,94]],
  [[293,100],[298,109],pineRoadJoin]
 ])},
 {name:'Southern estate drive',width:6,points:bezier(eastCrossing,[
  [[233,114+GARAGE_LANE_SHIFT],[220,137+GARAGE_LANE_SHIFT],[216,154+GARAGE_LANE_SHIFT]],
  [[210,180+GARAGE_LANE_SHIFT],[205,202],[199,222]],
  [[191,247],[187,272],[176,297]],[[170,310],[167,327],[166,340]]
 ])},
 {name:'Annexe inner east road',width:6,points:annexeInnerEastRoad},
 {name:'Admin north service road',width:6,points:northService},
 // Keep access north of Estates; the blue-selected outer east/south loop is grass.
 {name:'Tower north court lane',width:5,points:[[229,-69.6],[260,-69.6]]},
 {name:'Northern estate boundary',width:6,points:bezier([-79,-94],[
  [[-90,-125],[-94,-188],[-94,-215]],[[ -94,-232],[-102,-242],[-90,-242]],
  [[-15,-244],[102,-244],[159,-239]],[[174,-223],[181,-213],[190,-202]],
  [[202,-183],[215,-166],[225,-155]],[[239,-140],[256,-121],northJunction]
 ])},
 {name:'North west ward approach',width:5,points:bezier([-91,-166],[[[-76,-166],[-51,-165],[-39,-165]],[[-29,-165],[-26,-166],[-23,-173]]])},
 // The red-circled chapel cross-road and tower T-junction are now lawn.
]);
export const HISTORIC_ROADS=Object.freeze(HISTORIC_ROAD_TRACES.flatMap(clearSharedLanes));
// Cover the lane border across the new mouth without moving Parsons Lane.
const larktonRoad=HISTORIC_ROAD_TRACES.find(r=>r.name==='Annexe Larkton Parsons approach');
const larktonMouth=larktonRoad.points.slice(0,7);
const larktonOffsets=larktonMouth.map((p,i)=>{
 const a=larktonMouth[Math.max(0,i-1)],b=larktonMouth[Math.min(larktonMouth.length-1,i+1)],dx=b[0]-a[0],dz=b[1]-a[1],length=Math.hypot(dx,dz);
 return [-dz/length*larktonRoad.width/2,dx/length*larktonRoad.width/2];
});
const larktonJunction={name:'Annexe Larkton Parsons open junction',surface:'junction',points:[
 ...larktonMouth.map((p,i)=>p.map((v,k)=>v+larktonOffsets[i][k])),
 ...larktonMouth.map((p,i)=>p.map((v,k)=>v-larktonOffsets[i][k])).reverse()
]};
// The yellow-marked footpath is gravel; vehicular approaches remain asphalt.
export const HISTORIC_GRAVEL=Object.freeze([ANNEXE_GRAVEL_PATH]);
export const HISTORIC_PAVING=Object.freeze([
 ...WEST_PARSONS_JUNCTIONS,
 ...SOUTHERN_DRIVE_JUNCTION,
 ...ANNEXE_REAR_SURFACES,
 ...IRBY_ROUNDING_PAVING,
 ESTATES_SERVICE_COURT,
 IRBY_SIDE_ROAD,
 ...ANNEXE_ACCESS_PAVING,
 larktonJunction,
 ...mainAdminLaneJunctions(HISTORIC_ROADS),
 ...adminTeardropPaving(HISTORIC_ROAD_TRACES),
 ...PARSONS_NORTH_BEND_PAVING,
 // Cover the segmented inner kerb before drawing one smooth grass boundary.
 {name:'Admin teardrop inner resurfacing',surface:'junction',points:teardropRoad},
 {name:'Tower service court',points:[[146,-16.1],[162.3,-16.1],[162.3,-16.1+TOWER_ADMIN_SHIFT],[185.5,-16.1+TOWER_ADMIN_SHIFT],[185.5,-12.5+TOWER_ADMIN_SHIFT],[221.3,-12.5+TOWER_ADMIN_SHIFT],[225.5,-18+TOWER_ADMIN_SHIFT],[231,-17],[235,-6],[233,1],[240,10],[242,13],[234,13],[222,2],[215,-5+TOWER_ADMIN_SHIFT],[162.3,-5+TOWER_ADMIN_SHIFT],[162.3,-5],[146,-5]]}
]);
const lawnArc=Array.from({length:41},(_,i)=>{const t=Math.PI-i*Math.PI/40;return [14.6*Math.cos(t),14.6*Math.sin(t)];});
export const HISTORIC_GRASS=Object.freeze([
 IRBY_ROUNDED_ISLAND,
 {name:'Admin semicircular grass island',points:[[-14.2,3.5],...lawnArc.filter(p=>p[1]>=3.5),[14.2,3.5]].map(adminCourtPoint)},
 {name:'Admin teardrop grass island',points:ADMIN_TEARDROP,raisedIsland:true}
]);
export const HISTORIC_KERBS=Object.freeze([IRBY_ROUNDED_KERB,...ANNEXE_ACCESS_KERBS,{name:'Admin smooth teardrop inner kerb',points:ADMIN_TEARDROP}]);

