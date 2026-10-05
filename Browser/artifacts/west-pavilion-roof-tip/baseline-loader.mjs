import {registerHooks} from 'node:module';
import {readFileSync} from 'node:fs';
registerHooks({load(url,context,next){const result=next(url,context);return url.endsWith('/dist/front-inside-corners.mjs')?{...result,source:readFileSync(new URL('before-corners.mjs',import.meta.url),'utf8')}:result;}});
