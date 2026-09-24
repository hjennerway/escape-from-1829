// The yellow-circled rear court grows away from its fixed join to the spine.
// Coordinates are in the existing map frame; width and height stay unchanged.
export const ANNEXE_REAR_STRETCH=Object.freeze({factor:1.15,anchor:-20,back:-44});
export const ANNEXE_REAR_SHIFT=(ANNEXE_REAR_STRETCH.back-ANNEXE_REAR_STRETCH.anchor)*(ANNEXE_REAR_STRETCH.factor-1);
export const stretchAnnexeRearZ=z=>ANNEXE_REAR_STRETCH.anchor+(z-ANNEXE_REAR_STRETCH.anchor)*ANNEXE_REAR_STRETCH.factor;
export const stretchAnnexeRearRect=([x0,z0,x1,z1])=>[x0,stretchAnnexeRearZ(z0),x1,stretchAnnexeRearZ(z1)];
export function stretchAnnexeRearRange(spec){
 if(spec.name.startsWith('Rear court '))return {...spec,rect:stretchAnnexeRearRect(spec.rect)};
 if(spec.name==='Rear service court link'){
  const [x0,z0,x1,z1]=spec.rect;return {...spec,rect:[x0,z0+ANNEXE_REAR_SHIFT,x1,z1+ANNEXE_REAR_SHIFT]};
 }
 return spec;
}
