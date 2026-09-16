# Grafton/Edge

`placement-reference.png` identifies the duplicate of Irby/Ashley beside
Upton/Frith/Oscroft, facing the church. The complete ward was rotated 90 degrees
anticlockwise in plan and fitted into x=49.90..81.42, z=-188.01..-141.74.
These are the registered OS edges under the yellow and orange marks. The
original ground scales are 0.78424 along the source X axis and 0.72627 along Z;
height is unchanged. The source Irby/Ashley ward remains in place.

## Church-facing veranda

The later `veranda.jpg` supersedes the copied rear greenhouse, long rear
wings, paired canted bays and quarter-octagonal corner. Grafton now has a
mostly flat two-storey rear elevation, two shallow square end projections,
and one central half-octagonal bay. The main placement and ground scales
are retained; the shallower rear elevation opens more grass towards the church.

An open veranda spans the rear with a shallow pitched slate canopy, slender
posts and braces, low masonry end walls, pale timber end screens and a paved
walk. The central bay rises through the canopy; the roof is cut to its wall
outline and a continuous sheltered walking route passes in front. The upper
sashes, chimneys and louvred roof ventilator follow the photograph. Dimensions,
hidden details and colour are estimates; the existing estate's brick and slate
palette is retained.

`Browser/dist/grafton-edge.mjs` owns the transformation and views;
`grafton-veranda.mjs` supplies Grafton's replacement rear to the shared
Irby/Ashley builder. The original builder's default geometry is unchanged.
Walls and veranda end screens participate in walking collisions. Old ground
outlines inside the selected bay are retired; adjoining corridor traces remain.

Choose **Grafton/Edge** in Locations. Available views include:

- `aerial.html?view=grafton-edge-rear`: rear overview;
- `aerial.html?view=grafton-edge-photo`: ground photograph comparison;
- `aerial.html?view=grafton-edge-plan`: plan;
- `aerial.html?view=grafton-edge-site`: site placement;
- `explore.html?view=grafton-edge`: walking approach.

Grafton belongs to Historic and the browser walking/gameplay scene. Unity and
Blender exports are unchanged. `node Browser/test-grafton-edge.mjs` checks
rotation, retained source geometry, the single bay, canopy coverage and its
junction with the bay, removed geometry, walking access and layout visibility.
