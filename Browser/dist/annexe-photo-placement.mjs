// The rear aerial is authoritative for the annexe's site scale and separation
// from Main/admin. The accepted OS plan shapes are preserved in their own frame.
// X/Z scale changes the footprint only; existing storey and tower heights stay.
export const ANNEXE_PHOTO_PLACEMENT=Object.freeze({
 source:'Research/annexe-photo-placement/aerial.png',
 annotated:'Research/annexe-photo-placement/aerial-annotated.png',
 // Keep the accepted forecourt/site frame fixed, then scale the complete
 // building by 90% about the centre of its entrance facade. This retains the
 // annexe's current proportions while the front centre stays on the paved
 // approach axis.
 site:Object.freeze({planScale:.72,x:378,z:-34}),
 relativeScale:.9,frontAnchorMap:[0,15],
 frontageReference:'Research/annexe-placement/front-roads-annotated.png',
 revision:'Annexe reduced uniformly to 90% around its front centre',
 note:'The complete annexe is 90% of its preceding size without changing its shape. Its entrance-facade centre remains aligned to the fixed asphalt forecourt and approach centreline. The paving, roads, Parsons Lane, Vivienne Smith Lane and the teardrop stay fixed.'
});
