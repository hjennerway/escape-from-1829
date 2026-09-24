import * as THREE from '../dist/vendor/three.module.js';
import {createEscapeExterior} from '../dist/escape-exterior.mjs';
import {eastOuterProtected} from './east-outer-scope.mjs';
globalThis.document={createElement:()=>({getContext:()=>({fillRect(){}})})};console.log(JSON.stringify(eastOuterProtected(THREE,createEscapeExterior(THREE,1.5).annexe)));
