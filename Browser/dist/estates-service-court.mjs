import {ESTATES_SOURCE_FOOTPRINT,estatesPoint} from './estates-department.mjs';

// Retain the Estates entrance court while following the relocated ward frontage.
const p=ESTATES_SOURCE_FOOTPRINT;
// Follow the north and entrance edges, leaving the building, cobbled court
// and former east/south road outside the asphalt polygon.
const estateCourtBoundary=[p[9],p[8],p[7],
 [231.3,p[6][1]],[231.3,p[2][1]],p[2],p[1]]
 .map(([x,z])=>{const q=estatesPoint(x,0,z);return [q[0],q[2]];});
export const ESTATES_SERVICE_COURT=Object.freeze({
 name:'Irby Estates continuous service court',surface:'junction',
 // The upper boundary follows the three existing Irby/Ashley wings exactly.
 points:[[221.7,-88.1],[235.4,-88.1],[235.4,-74],[241.7,-74],
  [241.7,-88.1],[250.4,-88.1],[250.4,-74],[260.6,-74],
  [264,-74],[264,-72],
  ...estateCourtBoundary,[233,-27.5],[233,-18],[236,-7],[240,1],[244,5],[242,13],[234,13],
  [222,2],[220.86,-8.1],[220.86,-48.7],[220.86,-71],
  [218.5,-73.5],[218.5,-77.3],[221.7,-77.3]],
 reference:'Research/estates/grass-road-revision.png'
});

// Join the front court along the marked east side, flush to both wall returns.
export const IRBY_SIDE_ROAD=Object.freeze({
 name:'Irby Ashley side connection',surface:'junction',
 points:[[263.2,-112.9],[270,-112.9],[270,-70],[260.6,-70],
  [260.6,-99.6],[263.2,-99.6]]
});
