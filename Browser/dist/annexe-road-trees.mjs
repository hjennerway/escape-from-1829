import {ANNEXE_AVENUE_SHIFT,alignAnnexeFrontage} from './annexe-loop-road.mjs';
// Seven blue crosses in Research/annexe-road-trees/marked-locations.png.
// Ground picks use the existing apron and courtyard roof as fixed references.
// The first two move inside the September 24 straightened loop, clear of its
// carriageway and preserved triangle; their size and crown geometry stay fixed.
export const ANNEXE_ROAD_TREES=Object.freeze([
 [370,-76],
 [357,-76],
 [328.01,-65.72],
 [318.28,-55.00],
 [308.49,-44.19],
 [299.78,-35.58],
 [290.24,-26.86]
].map(([x,z],index)=>{
 const p=index>=2?alignAnnexeFrontage([x+ANNEXE_AVENUE_SHIFT[0],z+ANNEXE_AVENUE_SHIFT[1]]):[x,z];
 return Object.freeze({name:'Annexe roadside tree '+(index+1),x:p[0],z:p[1],size:1.1,...(index===3?{removed:true}:{})});
}));
