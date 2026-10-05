import {registerHooks} from 'node:module';
import {readFileSync} from 'node:fs';
const sources=new Map(['escape-exterior','outhouse','aerial-layouts'].map(name=>[
 new URL('../../dist/'+name+'.mjs',import.meta.url).href,new URL('./before-'+name+'.mjs',import.meta.url)
]));
registerHooks({load(url,context,next){
 if(sources.has(url))return {format:'module',source:readFileSync(sources.get(url),'utf8'),shortCircuit:true};
 return next(url,context);
}});
