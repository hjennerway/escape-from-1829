// Keep outdoor exploration usable while furniture and room sections prepare.
// Door movement stays gated until the real interior loader accepts the target.
export function deferExploreInterior(create){
 let interior=null,pending=null,error=null,held=false,background=false,target=null;
 async function ensure(){
  if(!pending)pending=Promise.resolve().then(create).then(value=>{
   interior=value;error=null;if(background)interior.loading.startBackground();return value;
  }).catch(reason=>{pending=null;error=reason;throw reason;});
  return pending;
 }
 const loading={
  async prepare(actor){target=actor;const value=await ensure();await value.loading.prepare(actor);held=false;},
  startBackground(){background=true;interior?.loading.startBackground();},
  allowMove(from,to){
   if(to.outside){held=false;return true;}
   if(interior){held=false;return interior.loading.allowMove(from,to);}
   held=true;target=to;if(!error)ensure().catch(()=>{});return false;
  },
  retry(){if(interior)interior.loading.retry();else if(target)loading.prepare(target).catch(()=>{});},
  get holding(){return held||!!interior?.loading.holding;},
  get failed(){return !!error||!!interior?.loading.failed;}
 };
 return {loading,get scene(){return interior?.scene;},update:(actor,dt)=>interior?.update(actor,dt)};
}
