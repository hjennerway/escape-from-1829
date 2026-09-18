import {HALE_WARD} from './hale-daresbury-huxley-dunham.mjs';
import {placeWardViews} from './ward-placement.mjs';
import {TOWER_RANGES} from './tower-buildings.mjs';
import {MAIN_KITCHEN_VIEWS,MAIN_KITCHEN_WALK} from './main-kitchen.mjs';
import {WEST_REFINEMENT_VIEWS} from './west-refinement.mjs';
import {WILLOWS_VIEWS,WILLOWS_WALK} from './willows.mjs';

// Named wards use the existing exterior views of their supplied building areas.
// Keep distinct URLs so selecting one ward highlights only that menu entry.
const LOCATION_VIEW_ALIASES=Object.freeze({
  acton:'front',
  barton:'east-forward-end-photo',
  caldy:'east-forward-end-photo',
  ebnal:'east-forward-end-photo',
  grindley:'front',
  hampton:'west-forward-end-photo',
  ince:'west-forward-end-photo'
});

export function resolveLocationView(view){
  return LOCATION_VIEW_ALIASES[view]??view;
}

// User's September 17 annotation: blue is the long east side range (Barmere);
// red is the rear cross range shared by Redesmere and Saughall.
const rearAerial={position:[53,36,-2],target:[76.2,4,-38],fov:48};
const rearWalk={position:[70,1.8,-24],target:[76.2,4,-38],fov:60};
// Yellow marks Hale/Daresbury at the Grafton end; purple marks Huxley/Dunham
// in the long tower-side cross range. Follow the building's placement offset.
const splitAerial=placeWardViews('haleWard',HALE_WARD,{
  'hale-daresbury':{position:[73,42,-106],target:[111,4,-134],fov:48},
  'huxley-dunham':{position:[73,46,-52],target:[119,4,-85],fov:48}
});
const splitWalk=placeWardViews('haleWard',HALE_WARD,{
  'hale-daresbury':{position:[103,1.8,-120],target:[109,4,-136],fov:60},
  'huxley-dunham':{position:[117,1.8,-66],target:[120,4,-85],fov:60}
});
// Yellow outline in the September 17 reference: the southern cross range
// and its long eastern return together form Stores. Use their placed bounds.
const storesRanges=TOWER_RANGES.filter(range=>['South cross-gabled stores','Long east service range'].includes(range.name));
const storesBounds=[Math.min(...storesRanges.map(r=>r.rect[0])),Math.min(...storesRanges.map(r=>r.rect[1])),Math.max(...storesRanges.map(r=>r.rect[2])),Math.max(...storesRanges.map(r=>r.rect[3]))];
const storesTarget=[(storesBounds[0]+storesBounds[2])/2,4.5,(storesBounds[1]+storesBounds[3])/2];
export const LOCATION_VIEWS=Object.freeze({
  ...WILLOWS_VIEWS,
  ...WEST_REFINEMENT_VIEWS,
  stores:{position:[storesBounds[2]+44,48,storesBounds[3]+51],target:storesTarget,fov:48},
  ...MAIN_KITCHEN_VIEWS,
  ...splitAerial,
  barmere:{position:[136,44,13],target:[89.2,4,-14],fov:48},
  redesmere:rearAerial,
  saughall:rearAerial
});
export const LOCATION_WALKS=Object.freeze({
  ...Object.fromEntries(Object.keys(WILLOWS_VIEWS).map(key=>[key,WILLOWS_WALK])),
  ...Object.fromEntries(Object.entries(WEST_REFINEMENT_VIEWS).filter(([key])=>key!=='west-refinement')),
  stores:{position:[storesBounds[2]+13,1.8,storesBounds[3]+9],target:[storesBounds[2],4,storesTarget[2]],fov:60},
  ...Object.fromEntries(Object.keys(MAIN_KITCHEN_VIEWS).map(key=>[key,MAIN_KITCHEN_WALK])),
  ...splitWalk,
  barmere:{position:[141,1.8,-10],target:[94.5,5.1,-12],fov:54},
  redesmere:rearWalk,
  saughall:rearWalk
});
