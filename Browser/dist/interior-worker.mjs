import * as THREE from './vendor/three.module.js';
import {asylumArchitectureMaterials} from './asylum-architecture.mjs';
import {buildInteriorFloor} from './interior-section-build.mjs';
// Known finishes come from the main-thread shared library. Paint only labels here.
globalThis.document={createElement:()=>new OffscreenCanvas(1,1)};
asylumArchitectureMaterials(THREE,{id:0},null);
asylumArchitectureMaterials(THREE,{id:2},null);
onmessage=({data})=>{
 try{const result=buildInteriorFloor(THREE,data.floor);postMessage(result,[result.resource.buffer,...result.assets.map(a=>a.bytes.buffer)]);}
 catch(error){postMessage({floor:data.floor.id,error:error.message});}
};
