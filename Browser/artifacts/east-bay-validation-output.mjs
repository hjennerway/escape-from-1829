import {registerHooks} from 'node:module';
// Keep this change's compiled/timeline captures separate from earlier evidence.
registerHooks({load(url,context,next){
  const result=next(url,context);
  if(!['test-precompiled-models.mjs','test-timeline-browser.mjs'].includes(url.split('/').at(-1)))return result;
  return {...result,source:String(result.source).replaceAll("'./artifacts/","'./artifacts/east-bay-validation/")};
}});
