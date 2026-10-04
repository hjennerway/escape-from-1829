import {modelSourceHash} from '../../model-build-inputs.mjs';
import {readdir,stat,readFile} from 'node:fs/promises';
const dist=new URL('../../dist/',import.meta.url),folder=new URL('./',import.meta.url);
const sourceHash=await modelSourceHash(),manifest=JSON.parse(await readFile(new URL('compiled/manifest.json',dist),'utf8'));
console.log(JSON.stringify({sourceHash,compiledHash:manifest.sourceHash,current:sourceHash===manifest.sourceHash},null,2));
const files=await Promise.all((await readdir(dist)).filter(n=>n.endsWith('.mjs')).map(async name=>({name,date:(await stat(new URL(name,dist))).mtime.toISOString()})));
console.log(JSON.stringify(files.sort((a,b)=>b.date.localeCompare(a.date)).slice(0,9),null,2));
for(const file of ['npm-test.log','compiled-final.log'])console.log(file+'\n'+(await readFile(new URL(file,folder),'utf8')).split('\n').slice(-10).join('\n'));
