// Existing approximate satellite alignment, with the 1829 entrance fixed.
// See Research/landmark-placement.md; scene units are approximately metres.
export const EARTH_ANCHOR=Object.freeze({latitude:53.2116032,longitude:-2.8988043,x:0,z:19.5});
export function earthToScene(latitude,longitude){
  const east=(longitude-EARTH_ANCHOR.longitude)*111320*Math.cos(EARTH_ANCHOR.latitude*Math.PI/180);
  const north=(latitude-EARTH_ANCHOR.latitude)*111320,L=Math.hypot(.55,.835);
  return [EARTH_ANCHOR.x+(-.55*east+.835*north)/L,EARTH_ANCHOR.z+(.835*east+.55*north)/L];
}
