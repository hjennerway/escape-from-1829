# Hale/Daresbury/Huxley/Dunham

`aerial-reference.png` is the user's oblique aerial. Red selects the new ward;
green describes its ranges; blue identifies Grafton and yellow the water tower.
The coloured marks are modelling guides, not physical features or instructions.

The ward occupies the ground between Grafton and the tower. The existing OS
spine at x=112.54..121.86 provides a ground reference. The green guide takes
precedence over the older stepped rooms: a long tower-side cross range, a
connecting spine, two unequal courtyard wings on one side, and a short return
on the opposite side nearest Grafton. The long cross range is extended to
match the green stroke. Every wall run lies on the estate X or Z axis, so all
corners are 90-degree turns in plan despite their oblique appearance in the
photograph. Concave corners form the courtyards. Placement and dimensions are
visual estimates, not a surveyed reconstruction.

The ward has two storeys and 8.4-unit eaves. It shares Irby/Ashley's sash
primitive, 3-by-6 divided glazing, pale frames and broad heads, dark projecting
sills, window proportions, brick colour, floor band and dentilled eaves. Slate
hipped roofs and brick chimneys follow the surrounding ward treatment. Hidden
elevations, entrances and roof subdivisions are inferred. Grafton, Irby/Ashley,
the water tower and the existing connecting corridors retain their geometry.

## Shortened tower-facing wings

The later `shorter-wings-reference.png` moves the three blue end walls back to
the yellow lines. From the tower-side cross range towards Grafton, the new
ends are x=145, 137 and 131, shortened by 8.6, 12 and 10 scene units respectively.
These are perspective-based estimates from the marked render. Walls, sash
spacing, eaves, slate hips and collision boundaries move together; the two
affected wing chimneys move inward onto their shortened roofs. The spine,
opposite ends and both storey heights retain their dimensions.

The two inferred Churton road approaches stop clear of the new walls and their
kerbs. Two orchard trees whose crowns intersected the cross range are removed;
the remaining tree shapes and saved modern road paths retain their values.

## Two corridor links

`corridor-reference.png` adds the two red-marked connections from the tower-side
cross range and the middle courtyard wing to the existing north/south gallery.
They follow the wing axes at z=-85.155 and z=-107.705, from the shortened ends
at x=145 and x=137 to the gallery centre at x=156.3. The third wing stays open.

Both links reuse the existing corridor builder: 5.4-unit width, 3.6-unit walls,
shallow slate pitches, brickwork and small round-headed windows. Their ridges
meet the main gallery roof, and their ward ends tuck into the taller walls.
Ground-floor sashes and gallery lights covered by the joins are omitted;
the upper ward windows remain. The links belong to the Historic corridor
group and use the same exterior collisions as the other enclosed galleries.
Geometry and placement data are in `Browser/dist/hale-corridors.mjs`.

The new group belongs to Historic and appears in browser walking/gameplay.
Collision follows the concave footprint, leaving the courts accessible. The
superseded OS marks are removed from this ward and its courts. Choose
**Hale/Daresbury/Huxley/Dunham** in Locations or use:

- `aerial.html?view=hale-daresbury-huxley-dunham`
- `aerial.html?view=hale-daresbury-huxley-dunham-plan`
- `aerial.html?view=hale-daresbury-huxley-dunham-site`
- `aerial.html?view=hale-daresbury-huxley-dunham-courts`
- `explore.html?view=hale-daresbury-huxley-dunham`

Geometry and views live in `Browser/dist/hale-daresbury-huxley-dunham.mjs`.
`Browser/test-hale-ward.mjs` checks the right-angle footprint, two storeys,
window exposure, roof coverage, open courts, walking collisions, layer
visibility and navigation. Unity and Blender exports are unchanged.
