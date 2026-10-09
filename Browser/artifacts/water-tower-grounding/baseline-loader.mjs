import {registerHooks} from 'node:module';
import {readFileSync} from 'node:fs';
const target=new URL('../../dist/water-tower.mjs',import.meta.url).href;
const source=readFileSync(new URL('./before-water-tower.mjs.txt',import.meta.url),'utf8');
registerHooks({load(url,context,next){return url===target?{format:'module',source,shortCircuit:true}:next(url,context);}});
