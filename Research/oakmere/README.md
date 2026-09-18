# Oakmere lawn elevation

`img1.jpg` supplies the gabled two-storey elevation; `img1-loc.png` locates it
on the west side of the annexe's central rear spine. The user's later
clarification confirms that the purple/blue circle is the existing front
belfry and the green circle is the existing square tower. They are orientation
references, not requests to alter either landmark.

The local refinement adds the taller two-storey face, a central brick pediment
with circular vent and raking bands, an intersecting slate roof, four / five /
four window bays, the two pale blocked upper openings, masonry string courses,
dark downpipes, and lower end rooms. The window divisions follow the supplied
photograph. Dimensions and the concealed joins are estimates within the existing
registered estate; the photograph is not treated as a surveyed camera match.

The existing spine body and its unpictured elevation are retained beneath the
new upper masonry and roof. The refinement is confined to a separate
`Oakmere lawn elevation` group in `annexe-oakmere-detail.mjs`; only the generic
west-face sash instances are omitted from the annexe generator. The existing
ward destinations and ownership remain as before. This new reference does not
reassign the previous purple-marked rear service head.

Neither tower, the front belfry, entrance, front pavilions, canted side bays,
external stairs, rear service ranges nor courtyard wards has been moved or
remodelled. `Browser/artifacts/check-oakmere-preservation.mjs` compares 12,015
protected annexe primitives against the original annexe revision, including
their geometry, materials, transforms and collision flags. The baseline is
scoped to the annexe because other tasks are editing separate estate buildings
in the same workspace concurrently.

Open `aerial.html?view=oakmere-photo` or `?view=oakmere-lawn`; the new **Oakmere
lawn elevation** Locations entry also works in the exterior walk. The additions
follow Historic visibility. Blender and Unity source models are unchanged.

Validation: `node test-oakmere.mjs` checks every new opening against the complete
annexe, roof normals, walking access and collisions, and Historic visibility.
The existing annexe and ward tests check the front references, open courts,
mirrored bays/stairs, rotated rear wing and ward ownership. The visual QA script
renders the photo direction, site context and the earlier front and side views.

At validation time, the full suite encountered unrelated assertions in
`test-farndon.mjs` (the former northern OS corridor) and
`test-historic-roads.mjs` (remaining footprint edge count). Both failures were
reproduced with the Oakmere refinement disabled using the test-only
`artifacts/oakmere-baseline-loader.mjs`; the other suite checks passed.

The 18 September 2026 gallery replacement is retained unedited as
`lawn-gallery.png`. The photo build script uses it for `oakmere-lawn.webp`
(1200 × 900). The earlier `img1.jpg` remains the modelling reference; this
gallery replacement does not change geometry or ward ownership.

## Red-circled west courtyard face, 18 September 2026

The later `west-lawn-location.png` explicitly selects the west face of
**Rear court west range**, with the blue dot/arrow on its lawn. This replaces
the earlier location inference for the requested photo refinement. The green
outline protects the towers, hall, spine-side details and front side buildings.

`annexe-oakmere-west.mjs` adds a separate **Oakmere west lawn elevation** group:
four / five / four sash bays, two pale blocked upper openings, a central brick
pediment with circular vent and raking bands, intersecting slate roofs, brick
courses, dark rainwater pipes and low end rooms. The reference is the unedited
`lawn-gallery.png`. Window proportions and heights follow the photograph within
the existing courtyard footprint; concealed joins and dimensions are estimates.
The low rear room joins the existing service link, shortened by two source-map
units at its front end so it meets the courtyard corner without hiding the
first ground-floor window. The inner court stays open.

Outside that low connector and its immediately adjacent sash details, existing
annexe geometry is retained, including the separately corrected plain hipped
roof on the shorter central spine. The new face covers its host's generic
outer sashes. `west-protected-geometry.json` fingerprints 21,294 pre-existing
primitives, with geometry, materials, world transforms, shadows and collision
flags. `test-oakmere-west.mjs` checks this baseline, glazing from beyond the
connector (so a ray cannot start inside masonry), roofs, lawn access, facade
collision and Historic visibility. The approved-shape snapshot includes the
new face and shortened connector; the separate protected-front hash is intact.

`aerial.html?view=oakmere-photo`, `?view=oakmere-lawn` and
`explore.html?view=oakmere-photo` now address the marked west face. Ward ownership
is unchanged. Browser source and compiled aerial models are updated; Unity and
Blender exports are unchanged.

## Mirrored spine roof (18 September 2026)

The owner's [blue/yellow correction](mirrored-roof-reference.png) selects the
two sides of the short central rear spine. The blue-marked west roof now
mirrors the yellow-marked plain east hip. This supersedes the projecting
cross-gable, brick pediment, raking bands and circular vent described above
for that spine. Its existing continuous hipped roof supplies both slopes;
the walls, windows, low rooms and joins below remain in place.

`Browser/test-oakmere.mjs` raycasts both sides of the complete annexe at 20
paired positions, checking equal roof heights and an exposed slate surface.
The check rejects the previous cross-gable. The preview script is
`Browser/artifacts/annexe-spine-preview.mjs`. This correction changes the
shared browser model; Unity and Blender exports are unchanged.
