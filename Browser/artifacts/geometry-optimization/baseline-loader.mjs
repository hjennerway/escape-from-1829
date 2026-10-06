import {readFile} from 'node:fs/promises';
import {basename} from 'node:path';
import {fileURLToPath} from 'node:url';
export async function load(url,context,nextLoad){
 if(url.startsWith('file:')&&url.replaceAll('\\','/').includes('/Browser/dist/')){
  try{return {format:'module',source:await readFile(new URL('./before/'+basename(fileURLToPath(url)),import.meta.url),'utf8'),shortCircuit:true};}catch(error){if(error.code!=='ENOENT')throw error;}
 }
 return nextLoad(url,context);
}
