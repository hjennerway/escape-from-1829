import {ESCAPE_GALLERY,ESCAPE_CORRIDOR_RUNS,ESCAPE_CORRIDOR_X,corridorPolygon} from './escape-corridor-plan.mjs';
import {ADMIN_FRONT_CORRIDOR} from './admin-front-corridor.mjs';
import {FARNDON_CORRIDOR} from './farndon-corridor.mjs';
import {IRBY_CORRIDOR} from './irby-corridor.mjs';
import {WARD_CORRIDOR_NODES as ward} from './ward-corridors.mjs';

// Explore continues past Escape's stopping line to the front of Main/admin.
export const EXPLORE_GALLERY={...ESCAPE_GALLERY,minZ:FARNDON_CORRIDOR.endZ,maxZ:ADMIN_FRONT_CORRIDOR.frontZ};
// Escape's stopping lines are gameplay boundaries, not the ends of the estate
// corridors. Explore follows the existing shells to their actual contacts.
export const EXPLORE_CORRIDOR_RUNS=ESCAPE_CORRIDOR_RUNS.map(run=>{
 const extent={gallery:{start:[ESCAPE_CORRIDOR_X,EXPLORE_GALLERY.maxZ],end:[ESCAPE_CORRIDOR_X,FARNDON_CORRIDOR.endZ]},
  admin:{start:[100.45,9.8]},irby:{end:IRBY_CORRIDOR.end},diagonal:{end:ward.elbow},
  grafton:{end:ward.grafton},witby:{end:ward.witby}}[run.id];
 return {...run,...extent};
});
EXPLORE_CORRIDOR_RUNS.push({id:'upton',name:'Upton / Frith / Oscroft corridor',start:ward.elbow,end:ward.upton,ends:['Tower workshops','Upton / Frith / Oscroft']});
export const EXPLORE_CORRIDOR_POLYGONS=EXPLORE_CORRIDOR_RUNS.map(run=>corridorPolygon(run));
// Square-ended runs leave an inward V exactly at their shared axis point.
// Follow the estate's bevelled elbow so the finished turning space is open.
const elbowHalf=(EXPLORE_GALLERY.maxX-EXPLORE_GALLERY.minX)/2;
EXPLORE_CORRIDOR_POLYGONS.push([[-1,0],[0,-1],[Math.SQRT1_2,-Math.SQRT1_2],[1,0],[0,1],[-Math.SQRT1_2,Math.SQRT1_2]].map(([x,z])=>[ward.elbow[0]+x*elbowHalf,ward.elbow[1]+z*elbowHalf]));
export const EXPLORE_CORRIDOR_DOORS=[];
export const EXPLORE_CORRIDOR_ENTRANCE={id:'admin-corridor-door',title:'Main/admin corridor entrance',point:EXPLORE_CORRIDOR_RUNS[0].start,toward:EXPLORE_CORRIDOR_RUNS[0].end};
export const EXPLORE_IRBY_ENTRANCE={id:'irby-corridor-door',title:'Irby corridor entrance',point:IRBY_CORRIDOR.end,toward:IRBY_CORRIDOR.start};
