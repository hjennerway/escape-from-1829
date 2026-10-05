import {MODERN_ROAD_PATHS} from './modern-road-data.mjs';
import {earthToScene} from './earth-registration.mjs';
import {COUNTESS_ROUNDABOUT_CENTER} from './countess-roundabout.mjs';

// Research/historic-roads/vivienne-red-retrace.png moves the admin stretch
// out into the lawn, beginning at the earlier western fork.
// Keep the survey source intact; rendering, labels and clearance share this fit.
export const VIVIENNE_LANE=MODERN_ROAD_PATHS.find(p=>p.name==='Vivienne Smith Lane').coordinates.map(p=>earthToScene(...p));
VIVIENNE_LANE[7]=[90,77.76];
VIVIENNE_LANE[8]=[100,73.5];
VIVIENNE_LANE[9]=[150,85];
VIVIENNE_LANE[10]=[195,94];

// Move the garage/mortuary stretch away from Main/admin just beyond the pine
// crowns. Buildings use the same offset; the west approach and east tail
// reconnect to the existing lane beyond this translated section.
export const GARAGE_LANE_SHIFT=9.5;
for(const index of [9,10,11])VIVIENNE_LANE[index]=[VIVIENNE_LANE[index][0],VIVIENNE_LANE[index][1]+GARAGE_LANE_SHIFT];

export function roadCenterline(path){
  if(path.name==='Vivienne Smith Lane')return VIVIENNE_LANE;
  const points=path.coordinates.map(p=>earthToScene(...p));
  if(path.name==='Valley drive'){
    // The user-centred junction replaces the fork and near-side bypass with
    // one smooth approach to the roundabout. Retain the saved outer road.
    const [cx,cz]=COUNTESS_ROUNDABOUT_CENTER,end=points[3];
    const control1=[cx-9,cz-14],control2=end.map((v,i)=>v+(v-points[4][i])*.55);
    const approach=Array.from({length:25},(_,i)=>{
      const t=i/24,u=1-t;
      return [0,1].map(axis=>u*u*u*COUNTESS_ROUNDABOUT_CENTER[axis]+3*u*u*t*control1[axis]+3*u*t*t*control2[axis]+t*t*t*end[axis]);
    });
    return [...approach,...points.slice(4)];
  }
  // End Frost drive at the Main/admin frontage junction; the red-marked
  // dead-end extension across the lawn is removed from the rendered layout.
  return path.name==='Frost drive'?points.slice(0,7):points;
}
