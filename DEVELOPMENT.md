## West apron planters and return path (24 September 2026)

Removed the three marked beds and long shrub border. Added matching paving
along the outer garden edge to the stair-side walk. See Research/west/README.md.
Browser sources and local compiled model updated; Unity and Blender unchanged.
Visual, west geometry, exterior, walking, compiled/source, full-detail and
timeline checks pass. Final compiled fingerprint matches source. The full suite
stops at the Jarman whole-estate snapshot, which includes changed landscaping;
its baseline was not rebased. Timeline checks passed with separate output files
after a screenshot save error. Artifacts use Browser/artifacts/west-planters-.

## West entrance landscape cleanup (24 September 2026)

Removed both outer-west doorway hedges and the short garden entrance railings.
Extended the doorway path straight to Parsons Lane, retaining its width and axis.
See `Research/west/README.md`. Browser sources and local compiled asset updated;
Unity and Blender exports unchanged.

West geometry, full path walking clearance, exterior geometry, visual inspection,
compiled/source comparison (including full detail) and timeline checks pass.
The compiled fingerprint is current. `npm test` stops at the previously documented
Jarman preservation snapshot mismatch; its baseline was not changed. Logs use
`Browser/artifacts/west-entrance-*`; the checked overview is
`Browser/artifacts/west-aerial-entrance-cleanup.jpg`.

## Churton remaining lawn rim (24 September 2026)

The follow-up annotation exposed the raised lawn slab's front face and cast
shadow. Replaced it with a flat, non-shadow-casting lawn plane at the same
surface height. It retains grass texture, received shadows and gravel coverage.
Close-up visual inspection and the Churton geometry/walking check pass. The
compiled asset was regenerated and source/compiled checks, including full
detail, pass. The full browser suite stops at the Jarman preservation snapshot
mismatch; its baseline was not changed. See `Research/churton-kelsall/README.md`.
Browser source and local compiled output changed; Unity and Blender exports
were not regenerated. Logs use `Browser/artifacts/churton-lawn-edge-*`.

## Red-circled entrance props (24 September 2026)

Removed both west Reception ground fittings and the east hedge-side bare sapling
with all branches from the shared browser builders, in every period. See
Research/timeline.md. Unity and Blender exports are unchanged.

Entrance/exterior geometry checks pass and the source preview was visually
checked (Browser/artifacts/red-circled-removed.png). The full suite encountered
a separate tree-collision assertion during concurrent edits. An initial aerial
build succeeded, but later source changes invalidated it; subsequent rebuilds
were rejected because sources changed during compilation. Compiled validation
therefore remains incomplete. Unrelated assertions were not rebased.

## Churton roadside hedge and paving cleanup (24 September 2026)

Removed the marked church-facing hedge and redundant gravel lane slab whose
ends protruded below the shared road. See `Research/churton-kelsall/README.md`.
Source visual inspection confirms both road edges are clear. Existing Churton
walking/geometry and historic-road checks pass. The full suite was attempted
and stopped on an unrelated Redesmere tree-layer assertion during concurrent
scene editing. Source/compiled normal-detail comparison passed, but subsequent
concurrent edits invalidated the asset at the full-detail check. A final rebuild
was rejected because source changed during compilation; the development server
will fall back to the updated source until a stable rebuild completes. Browser
source changed and earlier local compiled builds succeeded; Unity and Blender
exports were not regenerated.

## Red-circled main-building trees (24 September 2026)

Removed sixteen marked broadleaves, the west front garden tree and rear
courtyard birch. Planter beds, shrubs and unmarked trees remain. Removed trees
consume their original random draws and crown rotations to preserve remaining
shapes. Their trunks no longer enter walking collisions.

Browser sources and local compiled aerial asset updated; Unity and Blender
exports unchanged. See Research/main-tree-removal/README.md.

## Oak31–Oak44 import (24 September 2026)

Imported all fourteen requested Point placemarks from `1829 (13).kml` into
Historic, Modern and every timeline period through the shared Trees layer.
Exact positions, earlier rotations, tree visibility and collisions are preserved.
Oak34/Oak35 intentionally retain their shared map position from the source.
See [tree source and modelling notes](Research/kml-trees/README.md).

Browser sources and the local compiled aerial asset are updated; Unity and
Blender exports are unchanged. Validation artifacts use `Browser/artifacts/kml-13-`.
Exact KML/period/collision, Modern tree retention, shared-buffer/performance,
source/compiled comparison and timeline browser checks pass. Source 1829 and
compiled 2021 previews were visually inspected. The full suite was attempted
and stopped at a Larkton preservation snapshot mismatch in the shared working
project; a separate Jarman preservation check also reports a hash mismatch
with unchanged primitive count. Those unrelated snapshots were not rebased.

## Oak22–Oak30 and Pine14 import (24 September 2026)

Imported ten new tree Point locations from `1829 (12).kml` onto the shared
Trees layer for all timeline periods and both layouts. Repeated older locations
are not duplicated; previous placements and rotations remain unchanged. See
[tree source and modelling notes](Research/kml-trees/README.md).

Browser sources and the local compiled aerial asset are updated; Unity and
Blender exports are unchanged. Exact coordinate, visibility, collision, shared
geometry, source/compiled and timeline browser checks pass. Preview and test
artifacts use the `Browser/artifacts/kml-12-` prefix. Every browser suite script
passes after updating tree counts and excluding only the ten additions from
the existing Jarman/Leighton preservation baselines.

## Oakmere bay and annex placement (24 September 2026)

Validation: source and rear visual checks, bay/annex geometry and walking
assertions pass. The source/compiled comparison and all timeline stops passed
on the first rebuilt asset. Concurrent changes elsewhere in the shared
workspace subsequently invalidated historical preservation snapshots; the full
suite stopped in the Larkton preservation check, and the whole-annexe Oakmere
fingerprint also changed. These unrelated snapshots were not rebased here.
Live Oakmere assertions were rerun independently and passed.


Extended the courtyard bay to the marked blue guide and moved the square
annex behind the cross-head, with its entrance facing the rear lawn. Roofs,
facade details, shrubs and walking collisions follow the new placement. See
[reference and dimensions](Research/oakmere/README.md#bay-depth-and-rear-annex-placement--later-24-september-2026-correction).

Browser model source and the local compiled aerial asset are updated; Unity
and Blender exports are unchanged.

## KML willow planting and concrete lamps (24 September 2026)

Imported the two surviving lamps, Willow1–Willow8 and the second distinct
Oak21 from `1829 (11).kml`. Existing Oak21 is retained once. Trees use the
shared procedural template system on all periods; lamps use a photo-based
low-poly concrete swan-neck prefab from 1915 onward. Saved Locations views
and navigation reach the far-north willows. Coordinate duplicates are retained
exactly. See [source and modelling notes](Research/kml-trees/README.md).

Browser source and the local compiled aerial model are updated; Unity and
Blender exports are unchanged.

Validation: every browser test script passes (the full run reached its final
photo-catalog check; that check passed after registering the three landscape
destinations). Source/compiled comparison and every browser timeline stop pass.
Final source/compiled lamp and willow previews have no page errors. The compiled
manifest matches the current source. Logs/previews: `Browser/artifacts/kml-11-*`.

## Larkton/Jodrell recessed ward connection (24 September 2026)

Moved the entire retained Larkton/Jodrell wing seven map units left and replaced
its solid Tarvin/Jarman join with the photographed stepped entrance: recessed
arch, tall cheek, rear upper range and low projecting room. Paving and saved
views follow the move; the Parsons junction and neighbouring wards stay fixed.
See [reference, assumptions and preservation checks](Research/larkton-jodrell/README.md#recess-between-larktonjodrell-and-tarvinjarman--24-september-2026).

The dedicated regression protects retained geometry and neighbouring wards and
checks door visibility and walking collisions. Historical snapshots were updated
after that independent check. Browser source and the generated aerial asset are
updated; Unity and Blender exports are unchanged.

Validation: all 68 browser-suite commands pass; the final photo-selection check
was rerun after moving its probes to the revised frontage and recessed roof.
Source/compiled rendering comparison and the rebuilt combined scene timeline
pass. Final oblique, close and ground-level previews render without page errors.

## Rear courtyard guide-line alignment (September 24)

The marked west rear range moves left to the blue guide; the angled Oakmere
head moves right to the purple guide. The overlapping low connector and rear
end room are removed completely. The moved blocks retain their shapes,
heights, roofs, windows and chimneys. Courtyard paving, walking collisions and
saved building views follow the correction. See
[the reference and measurements](Research/annexe-kitchen/README.md#rear-side-alignment-and-connector-removal--24-september-2026).

The dedicated preservation test retains 21,782 primitives and independently
checks both image guide lines, the cleared passage and expanded paving.
Concurrent east-veranda edits are preserved and isolated for this comparison.
Validation: the full browser suite, compiled/source comparison, timeline checks,
walking collisions and final source/compiled visual previews pass.

Browser source and generated aerial models are updated; Unity and Blender
exports are unchanged.
# Development and modelling notes

## Larkton/Jodrell courtyard and Parsons road (24 September 2026)

Removed the marked west rear return and shortened its rear pavilion. New
asphalt paving wraps the retained building and meets the front range, leaving
a small green courtyard. A curved five-metre access road follows the blue
reference from the existing Parsons Lane bend to the court, with an open
junction. See [the annotation and footprint notes](Research/larkton-jodrell/README.md).

The focused regression verifies paving contact, retained grass, removed
roof/collision geometry, full-width access and timeline visibility. The
independent pre-edit comparison preserves 18,942 non-Larkton primitives,
normalizing only the concurrent entrance-depth change in an isolated check.
Browser sources and the regenerated local aerial model change; Unity and
Blender exports are unchanged.

Validation: all 64 browser test commands pass, as do the rebuilt source/compiled comparison and every timeline stop. Source and compiled overhead and close previews render without page errors. Logs and screenshots use `Browser/artifacts/larkton-`.


## Tower-side stores door, base and roof edge (24 September 2026)

Added a pale-blue panelled door between the two west-facing windows beside
the water tower, with matching stone surround, handle and threshold. The
brick parapet and stone coping now continue from the flat front along both
exposed edges of the adjoining roof, retaining the tower arch contact and
uninterrupted flat-deck joins. Stacking the flat-front walls above the plinth
removes the coincident faces that caused the marked texture flicker.
See `Research/tower-buildings/README.md` and its saved annotated reference.

All 62 browser test scripts, compiled/source comparison and every timeline
stop pass. Focused geometry checks cover the door,
continuous coping, base separation, roof contacts, kitchen clearance and
walking collisions. Source and compiled close, overhead and door-level
previews render without page errors; images and validation logs use
`Browser/artifacts/tower-stores-`. The local compiled aerial model has been
regenerated. Browser sources and that generated asset are updated; Unity
and Blender exports are unchanged.


## Annexe marked side correction (September 24)

The latest annotation replaces the tall rear tower glazing with two high
sashes, removes the east brick bay, and gives the glazed conservatory that
bay's exact canted footprint. The side wall now follows the purple step and
recess, with matching polygon walking collisions. The incorrect pair of side
dormers is removed; three rear hall projections reuse the accepted front
geometry reflected through the ridge. The tall spine is shortened at the
hall and joined by a low hipped connector so the rear windows remain exposed.
The front-facing geometry, towers and belfry retain their original shapes.
See [the latest correction](Research/carden-picton/README.md#marked-correction--24-september-2026).

The independent pre-edit comparison retains 21,445 unaffected primitives.
Browser sources and the rebuilt aerial asset change; Unity and Blender do not.
The earlier Carden description below records the superseded first pass.
## Chimney relocation (24 September 2026)

Moved the freestanding estate chimney from (177.5,-35.5) to (167,-37), matching
the new red X beside the tower's low service buildings. The complete chimney
retains its size and materials. Placement notes and the supplied reference are
in Research/tower-buildings/README.md.

The full Browser npm test suite passes, including chimney/building clearance,
base collisions, Historic visibility and nearby walking routes. Regenerated
the compiled aerial model and visually checked both source and compiled views;
both load at the new position without page errors. Preview evidence is saved
as Browser/artifacts/chimney-relocation-after-source.png and
Browser/artifacts/chimney-relocation-after-compiled.png. Browser sources and
local compiled assets are updated; Unity and Blender exports are unchanged.


## Detailed emergency exits (September 24)

Asylum Escape's selected routes now have framed, weathered green doors with
panic-bar mechanisms, bolted kick plates, hinges, grooved thresholds and door
closers. Framed illuminated signs show the running-person pictogram, exit
number, route name and forward arrow; separate instruction plaques sit above
the bars. Geometry stays in the existing architecture batches, with a shared
seeded paint texture and no additional point lights. Four-way orientation,
route selection, navigation and escape timing are preserved. See
[the finish notes](Research/escape-interior/README.md#emergency-exit-fittings-september-24).

Validation: 61 of the 62 scripts in `npm test` pass, including all exit-route,
game-loop, architecture and lighting checks. The final building-photo check
fails on the unrelated compiled aerial estate-chimney selection; the existing
compiled manifest hash differs from the current aerial source hash. The log is
`Browser/artifacts/emergency-exits-suite.txt`. The real Chrome/WebGL check
`node Browser/artifacts/check-emergency-exits.mjs --quick` passes five selected
keyboard escapes, active/inactive geometry and lamps, artwork clearance, maps,
retry stability and desktop/mobile rendering with no browser errors. Reviewed
screenshots and its report use the `emergency-exits-` prefix. The harness uses
an automatically assigned local port because Windows reserves port 1829 on
this machine.

Only browser game sources are changed; no Unity, Blender, GLB or aerial
compiled exports are regenerated for this interior-only refinement.

## Mobile walking controls (September 24)

Explore on foot now has four touch movement arrows and supports dragging the
scene with a second finger to look while walking. Touch starts movement directly,
without pointer lock. The pad shares the existing walker speed, diagonal
normalization and collisions. Keyboard and touch states remain independent;
pointer release, cancellation, capture loss, navigation/timeline focus, tab hiding
and window blur clear the appropriate inputs. Touch instructions and controls fit
portrait and landscape screens, while desktop retains WASD and mouse look.

`npm test` includes `test-explore-input.mjs` for input lifecycle regressions.
`npm run test:mobile` uses Playwright/Chromium for real multitouch events, actual
camera movement, timeline/navigation access and desktop keyboard/drag regression.
Set `MODEL_CHROME_PATH` if using a locally installed Chrome. Visual checks cover
390×844 and 320×568 portrait, 844×390 and 568×320 landscape, and desktop;
captures use `Browser/artifacts/explore-mobile-`. The full browser suite passes
(`Browser/artifacts/explore-mobile-suite.log`). Only browser controls and UI
changed; model geometry and generated exports are unaffected.

Validation: all 62 browser test scripts pass. Rebuilt source/compiled comparison, every timeline stop, and the seven source/compiled Carden views pass without page errors. The annotation and plan views confirm the canted conservatory, stepped footprint and all three rear hall projections. Logs and images use Browser/artifacts/annexe-carden-correction-.

## Annexe Carden/Picton side photo (September 24)

The east/rear lawn photo now refines the steep side roof with two arched
terracotta dormers, a blind cross-gable and chimney, low hipped side rooms,
white glazed porch and the near tower's rear stair glazing. The original
front-facing geometry, two square towers and belfry remain fixed. The west
spine roof surface retains its exact vertices; only the east eave and upper
masonry are reshaped. This supersedes the earlier mirrored-east-slope inference.
See [the reference and preservation notes](Research/carden-picton/README.md).

Use **Annexe: Carden side photo** in Locations, or
`aerial.html?view=annexe-carden-photo`; the matching walking view starts on
the lawn. The shared browser source and rebuilt aerial model change; Unity
and Blender exports are unchanged. The independent check retains 21,929
original primitives outside the two permitted spine meshes and the original
1,705-primitive central-front fingerprint. The concurrent entrance-corridor
restoration is independently normalized and tested, retaining both tasks' work.

Validation: all 61 browser test scripts pass, as do the rebuilt source/compiled comparison and every timeline stop. The source and compiled photo, close, overhead and front previews render without page errors, and the Carden WALK HERE link retains its viewpoint and selected period. The new-geometry ray check keeps both tower roofs and the belfry clear from the reference direction. Logs and screenshots use Browser/artifacts/annexe-carden-.

## Annexe rear wall moved to the yellow guide (September 24)

The latest marked view supersedes the earlier 15% depth increase. The rear
wall moves a further 7.089 metres, to map z=-54.35. The court stays anchored
to the central spine; its width and height stay fixed. Both attached rear
blocks translate by the same amount, and the paving and access lane extend
with the court. The front geometry and whole-annexe placement remain fixed.
The rear overview uses a fixed camera matched to the supplied annotation.
See [the reference and measurement](Research/annexe-kitchen/README.md#rear-wall-aligned-to-the-yellow-guide--24-september-2026).

The independent check retains the original front and rear-block baselines,
checks the yellow-line projection, and verifies continuous joins. Walking,
window exposure and the original central-frontage fingerprint pass.
Browser source and the generated aerial asset are updated; Unity and Blender
exports are unchanged.


Validation: all 59 browser checks, compiled/source comparison, every timeline stop, and the source/compiled alignment and kitchen preview pass. The generated model source hash matches the current source. Logs and comparison images use Browser/artifacts/annexe-rear-alignment-; additional views use annexe-kitchen-alignment-after-.

## Annexe rear court 15% longer (September 24)

The yellow-circled kitchen/courtyard block is 15% deeper away from its fixed
join to the central spine. Widths and heights stay unchanged. Both attached
rear wings translate backwards by 3.781 metres, retaining their geometry,
window spacing and roof shapes. The annexe front and current centring remain
fixed. Court paving and camera views follow the extension; end connectors
retain clear windows and continuous joins. See the
[reference and exact transform](Research/annexe-kitchen/README.md#rear-court-depth-correction--24-september-2026).

The independent rear-stretch check compares against a captured pre-edit
baseline and verifies the 15% ratio, fixed front/root, unchanged rear-block
shapes and joined connector. The shared browser source and generated aerial
model are updated; Unity and Blender exports are unchanged.


Validation: all 59 checks in npm test pass, as do npm run test:compiled and the source/compiled rear-court, photo, plan and front preview. The preservation check retains 16,365 unaffected primitives and all 3,011 primitives in the two rigidly moved rear blocks. Logs use Browser/artifacts/annexe-rear-stretch-; images use Browser/artifacts/annexe-kitchen-stretch-.


## Annexe rear kitchen and paved access court (September 24)

The supplied kitchen photograph and landmark annotations replace the enclosed
rear court with a lower four-bay kitchen, steep slate roof, ridge ventilator,
blue service doors and a narrow rear access opening. The whole court and its
short access lane are paved. The annexe's root placement, front-facing parts,
both earlier Oakmere photo assemblies and the surrounding estate roads retain
their geometry. See [the reference and scope notes](Research/annexe-kitchen/README.md).

The new **Annexe: rear kitchen** location works in aerial and walking views;
`aerial.html?view=annexe-rear-court` shows the access opening from above. The
unaltered source photograph is also included in the Annexe's photo gallery.
The shared browser model and generated aerial binary are updated. Unity and
Blender exports are unchanged.

Validation: the new kitchen check verifies 20,041 protected primitives,
continuous paving, the roof-free access lane, four exposed openings, roof
normals, actual walking into the court and stopping at the kitchen, and
Historic visibility. The existing 1,705-part central frontage fingerprint
is unchanged. All browser suite checks pass, with the final building-photo
check rerun after adding the new location's gallery mapping. Binary-format,
compiled/source comparison and every browser timeline stop pass. Source and
compiled rear overview, photo direction, plan and retained front views are
captured by `Browser/artifacts/annexe-kitchen-preview.mjs`; reports and images
use the `annexe-kitchen-` prefix.


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
aerial supplies its overall setting. An earlier review set the annexe plan to
72% of the OS footprint and brought it closer to the red frontage line. The
September 21 annotation then reduces the complete building to 90% of that
accepted size on all three axes (64.8% plan scale), without editing its local
geometry. Scaling is anchored at the entrance-facade centre, keeping that point
on the fixed asphalt forecourt and yellow approach axis. The paving, avenue,
teardrop and other site geometry remain fixed. The resized annexe fits inside
the Parsons loop and clears the teardrop. See the [current placement and frontage](Research/annexe-frontage-adjustment/README.md),
[initial aerial correction](Research/annexe-photo-placement/README.md)
and [OS shape comparison](Research/annexe-os-refinement/README.md), or open
`aerial.html?view=annexe-plan`. The **Annexe / Main · aerial photo** location
shows the wider relationship. Focused placement, access, ward and preservation
checks pass, as do the full browser suite and compiled/source parity checks.
The browser precompiled scene was regenerated; Blender and Unity exports remain
unchanged. This supersedes the earlier dimensions and placement described below.

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

## Annexe forecourt centring by equal grass widths (September 24)

The clarified placement request uses the grass strips between the fixed paved
apron and the projecting court wings, rather than the central doorway. The
inward ward faces sit at map x=-27 and x=20, so the annexe moves sideways by
3.676 scene units to centre their midpoint. Both grass gaps are 5.309 units.
The 90% scale, local geometry and frontage setback remain unchanged.

`annexe-photo-placement.mjs` records this alignment separately from the fixed
site/paving frame. The placement regression measures actual masonry faces
against the paving edges and checks the protected apron/step-approach snapshot.
See [the updated frontage notes](Research/annexe-frontage-adjustment/README.md)
and the supplied reference there. This changes the browser model and its
compiled aerial asset; Unity and Blender exports are unchanged.

Validation: `npm test` and `npm run test:compiled` pass after rebuilding the
aerial asset. Source and compiled front, overhead and site views render without
page errors (`Browser/artifacts/annexe-centre-*`). Existing building-preservation
snapshots still match: their comparisons now compose local transforms directly,
avoiding translation-dependent rounding, while the legacy drives retain their
world-space checks. No approved geometry snapshot was replaced for this move.

## Annexe paving extended to the front walls (September 24)

Matching asphalt fills the blue-marked gaps against the recessed entrance and
its two pavilion faces. `annexe-access.mjs` derives the added paving from the
placed front ranges, including the narrow side recesses, and removes the old
kerb across the join. The original apron, building position and equal side
grass widths stay fixed. The existing access test now checks continuous asphalt
from the actual masonry faces back to the apron. Reference and scope are in
[the frontage notes](Research/annexe-frontage-adjustment/README.md). Browser
sources and compiled aerial assets are updated; Unity/Blender exports are unchanged.

Validation: the frontage surface and equal-grass placement checks pass.
The aerial asset was rebuilt; source/compiled comparison, browser timeline
checks and close front/overhead screenshots pass without page errors.
`npm test` stops at the unrelated `test-annexe-wards.mjs:18` expectation that
every ward group remains at local (0,0,0), which conflicts with the current
rear-wing stretch. That assertion is outside this paving change.
All 22 checks after that failure were run separately and pass; see `Browser/artifacts/annexe-paving-suite-remaining.log`.

## Annexe entrance corridor restored (September 24)

The short left entrance corridor is reflected onto the right, with the complete
east courtyard and outer ward assemblies shifted seven map units (7.351 scene
metres) outward. Their shapes and details remain intact. The inward courtyard
faces now mirror across the central entrance, while the central building,
accepted root position, paving and roads remain fixed. The right grass strip
therefore widens. See the reference and preservation scope in
[the frontage notes](Research/annexe-frontage-adjustment/README.md).

`annexe-front-links.mjs` applies the two group translations and copies the whole
link during construction, before render batching and obstacle generation.
Ward views and range/opening metadata follow the moved geometry. The independent
corridor regression preserves 21,929 pre-edit primitives outside the separate,
concurrent Carden roof work and checks the joins, exposed glazing, mirrored
inner faces, walking collisions and Historic visibility. Browser source and
compiled aerial models are updated; Unity and Blender exports are unchanged.

Validation: all 61 browser checks pass, along with the final corridor/Carden preservation checks, source/compiled rendering comparison and every timeline stop. The compiled source fingerprint is current. Front and overview images under `Browser/artifacts/annexe-front-link-final-compiled-*` were visually reviewed. Timeline validation used its own artifact folder after concurrent runs collided while writing a shared screenshot; the isolated rerun passes.

### Annexe conservatory and roof correction — 24 September 2026

Moved the Carden conservatory outward 8.87 local units so its back edge follows
the marked side-wall line; retained its canted outline and glazed its newly
exposed edge. Lowered the central spine to 4.7-unit eaves / 6.6-unit ridge,
including its masonry and windows. Added a tower-side gabled range with three
side sashes and a low connection joining the conservatory. Reference and
geometry rationale: `Research/carden-picton/README.md`.

The dedicated Carden check verifies preservation outside this change and the
concurrent Jarman frontage, roof levels and joins, exposed glazing, footprint
translation and walking collisions. Browser source and generated aerial assets
were updated; Unity/Blender exports were not regenerated.

## Jarman lawn frontage — 24 September 2026

The supplied red outline and blue camera marker replace only the west courtyard
front elevation with the photographed Jarman frontage. The reference, dimensional
assumptions and scope are recorded in [Research/jarman/README.md](Research/jarman/README.md).
The browser model now has the 2/3/5/3 upper sash arrangement, detailed projecting
gables, ventilated brick stacks and the glazed blue-trimmed lean-to veranda.
The building’s accepted footprint and surrounding ward/site geometry are retained.

The Locations menus include **Jarman lawn photo** (`annexe-jarman-photo`) in both
aerial and walking modes. The new veranda participates in walking collisions.
Dedicated checks verify exposed glazing, roof coverage, walking, ward ownership
and unchanged geometry outside the marked elevation. Historical annexe snapshots
were refreshed after independent old/new facade construction confirmed preservation.
The shared browser sources and compiled aerial asset are updated; Unity and Blender
sources and exports are unchanged. Logs and views use `Browser/artifacts/jarman-*`
and `Browser/artifacts/annexe-jarman-*`.

Validation: all 63 browser-suite scripts pass. The rebuilt source/compiled comparison and every timeline stop pass. Final source and compiled lawn, oblique, overview and plan views render without page errors; the lawn viewpoint links to the matching walking view. Final visual review confirms the veranda joins and unchanged courtyard layout. The compiled asset was rebuilt again after whitespace-only cleanup and its final viewpoint previews confirm compiled loading.

The later marked correction shortens both complete square towers and the new
Carden high roof by exactly 15%, keeping x/z fixed. The low rear link extends
6.5 local units to z=-36.5 while retaining its existing hipped-roof form. The
user withdrew the roof-shape request. The conservatory's geometry, glazing,
materials and position are unchanged, independently verified against
`Research/carden-picton/height-extension-before.json`. The new height test is
included through `test-annexe-carden.mjs`; source previews pass without errors.

Final height/extension validation: the full `npm test` suite passes, including
both Carden checks and the concurrent Jarman check. `npm run test:compiled`
passes source/compiled geometry and image comparison, full-detail loading,
fallback checks and every timeline stop. Seven source and compiled Carden
previews pass without page errors. Logs use `Browser/artifacts/carden-height-`;
final images use `Browser/artifacts/annexe-carden-height-final-`.
The shared Jarman preservation snapshot was updated only after an isolated
pre-height replay matched its prior 861,075-primitive baseline and the exact
height/conservatory checks passed.

## Annexe central entrance and paving alignment (September 24)

The latest yellow/green/purple annotation deepens only the low entrance range,
from source-map z=15 to z=21 with its rear fixed at z=10. The complete portal,
roof, windows and steps follow the new front. The apron narrows to map
x=-10.5/+10.5 and centres on the doorway. The existing sweep and both kerbs move
right as one rigid assembly, retaining every curve vertex and both joins onto
the oblique avenue. The historical fixed-apron requirement is superseded.
See [the frontage notes](Research/annexe-frontage-adjustment/README.md).

The independent pre-edit geometry comparison confirms that only the low
entrance changes; 21,719 other annexe primitives remain exact. The access,
walking, alignment and preservation checks pass. The rebuilt aerial asset
passes source/compiled and timeline validation, and source/compiled front,
plan and overview screenshots were visually checked. The browser suite stops
at the Jarman global geometry snapshot, which also fails with the original
entrance restored in an isolated process; every subsequent test passes when
run separately. Logs are in `Browser/artifacts/annexe-entrance-alignment-*`.
Browser sources and compiled aerial assets change; Unity/Blender exports do not.

## Annexe east outer wing and veranda — 24 September 2026

The latest red/yellow/blue annotation removes the east inner return and raised
cross-room, exposing the existing continuous single-storey rear-link roof in
the yellow area. The road-facing blue recess now has an open slate veranda
with braced timber posts, pale fascia, blue trim and a paved sheltered walk.
Its vocabulary follows Grafton/Edge and the annexe's existing veranda details.
Reference dimensions and interpretation are in
[Research/annexe-east-outer/README.md](Research/annexe-east-outer/README.md).

The change is constructed before batching and walking-obstacle generation.
The dedicated east-wing check confirms the removed footprint is clear,
the lower roof is continuous, the canopy faces upwards, post bases collide,
the walk remains accessible, and the retained east-wing geometry is unchanged.
Browser source and the compiled aerial asset are updated; Unity and Blender
sources/exports are unchanged. Source and compiled plan, overview and veranda
views were inspected under Browser/artifacts/east-outer-*.

Final validation: all 66 browser-suite scripts pass in npm test, including the
new east-wing check. The rebuilt source/compiled comparison, fallback checks
and every timeline stop pass. The compiled source fingerprint is current.
The independent retained-wing snapshot preserves 2,516 primitives. Historical
whole-annexe snapshots were refreshed alongside the concurrent rear-side work;
initial and final results are retained in Browser/artifacts/east-outer-* logs.

### Oakmere rear courtyard — 24 September 2026

The blue-marked angled wing now extends across its full width into the green
rear wall. A square low annex occupies the red-marked area behind the service
head. The supplied photo adds a projecting hip-roof bay, pale divided windows,
brick bands, pipes, an entrance landing/handrails and evergreen planting. The
unaltered photo is Oakmere's own gallery image; cars are omitted. See the
[reference and scope notes](Research/oakmere/README.md#rear-courtyard-join-and-square-annex--24-september-2026).

The additive assembly is constructed before batching and obstacle extraction.
The dedicated test independently checks the join and retains all 21,256
pre-existing annexe primitives, including concurrent Larkton work. Historical
fingerprints exclude only this separately tested addition. Browser sources and
compiled aerial assets change; Unity and Blender exports are unchanged.

The follow-up blue/green photo circles lengthen the court-facing cross-head
outward by 14 map units. The low square annex follows that end, improving its
visibility from the reference direction. The long green wing and existing
rear-wall connection are retained. The new head roof is continuous over the
former end hip; collision coverage and the moved annex are checked.

Oakmere validation: dedicated geometry/preservation and annex-sightline checks
pass; source and compiled plan/detail/gallery previews load without page errors.
The compiled/source comparison and every timeline browser check pass. Final
images use `Browser/artifacts/oakmere-court-final-`; test/build logs use the
`oakmere-court-` prefix.

The full browser suite and its remaining-check rerun leave one unrelated failure: test-building-photos.mjs expects the concurrent willow-planting location in the building catalogue. Oakmere's source/compiled gallery browser check passes. The earlier concurrent oak-count assertion passes after its separate update. See oakmere-court-suite-corrected.log and oakmere-court-suite-remaining.log.

## Gravel path and Parsons fork � 24 September 2026

Moved the marked gravel link six units north toward the blue guide, retaining
its width and angle and joining the existing service-side asphalt. Replaced
the double-width Parsons fork with a single six-unit curve that branches beyond
the mapped tree crowns. The Irby corridor's old dependency on the path endpoint
is removed so this path adjustment preserves the corridor and attached wards.

Road continuity, full-width building clearance, tree-crown clearance, annexe
access and ward-corridor checks pass. Source oblique and plan previews are saved
as `Browser/artifacts/road-alignment-final-*.jpg`. The full browser suite stops
at the unrelated saved annexe geometry assertion in
`Browser/artifacts/snapshot-annexe-shape.mjs`; no annexe geometry was edited.
Browser compiled assets were rebuilt. Unity and Blender exports are unchanged.

### Collapsible Selected Period panel, 24 September 2026

The aerial and explore pages use a native details/summary control for Selected
Period. It starts expanded and collapses to a 220-by-46-pixel bar. Mouse, touch,
Enter and Space use the browser's built-in disclosure behavior; reopening keeps
the selected period. The slider retains its accessible Estate period name.

Validation: `Browser/artifacts/check-period-collapse.mjs` passed on both pages
at 1280x900 and 390x844, checking collapse, keyboard reopening, retained selection
and subsequent period changes. Desktop aerial and mobile explore screenshots
were visually checked. `test-explore-input.mjs` and `test-aerial-controls.mjs`
passed. The full `npm test` run stopped in `test-larkton.mjs` at the unrelated
original-geometry comparison in `artifacts/check-larkton-original.mjs:7`; output
is in `Browser/artifacts/period-collapse-suite.txt`. No models or exports changed.

Final validation: the refreshed compiled model loads in compiled mode, and
`test-timeline-browser.mjs` passes all source/compiled timeline and walking
checks. Final compiled previews are `Browser/artifacts/road-alignment-verified-*.jpg`.
A subsequent access recheck passes the road assertions but reaches another
annexe snapshot mismatch in `annexe-entrance-alignment-scope.mjs` after concurrent
annexe edits; those unrelated building snapshots were not changed here.

## Leighton / Newton photographic refinement — 24 September 2026

The red/blue camera directions in the supplied ward annotation distinguish the
inner L elevation from the outer veranda frontage. The existing L dimensions,
22-degree turn, position and rearward translation are retained. The browser
ward now has photo-based projecting gables and hips, a veranda, pale divided
upper sashes, boarded lower openings, blue arched entrance, brick bands and
multi-pot chimneys. The two original photos are in its gallery, with dedicated
inner and outer Locations views. See [reference notes](Research/leighton-newton/README.md).

The independent preservation check matches all 923,701 non-ward estate
primitives. Window exposure, collision, clear veranda access, camera starts,
roof normals and Historic visibility are checked in test-leighton-newton.mjs.
Earlier whole-annexe fingerprints were updated after that preservation proof.
Browser sources and compiled aerial assets change; Unity/Blender do not.

Leighton/Newton final validation: the full npm test suite passes, as do the
source/compiled model comparison, fallback checks and every timeline stop.
Both photographed directions and the overview render in source and compiled
modes without page errors; final images were visually inspected. Results use
Browser/artifacts/leighton-; the timeline rerun writes separate artifacts to
avoid a shared screenshot file lock.

## Annexe loop and frontage roads — 24 September 2026

Straightened the marked outer access road and fitted the complete annexe inside
it at 85% of its previous plan size, retaining all heights and local detail.
The follow-up annotation shifts the frontage avenue toward the building,
replaces the stretched entrance flare with quarter-circle edges, relocates
the gravel path and original triangular junction, and removes the pink
approach. References, dimensions and superseded historical constraints are
in [the road notes](Research/historic-roads/README.md#annexe-outer-loop-and-frontage-revision--24-september-2026).

The annexe's immutable 21,176-primitive local fingerprint still matches.
Regression checks cover road and paving continuity, the removed routes,
triangle proportions and grass centre, quarter-circle radii, building
clearance and walking access. Historical placement fingerprints were rebased
after the independent preservation check. This changes browser sources and
compiled aerial assets; Unity and Blender exports are unchanged.

Validation: the full npm test suite passes, as do the rebuilt source/compiled
geometry and image comparison, fallback checks and every timeline stop.
Source and compiled overview, plan and entrance views were visually checked
without page errors. Final previews use Browser/artifacts/annexe-loop-frontage-final-*;
build, suite and compiled logs use Browser/artifacts/annexe-frontage-revision-*.
The annexe's minimum padded masonry clearance to the loop centreline is
8.46 scene metres; the dedicated checks include full road widths and kerbs.

### Annexe gallery addition, 24 September 2026

Added the supplied Carden/Picton-side photograph as the fifth image in The Annexe gallery, captioned “The Annexe · Carden / Picton side and conservatory”. The supplied file matches the existing unedited `Research/carden-picton/img1.jpg` byte-for-byte. The gallery uses a 1200 × 675 WebP generated with the existing photo-build settings; its source is registered in the build script and photo manifest.

Validation: `node Browser/test-building-photos.mjs` passes, including source and compiled selection. The new image decodes correctly in the browser gallery, with five photographs and no page errors; the panel was visually checked in `Browser/artifacts/annexe-carden-picton-gallery.png`. The full `npm test` suite stops at the unrelated geometry fingerprint mismatch in `Browser/artifacts/check-larkton-original.mjs:7`, invoked by `Browser/test-larkton.mjs:19`; output is saved in `Browser/artifacts/annexe-gallery-suite.log`. No model geometry or Unity/Blender exports changed.

## Parallel annexe frontage — 24 September 2026

The latest frontage annotation aligns the main straight with the annexe and
moves it one six-metre carriageway closer at the doorway axis. The triangular
island retains its shape; roadside planting, the circular entrance and gravel
connection follow the revised carriageway. The annexe itself remains fixed.
Reference and preservation details are in Research/historic-roads/README.md.

Validation: historic road continuity and full-width clearance, measured parallel
alignment and six-metre offset, triangle dimensions and annexe loop fit pass.
Source and compiled frontage views were visually checked. The rebuilt model
passes source/compiled geometry and image comparison, fallback checks and
every timeline stop, including walking obstacle refresh.

The full npm test run stops at the Larkton historical snapshot after concurrent
Leighton/Newton window changes add 494 primitives. The same mismatch occurs
with the original roadside trees. With only those concurrent ward edits
normalized inside the verification process, the complete annexe shape,
entrance preservation and quarter-circle checks pass. Reversing only the five
small tree translations then exactly recovers both pre-road estate hashes;
the two tree-containing snapshots were refreshed for those translations only.
No concurrent building edits were changed. Evidence is in
Browser/artifacts/annexe-parallel-preservation.json; build, full-suite and
compiled-validation logs use Browser/artifacts/annexe-parallel-*.log.
Final images use Browser/artifacts/annexe-loop-parallel-final-compiled-*.

## Leighton/Newton glazing and photo lightbox — 24 September 2026

Replaced all 38 boarded lower windows with the same pale divided frames and
green-grey glazing used upstairs, retaining the existing openings and doors.
See Research/leighton-newton/README.md for the scope comparison. Browser model
sources and the generated aerial asset change; Unity/Blender exports do not.

Every photograph in the aerial Building photos gallery, including nearby views,
now opens in a native modal lightbox. It supports previous/next buttons, arrow
keys, Escape, close and backdrop dismissal, caption/count display, focus return
to the thumbnail, a keyboard focus loop and a mobile layout. Aerial movement
pauses while it is open. Missing photographs show an in-dialog message.
The gallery currently belongs to the aerial page; the walking model shares
the window geometry. npm run test:photos runs the catalogue and lightbox checks.

Validation: 76 gallery image entries pass browser checks, including context
images, navigation, focus, closing, single images and missing-image recovery.
Desktop and portrait lightboxes and source/compiled inner and outer ward
elevations were visually checked. Rebuilt source/compiled geometry, image,
full-detail and fallback checks pass, as do all timeline/walking checks.
Logs and scope reports use Browser/artifacts/windows- and lightbox- prefixes.
The final full suite passes the window checks and stops at the unrelated
road-coordinate assertion in test-parsons-retrace.mjs:54 during concurrent
road edits. All eight checks after it pass in a separate continuation; see
windows-lightbox-suite-final.log and windows-lightbox-suite-remaining.json.
The actual aerial page also passes modal input isolation and focus checks.


## Irby/Ashley road and gravel alignment — 24 September 2026

The latest red route now connects the outer road to the Irby/Ashley side court
between the fixed mature trees. The blue triangular junction occupies the
outer side of the avenue, whose straight frontage alignment is retained. The
old upward loop is removed and the narrow gravel path follows the yellow
diagonal. See [the reference and modelling notes](Research/historic-roads/README.md#irby-tree-gap-road-outer-triangle-and-gravel-diagonal--24-september-2026).

Browser model sources change; Unity and Blender exports are unchanged.

Irby road validation: the full `npm test` suite passes. The compiled aerial
asset was rebuilt and its fingerprint matches the current browser sources.
Source/compiled geometry and image comparison, fallback loading, every
timeline stop and walking collision refresh all pass. The final annotated
angle, tree-hidden view and overhead preview were checked in both model modes.
Evidence is saved as `Browser/artifacts/irby-junction-*`.


## Rounded Irby junction — 24 September 2026

Smoothed the marked lawn-side bend into the avenue and rounded all three inner
corners of the triangular grass island. Local resurfacing removes the old
pointed kerbs; the existing routes, gravel alignment, trees and buildings stay
fixed. The dedicated checks sample asphalt, pale edging and grass on both sides
of each new curve. Browser sources and compiled aerial assets change; Unity
and Blender exports remain unchanged.

## Leighton/Newton inner corner block — 24 September 2026

Replaced the yellow-marked shallow middle projection with a rectangular
7-by-8-map-unit block in the inside corner, matching the user's red footprint.
The removed bay is now flush; the new two-storey block joins both existing
ranges and carries matching brickwork, glazing and a hipped slate roof.
Covered windows on the two adjoining walls are removed or moved to the exposed
faces. See [the modelling reference](Research/leighton-newton/README.md#inner-corner-projection-correction--24-september-2026).

Walking obstacles derive from the new masonry before scene batching. Window
visibility, corner collision, reopened lawn, original L ranges and all 923,701
estate primitives outside the ward pass the dedicated checks. Historical
fingerprints were refreshed only where they exactly matched the pre-edit model.
Browser sources and the generated aerial asset change; Unity/Blender exports do not.

Rounding validation: road continuity, full-width building and trunk clearance,
curve-side surface samples and annexe access pass. The full browser run reached
a transient Larkton preservation mismatch; its isolated recheck and complete
Larkton test pass, and all remaining suite checks pass in the continuation.
No annexe snapshot was changed. The rebuilt asset matches the current source
fingerprint. Compiled/source geometry and image comparison, fallback loading,
all timeline stops and walking collision refresh pass. Source and compiled
oblique, tree-hidden and plan views were inspected. Logs use
`Browser/artifacts/irby-rounding-*`; final previews use
`Browser/artifacts/irby-junction-rounded-final-compiled-*`.

Validation: the full `npm test` suite passed (`leighton-corner-suite.log`).
The first compiled run passed the source/image comparison, then concurrent
KML tree-data edits invalidated its asset before the timeline check. The asset
was rebuilt against those edits. Its final corner, inner elevation, outer
elevation and plan views rendered without page errors. The compiled corner
close-up and source ground-level/overhead views were visually inspected.
Final build/comparison evidence uses `Browser/artifacts/leighton-corner-final-*`;
final previews use `Browser/artifacts/leighton-corner-after-compiled-*`.

Final rebuilt source/compiled geometry and image comparison, full-detail and
fallback loading, every timeline stop and live walking collision refresh pass.
The final generated asset fingerprint matches the current model sources.

## Annexe entrance road overlaps and tree removal — 24 September 2026

Cut the frontage avenue's building-facing border across the entrance mouth,
removing the two yellow-marked slivers. The circular entrance kerbs now follow
the lawn side of the asphalt edge at the avenue's 0.6-metre border width and
join it tangentially. Roadside tree 4, marked red on the carriageway, is removed
from rendering and walking collision. All other planting retains its position,
random crown dimensions and original instance rotation.

The independent before/after preservation check restores only the marked tree,
then excludes its trunk and five crown instances. Both whole-estate fingerprints
match exactly after that exclusion. Only the two historical snapshots matching
the original model were refreshed. Evidence is in
`Browser/artifacts/annexe-entrance-tree-preservation.json`.

Entrance regression checks sample asphalt, kerb and grass around both curved
lips, verify the removed tree's former position is walkable asphalt, and retain
the six unmarked roadside trees. The circular-radius, forecourt, building and
road-continuity assertions also pass. Source close-up and overhead previews
use `Browser/artifacts/annexe-loop-entrance-overlap-after-source-*`.
Browser sources and the compiled aerial model change; Unity/Blender exports do not.

Final validation: the full `npm test` suite passes, as do source/compiled
geometry and image comparison, full-detail and fallback loading, every timeline
stop and live walking obstacle refresh. The final compiled asset matches the
current source fingerprint. Source and compiled entrance close-ups were visually
checked; final previews use `annexe-loop-entrance-overlap-final-compiled-*`.
Build and validation logs use `Browser/artifacts/annexe-entrance-fix-*`.


## Parsons far-end bend and junction cleanup — 24 September 2026

Rounded the historic far-end elbow to an eleven-unit centreline radius around
the fixed second lamppost, following the red guide. The six-unit road and
0.6-unit borders remain continuous; the lamppost centre clears the outside
kerb by approximately 1.55 scene metres. The original saved endpoint becomes
a Modern-only tail from 2010. Both timeline and layout controls retain the
correct visibility through batching and compiled-scene restoration.

Trimmed the Larkton approach at its intersection with the outer road, removing
the initial backwards overshoot responsible for the yellow-circled nub. The
remaining approach and courtyard stay fixed. See the reference and geometry
notes in Research/historic-roads/README.md.

Validation: the full npm test suite passes, including road-width, kerb, lawn,
lamppost clearance, junction continuity and endpoint visibility regressions.
The rebuilt aerial asset passes source/compiled geometry and image comparison,
full-detail and fallback checks, every timeline stop, mobile controls and live
walking collision refresh. Source and compiled oblique/plan views and the
2010 view were visually checked. Evidence uses Browser/artifacts/parsons-end-*
with isolated compiled-test screenshots in parsons-end-validation. An initial
run encountered a concurrently updated geometry snapshot and an output-file
conflict; the final runs pass. Browser model sources and compiled aerial assets
were updated; Unity and Blender exports were not regenerated.

## Annexe and frontage moved toward 1829 — 24 September 2026

Moved the complete annexe and the long frontage straight ten scene metres
along the frontage normal toward 1829, matching the red screenshot guide.
The apron, sweep, building views and frontage trees follow the same displacement.
The two outer-boundary trees remain fixed. Short end transitions meet the
existing road network; the gravel link shortens to the moved straight.
The blue-circled east section needs no shortening. All 21,647 approved local
annexe primitives retain their exact fingerprint. The requested far-left
Larkton/outer-road overlap remains deferred, with only that bounded region
excluded from clearance assertions. See Research/historic-roads/README.md.

Validation before subsequent concurrent junction edits: dedicated annexe fit,
rigid displacement, entrance/kerb/walking, historic roads and Parsons checks
passed. Historical position fingerprints were refreshed only when they matched
the pre-move state, after confirming the unchanged local building geometry.
The rebuilt aerial asset passed source/compiled geometry and image comparison,
full detail and fallback checks, all timeline stops and live walking refresh.
The source and compiled views were visually inspected; the final close overview
is Browser/artifacts/annexe-inward-final-compiled-reference.png.

The full npm test run reached annexe access after the earlier tests passed,
then concurrent changes from the other road tasks changed the shared junction
and caused its curved-kerb assertion to fail. Those edits were preserved.
The subsequent combined source fingerprint differs from this task's verified
asset, so final combined validation/rebuild belongs after those road edits settle.
Evidence: Browser/artifacts/annexe-inward-suite-verified.log,
annexe-inward-build-final.log, annexe-inward-compiled-final.log and
annexe-inward-snapshot-refresh.json. Browser sources and generated aerial assets
were changed; Unity and Blender exports were not regenerated.


## Mobile landing layout and loading stills (24 September 2026)

The index page removes the night-in-the-building eyebrow and the corridors
sentence. On phones the title starts just below the brand; viewport-aware type,
48px mode buttons and normal-flow credits keep the actions visible even at
320 × 480. Vertical scrolling remains available for enlarged text or unusually
short viewports. Landing styles are scoped away from the other scene pages.

The landing render uses 25% of the original exterior fog density (.000475),
and the menu vignette uses 25% of its former opacity. The original fog is restored
after each menu render, preserving arrival and escape scenes. Text shadows and
solid secondary buttons maintain legibility against the clearer background.

The responsive WebP stills in Browser/dist/exterior/landing-aerial*.webp show the
same initial aerial camera and reduced fog as the live menu. The HTML picture
loads independently of Three.js; it covers startup and failure states until the
first complete aerial frame, when the canvas is revealed. Regenerate with
npm run capture:landing from Browser (set MODEL_CHROME_PATH if using local Chrome).
The desktop still is approximately 142 KB and the phone still 56 KB.

Validation: npm run test:landing checks 390 × 704, 360 × 640, 320 × 480,
430 × 780 and 1440 × 900, including button/credits separation, image loading,
failed-scene fallback and the real WebGL handoff. Visual checks use the
landing-mobile-placeholder, landing-small-mobile, landing-desktop-placeholder
and landing-mobile-loaded JPGs in Browser/artifacts. The full npm test run
passed the game and aerial controls checks, then stopped at the unrelated
existing road assertion in test-parsons-retrace.mjs:72 (old triangle/upward loop
at 314,-72). Its output is in Browser/artifacts/landing-mobile-suite.log.
No modelling sources or Unity/Blender exports were changed by this update.

## Main/admin teardrop road smoothing — 24 September 2026

Replaced the two bumpy outer road joins beside Main/admin with tangent sweeping
verges following the user's red guides. Added asphalt up to the stepped east
wall and low rear link, covering the complete blue-marked grass strip and its
service-court wedge. The teardrop island and inner kerb keep their exact shape
and position; road centrelines, buildings and planting remain unchanged.

The new regression check passes for the fixed island fingerprint/position,
continuous asphalt, single pale borders, exposed lawn beyond the curves, and
asphalt to the actual wall edges. The historic-road clearance and continuity
checks pass. The annexe access check also passes after updating one superseded
grass sample within the newly paved junction notch; all remaining removed-road
grass samples are retained. An initial unrelated entrance-kerb failure was
reproduced without the admin changes and resolved by concurrent annexe work.
Source overhead and oblique previews were visually inspected. Browser model
sources and the compiled aerial model change; Unity/Blender exports do not.

Final validation: the admin teardrop regression and historic-road clearance
checks pass after the tighter final lawn-side sweep. The new asphalt also
passes the annexe access check; its one old grass sample inside the requested
sweep is now asserted to be asphalt. Full-suite and compiled-comparison runs
were interrupted by concurrent changes to the separate Irby/annexe triangular
junction (first a beech-root clearance assertion, then a temporarily empty
island polygon). The beech failure was independently reproduced with the admin
paving omitted. Those transient shared-project failures are not recorded as
successful full-suite validation. The aerial asset was rebuilt again once the
shared scene became valid; final previews use admin-sweep-final-compiled-*.

## Annexe island and straight frontage correction — 24 September 2026

Enlarged the grass triangle, then applied the later red/yellow/blue/purple
correction: the frontage now continues on one straight axis to the outer
road, with no angle change at the blue mark. The purple fork is a separate
six-metre curved carriageway with the standard 0.6-metre borders. Its previous
broad resurfacing is removed from the tree-side lawn. All three island tips
are rounded; the final grass area is about 73 square scene metres.

The fixed beech, its trunk and low roots remain clear of the complete paved
surface. Tests sample a 1.8-metre circle around its base, both sides of the
curved carriageway, all rounded inner edges, the retained gravel link, the
straight frontage axis and the original circular entrance kerbs. Buildings
and tree placements are unchanged by this correction.

The full browser suite and model-binary checks pass. The aerial model was
rebuilt; source/compiled geometry and image comparisons, full-detail loading
and fallback checks pass. Both canopy-visible and tree-hidden source/compiled
views were visually inspected. Evidence is in Browser/artifacts/annexe-island-*
and Browser/artifacts/annexe-island-validation. Browser source and compiled
aerial assets change; Unity and Blender exports were not regenerated.

Final validation also passes every timeline stop, mobile controls, source and
compiled navigation, and live walking collision refresh. The generated asset
fingerprint matches the final browser model sources.


## Landing estate fixed to 1916 — 24 September 2026

The index backdrop now uses the complete aerial construction pipeline through
Browser/dist/landing-scene.mjs, with the timeline explicitly set to 1916. This
includes the tower service buildings and workshops omitted by the former base
exterior, and hides later roads, parking and the communications mast. Map road
labels are hidden for the title backdrop. Full building geometry and static
material batches are retained for the arrival and escape cameras, which reuse
the same estate. Setting the period invalidates the exterior shadow map.

The desktop and phone loading WebPs were regenerated from this shared setup
with the existing camera and quarter-density landing fog. Validation: the full
Browser npm test suite passes (artifacts/landing-1916-suite.log), and the landing
browser check passes at all five viewport sizes, including failed-load fallback,
the live handoff, visible tower geometry, 1916 visibility and hidden map labels.
The refreshed stills and desktop/mobile live screenshots were visually checked.
No modelling geometry or compiled aerial assets were changed by this fix;
Unity and Blender exports were not regenerated.

## 1912 roads and missing lane links - 24 September 2026

Corrected the period assignments for the owner's red/blue road annotation.
The southern Parsons fork and Main/admin outer lawn sweep now follow the Annexe,
so both road stubs and their pale borders are absent in 1912 and return in 1915.
The road named Annexe inner east road follows The Main, restoring the complete
connection across both blue-marked areas before the annexe exists. A local
junction joins its clipped eastern end to Parsons Lane (North), covering the
former gap and internal kerb while retaining the saved lane coordinates.

Historic surfaces now use explicit exceptions before the existing name-based
defaults. Timeline version 4 forces older compiled scenes to fall back to source.
The existing period-switch shadow invalidation and walking-obstacle refresh
remain in use; no geometry is moved or rebatched during a period switch.
See Research/timeline.md and the saved annotation for the dating assumptions.

Validation: the full npm test suite passes. The period regression samples the
complete restored route at sub-metre intervals across four metres of its width,
including both junctions, before and after batching. The two removed stubs are
checked for real grass before construction and asphalt after construction.
Real-browser tests also sample both blue areas and both red stubs in source,
compiled and walking scenes. Source and compiled 1912/1915 overhead and oblique
views were visually inspected. Evidence uses Browser/artifacts/roads-1912-* and
roads-1915-*. Browser sources and the generated aerial model were updated;
Unity and Blender exports were not regenerated.

Final compiled validation also passes: source/compiled geometry and image
comparison, full detail and fallback loading, every period's road samples,
and walking collision refresh. The generated asset fingerprint is current.


## Parsons road lamp alignment and junction depth — 24 September 2026

Turned the long outer Parsons road approximately 0.58 degrees about its saved
northern endpoint. Its outer kerb meets Surviving Lamp Post #1's concrete base.
The mapped lamps, annexe frontage, buildings and trees remain fixed; the north
bend, Larkton access mouth and triangular junction follow the adjusted line.
The previous outer-road anchor is retained independently when deriving the
frontage, avoiding an unintended avenue/entrance displacement.

Separated the depth biases for resurfaced junction asphalt, raised island grass
and inner kerbs. This prevents buried borders and road caps from competing with
the visible surface at the purple-marked bend and fork. Updated geometric checks
cover lamp-base alignment, the revised triangle, tree-root clearance and the
ordered surface layers. The old lawn sample reached by the shifted road moves
out to the new verge; other removed-road checks remain in place.

The complete npm test suite passes. Source and compiled overhead, oblique,
distant, close lamp and junction images were rendered. The lamp, both junctions
and overview were visually inspected.
The rebuilt aerial asset passes source/compiled geometry and image comparison,
full-detail rendering and fallback checks. Its source fingerprint was verified.
Evidence: Browser/artifacts/lamp-road-{suite,build,compiled}.log and the
lamp-road-final-{source,compiled}-*.png previews. Browser sources and generated
aerial assets are updated; Unity and Blender exports are not regenerated.

Final compiled validation also passes every timeline stop, mobile controls,
layout navigation and live walking collision refresh.


### Main/admin corridor gallery replacement — 24 September 2026

Replaced the corridor’s former present-day location image with the two supplied interior photographs, in supplied order. Originals are saved as `Research/admin-corridor/interior-1.png` and `interior-2.png`; gallery WebPs use the existing photo-build settings and are registered in the build script and source manifest.

Validation: `npm run test:photos` passes (77 gallery image entries), and the full `npm test` browser suite passes (`Browser/artifacts/admin-corridor-gallery-suite.log`). The corridor panel shows two photographs; both decode and open without page errors. Gallery and portrait viewer screenshots were visually checked. No model geometry or Unity/Blender exports changed.

## Triangular-island fork and gravel angle — 24 September 2026

Applied the latest red/yellow/blue screenshot: the short arm pivots toward the
yellow guide, while the gravel link turns toward blue about its fixed court
endpoint. The long frontage and outer roads, entrance sweep, buildings and
trees stay fixed. The generated island retains about 80 square scene units;
the existing root-clearance and full carriageway-width assertions still pass.
See Research/historic-roads/README.md for the annotated reference and coordinates.

Updated the gravel-direction and removed-surface assertions to the new guide.
The timeline's old fork sample landed on the relocated kerb, so both source
and browser timeline checks now sample the new arm at (320.5, -73.2).
The dedicated Parsons, historic-road and annexe-access checks pass. The model
binary check passes, generated aerial assets were rebuilt, and registered
source/compiled views were visually checked. Evidence uses
Browser/artifacts/fork-angle-*. Browser sources and compiled assets changed;
Unity and Blender exports were not regenerated.

Final validation: the full `npm test` browser suite and `npm run test:compiled`
passed, including every timeline stop in source/compiled scenes and live walking
collision refresh. The source/compiled image comparison differed significantly
in 0.016% of pixels, within the existing visual-equivalence check.

## Three annexe lawn oaks — 24 September 2026

The three blue crosses in the owner's screenshot add three shared-template oaks
to the 1915, 1916 and 1938 timeline layers. Other timeline stops retain their
existing planting. See [placement and scope notes](Research/annexe-period-oaks/README.md).
The dated trees are created during timeline preparation, preserving the KML
inventory and untimed exterior. They follow the Trees toggle, shadow invalidation
and walking obstacle refresh. Timeline version 5 rejects older compiled assets.

The full Browser npm test suite and the extended estate-period checks pass,
including all-stop visibility, shared oak buffers and visible/hidden trunk
collisions. Screenshot-aligned previews use Browser/artifacts/period-oaks-*.
Browser source and the local compiled aerial model are updated; Unity and Blender
exports are unchanged.

## Rear annexe road additions — 24 September 2026

Added the four blue-marked rear-annexe road segments and filled the yellow-marked
Oakmere court to its stepped building walls. All new asphalt and pale borders
follow the Annexe section: visible at 1915, 1916 and 1938, absent at every other
available stop. Timeline version 5 rejects earlier compiled scenes.

The added roads are merged before triangulation. Existing asphalt and junction
aprons are subtracted from the new surface, preventing duplicate carriageway
faces. Exact building footprints clip the court and wall-ending spurs; borders
are restricted to exposed lawn edges. The standard junction depth covers the
old verge only at the two new open mouths. The existing period-switch shadow
invalidation and walking-obstacle refresh remain in use.

Geometry and provenance are in Research/historic-roads/annexe-rear-network-input.json
and its marked screenshot; the generated outlines are in annexe-rear-roads.mjs.
The optional regeneration script requires Shapely 2; the browser has no new
runtime dependency. Tests cover both mouths across four metres of width, the
long wall and projecting bays, and every timeline stop before/after batching.
Browser sources and the compiled aerial asset are updated. Unity and Blender
exports are not regenerated.

The rebuilt source/compiled comparison and complete browser timeline suite also
pass, including live walking collision refresh. The compiled oak preview checks
exactly three new trees and their visibility/collisions at every stop. Final
compiled preview: Browser/artifacts/period-oaks-compiled.png. Validation logs:
period-oaks-suite.log, period-oaks-build.log and period-oaks-compiled-checks.log.

Validation: the full Browser npm test suite and npm run test:compiled pass.
This includes source/compiled geometry and image comparison, full-detail and
fallback loading, every timeline stop, mobile controls and live walking collision
refresh. The dedicated rear-road browser check confirms all six added surface
objects follow only 1915/1916/1938 in both loading modes. Source and compiled
reference-angle previews were visually inspected. Regeneration is deterministic,
and polygon checks find no asphalt overlap with walls, existing carriageways or
the new border. The final compiled source fingerprint matches the browser files.
Evidence: Browser/artifacts/rear-roads-{suite,build,compiled}.log and
rear-roads-final-{source,compiled}.jpg.

## Roof attachment contact audit — 24 September 2026

Extended the annexe belfry plinth into both slopes and lowered annexe chimney
bases below their host eaves, retaining all chimney tops, pots and caps.
Churton and Redesmere shafts likewise extend down to eliminate exposed bottom
edges. Main/admin stacks now start at 13.4; its two eastern stacks move inward
0.4 so their complete footprints sit over the roof. The water-tower finial
extends 0.2 into its pyramidal roof while retaining its top height. The two
previously unnamed ventilator bases are named meshes for contact inspection;
their geometry and positions are unchanged.

`test-roof-contacts.mjs` checks 106 attachments at 3,816 perimeter samples,
including the annexe belfry, chimney families, dormer cheeks, ventilator bases
and water-tower finial. Ground-supported freestanding chimneys and external
flue breasts are intentionally outside this roof-contact test. The existing
tower-building tests retain their fitted blue-dormer checks. Historical geometry
fingerprints were refreshed only after the pre-repair loader reproduced their
saved values; the refresh scripts and changed-key report are under
`Browser/artifacts/roof-contact-*`.

All browser-suite checks pass (the initial npm run followed by all remaining
checks after the east-wing snapshot refresh). The compiled model was rebuilt;
source/compiled geometry and rendering comparisons, full-detail/fallback loading
and every timeline/walking check pass. Seven source and compiled close views
were rendered without page errors, and the final roof contacts were visually
inspected. Evidence: `roof-contact-suite.log`, `roof-contact-remaining.json`,
`roof-contact-build.log`, `roof-contact-compiled.log` and `roof-contact-review.jpg`
in Browser/artifacts. Repairs happen during construction before batching and
shadow rendering. Browser sources and compiled aerial assets are updated;
Unity and Blender exports were not regenerated.

## Aerial performance test planting counts (24 September 2026)

The CI modelling check retained a 60-tree expectation after Oak31–Oak44 added
fourteen oaks. The performance test now derives its total and species counts
from the mapped planting plus the two photo-positioned front-lawn beeches
(currently 72 + 2 = 74). Exact source-KML verification remains in
`test-kml-imports.mjs`. The distant geometry budget uses the same existing
per-oak, per-pine and per-willow allowances, calculated from imported counts;
shared buffers, LOD, layout surfaces and transform checks remain enforced.

Validation on Windows with Node 24.20.0 and installed Chrome: `npm test`,
`npm run test:models`, `npm run test:mobile`, `npm run test:photos`,
`npm run test:landing`, and the three standalone annexe/new-hospital checks
pass. The local models were rebuilt and the source/compiled comparison,
full-detail loading, fallback cases and browser timeline checks passed.
This fix changes test logic only; it does not change modelling source or
Unity/Blender exports. Existing concurrent model and snapshot edits were
preserved during validation.

Concurrent paving work subsequently refreshed the shared compiled asset. Its
source fingerprint matches the current workspace; the 106-attachment perimeter
check also passes on that current scene. The final compiled comparison is
recorded separately in `Browser/artifacts/roof-contact-final-compiled.log`.

The final full-suite rerun detected two estate-wide fingerprints made stale by
concurrent garden paving edits. Before refreshing Jarman and Leighton/Newton,
`Browser/artifacts/test-paving-refresh.mjs` loaded only the three paving modules
from HEAD and reproduced both saved fingerprints exactly, while retaining all
other current model changes. The current scene has one fewer primitive in each
scope. Only the geometry fingerprints were refreshed; Leighton placement and
all explicit geometry, collision and window assertions remain unchanged.
The full run through the first failure is recorded in
`Browser/artifacts/test-suite-verification.log`; the resumed checks start at
Jarman in `Browser/artifacts/test-suite-remaining.log`.

## Redesmere garden paving — 24 September 2026

Removed the two red-marked asphalt remnants, replaced the raised lawn patches
with one continuous grass surface, and extended the right-hand paving along
its existing axis and width to the left wing apron. The lawn follows the
curved inner-path corner and meets the new cross-walk without the old seam.
See Research/redesmere-garden/README.md and its saved owner annotation.

The shared browser sources and local compiled aerial model are updated;
Unity and Blender exports were not regenerated. Source and compiled garden
views were visually inspected. Compiled/source rendering, full-detail and
fallback loading, every timeline stop and live walking collision refresh pass.
Whole-estate geometry snapshots were checked against the pre-edit source before
refreshing the values affected by the intentionally removed garden surfaces.
Validation evidence uses Browser/artifacts/garden-paving-*.

Final validation: the full Browser npm test suite and npm run test:compiled pass.


## Aerial location photos — 24 September 2026

Removed the separate Building photos picker. Aerial location links now pin the
matching catalogue building after the initial timeline is applied, using the
same white outline and photo panel as a building click. Selection uses the
original location name so ward aliases retain their correct building even
when sharing camera views. Landscape destinations have no building selection.

Validation: Browser `npm test`, the catalogue/lightbox tests and
`test-aerial-location-photos.mjs` pass. The latter is included in `test:photos`
and checks actual menu navigation, ward aliases, pinned panels, closing and
landscape destinations. Desktop and mobile screenshots were visually checked
in `Browser/artifacts/location-selection-*.png`. No model geometry or generated
models changed; Unity and Blender exports were not regenerated.

## Western Parsons road joins — 24 September 2026

Joined Northern estate boundary to Parsons Lane and North west ward approach
to Parsons Lane (Upton Lea), matching the two circled gaps in the owner image.
Local merged asphalt covers the clipped caps and internal kerbs, with rounded
continuous outer borders. The saved shared-lane and historic centrelines stay
fixed. Joins follow The Main, the same period group as both historic roads.

The dedicated test scans the full driving width across both old gaps and checks
period ownership. It and the historic-road checks pass; the source preview was
visually inspected. The full npm test run stopped at the unrelated Jarman estate
fingerprint. All remaining suite checks were run separately: Leighton/Newton
also has a protected-estate fingerprint mismatch, and modern-car-park expects
13 intersecting trees where current concurrent tree edits leave 12. Those
baselines were not changed. These failures concern geometry constructed before
the aerial road layouts are added.

Evidence: Browser/artifacts/west-parsons-suite.log,
west-parsons-remaining.json, west-parsons-joins.png, west-parsons-build.log and
west-parsons-compiled.log. Browser sources and the local compiled aerial model
were updated; Unity and Blender exports were not regenerated.

Final compiled validation passes: source/compiled geometry and image comparison,
full-detail and fallback loading, every timeline stop, mobile controls and live
walking collision refresh. The close compiled junction preview was visually
checked against source in west-parsons-joins-compiled.png.

## Blue-marked west cross-walk and yellow lawn panel — 24 September 2026

Removed the western z=43 cross-walk and z=44 apron cap beside the west front
wing. Trimmed the adjoining gravel slab to the garden edge so it does not leave
a narrow exposed paving strip. Removed the redundant `Extended front lawn`
box outlined in yellow; the estate terrain now supplies that frontage grass.
The entrance-surface assertion follows the terrain instead of the removed box.
Changes are made during scene construction, before batching, obstacle creation
and initial shadow rendering. Browser sources and the local compiled aerial
model are updated; Unity and Blender exports are unchanged.

Source close view: Browser/artifacts/marked-paving-after.png. Validation evidence:
marked-paving-suite.log, marked-paving-remaining.json, marked-paving-build.log
and marked-paving-compiled.log in Browser/artifacts. The full suite stops at the
Jarman protected-estate snapshot; remaining checks are run separately. Those
historical estate-wide snapshots are not rebased as part of this surface edit.

Final validation: west refinement and modern entrance checks pass. Compiled/source
geometry and image comparison, full-detail and fallback loading, every timeline
stop and live walking collision refresh pass. Of the 32 checks after Jarman,
30 pass; Leighton/Newton also reports a protected-estate snapshot mismatch and
modern-car-park reports its previously recorded tree-count mismatch. The full
suite is therefore not green. The final source close view was visually checked.

## Reconcile scene regression expectations — 24 September 2026

The Jarman and Leighton/Newton protected-estate fingerprints still included
approved tree, ground-fitting, Churton roadside and west-front paving removals.
Loading the seven affected model modules from HEAD reproduces both saved
fingerprints exactly. The reviewed current modules produce a net decrease of
147 primitives in each scope. Refreshed only those two geometry fingerprints;
Leighton/Newton placement, explicit architecture checks and collision checks
remain intact. The audit and before/after values are recorded in
Browser/artifacts/check-refresh-{before-loader,snapshots,baselines}.mjs and
check-refresh-audit.json.

The car-park expectation included the deliberately removed broadleaf at
(98.2,-38). Before/after comparison confirms it is the sole change to the
intersecting population. The check now asserts the twelve exact remaining
positions and permanent absence of that tree, while retaining all crown,
layout visibility, collision, mapped-boundary and oak-preservation assertions.
This follow-up changes test expectations only; model sources, compiled assets,
Unity and Blender exports are unchanged.

Validation: the complete Browser `npm test` suite passes, including Jarman,
Leighton/Newton and modern-car-park. `git diff --check` also passes. Full output:
Browser/artifacts/check-refresh-suite.log. No rendering source changed in this
follow-up, so the preceding successful compiled/rendering checks remain relevant.


## Spotted warning (September 24)

Asylum escape shows "You've been spotted" when either NPC passes its existing
same-floor sight check after the head start. It persists until the player is
at least 26 scene units from both NPCs, including floor-height separation.
Loss of sight and holding E do not clear it. Restart resets it. The ghost's
continuous through-wall tracking is unchanged. Mobile warnings sit below the minimap.

Validation: the full browser `npm test` suite passed; `test-game.mjs` covers
both triggers, both-NPC clearance, held-E persistence, retrigger and restart.
`check-spotted-browser.mjs` verifies the real WebGL warning and dismissal at
desktop/mobile sizes with no browser errors. Captures and the suite log use
`Browser/artifacts/spotted-*`. No model assets or Unity/Blender exports changed.

## Randomized capture outcome — 24 September 2026

The defeat dialog now says "You've been captured", followed by a random
diagnosis and its matching treatment, an independently selected supposed cause
with description, and the retry invitation. The 11 diagnosis/treatment pairs
and 14 causes are bundled in Browser/dist/capture-outcome.mjs from the
Diagnoses and Causes tabs of the supplied sheet:
https://docs.google.com/spreadsheets/d/107LEc_YgAiATltfdQCZUXCjegXZBKlWfY2cmn6vOl44/edit
This is a 24 September snapshot, not a live Sheets dependency. Consecutive
captures within a page session exclude the previous diagnosis. Text is rendered
with textContent and preserved line breaks; the existing dialog scrolls on
small screens. No models or Unity/Blender exports changed.

Validation: Browser/test-game.mjs covers capture rerolls, matching treatments,
cause descriptions and defeat controls; the full Browser npm test suite passes
(artifacts/capture-suite.log). The real WebGL layout check passes with desktop
and mobile capture screenshots and no page errors. Windows blocked the old
preview ports, so the check uses port 31844 and waits for server readiness.

## Raised lawn seams removed (September 24)

Removed the two broad, thin grass boxes from `Browser/dist/escape-exterior.mjs`.
Their exposed vertical edges produced the marked lines in front of the west
forward wing, beside Parsons Lane and near Redesmere. The existing continuous
terrain supplies these lawns with the same grass material and world texture.
Other garden patches and paving retain their existing geometry. No runtime
movement or visibility logic changes are required.

Ground raycasts now require terrain at the removed panel samples in every
period, before and after batching, and in the source/compiled browser timeline
checks. The local compiled aerial model was rebuilt. All three close views were
visually checked using `Browser/artifacts/ghost-lawn-preview.mjs`, with no browser
errors. `npm run test:compiled` passes, including source/compiled equivalence and
all timeline states in aerial and walking views. Unity and Blender exports were
not changed.

The full `npm test` run passes through the annexe photo-placement checks but
stops at `test-jarman.mjs`: its stored whole-estate protected-geometry fingerprint
includes the deliberately removed lawn boxes and other concurrent workspace
geometry changes. That historical snapshot was not blindly regenerated. The
suite and subsequent checks are recorded in `Browser/artifacts/ghost-lawn-suite.txt`
and `Browser/artifacts/ghost-lawn-remaining.txt`.

The remaining checks all pass except `test-leighton-newton.mjs`, whose protected
whole-estate snapshot also includes the changed geometry. Both stale snapshot
checks report 74 fewer primitives in the current shared workspace. Targeted
ground/timeline, rendering, collision and compiled-model checks pass.


## Day/night controls and roadside lighting — 24 September 2026

Aerial view and Explore the asylum now have a sun/moon toggle, defaulting to
daylight on each page load. Night mode retains the selected period and camera,
with cool moonlight, distance mist and warm roadside illumination. The narrow
phone layout keeps the controls clear of the period panel. Building selection
in night mode multiplies the final white overlay and blurred outline opacity
by 0.3 (a 70% reduction); returning to day restores the original effect.

The two mapped lamps retain their positions, prefab shape and dates. Additional
lamps instance that concrete swan-neck prefab beside the existing road traces,
with their arms facing the carriageway. Their parents are the actual dated
roads, including modern-only tails; rear-annexe lamps share the Annexe group.
The entrance and roundabout use their existing outlines. There are 53 visible
fixtures in 1829, 118 in 1915–1938, and 114 in 2021, including surviving lamps
where applicable. See Research/street-lamps.md for placement assumptions.

Lamp geometry is compiled with the estate (timeline format version 6).
Runtime lighting is rebuilt for both source and compiled loads. Emissive heads,
small halos and instanced ground pools cover visible lamps, while a fixed pool
of eight unshadowed point lights illuminates nearby masonry and foliage.
The day settings are restored exactly, and light changes invalidate cached
shadows. Walking collisions use narrow post footprints, not overhead arms;
the existing timeline/tree callbacks refresh walking obstacles.

Validation: test-day-night.mjs checks every period, daylight restoration, the
light budget, hidden-road light removal and shaft collisions. The browser
checks cover both loading paths, toggling with mouse/keyboard, all periods,
phone layout, and aerial/walking screenshots. The dedicated night-selection
browser check clicks three different buildings and verifies alpha multipliers
of 0.3 at night and 1.0 by day. The compiled model was rebuilt; the standard
source/compiled image comparison and timeline browser checks pass. Final
artifacts and logs use the day-night prefix under Browser/artifacts.

The full npm test suite was run, followed by the remaining tests after its
first failure: 73 of 75 checks pass. The Jarman and Leighton/Newton protected
geometry snapshots mismatch. Both fingerprints reproduce with the original
HEAD lamp implementation restored in memory, confirming those failures are
independent of this feature (day-night-baseline.txt). Browser sources and local
compiled aerial assets are updated; Unity and Blender exports are unchanged.

## Annexe night-lamp placement — 24 September 2026

Applied the four X-marked locations from Research/annexe-night-lamps-marked.png:
added two inward-facing lamps beside the central forecourt, removed the circled
post on the curved junction, and added two inward-facing avenue lamps beside
the gravel-path mouth and farther along the building-side verge. Placement is
anchored to the existing Annexe site frame and paving dimensions. All other
automatically sampled fixtures keep their positions. The Annexe period parents
supply visibility; 1915–1938 now shows 121 estate fixtures, a net increase of
three. Counts in the other periods are unchanged.

The change is applied before instancing, batching and collision extraction.
The existing lighting controller supplies the glow and refreshes shadows; no
new runtime movement or visibility callbacks were introduced. The local
compiled aerial model was rebuilt. Browser sources and compiled assets are
updated; Unity and Blender exports were not regenerated.

Validation: the focused day/night check verifies the four shaft collisions,
posts off the paving, heads over the intended paved surface, removal of the
circled post, and every period's fixture/light visibility. Source and compiled
night previews were visually inspected. Both npm run test:compiled checks pass,
including source/compiled rendering equivalence and timeline/walking behavior.
The full npm test suite and all checks after its first failure were run: the
only failures remain the previously recorded Jarman and Leighton/Newton
protected-geometry snapshots. These inspect the exterior before roadside lamps
are added. Evidence and previews use Browser/artifacts/annexe-lamps-*.
