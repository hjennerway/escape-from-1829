import {registerHooks} from 'node:module';
import {readFileSync} from 'node:fs';
registerHooks({load(url,context,next){const result=next(url,context);return url.endsWith('/dist/roof-wall-joins.mjs')?{...result,source:readFileSync(new URL('before-roof-wall-joins.mjs.txt',import.meta.url),'utf8')}:result;}});
