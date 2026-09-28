# Atmospheric countryside backdrop

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
