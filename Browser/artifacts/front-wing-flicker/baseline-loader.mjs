import {registerHooks} from 'node:module';
import {readFileSync} from 'node:fs';
const sources=new Map(['escape-exterior','front-inside-corners'].map(name=>[
 new URL('../../dist/'+name+'.mjs',import.meta.url).href,
 readFileSync(new URL('./before-'+name+'.mjs.txt',import.meta.url),'utf8')
]));
registerHooks({load(url,context,next){return sources.has(url)?{format:'module',source:sources.get(url),shortCircuit:true}:next(url,context);}});
