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

## Mortuary base flicker (29 September 2026)

The supplied `mortuary-base-flicker.png` shows the lowest courses flickering.
The full-height T wall and the 0.23-unit dark plinth previously occupied the
same outside planes. The brick wall now starts at the plinth top, so each
height has one exposed masonry face. The footprint, eaves, materials, UV
projection and walking outline retain their existing settings.

The mortuary regression checks all eight perimeter segments below and above
the join, including both open recesses. It fails with the overlapping model
and passes with the split wall. Before/after, compiled and walking previews
from five camera positions are saved as `Browser/artifacts/mortuary-base-*`.
Only browser sources and the local generated aerial model are updated;
Unity and Blender exports were not regenerated.

## Gable flicker and ridge-vent strip (8 October 2026)

The yellow circles in `roof-flicker-reference.png` identify the garage end,
mortuary gables and blue ridge vent. The shared roof-gap filler had generated
vertical patches in the same planes as the thin authored gables. Differing
UVs and competing depth values produced the striped, flickering patches.
The blue-marked red strip across the vent was another generated filler:
it incorrectly treated the entrance ridge cap as support for the vent roof.

These six slate roof meshes now have explicitly enclosed gables, eave bands
and undersides, joined down to their walls' existing top heights. The two
mortuary pitches share one T-shaped outer enclosure, without internal valley
partitions. The entrance gable follows the existing front slate edge at
local z=-4.2, replacing its slightly recessed skin at -4.04. Gable brickwork
uses the same planar masonry projection as the walls. Completed enclosures
are marked so the automatic filler cannot add duplicate surfaces or extrude
ridge/window fittings into supports.

The original slate triangles, pitches, red ridge caps, building positions,
walls, doors, windows, chimneys, paths and walking footprints are retained.
The source and rebuilt compiled scenes pass 216 single-surface gable probes,
72 closed-underside probes and 12 exposed vent-pane probes. The saved original
builder fails on a duplicated garage gable face. Original surfaces are
checked independently of the compiled scene's inactive window-atlas proxies.

GPU-reviewed source, compiled and walking captures are under
`Browser/artifacts/mortuary-garage-roofs/`, alongside the before/after geometry
comparison and validation receipts. Browser sources and the local compiled
aerial model are updated; Unity/Android, Blender and packaged exports are
not regenerated. Full-suite status is recorded in `DEVELOPMENT.md`.

## Shared blue lantern detailing (8 October 2026)

The subsequent [water-tower reference](../tower-buildings/blue-roof-lantern-reference.png)
refines all blue roof protrusions, including the mortuary vent. It now uses
the shared `blue-roof-lantern.mjs` model: slate-hung end cheeks and recessed
gables, pale blue bargeboards, four lights with a high transom, blue sills,
lead ridge cap and fitted base flashing. Its 2.8-unit body width, 5.98-unit
slate peak, roof extents, placement and low proportions remain unchanged.
The end gables align with the body at X=+/-1.4 beneath the retained overhang;
single-face gable probes follow that plane. All eight panes on both faces
are checked for obstruction, alongside the existing roof-join regressions.

The surrounding mortuary, garages and host slate roofs are retained. Browser
sources and the local compiled aerial model are updated; Unity/Android,
Blender, interior models and packaged exports are unchanged. See the tower
research note and `Browser/artifacts/blue-roof-lanterns/` for the shared work.
