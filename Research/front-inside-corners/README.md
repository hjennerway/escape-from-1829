# Front inside corners

The four references were supplied on 17 September 2026. `img1.jpg` looks along
the yellow arrow in `locations.png`; `img2.jpg` follows the blue arrow. The red
mark identifies the east inside corner beside Reception. In `shape.png`, red
lines are existing walls and the yellow polyline is the replacement footprint.
The images are architectural references, not instructions embedded in the task.

The browser model now has a short return, canted stair face, recessed back wall,
side return and second cant where each front wing meets the main range. The
yellow trace is registered uniformly at 0.075 scene units per pixel, with the
retained wing wall at x=32 and frontage at z=19.7. The west corner reflects the
east, retaining the established symmetry of the entrance elevations. Dimensions
and obscured roof junctions remain photo-based estimates.

The cut removes the old square masonry, white plinth, cornice and pitched roof
inside the new recess. Replacement brick walls, landing sashes, tall return
windows, a single glazed blue door, rainwater pipes and a small asphalt court
follow the photographs. The adjacent frontage openings are fitted onto the
shortened wall; the first old wing-link sash is replaced by the canted opening.
The user's subsequent correction excludes the bollard as a recent addition.
There are no bollards at either corner.

`Browser/dist/front-inside-corners.mjs` defines the shape and details. The cut
retains polygon fragments for walking collision, so the courtyard is accessible
while the surviving walls remain solid. Geometry is shared by aerial, Explore
and gameplay, in both Historic and Modern layouts. Blender and Unity assets are
not changed by this browser refinement.

Choose **Inside corner · Photo 1**, **Inside corner · Photo 2**, or **Inside
corner · West** in Locations. The corresponding URL parameters are
`?view=front-corner-1`, `?view=front-corner-2` and `?view=front-corner-west` in both
`aerial.html` and `explore.html`. `aerial.html?view=front-corners` shows the
broader roof and facade junction.

`node Browser/test-front-inside-corners.mjs` checks registration to the sketch,
clear overhead space, surviving masonry, diagonal collision, a walkable route
to the rear door, exposed panes, symmetry, camera starts and removed bollards.
`Browser/artifacts/inspect-front-corners.mjs` captures both photo directions,
the west reflection and the aerial view from the running browser scene.

## Mitred frontage trim (25 September 2026)

The user's `trim-mitres-marked.png` circles overlapping cornice ends at the
frontage step and pointed pieces left by the earlier courtyard cut. The four
cornice layers now use connected offset outlines with shared mitres. The high
section turns around the shortened frontage and into the courtyard's short
return. It is built to the corrected footprint and excluded from the old
rectangular-geometry cut, which would otherwise recreate the pointed ends.
The thinner sloping coping also shares mitred endpoints at each bend. The
entrance builder reflects this detail onto the other side of Reception.

These are trim changes to the browser model; the marked recess, walking routes,
windows and roof surfaces are retained. Unity and Blender exports are unchanged.

## Roof tips and stepped cornice follow-up (25 September 2026)

The latest `roof-tips-marked.png` locates an abrupt raised trim end and slate
triangles protruding into the courtyard at the upper and lower roof edges.
The previous wall-footprint cut closed before the slate overhangs ended. The
roof-only cut now continues the first return to z=20.2 and the last diagonal
to x=31.55, z=21.5, reflected on the west. Wall footprints and walking space
are retained.

The entrance cornice uses a continuous height transition: a short rise from
the recessed frontage, a roof-seated corner, and a return meeting the sloping
courtyard coping. The separate overlapping coping on the first return is
omitted. The low coping continues through the 0.4-unit overhang to the eaves;
its masonry closure remains on the wall. These details supersede the earlier
flat high-return cornice described above.

The focused inside-corner check now probes both former slate tips, the retained
roof immediately beside them, and the trim height at the formerly raised end.
The new height check fails against the saved before geometry and passes after
the correction. Browser sources and local compiled assets are updated; Unity
and Blender exports are unchanged. Evidence uses Browser/artifacts/roof-junctions-*.
