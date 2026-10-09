# Water tower: four-sided photo refinement

## Blocked ground doorways follow the corrected entrance — 7 October 2026

The latest owner's gameplay view, saved as
`../escape-grounds/corridor-repairs/tower-height-reference.png`, compares the
corrected black entrance with the blocked doorway on the adjacent east face.
Both blocked ground doorways (photo sides 3 and 4) now use the entrance's
Y=0 base and Y=3.52 spring, replacing Y=.30 and Y=4.15. Their existing width,
striped radial head, infill materials and shallow sill remain. All three
outer arch crowns therefore meet the same corrected height. This supersedes
the earlier decision to retain the other faces' ground-opening proportions.
Upper blocked arches, roof-contact profiles and tower height remain as
recorded in the course survey below. The shared browser source and aerial
compiled asset change; Unity/Android, Blender and packaged exports do not.

References: the user's `1.jpg`–`4.jpg`, photographed upwards from ground level, and `locationa.png`. The screenshot numbers are orientation guides only.

| Side | Outward scene axis | Distinguishing features |
| --- | --- | --- |
| 1 | +Z | Pale framed arched entrance with red/yellow brick head, large blocked arch above, two inset bricked windows to the left, pale repair at lower right, one inward-falling roof scar and red repair brickwork toward side 4 (right), left downpipe |
| 2 | -X, toward 1829 | Tall arched glazed window, small blocked opening with stone lintel above, no triangular ghosts, downpipe at right |
| 3 | -Z | Two blocked arches, one inward-falling roof scar and red repair brickwork toward side 4 (left); older brown brick at the edge meeting side 2 |
| 4 | +X, toward annexe | Two blocked arches, two inward-falling roof scars over red brickwork with patchy pale mortar, pale repair at lower left |

All four faces share the upper blind arcade: three pairs of bricked slit recesses, twin small round heads inside concentric brick arches, corner strips, a dark string course and corbelled eaves. The lower plain stage is now about three fifths of the wall height. The upper stage no longer extends almost to the ground.

## Brick colour correction, 18 September 2026

The user's `brick-colour-correction.png` identifies the descending red line as correct and the rising yellow line as absent from the photographs. This supersedes the earlier interpretation of crossing roof scars: all upward-to-centre gable outlines and their triangular colour patches are removed from sides 1, 3 and 4.

The retained shallow stepped bands use the unchanged profiles in `Browser/dist/tower-roof-profiles.mjs`, shared with the adjoining service roofs. The redder repair brickwork now ends at those inward-falling contacts, with a flat centre behind each blocked arch. It occupies the right of side 1, left of side 3 and both sides of side 4. The corners adjoining side 2 retain their older brown brick.

Dedicated red brick and pale mortar textures replace the tinted brown triangular overlays. Irregular lime residue follows individual courses, strongest at the lower right of side 4, and the blocked arches mix red, buff and darker bricks with pale joints. These weathering patterns are visual interpretations of `1.jpg`, `3.jpg` and `4.jpg`, not a photographic texture projection. The existing white repairs remain.

The correction changes colouring and removes the erroneous overlay geometry. The tower footprint, openings, retained roof scars and adjoining roof geometry stay fixed.

The existing square footprint, position, roof pitch and total height (39.05 scene units including the finial) remain. The photos do not show the roof surface; their perspective convergence is not interpreted as structural taper. Elevation dimensions and weathering boundaries are visual estimates, not surveyed dimensions.

Implementation: `Browser/dist/water-tower.mjs`. Ground-level comparison views: `aerial.html?view=tower-1` through `tower-4`, linked from the tower aerial. The model is shared by the browser aerial and walking scenes. Unity and Blender assets were not regenerated.

Validation: `Browser/test-water-tower.mjs` checks world orientation, exposed openings and scars, finite geometry and projected framing. Existing exterior and full browser checks also apply. `Browser/artifacts/inspect-tower.cjs` captures all four sides and checks browser errors.

The 18 September validation passed the full `npm test` suite, `npm run build:models` and `npm run test:compiled`. Source and compiled renders of all four sides are saved as `Browser/artifacts/water-tower-colours-{before,after,compiled}-{1,2,3,4}.png`. The before/after inspector verifies identical retained roof-scar vertex arrays, colours and tower transforms; compiled views confirm the rebuilt asset loads without fallback or browser errors. Logs are `water-tower-colours-suite.txt`, `water-tower-colours-build.txt` and `water-tower-colours-compiled.txt` in the same artifacts directory. Browser sources and generated aerial models were updated; Unity and Blender exports were not regenerated.

## Red and yellow lower arches, 18 September 2026

The follow-up `striped-arches-correction.png` marks the ground-level blocked doorways on sides 3 and 4. Photos `3.jpg` and `4.jpg` show alternating red and buff-yellow bricks radiating around their semicircular heads. Those two arch rings now have individually coloured radial bricks and aligned mortar joints, with light surface weathering. The 21-brick division is a visual estimate. The jambs, blocked infill, upper arches, earlier wall-colour correction and shared roof contacts are retained. The arch-ring geometry, opening sizes and positions are unchanged.

Arch validation: `npm test`, `npm run build:models` and `node test-precompiled-models.mjs` all pass. `Browser/artifacts/inspect-water-tower-arches.mjs` confirms exactly two striped arch rings, unchanged arch vertices and positions, unchanged roof scars, and no browser errors in the source and compiled views. The paired close-up is `Browser/artifacts/water-tower-arches-compiled-corner.png`; before/after views and validation logs share the `water-tower-arches-` prefix. Browser source and the generated aerial model were updated; Unity and Blender exports remain unchanged.

## Entrance door and level tiled repairs, 7 October 2026

The supplied entrance photograph is saved as `entrance-door-reference.png`.
It confirms a rectangular black door centred between the white side panels,
below a dark semicircular fanlight. The recent "strictly no parking" sign is
excluded at the user's request. A separate matte black leaf now sits within
narrow white jambs, with a shallow dark reveal, a left-side handle, right-side
hinges and a ground-level threshold. The small barred opening in the fanlight
is also represented. The fittings and their dimensions are visual estimates
from the photograph, not surveyed hardware specifications.

The pale tiled repair at the entrance's lower right now reaches the existing
4.1-unit top of the adjacent annexe-facing repair, replacing its earlier
3.6-unit top. Both patches use the same bottom and top levels. Their existing
widths, brick texture scale, roof scars and the rest of the tower are retained.

`Browser/test-water-tower.mjs` checks exposed leaf, handle and threshold,
separate fanlight, matching patch heights and unobscured upper tile courses.
Hardware-rendered source and rebuilt compiled views, including the shared
corner, door close-up, oblique view and phone framing, are in
`Browser/artifacts/water-tower-entrance/`. Its `inspect.mjs` uses the required
hardware launcher, verifies source/compiled geometry and exactly retained
roof-scar vertices, colours and tower placement, and reports no page or shader
errors. Browser source and the generated aerial model are updated; interior,
Unity, Blender and packaged exports are not regenerated.

### Follow-up: two inset windows, no brick step and striped entrance arch

The owner's follow-up corrects the single solid block previously representing
the left-hand openings. Two narrow rectangular brick-filled windows now follow
the same entrance photograph: a shorter opening beside the door head and a
taller opening beside the large blocked arch. Their apertures are cut through
the shaft's entrance-side skin, with brick returns and infill set 0.115 units
behind the wall face. Their positions and dimensions remain visual estimates.
The other three shaft faces are retained as solid masonry.

The broad projecting brick sill below the entrance is removed. The white
panels, jambs and black leaf now extend to ground level with a thin threshold
within the frame depth. The semicircular masonry head above the white arched
frame uses the same alternating red/buff-yellow radial bricks and mortar joints
as the lower arches on sides 3 and 4; the entrance arch centre stays fixed.
This explicitly supersedes the earlier plain entrance arch and raised sill.

Follow-up source/compiled views and validation receipts are kept separately in
`Browser/artifacts/water-tower-entrance-followup/`, including an oblique window
view. The tower check now probes both infill planes behind the shaft face,
the striped arch, ground-level door/panels and retained tiled patch alignment.

## Brick-course survey and doorway proportions, 7 October 2026

The owner's next comparison identifies the door as too tall and narrow and
asks whether the arches are too high. The same entrance photograph was sampled
along the uninterrupted brown masonry near X=264–274. Sixty-eight checked
mortar-line positions from Y=885 to 538, including faint joints missed by the
brightness detector, fit a perspective course progression with a maximum
residual of about one image pixel. Higher landmarks are checked against the
visible mortar rhythm. Counts remain approximate (typically one or two
courses), with extra uncertainty at patched brickwork and the obscured base.
The model's brown masonry and repair textures have a 0.1375-unit course pitch
(`worldUV` scale 4.4 divided by 32 texture rows).

| Feature | Photograph estimate | Model before | Model after |
| --- | ---: | ---: | ---: |
| Black door height | 24 | 31 | 24 |
| White transom above ground | 24 | 32 | 25 |
| Entrance arch crown above ground | 34 | 45 | 38 |
| Blocked upper arch crown above ground | 85 | 101 | 85 |
| Main horizontal string course above ground | 138 | 147 | 147 |

An approximate rectification using the photographed shaft corners and the
retained 10.2 by 33.8 shaft gives a black leaf about 1.28 wide by 3.37 high,
or 2.6:1. The lower-right corner is extrapolated beneath the car; this is not
a surveyed size. The raw image ratio is about 2.8:1. The model leaf changes
from 1.08 by 4.22 (3.9:1) to 1.28 by 3.35 (2.6:1): approximately 19% wider
and 21% shorter. Its jambs, panels, handle, hinges and fanlight follow the new
height, while the threshold remains at ground level and the modern sign stays
excluded. The entrance fanlight/transom is now at 3.5, with the brick arch
spring at 3.52.

On this face only, the large blocked opening starts at 5.6 with a 4.15 straight
spring height, placing its outer crown at 11.705 (about 85 courses). The two
small inset windows move to bottom levels 3.45 and 7.25, with heights 1.4 and
2.2. Both adjacent pale tiled patches end at 3.5 beside the revised transom.
These measurements supersede the earlier entrance heights and tile top of
4.1. The roof-contact profiles, tower height/position and openings on the
other faces are retained. The existing round entrance head and width leave
its crown about four courses above the photograph estimate; the unchanged
main string course also remains about nine courses above that estimate.

The checked photograph ruler, count comparison, measured geometry, before/
after source views and rebuilt compiled views are in
`Browser/artifacts/water-tower-course-survey/`. Actual geometry measurements
are read from the scene, rather than inferred from screenshot pixels.

## Footing contact with the lawn, 9 October 2026

The owner's walking screenshot, saved as `ground-contact-reference.png`,
shows the entrance/1829 corner appearing to float beside the adjoining ranges.
The tower's authored ground level is Y=0, while the estate lawn is Y=-0.15.
Its unnamed solid base was merged into decorative `BufferGeometry` before
the estate foundation pass, which accepts upright architectural primitives.
That left a real 0.15-unit gap beneath all four footing faces.

The existing 10.35-by-10.35 base is now named `Water tower brick plinth` so it
retains its box geometry until assembly. The normal foundation pass extends
only its bottom to Y=-0.18, beneath the lawn. Its top remains Y=0.5, with the
same material, footprint and texture registration above grade. Tower height,
position, openings, roof contacts and adjoining buildings retain their geometry.
This is a ground-contact repair, rather than a new surveyed tower dimension.

`test-building-grounding.mjs` probes 64 footing points across all four faces,
preserves upper vertices/UVs and checks repeat grounding. The hardware-browser
inspector in `Browser/artifacts/water-tower-grounding/` also probes the actual
submitted render geometry and captures the corner, surrounding buildings,
night lighting and phone framing. Browser source and the local compiled aerial
estate change; Unity/Android, Blender and packaged exports are not regenerated.
