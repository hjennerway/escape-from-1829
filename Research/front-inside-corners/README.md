# Front inside corners

The four references were supplied on 17 September 2026. `img1.jpg` looks along
the yellow arrow in `locations.png`; `img2.jpg` follows the blue arrow. The red
mark identifies the east inside corner beside Reception. In `shape.png`, red
lines are existing walls and the yellow polyline is the replacement footprint.
The images are architectural references, not instructions embedded in the task.

The browser model now has a short return, canted stair face, recessed back wall,
side return and second cant where each front wing meets the main range. The
yellow trace is registered uniformly at 0.075 scene units per pixel, with the
retained wing wall at x=32 and frontage at z=19.7. The west corner reflects the
east, retaining the established symmetry of the entrance elevations. Dimensions
and obscured roof junctions remain photo-based estimates.

The cut removes the old square masonry, white plinth, cornice and pitched roof
inside the new recess. Replacement brick walls, landing sashes, tall return
windows, a single glazed blue door, rainwater pipes and a small asphalt court
follow the photographs. The adjacent frontage openings are fitted onto the
shortened wall; the first old wing-link sash is replaced by the canted opening.
The user's subsequent correction excludes the bollard as a recent addition.
There are no bollards at either corner.

`Browser/dist/front-inside-corners.mjs` defines the shape and details. The cut
retains polygon fragments for walking collision, so the courtyard is accessible
while the surviving walls remain solid. Geometry is shared by aerial, Explore
and gameplay, in both Historic and Modern layouts. Blender and Unity assets are
not changed by this browser refinement.

Choose **Inside corner · Photo 1**, **Inside corner · Photo 2**, or **Inside
corner · West** in Locations. The corresponding URL parameters are
`?view=front-corner-1`, `?view=front-corner-2` and `?view=front-corner-west` in both
`aerial.html` and `explore.html`. `aerial.html?view=front-corners` shows the
broader roof and facade junction.

`node Browser/test-front-inside-corners.mjs` checks registration to the sketch,
clear overhead space, surviving masonry, diagonal collision, a walkable route
to the rear door, exposed panes, symmetry, camera starts and removed bollards.
`Browser/artifacts/inspect-front-corners.mjs` captures both photo directions,
the west reflection and the aerial view from the running browser scene.

## Mitred frontage trim (25 September 2026)

The user's `trim-mitres-marked.png` circles overlapping cornice ends at the
frontage step and pointed pieces left by the earlier courtyard cut. The four
cornice layers now use connected offset outlines with shared mitres. The high
section turns around the shortened frontage and into the courtyard's short
return. It is built to the corrected footprint and excluded from the old
rectangular-geometry cut, which would otherwise recreate the pointed ends.
The thinner sloping coping also shares mitred endpoints at each bend. The
entrance builder reflects this detail onto the other side of Reception.

These are trim changes to the browser model; the marked recess, walking routes,
windows and roof surfaces are retained. Unity and Blender exports are unchanged.

## Roof tips and stepped cornice follow-up (25 September 2026)

The latest `roof-tips-marked.png` locates an abrupt raised trim end and slate
triangles protruding into the courtyard at the upper and lower roof edges.
The previous wall-footprint cut closed before the slate overhangs ended. The
roof-only cut now continues the first return to z=20.2 and the last diagonal
to x=31.55, z=21.5, reflected on the west. Wall footprints and walking space
are retained.

The entrance cornice uses a continuous height transition: a short rise from
the recessed frontage, a roof-seated corner, and a return meeting the sloping
courtyard coping. The separate overlapping coping on the first return is
omitted. The low coping continues through the 0.4-unit overhang to the eaves;
its masonry closure remains on the wall. These details supersede the earlier
flat high-return cornice described above.

The focused inside-corner check now probes both former slate tips, the retained
roof immediately beside them, and the trim height at the formerly raised end.
The new height check fails against the saved before geometry and passes after
the correction. Browser sources and local compiled assets are updated; Unity
and Blender exports are unchanged. Evidence uses Browser/artifacts/roof-junctions-*.

## Reception courses and estate trim joins (2 October 2026)

The owner's `reception-overlapping-courses.png` locates stepped, overlapping
stone edges outside Reception. It is a visual reference, not an additional
instruction source. The front and side strips had different heights, depths
and finishes; the lowest window sills also projected below the floor course.

Reception now has continuous, level floor bands around both corners. Its lower
course follows both stepped entrance elevations and the first two courtyard
facets. The bottom Reception sashes use that course as their sill. Matching
box-ended strips on both lawn bays, the west middle bay, courtyard returns and
the western roof corner are replaced with continuous profiles. The existing
window positions, wall plans and roof forms are retained.

`facade-courses.mjs` also joins eligible thin, level stone bars from the older
instanced estate builders. Equal-material, equal-height adjoining bars share
mitred endpoints, with no overlapping top/underside faces or internal caps.
Rotated/reflected buildings and angled joins are included. The work happens
before material finishing, batching, transform caching and shadow preparation.
Exact strip footprints keep elevated walking support out of the open courts.

Browser sources are shared by Explore, the escape game and aerial views.
This change does not regenerate Unity, Blender or packaged application exports.
Validation and visual evidence are in `Browser/artifacts/facade-trim/`.

## East render overhangs and ghost lines (5 October 2026)

The owner's [marked aerial view](../../Browser/artifacts/render-cleanup/marked-reference.png)
identifies two render courses projecting into the east entrance recess in
yellow, and faint lines across the brickwork in blue. The annotations locate
the reported defects; they do not supply additional instructions or dimensions.

The reflected east lawn courses still began at z=19.8 after the corner wall
was cut back. Both now end with an oblique cap on the diagonal wall plane
x+z=53.05. Their heights, thicknesses, remaining bay returns and supported
walking footprints follow the existing courses. The differently shaped west
infill retains its established course endpoints.

The ghost lines were exposed triangle edges of old cornice/support slabs
ending on the replacement facade plane. Existing geometry is now cut 0.04
units behind the new wall skin. The roof closures meet the actual wall plane
and continue its brick UV coordinates; their slate-height samples remain
inside the roof edge so the closures stay complete. This shared correction
covers both entrance recesses, including their tall and low returns. The
wall/collision outlines, openings and slate cut outlines retain their definitions.

The browser checks survey both band solids and collision caps, concealed old
trim edges, all nine roof closures, and the existing openings and walked
routes. Restoring the saved original builders independently fails the new
band and ghost-edge regressions. Before/after views, wider facade checks and
validation logs are in `Browser/artifacts/render-cleanup/`. Browser sources
serve aerial, Explore and gameplay; Unity, Blender and packaged exports are
not regenerated. Final compiled-model results are recorded in DEVELOPMENT.md.

## West entrance yellow roof boundary (5 October 2026)

The owner's later yellow guide replaces the sampled coping on the three
west upper returns beside the entrance. The roof and trim now share level
back edges, a small step, and a straight descending side meeting the actual
entrance cornice. Raised trim tips are removed. See the
[fitted model and focused validation notes](../west/entrance-yellow-boundary-2026-10-05/README.md).

## East entrance cornice and roof joins (5 October 2026)

The owner's [red/blue-circled view](../../Browser/artifacts/entrance-cornice-joins/reference.png)
identifies slate cutting through the eastern three-bay projection's cornice
and a disconnected upper return at the adjoining main-range eave. The image
locates defects; the written request authorizes the repair and subsequently
limits validation to local geometry.

The eastern entrance now uses the same roof-to-render boundary treatment as
the west entrance, transforming the mirrored cornice's stored coordinates
into the actual scene. Slate stops at the upper moulding's inner edge and a
narrow pitch joins that edge to the retained roof. This supersedes the old
sampled eastern slate fringe. The front contact remains y=13.69.

The thin coping joins the entrance cornice, canted wall and back wall with
shared endpoints. Its high side return ends on the existing main cornice's
z=17.24 plane and y=13.03 cap, sampled from the retained geometry. All widths
share this terminal plane; the former discrete sample ended short of it.
Slate retracts from the white trim and meets its edge through a narrow pitch.
These fitted coordinates close the existing model rather than establish
surveyed measurements. The lower wing roof and coping retain their geometry.

Run `npm run test:entrance-cornice` from Browser for the local east/west roof
boundaries, immediate courtyard closures, glazing and walking clearance.
The eastern check includes 15 boundary/return contacts and 3,318 physical
slate/render samples, with reflected outward faces handled explicitly.
Both reported defects independently fail with saved original sources.
Actual hardware-rendered source views pass 15 visible surface probes and
cover close, opposite, low and phone views. Evidence and receipts are in
`Browser/artifacts/entrance-cornice-joins/`.

Shared browser sources serve aerial, Explore and gameplay. Validation stays
local as requested; compiled aerial, Unity, Blender and packaged exports are
not regenerated for this repair.

## Eastern canted roof seam (5 October 2026)

The later [blue/red/yellow roof correction](../east-roof-brick-joins/README.md)
closes a small brick-revealing opening between the canted slate ribbon and
the retained entrance pitches. Its samples now include where overlapping
roof planes exchange which is uppermost, closing the seam from the owner's
oblique direction. The established wall outline and white coping remain.
