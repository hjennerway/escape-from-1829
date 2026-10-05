import {registerHooks} from 'node:module';
import {readFileSync} from 'node:fs';
registerHooks({load(url,context,next){const result=next(url,context);return url.endsWith('/dist/west-refinement.mjs')?{...result,source:readFileSync(new URL('before-west-refinement.mjs',import.meta.url),'utf8')}:result;}});
