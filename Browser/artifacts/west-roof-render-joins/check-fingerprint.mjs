import {readFile} from 'node:fs/promises';
import {modelSourceHash} from '../../model-build-inputs.mjs';
const manifest=JSON.parse(await readFile(new URL('../../dist/compiled/manifest.json',import.meta.url),'utf8'));
console.log({manifest:manifest.sourceHash,current:await modelSourceHash()});
