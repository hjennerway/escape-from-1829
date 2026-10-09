# East courtyard beside Redesmere — 25 September 2026

## Lean-to roof contact and grit-bin removal (8 October 2026)

The owner's [marked game view](lean-to-box-reference.png) requests removal of
the orange-circled grit bin and closure of the yellow-circled lean-to roof/wall
gap. The screenshot identifies the east courtyard corner; its marks supply no
additional modelling instructions or surveyed dimensions.

`Browser/dist/courtyard-photo-detail.mjs` removes both bin pieces at
(47.9, 3.3). The lean-to's brick sides now follow the underside of its glazed
roof, with a 0.003-unit concealed overlap to avoid numerical cracks. The
existing 0.72-radian pitch, front eave and exposed ground footprint remain.
The rear masonry and glazing extend to z=7.02 and z=7.04 respectively, joining
the existing inset wall at z=7. Roof bars follow the extended glazing. The
surrounding windows, pipes, planting and slate roofs retain their geometry.

The courtyard and roof-wall checks include 123 wall/roof contacts, rear
attachment probes, and an empty/walkable former bin footprint. They reject
the saved earlier builder. Source and compiled views, the outside-geometry
comparison and validation receipts are in
`Browser/artifacts/east-courtyard-lean-to/`. The comparison retains all
1,446,227 primitives outside the lean-to/bin areas and all 302 original slate
roof primitives. The estate-wide Jarman and Leighton/Newton snapshot records
are refreshed only after this independent comparison; their old records
match the saved pre-edit builder, and Leighton/Newton's ranges are retained.

These changes update shared Browser geometry and the local compiled aerial
asset. Unity/Android, Blender, interior assets and packaged exports are not
regenerated.

## Rear return windows and fire-exit trim (3 October 2026)

The owner's [marked courtyard screenshot](rear-window-correction-marked.png)
identifies two lower narrow windows for removal and an upper sash to lower.
The [door close-up](fire-door-trim-marked.png) locates the white floor band
crossing the upper fire-exit door. These images record the requested repairs;
their annotations do not supply additional instructions or surveyed dimensions.

`Browser/dist/rear-court-photo-detail.mjs` now retains just the upper narrow
sash beside the white stair enclosure, centred at y=6.5 to match the adjacent
row. Its width, height and wall plane are retained. The band at y=4.95 is
split around the door at x=66.4, leaving a 0.1-unit gap beside each jamb.
The existing band endpoints, wall and roof footprints, stairs and doors stay
in place. These are shared browser geometry changes for aerial, Explore
and gameplay; Unity and Blender exports are not regenerated.

The rear-return assertions in `Browser/test-escape-exterior.mjs` check the
single aligned opening, rays to the exposed wall at the removed windows,
and unobstructed door leaves and gaps beside the jambs. Reproduce the visual
views with `node Browser/artifacts/redesmere-window-trim/capture.mjs after`.

## Half-octagonal bay and recessed corner

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

## Redesmere door gallows brackets (7 October 2026)

The owner's [walking screenshot](gallows-previous-model.png) identifies the
rear-return door canopy and the matching canopy on the perpendicular wall.
The [photograph](gallows-reference.png) supplies the standard gallows form:
an upright fixed to the wall, a horizontal projecting arm and a diagonal
brace rising from the upright to the outer part of the arm. These images
are architectural references; the owner's request defines the correction.

Both canopies in `Browser/dist/rear-court-photo-detail.mjs` now have two
square-section, dark painted timber brackets. The return uprights meet the
actual wall at z=-33; the wing uprights meet x=84.2. Their arms support the
undersides of the existing blue gabled covers. This supersedes the original
round braces and hanging uprights at the outer canopy edges. The roof shapes,
door leaves, surrounding glazing and stairs retain their dimensions. Timber
sections and concealed joints are visual estimates from the small photograph.

Before/after source and rebuilt compiled views are saved under
`Browser/artifacts/redesmere-gallows/`. The exact comparison retains all
1,446,222 primitives outside the two canopy areas. These are shared browser
source changes for aerial, Explore and gameplay, with the local compiled
aerial model rebuilt. Unity, Blender and packaged exports are not regenerated.
