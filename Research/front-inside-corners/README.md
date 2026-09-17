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
