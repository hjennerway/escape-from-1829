import {registerHooks} from 'node:module';
import {readFileSync} from 'node:fs';
registerHooks({load(url,context,next){if(url.endsWith('/dist/annexe-leighton-newton.mjs'))return {format:'module',source:readFileSync(new URL('./leighton-corner-before.mjs',import.meta.url),'utf8'),shortCircuit:true};return next(url,context);}});
