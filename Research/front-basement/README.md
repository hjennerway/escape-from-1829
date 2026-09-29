# Front semi-basement walks — 27 September 2026

The owner's `front-marked.png` identifies the yellow facade walks, outer
descending stairs and inner ascending stairs beside Reception. The lower
windows must keep their positions. The circled four-tread branch of the
central staircase supplies the initial estimated 0.81-unit depth.

The subsequent `outer-stair-correction.png` supersedes the first outer stair
placement: the descent starts at the blue X in the corner, along the facade,
not from a projection into the lawn. The owner also requested 50% more depth.
Both mirrored front walks are now 1.215 scene units below the existing path
grade (floor y=-1.02). Six 0.2025-unit risers retain the central staircase's
individual rise. These are visual estimates, not surveyed dimensions.

Each outer flight runs along X, between |x|=30.75 and 28.35 at z=19.7–21.7.
The lower walk follows the projecting bay and recessed frontage. The inner
flight rises towards the lawn at |x|=4.24–6.24, z=21.6–24. The outer stair
mouth leaves a clear route to the existing corner door. The earlier stair
projection and upper landing on the lawn have been removed.

`Browser/dist/front-basement.mjs` contains the front excavation, paving,
steps, exposed foundations and retaining edges. The shared terrain, legacy
access surface and corner asphalt are cut so they cannot conceal the steps.
Existing windows, blue doors, upper walls and the central entrance stairs
retain their positions. Explore follows the lower paving and individual
tread heights; retaining edges block shortcuts through the sides. Visibility
changes refresh the walk surfaces with the existing obstacle refresh path.

The browser source is shared by aerial, Explore and gameplay. Local compiled
aerial output must be rebuilt after geometry changes. Unity and Blender
exports are unchanged. The separate west-side basement work is recorded in
its own task and is not the stair location shown by this front annotation.

## Front window texture flicker — 29 September 2026

The owner's [blue-circled screenshot](front-sill-flicker.png) locates the join
below the west corner sash, beside the outer basement stair. It is defect
evidence, not an additional set of modelling instructions.

The brown retaining-wall face and the white lower facade shared z=19.7 between
y=0 and 0.17, causing depth-buffer flicker. On both mirrored stairs the upper
retaining masonry now sits 0.03 units behind the facade. Its lower foundation
keeps the original face at z=19.7, concealing the unexcavated ground edge. The
stone coping, windows, treads and approach retain their positions.

`Browser/test-front-basement.mjs` probes the competing surfaces on both sides
and checks that the lower wall still conceals the terrain. The zero-clearance
version fails that regression. Browser source and the local compiled aerial
asset are updated; Unity and Blender exports are unchanged. Close and oblique
render evidence uses `Browser/artifacts/front-sill-*`.
