# Carden/Picton side elevation — 24 September 2026

## Marked correction — 24 September 2026

The later `side-correction.png` and the user's accompanying instructions
supersede the first interpretation below. Yellow removes the tall tower
stair glazing; red locates two small rear-facing sashes at the same high
level as the existing upper tower windows. Blue removes the original east
brick bay, including its roof, windows, gutters and walking obstacle. The
unmarked west bay and both fire stairs remain.

The conservatory now uses that removed bay's exact six-sided plan: 11 by 12
local units, with two 3 by 3 clipped corners. It is translated 8.7 units
inward and 13 units rearward from the old bay's coordinates. Its brick plinth,
white glazing and fan-shaped roof share the canted outline. The purple trace
is interpreted as a side wall continuing behind the tower, a projecting
conservatory, and an inward step before the long rear service range. The
stepped wall and conservatory use explicit polygon collision footprints, so
walking remains possible through the clipped corners and side recess.

The pink mark identifies the mistaken placement of the first pair of dormers
on the east spine. Those two are removed. Three new rear hall projections
reuse the exact meshes, materials and dimensions of the accepted three front
projections, reflected through the hall ridge. Their arched windows have the
same spacing, heights and sizes as the front. No front-facing object is moved
or reshaped. The two towers, belfry and original front roof remain fixed.

To avoid burying the middle rear window in the former tall spine, the raised
spine now ends at map z=-12 instead of -5; a lower hipped link fills the join
to the hall. The remaining spine keeps its plain steep east slope. Its west
facade follows the shorter host with three matching sash columns per floor.
This necessary side/rear connection change supersedes the earlier six-column
spine preservation. The extended kitchen court, rear ranges and other ward
assemblies retain their geometry and placement.

`correction-protected-geometry.json` was captured before this correction and
checks 21,445 primitives outside the allowed bay/spine/side work, including
the full front facade, crestings, belfry and restored entrance corridors.
`test-annexe-carden-correction.mjs` also checks removed geometry, exposed
windows, exact reflection of all three rear projections, the translated bay
outline, upward roofs, clear clipped corners and actual walking collisions.
The older whole-model snapshots were rebased only after this independent
check passed. The previous front snapshot included the blue-circled side bay;
its original value is archived in `front-before-correction.json`.

Browser source and the compiled aerial asset are updated. Unity and Blender
sources/exports remain unchanged. Current comparisons and logs use
`Browser/artifacts/annexe-carden-correction-`.

Validation: all 62 browser test scripts pass. Rebuilt source/compiled comparison, every timeline stop, and the seven source/compiled Carden views pass without page errors. The annotation and plan views confirm the canted conservatory, stepped footprint and all three rear hall projections. Logs and images use Browser/artifacts/annexe-carden-correction-.

## Initial interpretation — historical

The supplied `img1.jpg` looks from the lawn east/rear of the annexe towards
the near square tower, central hall and spine. `img1-loc.png` locates that
direction. The two blue circles in `img1-annotated.jpg` identify the existing
square-tower crests; the yellow circle identifies the existing domed belfry.
These are registration landmarks, not instructions to move or remodel them.
The explicit user request protects the annexe's front-facing parts and permits
the side/rear refinement. The copied photographs are unmodified references.

The east side of the raised spine now has a steep slate slope and two projecting
round-headed dormers, terracotta pediments, blue gutters and lead flashing.
The east eave drops from 12.4 to 8.4 local model units; the ridge and every
vertex and UV of the accepted west slope remain unchanged. The upper masonry
is tapered beneath that slope. This later photo supersedes the former inference
that both spine slopes should mirror the Oakmere side.

The lower side range joins the existing rear service link. Its dark, narrow
windows, hipped roof and rainwater goods follow the foreground of the photo.
A white glazed porch with a brick plinth occupies the junction near the tower.
The tower receives rear stair glazing, and a blind cross-gable and four-pot
chimney articulate the near roof junction. The stack leaves the existing
belfry visible from the saved lawn viewpoint. Generic sashes beneath the new
east dormers are covered by a masonry skin; their metadata continues to supply
the accepted west-side window spacing.

The dimensions and concealed joins are estimates within the existing model.
The photo is an architectural reference, not a surveyed camera calibration.
The original front hall, entrance, front pavilions, square towers, crestings,
belfry, mirrored bays/stairs and Oakmere west-facing detail retain their geometry.
The earlier rear court extension and kitchen retain their geometry too.

`Browser/dist/annexe-carden-detail.mjs` owns the new group and the two localized
spine mesh adjustments. `aerial.html?view=annexe-carden-photo` and the matching
walking URL use the lawn direction; **Annexe: Carden side photo** is available
in both Locations menus. The assembly belongs to the central annexe and follows
its Historic visibility, timeline and placement. Its masonry/plinth contributes
to the normal walking collision construction.

`protected-geometry.json` was captured before this refinement. The dedicated
`test-annexe-carden.mjs` retains its original fingerprint: 21,929 primitives
outside the two permitted spine meshes, plus the annexe root transform. The
separate 1,705-primitive central-front fingerprint is also unchanged. The
concurrent east entrance-link restoration is normalized by undoing its two
rigid translations and excluding its copied link for this comparison; that
work has its own preservation test and was not reverted by this refinement.
`spine-roof-before.json` independently protects the original west roof surface.

Validation covers exposed new glazing against the complete annexe, upward roof
normals, open lawn camera, actual walking against the porch, and Historic
visibility. Historical whole-annexe snapshots are refreshed only after the
independent Carden, central-front and corridor checks pass. Preview images and
build/test logs use `Browser/artifacts/annexe-carden-`.

This changes the shared browser model and rebuilt aerial asset. Unity and
Blender sources and exports are unchanged.

Validation: all 61 browser test scripts pass, as do the rebuilt source/compiled comparison and every timeline stop. The source and compiled photo, close, overhead and front previews render without page errors, and the Carden WALK HERE link retains its viewpoint and selected period. The new-geometry ray check keeps both tower roofs and the belfry clear from the reference direction. Logs and screenshots use Browser/artifacts/annexe-carden-.

## Conservatory and roof placement correction — 24 September 2026

The latest `outward-roof-reference.png` and the user's accompanying request
supersede the earlier conservatory position and raised central spine. The
red guide is interpreted as the continued outer side-wall line at local
x=29.17. The conservatory moves outward by 8.87 local units (5.75 scene
metres), keeping its canted 11 by 12 footprint, glazing and roof dimensions.
Its back edge now follows that line. The newly exposed north edge is glazed.

The yellow-marked spine now has 4.7-unit eaves and a 6.6-unit ridge, matching
the adjoining low links. Its masonry, sash height, courses and roof follow
that single-storey height; the former upper windows and chimney are removed.
The Oakmere end rooms remain intact.

The blue area receives a slate gabled section behind the east tower, with
three exposed upper side sashes, 12.4-unit eaves and a 15.6-unit ridge. Its
local x span is 20.3–29.17 and its z span is -21 to the tower rear wall.
The rear end overlaps the conservatory join by three units. A low masonry
and roof connection fills the remaining space beside the conservatory.
These placements are estimates from the marked view, not surveyed dimensions.

The source-built walking scene derives obstacles from the moved plinth and
new masonry. All geometry is constructed before the existing exterior batch,
shadow and walking-obstacle setup; no additional runtime movement is added.
The browser source and generated aerial model are updated. Unity and Blender
sources and exports are unchanged.

The independent preservation check retains 21,002 primitives outside the
permitted Carden/spine work and the separately edited Jarman court frontage.
Before excluding that concurrent frontage, the original court implementation
was loaded in an isolated verification run and all 21,445 original protected
primitives matched. Tests also cover the lower roof height, three exposed
sashes, conservatory translation, joined roofs, glazing, collisions and
Historic visibility. Historical snapshots were refreshed only after these
checks passed. Previews and validation logs use `Browser/artifacts/carden-outward-`
and `Browser/artifacts/annexe-carden-outward-`.

## Tower height and rear extension — later 24 September 2026 correction

The user's `height-extension-reference.png` requests 15% shorter square towers
and the newly added tall gabled section. Their follow-up explicitly preserves
the conservatory shape and withdraws the proposed roof-shape change. Both
existing slate roof forms therefore remain in use.

`annexe-tower-height.mjs` applies a 0.85 vertical transform to the two square
towers before batching. Masonry, hipped caps, courses, windows and cresting
follow the same transform while every x/z coordinate remains fixed. Their
wall height is now 17.68 local units. The new Carden gabled section has
10.54-unit eaves and a 13.26-unit ridge; its three upper sashes follow the
height reduction. The Carden rear tower sashes also follow the tower height.
The adjacent belfry, hall, pavilions and stair assemblies are unchanged.

The low brick section behind the conservatory extends from local z=-30 to
z=-36.5 (4.212 scene metres), an estimate aligning the yellow end-wall guide
with the purple target. Its opposite end stays at z=-18, with its width,
4.7-unit eaves and 1.9-unit roof rise fixed. The same hipped-roof construction
covers the longer footprint. The formerly obscured side sash moves to the
new end wall. The conservatory keeps exactly the same footprint, position,
roof, glazing and materials as the preceding outward-placement revision.

`height-extension-before.json` captures the prior model. The new
`test-annexe-carden-height.mjs` compares all 294 tower primitives against the
exact 0.85 vertical transform, checks the new high roof's height, preserves all
130 captured conservatory primitives exactly, and checks the extended wall,
roof coverage, exposed glazing and walking obstacles. It also protects all
other annexe geometry outside the Carden assembly and the separately edited
Jarman frontage. Historical snapshots follow the new tower heights only after
these independent checks pass. Browser source and the generated aerial asset
are updated; Unity and Blender sources/exports are unchanged.

Validation of this final correction: the full browser suite, source/compiled
comparison and all timeline checks pass. Seven source and compiled previews
also pass without page errors. Final preview images use
`Browser/artifacts/annexe-carden-height-final-`; logs use `carden-height-`.
