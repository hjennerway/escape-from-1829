import '../test-annexe-carden-height.mjs';
import {writeFileSync} from 'node:fs';
import * as THREE from '../dist/vendor/three.module.js';
import {createEscapeExterior} from '../dist/escape-exterior.mjs';
import {jarmanProtected} from './jarman-scope.mjs';
writeFileSync(new URL('../../Research/jarman/protected-geometry.json',import.meta.url),JSON.stringify(jarmanProtected(THREE,createEscapeExterior(THREE,16/9).model),null,2)+'\n');
