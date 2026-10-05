import {readFile} from 'node:fs/promises';
const sources=new Map(['escape-exterior','outhouse','aerial-layouts'].map(name=>[
 new URL('../../dist/'+name+'.mjs',import.meta.url).href,new URL('./before-'+name+'.mjs',import.meta.url)
]));
export async function load(url,context,nextLoad){
 if(sources.has(url))return {format:'module',source:await readFile(sources.get(url),'utf8'),shortCircuit:true};
 return nextLoad(url,context);
}
