import {registerHooks} from 'node:module';
import {readFileSync} from 'node:fs';
const source=readFileSync(new URL('before-front-inside-corners.mjs',import.meta.url),'utf8');
registerHooks({load(url,context,next){return url.endsWith('/dist/front-inside-corners.mjs')?{format:'module',source,shortCircuit:true}:next(url,context);}});
