import {registerHooks} from 'node:module';
import {readFileSync} from 'node:fs';
const source=readFileSync(new URL('before-west-refinement.mjs',import.meta.url),'utf8');
registerHooks({load(url,context,next){
 return /\/dist\/west-refinement\.mjs$/.test(url)?{format:'module',source,shortCircuit:true}:next(url,context);
}});
