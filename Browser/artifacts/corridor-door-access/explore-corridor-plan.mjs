import {ESCAPE_GALLERY,ESCAPE_CORRIDOR_RUNS,ESCAPE_CORRIDOR_DOORS,ESCAPE_CORRIDOR_X,corridorPolygon} from './escape-corridor-plan.mjs';
import {ADMIN_FRONT_CORRIDOR} from './admin-front-corridor.mjs';

// Explore continues past Escape's stopping line to the front of Main/admin.
export const EXPLORE_GALLERY={...ESCAPE_GALLERY,maxZ:ADMIN_FRONT_CORRIDOR.frontZ};
export const EXPLORE_CORRIDOR_RUNS=ESCAPE_CORRIDOR_RUNS.map(run=>run.id==='gallery'?{...run,start:[ESCAPE_CORRIDOR_X,EXPLORE_GALLERY.maxZ]}:run);
export const EXPLORE_CORRIDOR_POLYGONS=EXPLORE_CORRIDOR_RUNS.map(run=>corridorPolygon(run));
export const EXPLORE_CORRIDOR_DOORS=ESCAPE_CORRIDOR_DOORS.filter(door=>door.id!=='corridor-lock:gallery:0');
export const EXPLORE_CORRIDOR_ENTRANCE={id:'admin-corridor-door',title:'Main/admin corridor entrance',point:EXPLORE_CORRIDOR_RUNS[0].start,toward:EXPLORE_CORRIDOR_RUNS[0].end};
