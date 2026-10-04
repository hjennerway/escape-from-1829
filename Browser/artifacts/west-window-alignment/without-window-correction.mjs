import {registerHooks} from 'node:module';
// Restore only this task's three garden edits in memory. Keep independent
// current modelling changes and every working file intact.
registerHooks({load(url,context,nextLoad){
  const result=nextLoad(url,context);
  if(!url.endsWith('/Browser/dist/west-front-photo-detail.mjs'))return result;
  let source=typeof result.source==='string'?result.source:Buffer.from(result.source).toString('utf8');
  for(const [after,before] of [
    ['rightFlankX:(-52.5+6.2/2+WEST_RANGE_PLAN.innerLeft)/2,','rightFlankX:-47.1,'],
    ['width:1.10,sideWidth:1.10','width:1.10,sideWidth:.60'],
    ['for(const y of [2,6.45])for(const z of [garden+returnGap+returnSillWidth/2,innerFrontZ-returnGap-returnSillWidth/2])','for(const y of [2,6.45])for(const z of [17.25,19.75])']
  ]){
    if(!source.includes(after))throw Error('Current garden source differs from the recorded correction');
    source=source.replace(after,before);
  }
  return {...result,source};
}});
