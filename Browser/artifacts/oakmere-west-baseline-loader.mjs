import {readFile} from 'node:fs/promises';
export async function load(url,context,nextLoad){
 if(url.endsWith('/dist/annexe.mjs'))return {format:'module',source:await readFile(new URL('./oakmere-west-before.mjs.txt',import.meta.url),'utf8'),shortCircuit:true};
 if(url.endsWith('/dist/annexe-os-refinement.mjs'))return {format:'module',source:await readFile(new URL('./oakmere-os-before.mjs.txt',import.meta.url),'utf8'),shortCircuit:true};
 return nextLoad(url,context);
}
