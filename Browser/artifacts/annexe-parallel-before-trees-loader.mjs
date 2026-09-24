import {readFileSync} from 'node:fs';
import {registerHooks} from 'node:module';
const {trees}=JSON.parse(readFileSync(new URL('../../Research/historic-roads/annexe-parallel-before.json',import.meta.url)));
registerHooks({load(url,context,next){if(url.endsWith('/dist/annexe-road-trees.mjs'))return {format:'module',source:'export const ANNEXE_ROAD_TREES='+JSON.stringify(trees)+';',shortCircuit:true};return next(url,context);}});
