import {path,walkable} from './core.mjs';
import {stairRoute} from './asylum-layout.mjs';

export const FLOOR_HEIGHT=4.2;
export function makeFloors(ground){
 if(ground.floors)return ground.floors;
  if(!ground.upperFloor)throw Error('Upper floor layout is missing');
  const upper={...ground,...ground.upperFloor,exits:ground.upperFloor.exits||[],stairs:ground.stairs.map(s=>({...s,direction:'DOWN'}))};
  return [ground,upper];
}
export function nearStair(floors,actor){
  const l=floors[actor.floor||0];
  return l.stairs.find(s=>Math.hypot(actor.x-s.x*l.cellSize,actor.z-s.z*l.cellSize)<1.4);
}
export function changeFloor(floors,actor,stair){
  if(!stair||!nearStair(floors,actor)||nearStair(floors,actor).x!==stair.x||nearStair(floors,actor).z!==stair.z)return false;
  const next=1-(actor.floor||0),l=floors[next],x=stair.x*l.cellSize,z=stair.z*l.cellSize;
  if(!walkable(l,x,z,.34))return false;
  Object.assign(actor,{floor:next,x,z});return true;
}
// Route through whichever of the two stairs gives the shortest grid route.
export function routeBetweenFloors(floors,from,to){
 if(floors[0].geometrySource==='asylum-plan')return planRoute(floors,from,to);
  const f=from.floor||0,t=to.floor||0;
  if(f===t)return path(floors[f],from,to).map(p=>({...p,floor:f}));
  let best=null;
  for(const s of floors[f].stairs){
    const a={x:s.x*floors[f].cellSize,z:s.z*floors[f].cellSize,floor:f};
    const b={x:s.x*floors[t].cellSize,z:s.z*floors[t].cellSize,floor:t};
    const first=path(floors[f],from,a),last=path(floors[t],b,to);
    const at=(p,q,l)=>Math.round(p.x/l.cellSize)===Math.round(q.x/l.cellSize)&&Math.round(p.z/l.cellSize)===Math.round(q.z/l.cellSize);
    if((!first.length&&!at(from,a,floors[f]))||(!last.length&&!at(b,to,floors[t])))continue;
    // Include the exact stair centre even when already in its grid cell.
    const route=[...first.map(p=>({...p,floor:f})),a,b,...last.map(p=>({...p,floor:t}))];
    if(!best||route.length<best.length)best=route;
  }
  return best||[];
}
function planRoute(floors,from,to){
 const f=from.floor??0,t=to.floor??0;
 if(f===t)return path(floors[f],from,to).map(p=>({...p,floor:f,y:floors[f].elevation}));
 const nodes=[{...from,floor:f},{...to,floor:t}],links=[];
 for(const stair of floors[0].stairs)for(const [lower,upper] of stair.connections){
  const route=stairRoute(stair,floors[lower].elevation,floors[upper].elevation),a=nodes.length,b=a+1;
  nodes.push({x:route[0][0],z:route[0][2],floor:lower},{x:route.at(-1)[0],z:route.at(-1)[2],floor:upper});
  const points=[];
  for(let i=1;i<route.length;i++){const start=route[i-1],end=route[i],n=Math.ceil(Math.hypot(end[0]-start[0],end[2]-start[2])/.3);for(let k=1;k<=n;k++){const v=k/n;points.push({x:start[0]+(end[0]-start[0])*v,z:start[2]+(end[2]-start[2])*v,y:start[1]+(end[1]-start[1])*v,floor:k===n&&i===route.length-1?upper:lower});}}
  // Finish beyond the upper/lower portals, so navigation leaves the flight.
  points.push({x:route.at(-1)[0],z:route.at(-1)[2]-.8,y:route.at(-1)[1],floor:upper});
  const reverse=points.slice(0,-1).reverse().map(p=>({...p,floor:upper}));reverse.push({x:route[0][0],z:route[0][2]-.8,y:route[0][1],floor:lower});
  links.push({a,b,route:points},{a:b,b:a,route:reverse});
 }
 for(let a=0;a<nodes.length;a++)for(let b=0;b<nodes.length;b++)if(a!==b&&nodes[a].floor===nodes[b].floor){
  const floor=nodes[a].floor,route=path(floors[floor],nodes[a],nodes[b]);if(route.length)links.push({a,b,route:route.map(p=>({...p,floor,y:floors[floor].elevation}))});
 }
 const distance=nodes.map(()=>Infinity),previous=new Map(),unvisited=new Set(nodes.map((_,i)=>i));distance[0]=0;
 while(unvisited.size){const a=[...unvisited].sort((a,b)=>distance[a]-distance[b])[0];unvisited.delete(a);if(a===1||!Number.isFinite(distance[a]))break;
  for(const edge of links.filter(e=>e.a===a)){const next=distance[a]+edge.route.length;if(next<distance[edge.b]){distance[edge.b]=next;previous.set(edge.b,edge);}}
 }
 if(!previous.has(1))return [];const route=[];for(let n=1;n!==0;){const edge=previous.get(n);route.unshift(...edge.route);n=edge.a;}return route;
}
