import {registerHooks} from 'node:module';
import {readFileSync} from 'node:fs';
registerHooks({load(url,context,next){if(url.endsWith('/dist/west-cross-range-roof.mjs'))return {format:'module',shortCircuit:true,source:readFileSync(new URL('before-roof.mjs',import.meta.url),'utf8')};return next(url,context);}});
