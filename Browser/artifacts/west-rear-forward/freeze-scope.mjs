import {readFile,writeFile,readdir} from 'node:fs/promises';
const root=new URL('../../dist/',import.meta.url),sources={};
for(const name of await readdir(root))if(name.endsWith('.mjs'))sources[name]=await readFile(new URL(name,root),'utf8');
await writeFile(new URL('frozen-scope-sources.json',import.meta.url),JSON.stringify(sources));
console.log('Saved '+Object.keys(sources).length+' current model modules for an isolated before/after scope comparison.');
