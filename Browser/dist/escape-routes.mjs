export const ACTIVE_EXIT_COUNT=5;

// The layout stores candidates. Select once, before building either floor, so
// doors, lighting, maps and interactions all consume the same five routes.
export function selectEscapeRoutes(floors,random=Math.random){
  const candidates=floors.flatMap((floor,floorIndex)=>floor.exits.map(exit=>({floorIndex,exit})));
  if(candidates.length<ACTIVE_EXIT_COUNT)throw Error('Not enough escape-route candidates');
  for(let i=candidates.length-1;i>0;i--){
    const j=Math.floor(random()*(i+1));
    [candidates[i],candidates[j]]=[candidates[j],candidates[i]];
  }
  const selected=candidates.slice(0,ACTIVE_EXIT_COUNT);
  return floors.map((floor,floorIndex)=>({...floor,exits:floor.exits.filter(exit=>selected.some(c=>c.floorIndex===floorIndex&&c.exit===exit))}));
}

export function exitDirection(exit){
  const facing=exit.facing??1;
  return exit.axis==='x'?{dx:facing,dz:0}:{dx:0,dz:facing};
}
