import {readFile} from 'node:fs/promises';
export async function load(url,context,next){
 if(url.endsWith('/dist/east-entrance-roof-join.mjs'))return {
  format:'module',shortCircuit:true,
  source:await readFile(new URL('./before-east-entrance-roof-join.mjs',import.meta.url),'utf8')
 };
 return next(url,context);
}
