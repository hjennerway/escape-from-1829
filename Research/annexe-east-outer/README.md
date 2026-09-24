# Annexe east outer wing — 24 September 2026

The user's marked-reference.png selects the inward return in red, the roof
over the narrow rear link in yellow, and the road-facing recess in blue.
These marks are modelling references, not instructions embedded in the image.

The red area removes East end inner return (map x=78..87, z=-16..11) and
the inward part of East end middle rooms (x=87..94, z=-12..-3). Removing
the raised cross-room also exposes the existing East rear link under the
yellow area (x=94..100). Its continuous hipped roof remains at 4.3-unit
eaves and 5.6-unit ridge, replacing the cross-room's 8.4/10.7 heights.
The rear pavilion, long main ward, projecting road-side ends and frontage
retain their accepted geometry and placement.

The blue recess now contains an open veranda between z=-15 and z=4,
attached at x=109 and projecting to x=115.5. Its shallow slate canopy,
slender braced timber posts, pale fascia and paving follow Grafton/Edge's
veranda vocabulary, with blue trim matching the annexe and Jarman.
The canopy meets the existing end rooms; the long front remains open.
Dimensions are inferred from the marked render, not surveyed.

annexe-os-refinement.mjs removes the superseded ranges before wall/window/
roof generation. annexe-east-veranda.mjs builds inside the existing east
assembly before batching and normal walking-obstacle construction.
No runtime geometry changes are introduced. Retained range metadata,
rendering, shadows and collisions therefore follow the same construction
path in aerial, walking and gameplay scenes.

test-annexe-east-outer.mjs checks the cleared footprint, continuous lower
roof, upward canopy, post collisions, walkable access, Historic visibility
and an independent pre-edit snapshot of retained east-wing primitives.
The snapshot excludes the marked work and adjoining newly exposed windows;
it does not depend on concurrent edits elsewhere in the annexe.

Browser sources and the generated aerial model are updated. Unity and
Blender sources/exports are unchanged.

Validation: all 66 browser-suite scripts pass, as do compiled/source comparison,
fallback checks and every timeline stop. Source and compiled views were visually
reviewed; the generated asset's source fingerprint matches the current model.
The retained east-wing snapshot preserves 2,516 primitives.
