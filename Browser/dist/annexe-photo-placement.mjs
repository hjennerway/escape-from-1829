// The rear aerial is authoritative for the annexe's site scale and separation
// from Main/admin. The accepted OS plan shapes are preserved in their own frame.
// X/Z scale changes the footprint only; existing storey and tower heights stay.
export const ANNEXE_PHOTO_PLACEMENT=Object.freeze({
 source:'Research/annexe-photo-placement/aerial.png',
 annotated:'Research/annexe-photo-placement/aerial-annotated.png',
 // Fit the whole plan inside the newly marked road, keeping the accepted
 // building-to-forecourt relationship and relative 90% scale.
 // At that time the inward court walls were at map x=-27 and x=20; their midpoint, rather
 // than the doorway, centres the grass strips beside the fixed paved apron.
 site:Object.freeze({planScale:.612,x:375,z:-3}),
 relativeScale:.9,frontAnchorMap:[0,15],
 forecourtCentreMapX:(-27+20)/2,
 centringReference:'Research/annexe-frontage-adjustment/equal-grass-reference.png',
 frontageReference:'Research/annexe-placement/front-roads-annotated.png',
 loopReference:'Research/historic-roads/annexe-outer-loop-marked.png',
 revision:'Fit the complete annexe inside the September 24 straightened outer loop',
 note:'The complete annexe plan is 85% of its previous size and moves inside the yellow outer-road line. Heights and local ward geometry stay intact. The entrance apron and sweep follow the site fit; the subsequent frontage revision moves the avenue and triangle while retaining saved Parsons Lane and the Main/admin teardrop.'
});
