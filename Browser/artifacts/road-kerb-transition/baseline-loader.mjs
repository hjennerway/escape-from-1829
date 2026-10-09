import {readFile} from 'node:fs/promises';
export async function resolve(specifier,context,nextResolve){
 if(specifier==='baseline:road-end-fades')return {url:new URL('../../dist/road-end-fades.mjs?kerbBaseline',import.meta.url).href,shortCircuit:true};
 return nextResolve(specifier,context);
}
export async function load(url,context,nextLoad){
 if(url.endsWith('/dist/road-end-fades.mjs?kerbBaseline')||(process.env.KERB_BASELINE==='1'&&url.endsWith('/dist/road-end-fades.mjs'))){
  return {format:'module',source:await readFile(new URL('before-source/road-end-fades.mjs',import.meta.url),'utf8'),shortCircuit:true};
 }
 return nextLoad(url,context);
}
