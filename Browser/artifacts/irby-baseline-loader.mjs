import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {relative} from 'node:path';
const root=fileURLToPath(new URL('../../',import.meta.url));
const baselineFiles=new Set([
 'Browser/dist/main-admin-building.mjs','Browser/dist/irby-ashley.mjs',
 'Browser/dist/grafton-veranda.mjs','Browser/dist/service-court-placement.mjs',
 'Browser/dist/tower-buildings.mjs','Browser/dist/estates-service-court.mjs','Browser/test-historic-roads.mjs'
]);
export async function load(url,context,nextLoad){
 if(url.startsWith('file:')){
  const path=relative(root,fileURLToPath(url)).replaceAll('\\','/');
  if(baselineFiles.has(path))return {format:'module',shortCircuit:true,
   source:execFileSync('git',['show','HEAD:'+path],{cwd:root,encoding:'utf8'})};
 }
 return nextLoad(url,context);
}
