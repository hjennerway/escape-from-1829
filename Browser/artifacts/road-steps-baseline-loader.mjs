import {readFile} from 'node:fs/promises';
const modules=new Set(['road-style.mjs','historic-roads.mjs','modern-roads.mjs','modern-entrance.mjs','countess-roundabout.mjs','modern-car-park.mjs']);
export async function load(url,context,next){
 const name=url.split('/').at(-1);
 if(url.includes('/Browser/dist/')&&modules.has(name))return {format:'module',shortCircuit:true,source:await readFile(new URL('road-steps-before-source/'+name,import.meta.url),'utf8')};
 return next(url,context);
}
