# Modern car park

## Road outline — 18 September 2026

The yellow-marked screenshot requests the same pale outline around the mapped
car park and its access aprons as the surrounding roads. The saved asphalt
polygon is unchanged. A 0.6-unit border follows every concave edge, using
`ROAD_STYLE` colours, depth and rounded joins. It sits beneath the asphalt and
joining roads, so the road mouths remain open. The border is a child of the
surface and inherits its layout and timeline visibility (2010 onwards).

The browser source and local compiled aerial model include the outline; Unity
and Blender exports are unchanged. Aerial and plan checks are saved as
`Browser/artifacts/car-park-outline-*.png`.

`1829-4.kml` preserves the supplied `1829 (4).kml` byte-for-byte. Only the
placemark named **Car park** is imported. Its Polygon outer ring contains
62 distinct vertices and a closing copy of the first point. The saved LookAt
camera, styles, roads and tree placemarks do not change the scene.

`Browser/dist/kml-car-park-data.mjs` retains the exact longitude/latitude/altitude
triples. The polygon uses the same approximate `earthToScene` registration as
the existing roads and KML trees. Asphalt sits on the flat terrain at y=0.36.
All concave edges are retained; the earlier rectangular rear hardstanding is
removed. The surface appears whenever Modern is enabled, including both layouts
together, and is absent from Historic alone and gameplay.

Fourteen existing broadleaf trees intersect the mapped area or overhang its
boundary. Their trunks and all five crown instances are hidden while Modern is
enabled. Historic alone retains their original planting. Crown instances remain
batched by material. Pines, beeches and all thirteen KML oaks are preserved;
Oak1 and Oak2 are close enough for their crowns to intersect the car park.
The Trees toggle, cached shadows and walking collisions follow layout changes.

`node Browser/test-modern-car-park.mjs` checks source coordinates, polygon area
and insets, all layout combinations, crown transforms and trunk collisions.
`Browser/artifacts/render-car-park.mjs` captures the browser comparison and plan.
The browser model is updated; Unity and Blender exports are unchanged.

Validation: the car park check and browser renders pass. The full test command
contains 43 scripts: 40 pass. `test-annexe-photo-placement.mjs` (saved road
snapshot), `test-main-admin.mjs` (missing recessed-link opening), and
`test-historic-roads.mjs` (admin north road clearance) also fail with the car park
changes removed through a temporary module loader; these are existing failures.
