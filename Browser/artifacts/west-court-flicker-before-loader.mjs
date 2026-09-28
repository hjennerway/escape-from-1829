import {registerHooks} from 'node:module';
// Reconstruct only this fix's original geometry while preserving concurrent
// material/model work, to distinguish unrelated whole-estate snapshot failures.
registerHooks({load(url,context,nextLoad){
  const result=nextLoad(url,context);
  if(!url.endsWith('/dist/escape-exterior.mjs'))return result;
  const source=String(result.source)
    .replace('const excavations=[...frontBasementExcavations(),westCourtTerrainExcavation()];','const excavations=[...frontBasementExcavations(),westSideBasementExcavation()];')
    .replace(/  const courtLawn=new THREE.Mesh[\s\S]*?(?=  const legacyAccess=)/,'');
  return {...result,source};
}});
