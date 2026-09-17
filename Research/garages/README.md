# Garages and mortuary

The September 17 blue-circle correction in `tree-clearance-move.png` translates the garages, mortuary,
their aprons and paths, and the adjoining Vivienne Smith Lane stretch by
9.5 scene units in +Z, away from Main/admin. This leaves a small grass gap
outside the pine canopies. The garage origin is now (177, 108.9), and the
mortuary is approximately (165.39, 112.54). The earlier dimensions and
relative placement below are retained. Both lane junctions reconnect, with
the southern drive's first curve moving with the buildings before easing
back to its existing route. The adjacent east road returns to its existing
trace at the pine-road junction. Main/admin and all trees stay fixed.

The shared lane follows this correction in Historic and Modern; the buildings
remain Historic. Aerial and walking camera starts follow the moved buildings.
Before/after views are in `Browser/artifacts/garage-relocation-*.png`.
The canopy-envelope measurements leave at least 1.15 units between Pine1
and the lane's outside border, including all foliage detail levels. Garage,
layout, annexe-access, entrance and greenhouse checks pass. The broader
historic-road test retains its pre-existing Admin north service road/building
clearance failure at approximately (228.89, -4.52).

The original five supplied references are retained here. `locations.png` assigns the
blue area to the garages and the yellow area to the separate mortuary, south
of Vivienne Smith Lane opposite Main/admin. The red camera looks west along
the whole garage frontage in `img1.jpg`; the blue camera looks toward the
office end and mortuary in `img2.jpg`. The outlined photos identify buildings,
not material colours. The yellow camera mark on `img1-outlines.jpg` locates
the second photo.

The garage row follows the lane, with its doors facing north. From east to
west it includes twelve low bays (one with hinged double doors), a taller
gable-fronted workshop, then three garages interspersed with the two office
windows and slim glazed doors visible in photo 2. Details include pale blue
ribbed doors, handles, brick piers, stone lintels, dark rainwater goods,
slate pitches and a concrete frontage apron. Its footprint starts at
scene (177, 99.4), extends 52.5 units, and turns 5.71 degrees to follow the
lane. Most of the range is 7.2 units deep with 3.2-unit eaves; the taller bay
is 8.2 deep with 4.45-unit eaves. The eastern end clears the curved southern
drive, including its border, by at least 1.30 units.

The mortuary is centred at (165.39, 103.04), beyond the western end with a gap
between buildings. A 16.4 by 5-unit crossbar and 3.8 by 5-unit entrance stem
form a true T footprint. Intersecting slate roofs meet without overlapping
faces across the valleys. Red brick, blue entrance door, small framed
windows, two capped chimney stacks and a narrow approach complete it.
The T recesses remain open for walking.

The later `mortuary-refinement.png` correction moves the building halfway
toward the nearest lane border, halving the entrance-centre-to-kerb distance
from 14.19 to 7.09 units. It translates by (+1.39, -6.96), without rotation,
and shortens the approach path to meet the kerb. The two end walls each move
outwards by 3 units to follow the equal blue guides; their windows, roofs and
gutters follow the enlarged arms. A small blue, glazed ridge vent with a
slate gable roof matches the existing tower service buildings' blue dormers.
It occupies the marked central ridge between the retained chimney stacks.
The subsequent wider/lower adjustment increases its body width from 1.7 to
2.8 units and lowers its roof peak from 6.63 to 5.98, retaining the blue sides,
divided glazing and slate cap.

These dimensions, the exact bay count in the foreshortened first photo,
concealed rear elevations and chimney details are visual estimates. The
placement follows the annotated screenshot rather than a surveyed plan.

The browser geometry lives in `Browser/dist/garages-mortuary.mjs` and is
included in the shared exterior builder for gameplay and walking. It belongs
to Historic when the Historic/Modern layout controls are used. Existing
Unity and Blender models are unchanged.

Choose **Garages & Mortuary** in Locations. Available aerial views are
`?view=garages`, `garages-site`, `garages-plan`, `garages-1`, `garages-2` and
`mortuary`. The two numbered views follow the supplied camera directions.
Use `explore.html?view=garages`, `?view=garages-2` or `?view=mortuary` for
ground-level walking starts.

`node Browser/test-garages-mortuary.mjs` checks 5,143 roof samples, the
continuous T ridge, exact half-distance move, equal arm extensions, ridge vent, exposed doors/windows, finite geometry, road clearance,
building collisions, open recesses, camera starts and all layout states.
Browser screenshots are in `Browser/artifacts/garages-*.png` and
`Browser/artifacts/mortuary.png`.
