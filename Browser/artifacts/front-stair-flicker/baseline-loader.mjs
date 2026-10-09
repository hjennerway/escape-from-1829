import {registerHooks} from 'node:module';
import {readFileSync} from 'node:fs';
const target=new URL('../../dist/entrance-walks.mjs',import.meta.url).href;
registerHooks({load(url,context,next){return url===target?{format:'module',source:readFileSync(new URL('before-entrance-walks.mjs',import.meta.url),'utf8'),shortCircuit:true}:next(url,context);}});
