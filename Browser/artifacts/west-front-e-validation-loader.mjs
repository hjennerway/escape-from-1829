import {registerHooks} from 'node:module';
// Keep validation captures separate from other ongoing modelling work.
registerHooks({load(url,context,next){
  const result=next(url,context);
  if(url.endsWith('/test-timeline-browser.mjs'))return {...result,source:String(result.source).replace("const artifacts=new URL('./artifacts/'","const artifacts=new URL('./artifacts/west-front-e-timeline/'")};
  if(url.endsWith('/test-precompiled-models.mjs'))return {...result,source:String(result.source).replace("const artifacts=new URL('./artifacts/'","const artifacts=new URL('./artifacts/west-front-e-compiled/'")};
  return result;
}});
