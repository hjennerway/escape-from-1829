# Development and modelling notes

## Five random exits from fourteen candidates (September 18)

Asylum Escape now replaces the old fixed exits with the seven marked perimeter
locations on each floor: fourteen candidates in total. The central portico
escape is removed. The browser uniformly shuffles the combined candidate pool
once per page load and activates exactly five distinct routes. A floor can have
zero active exits. Pause, stairs and retry retain the same selection; reloading
draws again.

The filtered floor layouts feed door geometry, signs, green lamps, both maps,
artwork clearance, enemy spawn clearance and hold-E escape interactions. The
new gallery-end doors and signs rotate to face west/east. Floor counts, help,
the game description and the result's four remaining routes match the draw.

`node Browser/build-escape-layout.mjs` regenerates both layout JSON copies.
Only the browser game and shared navigation source data are updated; Unity,
Blender and GLB exports are not regenerated. The compiled aerial model is
unaffected because it does not include the interior.

Validation: the full `npm test` suite passes; its output is
`Browser/artifacts/random-exits-suite.txt`. The random-route checks cover 256
draws, all fourteen candidates, selection without replacement, source-data
preservation, reachability, inactive/removed exits and floors with zero exits.
Geometry checks raycast every candidate door, including the east/west ends.
The real game-loop checks cover all five selected escape interactions, disabled
locations and retry stability.

The Chrome/WebGL check `node Browser/artifacts/check-random-exits.mjs --quick`
passes five visible doors, green lamps, all five keyboard hold-E escapes,
inactive/removed exits, floor counts, artwork clearance and retry stability
with zero browser errors. Desktop maps and a side door on desktop/mobile were
rendered and reviewed. Screenshots and validation data use the
`Browser/artifacts/random-exits-` prefix.
See [the reference and candidate coordinates](Research/escape-layout/README.md#fourteen-candidate-escape-routes-september-18-follow-up).


## Pages compiled-scene navigation timeout (September 18)

The Pages verification step could stop in `page.goto()` after 30 seconds on the
full-detail front view, before reaching its 120-second rendered-frame check.
Both `test-precompiled-models.mjs` and `test-timeline-browser.mjs` now set a
120-second navigation timeout when creating their page. This also covers the
timeline reload and navigation to the walking scene. Readiness, rendering,
source/compiled image comparison and fallback checks are retained. Full-detail
results now include loading time and explicitly require compiled mode.

Validation: `npm test` and `npm run test:compiled` pass locally with Node.js 24
and Chrome using software WebGL. A separate run delayed the full-detail page's
Three.js module by 31 seconds: navigation completed in 31.53 seconds and rendered
readiness in 34.85 seconds, with every compiled-scene assertion still passing.
Logs are `Browser/artifacts/pages-timeout-compiled.log`,
`pages-timeout-slow-navigation.log` and `pages-timeout-suite.log`.

Only validation scripts and documentation changed; browser runtime, model
sources, generated assets and Unity/Blender exports are unchanged.

## Upstairs emergency exits (September 18)

The three blue-marked rear corridor ends now have usable upstairs fire escapes:
west, centre and east. `makeFloors` retains `upperFloor.exits`, so the existing
architecture, floor maps, artwork clearance and hold-E escape action all use
the same positions. Exit lamps and numbered signs are installed on both floors;
the signs have dark green backgrounds to stay legible against the pale walls.
The HUD reports exits on the current floor, and help/retry text reflects eight
routes in total. This supersedes the downstairs-only exit description in the
historical playable-upstairs notes below.

`node Browser/build-escape-layout.mjs` regenerates both navigation JSON copies.
The browser game is updated; Unity, Blender and GLB exports are not regenerated.
The aerial compiled model does not contain this interior and is unaffected.
See the [marked reference and coordinates](Research/escape-layout/README.md#upstairs-emergency-exits-september-18).

Validation: the full `npm test` suite passes, including routes from reception,
both staircase approaches, visible door geometry, lighting and actual hold-E
escape through all eight exits. The Chrome/WebGL check
`node Browser/artifacts/check-upstairs-exits.mjs` verifies all three upstairs
doors, keyboard escape, green lamps, artwork clearance, maps and desktop/mobile
views without browser errors. Reviewed screenshots, validation data and the
suite log use the `Browser/artifacts/upstairs-exits-` prefix.

## Annexe marked windows (September 18)

The red low link now has three windows; the two blue-marked pale upper panels
are regular glazed sashes. The green spine face now has six windows per floor,
using the opposite yellow-arrow face's column positions and widths. Existing
window heights, masonry and roofs are retained. See the
[window reference and preservation notes](Research/oakmere/README.md#marked-window-correction-18-september-2026).

`test-oakmere-windows.mjs` checks the counts, column alignment and exposed
glazing, and verifies that 21,625 protected primitives match their pre-edit
geometry, materials, transforms, shadows and collision flags. Only sash parts
in the three requested areas may differ. The older annexe shape snapshots are
updated after this check. Browser source and the local compiled aerial model
are updated; Unity and Blender exports are unchanged.

Validation: the complete `npm test` suite and `npm run test:compiled` pass.
Source and compiled close views of the three marked areas and the opposite
face were rendered and visually checked. The dedicated window preview reports
no browser errors. Logs and before/after images use the
`Browser/artifacts/oakmere-windows-` prefix.

## Mirrored Annexe spine roof (September 18)

The blue-marked side of the short central rear wing now mirrors the plain
hip on the yellow-marked side. The cross-gable, raised brick pediment, raking
bands and circular vent are removed; the continuous slate hip and the lower
walls, glazing and end rooms remain. See the
[reference and modelling notes](Research/oakmere/README.md#mirrored-spine-roof-18-september-2026).

`test-oakmere.mjs` checks matching exposed roof surfaces at 20 paired points,
as well as glazing and walking collisions. Its new roof assertion rejects
the previous geometry. Source and compiled browser views are captured by
`Browser/artifacts/annexe-spine-preview.mjs`. The shared browser model and
local compiled aerial asset are updated; Unity and Blender exports are unchanged.

Validation: all browser suite checks pass after updating the approved Annexe
shape snapshot, with the remaining checks resumed from the earlier snapshot
failure. The compiled/source comparison, every browser timeline stop and close
roof views pass. Logs use
the `Browser/artifacts/annexe-spine-` prefix. Concurrent Oakmere west courtyard
work has its own builder and preservation check; it retains this roof correction.

## Remove marked east lawn items (September 18)

Removed the east lawn lighting column, its arm and lamp, and the two small
iron ground fittings beside Reception from the shared browser model. The
removal applies before timeline grouping and batching, so none of the 13
periods can restore them. The mirrored architecture still shares its builder;
only the marked east fittings are omitted. See the
[owner's reference](Research/timeline-lawn-items.png).

The local compiled aerial asset is regenerated. The shared source also updates
exterior walking and the game's estate scene. Unity and Blender exports are
unchanged. `Browser/artifacts/front-lawn-items-preview.mjs` checks the three
cleared positions at every stop in source and compiled views and captures
close views in 1829, 1916 and 2021.

Validation: the full `npm test` suite, `npm run test:compiled` and the lawn
preview check pass. Source and compiled close views were visually checked.
Logs are `Browser/artifacts/front-lawn-items-suite.txt` and
`Browser/artifacts/front-lawn-items-compiled.txt`. Commands used the bundled
`C:/Program Files/nodejs/npm.cmd` because the roaming npm shim points to a
missing installation.

## Entrance projections present from opening (September 18)

Both circled three-bay projections beside Reception now appear at every timeline
stop from 1829. The original frontage boundary includes their masonry, pale
lower storeys, doors, glazing, cornices and complete slate roofs. The lower
forward wings retain their 1849 date, and the temporary east closing wall still
appears only at opening. See the owner's
[marked reference](Research/timeline-entrance-projections.png) and the updated
[timeline mapping](Research/timeline.md).

The timeline format version is incremented so older compiled scenes fall back
to source construction. The local compiled aerial model has been rebuilt.
Existing period switches continue to invalidate shadows and refresh walking
obstacles. Browser source and generated aerial assets are updated; Unity and
Blender sources/exports are unchanged.

`test-estate-periods.mjs` checks complete projection meshes, matching facade
raycasts at every stop, batched rendering and opening-period collision.
`test-timeline-browser.mjs` checks the facade in source, compiled and walking
views. The full `npm test` suite passes. Close source/compiled views at 1829,
1849 and 2021 pass without browser errors and were visually checked using
`Browser/artifacts/entrance-projections-preview.mjs`; screenshots and validation
logs use the `entrance-projections-` prefix.

The compiled-scene checks and complete browser timeline check also pass. The
compiled check used `Browser/artifacts/entrance-projections-validation/` for
its output after Windows rejected overwriting an existing comparison screenshot.
No rendering assertions were changed for that output-path retry.

## Grass beneath unbuilt sections (September 18)

Gravel, paving, low edging and raised lawn patches now follow the building
section dates in aerial and exterior walking views. Hiding a later wing exposes
the existing terrain with the same grass colour, texture and world projection
as the surrounding estate. Raised lawns disappear too, eliminating the faint
rectangular outlines left by their edges. The original inner courtyards and
Reception approach remain; the two sweeping branches wait for the 1849 wings.

Ground meshes and instances are partitioned before batching, so date changes
continue to toggle parents, invalidate shadows and refresh walking obstacles.
The compiled loader rejects obsolete timeline versions. The roof-height lookup
for the opening east wall considers all roof fragments, independently of the
new ground groups' traversal order.

`test-estate-periods.mjs` raycasts the visible surfaces at every stop, before and
after batching, checking grass texture identity and the absence of raised lawn
patches before construction. `test-timeline-browser.mjs` repeats these checks
in source, compiled and walking scenes. Close views and overviews are captured
by `Browser/artifacts/timeline-ground-preview.mjs`. Browser sources and the local
compiled aerial model are updated; Unity and Blender exports are unchanged.

Validation: the full `npm test` suite and compiled-scene comparison pass. The
dedicated ground browser run also passes every period and repeated transitions
in source, compiled and walking views, with no browser errors. The overview and
close screenshots were visually checked. Logs are
`Browser/artifacts/timeline-ground-suite.txt`, `timeline-ground-compiled.txt`
and `timeline-ground-visual.txt`. The broader timeline browser run in the
compiled log stopped at a separate projection-facade comparison introduced by
concurrent frontage work; the dedicated ground run completes independently.

## Navigation and survival help (September 18)

Aerial view now has **Back to intro** and no **Explore the asylum** navigation
link. Timeline browser validation checks the selected year on location links
and opens the walking page directly for its existing collision checks.

The intro's **How to survive** link is removed. During Asylum Escape, **H**
opens the same instructions and settings while pausing the current run, clearing
movement input and releasing the mouse. **H**, **Esc**, **P**, the close button
or **Resume** closes help and continues without restarting. The HUD and README
include the shortcut. Keyboard navigation remains available inside help.

The full browser suite and timeline browser validation pass. Updated game-loop
checks cover frozen player/enemy positions and elapsed time, repeated H, closing
help and opening it from pause. `Browser/artifacts/check-help-shortcut.mjs`
also verifies the real browser game, pointer release, keyboard settings and
resuming without losing progress, with no page errors. Intro and help screenshots
at desktop and mobile sizes (`Browser/artifacts/help-*.png`) were visually checked.

## Opening-period east wall (September 18)

The east end exposed by hiding the later wing is closed for the 1829 stop.
`estate-timeline.mjs` adds masonry across both exposed cut edges, following the
retained slate roof and reusing the neighbouring brick and pale trim materials.
The closing wall has its own 1829–1849 section, so it and its walking collision
disappear when the wing is added. Period changes use the existing shadow and
obstacle refresh. See the [marked reference](Research/timeline-opening-wall.png).

`test-opening-wall.mjs` checks outward-facing masonry across both elevations,
the roof infill, and collision before and after 1849. The estate-period and
browser timeline checks cover its visibility at every stop. Close source and
compiled views are captured by `Browser/artifacts/opening-wall-preview.mjs`.
Only the browser timeline geometry and local compiled aerial model change;
the escape game, Unity and Blender exports retain their existing geometry.

Validation: the full `npm test` suite, source/compiled comparison, and browser
timeline checks pass. The 1829/1849 close views were visually checked in both
render paths. Logs are `Browser/artifacts/opening-wall-suite.txt` and
`Browser/artifacts/opening-wall-compiled.txt`; the rebuilt manifest matches the
current model source.

## Aerial fit button removed (September 18)

Removed the Fit period button and its unused page camera handler. The timeline
and Reset view remain available; browser checks now use Reset view for portrait
framing. Desktop and mobile screenshots in `Browser/artifacts/remove-fit-period-*.png`
were visually checked, with no page errors. Aerial controls/layout checks pass.
The full suite currently fails the unrelated 1849 ground-visibility assertion in
`test-estate-periods.mjs`; compiled validation reports a stale model source hash.
No model sources or exports were changed for this UI edit.

## Passage head dated 1870 (September 18)

The circled projection beside the east garden pavilion is the western half of
the masonry passage head. The whole head, coping, white trim and supporting
jambs now appear from 1870, following the owner's
[marked reference](Research/timeline-passage-1870.png). The pavilion retains its
1849 date. A named group keeps the passage intact across the timeline's spatial
boundary; explicitly dated objects are excluded from geometric partitioning.
Period changes retain the existing shadow invalidation and walking-obstacle
refresh. The lane beneath the head remains open.

Browser source and the local compiled model were updated. The close source and
compiled views at 1849 and 1870 were visually checked in
`Browser/artifacts/passage-*.png`; the preview script is
`Browser/artifacts/passage-timeline-preview.mjs`. Unity and Blender exports are
unchanged.

Validation: the full `npm test` suite and `npm run test:compiled` pass, including
all timeline stops in source and compiled views and live walking collision
refresh. The period regression covers the complete passage, both boundary sides,
support collisions and the clear lane. Logs are saved as
`Browser/artifacts/passage-timeline-suite.txt` and
`Browser/artifacts/passage-timeline-compiled.txt`.

## Car park road outline (September 18)

The mapped car park and access aprons now have the same pale 0.6-unit edge as
the roads. The outline follows the concave KML perimeter and inherits the
surface's visibility in aerial and walking views. The asphalt footprint stays
fixed and joining roads cover the border at their mouths. See the
[car park notes](Research/car-park/README.md). The full browser suite passes;
source/compiled aerial and plan renders and period visibility were checked in
`Browser/artifacts/car-park-outline-preview.mjs`. The local compiled aerial
model is rebuilt; Unity and Blender exports are unchanged.

The compiled-scene comparison passes. The broader timeline browser check also
passes after comparing the Willows orientation by quaternion, accounting for
the compiled loader's equivalent Euler-angle representation.

## Period slider (September 18)

Aerial and exterior walking views now use 13 discrete stops: the 12 from the owner's
Google Sheet plus the requested **1829 — Opening** stop, in place of the Historic/Modern checkboxes. Dates, descriptions,
complete model coverage, provisional assignments and missing models are recorded
in [Research/timeline.md](Research/timeline.md). This supersedes the binary layout
UI described in the historical notes below. The low-level layout groups remain
for model/test compatibility; dated descendants control the current pages.

`estate-periods.mjs` holds the bundled sheet snapshot and mappings.
`estate-timeline.mjs` prepares date groups before batching, partitions east-wing
geometry and attaches the runtime controller. `timeline-controls.mjs` binds both
pages, preserves the year in navigation URLs and filters unavailable locations.
Selection, photo choices, static shadows and walking obstacles follow visibility.
The compiled scene contains the same date groups; rebuild it after model changes.

The owner's red-outlined plan assigns the original central frontage and three
rear ranges to 1829. Later side and forward wings remain separate; photo outlines
and walking collisions follow the parts present at each date. The second marked
view assigns the circled east frontage, forward arm and east/garden pavilions to
1849; the outer Barmere side and Redesmere/Saughall rear ranges remain 1870.
The water tower is
also present from 1829 by explicit correction. The Willows is rotated 90 degrees
about its existing KML centre; its views and collision footprints rotate with it.
The default date is 1916; explicit `?period=YEAR` links retain their chosen date.

Validation: `npm test` includes `test-estate-periods.mjs` for all sheet rows,
construction/demolition boundaries, building and road coverage, east extensions,
selection, walking collisions, camera/tree preservation and material batches.
`npm run test:compiled` also runs the actual browser timeline checks across every
stop in source and compiled modes, keyboard controls, reload/navigation, mobile
framing and walking collision refresh. Screenshots and results are written to
`Browser/artifacts/timeline-*`. Browser source and compiled models are changed;
Unity and Blender exports are unchanged.

The full browser suite, focused period/Willows checks, compiled-scene comparison
and browser timeline checks pass after these corrections. The 1829 and 1849 plan
screenshots and rotated Willows plan were visually checked. Validation logs are
`Browser/artifacts/opening-suite.log`, `opening-browser-tests.log` and
`opening-compiled-tests.log`.

Implementation details, validation commands and modelling history moved from the
project README. These notes include earlier interpretations that later entries
supersede; consult the linked research notes and current source for context.
Paths and commands are relative to the repository root unless stated otherwise.

See [AGENTS.md](AGENTS.md) for coding-agent guidance and the
[model build guide](Browser/MODEL-BUILD.md) for optional precompiled assets.

## The Willows (September 18)

The lower half of the supplied composite photo defines a rectangular brick
outbuilding with a weathered red pitched roof, pale lintels and three open bays.
Its footprint centre uses the exact **The Willows** Point in `1829 (9).kml`,
projected by the existing Earth registration to scene (1294.862, 387.704).
The building is a single shared object in Historic and Modern. Locations,
building selection, the photo gallery, close aerial/photo/plan presets and
Explore walking all include it. Pan and walking bounds now reach this pin;
layout fitting includes it. The existing terrain already covers the location.

The 24 x 6.4-unit footprint, heights and east-west orientation are estimates
from the photograph, since the KML supplies no footprint or heading. Actual
wall openings permit walking inside; the brick walls supply collisions.
Dark inner linings represent the unlit bays outside the estate's fixed shadow
map, retaining its current resolution and extent. See
[reference and modelling notes](Research/willows/README.md).

Validation: the complete `npm test` browser suite passes, including the new
`test-willows.mjs` checks for the exact KML Point, 960 roof samples, open-bay
access, wall collisions, distant panning, portrait/landscape fitting and all
four layout states. The binary round-trip check and rebuilt compiled-scene
suite pass. `Browser/artifacts/check-willows.mjs` checks the actual source and
compiled pages, Historic/Modern/both/neither, photo and plan views, mobile
framing and walking, without browser errors. Reviewed screenshots and logs
use the `Browser/artifacts/willows-` prefix. The browser sources and local
compiled aerial asset are updated; Unity and Blender sources/exports are
unchanged. The local npm wrapper was unavailable; the suite ran through the
installed Node.js npm CLI.

## Asylum escape footprint (September 17)

The Countess Mini Roundabout junction is centred on the circle in Modern,
in both aerial and Explore. Valley drive now curves directly into the
roundabout; the former fork and the first near-side bypass are removed.
All three arms meet inside the mapped roundabout, with six-unit asphalt and
pale borders matching the existing lanes. Labels follow the refined route.
The reference and estimated route are recorded in the
[roundabout notes](Research/countess-roundabout/README.md). The exact KML
polygon and saved road coordinates are retained. Browser sources and the local
compiled aerial model are updated; Unity and Blender exports are unchanged.
The full browser suite passes. Route continuity, upward faces, walking
clearance and all layout visibility combinations pass; source/compiled visual
checks use `Browser/artifacts/roundabout-approach-*`. The centred-junction
build and suite logs use `Browser/artifacts/roundabout-centred-*`.

The five new west-wing photographs refine the garden face, outer end and rear
court. The end now has one level cornice, a white ground storey and sparse
central glazing. Three-sided bays, wider flanking windows, the relocated fire
escape, paired lean-to windows, the lower court projection and garden paths
follow the numbered references. Five matching photo views and an aerial view
are available in Locations. See [camera mapping and modelling notes](Research/west/README.md).
The shared browser model is updated; Unity and Blender exports are unchanged.
The subsequent red/yellow correction aligns the paired-window court wall to
the fixed corner plane and deepens the lean-to to the green guide measured
from that plane. The wall's openings, trim, attached bay, roof and collisions
follow the correction; the garden face stays fixed. See the later section of
the west reference notes for dimensions and alignment checks.
The later red-guide correction shifts the lean-to right along that wall,
leaves a small open gap beside the rear arm and places its door on the exposed
side marked green. The roof, glazed bars, surround and collisions move together.
The local compiled model is regenerated. West geometry, visual comparison,
compiled/source rendering and building selection pass. The full suite and
remaining checks finish with 46 of 49 passing; the research notes record the
two existing road assertions and the unrelated Oak14/Farndon collision sample.

Oak13–Oak22 and Beech1–Beech2 are imported from `1829 (6).kml`. Both distinct
Oak16 points are retained, adding eleven oaks and two beeches. The previous
front-lawn beeches remain in place. **Countess Mini Roundabout** uses the
eight-sided Polygon in `1829 (8).kml`, with an estimated white centre marking.
All additions appear once in Historic, Modern or both. See the
[tree import notes](Research/kml-trees/README.md) and
[roundabout notes](Research/countess-roundabout/README.md).
The browser sources and local compiled aerial model are updated; Unity and
Blender exports are unchanged. Exact-coordinate import, shared tree buffers,
layout visibility, tree collisions, walkable roundabout, car park, performance
and binary checks pass. Compiled and procedural geometry/draw counts match;
visual comparisons and both-layout screenshots pass. Artifacts use the
`Browser/artifacts/kml-imports-` prefix. The full browser suite and remaining
checks were run. The known annexe photo-placement road snapshot and Historic
Admin north service road clearance failures remain; the separate west-facade
work also has a `west-refinement` building-photo catalogue assertion.
Farndon's hidden-wall probe now checks the Historic group independently of the
new mapped oak that occupies the same ground and remains visible in Modern.

The yellow-marked Hale lawn tree is removed, including its trunk collision, and
the blue-marked ground becomes a flat bowling lawn with subdued mowing stripes.
It follows the Historic layout; the adjacent trees are retained. See
[placement notes](Research/bowling-green/README.md). The local compiled aerial
model is regenerated; Unity and Blender exports are unchanged.
Visual review, compiled/source comparison, tree collisions, car park, layout
visibility and performance checks pass. The browser suite and remaining checks
were run; the existing annexe photo-placement road snapshot and Historic Admin
north service road clearance failures remain. Validation artifacts use the
`Browser/artifacts/bowling-lawn-` prefix.

Both interior floors now roughly follow the modelled 1829 core: a broad front
gallery, central reception, three rear arms, two projecting front wings and
unequal end pavilions. Barmere, Redesmere and Saughall are excluded. The rear
court gaps remain open. This replaces the older generic mirrored plan and
upstairs loop described later in these historical notes. Internal partitions,
stair dimensions and exits remain gameplay approximations.

`node Browser/build-escape-layout.mjs` regenerates the browser and canonical
JSON together. Architecture, collision, maps, room signs, lamps, pursuer spawns
and patrols follow that layout. The defeat heading is **Locked in the basement**.
The Blender generator now reads the canonical JSON instead of overwriting it
with the old plan. Unity code and `.blend`, `.fbx` and `.glb` exports were not
updated or regenerated; the aerial compiled model is unaffected.

`node Browser/test.mjs` and `node Browser/test-game.mjs` pass, including every
room and exit, both stairs, cross-floor pursuit, arrival and escape sequences.
The full `npm test` run reaches the existing road snapshot mismatch in
`test-annexe-photo-placement.mjs`; see `Browser/artifacts/escape-layout-suite.txt`.
`node Browser/artifacts/check-escape-layout.mjs` also passes in Chrome/WebGL:
reception, both maps, a real stair transfer and the basement defeat message,
with no page errors. Reviewed screenshots are `Browser/artifacts/escape-layout-*.png`.
Shape references and regeneration details are in
[Research/escape-layout/README.md](Research/escape-layout/README.md).

Frost drive's red-circled dead-end extension below Main/admin is removed from
the browser road centreline, returning the lawn to grass. Its asphalt, borders
and label anchors end at the frontage junction. The original mapped coordinates
remain in the source archive. Aerial layouts, annexe access and Modern entrance
checks pass, and the rebuilt compiled model passes `test-precompiled-models.mjs`.
Visual verification is in `Browser/artifacts/frost-drive-after.png`.
The full `npm test` run stops at the existing annexe photo-placement road
snapshot mismatch; the historic-road check also has the baseline Admin north
service road clearance failure. Unity and Blender exports were not changed.

The landing actions run left to right: **Aerial View**, **Explore on foot**, and
**Asylum escape**, with a small **How to survive** link beside the escape button.
Only **Aerial View** uses the green primary background; the other two modes use
the secondary style. The help link opens the existing instructions dialog. On narrow screens the
actions stack while the escape button and help link stay together.
The reordered menu was visually checked at 1300 × 900 and 390 × 844 with the
3D game module isolated and its ready button label applied; previews are in
`Browser/artifacts/landing-reordered-*.png`. A full game-load preview timed out.
The browser suite passes game and exploration checks, then stops at the existing
road snapshot mismatch in `test-annexe-photo-placement.mjs`. No geometry was
changed for this menu update.

In aerial view, hover over a named building, or tap it on a phone, to give it a
white glow and open its name and scrollable photograph panel. Click to keep a
selection while browsing; tap another building to change it. Close the panel
with ×, Escape, or a tap on empty ground. Dragging and pinching still navigate
the estate. The **Building photos** menu also provides keyboard access.

The gallery bundles 37 existing photographs, loaded as needed. Shared exterior
ranges list their ward names together. Where no photograph of the selected
building is available, the panel says so; any wider site views are labelled
separately. Hidden layouts cannot be selected. Selection reads the retained
structural meshes in both source and precompiled scenes and leaves building
materials, shadows and detail switching intact.

Run `node Browser/test-building-photos.mjs` for location, photo, picking and
layout checks. `Browser/artifacts/check-building-photos-ui.mjs` checks desktop
hover, touch selection, photo scrolling, keyboard access and navigation in
Chrome using Playwright. The optional photo preparation script,
`Browser/build-building-photos.mjs`, requires `sharp` on Node's module path;
`Browser/dist/building-photos/sources.json` records the original files.

The Modern car park follows the **Car park** polygon from the supplied KML,
replacing the earlier rectangular rear hardstanding. Its 62 boundary vertices
are retained. Fourteen intersecting broadleaf trees disappear while Modern is
enabled; Historic alone restores them, and the KML oaks remain in both layouts.
See the [car park import and validation notes](Research/car-park/README.md).

**Main kitchen** fills the red-marked courtyard footprint with a single storey
and three parallel white hipped roofs. Its walls meet both corridor legs;
the deeper connector is shortened and the tower stores have a stepped corner
so the buildings do not overlap. Choose **Main kitchen** in Locations for
aerial, plan, roof and walking views. See the
[placement and geometry notes](Research/main-kitchen/README.md).

The water-tower corridor now turns 90 degrees towards Irby/Ashley, aligned with
the gravel path. The three marked workshops move towards Main/admin, with the
widest shortened to keep access open. Irby's front follows the blue rectangular
footprint, flush with the extended corridor end; the yellow-marked cap is removed.
The three workshop backs now extend directly to the other side of the corridor.
Choose **Water tower / Irby corridor** in Locations for aerial, plan and walking
views. See the [placement notes](Research/irby-corridor/README.md).

Thirteen large pines and thirteen large oaks now use the Pine1–Pine13 and Oak1–Oak12
points from the supplied KMLs, including both distinct points named Oak8.
The pines replace the earlier blue-marked planting.
Each species shares one model with stable random rotations. All twenty-six appear
in Historic and Modern and follow the **Trees** toggle. See the
[KML placement notes](Research/kml-trees/README.md).

The church grounds now follow the supplied aerial reference, with four short
approach paths, a curved perimeter walk and grass pockets beside Parsons Lane.
Select **Church grounds** in Locations for aerial, plan and walking views.
The refinement appears in both layouts. See the
[reference and modelling notes](Research/church/README.md).

The rear wing roofs now have two levels: the main hipped roof and a lower
single-pitch extension. The east extension matches the west's roof shape,
and the white triangular glitch on the west hip is fixed. See the
[marked reference and geometry notes](Research/1829-back/README.md#rear-wing-roof-correction).

The back of the central 1829 entrance block now has the photographed outside
bevels, landing windows, continuous pale bands and shallow parapet. The marked
roof ridges run to the existing front apex, and the pediment is solid from
behind. The front's overall height is unchanged. Select **Central back** in
Locations for the photo direction and aerial view. See the
[reference and modelling notes](Research/1829-back/README.md).

The outhouse opposite 1829 follows the three supplied photographs and the
later red-circle correction nearer Vivienne Smith Lane. Its roof ridge sits
three-quarters of the way from the blank 1829-facing wall towards the side
with two windows. Select **Outhouse** in Locations for the aerial and three
photo directions, or open `explore.html?view=outhouse` to walk there. The
brickwork, blue trim, weathered boarding, plinth and entrance paving appear
in both layouts. [Reference and modelling notes](Research/outhouse/README.md).


## Device location in aerial mode

The crosshair button beside **Locations** requests the device's current location. Inside the estate or within 100 m of its outer edge, it places a red pin and centres the aerial view there. Farther away it shows “This only works near the West Cheshire Hospital site”. The button also explains denied permissions, unavailable location and timeouts, and can be pressed again to refresh the fix.

Location requires HTTPS (or localhost for development) and browser permission. Each press requests a fresh, high-accuracy fix; coordinates remain in the page and are not saved or sent to a server. The reported device accuracy appears with the result. The pin remains visible across layout changes. This control appears only in aerial mode.

The perimeter in `Browser/dist/device-location.mjs` approximates the whole modelled estate, including the annexe and southern grounds, from the existing outer roads. The 100 m buffer is measured to the nearest perimeter segment, with all interior points accepted. Both the boundary and the existing `earth-registration.mjs` alignment are approximate, not surveyed. Run `node Browser/test-device-location.mjs` for distance, coordinate and permission/error checks.

## Browser performance

The browser build is served from [`Browser/dist`](Browser/dist). The Unity project and Blender source are included for continued development.

Aerial mode compiles compatible opaque building pieces into material batches within their existing parents and 64-unit cells. This reduces draw submissions while retaining local view culling and independent layout switches. The original named objects remain available for material updates; walking continues to use the original collision geometry. Static scene transforms are cached, and road labels and the device-location marker remain dynamic. Material shaders are warmed asynchronously after the frontage image loads, before navigation rendering starts. Hidden browser tabs skip rendering.

Automatic building detail replaces distant rectangular window assemblies with textured panels baked from their actual panes, frames and sills. The current scene replaces 42,329 components across 2,702 windows, sharing three texture atlases. Walls, roof shapes, chimneys, special curved openings and all walking geometry remain intact. Below a conservative 40-pixel window height, panels replace the solid details; below 12 pixels, remaining tiny trim in those detail batches is also omitted. Full geometry returns above 48 pixels and medium detail above 15 pixels, avoiding rapid switches near a boundary. Selection accounts for viewport height, field of view, zoom and the nearest edge of each facade group. Shadow refreshes render the full model once and then reuse that shadow map through detail changes.

Use `aerial.html?buildingDetail=full` to compare with full building detail, or append `&buildingDetail=full` to a saved view URL. The default aerial, Main/admin and annexe comparisons submit approximately 35%, 43% and 46% fewer triangles respectively. Draw calls change only slightly; these geometry savings are not an FPS guarantee. The close front-view screenshots are identical. Run `node Browser/test-building-detail.mjs` for geometry, atlas, transition and shadow checks; browser comparisons and validation are documented in [the building-detail report](Browser/artifacts/building-detail-notes.md).

The eleven Main/admin pines share one tree template, with different rotations and their existing heights and widths. The two front-lawn beeches share another template, retaining their copper/green colours and existing locations and dimensions. Copies share geometry and GPU instance-transform buffers. Close views retain full foliage; beyond 95 and 210 units, progressively fewer planes use small baked foliage-cluster textures. A 15% return threshold prevents rapid detail switching at the boundaries. At the default aerial camera, visible tree geometry falls from 548,888 to 134,848 triangles (about 75%). The simpler surrounding trees were already using instanced crowns.

The September 17 comparison against `82e6094` at 1300 × 900 measured 6,767 → 2,711 draw calls in the default moving aerial view (60% fewer), and 5,542 → 1,712 around Main/admin (69% fewer). These are rendering workload counts, not a promised frame rate; the local browser benchmark uses software WebGL. See the before/after images and measurements in `Browser/artifacts/aerial-perf-*`. Run `node Browser/test-aerial-performance.mjs` for shared buffers, foliage detail transitions, exact per-material triangle totals across all layouts, transform caching and dynamic-label checks. The Playwright benchmark and live navigation check are in `Browser/artifacts/benchmark-aerial.mjs` and `Browser/artifacts/check-aerial-performance-ui.mjs`.

The aerial estate can now be precompiled with `npm run build:models` in `Browser`. The build runs the existing modelling code once in headless Chromium and saves final geometry, material batches, shared tree buffers, procedural textures and window-detail levels to a compressed binary in `Browser/dist/compiled/`. The browser loads those buffers and restores the layout, tree and distance-detail controls. It still renders everything locally and warms GPU shaders for the visitor's graphics driver. This targets startup work; the same scene has the same draw calls and steady-state FPS. The first visit also downloads the binary, so connection speed matters.

See [the model build guide](Browser/MODEL-BUILD.md) for setup, local comparisons and the Pages workflow. The generated assets are ignored by Git and rebuilt by GitHub Actions for each deployment. Missing, incompatible or damaged assets fall back to the procedural builders; the local server also detects changed source and skips stale binaries. Use `aerial.html?models=source` to force the original build path. Runtime changes to batched buildings still need to rebuild their affected batches and refresh cached transforms before invalidating shadows.

The exterior's fixed sunlight shadow map is rendered once and reused while walking, orbiting, and playing the arrival/escape camera sequences. Changing the Historic/Modern layouts or tree visibility refreshes the shadows; restoring a lost WebGL context also refreshes them. Shadow resolution and the full building geometry used for shadows are unchanged. Code that moves exterior geometry or sunlight at runtime must call `exterior.invalidateShadows()` afterward.

Exterior walking uses a spatial index to check nearby foundations and trunks, retaining the existing polygon collisions, wall sliding, and movement speeds. Idle movement skips collision work. Layout and tree changes rebuild the index with `walker.setObstacles(...)`. Run `npm test` in `Browser` for the navigation checks and collision comparisons across all four layout combinations.

### Asylum escape interior performance (September 17)

The interior now uses a fixed pool of 12 nearby lamps from the active floor, replacing 38 downstairs / 31 upstairs lamp lights in every material shader. `Browser/dist/interior-lights.mjs` preserves lamp positions, colours, intensity and attenuation nearby; distant lighting fades over five scene units before the first excluded lamp, capped at a 32-unit radius. Every slot stays visible (with zero intensity when unused), so crossing lamp selection boundaries does not change the shader's light count. Fixtures retain their emissive appearance throughout the building. The torch and ghost light remain independent. Floor changes refresh the pool immediately and normal rendering follows the player. Distant corridors are darker; this is a lighting-detail tradeoff, not an identical rendering.

The minimap and full map cache their static walls, stairs and exits per floor and canvas size. Refreshes copy that background and draw moving markers; the hidden full map does no drawing. Hidden browser tabs skip rendering. Navigation, geometry, pursuer behaviour, artwork, resolution and cutscene timing are unchanged. Only browser runtime sources changed; Unity, Blender, GLB and aerial compiled models were not regenerated.

Run `node Browser/test-interior-lights.mjs` for the light budget, floor isolation, nearest-light brightness and smooth selection boundary checks across every walkable cell. `node Browser/test-game.mjs` also checks map reuse, hidden-map/tab work and gameplay transitions. The full `npm test` command includes these checks. This working-tree run passed 45 of 47 checks; the existing failures are the `test-annexe-photo-placement.mjs` road snapshot and `test-historic-roads.mjs` Admin north service road clearance assertions. Those tests do not import the changed runtime modules. The rest of the suite was run separately after the first failure. Logs are in `Browser/artifacts/escape-performance-suite*.txt`.

`node Browser/artifacts/benchmark-escape.mjs before` / `after`, from the repository root, compare a saved pre-change game source with the current one using local Chrome and software WebGL at 1000 × 700. External historical photos are blocked consistently; local artwork is loaded. Reception, gallery and upstairs median frame intervals fell from 266.8 / 283.4 / 266.7 ms to 100.1 / 116.7 / 116.7 ms (56–62% less). Map CPU submission time fell from approximately 0.6 ms to 0.005–0.016 ms per refresh. Geometry and draw-call counts match in all three views. The JSON results and visually checked before/after screenshots are saved under `Browser/artifacts/escape-performance-*`. These local software-renderer timings establish reduced work, not a hardware FPS guarantee.

## Historic and Modern aerial layouts

The aerial preview has separate **Historic** and **Modern** checkboxes. Historic starts on and Modern starts off. Either, both, or neither can be visible. Shared 1829/Redesmere geometry, the water tower, Churton and church appear once whenever either layout is on. The Annexe, Main/admin building, its connecting corridor and the freestanding chimney belong to Historic. Existing shared grounds and site context follow the shared group; switching both layouts off leaves the terrain.

Modern includes fifteen saved Google Earth paths: Upton grange, Gerrard Crescent, Frost drive, Vivienne Smith Lane, Ross Avenue, Ross Avenue (Part 2), Upton Grange (Part 2), Lockwood View, Warren Lane, Parsons Lane, Parsons Lane (Upton Lea), Parsons Lane (1829 Central), Valley drive, Parsons Lane (North) and Caldecott Close. Vivienne Smith Lane and all four Parsons Lane sections, with their labels, also appear in Historic, using the same single copies when both layouts are enabled. Each path has a camera-facing road-name label anchored to its centreline; the text stays readable while orbiting and zooming and follows its road’s layout visibility. **Fit layouts** frames all currently visible buildings and roads; ordinary toggles retain the camera for comparison. Expand **15 mapped paths** to see the road names. The layout controls are available throughout the aerial preview and exterior walk. Gameplay retains the existing estate. Press **T** to toggle the **Trees** layer, which starts visible.

The paths are bundled locally from the shared Google Earth project, with all 159 saved vertices retained and registered to the fixed 1829 anchor. Road widths are approximate. See [road provenance and layout details](Research/modern-layouts.md). Run `npm test` in `Browser`; the suite includes all four layout combinations, unchanged transforms, road geometry and landscape/portrait fitting.

Historic and Modern roads share grey asphalt, pale 0.6-unit borders, and rounded joins and ends. Parsons Lane retains its saved vertices. Vivienne Smith Lane follows the September 16 red-marked route across the lawn south of Main/admin, with its western fork moved back to the start of the marked line. Both layouts, labels, junctions and clearance use the refined centreline; the original Google Earth coordinates remain available as source data. Historic roads are trimmed against the complete saved paths, including both roads' borders and end caps, so they do not overlap either lane.

## Historic roads from the marked layout

The supplied `roads/layout.png` and `roads/layout.-annotated.png` now define the Historic road network. Only the red-selected routes and the shared Parsons Lane / Vivienne Smith Lane remain as roads. Blue identifies the semicircular Main/admin forecourt, yellow the narrow teardrop, purple Main/admin, green the water tower and pink its existing service buildings. The road curves are fitted around the established buildings; the photographed plan is not treated as a surveyed projection.

The Main/admin forecourt has a straight frontage and one semicircular drive around a D-shaped lawn. The adjacent teardrop is slender and points towards the northern junction. The northern perimeter, ward approaches, tower courts, annexe avenue and southern drive follow the new trace. The previous full roundabout, extra annexe loops, garden/parking/entrance aprons, extended diagonal and outer eastern spur are removed. The sweeping Reception driveway from Vivienne Smith Lane is shared by Historic and Modern, as clarified by the user. The tower service buildings retain their positions, with road clearance around their walls and the neighbouring Estates department.

Use `aerial.html?view=historic-roads` for the whole network or `?view=historic-admin-grounds` for the closer comparison. Source images and reconstruction notes are in [Research/historic-roads/README.md](Research/historic-roads/README.md). Route data, clearance and rendering are separated in `historic-road-layout.mjs`, `historic-road-clearance.mjs` and `historic-roads.mjs`. The road tests check both saved lanes across every ribbon's full width, building clearance, semicircle/teardrop surfaces, removed routes and all layout combinations. This layout supersedes the earlier alarm-board and aerial road revisions.

The latest annexe annotation keeps the red-circled asphalt forecourt intact and narrows its sweeping entrance to a slim neck with a smooth flare onto the avenue. The frontage side approaches and yellow-circled rear roads, junction mouths and hardstanding are removed. The red-circled Main/admin road ends form continuous junctions, the teardrop has a smooth inner lawn edge, and the northern estate boundary connects around the annexe to Parsons Lane (North). These surfaces belong to Historic. Use `aerial.html?view=annexe-access` or `?view=annexe-entrance`; see the [current frontage notes](Research/annexe-frontage-adjustment/README.md).
### Annexe wards

The colour-matched OS map supplies the approved side wards and rear blocks,
including the separate front courts and open rear courtyard. The later rear
aerial supplies its overall setting. The user's subsequent review sets the
whole annexe to 72% of the OS footprint's width and depth, 12.5% larger than the
first aerial fit, and brings it closer to the red frontage line. Heights and
detailed shapes are retained. It fits inside the Parsons loop and clears the
teardrop. See the [current placement and frontage](Research/annexe-frontage-adjustment/README.md),
[initial aerial correction](Research/annexe-photo-placement/README.md)
and [OS shape comparison](Research/annexe-os-refinement/README.md), or open
`aerial.html?view=annexe-plan`. The **Annexe / Main · aerial photo** location
shows the wider relationship. This supersedes the earlier dimensions and
placement described below.

The OS correction aligns the annexe's central frontage using the fixed church,
Churton and Grafton/Edge, preserving its dimensions. The later road annotation
moves the frontage avenue to the red line, translates the teardrop intact toward
Main/admin and adds the yellow gravel path. The central sweeping entrance is
reconnected; both front-side approaches are removed. Buildings and rear access
remain fixed. See the [alignment and validation notes](Research/annexe-placement/README.md),
or open `aerial.html?view=annexe-roads` for the updated road layout.

The later overhead correction moves the east rear pavilion to the inner side of its link, roughly matching the blue-marked position. The yellow-marked Leighton/Newton connecting leg is 40% shorter, with its end pavilion moved inward to retain the L and the existing 22-degree angle. Roofs, windows, chimneys and walking collisions follow the revised footprints. These changes apply to the browser model; the Blender and Unity exports are unchanged.

The supplied Oakmere lawn photograph now refines the central rear range with a taller two-storey elevation, a central gable and circular vent, divided sash windows, brick bands and low end rooms. The circled belfry and tower retain their geometry, as do the earlier front and side details. Choose **Oakmere lawn elevation** in Locations, or open `aerial.html?view=oakmere-photo`. See [reference and preservation checks](Research/oakmere/README.md).

The annexe is divided into five named ward groups from the [supplied marked view](Research/annexe-wards/ward-reference.png): **Larkton/Jodrell** (yellow, west outer wing), **Tarvin/Jarman** (blue, west courtyard), **Leighton/Newton** (red, rear east L), **Oakmere** (purple, rear service block), and **Picton/Carden** (green, east courtyard). Each has its own **Locations** entry in the aerial and walking views. The colours identify the reference areas; the original brickwork and slate materials are retained.

Ward groups own their existing walls, roofs, windows, trim and chimneys. The west outer frontage and its short court link belong to Larkton/Jodrell, including their photo selection and highlight. The central buildings, east connecting range and unmarked east end remain under The annexe. Geometry, placement and walking collisions are unchanged. Use, for example, aerial.html?view=tarvin-jarman or explore.html?view=oakmere.

### Archived OS building footprints

All brown ground outlines traced from the OS map have been removed from the scene. The source images, saved contours and registration remain available as modelling references in `Research/historic-footprints/`, `Tools/trace_historic_footprints.py`, `Browser/dist/historic-footprint-data.mjs` and `Browser/dist/historic-footprints.mjs`.

A single scale-and-rotation fit anchors Reception and checks the chapel and Churton, accounting for the map's different orientation without moving the estate. The two check landmarks agree within six scene units; the low-resolution scan and model placement make the saved contours approximate. Existing buildings still use the OS reference data for placement, and road checks retain the building-footprint metadata.

Choose **Historic site plan** in Locations, or use `aerial.html?view=historic-footprints`, for the existing overhead view without the brown markers.

## Front boundary and entrance

The front inside corners now follow the supplied yellow footprint: recessed
brick returns, angled stair faces, tall sash windows and blue rear doors. Both
entrance corners share the refinement and remain accessible in Explore. The
recent bollards are omitted. Choose **Inside corner · Photo 1 / Photo 2 / West**
in Locations, or use `aerial.html?view=front-corners`. See the
[reference and geometry notes](Research/front-inside-corners/README.md).

The blue-marked frontage correction moves the wall and hedge continuations to z=74, keeping their orientation and central opening. This leaves approximately one six-unit road width of grass between the boundary and the fixed Vivienne Smith Lane. The lawns and Reception approach extend to the moved wall.

The sweeping, flared asphalt entrance is shared by Historic and Modern, using one copy alongside Vivienne Smith Lane. Its grey asphalt and pale kerbs match the roads in both layouts. A 26-unit-diameter semicircular paved forecourt now sits directly outside Reception, as clarified for the pink-marked area, with its flat side facing the door and its rounded edge opening onto the central approach. The curved edging leaves the approach open.

Matching gravel paths now branch from both sides of Reception's semicircle,
with small sweeping joins onto the entrance wall walks. Those walks widen from
1.2 to 2 scene units, continuing around the forward wings to the west fire exit
stairs and the Redesmere courtyard on the east. The forecourt kerb opens at
both new junctions. These paths appear in both aerial layouts and Explore.

Use `aerial.html?view=front-entrance` to inspect the forecourt, gate, grass verge and junction together. Reference: `Research/front-entrance-annotated.png`. Dimensions remain photo-based estimates. The saved lane vertices and building locations are unchanged. The wall and forecourt also appear in walking/gameplay; the mapped lane junction belongs to the aerial layouts. Unity and Blender exports are unchanged. `Browser/test-modern-entrance.mjs` covers the shared curve, verge width, forecourt shape, surface continuity and clear gate-to-door walking access.

## Hale/Daresbury/Huxley/Dunham

The new two-storey ward follows the green range arrangement in the supplied
aerial between Grafton and the water tower. Its footprint is squared to the
estate axes, with a long cross range, a connecting spine, two courtyard wings
and an opposite end return. It uses Irby/Ashley's multi-pane sash windows,
brickwork and slate-roof treatment. Select **Hale/Daresbury/Huxley/Dunham** in
Locations for aerial, plan, courtyard and walking views. It belongs to Historic;
the courts remain accessible. See [reference and modelling notes](Research/hale-daresbury-huxley-dunham/README.md).

The September 17 Daresbury photographs refine all seven inward wall joins with
canted two-storey sash bays, stone bands, dentilled eaves, rainwater pipes and
small slate entrance canopies. Generic windows near the new details are
omitted to keep their surrounds separate. Photo 1 and Photo 2 comparison views
are available in the ward navigation (`hale-corner-photo-1` / `-2`) and Explore.
Additional polygonal collisions follow the bays and leave the door approaches
open. Geometry is photo-estimated; the supplied boarded windows and decay are
not copied into the historic setting. Browser source and compiled aerial
assets are updated; Unity and Blender exports remain unchanged.

Validation: the extended `test-hale-ward.mjs` checks all seven corners, exposed
sashes, separated window heads, roof coverage, entrance approaches and bay
collisions under Historic visibility. The 47-command browser suite and its
post-failure continuation passed 45 checks; `test-annexe-photo-placement.mjs`
fails its unrelated saved road-array comparison, and `test-historic-roads.mjs`
fails Admin north service road clearance at (228.889, -4.523), outside this ward.
The rebuilt compiled scene passes `test-precompiled-models.mjs`, including
source/compiled image and draw-count comparisons. The corner inspection script
in `Browser/artifacts/inspect-hale-corners.mjs` captures both photo directions,
the courts, plan, walking and mobile. Portrait photo views preserve eye height,
and the ward links sit below the mobile toolbar.

## Hospital Shop beside Redesmere

The white single-storey Hospital Shop block follows the blue footprint in the supplied reference view, with a fully hipped slate roof and seven high multi-pane windows along the garden-facing wall. A narrower brick corridor with a flat roof follows the green footprint and joins its rear to the existing Redesmere-to-Main/admin range. The ivy-covered range and chimney retain their positions.

Choose **Hospital Shop** in Locations, or open `aerial.html?view=laundry`, `?view=laundry-photo` or `?view=laundry-plan`. The building follows Historic visibility and appears in browser walking with solid collisions. Placement, dimensions and concealed faces remain visual estimates. References and modelling notes: [Research/laundry/README.md](Research/laundry/README.md). Unity and Blender exports are unchanged.

## Pharmacy rear court

The latest yellow/purple annotation moves the three workshops towards Main/admin,
aligning their rear beside the fixed Irby end with a narrow roof clearance.
The purple service group also moves towards Main/admin, opening just enough room
for both gas cylinders beside the fixed chimney at the blue marks. Building details,
stairs, ramp, camera views and walking collisions follow the new placement.
See [the placement correction](Research/tower-buildings/README.md#workshop-and-cylinder-placement).

The service court now includes the photographed rear sash windows, two raised masonry stairs with pale blue railings, and two large ribbed gas storage cylinders on brick bases at the yellow-marked locations. Select **Pharmacy rear court** in Locations, or open `aerial.html?view=pharmacy` and `explore.html?view=pharmacy`. The additions follow Historic visibility, with solid foundations and accessible paths around the cylinders. The existing roofs and building footprints remain. See [reference and modelling notes](Research/pharmacy/README.md).

## Tower service buildings

The red-circled western workshop is duplicated into the yellow-marked footprint
at 1.5 times its original width and depth, retaining the same overall height,
roof, blue dormer and facade details. Its rear edge aligns with the original workshops. Open
`aerial.html?view=tower-workshop-copy` for the updated view.

The latest `towerbuildings2` reference turns the detached yellow-marked building into two adjoining gabled workshops, moved outward along the blue arrow. Their two roof slopes face the tower and Estates; the yard fronts have the photographed blue doors and three upper windows. The purple hall is shortened towards Main/admin to open the marked viewpoint. Choose **Twin workshops** in Locations, use `aerial.html?view=tower-twin-gables` for the photo comparison, or `explore.html?view=tower-twin-gables` to walk there. See the [reference and placement notes](Research/tower-buildings/README.md#twin-workshop-gables-and-cleared-photo-viewpoint).

The Historical layer now includes the adjoining brick service ranges, mixed slate and flat roofs, blue roof ventilators, stores doors and the ramp shared by `tower_buildings/img2.jpg` and `img3.jpg`. Three adjoining ranges meet the tower, leaving the 1829-facing wall clear. The corridor begins one third into each north/south face, with a flat strip in front of the upper arch and a shallow pitch touching only the final third. The marked roof correction puts two blue dormers on the east-pointing range nearer the chimney and one on the central hall, all aligned with their host ridges. The stores now run north/south with a flat front section and a hipped ridge against the tower. The three blue-traced photographs fix the contacts: a right-hand slope on the white-door face, a left-hand slope on the opposite face, and two inward-falling slopes on the face away from Redesmere. Their flat centres and shared corner heights now agree with the wall marks. Img3 also refines Main/admin's low east end with angled corners, tall sash lights and a matching hipped roof. The service-road approach curves into a paved court beside the ramp. The blue-circled block in img4 is now modelled separately as Irby/Ashley.

Choose **Tower buildings** in Locations, or open `aerial.html?view=tower-buildings`; photo views 1-4 and a plan are available there. The saved OS trace anchors the ranges; concealed divisions and dimensions remain estimates. Sources and modelling notes: [Research/tower-buildings/README.md](Research/tower-buildings/README.md). New service geometry and roads belong only to the Historical aerial layer; Unity and Blender exports are unchanged.

## Main/admin building

The connecting corridor now branches north at 90 degrees, past the water tower
and through its service ranges to Farndon. A diagonal corridor follows the later
red route to Upton/Frith/Oscroft, with side branches into Grafton/Edge and Witby.
The links share the existing low brick and slate treatment and follow Historic
visibility and exterior walking collisions. Choose **Farndon corridor** or
**Ward corridors** in Locations, or open `aerial.html?view=ward-corridors`.
See the [marked routes and modelling notes](Research/admin-corridor/README.md#farndon-and-ward-extensions).

The paired main_refine3 photographs correct the same Main/admin corner from the annexe end and rear court. The blue-marked wing now has a steep three-sided hipped room with paired sashes, a lower recessed link, and an upper return behind. The flat end seen in img1 is the side of the existing red-marked court block seen front-on in img2; the duplicate room is removed. The accepted rear frontage and hipped stair bay retain their positions and front windows. The green-circled structure is excluded. Use `explore.html?view=main-admin-annexe-end` and `?view=main-admin-rear-court` for the yellow- and blue-arrow directions; these walks include the existing Historic service buildings and court. The same presets work in `aerial.html`. See [paired reference notes](Research/main-refine3/README.md). Dimensions and concealed joins remain photo-based estimates.

The Main/admin building stands east of 1829/Redesmere. `Browser/dist/main-admin-building.mjs` uses the supplied `midwifery-school/os.png` for its central range, two projecting end pavilions and low west rooms. The OS silhouette takes precedence over `scale.png`; coloured circles and camera arrows are reference annotations only. Pixel scale is estimated against the existing estate with Reception as the origin, so placement and dimensions are approximate rather than surveyed.

The four photographs guide the three-storey red-brick facade, two-storey window bays, sash glazing, pale stone trim, central pediment, columned portico with ball finials, slate hips and tall chimney stacks. Photo 1 looks north from the lawn; photo 2 looks west along the frontage from an elevated position; photos 3/4 look east from the western approach. Concealed rear/east elevations are inferred, and gravel approaches retain the estate's circa-1900 treatment.

The main_refine correction gives both front window bays 45-degree chamfered corners, with glazing, stone bands and lead caps following the angled faces. The low west rooms now step back into a narrower, lower-roofed connection beside the tall pavilion, following new-shape.png and front.png: three windows on the projecting outer room and one on the recessed connection. Walking collisions follow the cut corners and leave the new recess open.

The east elevation now follows chimney/img1.jpg, with chimney/img1-loc.png locating the southeast camera looking northwest. The inferred window grid is replaced by one upper sash column, separate ground-floor openings, two side chimney breasts/stacks and a low hipped-roof wing with a recessed connection. Curved gravel approaches follow the photographed circulation. Open aerial.html?view=main-admin-east or explore.html?view=main-admin-east for the comparison.

The freestanding brick chimney in Browser/dist/estate-chimney.mjs is placed at x=180, z=-31, estimated from the latest red X on the user-supplied aerial screenshot, on the lawn between the water tower and Main/admin building. It has a tapered shaft, soot-darkened rim and an open throat. Its total height is exactly 1.3 times ESCAPE_WATER_TOWER.height (50.765 scene units at the current tower height). Position and diameter remain screenshot estimates; the chimney is an independent scene group.

The black OS connection is an independent group, **1829 to Main/admin connecting corridor**. The supplied winter painting now guides its warm red brick, small windows with semicircular heads, pale masonry surrounds and projecting sills, fine divided glazing, shallow slate roof, brick eaves and dark rainwater goods. The later red-marked photograph corrects the first 60% of the exposed connection from Redesmere to a deeper single-storey building with a raised hipped slate roof, stepping down to the remaining narrow corridor at the admin end. The front wall alignment and short concealed joint remain; extra depth extends northwards. The ivy-fronted Redesmere range and its adjoining chimney are unchanged. Walking collision follows the new walls. Roof proportions, window spacing and concealed elevations are estimates; see `Research/admin-corridor/README.md`. Open `aerial.html?view=main-admin-corridor` or `explore.html?view=main-admin-corridor` for a close comparison. The reference is saved in `Research/admin-corridor/winter-corridor-reference.png`; geometry is in `Browser/dist/admin-corridor-detail.mjs`. The escape pan includes the new building and retains the mast and water tower.

Open `aerial.html?view=main-admin` for an aerial, `?view=main-admin-plan` to compare with 1829, or `?view=main-admin-1` through `?view=main-admin-4` for the photographs. The four presets also work in `explore.html`; `explore.html?view=main-admin` starts on the western approach. Photo 2 retains its elevated height. Run `npm test` in `Browser`; `test-main-admin.mjs` covers placement, exposed glazing, roofs, photo starts, collisions, separate corridor ownership and landscape/portrait pan framing. Browser geometry is updated; Unity and Blender exports are unchanged.


The outer east elevation of Redesmere follows `redesmere.jpg`, with `redesmere-loc.png` locating the westward view from the lawn and `redesmere-render.png` showing the previous model. It now has two canted brick bays, a pale green central entrance with a gabled canopy, fine sash windows and splayed stone heads, pale floor bands, slate roofs, tall chimney stacks and a low side room. The garden border and iron railing follow the established circa-1900 treatment; trees leave the marked sightline clear. The inner courtyard details and access routes remain in place. Open `aerial.html?view=redesmere-photo` for the comparison or `explore.html?view=redesmere-photo` to walk from it. Geometry is in `Browser/dist/redesmere-photo-detail.mjs`; dimensions and obscured details are visual estimates. The Unity and Blender exports are unchanged.

Escape the 1829 building in Chester while Security and the Deva asylum ghost search the corridors.

Sylvia has been removed from the browser game and Unity C# sources, including
her spawn, model details, pursuit behavior, instructions and map legend. Security
and the Deva asylum ghost retain their existing type IDs, spawn positions and
behavior. The menu now lists two pursuers. No Unity or Blender binary exports
were regenerated. The browser game-loop check verifies the remaining roster and
continues to exercise the ghost's staircase pursuit and both floors.

Validation: `node Browser/test-game.mjs` passes. A live Chrome/WebGL check
confirmed the two-character roster and visually checked the menu, instructions
and floor map (`Browser/artifacts/two-pursuers-*.png`), with no page errors.
`npm test` stops at the existing road-layout assertion in
`test-annexe-photo-placement.mjs` (also recorded in
`Browser/artifacts/irby-baseline-results.json`); that geometry is unrelated to
the character removal. Unity was not compiled or run.

## Building arrival (browser)

The two mature front-lawn trees follow `trees/img1.jpg` and the yellow crosses in `img1-loc.png`. They stand at approximately x=13, z=61 and x=-13, z=62, either side of the central approach. Their broad bronze-green crowns, substantial branching trunks and fine leaf sprays belong to the **Trees** layer. Choose **Front lawn trees** in Locations, or open `aerial.html?view=front-lawn-trees` / `explore.html?view=front-lawn-trees`, for the view from the red camera marker. Placement and dimensions are photo-based estimates.

The four Redesmere timber planters and east corner shrub bed have been removed, along with the H shortcut. All estate trees, including trunks, branches and crowns, belong to a separate **Trees** layer, visible by default. Press **T** in the aerial view, exterior walk or game to show/hide them. Hidden trees do not cast shadows or block walking.

The menu's **Explore on foot** button opens a ground-level exterior walk at `explore.html`. Use WASD to move, mouse look (or click and drag when mouse capture is unavailable), Shift to move faster, and Escape to release the mouse and pause movement. The top-right **Locations** button opens the same popup as the aerial view, with walking destinations, an **Entrance** link and links to aerial plans. **Back to game** returns to the menu. **Historic** and **Modern** use the aerial layout visibility rules: Historic starts on, Modern starts off, and either, both or neither can be shown without moving the camera. Walking collisions update with the visible buildings and trees. Losing focus clears movement keys. The exploration page uses bundled Three.js and runs independently of the interior game.

Starting or restarting holds the aerial estate view for 1 second, then rushes the camera toward the central front door while fading to black over 1.5 seconds. It switches to the ground-floor Reception spawn at full black, then fades back in over 0.5 seconds, completing the intro in 3 seconds. Controls, pursuers and the gameplay timer remain frozen until the reveal finishes, preserving the full five-second head start. Hidden tabs suspend the sequence; reduced-motion mode uses a still exterior with the same fades and timing.

The intro and escape ending share the Three.js estate in `Browser/dist/escape-exterior.mjs`. Its central frontage includes three bays of sash windows, stone bands, four Ionic entrance columns, steps and a red panelled door. The triangular pediment maps the actual blue dragons and gold coat of arms from the supplied `Browser/dist/exterior/1829front.webp` photograph. The earlier standalone frontage in `Browser/dist/exterior.mjs` is no longer loaded by the game. Dimensions are visual approximations, not a measured survey. Repeated architectural trim is instanced, and the exterior renders separately from the interior. This browser addition does not require Blender; the Unity scene and existing binary exports have not been changed.

Camera choreography and timing are isolated in `Browser/dist/arrival-cutscene.mjs`. Run `node Browser/serve.mjs` from the repository root to preview at `http://127.0.0.1:1829`. The game-loop checks include arrival timing at low frame rates, both fades, Reception placement, frozen gameplay, restart and reduced motion.

## Reception stairs

The left staircase is based on the uploaded `20260216_092540.mp4` and the user's confirmation that it is down a corridor to the left of Reception. The right corridor and staircase are mirrored at the user's request, not independently verified from footage. Corridor lengths and stair dimensions remain gameplay approximations.

The two stair approaches branch from the existing gallery either side of Reception. They replace the former north/south centre-line markers. Both are shown on the floor map and minimap. The browser constructs its architecture from the current navigation layout, retaining the existing material palette and architectural trim, so old exported walls cannot block these new approaches.

### Playable upstairs (browser)

Hold **E** for 0.8 seconds at either staircase to transfer to the upper landing; release E before using it again. On mobile, hold **USE**. This is a floor transfer, not continuous physics-based stair climbing. Use either upstairs landing to return downstairs. The HUD, floor map, minimap, collisions, lighting and visible pursuers switch to the current floor. All five escape exits remain downstairs.

Upstairs has a mirrored gallery loop and three side rooms, connected to both staircases. This is a fictional gameplay extension, not a measured reconstruction from the footage. Pursuers can route through either staircase; enemies on another floor cannot see, hear or capture you through the ceiling. The ghost continues tracking across floors but must travel to a staircase. Restart resets everyone downstairs.

Run `npm test` in `Browser` for layout reachability and headless game-loop integration checks. The latter mocks rendering and DOM APIs; it is not a visual/WebGL test.

The canonical and browser JSON layouts and Blender layout generator are synchronised. Existing `.blend`, `.fbx`, `.glb` and overview image exports have not been regenerated; the Unity binary level still requires a Blender rebuild. The browser no longer loads the stale `.glb` when `geometrySource` is `layout`.

The menu's **Archival footage** panel links to the supplied [Google Photos video](https://photos.app.goo.gl/UfHfqXjWSfPtDs3C8).

## Historical reference panels

## Escape cutscene

The east forecourt has been refined against `20260912_172141.jpg` and the user's marked viewing direction. It has a full white ground storey, fine multi-pane sash windows, a two-storey forward wing with blue doors and an external metal stair, three tall chimney stacks, a shallow polygonal bay, and two aligned front windows per floor on the three-storey square projection. Window locations are maintained explicitly in `Browser/dist/east-photo-detail.mjs`; foliage-obscured details and dimensions remain visual estimates. Open `explore.html?view=east-photo` to walk from the marked area, or `aerial.html?view=east-photo` for a stationary comparison.

The opposite side of the cut-through is refined against `img2.jpg`, looking from the back towards the front. `Browser/dist/courtyard-photo-detail.mjs` adds the projecting octagonal courtyard bay, two close window pairs plus one single sash per floor on the adjoining wall, the taller stair block with a two-flight external fire escape, white ground-floor walls and windows, exposed pipes, and the glazed brick enclosure. The photographed parking bays are empty. Open `explore.html?view=courtyard-photo` for this comparison position. The courtyard passage and rear approach remain open.

Looking towards the rear of the estate, `img8.jpg` defines the wider rear return and the inward face of the east wing in `Browser/dist/rear-court-photo-detail.mjs`. The return has five upper sashes plus a stair door, wider ground-floor glazing, a return fire escape and a blue gabled porch. The adjoining wing includes its own blue porch, a shallow projecting bay beneath two tall chimney stacks, splayed window heads and a white stair enclosure with a sloping roof. The planting island and empty bay markings follow the photograph; the rear access gap remains open. Open `explore.html?view=rear-court-photo` for this direction.

The corner between 1829 and Redesmere follows `20260912_172245.jpg`, `20260913_171133.jpg` and `bridge-loc.png`. The former roofed connecting rooms are removed, leaving separate rooflines and an open lane into the eastern courtyard. Only a shallow brick lintel crosses the front of the lane: its underside is at first-floor level (4 scene units), with a half-storey masonry head (2 units), a whitewashed face, dentilled cornice and exposed brick parapet. The Redesmere end beside it is a low range with a windowless front and brickwork continuing to ground level. Two shallow slate hips replace the tall windowed end-room placeholders; the taller building and its windows sit behind them. The lamp stands beside the approach, leaving the opening visible. `Browser/dist/redesmere-passage.mjs` holds the detail and comparison camera; open `aerial.html?view=redesmere-passage` or `explore.html?view=redesmere-passage`. Geometry checks verify open sky behind the lintel and the route remains walkable in both directions. Dimensions are photo-based estimates; Unity and Blender exports are unchanged. This supersedes the earlier roofed-link interpretation.

Escaping through any of the five exits starts a ten-second aerial 3D pan over the 1829 estate with **You escaped** on screen. The model follows the supplied aerial photograph and the user's annotated correction: reception at the front centre, curved window bays, projecting wings, slate roofs, lawns, roads and parking areas. The right wing starts from a reflection of the left wing, with a longer stepped front projection and adjusted courtyard and outer rooms following `outline-new.png`. The yellow-shaded extension is represented in matching brick and slate as a long outer range with a stepped rear return, wrapping around roughly three sides of the eastern parking court, with the rear return offset outward and back to leave its rear-left entrance open. The two gaps between the central rearward arms remain open to the rear road. Parking beside the extension moves outward to clear its footprint. A lattice radio mast sits beyond the rear-left corner, at the upper left from this perspective, following the corrected arrow. The shape and dimensions are an artistic reconstruction, not a surveyed model; the property outline and annotations are not reproduced.

The scene is built in `Browser/dist/escape-exterior.mjs` and the pan is controlled by `Browser/dist/escape-cutscene.mjs`. It uses real geometry, instanced window/trim details, procedural brick/slate materials and directional shadows. It shares the game's renderer and remains behind the result screen. The original mast photographs remain as reference assets but are no longer displayed or loaded by the ending. Gameplay and the timer freeze throughout; hidden tabs suspend playback. Select **Skip cutscene**, or press Escape, Space or Enter, to go straight to the result. Reduced-motion mode holds a still 3D aerial view. Losing does not trigger the sequence.

The Old Chapel stands behind the rear car park at x=-4.9, z=-119.2, registered from the shared Google Earth marker with 1829 fixed (see `Research/landmark-placement.md`). `Browser/dist/chapel.mjs` builds the photo-based brick chapel with a steep slate gable roof, pointed lancet windows, stepped buttresses, projecting entrance porch, vestry, clock gable and ridge crosses. Its clock face points towards the front of the main building, with the entrance porch on the west side. Dimensions are approximate and styled to match the aerial model.

The September 17 clock-front photograph supersedes the generic front opening.
`Browser/dist/church-front.mjs` adds two separate leaded lancets, layered stone
surrounds, frontal buttresses, a shared sill above plain brick, and a shouldered
clock stage with Roman numerals and a brick pediment. The nave and site placement
are retained. See `Research/church/README.md` and `aerial.html?view=church-front`.
`node Browser/test-church-front.mjs` checks exposed glazing/dial/pediment,
registration, material isolation, buttress collisions and front-path clearance.
The browser source and generated aerial model are updated; Unity and Blender
exports are unchanged.

Validation: the church geometry check, front/oblique renders, actual compiled
clock-front page, binary-format check and compiled/source comparison pass.
The rebuilt binary is 10,296,180 bytes; both paths submit 677,876 triangles and
2,667 draw calls in the standard compiled test. The full browser suite stops at
the existing `test-annexe-photo-placement.mjs:14` road snapshot assertion
(also recorded in `Browser/artifacts/grindley-suite.txt`). Running the remaining
checks separately passes except the existing admin north service-road clearance
failure at `test-historic-roads.mjs:74`, previously recorded in
`Browser/artifacts/landing-suite-failure.txt`. These road sources were already
modified before the church refinement and were not changed for this work.

With the local server running, open `http://127.0.0.1:1829/aerial.html` to replay the ending directly. Tests cover all five exits, low-frame-rate duration, replay/reset, the retained result background, actual roofs and open rear gaps, and building/mast framing in landscape and portrait. The Unity build is unchanged.

## Historical reference panels

The in-game photo panels and the 1854 statistics plaque are based on the public history and photography references from [Mark Davis Photography](https://www.mark-davis-photography.com/explore/the-countess-of-chester-asylum-deva/), [Based in Churton](https://basedinchurton.co.uk/category/cheshire-lunatic-asylum/), and the [public Deva photo archive](https://www.whateversleft.co.uk/asylums/deva-countess-of-chester-asylum-chester/). The plaque keeps the original report terminology as a historical quotation, rather than a modern diagnosis.

The photo/video-based water tower stands beyond the right campus block at x=148, z=-55.2, registered from the shared Google Earth pin (see `Research/landmark-placement.md`); the escape pan widens to keep its finial visible. Its square brick shaft has concentric round arches, paired slit windows, corbelled eaves, a pyramidal tiled roof and a finial. Total height is 39.05 scene units, 2.2 times the main building's 17.75-unit pediment height. Open the preview with ?view=tower for a close-up. The escape camera widens on narrower screens to retain the tower in view.


The inner eastern courtyard uses `img3.jpg`, with `img3-loc.png` locating the view and `img3-render.png` showing the earlier model. The projecting block now has an exposed brick basement, multi-pane sash windows, a pale cornice beneath a sloped slate roof, iron return stairs and a raised garden with stone edging and low white walls. Planting and plain stair treads adapt the modern reference to the circa-1900 setting; dimensions remain approximate. Use `aerial.html?view=inner-court-photo` for the comparison view or `explore.html?view=inner-court-photo` to walk from it. The later marked rear aerial supersedes the separate lowered stair roof: both wings now carry their main roof over the stair section, above matching lower sloping annex roofs. The exterior stairs are visual scenery, not climbable routes.

The west courtyard follows `img6.jpg`, with `img6-loc.png` locating the view and `img6-render.png` showing the earlier model. It now has a polygonal bay, a single sash and two pairs on each upper storey, an entrance beneath the single sash, exposed brick at ground level, pale floor bands, a recessed corner link and a glazed lean-to. The gravel court and planted border preserve the circa-1900 setting. The previously lowered rear wing ends remain in place. Open `aerial.html?view=west-court-photo` or `explore.html?view=west-court-photo` for the comparison view. Dimensions remain visual approximations. The annotated west corner link is widened to 7.2 units; the central wall and bay move outward into a broader frontage, ending in a seven-unit recessed section and a six-unit projecting corner with separate hipped roofs. The gravel apron and planting move outward to clear the enlarged footprint.

The west-front garden follows `img9.jpg` and its supplied render/location images. It includes a square front with two sashes on each of three floors, an iron return stair, fine windows on the existing polygonal front bay, a brick two-storey forward range with chimney stacks and a low glazed side extension. One spreading tree replaces the two large crowns that hid the facade. Open `aerial.html?view=west-front-photo` or `explore.html?view=west-front-photo` for the comparison view. The architecture is approximate, and external stairs remain non-climbable scenery.

The west-front refinement uses `refine.png`, `refine2.png` and the annotated [custom My Maps outline](https://www.google.com/maps/d/viewer?mid=1K6D3LtUWtSBew_0e9FVCqYLXq777-BI). The square frontage and fire-exit wall now align with the main pavilion, with the iron return stair moved back together with its landing doors. Each storey has a sash on either side of the curved bay. The yellow endpoints indicate a central rear section about 1.5 times the depth of the side arms; the centre is widened to 13 scene units and extended rearwards, with the drive routed around its end. The detailed east and west arms retain their existing lengths, bays, lowered rear roofs, glazing and garden features. These are relative visual estimates, not survey dimensions. Use `aerial.html?view=west-refine` for the updated facade or `aerial.html?view=plan` to compare the footprint.

The inner east elevation is refined against `img14.jpg`, with `img14-loc.png` fixing the viewing direction. `Browser/dist/inner-east-elevation.mjs` adds the tall rectangular brick projection, one front window on each floor, glazed side return, stepped adjoining pier and shallower white base. The external stair now has three flights, an intermediate landing and vertically aligned landing doors. The raised garden and map-based central-arm dimensions are retained; the central-arm stair is aligned to its widened wall. Open `aerial.html?view=inner-east-photo` for the comparison or `explore.html?view=inner-east-photo` to walk from it. Unmeasured dimensions remain visual estimates.

The annotated img14 side-profile correction moves the stair doors, flanking windows, landings and three flights four scene units towards the front, replacing the former blank stretch of wall. A lower brick annex occupies the vacated rear section, with two levels of windows and a slate roof rising towards the moved stair block. The roof has sloping brick infill and pale edge trim. The overall rear footprint stays unchanged. The existing `inner-east-photo` comparison and walking views show this correction.

The west rearward wing is rebuilt from the detailed east inner elevation, reflected across Reception at x=0, then refined against `img15.jpg` (looking east) and `img16.jpg` (looking south). Its outer wall has eight bays and exposed brick basement walls, with pale eaves beneath a continuous grey hipped roof matching the other wings. The end has three broad glazed gallery bays above brick infill, a glazed side return, a single-slope roof and a wider central upper sash with sidelights. The mirrored inner projection and return stairs retain a clear route beside the central arm. This supersedes the earlier lowered west hipped end; the eastern geometry is retained. Dimensions remain photo-based estimates. Open `aerial.html?view=west-wing-side` or `aerial.html?view=west-wing-end` for comparisons; both views are also available in `explore.html`.

The outer east elevation of Redesmere follows `redesmere.jpg`, with `redesmere-loc.png` locating the westward view from the lawn and `redesmere-render.png` showing the previous model. It now has two canted brick bays, a pale green central entrance with a gabled canopy, fine sash windows and splayed stone heads, pale floor bands, slate roofs, tall chimney stacks and a low side room. The garden border and iron railing follow the established circa-1900 treatment; trees leave the marked sightline clear. The inner courtyard details and access routes remain in place. Open `aerial.html?view=redesmere-photo` for the comparison or `explore.html?view=redesmere-photo` to walk from it. Geometry is in `Browser/dist/redesmere-photo-detail.mjs`; dimensions and obscured details are visual estimates. The Unity and Blender exports are unchanged.

The frontage west of Reception follows `img19.jpg`, with `img19-loc.png` locating the northward view from the front lawn and `img19-render.png` showing the previous model. `Browser/dist/entrance-west-photo-detail.mjs` adds the three-bay projection, broad central glazing with sidelights, five recessed sashes on each upper floor, white lower-storey walls and blue doors, a stepped parapet cornice and pitched slate roofs. Reception has matching fine sash glazing, brickwork and white base. The obstructing lawn tree moves away from the sightline, and the gravel approach and handrail gap remain walkable. Open `aerial.html?view=entrance-west-photo` or `explore.html?view=entrance-west-photo` for the comparison. Dimensions and the camera position are visual estimates; Unity and Blender exports are unchanged.

The inner face of the west forward wing follows `img18.jpg`, with `img18-loc.png` fixing the westward lawn view. `Browser/dist/west-lawn-photo-detail.mjs` adds a three-window projecting bay, fine sash windows with segmental brick heads, pale floor bands, a recessed connecting wall and an edged gravel approach. Two taller chimney stacks carry paired pots, and the tree stands beyond the end of the wing. The gravel follows the existing circa-1900 grounds treatment. Open `aerial.html?view=west-lawn-photo` or `explore.html?view=west-lawn-photo` for comparison. Dimensions remain visual estimates; Unity and Blender exports are unchanged.

The two inward-facing elevations around the entrance lawns are mirror images, following the user's blue-outlined correction. `Browser/dist/entrance-symmetry.mjs` reflects the updated west frontage and img18 lawn elevation across Reception at x=0, including the projecting bays, doors, glazing, trim, paths and paired chimney stacks. The east inner walls now match x=29/32 and the forward end at z=43; only the outer roof slope widens to join the retained outer east wall and courtyard details. The large east lawn tree moves beyond the wing end. Use `aerial.html?view=east-lawn-photo` or `?view=entrance-east-photo` for the mirrored comparisons; both presets also work in `explore.html`. This supersedes the earlier asymmetric inner east frontage.

The paired entrance roof sections now rise above their cornice slabs, with matching pitched slate surfaces and bay roof caps above the projecting wall tops. This fixes the pale roof cut-outs exposed by the earlier shallow roof placement. Geometry checks cover both roof edges and the front bay caps.

The front end of the west forward wing follows `img17.jpg`, with `img17-loc.png` locating the northward view and `img-17-render.png` recording the earlier model. `Browser/dist/west-forward-end-photo-detail.mjs` replaces the three-column end with four lower sashes, three tall upper sashes and a glazed blue landing door with a separate transom. It adds segmental brick heads, a pale floor band and layered cornice, rainwater pipes and a two-flight masonry return stair with fine iron railings. The paired chimney stacks are offset across the roof, the nearby tree moves to the side and the hedge leaves the photographed approach open. Plain stair treads retain the circa-1900 treatment. Open `aerial.html?view=west-forward-end-photo` or `explore.html?view=west-forward-end-photo` for comparison. Dimensions are visual estimates; exterior stairs remain non-climbable scenery, and Unity and Blender exports are unchanged.

The main front steps follow `20260913_171036.jpg` and the user's forked plan. Four central treads rise to a branching landing; each side turns 90 degrees outwards up four further treads, then turns forward onto a level return joining the broad doorway landing. Red-brown masonry parapets, pale stone treads and a front iron balustrade complete the portico approach. Geometry is in `Browser/dist/front-steps.mjs`; use `aerial.html?view=front-steps` for a close view, or `explore.html?view=front-steps` from ground level. Dimensions remain visual estimates. As with the other exterior stairs, these are scenery rather than climbable routes; Unity and Blender exports are unchanged.

The front boundary follows the supplied outward-looking photo and red-marked aerial stretches. Two low weathered stone walls with pale coping and capped end piers replace the marked hedge sections, leaving the central entrance path open. Geometry is in Browser/dist/front-boundary-wall.mjs; use aerial.html?view=front-wall for a close view or explore.html?view=front-wall to look out towards it. Height and extents are visual estimates. The browser scene and walking collisions are updated; Unity and Blender exports are unchanged.

The annexe replaces the former new hospital reconstruction. `Browser/dist/annexe.mjs` follows the northern black footprint in the supplied `annexe/os-clean.png`, with the annotated `os.png` identifying the building and photo directions. A similarity transform registers the 417 × 433 map to existing 1829 Reception (pixel 285,308 → world 0,13) and the chapel (215,351 → -6,-120). The Redesmere outer elevation at approximately pixel 242,265 provides an independent placement check. Map proportions and the annexe's 19-degree frontage direction are preserved; pixel picks, heights and concealed details remain visual estimates. The earlier fire-alarm-map courtyard layout is replaced.

The front and side photographs inform the symmetrical entrance pavilions, paired square roof towers, broad hipped hall roof, three round-headed dormer windows, central open bell tower and dome, terracotta banding, white multi-pane sashes, blue gutters/downpipes and side fire stair. Both entrance-side courts have L-shaped voids formed by solid outer/front corners. The rear east L wing turns approximately 22 degrees relative to the frontage, and the two previously modelled transverse rear galleries are removed. The canted bay, glazing, blue rainwater goods and fire stair are mirrored on both sides. Browser geometry is updated; Unity and Blender exports are unchanged.

Use `aerial.html?view=annexe-front`, `?view=annexe-front-right`, `?view=annexe-img1` or `?view=annexe-side` to compare the supplied photographs; `?view=annexe-side-right` shows the mirrored right elevation. `?view=annexe-plan` and `?view=annexe-site` face the same way as the OS map. `?view=annexe` gives an aerial overview; `explore.html?view=annexe` starts on the front approach. Existing `new-hospital` URLs continue to resolve. `Browser/test-annexe.mjs` checks registration, Redesmere alignment, map proportions, open courts, roof normals, exposed arched glazing and rotated wall collisions.

The entrance lawns extend to the front boundary wall. Their only paths are the central approach and a narrow gravel walk following the building walls, recessed frontage and projecting bays on both sides. `Browser/dist/entrance-walks.mjs` joins these walks around the split entrance stairs; the earlier lawn crossings and detached door approaches have been removed.


## Churton Ward

Churton Ward replaces the plain rear campus block in the browser estate. The six paired photographs and location arrows establish the lawn face, broad rear gable, hipped return, oblique middle wing and low side room. The yellow satellite outline sets their approximate proportions, with the ward now registered at x=-44.3, z=-65.9 from the Seren Lodge marker in the shared Google Earth project. The 1829 building remains the fixed reference; see `Research/landmark-placement.md`. Red brick, slate roofs, splayed brick window heads, sash glazing, corbelled chimney stacks, the pale-sided glazed entrance and a hedged lawn follow the references; gravel approaches match the established grounds treatment. Nearby placeholder trees are cleared from the ward and its approach.

Use `aerial.html?view=churton` for the aerial view, `?view=churton-plan` for the footprint, or `?view=churton-1` through `?view=churton-6` for the corresponding photographs. The same six presets work in `explore.html`; `explore.html?view=churton` starts on the lawn approach. Geometry is in `Browser/dist/churton-ward.mjs`. Walking collisions follow the walls and leave both rear recesses open. Run `node Browser/test-churton.mjs` for viewpoint, recess, window visibility and collision checks. Dimensions and unseen details remain visual estimates; Unity and Blender exports are unchanged.

The Churton alignment correction squares the ward and its grounds to the estate axes. The short rear wing now angles towards the church-side return (a backslash when viewed from the rear), with its roof, windows, door and collisions rotated together.

The east forward wing beside the Redesmere approach follows `redesmere-edge/img1.jpg`; `img1-loc.png` establishes the northward viewing direction and `img1-render.png` records the earlier model. Its end now has four aligned sash windows on each of two floors, segmental brick heads, continuous brick at ground level, pale floor and eaves trim, and slimmer chimney stacks. The end is narrowed to 12 scene units while the inward walls stay in place; the outer side windows, white side base, roof and fire escape move together. Low planting, a young verge tree and repositioned lamp leave the facade clear. This supersedes the earlier widened outer slope at this wing. Open `aerial.html?view=east-forward-end-photo` or `explore.html?view=east-forward-end-photo` for comparison. Geometry and proportions are photo-based estimates, and gravel/plain stair treads retain the circa-1900 treatment. Exterior stairs remain scenery; Unity and Blender exports are unchanged. Run `node Browser/test-east-forward-end.mjs` for window visibility, brickwork and forecourt access checks.

The garden corner facing the east side of the square pavilion follows `redesmere-edge/img3.jpg`, with `img3-loc.png` locating the north-westward view and `img3-render.png` showing the previous model. `Browser/dist/redesmere-garden-photo-detail.mjs` replaces the generic side window grid with a blank front section, shallow central projection, paired upper sashes, broad middle glazing with sidelights, two narrow upper windows and a blue ground-floor door. The side return extends behind the retained square front beneath a continuous slate roof. The shallow connecting head moves back along the same passage to z=15.5 so it meets the plain wall beyond the broad window; its four-unit clear height and open lane are retained. Ivy, weathered boarded panels, two slatted benches and four timber herb beds refine the low range and lawn. Gravel paths preserve the circa-1900 treatment. Open `aerial.html?view=redesmere-garden-photo` or `explore.html?view=redesmere-garden-photo` for comparison. Dimensions and obscured details remain visual estimates; Unity and Blender exports are unchanged. `node Browser/test-redesmere-garden.mjs` checks exposed glazing, the roof, bed collisions and passage access.

## Upton/Frith/Oscroft

The two-storey Upton/Frith/Oscroft range stands behind the church in the browser estate. `Browser/dist/upton-frith-oscroft.mjs` uses the western half of the registered OS wall trace for its dimensions and stepped form, then reflects it across the existing church centre line at x=-4.9. This follows the user's red-line symmetry correction and supersedes the uneven OS east wing. Both halves have identical walls, hooked end pavilions, slate hips, windows, doors, trim and roof lanterns. The central projection aligns with the chapel's longitudinal axis; the church's position and rotation are unchanged. The resulting footprint is approximately 101 by 26 scene units.

The supplied aerial guides the joined slate roofs and two pale roof lanterns. The outward garden elevation follows the supplied photo: two mirrored pairs of two-storey canted brick bays, a continuous cream upper-sill course, a dentilled brick cornice and dark rainwater goods. All facade windows use tall white two-light frames, one meeting rail, muted vertical blinds, projecting cream sills and splayed stone lintels. Bay spacing, entrances and the 7.8-unit eaves height remain approximate; the photo adds detail to the symmetric OS-derived main footprint. The building is shared by Historic and Modern, consistent with the present-day aerial. Its walls provide walking collisions, its recesses remain open, and the walking boundary extends northwards to allow access. All brown OS ground traces, including the adjoining unmodelled complex, are removed.

Open `aerial.html?view=upton-outward` for the garden-facing aerial, `?view=upton-outward-photo` for the photo comparison, `?view=upton` for the close aerial, `?view=upton-plan` for the overhead comparison, or `explore.html?view=upton` to walk from the church-side lawn. References, including the red-line correction, are saved in `Research/upton-frith-oscroft/`. Run `node Browser/test-upton.mjs` for fixed church alignment, mirrored footprint and rendered roof checks, two-storey glazing, clearance, walking and layout checks. Unity and Blender exports are unchanged.

## Water tower photo refinement

The water tower now follows all four numbered ground-level photographs, with side 2 facing 1829 and side 4 facing the annexe. Distinct arched openings, inward-falling former roof scars, brick infill and pale repairs replace the repeated lower facades. The 18 September colour correction removes the erroneous upward-to-centre triangular patches from sides 1, 3 and 4; redder repair bricks and patchy lime mortar now lie below the retained contacts. The two lower blocked arches on sides 3 and 4 also have the photographed alternating red and buff-yellow radial bricks. Their shared roof profiles and all adjoining roof geometry remain unchanged. The upper blind arcade, three pairs of blocked slits, string course and corbelled eaves use the photographed proportions. Open `aerial.html?view=tower-1` through `tower-4`, or choose a numbered side from the water tower aerial. [Photo mapping and modelling notes](Research/water-tower/README.md). Browser geometry is updated; overall height and location remain unchanged. The colour correction passed the full browser suite and rebuilt source/compiled scene checks, with visual renders of all four faces and an exact comparison of the retained roof marks.

## Redesmere edge chimney

The small, broad chimney at the outer corner of Redesmere's low end range follows the two photos and marked camera views in `Research/redesmere-chimney/`. It has a pale rendered, slightly tapered circular shaft, a stepped round projecting cap and two short circular recessed flues. Position (x=100.55, z=20.1), height (9.9 scene units) and concealed details are visual estimates. Geometry is in `Browser/dist/redesmere-edge-chimney.mjs`, shared by Historic, Modern and walking/gameplay. Open `aerial.html?view=redesmere-chimney` or `?view=redesmere-chimney-lawn` for the two comparison directions; the same views work in `explore.html`.

The rear east and west arms now connect directly into the main 1829 range. Their front roof sections meet the main roof at the same eaves and ridge heights, with continuous slate and masonry across the former gaps. The taller sections farther back are retained. All remaining generic 1829 windows use the same fine three-light, six-row sash frames, glazing and sills as the detailed elevations. These changes apply to the shared browser exterior in aerial, walking and gameplay views; Unity and Blender exports are unchanged.

## Irby/Ashley

The new two-storey Irby/Ashley range follows the yellow refinement in the supplied `irbyashley/location.png`, registered over the existing brown OS trace beside the curved service road. The photos guide the red brick, stepped wings, slate roofs, chimney stacks, tall divided sashes, two canted garden bays and low glazed lean-to. The courtyard openings remain accessible. All brown OS ground traces, including the adjoining unmodelled connection, are removed.

Choose **Irby/Ashley** in Locations, or open `aerial.html?view=irby-ashley`. Plan, purple-camera, blue-camera and Main/admin viewpoints are available; `explore.html?view=irby-ashley` starts on the garden approach. The building belongs to Historic and the walking/gameplay scene. The request refers to img2 at the purple arrow, but the supplied file is img1; that correspondence and concealed details are approximate. Sources and registration notes are in [Research/irby-ashley/README.md](Research/irby-ashley/README.md). Unity and Blender exports are unchanged.

The later red-to-orange screenshot moves the rear range three additional units
towards the front, for a total positive-Z offset of ten units. The yellow front
faces keep their positions, widths and sashes; the corridor contact also stays
fixed. Connecting wings shorten, while the rear roofs, bays, corner and glazing
keep their dimensions. Paving and walking footprints follow the updated model.
Reference-camera renders and a comparison of 465 mesh vertices, 552 garden
detail instances and seven fixed front/corridor sashes are recorded in
`Browser/artifacts/irby-red-orange-*`.

The requested regression cleanup fixes the annexe road snapshot's scope: it
protects the named annexe loop, avenue and teardrop rather than unrelated roads
east of x=240. The separate Historic road failure was a real service-ribbon
overlap with the refined tower workshops. Its route now clears the tower and
Estates at full width, and the short cross-lane clears Irby's fixed front. An
obsolete grass sample on the relocated annexe avenue's kerb moves back into
the removed loop area. All 49 scripts pass through `npm test`; the final suite
log is `Browser/artifacts/irby-red-orange-suite-final.txt`. The rebuilt model
also passes `npm run test:compiled`, including matched rendering, controls and
fallback loading (`irby-red-orange-compiled-final.txt`); its source fingerprint
matches the current model. Browser sources and the local compiled aerial model
are updated; Unity and Blender exports are unchanged.

## Grafton/Edge

Grafton/Edge is a copy of Irby/Ashley rotated 90 degrees anticlockwise and fitted to the yellow/orange-marked bay beside Upton/Frith/Oscroft. Its church-facing rear follows the supplied veranda photograph: a mostly flat facade, shallow square projections at both ends, and one central half-octagonal bay intersecting a full-length open veranda. The copied greenhouse and paired rear bays are removed. Slate roofing, slender posts, timber end screens and a clear sheltered walk complete the veranda.

Choose **Grafton/Edge** in Locations, or open `aerial.html?view=grafton-edge-rear` and `explore.html?view=grafton-edge`. The model belongs to Historic. [Placement and photo notes](Research/grafton-edge/README.md) describe the approximate dimensions. `node Browser/test-grafton-edge.mjs` checks canopy coverage, the bay junction, walking access and the unchanged original Irby/Ashley.

## Estates department

The Estates department stands beside the service road near Irby/Ashley, retaining the complete stepped U-shaped OS footprint. The later yellow-guide correction turns the building 19 degrees clockwise and aligns its tower-facing edge within the service-road enclosure; its courtyard, collisions and photo/walking views follow the same transform. The later blue-to-yellow correction slides Estates towards the tower without changing its angle. The purple-selected ground becomes one continuous grey service court around both buildings, retaining the cobbled courtyard and only a small grass island between Estates and Irby/Ashley. The supplied photograph guides its two-storey rear offices, taller right-hand gabled return, low hipped entrance room, left workshop, turquoise doors, white windows, red brick bands, slate roofs and cobbled courtyard. The courtyard entrance remains open for walking.

Choose **Estates department** in Locations, or open `aerial.html?view=estates`, `?view=estates-photo`, `?view=estates-plan`, `?view=estates-site` or `explore.html?view=estates`. The building follows Historic visibility. [Reference notes](Research/estates/README.md) record the OS coordinates and photo-based estimates. `node Browser/test-estates.mjs` checks placement, roof coverage, windows, walking access and layout visibility. Unity and Blender exports are unchanged.

## Farndon ward

The Historic browser estate now includes the single-storey Farndon ward in the corrected blue footprint from `farndon/img1.png`. The registered H-shaped plan preserves its unequal garden wings, small rear room on a narrow link and low side projection. Joined slate roofs, plain brick end gables, the central garden gable, tall multi-pane sashes and chimney stacks follow the aerial and `img2.jpg`. The yellow dot and arrow identify the garden photo direction. The open courts remain accessible; the superseded ward outline is retired while adjacent OS corridor traces remain.

Choose **Farndon ward** in Locations, or use `aerial.html?view=farndon`, `?view=farndon-plan`, `?view=farndon-site`, `?view=farndon-2` or `explore.html?view=farndon`. The ward follows Historic visibility and has walking collisions. [Reference and modelling notes](Research/farndon/README.md) record the footprint registration and estimated dimensions. Run `node Browser/test-farndon.mjs` for geometry, roof, glazing, access and layout checks. Unity and Blender exports are unchanged.


## Witby Ward

Witby Ward duplicates Farndon in the yellow-circled OS footprint southwest of the original, retaining its size, roof details, windows and open courts. It appears in Historic and walking/gameplay. Choose **Witby Ward** in Locations, or open aerial.html?view=witby, ?view=witby-plan, ?view=witby-site, or explore.html?view=witby. [Placement notes](Research/witby/README.md) record the approximate OS alignment.

The later colour-marked overhead map repositions Witby, Farndon, Ashley/Irby,
Grafton/Edge and Hale/Daresbury/Huxley/Dunham against the fixed church and
Churton. Building shapes, sizes and orientations are retained; their camera
views and walking collisions follow the moves. The corridor reconnection keeps
the Main–tower–Farndon gallery perfectly straight beside the tower's chimney
side, at 90 degrees to Main, with Farndon's receiving wing aligned to it.
Witby, Grafton and Hale's links reach their moved walls. Estates is also aligned
to the same church/Churton map reference. See the updated
[ward positions and overhead comparison](Research/ward-placement/README.md).

## Garages and mortuary

The Historic estate now includes the roadside garages in the blue-marked area
opposite Main/admin and the separate T-shaped mortuary in the yellow area.
The photos guide the low brick row, pale blue garage doors, taller workshop,
office windows, slate roofs and mortuary chimneys. Choose **Garages & Mortuary**
in Locations for the aerial, two photo angles, mortuary detail and plan views;
`explore.html?view=garages` starts beside the row. Buildings have walking
collisions and leave the road junction clear. [References and modelling notes](Research/garages/README.md)
record approximate dimensions and hidden details. Run
`node Browser/test-garages-mortuary.mjs` for geometry, clearance and layout checks.

## Greenhouses and gardeners buildings

The Historic browser layout now includes the red-marked access road south of
Vivienne Smith Lane, three parallel glasshouses on the yellow marks, and two
brick service buildings along the blue marks. The supplied photograph guides
their hipped tiled roofs, blue doors, pale windows and working yard. The purple
camera position is available as **Photo view**. Select **Greenhouses & gardeners
buildings** in Locations, or open `aerial.html?view=greenhouses`; use
`explore.html?view=greenhouses` to walk there. See the
[placement and reference notes](Research/greenhouses/README.md).
Run `node Browser/test-greenhouses.mjs` for roof, access, collision and layout
checks. Dimensions and concealed details are estimated from the references;
Unity and Blender exports are unchanged.

### Ward mural gallery additions, 17 September 2026

Added the supplied Jodrell and Irby / Ashley mural photographs, plus the Tarvin, Carden and second Jodrell views cropped from the marked composite. Originals and crop provenance are retained in `Research/annexe-photos/` and `Research/irby-ashley/`. The photo build script produces the gallery WebP files and the building catalogue assigns them to their existing ward groups.

Validation: `node Browser/test-building-photos.mjs` passes, including source and compiled selection. All five additions loaded in the browser galleries; the three composite crops were visually inspected in their panels. The full browser suite stops at the unrelated road-layout assertion in `Browser/test-annexe-photo-placement.mjs:14` ("Only the yellow-circled rear roads are removed; the loop stays fixed"). No model geometry or Unity/Blender exports changed.

Added the two supplied Grindley Ward photographs (bridge/canal mural and interior steps) to the shared 1829 · Acton / Grindley gallery, bringing it to six images. Unedited originals are retained in `Research/grindley/`; the photo build script generates both gallery WebP assets. `node Browser/test-building-photos.mjs` passes, and both additions were checked in the browser gallery at their original 689 × 918 dimensions. The full browser suite still stops at the road-layout assertion in `Browser/test-annexe-photo-placement.mjs:14` noted above. No model geometry or Unity/Blender exports changed.


The Asylum escape room signs now use the 1829 Locations ward groups: Acton
at the centre, Hampton / Ince in the west wing and Barton / Caldy / Ebnal in
the east wing. The central sign identifies Grindley as the basement ward.
Wing groups follow `Research/location-navigation/README.md`; individual room
and floor assignments are not supplied, so the signs retain the grouped names.
This is a browser sign-text change in `Browser/dist/game.mjs`; layout data and
Unity/Blender exports were not changed by it. Live WebGL checks show the signs
without page errors (`Browser/artifacts/ward-labels-*.png`). The game checks
pass; `npm test` stops at the existing annexe photo-placement road snapshot
mismatch, recorded in `Browser/artifacts/ward-labels-suite.txt`.


The successful escape popup includes an **Explore the asylum** link to
`aerial.html`, styled with the main page’s square-cornered secondary button
outline, uppercase lettering and matching action height. It appears only for victory and is hidden when the shared dialog
shows pause or defeat. Desktop and mobile popup layouts and visibility were
checked in WebGL (`Browser/artifacts/result-explore-*.png`). Game checks pass;
the full suite still stops at the existing annexe photo-placement road snapshot
mismatch (`Browser/artifacts/result-explore-suite.txt`).

### Hale/Huxley and Main/Admin gallery additions, 17 September 2026

Both Hale / Daresbury and Huxley / Dunham now show the supplied Daresbury
entrance detail and Dunham / Daresbury garden photograph. The photo build
script reuses the identical originals in
`Research/hale-daresbury-huxley-dunham/inside-corners/`. Main / Admin now has
six photographs: its existing side and rear views plus the four supplied
frontage, entrance and forecourt views, retained unedited in
`Research/main-admin-photos/`. Six new WebP assets and their provenance were
generated through `Browser/build-building-photos.mjs`.

Validation: `node Browser/test-building-photos.mjs` passes for source and
compiled building selection, and all 49 scripts in `npm test` pass. The npm
CLI was invoked directly from `C:/Program Files/nodejs/node_modules/npm/bin/`
because the normal launcher pointed to a missing roaming installation.
The full output is `Browser/artifacts/hale-main-admin-gallery-suite.txt`.
All three galleries loaded their expected photos and captions in Chrome;
desktop screenshots were visually checked, and the mobile Main/Admin panel
fits the viewport and scrolls to the final image without page errors.
Screenshots use the `hale-daresbury-gallery`, `huxley-dunham-gallery` and
`main-admin-gallery-` prefixes in `Browser/artifacts/`. Only gallery sources,
assets and documentation changed; model geometry and compiled, Unity and
Blender exports were not regenerated for these additions.

The Church photo gallery now includes the supplied clock-facing front photograph
alongside its existing aerial view. The attachment matches the unedited
`Research/church/clock-front-reference.png`; the photo build script generates
`church-clock-front.webp` at 689 × 918 and records the source in its manifest.
The gallery check and complete `npm test` suite pass (invoked through the
installed npm CLI because the shell's npm launcher is broken). Both images load
in the browser without page errors; the visual check is saved in
`Browser/artifacts/church-clock-front-gallery.png`, with the suite log in
`Browser/artifacts/church-gallery-suite.txt`. No model geometry or Unity/Blender
exports changed.

### Greenhouses gallery addition, 18 September 2026

The supplied interior photograph is now the second image in the Greenhouses
gallery, captioned “Greenhouses · interior and growing benches”. The unedited
original is retained at `Research/greenhouses/interior.png`; the photo build
script generates the 1200 × 902 WebP and records its provenance in
`Browser/dist/building-photos/sources.json`.

Validation: `node Browser/test-building-photos.mjs` and the complete `npm test`
suite pass (using the installed npm CLI). Both gallery images load and decode
without browser errors; the rendered panel was visually checked in
`Browser/artifacts/greenhouses-interior-gallery.png`. The suite output is saved
in `Browser/artifacts/greenhouses-gallery-suite.txt`. No model geometry or
compiled, Unity or Blender exports were changed for this photo addition.

### Aerial navigation styling, 18 September 2026

Removed the visible “THROUGH THE YEARS” heading from the aerial timeline,
retaining an accessible “Estate period” name on the slider. “Back to intro”
now shares the Locations button styling and keeps its link destination.

Validation: the complete browser `npm test` suite passes via the installed
npm CLI (`Browser/artifacts/aerial-controls-style-suite.log`). Desktop,
390 px mobile and 320 px narrow screenshots were visually checked; navigation
controls stay within the viewport without overlapping. Both menus, keyboard
timeline selection and the intro link work without aerial page errors.
Screenshots are `Browser/artifacts/aerial-controls-style-*.png`.

### Locations and gallery cleanup, 18 September 2026

Removed the West wing aerial and Photo 1–5 entries from the Locations menus
in aerial and walking views; Photo 6 was already absent. Hampton and Ince
remain available, and the existing direct camera URLs still work.
Oakmere's gallery image now uses the supplied unedited
`Research/oakmere/lawn-gallery.png`, converted to the 1200 × 900
`oakmere-lawn.webp` with the existing photo preparation settings.
Removed `jodrell-mural-stairwell.webp` and `irby-4.webp` from their galleries,
bundled assets, build source list and generated source manifest.

Validation: the complete browser `npm test` suite passes via the installed
npm CLI (`Browser/artifacts/oakmere-menu-gallery-suite.log`), including source
and compiled building selection. Browser checks confirmed both cleaned menus,
the Oakmere replacement, two remaining Larkton / Jodrell images and three
remaining Irby / Ashley images. Both removed image URLs return 404 locally;
the checked pages reported no JavaScript errors. Desktop and mobile screenshots
are `Browser/artifacts/oakmere-replacement-*.png` and the cleaned menu screenshots
are `Browser/artifacts/locations-oakmere-cleanup.png` and
`Browser/artifacts/locations-walking-cleanup.png`. Model geometry and compiled,
Unity and Blender exports were not changed.

### Oakmere red-circled west face, 18 September 2026

The marked lawn view selects the rear courtyard's west range. Its new separate
`annexe-oakmere-west.mjs` elevation follows the Oakmere photograph: 4–5–4 sash
bays, two blocked upper openings, a brick pediment and round vent, slate roof
intersection, masonry bands, pipes and low end rooms. The low service connector
ends at the courtyard corner so the first ground-floor window is unobstructed.
The `oakmere-photo` and `oakmere-lawn` camera presets now frame that marked face.
See [the reference and preservation notes](Research/oakmere/README.md).

The green-circled structures and the separately corrected spine roof retain
their geometry. `test-oakmere-west.mjs` compares 21,294 protected primitives
against the saved pre-edit annexe, and checks all new glazing from the lawn,
roof normals, the open court, walking access/collision and Historic visibility.
The complete approved-shape snapshot includes the new work; the protected-front
snapshot is unchanged. No ward ownership changes were made.

Validation: the complete `npm test` suite, `npm run build:models` and
`npm run test:compiled` pass. Source and rebuilt compiled photo, context and
front views render without page errors; screenshots and logs use the
`Browser/artifacts/oakmere-west-` prefix. The source/compiled comparison passes
with 0.017% of pixels above its difference threshold. Browser procedural and
compiled models are updated. Unity and Blender exports are unchanged.

## Asylum escape corridor finishes (September 18)

Both browser escape-game floors now follow the supplied main-corridor photo:
red brick lower walls, cream-painted upper brick, checker bands, red/buff
arched window recesses with sash frames and bars, dark skirting, worn stone
slabs, peeling ceilings and long surface-mounted lights. Narrow ward passages
have matching shallow arches. This supersedes the older flat green panelling
and large checkerboard floor. Lighting is more neutral; the existing fixed
12-lamp pool, torch controls and all gameplay routes are retained.

`architecture.mjs` batches these details and shares materials from the new
`interior-materials.mjs` between floors. Seeded canvas textures use building-space
coordinates, preserving brick scale and alignment across wall pieces. Shared
curved profiles form smooth window reveals. Archive artwork stays on solid
wall bays rather than covering windows or stairs. The reference and scope are
in [Research/escape-interior/README.md](Research/escape-interior/README.md).

The browser suite passes. New architecture raycasts pass 16 window aperture
samples and 36 passage-clearance samples across both floors; the gameplay,
navigation and pooled-light checks also pass. Real Chrome/WebGL checks cover
reception, gallery, corridor, window detail, upstairs, torch off, portrait layout
and an actual held-E stair transfer with no page or shader errors. Screenshots,
render counts and suite output use the `Browser/artifacts/escape-interior-`
prefix. The detailed interior uses 21–56 draw calls in those captured views;
these are diagnostic counts, not a hardware frame-rate claim.

Only the browser game sources changed. Navigation JSON, Unity, Blender and
GLB exports were not regenerated. The aerial compiled model is unaffected.

## Escape passage arch infill and ward signs (September 18)

Added cream/white-brick masonry between the striped section arches and the
ceiling on both escape-game floors. The shared curved header closes the space
above the crown and shoulders, meets the side walls and leaves the existing
walking opening clear. The header uses the same aligned masonry finish as
the upper walls. Ward-name room signs are removed from Asylum Escape only;
exit and stair directions remain, as do ward names in aerial/walking Locations.
This supersedes the earlier escape ward-sign notes above.

Architecture checks cover 120 header samples from both sides, 36 passage
clearance samples and 16 window aperture samples. Gameplay checks pass.
All 55 browser suite checks pass. Chrome/WebGL views of both floors pass with
no page or shader errors, including the stair-transfer check. Screenshots and
suite output use the `Browser/artifacts/escape-interior-headers-` prefix. Reference details are in `Research/escape-interior/README.md`.
Only browser sources changed; navigation JSON and Unity, Blender, GLB and
compiled aerial exports are unchanged.

## Escape window flicker correction (September 18)

Fixed coplanar wall/jamb and sill/jamb surfaces around the escape-game windows.
The masonry reveal is recessed 30 mm behind the striped frame laterally and
radially, while each sill extends 30 mm past the outer jamb. This removes the
competing faces responsible for the white/red flicker without changing window
placement, materials or passage clearance. Both floors use the correction.

The architecture check now includes 600 window-edge samples and rejects the
saved pre-fix geometry. Existing window apertures, passage clearance, overhead
masonry and gameplay checks pass. All 55 browser suite checks pass. Before/after
Chrome sweeps cover 50 camera positions on both floors without page or shader
errors; oblique render comparisons show clean jambs and sill ends. Captures and
suite output use the `Browser/artifacts/window-flicker-` prefix. See the reference and
geometry explanation in `Research/escape-interior/README.md`.
Only browser geometry changed; Unity, Blender, GLB and aerial compiled exports
are unchanged and do not need regeneration for this fix.

## Random wall artwork in Asylum Escape (September 18)

The three supplied images are bundled unchanged in `Browser/dist/art/`:
`asylum-winter-moonlight.png`, `asylum-service-tunnels.png` and
`daily-account-patients-1854.png`. They join the existing local artwork catalogue
in `game.mjs`. Each floor has 12 panels covering all 11 local images; wall
locations are shuffled on page load and stay fixed during restarts of that
session. Placement excludes windows, projecting passage arches, nearby stair
and exit interaction points, and overlapping panels. The supplied images fit
fully inside the wall panel, preserving both pages of the 1854 table. Holding E
opens the original image through the existing artwork viewer.

Validation: the full 55-check browser `npm test` suite passes using the installed
npm CLI (`Browser/artifacts/escape-wall-art-suite.txt`). The Chrome/WebGL harness
`node Browser/artifacts/check-escape-wall-art.mjs` checks all 24 panels for solid
wall placement, exposed faces, walking access, spacing and loaded textures;
it exercises all three additions on both floors, held-E opening/release, original
image dimensions and changed wall positions after reload. Desktop and portrait
screenshots and the zero-error results use the `Browser/artifacts/escape-wall-art-`
prefix. Reference provenance is in `Research/escape-interior/README.md`.

Only browser artwork assets and runtime placement/rendering changed. Navigation,
Unity, Blender and GLB exports were not modified. The compiled aerial model does
not include these game-interior panels and did not need regeneration.

## Escape skirting and stair edge correction (September 18)

Replaced the individual skirting boxes with a merged mesh whose mitered ends
join continuously at internal and external corners. The end faces that shared
planes with perpendicular brickwork are removed; open ends finish beyond the
wall caps. Stair nosing tops and fronts are separated from the carpeted treads,
and both the nosings and upper landing strips finish inside the carpet edges.
This fixes the reported flickering at corner caps and stair edges while keeping
the existing skirting height/projection, stair layout and navigation clearance.

The architecture test covers 760 skirting corner views and 116 stair-edge
samples, alongside the existing window, arch, and passage checks. The saved
old model has 162 skirting corner failures; the corrected model has none.
All 55 browser suite checks pass. Before/after Chrome sweeps cover 52 camera
positions across both staircases and floors without page or shader errors;
reviewed renders show continuous corner joins and clean stair nosings. Captures
and suite output use the `Browser/artifacts/stair-skirting-` prefix; see `Research/escape-interior/README.md`.
Only browser geometry changed; Unity, Blender, GLB and compiled aerial exports
are unchanged and do not require regeneration for this fix.

## Artwork title and caption cleanup (September 18)

Winter moonlight now shows the full image alone on both floor walls and in the
hold-E viewer, without its title, caption or surrounding display card. Its
original title remains available as accessible image text. The generic
"Artwork supplied for the 1829 building" caption is removed from all 11 local
artworks, including their wall textures and enlarged viewers. Other artwork
titles remain visible, with the freed caption space used for the image.

Chrome/WebGL checks cover the image-only display, caption visibility, all three
recent additions on both floors, original image dimensions, and E opening and
release. The existing `check-escape-wall-art.mjs` harness and its screenshots and
JSON under `Browser/artifacts/escape-wall-art-*` were refreshed with zero page or
shader errors. The full 55-check browser suite passes; its output is saved in
`Browser/artifacts/escape-wall-art-captions-suite.txt`. Only browser rendering/CSS
changed; image files, navigation and
Unity, Blender, GLB and compiled aerial exports are unchanged.

## Half-second E interactions (September 18)

Stair transfers and all five exits now use the shared 0.5-second hold duration in
`Browser/dist/game.mjs`, including the touch USE control. Their progress bars use
the same duration. Hold timers use elapsed frame time separately from the bounded
movement step, so low frame rates do not stretch the interaction delay. Artwork
continues to open immediately while E is held and closes on release.

`Browser/test-game.mjs` verifies the 0.49/0.5-second stair boundary, both staircases,
held-key latching, cancellation on release, 50% progress after 0.25 seconds, and
half-second stair/exit interactions at four frames per second. The full browser
suite output is saved in `Browser/artifacts/interaction-half-second-suite.txt`.
Only browser gameplay code and checks changed; model assets and exports are
unaffected.

## Detailed security guard and walking animation (September 18)

The browser Asylum Escape guard now uses `Browser/dist/security-guard.mjs`.
Its navy uniform has a folded collar and tie, epaulettes, pockets and buttons,
shield badge, name plate, chest/back SECURITY patches, radio and antenna,
duty belt, pouches, key ring, wristwatch, trouser creases and laced boots.
The face has shaped ears, nose, jaw, eyes and eyebrows under a peaked cap.
This is a fictional security uniform consistent with the game's character,
not a historically researched 1829 uniform.

The model has hip, knee, ankle, shoulder and elbow joints. Actual horizontal
NPC displacement advances the stride, so pursuit increases the cadence and
an empty route settles to standing. A two-bone leg solve keeps the boots level,
with floor contact during the stance and clearance during the swing.
The upper body counter-turns and the arms swing opposite their corresponding
legs. The old whole-guard vertical bob is removed. Head start, pause/help,
hold-E, artwork inspection, cutscenes and restart preserve their existing
gameplay behavior. Floor offsets and visibility still follow the NPC's floor.

Rigid details are merged within each joint: the geometry check measures
53 meshes and 8,788 triangles without lettering; browser canvas patches add
one merged mesh and four triangles. No downloaded character assets or extra
runtime lights are needed. This changes browser sources only; Unity, Blender
and GLB exports are unchanged. The precompiled aerial model does not contain
game characters and does not require a rebuild.

Validation: the full `npm test` suite passes, including
`test-security-guard.mjs` (leg articulation, sole clearance, stationary settle,
frame-rate-independent stride and reset) and `test-game.mjs` (actual patrol and
chase movement, pause/interaction freezes, upstairs visibility and head start).
`node Browser/check-security-guard-browser.mjs` runs the real WebGL review;
set `MODEL_CHROME_PATH` when using a locally installed Chrome. Front/side/back,
upstairs and mobile screenshots and the validation JSON are saved under
`Browser/artifacts/security-guard-*`. The rendered model was visually checked,
and the real pursuit/hold-E checks passed with no page or Three.js errors.

## Random pursuer starts (September 18)

Each Asylum Escape launch and restart now chooses fresh ground-floor positions
for Security and the Deva asylum ghost. Candidates are reachable walkable cell
centres at least 12 scene units from Reception, outside exit and staircase
interaction areas. The pursuers start at least five units apart, and neither
reuses its previous starting cell on a restart. Positions are chosen once by
`start()` and retained through the arrival handoff; the existing five-second
head start and pause/resume behaviour remain intact. This supersedes the older
fixed-spawn notes above.

Validation: `Browser/test-game.mjs` covers 24 launches/retries with seeded and
repeated boundary random values, clearance, reachability, changing positions,
mesh placement, arrival stability and the head start. The full browser
`npm test` suite passes. A Chrome/WebGL check exercised the actual Start and
Restart buttons across three runs with distinct starts and no page errors;
results and a map capture are saved as
`Browser/artifacts/random-enemy-spawns-validation.json` and
`Browser/artifacts/random-enemy-spawns-map.png`. Only browser runtime code,
tests and documentation changed; navigation/model assets and Unity/Blender
exports were not regenerated.

## Minimap legend colours (September 18)

The minimap labels now match the canvas markers: You `#fff8db`, Ghost
`#8fe0c4`, and Security `#e1c278`. The Walls legend entry is removed.
Only the browser HTML and CSS change. Desktop (1300 × 900) and mobile
(390 × 844) Chrome screenshots under `Browser/artifacts/minimap-legend-*`
were visually checked; computed label colours match and there are no page
errors. `Browser/test-game.mjs` and the full browser `npm test` suite pass.
