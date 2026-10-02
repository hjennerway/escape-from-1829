import {readFile} from 'node:fs/promises';
export async function load(url,context,next){
 const name=url.split('/').at(-1);
 if(url.includes('/dist/')&&['escape-exterior.mjs','entrance-west-photo-detail.mjs','photo-detail-primitives.mjs'].includes(name))
  return {format:'module',source:await readFile(new URL('./facade-trim/before/'+name,import.meta.url),'utf8'),shortCircuit:true};
 return next(url,context);
}
