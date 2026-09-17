import {execFileSync} from 'node:child_process';
// These two files were clean before the kitchen edit. Keep all other current
// workspace changes while checking whether broader test failures predate it.
const originals=new Map(['main-admin-building.mjs','tower-buildings.mjs'].map(name=>[
 new URL('../dist/'+name,import.meta.url).href,
 execFileSync('git',['show','HEAD:Browser/dist/'+name],{encoding:'utf8'})
]));
export async function load(url,context,nextLoad){
 if(originals.has(url))return {format:'module',source:originals.get(url),shortCircuit:true};
 return nextLoad(url,context);
}
