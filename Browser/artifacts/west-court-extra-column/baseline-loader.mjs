import {registerHooks} from 'node:module';
import {readFileSync} from 'node:fs';
registerHooks({load(url,context,next){
 if(url.endsWith('/Browser/dist/west-wing-photo-detail.mjs'))return {format:'module',source:readFileSync(new URL('before-west-wing-photo-detail.mjs',import.meta.url),'utf8'),shortCircuit:true};
 return next(url,context);
}});
