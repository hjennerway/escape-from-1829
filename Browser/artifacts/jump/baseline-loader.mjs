import {readFile} from 'node:fs/promises';
export async function load(url,context,next){if(url.endsWith('/dist/explore-controls.mjs'))return {format:'module',shortCircuit:true,source:await readFile(new URL('./explore-controls-before.mjs',import.meta.url),'utf8')};return next(url,context);}
