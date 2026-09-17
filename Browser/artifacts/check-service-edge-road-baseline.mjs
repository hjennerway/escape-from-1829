// Run the road check with the pre-edit tower/pharmacy modules in memory.
// Other work in the shared workspace is retained.
import {registerHooks} from 'node:module';
import {execFileSync} from 'node:child_process';
const originals=new Map(['tower-buildings.mjs','pharmacy-court.mjs'].map(name=>[
 new URL('../dist/'+name,import.meta.url).href,
 execFileSync('git',['show','HEAD:Browser/dist/'+name],{encoding:'utf8'})
]));
registerHooks({load(url,context,nextLoad){
 if(originals.has(url))return {format:'module',source:originals.get(url),shortCircuit:true};
 return nextLoad(url,context);
}});
await import('../test-historic-roads.mjs');
