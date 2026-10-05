# Consistent roof tile courses (5 October 2026)

The owner's request and [cropped roof reference](reference.png) establish the
tile treatment: the longest tile edge runs horizontally across every pitched
face, parallel to its level eaves, with the same tile scale throughout.

`Browser/dist/roof-tile-uv.mjs` measures each triangle after the building's final
transforms. Its horizontal texture axis follows the level contour of the face;
the other axis follows the slope at right angles. The scale matches the shared
slate painter's existing 60-by-32-pixel spacing at three scene units per texture:
0.3515625 units across each tile and 0.1875 units per course. These are existing
model proportions, not surveyed historic tile dimensions. The independently
weathered outhouse map uses 64-pixel tile spacing, compensated to the same
physical size. Existing colours and texture pixels remain intact.

The mapping runs after the main exterior is assembled, then again after layout
assembly adds the water-tower service buildings. Both operations precede aerial
batching. Dormers, hips, canted bays, lean-tos, mirrored/rotated roofs and scaled
workshops share the same rule. Indexed vertices are split only where a texture
seam requires independent coordinates; actual triangle positions and normals
are unchanged. Flat decks, vertical fascia and the Willows' ribbed sheet roof
retain their previous treatment.

`Browser/test-roof-tiles.mjs` surveys the full source estate and accepts
`--compiled` for the baked model and render batches. It reconstructs the physical
texture axes independently and checks horizontal long edges, perpendicular
courses and both tile dimensions. A transformed indexed hip exercises shared
vertices and nonuniform scale. Source checks are included in `npm test` and
`npm run test:models`; compiled checks are included in `npm run test:compiled`.

Before/after captures and a separate preservation audit are in
`Browser/artifacts/roof-tiles/`. The source estate has 316 tiled meshes and 1,923
sloping triangles; the compiled audit also covers rendered batches. The
preservation audit compares roof triangle positions/normals, every other mesh's
geometry, transforms, colours and visibility against saved original sources.

Browser modelling sources and local compiled aerial assets are updated. Unity,
Blender and packaged desktop/Android exports are not regenerated.

Final validation: the source and compiled tile surveys pass, including all
1,923 original sloping triangles, additional render batches and a transformed
indexed test hip. Seven compiled desktop views and a framed phone view were
visually inspected, with no page/shader errors. Source/compiled rendering,
exact draw counts, full detail and missing/incompatible/damaged model fallbacks
pass. The manifest matches the final source fingerprint and binary checksum.

The required `npm test` run and continuations account for all 125 commands:
123 pass. Jarman and Leighton/Newton's two old whole-estate snapshots also fail
with the saved original roof sources; their expected records are retained.
Fifteen texture-dependent annexe reference files have only their affected
hash fields refreshed, after the full before/after geometry audit and original
tests passed. Counts, dimensions and roots remain exact. Carden's individual
tower records additionally retain their existing 15% height transformation,
materials and flags. All refreshed checks run with their original exclusions
and assertions. Ward/mirrored-roof tests compare shape while permitting the
independent UV storage needed at tile seams. Final evidence is in
`Browser/artifacts/roof-tiles/final-report.json`.

The later roof/render correction on 5 October adds local UV coordinates
for `Entrance west projection slate roof` and `Entrance west slate pitches
to render edge`. Their very small clipped triangles otherwise lose course
precision when Float32 stores large world UV values. Each face subtracts
whole texture repeats, preserving the texture phase and physical geometry.
The indexed hip test independently checks phase and position/normal
preservation for this optional mapping, alongside the estate tile survey.
