import {readFile} from 'node:fs/promises';
export async function load(url,context,next){
 if(url.endsWith('/dist/main-admin-building.mjs'))
  return {format:'module',shortCircuit:true,source:await readFile(new URL('./main-admin-building-before.mjs',import.meta.url),'utf8')};
 return next(url,context);
}
