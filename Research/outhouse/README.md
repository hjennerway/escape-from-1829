# Outhouse in front of 1829

The user's three photographs define the small red-brick outhouse: img1 is
the purple entrance approach, img2 the blue view along the blank left wall,
and img3 the yellow view of the entrance and two high side windows.

The latest `junction-location.png` supersedes the red circles in
`location.png` and `roof-and-location-correction.png`. The whole building,
entrance paving, details, collisions and photo cameras move together into
the circle beside the road junction. Its front origin is x=77.7, z=96, with the existing
0.1-radian angle retained. The 8.1 by 5.1-unit footprint, 3.25-unit eaves
and 5.8-unit masonry peak remain photo estimates.

The user's roof correction places the ridge 75% across the width from the
1829-facing blank wall towards the wall with two windows. Both brick gables,
slate slopes, blue bargeboards and ridge cap follow that offset. This produces
a broad slope towards 1829 and a short, steep slope over the windowed wall.

`junction-fit.json` registers the latest screenshot against six roof and
wall corners of the unchanged Hospital Shop. The circle's approximate centre
maps to [81.77, 95.63]; the existing outhouse and road junction check this fit.
`location-fit.json` and `correction-fit.json` preserve the earlier placements.
These are visual estimates based on hand-picked image points, not surveyed
positions.

The model includes weathered boarded front openings, two dark high side
windows, an airbrick on the blank wall, a projecting brick plinth with
sloping coping, slate weathering, blue fascia and rainwater pipes, the oval
entrance lamp, front cables and entrance paving. The later user corrections
remove the long dark grey approach path and the timber fence in front of the
outhouse, leaving the grass clear.
The concealed rear is a plain brick gable. The browser exterior shares the
outhouse between Historic and Modern; it also appears in walking and gameplay.
Unity and Blender source exports are unchanged.

Choose **Outhouse** in Locations. Available aerial presets are `outhouse`,
`outhouse-site`, `outhouse-plan`, and `outhouse-1` through `outhouse-3`.
The numbered views preserve the user's photo mapping. `explore.html?view=outhouse`
starts at the yellow viewpoint; the three numbered views also work in walking.

Validation: `node Browser/test-outhouse.mjs` checks 1,066 roof samples, the
offset peak, footprint placement in the latest circle, exposed openings,
outward gable normals, road clearance, accessible photo cameras, walking
around the building, the closed doorway and all four layout combinations.
Exterior geometry, aerial layouts, walking, collision performance,
greenhouses and the modern entrance checks also pass. The aerial, site,
three photographic directions and walking page render without browser errors.

Implementation: `Browser/dist/outhouse.mjs`. Screenshot verification:
`Browser/artifacts/inspect-outhouse.cjs`.
