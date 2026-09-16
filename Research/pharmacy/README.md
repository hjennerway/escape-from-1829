# Pharmacy rear court

The latest [workshop and cylinder placement](../tower-buildings/README.md#workshop-and-cylinder-placement)
supersedes the positions below. The cylinders now stand beside the fixed chimney
at (168.5,-27.8) and (181.4,-27.8), in the space opened by moving the purple group
towards Main/admin. Their sizes are unchanged; narrow walking gaps remain around
both cylinders. The pharmacy camera views and rear stairs follow this correction.

The user supplied `img1-loc.png` to locate the rear façades, the ground-level
photo direction (red arrow), and two gas storage cylinders (yellow circles).
`img1.jpg` supplies the tall white multipane sashes, dark sills, raised masonry
stairs with pale blue railings, and the broad ribbed metal cylinder on a brick
base at the right. The circles and arrow are reference marks only.

`Browser/dist/pharmacy-court.mjs` adds details to the north-facing walls of
the existing central service hall, stepped link and long east service range.
The established building footprints, roof geometry, chimney and workshops
remain in place. Two cylinders stand in the existing paved court, at
(213, -61.25) and (199, -61.25), each with a five-unit radius. The later
spacing correction moves both 4.25 units towards the main building, centring
the row between the rear façades and workshops with roughly equal gaps.
Their total height is 11.5 units plus the thin top railing. Placement, dimensions
and hidden construction details are estimates from the references.

The two rear entrances have six masonry treads, raised landings, pale blue
railings, and solid foundations. The exterior walker remains on its existing
ground plane; these stairs are architectural detail rather than new interiors.
Tank collision footprints are circular polygons. Both lanes around the tanks
and the gap between them remain accessible. All additions belong to Historic
and share its visibility and walking collision rules.

Choose **Pharmacy rear court** in Locations, or use:

- `aerial.html?view=pharmacy` — view from the marked side of the court.
- `aerial.html?view=pharmacy-photo` — ground-level photographic direction.
- `aerial.html?view=pharmacy-plan` — check the tank footprints and access lanes.
- `explore.html?view=pharmacy` — walk from the marked approach.

The Twin workshops photo viewpoint moves to the west side of the court to
keep both workshop doors and gables visible beside the new tanks. Existing
workshop geometry is unchanged. This updates the browser game’s exterior
aerial and walking scenes; Unity and Blender exports are unchanged.

Run `npm test` in `Browser`. `test-pharmacy.mjs` verifies the new geometry,
visible glazing, clearances, circular collisions, layer toggles and continuous
walking routes; the workshop test also checks both door approaches.
