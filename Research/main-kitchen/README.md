# Main kitchen

The September 17, 2026 [red footprint](marked-reference.png) places a
single-storey kitchen in the courtyard between the Redesmere connector and
the tower gallery. The screenshot is a placement reference; the user's message
specifies the building name, single storey and three white hipped roofs.

The footprint is x=120 to 153.6, z=-26.6 to 6.6. Its east and south edges meet
the existing corridor walls without overlapping their footprints. Three
parallel roof sections run north/south, each with two pitched sides and two
hipped ends. Eaves are 4.8 units high and each roof rises 2.65 units. Fine pale
seams, white ridges and two valley gutters finish the roof. Brickwork, service
windows and the lawn-side door are inferred details.

The deeper Redesmere connector ends at x=120 and the low corridor continues
from there. The west stores retain their north section and eastern return;
their southwest corner is removed up to the kitchen's north/east boundaries.
The walls, flat roof, parapets and collision polygon all follow the resulting
L shape. Openings hidden by the new joins are omitted.

Choose **Main kitchen** in Locations. Aerial, plan, roof and walking views use
`aerial.html?view=main-kitchen`, `?view=main-kitchen-plan`,
`?view=main-kitchen-roofs` and `explore.html?view=main-kitchen`.
The browser model follows Historic visibility. Blender/Unity are unchanged.

`Browser/test-main-kitchen.mjs` samples roof coverage and clearance from the
stores across the entire footprint, checks three distinct peaks and both
hipped ends, verifies corridor contacts, and checks walking collisions in all
layout combinations. Reference-camera fitting and browser captures are in
`Browser/artifacts/fit-main-kitchen.mjs` and `render-main-kitchen.mjs`.

Validation: kitchen geometry, tower buildings, Main/admin, ward corridors,
laundry, layout visibility and walking-control checks pass. The broader historic
road and aerial-performance tests have existing failures at the admin north
service road and distant-tree triangle budget. Running them with the original
Main/admin and tower-building modules reproduces the same failures; see
`Browser/artifacts/main-kitchen-baseline-loader.mjs`.
