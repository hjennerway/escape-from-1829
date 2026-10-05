# West pavilion descending roof edges and render returns

The owner supplied the [court-side blue/purple guide](../../../Browser/artifacts/west-roof-render-joins/court-reference.png)
and [garden-side blue guide](../../../Browser/artifacts/west-roof-render-joins/garden-reference.png)
on 5 October 2026. The written request identifies the blue line as the
descending ridge, the purple lines as white render joining slate to brick,
and requires a similar correction on the other side. It also establishes
that no roof may pass through the middle of white render. The annotations
locate the requested geometry; they are reference evidence.

This supersedes the local stepped shoulders in the earlier
[wall-top eave repair](../roof-eaves-2026-10-05/README.md). The level main
ridge and its four branches retain their coordinates and heights. Both new
descending arrises start at (-68, 17.08, 9.25). The court-side arris ends at
(-65.6, 15.47, 6.6); the garden-side arris ends at
(-63.6, 15.47, 13.425). These fitted coordinates are modelling estimates.

The court cornice now continues around its side to the descending edge.
A solid render riser and return close the corner down to the lower y=14.53
eave; the riser's cap follows the actual adjacent roof plane. The garden
arris ends at the existing cornice termination, with another solid white
return down to the lower eave. Explicit slate triangles share each arris
and preserve the level long eaves. Their render volumes stay below the
slate, with outward-facing surfaces on both sides.
The recessed court gutter stops beyond the render riser, clearing the dark
fragment that would otherwise cross its white face.

Implementation uses `west-cross-range-roof.mjs`, the existing cornice sweep
in `west-refinement.mjs`, and the shared exterior's white material. Wall
footprints, windows, doors, stairs, the independent flat roofs and all ridge
branches retain their definitions. This applies to browser aerial, Explore
and gameplay sources. Unity, Blender and packaged exports are not changed.

The roof regression checks both descending lines, continuity on either
side, 244 physical roof/render intersection samples, ten outward render
face samples and the retained ridge/valley/eave checks. The old circled
pixels that now belong to the intended render require white rather than
slate; the remaining pixels still require slate. Matching before/after
views, baseline sources and validation evidence are in
`Browser/artifacts/west-roof-render-joins/`. Final validation results are
recorded in `DEVELOPMENT.md`.

Final shared-scene validation also exposed Float32 texture-coordinate loss
on two tiny, newly clipped entrance-west roof faces. Those two meshes opt
into local UV coordinates. Subtracting whole texture repeats preserves
the slate pattern's phase and all triangle positions/normals while keeping
the standard tile dimensions and horizontal courses accurate. The tile
survey and an independent indexed-face phase/geometry check cover this
precision correction.
