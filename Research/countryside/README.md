# Atmospheric countryside backdrop

The September 29 ground-contact audit found that some distant tree bases sat
above the coarse meadow triangles despite being below the smooth placement
function. Trunks now extend down to the rendered terrain with 0.12 units of
burial where needed; their tops and crown placements stay fixed. All 1,327
background trunks are checked against the actual triangulated ground by
`Browser/test-ground-contact.mjs`. The backdrop retains its three draws.

The September 28 aerial atmosphere pass takes its colour and lighting direction
from `Art/store-super-hero-1920x1080.png`: cool cloud undersides, warm openings,
illuminated rooms and a softer, layered distance. The artwork is illustrative,
not evidence of historical field boundaries or planting.

The new meadow relief, interrupted hedges and tree belts are likewise scenic
context, not a surveyed reconstruction. They must not be mistaken for dated
estate features. No new historical roads, buildings, lakes or hills are inferred
from the artwork. The relief stays low, avoiding a mountainous horizon.

`Browser/dist/countryside.mjs` protects a level rectangle containing the estate,
all walking bounds and The Willows. Relief begins outside that rectangle and
blends in over 280 scene units. Scenic planting also stays outside it. Existing
excavations, model transforms, walking surfaces and collision lists are unchanged.

The backdrop is a separate, undated scene branch with three draws: meadow
geometry, instanced tree/hedge crowns and instanced trunks. The mapped planting
still follows the normal tree visibility control and timeline. The distant
backdrop stays present as context, including with software rendering.

Grass variation uses world coordinates so original terrain and the new meadow
mesh meet continuously. Distance haze increases outside the protected grounds,
not simply with camera distance; zooming out must not erase the estate itself.
The sky fades to the same horizon colour without a visible ground-edge band.

No Unity, Blender or interchange model exports are changed by this runtime pass.
Screenshots and pixel checks are under `Browser/artifacts/atmosphere/`.

The September 28 terrain-overlap audit found the meadow's shallow inner join
coincident with the flat estate terrain below it. The meadow material now
uses polygon offset (-1 factor, -4 units) so the upper scenic surface renders
consistently at that join. Geometry, boundary heights and walking remain
unchanged. This is a runtime browser adjustment; the courtyard's separate
terrain cut is documented in Research/west/README.md.
