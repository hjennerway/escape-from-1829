// Replay only the documented Carden wall-overlap correction, without editing
// model sources or interfering with older tests' independent scope loaders.
import assert from 'node:assert/strict';
import {registerHooks} from 'node:module';
registerHooks({load(url,context,next){
  const result=next(url,context);
  if(!url.endsWith('/dist/annexe-carden-detail.mjs'))return result;
  const current='const sideFootprint=[[8.1,-8.1],[20.3,-8.1],[20.3,-32.75],[8.1,-32.75]];';
  const previous='const sideFootprint=[[8.1,-8.1],[29.17,-8.1],[29.17,-18],[20.3,-18],[20.3,-32.75],[8.1,-32.75]];';
  assert(String(result.source).includes(current),'The reviewed Carden footprint must still match');
  return {...result,source:String(result.source).replace(current,previous)};
}});
