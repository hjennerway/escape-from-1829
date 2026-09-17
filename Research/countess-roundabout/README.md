# Countess Mini Roundabout

The supplied `1829 (8).kml` is preserved byte-for-byte as `1829-8.kml`.
Only the **Countess Mini Roundabout** Polygon is imported from this file.
Its eight distinct outer vertices and repeated closing coordinate are retained
at full precision in `Browser/dist/countess-roundabout.mjs`. LookAt is a saved
camera and is not placement data. Other features in the export are not imported.

The polygon uses the same `earthToScene` registration as the existing roads.
Its flat asphalt follows the exact mapped outline and matches their material.
A white centre disc sits at the polygon centroid: its 1.5-unit radius is an
illustrative modelling estimate, since the KML specifies only the outer edge.
Both surfaces are walkable and receive shadows. The polygon itself does not
specify additional road approaches; the later user-marked connection is below.

One roundabout group belongs to the shared estate in aerial and walking views.
It is visible in Historic, Modern and both together, and hidden with both off.
The Trees toggle does not affect it. Layout fitting includes its footprint.
Compiled serialization retains the shared layout reference and geometry.

`node Browser/test-kml-imports.mjs` checks the exact source ring, registration,
triangulated area, upward faces, walking clearance and all layout states.
The browser sources and local compiled aerial model are updated; Unity and
Blender exports are unchanged.

Compiled/source rendering and geometry comparisons pass. Visual checks in both
layouts confirm that the mapped asphalt meets the existing lane and the centre
marking renders above it without an obstacle. Screenshots are
`Browser/artifacts/kml-imports-roundabout-historic.png` and
`Browser/artifacts/kml-imports-roundabout-modern.png`.

## Modern approach correction — September 17

`modern-approach-reference.png` preserves the user's red-marked route. Modern
adds a curved six-unit asphalt link from Valley drive into the near side of
the roundabout and its Vivienne Smith Lane approach. The curve is an estimate
from this screenshot, with its ends anchored on the existing road centrelines;
the saved Google Earth vertices and roundabout polygon remain intact.

The link uses the existing asphalt and 0.6-unit pale borders. Its layers sit
below the roundabout surface so the borders do not cross the junction. It is
part of the Modern group in aerial and Explore, remains flat and walkable,
and disappears with Modern off. The roundabout retains its shared visibility.

`test-kml-imports.mjs` samples the marked route for continuous asphalt, upward
faces, walking clearance and visibility across all four layout combinations.
Visual checks use `Browser/artifacts/check-roundabout-approach.mjs`, with
`roundabout-approach-source-*.png` and `roundabout-approach-compiled-*.png`.

## Centred intersection refinement — September 17

The follow-up request places the roundabout in the middle of the intersection.
It supersedes the separate near-side link above: Valley drive now enters the
roundabout directly along one smooth six-unit approach. The former fork onto
Vivienne Smith Lane and the near-side bypass are removed, returning their
unused ground to lawn. All three road arms now meet within the roundabout.

The rendered Valley drive starts at the polygon centroid and follows a cubic
curve out to its fourth saved vertex, tangent to the unchanged outer road.
Its remaining five survey vertices and the full original coordinate archive
are retained. The label follows the adjusted centreline. Valley drive retains
its Modern-only visibility; the shared roundabout, painted centre and
Vivienne Smith Lane retain their positions and Historic appearance.

The continuity probes now cover all three arms and check that the removed
fork and bypass have no asphalt. The same visual-check script and screenshot
paths show this refined intersection in both source and compiled models.
