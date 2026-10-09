import {readFile} from 'node:fs/promises';
// Isolate this task's lantern replacement while preserving the separate
// host-gable repairs that landed in the shared checkout during validation.
export async function load(url,context,next){
 if(url.endsWith('/dist/tower-buildings.mjs')){
  const old=await readFile(new URL('./before/tower-buildings.mjs',import.meta.url),'utf8');
  const current=await readFile(new URL(url),'utf8');
  const start=' function dormer(',end=' // Marked ridge correction:';
  const source=current.slice(0,current.indexOf(start))+old.slice(old.indexOf(start),old.indexOf(end))+current.slice(current.indexOf(end));
  return {format:'module',shortCircuit:true,source};
 }
 if(url.endsWith('/dist/garages-mortuary.mjs'))return {format:'module',shortCircuit:true,source:await readFile(new URL('./before/garages-mortuary.mjs',import.meta.url),'utf8')};
 return next(url,context);
}
