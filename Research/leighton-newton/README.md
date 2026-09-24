# Leighton / Newton photographic refinement — 24 September 2026

The supplied locations.png identifies the existing rear east L. The red dot and
arrow correspond to img1 (inside the L); blue corresponds to img2 (the outer
long elevation). The photographs are bundled unaltered as
[inner](../../Browser/dist/building-photos/leighton-newton-inner.jpg) and
[outer](../../Browser/dist/building-photos/leighton-newton-outer.jpg).

The accepted OS-derived L, its 22-degree turn, root scale, and later rearward
translation remain fixed. This supersedes the earlier generic elevations and
unchanged-rear-block-detail assumption, not the approved plan placement.

The outer elevation now has two projecting brick gables, terracotta verges and
bands, a round gable light, tall pale divided upper sashes, boarded lower
openings, a ribbed lean-to veranda on blue columns, and low garden piers. The
inner elevation has shallow hipped projections and a blue arched entrance.
Eight staggered multi-pot chimney stacks replace the generic pair. Cross roofs
terminate with hips on the inner side. Darker brick is local to this ward.
Dimensions, obscured side faces, bay spacing and hidden roof joins are estimated
from perspective photos within the accepted plan; this is not a surveyed model.

All details belong to the ward and are built before batching, shadow setup and
walking-obstacle extraction. New masonry and column plinths collide; the veranda
walk and both photo starts stay accessible. Historic visibility and dates apply.
The original two photos are available in the ward gallery. Locations includes
leighton-newton-inner and leighton-newton-outer in aerial and walking views.

The independent pre-edit fingerprint in protected-before.json retains all
923,701 primitives outside the ward. test-leighton-newton.mjs also checks the
unchanged L ranges, exposed windows, roof normals, collision coverage, clear
veranda walk, photo camera starts, gallery ownership and Historic visibility.
Historical whole-annexe fingerprints were refreshed only after this independent
comparison passed; their footprint, translation and feature checks remain active.

Browser procedural sources and the generated aerial asset are updated.
Unity and Blender sources and exports are unchanged.

Final validation: the complete npm test suite passes. The rebuilt aerial asset
passes source/compiled geometry and image comparison, full-detail loading and
fallback checks. Every timeline browser stop passes; the timeline rerun uses
separate leighton-timeline artifacts after a shared screenshot file was locked.
Both final source and compiled photo directions and the overview were rendered
without page errors and visually inspected. Logs use Browser/artifacts/leighton-;
final previews are leighton-compiled-inner.png and leighton-compiled-outer.png.
