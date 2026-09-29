# Estate ground and mineral finishes — 28 September 2026

The owner's [ground annotation](ground-reference.png) requests texture on the
roads and gravel and less blurry grass. The subsequent request extends surface
detail to stonework and the plain white rendered walls. These are illustrative
material finishes; they do not infer new historical paving or masonry joints.

`ground-materials.mjs` shares deterministic grass, gravel and asphalt maps with
12-unit world projection. The previous grass tile covered 100 units. Fine
strokes, mipmaps and 16× requested anisotropy improve close and oblique views;
the renderer clamps anisotropy to the device limit. Road ribbons, caps, courts,
rotated lawns and instanced surfaces retain a consistent scale and alignment.
Gravel and road relief is shading only.

`mineral-materials.mjs` adds restrained porous grain to the model's stone and
render palettes. Triplanar projection covers vertical, horizontal and curved
surfaces without stretching box UVs. Authored brick, slate and boundary masonry
maps are retained, along with separately coloured timber, glass and metal.
White render remains light and continuous, without invented block courses.

The [stair annotation](stair-foot-reference.png) identifies just the two small
grass corners at the outer feet of Reception's entrance staircase. Each is
0.34 × 0.20 scene units, |x|=3.90–4.24 and z=26.00–26.20. The inner gravel-walk
outline now follows the stepped parapet footprint at the existing y=0.195.
The two larger frontage lawns, basement stair mouths and staircase geometry
are retained. The grass slivers must not be confused with those larger lawns.

Browser source and the generated aerial model are updated. Unity, Blender and
packaged desktop exports are not regenerated. Validation and screenshots use
`Browser/artifacts/ground-textures-*` and `surface-finishes-*`.

## Ground contact — 29 September 2026

The owner's walking screenshot showed daylight beneath the raised road border.
The follow-up requests an estate-wide check of roads, trees and lampposts.
Existing overlay heights are retained to preserve the approved junction and
building contacts; their exposed outlines now have vertical material faces
down to Y=-0.17, just beneath the lawn. This also closes path undersides and
raised grass-island edges, including holes and sloping transitions. The change
adds no new road traces or historical paving interpretation.

Vertical faces use unbiased depth so hidden ribbon ends cannot bleed through
the asphalt. They follow the same timeline and layout parents as the surfaces
they support. See `Browser/dist/ground-contact.mjs`, the estate-wide
`Browser/test-ground-contact.mjs`, and the `ground-contact-*` visual evidence.
