import {registerHooks} from 'node:module';
import {readFileSync} from 'node:fs';
registerHooks({load(url,context,next){
  const result=next(url,context);
  return url.endsWith('/dist/west-front-photo-detail.mjs')?{...result,source:readFileSync(new URL('./before-Browser_dist_west-front-photo-detail.mjs',import.meta.url),'utf8')}:result;
}});
