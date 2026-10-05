import {registerHooks} from 'node:module';
import {readFileSync} from 'node:fs';
const originals=new Map(['front-inside-corners.mjs','west-cross-range-roof.mjs'].map(name=>[
 new URL('../../dist/'+name,import.meta.url).href,new URL('before-'+name,import.meta.url)
]));
registerHooks({load(url,context,next){
 const original=originals.get(url);
 return original?{format:'module',source:readFileSync(original,'utf8'),shortCircuit:true}:next(url,context);
}});
