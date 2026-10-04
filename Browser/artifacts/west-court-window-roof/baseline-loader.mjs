import {registerHooks} from 'node:module';
import {readFileSync} from 'node:fs';
const source=readFileSync(new URL('before-west-court-photo-detail.mjs',import.meta.url),'utf8');
registerHooks({load(url,context,next){
  return url.endsWith('/dist/west-court-photo-detail.mjs')?{format:'module',source,shortCircuit:true}:next(url,context);
}});
