// Seven blue crosses in Research/annexe-road-trees/marked-locations.png.
// Ground picks use the existing apron and courtyard roof as fixed references.
export const ANNEXE_ROAD_TREES=Object.freeze([
 [358.32,-98.48],
 [348.15,-85.56],
 [328.01,-65.72],
 [318.28,-55.00],
 [308.49,-44.19],
 [299.78,-35.58],
 [290.24,-26.86]
].map(([x,z],index)=>Object.freeze({name:`Annexe roadside tree ${index+1}`,x,z,size:1.1})));
