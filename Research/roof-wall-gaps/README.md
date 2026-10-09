# Roof undersides and wall contacts — 6 October 2026

The supplied ground-view reference shows sky between slate roof skins and the
white cornices below them. The estate contains both closed roof slabs and open
surfaces; several roof families had no opaque underside or return across their
overhang. This repair follows the current roof pitches and render edges described
in the later west/east roof-join notes. It does not move those authored surfaces.

`Browser/dist/roof-wall-joins.mjs` surveys the assembled roof and wall geometry.
Closed slabs keep their existing undersides. Open roof surfaces receive an
inward-facing backing just below the slate and edge closures that run back to the
actual masonry or cornice support. The edge closures use that support's material;
white render ends at the slate edge. Mirrored and rotated buildings are handled
in world space, with the additions attached in their original building frame.
Adjacent matching spans are merged. Repeated finishing adds nothing further.
Five edge-closure meshes have reflected parents. Their triangle winding follows
Three.js's reflected-parent convention so their outer faces remain visible.
The regression includes eight horizontal rays below a roof skin in ordinary and
mirrored fixtures, independent of the backing, to protect that behavior.

The finish runs after the exterior's facade-course repairs and again for the
later service/tower buildings added by the aerial layout. Both operations happen
before timeline splitting, batching and shadow preparation, so the additions
follow building visibility, transformations and the compiled model pipeline.

Validation covers 570 source roof meshes, including 285 already-solid undersides.
The compiled inventory has 582 surveyed meshes after timeline splitting. A
frozen independent set of 278 rays that passed through open eaves in the saved
original source now hits opaque geometry in both paths. Roof contact, render
edge, upward pitch, timeline and compiled/source comparison checks also pass.

An independent before/after comparison retains all 16,348 existing meshes:
every geometry attribute and index, world and instance transform, material
colour/side, visibility and shadow flag is unchanged. The repair adds 658 meshes
and 20,967 triangles, including roof backings. Historical shape fingerprints
exclude only these flagged additions; their expected original hashes remain
unchanged. The new additions have their own roof-contact and gap checks.

Local visual validation uses the verified NVIDIA GeForce RTX 3090 Ti through
ANGLE/Direct3D11. Fifteen estate views cover both main wings, Reception, Churton,
the annexe, Main/admin, tower/service buildings and an overview, plus a portrait
ground view. Saved final source and compiled views report no page/shader errors.
See `Browser/artifacts/roof-wall-gaps/verified-*-*.png` and their validation JSON.

From `Browser`, reproduce the roof-specific checks with:

```sh
node test-roof-wall-joins.mjs
node artifacts/roof-wall-gaps/preservation.mjs
npm run build:models
npm run test:compiled
node artifacts/roof-wall-gaps/capture.mjs review source
node artifacts/roof-wall-gaps/capture.mjs review compiled
node artifacts/roof-wall-gaps/final-timeline.mjs
```

The reference and earlier modelling history remain authoritative for the outer
roof shape. Saved pre-repair assembly modules, frozen ray generation, regression
logs and the original geometry comparison are under
`Browser/artifacts/roof-wall-gaps/`. The required full suite and remaining
independent failures are recorded in `DEVELOPMENT.md`.
The timeline wrapper retains every original assertion and redirects only its
capture folder, avoiding Windows locks on shared screenshot files.

Scope: browser model sources and regenerated local compiled aerial assets.
Unity, Blender and packaged desktop/Android exports are not regenerated.

## Covered fascia areas and texture flicker — 9 October 2026

The later Irby/Ashley reference (`../irby-ashley/roof-flicker-reference.png`)
revealed automatic fascias sharing the authored gable planes. This correction
supersedes the earlier claim that every added fascia area was needed. The
finisher now indexes authored vertical faces, including gables, cornices,
instanced trim and vertical ends in roof meshes. It subtracts their overlapping
areas from generated vertical triangles and keeps uncovered fragments. Wall
infill and masonry are excluded from the name-based roof-skin classification.
Roof backings, horizontal returns and the original roof/wall definitions remain.

The clipping uses the final world transforms, including reflected and scaled
parents. A 0.001-unit plane tolerance covers the tiny end cap meeting the east
entrance cornice; a 0.00001-unit boundary clearance absorbs Float32 edge rounding.
Disjoint coplanar faces leave triangles intact. Both normal assembly passes
cache the authored-face records with their actual geometry/transform values.
The finish still runs before timeline splitting, material batches and shadows.

The independent audit samples three interior points per generated fascia
triangle, transforms hit normals into world space and compares actual authored
coverage. The saved original has 444 overlap samples in 37 mesh pairs, including
Irby, its Grafton copy, Farndon/Witby, Upton, the annexe, both main-wing returns,
Reception, connecting corridors and tower ranges. The final audit samples
48,825 points with no overlap. A geometry/transform/material hash preserves all
8,926 surveyed authored meshes (1,139,114 triangles with instances), excluding
trees, terrain, transparent and array-material meshes from this overlap survey.

`test-support/roof-wall-flicker-rays.json` freezes all 444 original defect points.
The roof-wall regression checks retained authored coverage and no generated
competitor in source and compiled geometry, and fails with the saved original
finisher. The existing 278 independently frozen open-eave rays still pass.
Local GPU review uses NVIDIA GeForce RTX 3090 Ti / ANGLE Direct3D11.
All evidence and the saved original finisher are in
`Browser/artifacts/irby-roof-flicker/`; reproduce the independent survey with
`node artifacts/irby-roof-flicker/inspect.mjs review` from `Browser`.

Scope: browser roof finishing and regenerated local compiled aerial/interior
assets. Unity/Android, Blender and packaged exports are not regenerated.
