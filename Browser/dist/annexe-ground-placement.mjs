// Existing road/forecourt frame, fixed before the annexe-only OS correction.
// Grounds must not follow subsequent building placement changes.
export const ANNEXE_GROUNDS=Object.freeze({x:434.39813305674915,z:-18.741146836568362,rotation:-2.3383710338110153});
export function annexeGroundPoint(x,y,z){
 const c=Math.cos(ANNEXE_GROUNDS.rotation),s=Math.sin(ANNEXE_GROUNDS.rotation);
 return [ANNEXE_GROUNDS.x+c*x+s*z,y,ANNEXE_GROUNDS.z-s*x+c*z];
}
export function annexeGroundLocal([x,z]){
 const c=Math.cos(ANNEXE_GROUNDS.rotation),s=Math.sin(ANNEXE_GROUNDS.rotation),dx=x-ANNEXE_GROUNDS.x,dz=z-ANNEXE_GROUNDS.z;
 return [c*dx-s*dz,s*dx+c*dz];
}
