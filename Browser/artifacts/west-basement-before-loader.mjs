import {readFile} from 'node:fs/promises';
export async function load(url,context,next){
  const name=url.split('/').at(-1);
  if(url.includes('/dist/')&&['escape-exterior.mjs','entrance-walks.mjs','front-basement.mjs'].includes(name))
    return {format:'module',shortCircuit:true,source:await readFile(new URL('./west-basement-before/'+name,import.meta.url),'utf8')};
  return next(url,context);
}
