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

## Marked window correction (18 September 2026)

The later [window annotation](window-correction.png) supersedes the window
counts and blocked upper openings described above. Only sash assemblies change:

- The red-circled west low hall link has three windows, replacing four.
- The two pale upper openings in the blue circle use the same glazed, divided
  sashes as their neighbours, at their existing positions and dimensions.
- The green-circled west face of the central rear spine has six windows per
  floor, replacing thirteen. The yellow-arrow east face has six per floor;
  its actual opening positions supply the corrected horizontal spacing and
  widths. The green face retains its existing sill/head heights and masonry.

The opposite elevation, roofs, walls, bands, pipes, low rooms and adjoining
buildings are unchanged. `test-oakmere-windows.mjs` checks the requested counts,
matching columns, exposed glazing and a pre-edit fingerprint of 21,625
protected primitives. Only individual sash parts in the three marked areas
are excluded from that fingerprint; masonry in those areas is still checked.
The older whole-annexe and west-refinement snapshots are rebased after this
independent preservation check. Before/after source views and the compiled
views are captured by `Browser/artifacts/oakmere-windows-preview.mjs`.

This updates the shared browser source and generated aerial asset. Unity and
Blender exports are unchanged.

## Rear courtyard join and square annex — 24 September 2026

The supplied [marked plan](rear-court-marked.png) extends the blue edge of the
angled service wing into the green rear courtyard wall. The yellow dot and
arrow place the camera inside the rear court, looking along Oakmere's eastern
face. The [marked photograph](rear-court-annex-marked.png) identifies the low
square annex beyond the service head; the [unaltered original](rear-court-photo.png)
is now Oakmere's own gallery photo, with the earlier lawn image retained as
an adjoining-range reference. Cars are not modelled.

`annexe-oakmere-court.mjs` adds 12.5 map units along the wing's existing
angle, overlapping the full blue end with the green wall. A continuous slate
ridge covers the former end hip. The square annex is seven map units on
each side, with a low hip roof, pale openings, a glazed entrance, a small
landing and handrails. A shallow two-storey hip-roof bay, divided windows,
brick bands, rainwater pipes and evergreen shrubs follow the photo. Dimensions
and hidden joins are estimates within the existing registered footprint.

All additions belong to Oakmere and are built before scene batching, shadow
setup and walking obstacle extraction. They inherit the annexe's dates and
Historic visibility. No runtime geometry move is introduced.

`test-oakmere-court.mjs` checks the complete blue/green join, upward roof
surfaces, annex dimensions, collisions, visibility and gallery ownership. The
pre-edit `court-protected-before.json` preserves every original annexe
primitive; earlier historical scope tests omit only the new named subtree.
Source/compiled visual checks use `Browser/artifacts/oakmere-court-preview.mjs`.
Browser sources and generated aerial assets are updated; Unity and Blender
sources and exports are unchanged.

### Blue cross-head face correction

The later [render circles](head-face-render-marked.png) and
[photo circles](head-face-photo-marked.png) distinguish the green long-wing
face from the blue court-facing cross-head. The blue face grows outward by
14 map units, retaining the long wing and the previously requested green-wall
join. Its new face has pale divided sashes, brick bands and a shallow hip-roof
bay. The low square annex moves with the outer end, attaching to the end-side corner
of the head and exposing it from the supplied photo direction.
The dedicated test checks the widened wall/roof and relocated annex as well.

### Bay depth and rear annex placement — later 24 September 2026 correction

The latest [marked model](bay-annex-placement-marked.png) supersedes the
shallow cross-head bay and end-side annex placement above. The bay face moves
4.5 map units into the courtyard (about 4.72 scene metres), estimated from
the yellow-to-blue guide. Its back stays joined to the head, with deeper
masonry and a continuous hipped roof; the front sashes, bands and shrubs
follow the new face. Width and height remain unchanged.

The seven-unit square annex moves to the opposite, rear face of the head,
flush with its outer end and overlapping the host wall by 0.05 map units.
Its entrance, landing, handrails and shrubs face the open rear lawn. The
former annex location is clear. Both changes happen before batching, shadow
setup and walking-obstacle extraction.

The focused court regression checks the new face, full-depth roof and collision,
rear attachment, exposed annex and clearance at its old position. It retains
the existing independent fingerprint protecting original annexe geometry.
Browser source and the local compiled aerial asset are updated; Unity and
Blender sources and exports are unchanged. Preview images and validation logs
use `Browser/artifacts/oakmere-*placement*`.

Validation: source and rear visual checks, bay/annex geometry and walking
assertions pass. The source/compiled comparison and all timeline stops passed
on the first rebuilt asset. Concurrent changes elsewhere in the shared
workspace subsequently invalidated historical preservation snapshots; the full
suite stopped in the Larkton preservation check, and the whole-annexe Oakmere
fingerprint also changed. These unrelated snapshots were not rebased here.
Live Oakmere assertions were rerun independently and passed.
