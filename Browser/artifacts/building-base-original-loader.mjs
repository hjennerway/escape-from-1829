import {registerHooks} from 'node:module';
import {readFileSync} from 'node:fs';
registerHooks({load(url,context,next){
 if(url.endsWith('/dist/estates-department.mjs'))return {format:'module',source:readFileSync(new URL('building-base-before/estates-department.mjs',import.meta.url),'utf8'),shortCircuit:true};
 return next(url,context);
}});
