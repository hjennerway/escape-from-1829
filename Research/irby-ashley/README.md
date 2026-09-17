# Irby/Ashley

The user-selected yellow silhouette in `location.png` takes precedence over
the older brown OS trace. The blue circle selects the range; the dots/arrows
locate cameras and are not physical site features.

`Tools/register_irby_ashley.mjs` fits a planar projective transform using
17 visible brown ground-level corners. The approximately 0.22-scene-unit
control residual describes agreement with those picked corners, not survey
accuracy. Yellow corners are then simplified to right angles in the estate
axes. The resulting range occupies approximately x=204.2..263.2 and
z=-137.5..-98.6, on the inside of the existing curved service road.
Neither the road nor the tower complex moves.

## Photographs

- `ward-mural.png`: user-supplied photograph added on 17 September 2026,
  showing the stairwell mural with Irby and Ashley labels. The original is
  retained without edits. `Browser/build-building-photos.mjs` generates
  `Browser/dist/building-photos/irby-ashley-mural.webp` as the fourth image
  in the Irby / Ashley Ward gallery.
- `img1.jpg`: garden elevation from the purple-dot side, with the broad
  left gable, tall sash windows, chimney breasts and low glazed lean-to.
  The request calls this camera img2, but no img2 was supplied. The purple
  viewpoint uses img1 as the likely visual reference; both -1 and -2 URLs
  resolve to that view.
- `img3.jpg`: blue-dot camera looking diagonally across the garden court.
  This resolves two canted brick bays, multi-pane upper sashes, broad stone
  heads, dark sills, dentilled brick eaves and the glazed lean-to.
- `img4.jpg`: elevated view from Main/admin towards the tower-facing side.
  The blue-circled distant range is Irby/Ashley, separately modelled from
  the closer tower service ranges.

Two storeys, 8.4-unit eaves, roof pitches, bay depths, chimneys, unseen
elevations and small side-room height are photo-based estimates. The
conservatory and ground-floor windows use intact glazing, consistent with
the estate's historic reconstruction rather than the later boarded state.

## Scene integration

`Browser/dist/irby-ashley.mjs` owns the footprint, facade, roof geometry and
camera presets. The building appears in Historic and in walking/gameplay.
It is hidden in Modern-only and when both aerial layouts are disabled.
The selected superseded brown contour edges are retired; the adjoining
unmodelled OS connection and other missing-building outlines remain.

Choose **Irby/Ashley** in Locations, or open:

- `aerial.html?view=irby-ashley` for the overview;
- `aerial.html?view=irby-ashley-plan` for the yellow-footprint direction;
- `aerial.html?view=irby-ashley-1` for the purple camera;
- `aerial.html?view=irby-ashley-3` for the blue camera;
- `aerial.html?view=irby-ashley-4` for the Main/admin view;
- `explore.html?view=irby-ashley` for walking.

`node Browser/test-irby-ashley.mjs` checks the marked solid/recess areas,
roof coverage and normals, exposed sashes, courtyard access, walking
collisions, retained adjacent OS connection and independent layout visibility.
Unity and Blender exports are unchanged.

The blue-arrow greenhouse correction turns the roof fall through 90 degrees: its high edge meets the west garden wing at x=247.7 and it slopes down into the court towards x=236.5. The footprint stays in place; side glazing and frame heights follow the revised slope. Reference: greenhouse-slope-correction.png.


## Rear conservatory and octagonal corners

The marked rear photograph in `rear-correction-reference.png` and prior
render in `rear-correction-render.png` supersede the earlier garden-bay
spacing. The colours identify corrections only. The conservatory now runs
to z=-142, extending 4.5 scene units past the west wing's z=-137.5 end;
its newly exposed west side has matching glazing and a low brick wall.
The previously corrected roof fall across X is retained.

A quarter-octagonal, hipped corner fills the junction at x=247.7, z=-122.7.
The adjacent half-octagonal bay moves to x=232.8, leaving 0.9 units between
its masonry edge and the conservatory. Two upper sashes occupy the flat
wall between that bay and the corner. The west-wing upper sash pair is
spread across the remaining exposed return. The other garden bay retains
its position. Dimensions are visual estimates from the supplied marks.

The new corner and conservatory walls participate in walking collisions.
The Irby checks cover the extension, retained roof slope, octagonal corner,
bay clearance, both window pairs, exposed glazing and walking access.

Use `aerial.html?view=irby-ashley-rear` (REAR in the location links) for
the marked render comparison, or the existing BLUE VIEW for the facade.


The yellow-line roof correction in `corner-roof-ridge-correction.png`
joins the quarter-octagonal peak directly to the west wing's ridge end.
The old descending rear gable verge and low junction patch (circled blue)
are removed. Slate slopes now share the new connecting ridge, with a rear
valley meeting the continuous garden range. Walls and glazing retain their
previous positions.

## Rear range moved towards the front, 17 September 2026

`rear-shift-reference.png` identifies the front with the green arrow and the
rear with the orange arrow. The yellow rear edge moves left to the purple
line; the oak in `rear-shift-photo.png` remains at its existing location.
Registering the visible roof corners gives an approximately seven-unit move
along positive Z. The centre range, rear gables, bays, corner, service room,
conservatory and their details translate together without scaling. The front
ends and corridor contact remain fixed, with the connecting wings shortened.
The road keeps its outer boundary; adjoining paving is trimmed to the new walls.

Rear source coordinates in earlier notes now have seven added to Z: the west
gable ends at -130.5 and the conservatory at -135, before ward placement.
`Browser/artifacts/irby-rear-shift-after.png` shows the result from a camera
fitted to the supplied screenshot. The corresponding `-clear.png` hides trees
only for inspection. `verify-irby-rear-shift.mjs` compares the rear meshes and
detail instances against the prior version to confirm their shapes are retained.

## Red-to-orange alignment, 17 September 2026

The later `red-orange-shift-reference.png` moves the outlined rear range a
further three scene units along positive Z, aligning its front edge with the
orange guide. The total shift from the original geometry is now ten units.
Both yellow front faces remain at source z=-98.6, with their widths and sash
positions unchanged; the tower corridor contact also stays fixed. Only the
connecting wings shorten. Garden gables, bays, the octagonal corner, glazing,
chimneys and roof junctions retain their dimensions. The west garden gable
now ends at source z=-127.5 and the conservatory at -132, before ward placement.

The reference-camera before/after views are in
`Browser/artifacts/irby-red-orange-before.png` and `irby-red-orange-after.png`;
the `-clear.png` versions hide trees for inspection. The geometry comparison
records 465 translated mesh vertices, 552 garden-detail instances, fixed front
endpoints and seven fixed front/corridor sashes in
`Browser/artifacts/irby-red-orange-verification.json`. Side details on the
shortened connections are regenerated to fit. Browser sources and the local
compiled aerial model are updated; Unity and Blender exports are unchanged.
