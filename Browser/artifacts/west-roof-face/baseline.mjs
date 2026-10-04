import {registerHooks} from 'node:module';
import {readFileSync} from 'node:fs';
const names=['escape-exterior.mjs','west-front-setback.mjs','front-inside-corners.mjs','west-range-plan.mjs'];
const sources=new Map(names.map(name=>[name,readFileSync(new URL('before-'+name,import.meta.url),'utf8')]));
registerHooks({load(url,context,next){const name=url.split('/').pop();return url.includes('/dist/')&&sources.has(name)?{format:'module',source:sources.get(name),shortCircuit:true}:next(url,context);}});
