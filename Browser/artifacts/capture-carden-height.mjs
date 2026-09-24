import {writeFileSync,copyFileSync} from 'node:fs';
import * as THREE from '../dist/vendor/three.module.js';
import {createEscapeExterior} from '../dist/escape-exterior.mjs';
import {cardenHeightSnapshot} from './annexe-carden-height-scope.mjs';
globalThis.document={createElement:()=>({getContext:()=>({fillRect(){}})})};
writeFileSync(new URL('../../Research/carden-picton/height-extension-before.json',import.meta.url),JSON.stringify(cardenHeightSnapshot(THREE,createEscapeExterior(THREE,1.5).annexe),null,2)+'\n');
copyFileSync('C:/Users/Harry/AppData/Local/Temp/codex-clipboard-6170e459-d542-48b2-bf65-90e011e53c75.png',new URL('../../Research/carden-picton/height-extension-reference.png',import.meta.url));
