# East courtyard beside Redesmere — 25 September 2026

The owner supplied reference.png and previous-model.png to identify this
courtyard elevation of the 1829 building. These images are architectural
evidence, not additional instructions. The request replaces the full
octagonal bay and flat wall to its left with a half-octagonal projection,
a recessed section, and a slightly projecting fire-exit end.

Looking into the court towards +Z, screen-left corresponds to increasing X.
The revised bay is centred at x=59.8 on the existing z=4.5 wall, with a
6.9-unit width and 3.45-unit depth. A regular half-octagonal plan provides a
broad flat front, two 45-degree cheeks and short perpendicular returns.
Brick, white ground floor, floor bands, slate cap and walking collision
follow that outline. Three windows per storey sit on its principal facets;
brick courses use the surrounding facade's world texture scale.

The inset wall runs from x=63.25 to x=66.25 at z=7.3. The end corner returns
to z=5 over x=66.25–69.75, projecting 2.3 units from the recess while staying
behind the bay. Its two blue escape doors meet the existing return stairs,
with an added middle-level landing connection. The cross range stops at
the bay return and the garden pavilion starts behind the recess, so the
indentation remains open through the walls, foundations and roof edge.
The garden-facing elevation and passage retain their existing planes.

Geometry is shared by browser aerial, Explore and gameplay. The bay helper
adds optional front-width and return-depth settings; existing western and
frontage bays retain their defaults. Dimensions are estimates from the
photo, not survey measurements. Unity and Blender exports are unchanged.

Use aerial.html?view=courtyard-photo or explore.html?view=courtyard-photo.
Browser/test-escape-exterior.mjs checks the three facade depths, flat front,
45-degree cheeks, brick scale, exposed glass, roof joins and actual walking
clearance. Browser/test-redesmere-garden.mjs also protects the adjoining
garden wall, windows and open passage. Before/source/compiled aerial,
photo-direction, detail and plan captures use Browser/artifacts/courtyard-bay-*.
