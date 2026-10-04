import {registerHooks} from 'node:module';
import {readFileSync} from 'node:fs';
const names=['west-front-photo-detail.mjs','west-refinement.mjs','west-court-photo-detail.mjs','west-front-setback.mjs','escape-exterior.mjs'];
registerHooks({load(url,context,next){
 const name=names.find(n=>url===new URL('../../dist/'+n,import.meta.url).href);
 return name?{format:'module',source:readFileSync(new URL('before-'+name,import.meta.url),'utf8'),shortCircuit:true}:next(url,context);
}});
