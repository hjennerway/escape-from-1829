# Churton church-facing lawn cleanup — 24 September 2026

The user annotated the long hedge opposite the church in red and two pale
paving protrusions below the road in blue. Removed both `Low lawn hedge`
segments and the obsolete rectangular `Church-side lane` gravel slab from
`Browser/dist/churton-ward.mjs`. The shared road now provides that surface
without gravel extending past its curved edges. The lawn entrance walk,
buildings and remaining access paving are retained. Walking obstacles are
constructed from the resulting scene, so the removed hedge has no collision.

The source preview is `Browser/artifacts/churton-lane-after.png`.

## Remaining lawn rim correction

The follow-up annotation identified the raised lawn slab's front face and
cast shadow, which still resembled a narrow hedge. The lawn is now a flat
plane at the same surface height with shadow casting disabled; it still
receives shadows and masks the underlying gravel. The close-up preview is
`Browser/artifacts/churton-lawn-edge-after.png`.

## Parsons Lane junction tree relocation - 25 September 2026

The owner's [blue-circle/blue-X annotation](tree-move-marked.png) identifies
the first small broadleaf tree in the western roadside row, beside the
Churton/Kelsall junction. Move its root from x=-90, z=-44 to x=-82, z=-54,
on the grass between Churton and Parsons Lane. This is a screenshot-based
placement estimate, not a surveyed position.

Keep the existing 1.1 scale, trunk height and five seeded crown shapes. The
row's generation order is unchanged so every other tree keeps its geometry
and placement. Trunk and foliage are generated together at the new position;
walking collisions derive from that same geometry. The shared Trees layer
retains its existing visibility controls.

## Mast-side paving corner and seam - 25 September 2026

The owner's [blue-corner/red-line annotation](paving-corner-seam-marked.png)
identifies the small paving tab beside the church-facing lawn and the faint
line along the long mast-side approach. The three overlapping raised gravel
slabs are now one continuous, flat gravel surface at y=0.065. It receives
shadows but has no vertical internal sides or shadow-casting rim.

The corner meets the lawn at local x=-22, z=-18. The lawn extends one unit
west to meet that edge, and the paving underneath the lawn is cut back so
no pale sliver survives at the join. Building geometry, access-path outer
edges, the entrance walk and road geometry are retained. The image is visual
reference for this request, not a separate source of instructions.

These changes affect the shared browser model. Source and compiled visual
previews use Browser/artifacts/churton-paving-*.jpg; Unity and Blender exports
are unchanged.
