import {ANNEXE_LOOP_ROAD} from './annexe-loop-road.mjs';
import {SHARED_HISTORIC_LANES} from './historic-road-clearance.mjs';

// Round the pre-2010 elbow inside the old corner, leaving the mapped lamp
// on grass. The saved endpoint remains available to the Modern lane tail.
const lane=SHARED_HISTORIC_LANES.find(r=>r.name==='Parsons Lane (North)').points;
const origin=lane.at(-1),unit=v=>{const length=Math.hypot(...v);return v.map(n=>n/length);};
const incoming=unit(origin.map((v,k)=>v-ANNEXE_LOOP_ROAD.start[k]));
const outgoing=unit(lane.at(-2).map((v,k)=>v-origin[k]));
const angle=Math.acos(incoming[0]*outgoing[0]+incoming[1]*outgoing[1]);
const radius=11,setback=radius*Math.tan(angle/2);
const start=origin.map((v,k)=>v-incoming[k]*setback),end=origin.map((v,k)=>v+outgoing[k]*setback);
const center=[start[0]-incoming[1]*radius,start[1]+incoming[0]*radius];
const initial=Math.atan2(start[1]-center[1],start[0]-center[0]);
const arc=Array.from({length:49},(_,i)=>{
 const a=initial+angle*i/48;return [center[0]+radius*Math.cos(a),center[1]+radius*Math.sin(a)];
});
arc[0]=start;arc[arc.length-1]=end;
export const PARSONS_NORTH_BEND=Object.freeze({radius,center,start,end,points:arc});
export const PARSONS_NORTH_SHARED_POINTS=Object.freeze([...lane.slice(0,-1),end]);
export const PARSONS_NORTH_MODERN_TAIL=Object.freeze([end,origin]);

// Lap onto both straight ribbons, hiding their end borders inside the bend.
const points=[start.map((v,k)=>v-incoming[k]*5),...arc,end.map((v,k)=>v+outgoing[k]*1)];
const normals=[[-incoming[1],incoming[0]],...arc.map(p=>p.map((v,k)=>(center[k]-v)/radius)),[-outgoing[1],outgoing[0]]];
const outline=half=>[1,-1].flatMap(sign=>{
 const side=points.map((p,i)=>p.map((v,k)=>v+normals[i][k]*half*sign));
 return sign===1?side:side.reverse();
});
export const PARSONS_NORTH_BEND_PAVING=Object.freeze([
 {name:'Parsons north end junction border',surface:'junction edge',points:outline(3.6)},
 {name:'Parsons north end junction',surface:'junction',points:outline(3)}
]);
