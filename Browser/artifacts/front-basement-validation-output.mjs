import {registerHooks} from 'node:module';
registerHooks({load(url,context,next){
  const result=next(url,context);
  if(!['test-precompiled-models.mjs','test-timeline-browser.mjs'].includes(url.split('/').at(-1)))return result;
  return {...result,source:String(result.source).replaceAll("'./artifacts/","'./artifacts/front-basement-validation/")};
}});
