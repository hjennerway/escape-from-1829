import {readFile} from 'node:fs/promises';
export async function load(url,context,next){
 for(const file of ['tower-buildings.mjs','garages-mortuary.mjs'])if(url.endsWith('/dist/'+file))return {format:'module',shortCircuit:true,source:await readFile(new URL('./before/'+file,import.meta.url),'utf8')};
 return next(url,context);
}
