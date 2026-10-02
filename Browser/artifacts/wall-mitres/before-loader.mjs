import {readFile} from 'node:fs/promises';
const names=new Set(['front-basement','west-side-basement','front-steps','irby-ashley','main-admin-building','tower-buildings','laundry']);
export async function load(url,context,nextLoad){
 const name=url.match(/\/dist\/([^/]+)\.mjs$/)?.[1];
 if(names.has(name))return {format:'module',shortCircuit:true,source:await readFile(new URL('before/'+name+'.mjs',import.meta.url),'utf8')};
 return nextLoad(url,context);
}
