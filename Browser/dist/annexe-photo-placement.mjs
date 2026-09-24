// The rear aerial is authoritative for the annexe's site scale and separation
// from Main/admin. The accepted OS plan shapes are preserved in their own frame.
// X/Z scale changes the footprint only; existing storey and tower heights stay.
export const ANNEXE_PHOTO_PLACEMENT=Object.freeze({
 source:'Research/annexe-photo-placement/aerial.png',
 annotated:'Research/annexe-photo-placement/aerial-annotated.png',
 // Keep the accepted forecourt/site frame fixed and the uniform 90% scale.
 // The inward court walls are at map x=-27 and x=20: their midpoint, rather
 // than the doorway, centres the grass strips beside the fixed paved apron.
 site:Object.freeze({planScale:.72,x:378,z:-34}),
 relativeScale:.9,frontAnchorMap:[0,15],
 forecourtCentreMapX:(-27+20)/2,
 centringReference:'Research/annexe-frontage-adjustment/equal-grass-reference.png',
 frontageReference:'Research/annexe-placement/front-roads-annotated.png',
 revision:'Annexe translated sideways to give equal grass strips beside the forecourt',
 note:'The complete annexe retains its 90% scale and shape. The midpoint between the inward courtyard walls aligns with the fixed asphalt forecourt centreline, giving equal green space on both sides. The frontage setback, paving, roads, Parsons Lane, Vivienne Smith Lane and teardrop stay fixed.'
});
