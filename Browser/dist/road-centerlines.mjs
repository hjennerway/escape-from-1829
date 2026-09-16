import {MODERN_ROAD_PATHS} from './modern-road-data.mjs';
import {earthToScene} from './earth-registration.mjs';

// Research/historic-roads/vivienne-red-retrace.png moves the admin stretch
// out into the lawn, beginning at the earlier western fork.
// Keep the survey source intact; rendering, labels and clearance share this fit.
export const VIVIENNE_LANE=MODERN_ROAD_PATHS.find(p=>p.name==='Vivienne Smith Lane').coordinates.map(p=>earthToScene(...p));
VIVIENNE_LANE[7]=[90,77.76];
VIVIENNE_LANE[8]=[100,73.5];
VIVIENNE_LANE[9]=[150,85];
VIVIENNE_LANE[10]=[195,94];

export function roadCenterline(path){
  return path.name==='Vivienne Smith Lane'?VIVIENNE_LANE:path.coordinates.map(p=>earthToScene(...p));
}
