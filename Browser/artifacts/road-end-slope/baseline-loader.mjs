import {readFile} from 'node:fs/promises';
export async function load(url,context,nextLoad){
 const file=url.split('/').at(-1);
 if(url.includes('/dist/')&&['road-end-fades.mjs','ground-contact.mjs'].includes(file)){
  return {format:'module',source:await readFile(new URL('before-source/'+file,import.meta.url),'utf8'),shortCircuit:true};
 }
 return nextLoad(url,context);
}
