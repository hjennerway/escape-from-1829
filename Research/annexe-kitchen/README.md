# Annexe rear kitchen and access court — 24 September 2026

The supplied `img1.jpg` and annotated `img1-locations.jpg` look from inside
the central rear courtyard towards the annexe hall. `render.png` locates the
camera with a red dot and arrow. The circled finial is the west square tower
on the photo's right; the freestanding estate chimney is to the left in the
background. These are orientation landmarks, not requests to move them.

The user's explicit instruction supersedes the enclosed rear block inferred
from the earlier small OS extract: provide a small access road and pave the
entire courtyard. Accordingly the lawn strips in the photograph are not
copied. The building's front-facing parts remain protected.

`Browser/dist/annexe-os-refinement.mjs` now divides the rear closing range
around a roughly 4.2 m opening. A short paved access lane enters between
the retained rear ranges. The court has continuous dark paving, including
the recessed service-door approach. This is a local service lane; the four
previously removed estate-scale rear road traces remain removed.

The inner court elevation has a lower kitchen with four tall dark openings,
pale frames and heads, narrow brick piers, a broad slate roof with a long
ridge, a small lead ventilator and a weather vane. Lower side links carry
the blue doors and slatted gate. The eastern rear range stops short of the
kitchen, opening the view of its four bays. Dimensions, the exact road
opening and concealed connections are estimates within the accepted site
footprint; the photographs do not establish a surveyed reconstruction.

`annexe-rear-kitchen.mjs` supplies the photo details and paving. These remain
children of the annexe, so its Historic visibility, period dates, root scale
and placement apply to them. The source scene builds collisions from the
new masonry. The road has no lintel or roof spanning its opening. Both
earlier Oakmere photo assemblies, the spine, front courts, towers, entrance
and other ward geometry remain in place.

`protected-geometry.json` was captured before editing. The dedicated
`Browser/test-annexe-kitchen.mjs` checks 20,041 protected primitives outside
the permitted rear work, including both Oakmere assemblies. It also checks
paving coverage, roof-free access, the four exposed openings, walking from
outside into the court, stopping at the kitchen wall, and Historic visibility.
The original central frontage fingerprint remains unchanged. The older
whole-annexe and Oakmere snapshots are rebased only after this independent
preservation check passes.

Open `aerial.html?view=annexe-rear-court` for the overall revision or
`aerial.html?view=annexe-kitchen` for the photo direction. The **Annexe: rear
kitchen** location and `explore.html?view=annexe-kitchen` provide the same
ground-level start. Browser sources and the generated aerial model are
updated; Unity and Blender exports are unchanged.

## Rear-court depth correction — 24 September 2026

The later `rear-stretch-reference.png` requests the yellow-circled block 15%
longer in the blue-arrow direction, moving its two attached rear blocks and
leaving the annexe front unchanged. This supersedes the previous rear depth.

The fixed line is map z=-20, where the court meets the central spine. The
opposite court edge moves from z=-44 to z=-47.6. Every court range and its
paving use z'=-20+(z+20)*1.15; widths and heights are unchanged. The Oakmere
west court elevation follows its stretched host. Its small end rooms retain
their widths and follow the fixed front / translated rear joins so their
windows remain exposed.

The Oakmere rear service head and Leighton/Newton rear L are each translated
3.781 scene metres backwards as complete groups. Their mesh geometry, window
spacing, roof shapes, heights and angles match the pre-edit model exactly.
The short rear court connector moves with them and remains joined. Saved
photo, walking and ward views follow the changed area.

The current whole-annexe centring, front-facing parts, central spine, entrance,
towers, other wards and estate roads remain unchanged. `annexe-rear-stretch.mjs`
contains the shared depth transform. `test-annexe-rear-stretch.mjs` independently
checks the exact 1.15 depth ratio, unchanged widths and heights, fixed root
transform, preserved front geometry, both rigid rear blocks and the connector
join against `rear-stretch-before.json`, captured before this edit. The prior
rear snapshots are rebased after that preservation check passes.

This changes the shared browser source and rebuilt aerial asset. Unity and
Blender exports remain unchanged.

Validation: all 59 checks in npm test pass, as do npm run test:compiled and the source/compiled rear-court, photo, plan and front preview. The preservation check retains 16,365 unaffected primitives and all 3,011 primitives in the two rigidly moved rear blocks. Logs use Browser/artifacts/annexe-rear-stretch-; images use Browser/artifacts/annexe-kitchen-stretch-.

## Rear wall aligned to the yellow guide — 24 September 2026

The latest supplied rear-wall-alignment-reference.png supersedes the 15%
depth correction above. Its red line follows the rear closing range; the
yellow line requests the same edge approximately 70 pixels farther back.
The front remains fixed. Camera fitting uses the central-spine eave corners
and rear-range corners, giving about 1.3 pixels RMS error at 1099 × 841.
This is an image-based placement estimate, not a surveyed dimension.

The rear wall now lies at map z=-54.35, compared with -47.6 in the preceding
version. The additional 6.75 map units are 7.089 scene metres. The fixed
court-to-spine join stays at z=-20; the combined depth factor is 1.43125
relative to the original z=-44 layout. Widths and heights are unchanged.
Court paving, access lane and rear elevation details follow this extension.
The two attached rear blocks translate rigidly by the additional distance,
retaining their roofs, windows and dimensions. Their total displacement
from the original layout is 10.869 metres. The short connector stays joined.

The rear-court overview is now a fixed camera matched to the annotation,
so changing the court length no longer moves the comparison camera.
The rear eave projects to about y=642, on the yellow guide. The independent
rear-stretch test checks that target, the exact wall position, the fixed
front/root, unchanged widths and heights, and both complete rear blocks
against the original pre-stretch baseline. Its rear-only instance exclusion
extends to local z=-110 to include the longer court; the same 16,365 protected
front primitives and all 3,011 rear-block primitives still match that baseline.
The older whole-model snapshots were updated only after this check passed.

Browser sources and the generated aerial model are updated. Unity and Blender
exports are unchanged. Alignment comparison images use the fixed camera in
Browser/artifacts/annexe-rear-alignment-preview.mjs.

Validation: all 59 browser checks, compiled/source comparison, every timeline stop, and the source/compiled alignment and kitchen preview pass. The generated model source hash matches the current source. Logs and comparison images use Browser/artifacts/annexe-rear-alignment-; additional views use annexe-kitchen-alignment-after-.

## Rear side alignment and connector removal — 24 September 2026

The later `side-alignment-reference.png` supersedes the connector retention
and sideways positions described above. The red circle selects the complete
west courtyard range and its Oakmere facade. It moves nine source-map units
west, placing the yellow-marked outer eave on the blue guide. Its width, depth,
height, roof, chimney and facade details remain unchanged. The court paving
extends to the new inner wall; the existing front and back ranges still overlap
its ends.

The green circle covers the overlapping `Rear service court link` and
`Oakmere west low rear end room`. Both are removed, including their roofs,
windows and collision geometry. The pink circle selects the complete Oakmere
angled rear head. It translates ten map units along its local right direction
(x/z displacement `[10*cos(.43), -10*sin(.43)]`), aligning the orange edge
with the purple guide without changing its angle or shape. These distances
are image-based estimates, not surveyed measurements.

`annexe-rear-side-alignment.mjs` applies these translations during construction,
before exterior batching and walking-obstacle generation. The photo, aerial
and walking destinations follow their respective moved blocks. The annexe
root, front, central spine and opposite rear L remain fixed.

`side-alignment-before.json` captures the pre-edit geometry. The independent
`test-annexe-rear-side-alignment.mjs` compares 21,782 retained primitives after
undoing only the two translations, checks the two annotated lines against a
fixed fitted camera, and verifies the removed passage and extended paving.
The simultaneous east-veranda task is normalized only inside an isolated test
process; its shared-workspace source edits remain intact. Historical whole-model
fingerprints were refreshed after this preservation check passed. The original
rear-depth dimensions and wing-shape checks remain active.

Visual comparisons use `Browser/artifacts/annexe-rear-side-preview.mjs` and
`rear-side-camera.json`, with source/compiled screenshots named
`annexe-rear-side-final-*`. Browser source and the generated aerial asset are
updated. Unity and Blender sources/exports are unchanged.

Validation: the full browser suite passed, as did the source/compiled comparison,
all timeline browser checks, and both final rear-side preview views in source
and compiled modes. No page errors occurred. Logs use the `rear-side-` prefix
in `Browser/artifacts`; the compiled marked view matches both requested guides.
