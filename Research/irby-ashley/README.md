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
