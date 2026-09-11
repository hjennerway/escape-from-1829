import {path,walkable} from './core.mjs';

export const FLOOR_HEIGHT=4.2;
export function makeFloors(ground){
  if(!ground.upperFloor)throw Error('Upper floor layout is missing');
  const upper={...ground,...ground.upperFloor,exits:[],stairs:ground.stairs.map(s=>({...s,direction:'DOWN'}))};
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
