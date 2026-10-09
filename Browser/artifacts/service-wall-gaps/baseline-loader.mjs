import {readFile} from 'node:fs/promises';
export async function load(url,context,next){
 if(url.endsWith('/dist/tower-buildings.mjs'))return {format:'module',shortCircuit:true,source:await readFile(new URL('./before/tower-buildings.mjs',import.meta.url),'utf8')};
 return next(url,context);
}
