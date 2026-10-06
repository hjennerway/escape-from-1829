import {registerHooks} from 'node:module';
import {readFileSync} from 'node:fs';
const sources=new Map(['escape-exterior.mjs','aerial-layouts.mjs'].map(name=>[new URL('../../dist/'+name,import.meta.url).href,readFileSync(new URL('before-'+name,import.meta.url),'utf8')]));
registerHooks({load(url,context,nextLoad){if(sources.has(url))return {format:'module',source:sources.get(url),shortCircuit:true};return nextLoad(url,context);}});
