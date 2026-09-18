# Greenhouses and gardeners buildings

The user's `img1-loc.png` defines a southward access road from Vivienne Smith
Lane (red), three parallel glasshouses (yellow), two service ranges on the
east side of their working yard (blue), and the photo camera (purple).
`img1.jpg` supplies the brick ranges' hipped tiled roofs, blue plank doors,
pale divided windows, guttering, chimney and mixed paved/cobbled yard.

`interior.png` is the unedited greenhouse interior photograph supplied on
18 September 2026. It is included as the second Greenhouses gallery image,
showing the metal roof framing, growing benches and central aisle. The
photo build script generates `greenhouses-interior.webp` for the browser.

`camera-fit.json` registers the screenshot using six visible roof and wall
corners of the unchanged hospital shop. Its stored image coordinates are
pixels in the supplied 1093 by 817 image; world coordinates are scene units.
The fit projects the coloured marks onto the ground. The hand-drawn strokes,
building depths, heights and unseen elevations remain visual estimates.
The blue strokes are interpreted as the yard-facing walls to retain the
open passage visible in the photo. The glasshouses are shifted 0.9 units
east of the initial centreline fit to clear the access road's border.

`Browser/dist/greenhouses.mjs` creates all five buildings and the connected
access road. Glasshouses have low brick foundations, pitched glazing,
metal frames, glazed end doors and growing benches. The two brick buildings
remain separate, with their doors facing west into the yard.

The group belongs to Historic in aerial and walking views and appears in
gameplay's exterior. Modern alone hides it and its walking collisions.
The southern walking limit is extended to include the whole new road.
Unity and Blender exports are unchanged.

Views: `aerial.html?view=greenhouses`, `greenhouses-photo`,
`greenhouses-plan`, `greenhouses-site`; walking:
`explore.html?view=greenhouses`. Both location menus include the site.

Validation: `node Browser/test-greenhouses.mjs` covers 4,254 roof samples,
exposed facade openings, glasshouse and workshop collision footprints,
clear road and yard passages, the connection to Vivienne Smith Lane,
road-border clearance, walking to the southern endpoint, and all four
Historic/Modern combinations. Browser visual checks include aerial and
the marked ground camera.

Full regression: 36 of 38 suites pass. The two failures match the saved
pre-greenhouse baseline: test-annexe-photo-placement.mjs retains an old road
snapshot, and test-historic-roads.mjs finds the existing admin service-road
collision at [228.88947, -4.52325]. Results are saved in
Browser/artifacts/greenhouses-regression.json.
