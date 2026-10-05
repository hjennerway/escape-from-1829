import {registerHooks} from 'node:module';
import {readFileSync} from 'node:fs';
const names=new Set(['west-cross-range-roof.mjs','west-range-plan.mjs','west-refinement.mjs','west-front-photo-detail.mjs','west-court-photo-detail.mjs','escape-exterior.mjs']);
registerHooks({load(url,context,next){const name=url.split('/').at(-1);if(url.includes('/dist/')&&names.has(name))return {format:'module',shortCircuit:true,source:readFileSync(new URL('before-'+name,import.meta.url),'utf8')};return next(url,context);}});
