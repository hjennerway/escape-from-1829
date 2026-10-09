import {readFile} from 'node:fs/promises';
export async function load(url,context,next){
 const name=url.split('/').at(-1);
 if(url.includes('/dist/')&&['escape-exterior.mjs','redesmere-photo-detail.mjs','redesmere-passage.mjs','rear-court-photo-detail.mjs'].includes(name))
  return {format:'module',shortCircuit:true,source:await readFile(new URL('./before/'+name,import.meta.url),'utf8')};
 return next(url,context);
}
