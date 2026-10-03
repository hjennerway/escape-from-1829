import {registerHooks} from 'node:module';
import {readFileSync} from 'node:fs';
const original=readFileSync(new URL('before-courtyard-photo-detail.mjs',import.meta.url),'utf8');
registerHooks({load(url,context,next){
 const result=next(url,context);
 return url.endsWith('/courtyard-photo-detail.mjs')?{...result,source:original}:result;
}});
