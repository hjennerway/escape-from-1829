import {registerHooks} from 'node:module';
import {readFileSync} from 'node:fs';
registerHooks({load(url,context,next){const r=next(url,context);if(url.endsWith('/dist/annexe.mjs'))return {...r,source:readFileSync(new URL('./larkton-recess-before-annexe.mjs',import.meta.url),'utf8')};return r;}});
