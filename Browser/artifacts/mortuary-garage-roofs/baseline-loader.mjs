import {readFile} from 'node:fs/promises';
export async function load(url,context,next){
 if(url.endsWith('/dist/garages-mortuary.mjs'))return {format:'module',shortCircuit:true,source:await readFile(new URL('./before/garages-mortuary.mjs',import.meta.url),'utf8')};
 return next(url,context);
}
