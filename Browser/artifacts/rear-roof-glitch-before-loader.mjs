import {readFile} from 'node:fs/promises';
export async function load(url,context,nextLoad){
  if(url.endsWith('/dist/inner-court-photo-detail.mjs'))return {
    format:'module',shortCircuit:true,
    source:await readFile(new URL('./rear-roof-glitch-before-inner-court.mjs.txt',import.meta.url),'utf8')
  };
  return nextLoad(url,context);
}
