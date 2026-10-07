import {readFile} from 'node:fs/promises';
export async function load(url,context,nextLoad){
  if(url.endsWith('/dist/water-tower.mjs'))return {format:'module',source:await readFile(new URL('before.mjs.txt',import.meta.url),'utf8'),shortCircuit:true};
  return nextLoad(url,context);
}
