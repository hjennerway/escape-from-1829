## Eastern cross-range ridge continuation (7 October 2026)

The owner's red/yellow/blue roof annotation now defines one connected eastern
cross-range roof. The entrance's 15.66 ridge continues through the range and
branches over both polygonal bays and the end pavilion at the same height.
Descending hips meet the existing wall-top eaves. This replaces the taller
16.2 crown and intersecting caps described in the October 5 brick-join note.
See Research/east-roof-ridges/README.md for the reference and fitted coordinates.

The short rising eave walls now face outward. Their brick is clipped at the
existing cornice so no inverted tip overlaps the white strip. Solid top returns
provide the roof-finishing pass with actual support, preventing an automatic
white fascia from competing with the brick face. A short return and soffit close
the filled frontage's overhang to its wall. The roof builder runs after the bay
and pavilion builders, before the established entrance cuts, roof finishing,
timeline splitting, material batches and shadow setup. Ground-level outlines,
glazing, doors and walking routes retain their modelling inputs.

The focused roof regression passes in source and rebuilt compiled models:
12 previous marked viewing rays, 178 shared roof contacts, 138 outward wall and
render contacts, all marked level branches, and 20,139 coverage/overlap probes.
It rejects the saved original crowns, reversed wall faces and omitted support
caps independently. The estate-wide roof-wall audit retains all 278 frozen
viewing rays; former internal eave probes reach the raised underside. Slate
scale/orientation, attachment, eastern entrance/render, inside-corner, west-roof,
garden, exterior and courtyard checks pass.

Hardware validation verifies NVIDIA GeForce RTX 3090 Ti through Direct3D11.
Source and compiled views cover the owner's direction, both sides, the end,
plan, low wall contacts and portrait framing, without page or shader errors.
Compiled low views exposed and prompted removal of the competing trim, rather
than accepting the initially clean source image alone. Final evidence and the
repeatable capture script are under Browser/artifacts/east-roof-ridges/.
The compiled/source comparison also checks exact draw counts, full detail,
timeline controls and missing/incompatible/corrupt-model fallbacks.

The required full npm test run reaches test-ward-placement.mjs:44, then fails
on a Corridor downpipe assembly offset (-0.8050100041723312 versus zero).
The same assertion is reproduced with both saved pre-change eastern roof
sources. This is an independent existing failure, not a full-suite pass.
Both logs are retained with the evidence. Only shared browser model sources,
regressions, modelling notes and local compiled aerial assets are updated;
Unity, Blender and packaged desktop/Android exports are not regenerated.

## Gradual objective hints (7 October 2026)

The Escape HUD now starts each objective with a short direction and adds its
detailed hint only after 60 seconds of active play without progress. Taking the
staff key initially shows “Use the key you found to access the staff stairs”; the
delayed line adds “Find the porter’s records and brass outside-door key.” Opening
the stair access starts a fresh upper-office objective and a fresh hint delay.
The other objectives follow the same pattern, retaining room numbers and route
instructions in their delayed hints. Gate/release confirmations no longer reveal
the upstairs item immediately; discovered notices and notebook evidence retain
their existing contents.

The timer receives uncapped active frame time so low frame rates do not stretch
the minute. Pause, notebook, artwork, arrival and capture screens do not count.
Objective changes, inventory/gate progress and capture reset the timer; repeated
interactions, HUD refreshes and movement within an objective do not. A new run
creates fresh timing state. Browser runtime, help copy and regressions change;
no models, Unity sources or exported assets need regeneration.

Validation: escape-progress, game, notebook and grounds logic checks pass.
The objective regression covers the exact 60-second boundary, each objective,
same-objective progress, repeated interactions, wing changes, capture and retry.
The hardware browser regression passes both escape branches, desktop/touch hint
visibility and pause/notebook/artwork exclusions; its zero-movement timing steps
also verify that hints use active time independently of movement simulation.
Desktop and portrait captures in Browser/artifacts/escape-chain/ were visually
checked. The hardware launcher verifies NVIDIA GeForce RTX 3090 Ti / Direct3D11.
The required full npm test run stops at the already documented room-number
assertion in test-reception-second-floor.mjs:76 (expecting R42 in the notebook).
Its log is Browser/artifacts/objective-hints-suite.txt; this is not a full-suite pass.

## Outdoor escape choices and tool store (7 October 2026)

Asylum Escape now has a continuous scenario boundary made from hedges, railings
and existing masonry. A locked carriage gate preserves the front drive's visual
purpose and directs the player towards the north pedestrian gate. The pedestrian
route needs no item; its hinge noise can be avoided with the optional oil can.
The alternate north maintenance wicket takes a crowbar and three seconds of held
use. Both tools sit on a small external workbench beside the tower stores. The
water tower and service-building interiors remain unmodelled.

One outdoor guard uses facing and sight, hears nearby gate/tool noises, walks to
the sound position, searches for six seconds and returns to patrol. Seen pursuit
takes priority. Search and navigation recovery do not read an unseen player's
current position. Gate changes invalidate cached routes. Railings permit sight;
hedges and wicket boards obstruct it. The collision model retains scenario
obstacles through tree refreshes, and tree trunks never replace permanent fence
segments. Canopy clearance, gate swings and ordinary jumping use the same visible
geometry bounds. New instanced fittings are disposed on retry.

Boundary progress now requires a physical crossing through an opened gate, then
the existing mast interaction. A coordinate beyond the former Z=-50 threshold
cannot finish an attempt. Capture clears that crossing, returns tools to their
store and retains opened gates. Notebook entries remember discoveries, not future
items; the explored grounds map includes the store and revealed boundary. The
README/help explain the new controls. Design and modelling scope are documented
in Browser/ESCAPE-DESIGN.md and Research/escape-grounds/README.md.

Validation: test-escape-grounds.mjs covers the closed perimeter, jump height,
both routes, oil/noise, interrupted work, refresh/disposal and guard state changes.
The hardware test physically follows both outdoor routes, checks accessibility
from D2 and D8, samples the whole boundary with trees visible/hidden, exercises
keyboard walking and real touch-held use, freezes work in the notebook, verifies
capture/retry and follows the guard through investigation/search/return. Desktop
and portrait views are visually reviewed, with no runtime or shader errors.
The existing escape browser regression passes both physically walked indoor
branches, the new gate, mast ending, capture recovery and desktop/touch controls.
Its fixture now waits for streamed sections before accelerated traversal.
Game, escape-progress, notebook and outside movement checks also pass. The
hardware launcher verifies NVIDIA GeForce RTX 3090 Ti / Direct3D11.

The final scenery comparison adds 8 draw calls (216 to 224) and 22,250
triangles in the sampled north-gate view. Overlay construction takes about 11 ms
on this machine. Alternating 40-render GPU-synchronised samples have medians of
2.6–4.7 ms without the overlay and 3.0–3.2 ms with it. These overlapping,
variable samples do not establish an FPS improvement or a physical-phone
performance result; the draw/triangle deltas are the more repeatable comparison. The additions need no external model, texture
or audio assets, extra lights, or full interiors. Evidence and the exact sampled
numbers are in Browser/artifacts/escape-grounds/validation.json.

The required npm test run stops at the pre-existing room-number assertion in
test-reception-second-floor.mjs:76, expecting R42 in the notebook. The same failure
is reproduced using the unchanged HEAD notebook source; baseline and full-suite
logs are saved with the new evidence. This is not a complete suite pass.

Only browser gameplay, runtime fittings, documentation and tests change. Both
compiled aerial/interior manifests still match their source fingerprints; these
new scenario props are outside both compilers, so generated estate/interior assets
are not regenerated. Unity, Blender and packaged exports are unchanged.

## Front entrance buried-sill flicker (6 October 2026)

The older generic main-range sash at x=7 extended beyond Reception's side.
Its sill ended on the replacement recessed facade at z=17.3, producing the
pale flickering lines in the owner's red-circled screenshot. Generic front
sashes behind Reception are now omitted, as they already were behind the
stepped entrance ranges. The photographed Reception/entrance windows and
existing masonry, courses, rear windows and exposed outer-range sashes retain
their definitions. The source repair is in escape-exterior.mjs.

test-front-entrance-flicker.mjs surveys 72 assembled-wall points at the former
sill edges/centres and verifies the retained window schedule. It rejects the
original competing surfaces and passes the repair. It is included in the
standard and model suites. Entrance, exterior, front-corner, front-basement,
modern-entrance, building-detail and interior walking checks pass.

Hardware checks verify NVIDIA GeForce RTX 3090 Ti / Direct3D11. The focused
browser check surveys 72 actual visible/batched wall points in each source
and compiled scene, captures fourteen desktop/phone views without runtime or
shader errors, and reproduces the original defect from the saved builder.
Close and phone views are visually reviewed. Evidence, logs and the repeatable
check-browser.mjs are in Browser/artifacts/front-entrance-flicker/. The owner's
reference and modelling note are in Research/front-inside-corners/.

The required npm test attempt stops at the previously documented facade-course
count assertion, 23 versus 22. The compiled image comparison, exact draw counts,
full detail and fallback checks pass. Two broader timeline attempts fall back
to source after concurrent roof-model edits change the source fingerprint;
the complete compiled suite is not reported as passing. A final fresh build
and focused source/compiled recheck pass; its manifest matches the current
source fingerprint. The final receipt is recorded separately in the evidence
directory. Shared browser sources and local compiled aerial
assets are updated; Unity, Blender and packaged exports are not regenerated.

## West first-floor half-octagonal seating nook (6 October 2026)

The empty bay beside doors 116/117 now contains two plain timber waiting
benches and a newspaper stand, reusing the existing hall models. The benches
use the communal hall's 75% dimensions and meet the north/west masonry faces.
The stand faces into the bay from its eastern cheek. A separate WestBay
furnishing area supplies the notebook name and fixed records to both Escape
and Explore. Corridor, window and doorway clearances use the normal shared
placement checks; collision and navigation are regenerated with furnishing.
All 45 previous hall records retain their IDs, sizes and poses.

test-hall-furnishings.mjs passes all 48 hall records across four seeds,
52 walked furniture collisions, wall contacts, physical supports, corridor
lanes, reachable area markers and notebook names. Its notebook expectation
now checks visible area names, following the existing room-number correction.
test-asylum-furniture.mjs, test-notebook.mjs and test-game.mjs also pass.
npm run test:gpu verifies NVIDIA GeForce RTX 3090 Ti / Direct3D11.
test-hall-furnishings-browser.mjs passes rendered sizes/transforms, twelve
actual keyboard collision approaches, the east-corridor walk, identical
Escape/Explore records and desktop/phone views without runtime/shader errors.
Its geometry fixture now holds pursuers during movement checks, preventing
random capture from replacing a collision result. HALL_ARTIFACT_DIR allows
isolated capture output during concurrent work.

Desktop bay approaches, close seating, phone and Explore views are visually
reviewed. Evidence and the 45-record scope comparison are in
Browser/artifacts/west-bay-nook/; the full hall receipt and images are in its
halls/ subdirectory. Reproduce the dedicated views with
node Browser/artifacts/west-bay-nook/check-browser.mjs. The first-floor
furnished SVG/PNG is refreshed from the current shared layout, including
the separate neighbouring-room work in progress.

The required npm test attempt stops at the previously documented
test-facade-courses.mjs:68 count assertion (23 courses versus 22); its log is
Browser/artifacts/west-bay-nook/suite.log. This is not a complete suite pass.
Only browser hall furnishings, checks, notes and review drawings change.
The aerial compiler excludes these interior props and its source hash still
matches the existing compiled manifest. Unity, Blender and packaged exports
are not regenerated.

## Rooms 116, 117 and 119 refurnished (6 October 2026)

Player room 116 is first-floor R19; rooms 117/119 are R20/R22. Each ward
now has fourteen fixed beds: the original four keep their IDs, positions,
orientation and full model size, and ten additions extend the long-wall
arrangements with feet towards the central aisle. Explicit first-floor
`bedPositions` in both shared plans preserve the mixed original poses.
New beds are fitted before storage and spare seating. Chairs and small seats
cannot enter the full-width foot approaches, and adding beds does not increase
the number of loose seats. Both wardrobes remain in each ward.

Room 116 becomes a hand-sewing room with two timber worktables, four inward
facing Windsor chairs, two sewing baskets, two folded-cloth stacks and one
wardrobe. All eleven records remain fixed; cloth and baskets rest fully on
their tables. The existing hall models and materials are reused. Escape,
Explore and the notebook share the new purpose and furnishings. Ground-floor
uses, room numbering, architecture, doors, windows and stairs are retained.

Validation: test-rooms-116-119.mjs passes four seeds and 144 physically followed
bed/workstation/room routes. The eight-seed furniture survey passes 976 room
and exit routes, all door crossings, 3,504 furniture collision approaches,
storage access and NPC navigation/spawn checks. Central dormitory, layout,
room-door, door-label, notebook and room-finish regressions pass. Hardware
checks verify NVIDIA GeForce RTX 3090 Ti / Direct3D11, all 28 rendered bed
transforms/orientations, sewing furniture, actual keyboard movement through
both aisles, Escape/Explore parity and desktop/portrait views without page
or shader errors. The reviewed views are in Browser/artifacts/rooms-116-119/.
Independent comparisons retain 602 previous furniture records elsewhere for
each of seeds 1829 and 42, with identical walls, windows and door poses.

The required npm test run stops at the previously recorded exterior course
count in test-facade-courses.mjs:68 (23 versus 22). The focused room checks
are available through npm run test:rooms-116-119 and included in npm test.
The first-floor furnished SVG/PNG is refreshed. Only browser interior sources
and review drawings are updated; these inputs are excluded from the aerial
compiler and its source fingerprint remains current. Unity, Blender and
packaged application exports are not regenerated.

## Reception property tray bottom edge (6 October 2026)

The brass rims overlapped the timber base by 0.0135 units, leaving coplanar
outer faces that flickered along the bottom edge. Each rim now begins at the
base's top surface. Its upper edge, tray footprint, desk placement and key
positions retain their previous dimensions.

The geometry regression in test-escape-progress.mjs fails against the original
overlap and passes the corrected join across eight furnished seeds.
test-escape-progress-browser.mjs passes both escape branches, key confiscation
and reclaim, recovery/restart and desktop/touch interactions. Hardware
validation uses NVIDIA GeForce RTX 3090 Ti / Direct3D11. Empty and populated
trays are visually reviewed from the player position and three close angles,
plus a populated phone view; the lower edges are clean, with no runtime or
shader errors. Rerun node artifacts/property-tray-edge/check-browser.mjs from
Browser; before/after captures and receipts are in that directory.

The required npm test attempt stops at the previously documented
test-facade-courses.mjs:68 assertion (23 courses versus 22); its log is
Browser/artifacts/property-tray-edge/suite.log. Only the browser Escape runtime
model, regression check and development notes change. These runtime props are
outside the aerial compiler; Unity, Blender and packaged exports are not
regenerated.

## Supported Escape notices, keys and property tray (6 October 2026)

Escape's seven freestanding interaction stands are replaced by supported
fittings. Notices use clear interior wall runs or the existing table surfaces;
desk papers reserve the front strip beyond loose books. The staff stair key
hangs from a hook on a small timber rack, and the porter record has a separate
brass key on its desk (or a hook if a wall fallback is needed). Both keys have
open bows, stems and teeth. The basement release lever sits below its wall
notice. Placement chooses reachable standing positions connected to each
room's existing circulation, without adding aisle obstacles.

The open property tray rests on the front-left of the reception desk, clear
of its ledger, candles and bell. Its base and four raised rims contain only
the actual confiscated keys. Taking/reclaiming keys removes their geometry
and recovery glow; an empty rack no longer offers another take interaction.
Names such as “Staff stair key” and “Property tray” appear in the existing HUD
with the relevant take, inspect, use or reclaim action, without name-only
world boards. All notices and available items have feathered warm additive
halos, with no new lights or bloom pass. Restart disposes owned geometries,
textures and materials once each.

Validation: test-escape-progress.mjs passes all eight scenario combinations,
56 furnished approaches across eight furniture seeds, physical key/tray
structure and supported placements, collection/confiscation/reclaim visibility,
existing grilles, recovery and route rules. Game, Notebook and Reception
furniture checks pass. npm run test:gpu verifies NVIDIA GeForce RTX 3090 Ti /
Direct3D11. test-escape-progress-browser.mjs passes both physically walked
branches, both record offices/outside routes, capture/recovery/restart and
desktop/touch HUD interactions without runtime or shader errors. Its fixture
uses the actual doorway opening centres through their mouths, then walks to
the exact fitting approaches, avoiding grid segments clipping parked leaves.

All seven changed fittings and five phone views are captured with the torch
off and visually reviewed. Rerun this focused review with
node artifacts/objective-props/check-browser.mjs from Browser. Its captures
and receipt are in Browser/artifacts/objective-props/; the full escape receipt
is in Browser/artifacts/escape-chain/validation.json. The required npm test
attempt stops at the existing test-facade-courses.mjs:68 count assertion,
23 courses versus 22. This is not a complete suite pass.

The supplied reference and modelling scope are in
Research/escape-interior/README.md. Only browser Escape runtime props, HUD,
relevant checks and notes change. Shared plans, Explore furniture, Unity,
Blender and packaged exports are not regenerated. The compiled aerial
manifest still matches its dependency fingerprint; it excludes these props.

## Shared indoor ward privies (5 October 2026)

Converted ground/first R5, R16, R33 and R35 to eight shared washrooms: three
seats in each rear room and two in each forward room, twenty seats overall.
Each room has boarded privacy screens and a timber basin-and-jug washstand.
The original procedural seat has a real opening with a recessed pan and
small valve fitting. Plain masonry replaces the rooms' decorative finish.
These are interpretive 1829 fittings, grounded in the references recorded in
Research/room-furnishings/README.md; their locations are gameplay choices.

The separate seat/screen footprints preserve entry into the stalls. Fixed
placement records share rendering, walking, navigation and sight between
Escape and Explore. The rear room labels move into their clear common aisles.
Both shared plan JSON files and ground/first architectural/furnished SVG/PNG
drawings are refreshed. The static drawings use the existing SVG exporter
and the hardware browser for PNG rendering, since the exporter's optional
sharp dependency is unavailable here. Independent before/after comparisons
prove all other furnishings unchanged for seeds 1829 and 42, and all room
outlines, masonry, doors, windows, stairs and exterior geometry preserved.

Validation: test-sanitary-furniture.mjs passes four seeds, all twenty seats,
eight washstands, 112 physically followed access routes, genuine seat holes,
matching footprint dimensions and the three models' 4,300-triangle budget.
The shared furniture check passes eight seeds, 976 room/exit routes, 3,397
walked collision probes, 1,296 storage wall contacts and 648 shelf-front checks.
Focused layout, central dormitory, medical/hall furniture, room finish,
door, window-clearance, notebook and Explore interior checks all pass.

npm run test:gpu and the sanitary browser companion verify NVIDIA GeForce
RTX 3090 Ti / Direct3D11 through the required launcher. All 56 fixtures match
their rendered transforms and footprints; 28 actual keyboard approaches stop
at the visible seats/washstands. Eight rooms are captured in Escape/Explore,
plus phone and neutral model views, without runtime or shader errors.
Representative images are visually reviewed. The existing complete furniture
browser regression also passes all thirty-three models, actual transforms,
new-game variation and keyboard collision in both modes. Dedicated browser
checks save evidence separately from the review-plan PNGs to avoid concurrent
test writers competing for those images. npm test still stops at the
pre-existing test-facade-courses.mjs:68 assertion (23 courses versus 22).
Logs, screenshots, original-source snapshots and preservation evidence are
in Browser/artifacts/ward-privies/. One later preview run timed out at startup;
the instrumented rerun passed with no scene changes or runtime errors.
final-validation.json records the completed checks and the separate suite failure.
npm run test:privies reproduces the focused
checks; both checks are included in test:furniture and logic in npm test.

Browser interiors and review drawings are updated. The compiled aerial model
excludes these inputs and its manifest still matches the source hash; no
aerial rebuild is needed. Unity, Blender and packaged exports are not regenerated.

## Six extra beds in mirrored R2/R13 wards (5 October 2026)

R2 and R13 each gain six beds on both the ground and first floors, as confirmed
by the owner. Each room now has ten beds: five along each existing row. The
original four bed footprints, 1.975-unit spacing, inward orientation and
.40-unit head inset are retained. Three positions extend each row towards
the entrance end; the mirrored room uses the opposite x coordinates. Both
shared plan JSON files carry the rows. Planned bed totals add fixed beds to
the room's usual furniture list, and bed slots are fitted before wardrobes
and seats. Every planned bed still passes footprint, door and circulation
checks rather than being silently omitted.

The independent before/after audit retains all sixteen original bed poses
and the existing fixed wardrobes/benches across these four rooms; 438 fixed
items elsewhere are unchanged. Ground/first furnished SVG and PNG plans are
refreshed. Browser Escape and Explore share the new rows. The compiled aerial
model excludes these interior inputs and needs no rebuild; Unity, Blender
and packaged exports are not regenerated.

Validation: the shared furniture test checks the exact mirrored row spacing
and physically follows forty individual bed-foot routes, then passes all
eight seeds, 976 room/exit routes, doorway crossings, 3,075 walked furniture
collisions, NPC spawns/routes and storage clearances. Central dormitory,
room-door and exploration checks pass. Hardware browser validation verifies
the NVIDIA GeForce RTX 3090 Ti through the required launcher, all forty bed
instances' positions/dimensions/orientation, accessible bed feet, identical
Escape/Explore fixed furnishings, both floors from both ends and a portrait
view, with no runtime/shader errors. Evidence and the capture script are in
Browser/artifacts/outer-ward-beds/. The required npm test run stops at the
previously recorded test-facade-courses.mjs:68 assertion (23 exterior courses
versus 22 expected); its output is saved there as npm-test.log.

## Central dormitory beds against the walls (5 October 2026)

This correction supersedes the bed counts and rear circulation strips in the
three-dormitory revision below. All three first-floor central dormitories
(R6, R8 and R10) now have fourteen beds: eight along the window wall and six
along the entrance wall. Entrance-side slots 1 and 2 (zero based) are omitted
from the original eight-slot spacing, preserving the requested empty area
beside each doorway. Both rows' headboard backs meet the .09-unit masonry
face instead of leaving .95/2.15-unit strips behind them. Fixed and variable
Windsor chairs are removed from this room use; small Panca seats remain.

The shared row records distinguish the remaining count from the original
slots. Wall-fitted beds use rear-face probes and actual doorway/player
clearance, while retaining full bed footprints, furniture overlap checks,
door leaf/handle checks and collision/navigation updates. The three entrances
cap their opening at 105 degrees so the leaves clear the retained first beds.
Row-end walking strips are reserved across each bed's depth and foot access;
wardrobes refit against short walls in the wider middle aisle.

Both plan JSON sources and the first-floor furnished SVG/PNG are updated.
Browser Escape and Explore interiors share these records. The compiled aerial
model excludes the interior inputs; Unity, Blender and packaged exports are
not regenerated.

Validation: the dormitory logic check follows all 42 bed-access routes,
checks all headboard backs against their host masonry, verifies the six
removed slots, absence of chairs, clear row ends and retained wardrobes.
The shared furniture and door geometry checks pass. Hardware browser
validation uses the NVIDIA GeForce RTX 3090 Ti through the required launcher,
checks matching bed instances and 126 rendered wall contacts, and captures
all three rooms in Escape and Explore plus a portrait view. Evidence is in
Browser/artifacts/central-dormitory-wall-beds/. The npm test attempt still
stops at the pre-existing test-facade-courses.mjs:68 assertion (23 repaired
exterior courses versus 22 expected); the log is saved with that evidence.

## Three central first-floor dormitories (5 October 2026)

This section records the initial sixteen-bed arrangement and its validation.
The owner's later same-day request in “Adjust beds and chairs” removes two
entrance-side beds and the Windsor chairs from each dormitory and moves the
remaining headboards against the walls. That concurrent follow-up supersedes
the bed count and offsets below; the three-room conversion is retained.

Combined the six central rear rooms in adjacent pairs on floor 1: R6/R7 →
R6, R8/R9 → R8, and R10/R11 → R10. The three old dividing walls and absorbed
rooms' doorways are removed only on that floor. Merged room variants retain
the exterior outline, corridor corner and southern enclosure. Variant labels
now also supply the room's navigation/map coordinates instead of retaining
the old smaller room centre.

Each new dormitory has sixteen existing full-size beds, arranged eight per
long wall with feet facing a clear central aisle. Plan-defined rows are fixed
across game seeds. The placement engine checks the requested count and rejects
an obstructed planned bed instead of silently omitting it. Window-side heads
have .95 units of clearance; entrance-side heads have 2.15 units for the open
leaf and approach. Cross aisles stay clear at the row ends; R10's southern
allowance is 1.3 units so the .5-unit navigation grid includes the turn.
Wardrobes and seats are refitted after the beds; the old nursing work table
and linen shelving are removed. The room-use metadata, visible architecture,
wall finishes, notebook and walking/NPC geometry share the new room records.

Both shared plan JSON files and first-floor architectural/furnished SVG/PNG
drawings are updated. Notes are in Research/1829-interior-proposal/ and
Research/room-furnishings/. Browser interiors are updated; the aerial compiler
excludes these inputs, and Unity, Blender and packaged exports are not
regenerated.

Validation: test-central-dormitories.mjs checks the three merged rooms, all
48 beds, eight per long wall, retained ground-floor dividers, removed upper
doors, clear end aisles and 48 physically followed routes to individual bed
feet. The shared furniture check passes eight seeds, 976 room/exit routes,
3,049 walked furniture collision probes, 1,392 flush storage contacts and
696 unobstructed storage-front checks, with 81% fixed furnishings. Hardware
rendering is verified on the NVIDIA GeForce RTX 3090 Ti through the required
launcher. The browser companion passes Escape/Explore instance/collision
agreement for all 48 beds, keyboard movement through a removed divider,
six desktop room views, portrait and Explore views, with no page/shader errors.
These views were visually reviewed. npm run test:central-dormitories runs
the focused logic and visual checks; npm test and test:furniture include
the new relevant regressions. Evidence is in Browser/artifacts/central-dormitories/.

Retired only the three wall-join fixtures on the removed first-floor dividers;
ground-floor fixtures and the two retained dormitory boundaries remain in
the survey. The expected door/frame totals drop by three to 92 open room
doors and 94 interior frames. Final wall-join, door and frame reruns pass
126 surveyed joins, 391 mitred corners, 1,104 hinge contacts and 2,864 frame
support/clearance rays. Their full logs are saved with the room evidence.

The complete npm test attempt stops at the separate exterior assertion in
test-facade-courses.mjs:68: its survey expects 22 repaired courses and the
current exterior has 23. This task does not modify exterior courses. The
remaining suite is run independently, with results in remaining-suite.log
and remaining-suite.json alongside the visual evidence.

The remaining 126 commands finish with 120 initial passes. Three failures
referenced the deliberately removed dividers and old door/frame totals;
their corrected final reruns all pass. The other failures are the separate
Jarman and Leighton/Newton exterior primitive snapshots and the aerial
layout's saved lane vertices. These sources were not changed for the room
conversion. final-validation.json distinguishes the initial layout evidence,
resolved checks, unrelated failures and concurrent later bed revision.

## Walled central stair wells (5 October 2026)

All four internal return stair wells (S1/S3/S4 and the lower S5 connections)
now have continuous full-height masonry enclosures. Four joined 0.18-unit
walls fit inside each central void, preserving the full flight and landing
widths, tread geometry, smooth soffits, floor openings and navigation routes.
The existing red/cream material batches render the walls through the storey
bands and up to the top landing ceiling. Inner banisters meeting the masonry
are removed; exposed outer edges and unused flight mouths remain guarded.
Full-height walking collision shares the enclosure bounds. S5's newer single
straight Library flight and the capped old Library well retain their geometry.
This supersedes earlier open-well descriptions. Modelling notes are in
`Research/1829-interior-proposal/README.md`.

`test-asylum-stairs.mjs` passes 2,464 outward/inward wall-face samples, including
corner ends, material joins and ceiling/storey bands, alongside 1,783 planar
soffit/landing samples, 1,170 closed flight-side samples, 1,092 support/headroom
samples, 75 fall barriers and all 24 physically walked exit routes. The saved
original renderer fails the new full-height wall regression. Focused layout,
slab, Library, room-closure, masonry-join, wall-height, skirting, room-finish,
interior-architecture, jump, notebook and developer checks pass. Explore
walks all eight interior connections in both directions.

The hardware launcher verifies NVIDIA RTX 3090 Ti / Direct3D11.
`test-asylum-stair-wells-browser.mjs` captures 31 matched desktop/phone views
before and after, and walks all eight connections up/down in the actual
Explore loop without page or shader errors. The views are visually reviewed.
The furnished game browser check also passes all 24 E door round trips with
release latching, continuous basement/ground/first-floor stair travel, the
raised outside landing and desktop/phone renders without runtime errors.
It runs through `artifacts/stair-well-walls/check-game.mjs` into a fresh output
folder because an older screenshot was locked on the first direct attempt;
a later readiness timeout passes on rerun.
Saved sources, the original-renderer regression and validation evidence are
under `Browser/artifacts/stair-well-walls/`.

The required `npm test` attempt stops at the pre-existing exterior course-count
assertion (23 versus 22) in `test-facade-courses.mjs:68`. The legacy CPU game
harness also stops on its missing `bindDeveloperOptions` mock, before game
initialization. Focused checks run independently of these unrelated failures.
Both shared plan descriptions are updated. The aerial manifest's source hash
still matches; these interior sources require no aerial rebuild. Unity,
Blender and packaged exports are not regenerated.

## Single straight Library access staircase (5 October 2026)

The owner's green-circled stair view supersedes the earlier diagonal-return
correction. Both upper flights and their broad return landing are removed.
One north-rising flight beside the lower well follows the blue arrow, from
(-34.85,4.2,13.5) to (-34.85,8.4,8.35), with 24 risers. The former Library
well is filled with floor; only the new narrow opening remains. Flight solids,
treads, opening guards, collision, navigation, notebook marker and developer
overlay share the connection-specific geometry. R50's adjacent east boundary
has a local 0.8-unit setback, and C26 meets the new landing. See
`Research/west/single-library-stair-2026-10-05/README.md` and its saved reference.

Focused stair and slab checks pass 1,783 soffit/landing samples, 1,170 flight-side
samples, 1,092 visible support/headroom samples and 75 fall barriers, plus all
24 physically walked exit routes. Library checks pass 80 furnished/unfurnished
room trips, including disconnected upper wings. Layout, room closures, joins,
doors, frames, furniture, interior architecture and Explore checks pass;
furniture validation includes 1,000 room/exit routes. Notebook and developer
overlay checks pass. Independent preservation checks confirm seven unchanged
connections, 14 identical flight vertex buffers, matching shared plans and
16 clear probes through the former upper flights and landing.

The hardware launcher verifies NVIDIA RTX 3090 Ti / Direct3D11. Matched before
and after Explore views, the new approach, top landing, cutaway and phone views
are visually inspected. Furnished game Library routes, upper-wing navigation,
game/Explore F4 round trips and desktop/mobile/notebook/cutaway views pass
without page or shader errors. Evidence is under
`Browser/artifacts/west-single-stair/`.

The required `npm test` attempt stops at the existing exterior facade-course
count assertion (23 versus 22) in `test-facade-courses.mjs:68`, as documented
for the earlier Library passage edit. Focused interior checks run separately.
Both shared plans and first-floor/Library SVG/PNG drawings are updated. The
aerial manifest still matches its source fingerprint: these interior changes
need no aerial rebuild. Unity, Blender and packaged exports are not regenerated.

## Wider Library rear passage (5 October 2026)

The owner's blue-line screenshot moves the second-floor Library passage's
room-side wall back 1.4 scene units, from z=8.2 to 9.6, across the joined
R48/R49/R50 boundaries. The stepped court-wall throat increases from 1.2 to
2.6 units between wall centrelines, with 2.42 clear of the masonry; the main
straight section increases from 3.2 to 4.6. Green doorways follow their hosting
walls. C26's reserved route is widened and redirected through the bend to the
existing west S5 landing. Both plan JSON copies agree and the Library SVG/PNG
drawing is regenerated. See `Research/west-library/README.md` and the saved
`corridor-reference.png`.

The focused geometry check proves that only the three room boundaries and C26
change, preserving all other rooms/corridors, floor outlines, windows, stairs
and exit anchors. Furnished actors walk 18.8 units each way through the former
wall position, and three actor-width lanes pass through the widened throat.
`test-west-library.mjs` passes its 80 furnished/unfurnished cross-floor routes.
Room-door, door-frame, wall-join and furniture checks pass, including 1,000
furnished room/exit routes and complete doorway support. The existing Library
browser check passes furnished room returns, upper-wing navigation, game/Explore
F4 round trips and desktop/mobile/notebook/cutaway views without page/shader
errors. The hardware launcher verifies NVIDIA RTX 3090 Ti / Direct3D11; before
and after corridor views are visually reviewed. Evidence is retained under
`Browser/artifacts/west-library-corridor/`.

The final game-browser check also physically walks the player 18.8 units in
both directions along z=8.2 through the former partition, reaching both ends
without obstruction or page errors. Final desktop, reverse and phone views
are captured and visually reviewed in that same evidence directory.

The required `npm test` attempt stops at the pre-existing exterior facade-course
count mismatch in `test-facade-courses.mjs:68` (23 versus 22), before reaching
the interior tests; the focused interior checks above run independently and
pass. This browser interior change does not enter the aerial compiler's input
graph. No aerial binary rebuild is needed; Unity, Blender and packaged exports
are not regenerated.

## Level west-wing eaves from the red wall (5 October 2026)

The owner's blue-circled/red-wall correction identifies the differing eave
heights as the cause of the west roof connection problems. The outer pavilion,
west end and both canted bays now use the main range's y=14.53 slate edge,
with supporting walls at y=14.3. Upper cornice caps and gutters follow the
same level. The main ridge and four branches retain their coordinates and
y=17.08 crowns. Raised shoulders, slate wedges, rendered risers/returns and
the unfinished four-bay repair's additional clipping are removed. Reference
and superseding dimensions are in Research/west/level-eaves-2026-10-05/README.md.

The focused roof regression passes 95 perimeter samples, retained ridges,
closed valleys, matching wall tops and 552 physical roof/render samples.
The saved former model fails the revised regression. West refinement, inside
corners, basement access, garden stairs, inner courtyard and east forward-end
checks pass. Validation is restricted to 1829 and its immediate surroundings;
the whole-estate suites are not run, following the owner's instruction.

The hardware launcher verifies NVIDIA GeForce RTX 3090 Ti via Direct3D11.
Source and actual compiled aerial views each pass 22 retained-ridge and
16 bay-valley probes, with matching heights and zero intersections in
440 browser render samples. Overhead, front/back and close captures are
visually inspected; both paths have no page or shader errors. Logs, saved
sources, references and views are in Browser/artifacts/west-level-eaves/.

Shared browser modelling sources and the local compiled aerial are updated.
The final manifest matches the current source fingerprint and its binary
checksum is verified. Independent entrance-roof corrections are preserved.
Unity, Blender and packaged exports are not regenerated.

## Reception entrance roof tip removed (5 October 2026)

The owner's blue circle identifies a slate triangle projecting through the
west Reception parapet. The lower entrance roof return was sampling the
higher Reception roof at its attached end. `west-cross-range-roof.mjs` now
samples and trims the adjoining lower roof surfaces, retaining Reception's
separate roof. The existing lower pitch continues smoothly to its cornice.
Reference and scope are in `Research/1829-entrance-roof-tip/README.md`.

Validation is limited to this building and its immediate roof joins, following
the owner's instruction. `test-entrance-roof-tip.mjs` passes 24 height probes
and six lower-roof seam contacts. Reverting only this repair fails that
regression. After concurrent courtyard-roof revisions, the older
`test-west-roof-join.mjs` fails its bay rear masonry/cornice height assertion
at line 23. The same assertion fails with only this repair reverted; its
expectation is retained and the courtyard bay is outside this repair.

The hardware launcher verifies NVIDIA GeForce RTX 3090 Ti via Direct3D11.
Source and actual compiled entrance, close, low and neighbouring east-side
views are inspected without page/shader errors. The compiled scene passes
the same tip-height and seam-contact assertions. The local aerial asset is
rebuilt; concurrent modelling changes are preserved. Browser geometry is
shared by aerial, Explore and gameplay. Unity, Blender and packaged exports
are not regenerated. Reference, saved former roof, captures and focused
validation metadata are under `Browser/artifacts/entrance-roof-protrusion/`.

## West inside-corner protruding render (5 October 2026)

The owner's blue circle identifies two buried trim ends emerging through the
inner garden pavilion's brick side. `front-inside-corners.mjs` clips the old
main cornice and back-wall coping against the pavilion roof's actual footprint.
Only overlapping white trim changes. Reference and scope are in
`Research/west/render-protrusion-2026-10-05/README.md`.

Validation is restricted to this building and its immediate surroundings.
Corner, west-refinement and facade-course checks pass. Hardware rendering is
verified on the NVIDIA RTX 3090 Ti. Matched source and actual compiled browser
views have no white tips or page/shader errors; nine physical wall probes each
reach the brick pavilion. Captures and saved originals are under
`Browser/artifacts/west-render-protrusion/`.

The nearby roof-join check fails its valley continuity assertion at line 51;
the identical failure also occurs with only this render fix removed. Its
expectation is retained. Concurrent roof edits in the shared checkout are
preserved. The local compiled aerial is refreshed and checked for source
freshness. Unity, Blender and packaged exports are not regenerated.

## Matching white top render on 1829 (5 October 2026)

The owner's yellow/purple aerial annotation makes the existing roof-edge
render uniformly match the shared bright white (`0xe1e3dc`). Cream and
grey cornices, exposed roof-support slabs, parapets and coping on 1829
now use the same white mineral finish. The direct dragon pediment and
portico retain cream. No render is added to untrimmed sections; authored
geometry and lower facade finishes are retained. Reference and scope are
in `Research/1829-top-render/README.md`.

The shared browser sources and local compiled aerial are updated. The
final compiled manifest matches the current source fingerprint. Independent
shared-source revisions during validation are preserved. Unity, Blender
and packaged exports are not regenerated.

At the owner's request, validation is limited to 1829 and its immediate
surroundings; the whole-estate suites are not run. Existing east-forward-end,
west-refinement, west-roof-join and inner-courtyard checks pass. The existing
`test-front-inside-corners.mjs` fails its roof/trim transition assertion at
line 37, and the same assertion also fails using the saved pre-change
material sources. Its expectation is retained and this is not reported
as a clean five-check result.

The hardware launcher and GPU smoke check verify NVIDIA GeForce RTX 3090 Ti
through Direct3D11. Source and actual compiled aerial views each verify
32 named trim materials and ten visible contact probes: nine white roof
finishes and the retained cream dragon border. East, west, front and rear
captures are visually inspected; both paths have no page or shader errors.
The first compiled capture fell back during a concurrent source/model refresh;
the subsequent actual compiled capture passes. Evidence, saved originals,
focused logs and final-model metadata are under
`Browser/artifacts/1829-white-top-render/`.

## Hampton / Ince garden window alignment (4 October 2026)

The owner's yellow/blue, pink and green annotation corrects the garden
facade in `west-front-photo-detail.mjs`. Six canted sashes now use the
central sash's 1.10-unit glazing width. The complete right recessed window
bank, ledges and blue door share x=-44.70, the horizontal centre between the
bay root edge x=-49.40 and the pavilion wall x=-40. D3's outside arrival moves
with that door in both shared plans, preserving its interior anchor.

The two sashes on each lower floor of the green return now have centres at
z=15.838333 and 18.861667. Their complete sills leave equal 1.653333-unit
clear gaps at both ends and between the windows across the 7.70-unit wall.
The latest bay footprint, wall planes, roof and sash heights are retained.
Reference and dimensions are in
`Research/west/window-alignment-2026-10-04/README.md`.

The existing west regression verifies all three adjustments, widened pane
exposure, the former doorway's solid brick and the relocated door leaves.
Its corner clearance probe moves 0.06 units beyond the wider sash's existing
walking collision margin. Source, compiled aerial and Explore captures pass
80 pane probes apiece, twelve unobstructed door-leaf probes and desktop/phone
views without page/shader errors; Explore also checks the clear new arrival.
Evidence, saved pre-change sources and logs use
`Browser/artifacts/west-window-alignment/`.

Focused west, roof-contact, basement and outside-arrival checks pass, along
with the model suite, source/compiled image and draw comparisons, full-detail
loading, missing/incompatible/corrupt asset fallbacks and every timeline year.
The required npm test was continued after its Jarman snapshot failure; only
Jarman and Leighton/Newton's historical whole-estate expectations fail. Both
fail again with this correction removed in memory, using the saved validation
loader. Their old expectations are retained. Remaining-suite results and
baseline failure logs are saved alongside the matched browser evidence.

Browser sources and the local compiled aerial model are updated. Unity,
Blender and packaged applications are not regenerated. Independent concurrent
west-end and sash-column edits were preserved; the compiled model was refreshed
after those shared inputs changed during validation.

## West basement extension and court gravel (4 October 2026)

The owner's red/yellow/purple annotation extends the side-basement retaining
wall to the current lean-to, lowers the gap beside it and replaces the adjacent
court lawn with the existing gravel. `west-side-basement.mjs` derives its end
coordinates from `WEST_COURT_ALIGNMENT`: retaining wall to z=1.5, passage to
the court wall at z=5. Floor, courtyard grade, coping, stair entry and gallery
door retain their levels and dimensions. Foundations follow the extended floor.

`entrance-walks.mjs` extends the same gravel material to the court wall. Terrain,
older access paving and the rear-approach notch clear the new surfaces, with
early-year and hidden-layout lawn restoration retained. The reference and
superseding coordinates are in
`Research/west/basement-extension-2026-10-04/README.md`.

The focused basement check passes extended floor/coping and gravel rays,
walking in both directions, end-wall collision and hidden-layout restoration.
Its new extension probes reject the saved pre-change source. Source overhead
and close views and compiled views are visually inspected. The model suite
passes. Validation evidence uses `Browser/artifacts/west-basement-extension/`.

Actual compiled aerial and Explore pages each pass 18 lowered-floor probes,
four coping probes and nine matching-gravel probes. Explore's keyboard walk
reaches the new end wall at the lower level. Desktop and phone captures are
visually inspected with no page or shader errors. Source/compiled rendering
comparison passes; after simultaneous source revisions, the final timeline
check is rerun and passes every stop and live collision refresh. The current
compiled manifest matches the final shared modelling source fingerprint.

The required `npm test` passes all preceding checks and stops at the existing
historical whole-estate comparison in `test-jarman.mjs:11`: 818,951 primitives
against 818,930 stored. The saved pre-change source already failed that same
check with 818,973 primitives. The historical expectation is retained and the
complete suite is not reported as passing. Its log is `npm-test.log` in the
same evidence folder. Simultaneous west-window source changes are preserved.

Browser sources, checks, notes, the supplied reference and local compiled
aerial are updated. Unity, Blender and packaged exports are not regenerated.

## West-end face proportions (4 October 2026)

The owner's green/blue annotation requests 35% / 30% / 35% across the
outer western end while retaining the total width. `west-refinement.mjs`
derives the shallow pier from the existing z=5..20.5 limits. Its centre is
z=12.75 and its width is 4.65; both flanks measure 5.425. The door, central
glazing, render, courses, cornice, pipe and entrance path follow the pier.
The left flank's two narrow upper sashes retain their dimensions. Both plan
copies move only D2's outside arrival to the new door axis; its interior
anchor stays fixed. Reference and superseding dimensions are in
`Research/west/end-sections-2026-10-04/README.md`.

`test-west-refinement.mjs` checks the fixed overall width and exact section
ratios against physical masonry bounds, rays across both facade steps, the
matching white base and cornice, exposed windows and the door/path alignment.
Ground-render probes avoid the relocated door glazing. The saved original
facade fails the ratio regression. Facade courses, all 109 exterior-door
support/trim checks, walking and outside arrivals pass. Actual source and
compiled aerial pages measure the same ratios and pass 40 pane probes each,
with no page/shader errors. Desktop and phone captures were visually reviewed.
Rebuilt source/compiled image and draw-count comparisons, full-detail loading,
fallbacks and all timeline stops pass. Basement walking and 108 roof attachments
also pass; the final generated-model fingerprint matches the current source.
Evidence and baseline source use
`Browser/artifacts/west-end-sections/`.

The required `npm test` passes the preceding interior, furniture, game,
walking, exterior and west-facade checks, then stops at `test-jarman.mjs:11`:
818,951 primitives versus 818,930 in its protected whole-estate reference.
The saved pre-change west-end source also fails that check with 818,951
primitives. The reference is retained, and the complete suite is not reported
as passing. Full output and the baseline proof are in the evidence folder.

Browser sources and the local compiled aerial model are updated. Unity,
Blender and packaged application exports are not regenerated.

## West inside-corner roof and face alignment (4 October 2026)

The owner's purple-circled roof is the low forward root's east shoulder hip.
It is removed with the shoulder foundation, masonry and cornice. The remaining
root steps beneath the tall pavilion and begins its exposed lower-wing rear
face at z=21.2. The old two return sections, four sashes and coping follow that
rear face; their former detached coping strips are removed. The tall pavilion
and its attached floor bands remain in place.

The purple-marked short main-range face moves back 1.5 units from z=17 to the
yellow inside-corner wall's z=15.5 plane. The clipping retains exact collision
polygons, and a new solid brick facet and sampled roof closure/coping continue
the yellow wall to the pavilion. The existing east corner retains its geometry.
The latest visual reference and superseding model description are in
`Research/west/roof-face-2026-10-04/README.md`.

`test-front-inside-corners.mjs` checks the removed roof by name, six open-sky
and collision samples, six exact wall-plane rays, retained masonry and all
26 sashes' pane exposure, including the four moved return sashes. The saved
pre-change source fails this regression. Matching before/after overhead,
close and opposite views and validation scripts use
`Browser/artifacts/west-roof-face/`.

Focused corner, west-wing, facade-course, roof-attachment, basement walking
and period checks pass. The model suite passes. Actual compiled aerial and
Explore pages each pass six clearance samples, six alignment rays and sixteen
relocated pane probes, with no page/shader errors. Explore stops at z=15.8125
against the recessed wall. Desktop/phone captures were visually inspected.
The final compiled manifest matches the current source fingerprint.
Final source/compiled image and draw-count comparisons, full-detail loading,
missing/incompatible/corrupt asset fallbacks and every timeline stop pass.

The saved-baseline comparison preserves all 1,444,714 primitives whose bounds
do not intersect the correction area, including the opposite corner; nine
primitives are removed locally. The required `npm test` passes preceding
checks and stops at the historical Jarman whole-estate snapshot: 818,973
primitives versus 818,930 stored. The saved pre-change model also fails, with
818,982 primitives. The historical expectation is retained, and the full
suite is not reported as passing. Logs are in the same evidence folder.

Only browser sources, tests, references and the local compiled aerial are
updated. Unity, Blender and packaged application exports are not regenerated.

## Front west garden return: windows and setback (4 October 2026)

The owner's green/yellow photograph and matching overhead traces supersede
the earlier blank inner west return. The green wall now sits at x=-40,
one unit behind the retained yellow lower-wing face at x=-41. It has two
sashes on each lower floor; the upper west wall remains blank and the two
upper garden-end windows stay exposed. The upper pavilion is x=-40 to -35,
with its retained z=21.2 end. These dimensions are visual estimates.

`west-front-setback.mjs` supplies a stepped low-root footprint shared by
masonry, foundation, cornices and walking collision. The lower roof meets
the upper pavilion beneath its windows. The first yellow sash clears the
corner at z=22.1. Three generic sashes now inside the pavilion are omitted.
The garden door and flank glazing keep their existing x=-47.1 axis. The
complete pavilion and its upper cornices retain their 1849 construction
period in one group, including after aerial material batching.

The rear west section, opposite wing, court wall, broad cross-range depth,
outer end and fire escape retain their geometry. An exact comparison with
the saved pre-change source preserves all 1,444,316 primitives outside the
front correction bounds; the local scope has 16 net added primitives.
Original references and superseding dimensions are in
`Research/west/front-setback-2026-10-04/README.md`.

Focused west, nearby-corner, facade-course, roof-contact, basement, general
exterior and period checks pass. Fixed photograph-derived pane probes pass
and reject the saved original model. The required `npm test` was continued
from the updated general exterior survey; all preceding checks pass before
`test-jarman.mjs:11` reaches its already-divergent whole-estate snapshot.
The saved pre-change model had 818,966 primitives against 818,930 stored;
this local repair has 818,982. The historical expectation is retained,
and the complete suite is not reported as passing.

The local aerial model is regenerated and its fingerprint matches the final
sources. The model suite, source/compiled image and draw-count comparisons,
full-detail loading, fallback assets and timeline/walking-obstacle checks
pass. Actual compiled aerial and Explore pages pass 16 visible green-pane
probes each and walking collision against the new wall, with no page or
shader errors. Matching garden, overhead and aerial views and phone captures
are recorded under `Browser/artifacts/west-front-setback/`, together with
baseline sources, preservation proof and validation logs.

Only browser sources, checks, references, notes and the local compiled aerial
are updated. Unity, Blender and packaged exports are not regenerated.

## West wing marked outline correction (4 October 2026)

The owner's follow-up identifies the missing inner square garden projection
and asks for both sides of the broad west cross-range to move inward. The live
Google Earth link was opened and checked against the supplied overhead image.
`west-range-plan.mjs` now shares the corrected outline with the base estate,
front, court and end detail modules. Court and garden planes move inward by
four units each: the main body depth becomes 12.5 rather than 20.5, and the
outer end becomes 15.5 rather than 23.5. These are visual modelling estimates.

The restored full-height inner return has a blank west wall and paired upper
garden-end sashes. Roofs, floor bands, cornices, rainpipes, openings, entrance
recess and fire escape follow the physical wall changes. The attached court
lean-to moves intact, retaining its 3.5-unit depth. The long lower forward wing,
west-end entrance/path axis and sunken basement geometry remain intact.
References and superseding dimensions are in
`Research/west/outline-2026-10-04/README.md`.

Focused west, roof-contact, facade-course and basement/walking checks pass.
The facade survey now covers 22 courses, including both new inner-pavilion
cornices, with 78 explicit and 278 shared joins and 2,360 surface probes.
New west checks reject roof or collision remnants at the vacated wall strips,
require solid projecting masonry and exposed end windows, and retain the
blank west return and accessible entrance. Matched camera evidence and all
validation logs use `Browser/artifacts/west-outline/`.

The five affected outside arrivals (D2, D3, D5, D6 and F4) are synchronized in
the canonical and browser plan data. Their interior anchors and room geometry
are retained; rays from the new exterior arrivals verify the rendered door
leaves. The outside route/guard checks and general exterior probes now follow
the revised wall planes. Final outside walking passes all arrivals, seven stair
round trips and 1,264,760 movement probes. Source and compiled headroom checks
pass 20 flights / 2,340 tread samples; 107 guards pass 299 prevention probes.
Actual Explore keyboard movement also stops at the shifted landing rail, with
three desktop, dusk and phone views reviewed without runtime/shader errors.

The exact scope comparison preserves 1,443,014 outside primitives, adding 35
inside the correction bounds. The aerial asset was rebuilt and its fingerprint
matches the final model sources. The complete model suite passes. Compiled/
source rendering checks pass; a timeline screenshot write collided with a
concurrent run, so that same timeline check was rerun unchanged with its output
directory isolated under `west-outline/timeline/`, where all assertions pass.
Actual compiled aerial and Explore geometry, desktop/phone rendering and tree
obstacle refresh checks also pass. Browser sources, plan arrivals, checks,
references and the local compiled aerial are updated. Unity, Blender and
packaged exports are not regenerated.

The required browser suite was continued from the corrected outside/stair and
general-exterior probes after its already-passing interior checks. All preceding
checks pass; the historical whole-estate snapshot in `test-jarman.mjs` still
fails at line 11. The pre-correction baseline already had 818,931 primitives
against 818,930 stored, and this authorized local projection adds 35, producing
818,966 with the revised digest. The outside-scope geometry remains exact;
the protected snapshot is not rebased and the full suite is not reported as
passing. Evidence is in `suite.log`, `suite-resumed.log`, `suite-rest.log` and
`suite-exterior-final.log` under `Browser/artifacts/west-outline/`.

## Supplied engraving in the visitors’ hall (4 October 2026)

`hall-furniture-models.mjs` replaces the simple landscape with the exact
owner-supplied “Cheshire Lunatic Asylum” PNG, bundled locally under `dist/art/`.
Both existing framed copies share one 1897 × 1170 canvas texture. The complete
1897 × 1056 engraving, including its caption, fits without stretching or
cropping, with small neutral paper margins. Timber, frame geometry, wall
positions and the other hall print textures retain their existing definitions.

The focused hall and general furniture checks pass. Chrome checks both actual
frame instances in Escape and Explore against the uploaded image pixel for
pixel; desktop and phone views are visually reviewed with no page or shader
errors. Captures, the repeatable review script, byte-identical asset proof and
validation records are in `Browser/artifacts/hall-artwork/`.

The required `npm test` passes the preceding furniture, gameplay and interior
checks, then stops at `test-asylum-outside.mjs:12` on the F4 exterior stair walk
toward (-63.55, 26.05). That check’s 143-source dependency graph excludes the
edited artwork builder. The full suite is not reported as passing; its output
is `Browser/artifacts/hall-artwork/npm-test.log`.

The 172-source aerial compiler graph also excludes this interior builder, so
the engraving needs no aerial rebuild. Its current manifest differs from the
current exterior source fingerprint independently of this change; no aerial
assets are regenerated here. Only browser interior source, the supplied local
artwork, notes and review evidence change. Unity, Blender and packaged
desktop/Android exports are not regenerated.

## Ground-floor east linen work area (4 October 2026)

The owner clarified that the matching empty space is below the checkers area,
across the corridor from the ground-floor linen lobby. `hall-furnishings.mjs`
extends the ward service area to that side and adds six fixed records: a table
at (41.0, 12.8), two inward-facing Windsor chairs, supported folded linen and
a sewing basket, plus a matching bench at (41.0, 17.8). Existing linen cupboards,
trolley, bench and duty board retain their IDs and poses. First-floor furnishings
also retain their poses, including the new checkers group.

`hall-furniture-models.mjs` adds one original folded-linen prop, reusing the
existing cloth stack helper and materials. Its 168 triangles bring the ten hall
models to 8,360 triangles. The shared catalogue now has 30 kinds. Ground-floor
furnished SVG/PNG and the drawing palette are refreshed; the first-floor drawing
still records the checkers addition. These are fictional game furnishings.

The focused hall check passes all 45 records across four seeds, supported props,
chair directions, complete corridor lanes, cabinet access and 40 walked
collisions. Actual Chrome Escape/Explore checks pass all 45 rendered records,
nine keyboard collision approaches, wall contacts, corridor walking and matching
fixed furnishings. Wide desktop, phone and Explore views, the linen worktable,
bench, folded-linen model and updated plan are visually reviewed without runtime
or shader errors. Captures and validation are in
`Browser/artifacts/hall-furnishings/`; the run log is
`Browser/artifacts/linen-worktable-browser.log`.
The shared furniture browser regression also passes all 30 models, rendered
transforms, storage wall contact, keyboard collision and new-game fixed/variable
behaviour without runtime/shader errors. Its log is
`Browser/artifacts/linen-worktable-regression.log`, with validation in
`Browser/artifacts/room-furniture/validation.json`. All 32 original hall
furnishing records are independently compared with the original source and
remain unchanged.

The required `npm test` passes the furniture, game and interior checks and
preceding exterior checks, then stops at `test-jarman.mjs:11` on the existing
protected exterior snapshot mismatch: 818,931 primitives versus 818,930 expected,
with a changed hash. That test's dependency graph excludes both edited interior
modules; the historical snapshot is retained. The complete suite is not reported
as passing. Full-suite output is `Browser/artifacts/linen-worktable-suite.log`.

The aerial compiler excludes both edited interior modules, so these changes
require no aerial rebuild. Browser sources, checks, notes and furnished drawings
are updated. Unity, Blender and packaged desktop/Android exports are not
regenerated. Modelling scope is in `Research/room-furnishings/README.md`.

## West wing paired-photo proportions (4 October 2026)

The four owner-supplied photo/game pairs refine `west-front-photo-detail.mjs`
and `west-refinement.mjs`: lower outer and bay roof crowns, shorter pavilion
and bay sashes, narrower bay glazing, lower west chimney caps, and a wider,
better-centred west-end pier. White render now covers the complete west-end
ground storey. The entrance path, cornice and rainpipe follow the new entrance
axis. Established footprints, floor heights, basement and stairs remain intact.
The estimates and original references are in
`Research/west/proportions-2026-10-04/README.md`.

Focused west, facade-course, roof-contact, basement and modern-entrance checks
pass. New probes verify white render across the entire end, blank brick margins,
the shallow bay roof and the accessible entrance axis. All four matched camera
comparisons and the aerial overview were visually reviewed without page or
shader errors. An exact before/after comparison finds 1,443,480 primitives
outside the west-wing and entrance-path scope unchanged, with no net increase
in primitives inside that scope.

The local aerial binary was rebuilt and its fingerprint matches the current
modelling source. `npm run test:models` passes the geometry, binary, layout,
detail, performance and control checks. `npm run test:compiled` passes source/
compiled image and draw-count comparisons, full detail, shadows, controls,
portrait framing, fallback assets and timeline/walking-obstacle checks. Actual
compiled aerial and procedural Explore pages also pass revised-pier geometry,
desktop/phone captures and runtime checks. Logs, comparisons and validation
records are in `Browser/artifacts/west-proportions/`.

The required `npm test` passes the preceding checks and stops at the existing
`test-jarman.mjs:11` protected-estate snapshot mismatch. The original west-source
baseline already contains 818,931 primitives against the stored 818,930.
This refinement also legitimately changes that whole-estate digest; the stored
historical snapshot has not been rebased and the full suite is not reported as
passing. Browser sources, checks, reference notes and the local compiled aerial
are updated. Unity, Blender and packaged exports are unchanged.

## Second east first-floor checkers table and bench (4 October 2026)

`hall-furnishings.mjs` extends the first-floor recreation area across the
open junction and adds a matching table at (41.0, 12.8), four inward-facing
Windsor chairs, a supported draughts board and a bench at (41.0, 17.8) facing
the table. The original 32 hall furnishing records retain their IDs and poses;
the new seven records remain fixed between games and share the Escape/Explore
rendering, navigation, collision and sight system. The corridor between the
two table groups stays clear. The first-floor furnished plan is refreshed.

The focused hall check passes 39 records across four seeds, supported props,
chair directions, corridor lanes, cabinet access and 36 walked collisions.
Actual Chrome Escape/Explore checks pass all 39 rendered records, seven keyboard
collision approaches (including the new table and bench), wall contacts, corridor
walking and identical fixed furnishings. Desktop, phone, Explore and the revised
first-floor plan are visually reviewed without runtime/shader errors. The new
wide views and validation report are in `Browser/artifacts/hall-furnishings/`.
The required `npm test` passes the furniture, game and interior checks, then
stops at `test-jarman.mjs:11` on an unrelated protected exterior snapshot:
818,935 primitives versus 818,930 expected, with a changed hash. That check
does not load the edited interior source; its historical snapshot is retained.
The complete suite is not reported as passing. Output is in
`Browser/artifacts/checkers-extension-suite.log`.
The aerial compiler's 171-input graph excludes this interior source, so this
furniture change needs no aerial rebuild.
Only browser interiors and their checks/review notes change; Unity, Blender and
packaged desktop/Android exports are not regenerated.

## Room doors connected to their frames at the hinges (4 October 2026)

`asylum-doors.mjs` replaces the detached centre-line pivot with the room-facing
corner of each leaf's hinge edge. The pin is 17.5 mm beyond the actual casing
face, using its shared 54 mm projection. The closed leaf centre moves 53.5 mm
closer to the frame. Handles now derive from the leaf centre so their rendered
and collision positions follow the shifted timber. Target angles, hinge-side
selection and surround dimensions are retained. Masonry contact is recalculated
through the complete swing; seven doors are limited, including first-floor R27
at approximately 95.57 degrees.

`asylum-architecture.mjs` adds two 100 × 130 × 4 mm iron hinge plates per pin:
one fixed to the frame and one following the leaf. Both meet the existing
35 mm knuckle. The 540 added plate boxes across 90 doors reuse the existing
Iron instance batches, adding 6,480 triangles and no material or draw batch.
Walking, navigation, NPC sight and furniture clearance use the revised poses.

The focused geometry check passes 1,080 actual instance attachment checks,
fixed hinge-corner checks and all nine frame parts throughout each door's
swing, 2,160 masonry/skirting edge rays, seven wall contacts, 81 walked leaf
collisions and analytic/mirrored tight-wall fixtures. Offering the original
door source in memory fails the new frame-attachment assertion. The Chrome
regression passes 184 actual player doorway crossings, matching Escape/Explore
poses and 22 desktop/mobile captures without page or shader errors. Matched
original/repaired hinge closeups in four orientations, basement and phone views,
plus the constrained return's contextual view, are visually reviewed. Sources,
captures and logs are in `Browser/artifacts/door-hinges/`.

The required `npm test` passes the interior, furniture, walking and preceding
exterior checks, then stops at `test-jarman.mjs:11` on the existing protected
exterior snapshot mismatch: 818,931 primitives versus 818,930 expected. An
in-memory run offering both original door builders reproduces exactly the same
count and hash; its 142-module audit loads neither edited builder. The historical
snapshot is retained and the complete suite is not reported as passing.

The aerial compiler's 171-input graph excludes both builders, and its current
source fingerprint equals the existing manifest, so no aerial rebuild is needed
or performed. Only browser interior sources, tests and notes are updated. Unity,
Blender and packaged desktop/Android exports are not regenerated. Modelling scope
and owner intent are recorded in `Research/escape-interior/README.md`.

## Three open halls furnished (4 October 2026)

The first-floor hall directly over Reception is now a visitors’ sitting hall:
two tables with eight inward-facing Windsor chairs, books, a sideboard, two
framed landscapes and a visiting-hours notice. The ground-floor open area
east along the corridor is a ward service lobby with two open linen cupboards,
a wheeled wooden linen trolley, a bench and a staff duty board. Directly above
that lobby, the first floor has a communal recreation area with a four-chair
draughts table, newspaper stand, sideboard with books and a sewing basket,
and a bench near the windows. These are owner-approved fictional game uses.

`hall-furnishings.mjs` adds 32 fixed records in three separate furnishing
areas; it retains the shared plan, wall finishes, door/stair geometry and all
existing room/Reception furnishing records. Cabinet fronts reserve one metre
of access. Placement, navigation, collision and NPC sight use the same shared
catalogue as rendering. The notebook discovers the new named areas.
`hall-furniture-models.mjs` supplies nine original models totalling 8,192
triangles, using the existing timber/metal finishes and four shared local
canvas print textures. Models remain instanced by kind/material; no external
artwork, downloads or new game interactions are introduced.

`npm run test:halls` checks the models, four seeds, supported props, wall
mounts, table-facing chairs, cabinet access, original corridor lanes, walked
collisions and notebook discovery. Actual Chrome Escape/Explore checks pass
32 rendered records, 24 independent wall-contact rays, five keyboard collision
approaches, an east-corridor walk and identical fixed furnishings. Desktop,
portrait, Explore, notices, board/basket and nine model close views were
visually reviewed without page or shader errors. The shared furniture browser
regression also passes all 29 models, every rendered instance, storage backs,
keyboard collision and new-game fixed/variable behaviour.

The required `npm test` passes the preceding interior/furniture/game checks
and stops at `test-jarman.mjs:11`: its protected exterior fingerprint finds
818,931 primitives rather than 818,930, with a changed hash. That check’s
model graph excludes all edited interior modules; its expected snapshot is
retained. The full suite is not reported as passing. Full-suite output is
`Browser/artifacts/hall-furnishings/npm-test.log`; browser validation,
before/after images, the original records, scope proof and general rendering
results are in the same folder.

Ground/first furnished SVGs and PNGs are regenerated. The aerial compiler’s
171-input graph excludes these sources, and its current fingerprint matches
the existing compiled manifest, so no aerial rebuild is required. Only browser
interiors, checks, notes and review drawings change. Unity, Blender and packaged
desktop/Android exports are not regenerated.

## Cold-water apparatus size and pole flicker (4 October 2026)

`asylum-furniture.mjs` enlarges `hydroShower` to 130% in all dimensions:
1.586 × 1.430 × 2.964 metres. The shared model fitting and placement records
keep rendered bounds, walking collisions, navigation and sight aligned in
Escape and Explore. `medical-furniture-models.mjs` splits the left iron pole
around its brass control section, removing the coincident equal-radius shaft
surfaces that caused flicker. The original pole outline and fittings remain.

`test-medical-furniture.mjs` passes exact 130% dimensions, matching geometry
bounds, thirty shaft rays from five directions at six heights, all seven
fixed medical placements across four seeds, support and reachable routes.
The original continuous iron shaft reproduces coincident iron/brass first hits
and is rejected by the new shaft assertion. The general furniture check passes
eight layouts, 936 room/exit routes and 2,509 physically walked collisions.
The ground-floor furnished SVG/PNG is regenerated. The bath capture check
passes actual rendered dimensions and grounding, desktop/mobile R12 views,
matching Escape/Explore placements, six rendered material parts, enlarged
walking collision and no page/shader errors. Front, elevated, pole and room
captures were visually reviewed; evidence is in
`Browser/artifacts/cold-water-bath/`.

The required `npm test` passes the preceding interior and exterior checks,
then stops at `test-jarman.mjs:11`: the geometry outside its marked frontage
has 818,931 primitives instead of the expected 818,930 and a different digest.
An in-memory baseline offering the original bath/catalog sources reproduces
that assertion; its 143-module audit loads neither changed furniture module.
The full suite is not reported as passing. The regression log is
`Browser/artifacts/cold-water-bath-suite.log`, with baseline evidence in
`Browser/artifacts/cold-water-bath/suite-baseline.json`.

Only browser sources, checks, notes and the affected furnished plan are updated.
The current aerial source hash equals its existing compiled manifest hash
(`4c7716c7d30180e2d49f60447aeadd26ec854fc5118cadbecb4a8678d0596b34`),
so no aerial rebuild is needed or performed. Unity, Blender and packaged
desktop/Android exports are not regenerated.

## Muted and distressed room wallpaper (4 October 2026)

The owner's follow-up keeps the floral ornament but reduces its brightness
and saturation. Rose, sage and blue now use `#b29993`, `#969f8f` and
`#8593a4` in `Browser/dist/asylum-room-finishes.mjs`.
`Browser/dist/room-finish-textures.mjs` dulls the neutral paper ground and
softens the ink contrast, then adds deterministic soft age stains, rubbed
ink patches, fine scuffs and grain. All marks wrap across the existing
512px shared tile. The ornament paths, repeat size, cream dado paint and
room assignments are retained; this introduces no extra textures or draws.

The room-finish geometry check passes for the current checkout's 85 rooms,
5,373 wall samples, 92 door apertures and 274 window apertures. The browser
check initially timed out during startup; the same check passes on a
retry with additional startup diagnostics and unchanged assertions. It
confirms matching Escape/Explore, two shared maps, all three palettes,
desktop/mobile captures and no page or shader errors. The muted palettes,
phone view, repeated tile and Explore view were visually reviewed in
`Browser/artifacts/room-finishes/`. Logs are `muted-browser.log` and
`muted-browser-retry.log`; the broader regression log is `muted-suite.log`.
The required `npm test` passes the interior checks and then stops at
`test-redesmere-garden.mjs:143`: its marked frontage strip is not flush with
the adjoining wall. That check's 139-module import graph contains neither
wallpaper source; the shared checkout's separate exterior changes are retained.
The whole suite is not reported as passing.

Only browser interior colours, procedural texture source, notes and review
captures are updated. The wallpaper modules are outside the aerial import graph, so no aerial
model rebuild is required or performed for this change.
Unity, Blender and packaged desktop/Android exports are not regenerated.

## Complete interior window frames and dado clearance (4 October 2026)

The owner's marked screenshot identifies the generated sash's missing top
timber and the room dado entering its side jambs. `asylum-architecture.mjs`
adds the matching 80mm head between the existing jambs and supplies the full
frame footprints for generated and scheduled windows. `asylum-room-finishes.mjs`
clips merged rail runs against those footprints before forming joints,
including perpendicular reveals, the full 35mm profile projection and angled
windows. A 20-micrometre clearance prevents Float32 contact at free ends.

`test-asylum-window-frames.mjs` checks all 274 interior windows on four floors:
7,672 head/jamb/sill rays from both faces, independent triangle/actual-timber
intersection checks, and 280 retained neighbouring decorated rails. Separate
baseline modes reject the original missing head and the original crossing
rails. The existing window-clearance, basement-window and room-finish checks
pass. The geometry regression is included in `npm test` and `test:asylum`;
`npm run test:window-frames` also runs the browser comparison.

The full `npm test` run passes its first 47 commands, including all interior
window, finish, door, wall, collision, stair and exterior rail checks, then
stops at `test-escape-exterior.mjs:86`: the east bay's normalized footprint
differs from that test's expected half-octagonal proportions. An in-memory
baseline hook offering both original window builders reproduces the same
failure; its import audit confirms that neither changed builder is loaded
by the exterior test. That independent expectation is retained. Full-suite
and baseline logs and the import audit are saved with the repair evidence.

Matching original/repaired desktop and phone views cover ground, first,
basement and angled second-floor windows. Escape and Explore render without
page or shader errors. Evidence and baseline sources are retained in
`Browser/artifacts/window-frames/`, and modelling notes are in
`Research/room-wall-finishes/`. Only browser interior sources, tests and notes
are updated. The aerial import graph excludes the changed builders and its
current source fingerprint matches the compiled manifest; no generated aerial
rebuild is required or performed. Unity, Blender and packaged exports are
not regenerated. Existing top-floor layout, door labels and palette edits
in the shared checkout are preserved.

## Redesmere courtyard frontage proportions (4 October 2026)

The owner's photo comparison refines the existing garden frontage of 1829.
Its canted bay is shallower (depth 2.8 to 1.55, width 5.1 to 4.8), with
45-degree cheeks, narrower cheek sashes and a flatter roof. The square
pavilion narrows from 8.5 to 7.5, retaining its east wall and front plane;
the blank two-storey projection widens to meet it. Flat roof, coping and
walking collision follow the changed width, and the upper door still meets
its roof. Main-range and pavilion hips are lower. Paired brick-storey and
triple ground-storey window banks replace the separated left-hand sashes.
The upper row rises 0.6 units to improve the gap beneath the cornice.
Photo estimates and both owner references are in
`Research/redesmere-frontage/PROPORTIONS.md`.

The shared browser exterior sources and focused assertions change. The
garden, complete exterior, forward-end, west-refinement, roof-contact,
period and exterior stair-clearance checks pass. `npm run test:models`,
the local aerial rebuild and `npm run test:compiled` pass, including source
rendering equivalence, full detail, fallbacks, all timeline stops and live
collision refresh. Desktop, portrait, oblique, roof-plan and actual Explore
desktop/mobile captures were visually reviewed without runtime/shader errors.
Live walking stops at z=21.286 for the new bay, z=19.786 beside its cheek,
and z=25.286 at the blank projection; the passage reaches z=7 unobstructed.
Review views, saved original sources, scope measurements and logs are in
`Browser/artifacts/redesmere-proportions/`. Reproduce views with its
`capture.mjs source`, `capture.mjs compiled` or `capture.mjs explore` from
the repository root. The spatial comparison verifies all 1,444,515 primitives
outside the correction bounds retain exact geometry and transforms; there
are 30 net local primitives.

The required `npm test` passes through the preceding interior, exterior,
walking and annexe checks, then stops at `test-jarman.mjs:11` on its whole
protected-estate snapshot. Before this work it already found 818,901
primitives versus 818,930 expected. The authorised local facade changes
add 30, yielding 818,931 with a new hash. Its old baseline is retained;
the complete suite is not reported as passing. Unity, Blender and packaged
desktop/Android exports are not regenerated.

## Victorian room wallpaper and cream dado (4 October 2026)

The browser's 82 non-treatment rooms now use cream painted lower walls,
a stepped Victorian dado rail at 40% of ceiling height, and botanical damask
wallpaper above. Dusty rose, sage and faded blue are assigned deterministically
by room number and floor. Bedrooms, dormitory wards, offices, libraries,
stores and workshops use this finish. Treatment rooms, corridors, stair halls,
the basement stair lobby and the entrance porch retain the existing red lower
and cream upper brickwork. Shared partitions have independent finishes on
their two faces. The basement Grindley mural remains visible.

`Browser/dist/room-finish-textures.mjs` draws an original repeating ornament
inspired by the owner's supplied wallpaper reference, plus slightly worn
cream paint. All three colours and four floors share two 512 × 512 maps.
`asylum-room-finishes.mjs` classifies exposed wall faces, splits long faces
at room/circulation boundaries, and supplies attributes to the existing
Brick/Plaster batches. A shader replaces the masonry texture and relief on
decorated faces; wallpaper colour is a tint over the shared neutral pattern.
No wallpaper overlay planes or per-room textures are used. Wallpaper stops
at the ceiling; the original masonry continues through the existing slab join.

The 104mm moulded rail centres at 1.52m on the main floors and 1.16m in the
basement. It projects 35mm, follows actual wall surfaces at that height,
stops at window/door apertures and has mitred corners. Each floor's rails
share one mesh and material. `compare-geometry.mjs` removes only these finish
changes from an in-memory comparison, retaining the checkout's preceding
door/stair work. It measures one additional architectural draw per floor
and 47,872 additional triangles across all four floors. These are resource
counts; frame rates were not benchmarked. Walking walls, cells, door poses,
furniture and the shared plan remain unchanged.

`npm run test:room-finishes` passes: 82 rooms, 5,198 lower/upper wall rays,
independent corridor-edge and two-sided ward/treatment fixtures, 40% rails,
89 clear doorway apertures and 274 clear window apertures. Browser checks
confirm two shared 512px maps, three colours, matching Escape/Explore geometry,
and no page or shader errors. Desktop and phone views of all three palettes,
a bedroom, angled library, basement workshop/mural, second-floor office,
corridor, treatment room and close moulding were visually reviewed. The
wall/ceiling, skirting, door-frame and room-door focused regressions pass.
Review images, geometry accounting and logs are in
`Browser/artifacts/room-finishes/`.

The required `npm test` reaches the unrelated Jarman protected-exterior
snapshot mismatch: 818,901 primitives versus the fixture's 818,930. The
remaining suite checks were then run individually, with the Jarman check
included once to confirm its result. Leighton/Newton's protected-exterior
snapshot also fails, at 882,948 primitives versus 882,977. The suites are
not reported as fully passing. Neither failing test's import graph contains
any changed room-finish/interior material module, and the aerial source hash
still matches its compiled manifest. Protected fixtures are retained.

The owner reference and modelling scope are documented in
`Research/room-wall-finishes/`. Only browser interior sources, tests, notes
and review artifacts change. The aerial import graph excludes these inputs,
so its generated model requires no rebuild. Unity, Blender and packaged
desktop/Android exports are not regenerated.

## Reception desk moved and keys hung on hooks (4 October 2026)

`Browser/dist/asylum-furniture.mjs` moves the desk 1.53 metres toward the
back wall: z=14.5 becomes z=12.97, reducing its centre-to-wall distance by
30%. The chair keeps its 1.4-metre offset behind the desk, and `clerkSet`
shares the new desk position. Navigation and collision records rebuild
from the same placement. Both side passages, arrival, windows, stairs and
all room/exit routes remain accessible.

`reception-furniture-models.mjs` extends all six brass hooks from inside
the backboard through the key bows and adds raised ends. The bows rest
on the pegs; their shafts remain joined to the bows. The normalized final
meshes pass six raycast contact checks, raised-end checks and backboard
attachment checks. Reception geometry totals 5,164 triangles before print
planes and retains its existing catalog dimensions.

The focused model/placement check and actual Escape/Explore browser check
pass, including keyboard collision at the new desk position, matching
rendered transforms, desktop/mobile views and no runtime/shader errors.
Front and oblique cupboard closeups and hall/desktop captures were visually
reviewed in `Browser/artifacts/reception-furniture/`. The ground-floor
furnished SVG and PNG are regenerated.

The required `npm test` run passes the furniture, game, interior and preceding
estate checks, then stops at `test-jarman.mjs:11`: its protected exterior
snapshot expects 818,930 primitives and finds 818,901 with a different hash.
That exterior import graph excludes the edited interior modules; the existing
snapshot is retained. The full suite is not reported as passing. Logs are
`Browser/artifacts/reception-desk-keys-suite.log` and
`Browser/artifacts/reception-desk-keys-browser.log`.

These are browser interior source changes. Reception models build at
runtime; the aerial compiler excludes these sources. Unity, Blender and
packaged desktop/Android exports are not regenerated.

## Reception furnished and enlarged (3 October 2026)

Reception now has a central clerk's desk facing the main entrance, a Windsor
chair behind it, two waiting benches, a longcase clock, a wall-mounted hinged
key cupboard, a framed rules notice, and supported ledger/papers/ink/quill,
brass candlesticks and handbell. All Reception objects are 20% larger than
their initial versions. The shared catalog sizes the six new procedural
designs; only the Reception Windsor instance receives the extra scale.
The eight records are fixed across games and identical in Escape and Explore.

The open hall is a separate furnishing area, leaving the R24 stair hall empty.
The desk is x=0/z=14.5, facing +Z toward D1. Arrival moves from the occupied
old position to x=0/z=17.5 with yaw=0. Both sides remain walkable; the enlarged
benches/clock retain wall contact and both front windows remain accessible.
Movement, navigation, spawn filtering and sight consume the same dimensions
as the rendered instanced meshes. Desktop accessories rise with the desktop.

`reception-furniture-models.mjs` supplies six original models (4,924 triangles
before print planes), using the existing furniture finishes. Printed labels
use local canvas textures and unlit paper materials for legibility under the
torch. `reception-clock-audio.mjs` gives nearby ground-floor players alternating
ticks and an hourly bell strike. It follows active gameplay time, respects
Escape's sound toggle, and needs a gesture to unlock Explore audio.

The focused model/placement/audio check and actual Escape/Explore browser
check pass. Review captures cover the central desk, both side walls, close
clock/cupboard/rules views, desktop and portrait views. Keyboard input walks
both sides of the desk and stops outside its enlarged footprint. The shared
furniture check passes eight seeds, 912 room/exit routes, all framed door
crossings, 2,537 collision approaches, NPC paths/spawns and existing shelf
access. Evidence and full-suite logs are under
`Browser/artifacts/reception-furniture/` and the adjacent reception logs.

The complete rendered-furniture regression also passes, including twenty model
bounds, instance/collision transforms, storage-back contact, keyboard walking,
fixed landmarks/new-game variation and desktop/mobile Escape/Explore views,
with no runtime or shader errors. All four furnished-plan PNGs are regenerated
from their SVGs. The aerial compiler's 171-module import graph contains none
of the reception/furniture modules, so this work needs no aerial rebuild.

The final `npm test` attempt passes the reception, shared furniture/medical,
game/notebook, interior geometry, stair, outside-walking and preceding estate
checks, then stops at `test-annexe-carden-correction.mjs:13`. That independent
exterior snapshot expects 19,567 protected primitives and finds 19,568, with
a changed hash but the same root transform. Reception has no import into the
Annexe/aerial model graph. The full suite is not reported as passing, and the
unrelated Annexe geometry/snapshot is not changed by this request. The complete
log is `Browser/artifacts/reception-furniture-suite.log`.

Historical references and fictional details are recorded in
`Research/room-furnishings/README.md`. Browser sources and furnished plans are
updated; the aerial model import graph excludes these interior sources.
Unity, Blender and packaged desktop/Android exports are not regenerated.

## Wardrobes and bookshelves touch their walls (3 October 2026)

`Browser/dist/asylum-furniture.mjs` fits wardrobes and standard/stocked
bookshelves to actual wall segments with their backs on the rendered .09
wall face. Rear-only probes permit contact; side/front architectural checks,
full corridor widths, windows, entrances, stairs and room centres retain
their clearance checks. R31's two canted cheeks take priority over its flat
end wall, and the other libraries fill long walls first. Basement window
avoidance now uses the explicit schedule, matching its architecture renderer
and preventing a wardrobe from backing onto a window opening.

The furniture regression passes eight seeds, 1,288 complete storage-back
contacts, 584 clear one-metre shelf/cabinet fronts, 912 room/exit routes, all
doorway crossings and 2,505 walked furniture collisions. Navigation, pursuer
routes/spawns, supported decorations, fixed items and sight checks pass.
The browser check measures three points on each actual instanced storage
back against the rendered plaster, independently of placement/collision
records. All eight small-library checks pass: 32 stocked cases match their
rendered/collision dimensions, all eight book rows retain shelf contact,
each entrance can be walked to its room centre, and Escape/Explore agree.
Ten desktop/mobile/Escape captures have no runtime or shader errors. The
wardrobe, reading room, canted library, first-floor end library and portrait
library views were visually reviewed. All seven medical model/placement
checks also pass. The library check confirms the compiler's 171-module
import graph excludes the edited interior furniture sources.

The final general furniture browser run passes actual Escape/Explore
instances, all fourteen model previews, desktop/mobile views, keyboard
collision, fixed-item parity and new-game variation without runtime/shader
errors. All 161 wardrobes/bookcases pass 483 rendered wall-contact rays;
the largest residual is .00000672, within instanced Float32 precision.
`Browser/artifacts/storage-wall-contact/validation.json` confirms current
storage IDs and complete stocked-library placements match the rendered
review. The preview page now uses the same 120-second navigation/interaction
timeouts as the game page; its earlier default 30-second navigation timed
out during concurrent browser validation.

The required `npm test` run passes the preceding furniture, medical,
interior, walking and estate checks, then stops at `test-jarman.mjs:11` on
the existing protected exterior comparison: 818,899 actual primitives versus
818,930 expected, with the same mismatch recorded in the earlier shelf and
wardrobe notes. Its exterior import graph excludes these furniture sources.
The protected baseline is retained; the full suite is not reported as
passing. Full output is `Browser/artifacts/storage-wall-contact/npm-test.log`.

Evidence is in `Browser/artifacts/storage-wall-contact/`. Use
`FURNITURE_ARTIFACT_DIR=./artifacts/storage-wall-contact/game/` with
`test-asylum-furniture-browser.mjs` and
`BOOKROOM_ARTIFACT_DIR=./artifacts/storage-wall-contact/libraries/` with
`test-asylum-bookrooms-browser.mjs` to retain separate review captures.
The four furnished SVG plans are refreshed from current placements. Only
browser sources, checks, drawings and notes change for this request; Unity,
Blender and packaged exports are not regenerated. The aerial import graph
excludes these interior modules, so no aerial binary rebuild is required.

## Irregular furniture finishes (3 October 2026)

Both furniture material families now use `furniture-finishes.mjs`. A shared
256 × 256 seeded data texture packs smoothly warped timber fibres, broad
isotropic stain and fine wear. Repeat wrapping, linear/mipmap filtering and
anisotropic filtering replace the former unfiltered sine bands and stepped
fragment hashes. Object-space triplanar projection follows upright timber and
horizontal boards, with restrained colour and roughness variation. Paint/enamel
and iron/brass sample isotropic channels only. Books and mixed-material beds
use matte wear; dark timber joins the same subdued wood finish. Original muted
palettes, the licensed atlas, meshes, dimensions and collision records are retained.

`Browser/artifacts/furniture-finishes/capture.mjs` passes 48 paired views of all
fourteen models, actual rooms, close surfaces, wood/paint/enamel/metal swatches
and a portrait wardrobe, without page or shader errors. Review PNGs and
`comparison.json` are retained alongside the original shader snapshots; the
snapshot substitution happens over HTTP without replacing shared source files.
The flat swatches' former periodic-band amplitude falls by 98.5% for wood,
98.4% for paint, 98.6% for enamel, 88.4% for iron and 67.7% for brass. These
measure one former frequency range under fixed lighting, not overall realism
or performance. The seven-medical-model geometry/material/placement check passes.

The required `npm test` stops at the small-library east-bay shelf count
(`test-asylum-furniture.mjs:56`, one shelf versus two). A separate run using
the saved original medical materials also stops on small-library circulation
at first-floor R34. The focused game browser check reaches its geometry phase,
then stops at the existing storage-back wall gap for `2:B3:fixed:2`; that same
failure is recorded in the earlier wardrobe-height validation below. The
complete suites are not reported as passing. Logs and reproducible checks are
in the surface-review directory. Concurrent wardrobe-height, surgical-table,
library and architectural edits are retained.

The compiler's 171-module aerial import graph excludes all three edited/new
material modules, so no aerial rebuild is required. Only browser surface sources,
notes and evidence are updated; Unity, Blender and packaged exports are not
regenerated.

## Wardrobes match bookshelf height (3 October 2026)

The shared Escape/Explore wardrobe catalog height is now 1.90 × 1.5 = 2.850,
matching standard and fitted bookcases. Its 1.50 × .65 footprint is retained.
The existing procedural normalization scales the complete case vertically
from its floor origin; collision/sight dimensions and supported decorations
follow the same catalog. Existing wardrobe bounds, front-ray and instance
checks now expect bookshelf height and probe the full taller door surface.

`Browser/artifacts/wardrobe-height/comparison.png` was visually reviewed with
the actual models side by side: both tops measure 2.8499999046, the wardrobe
base is grounded and its width/depth are retained. Desktop/mobile game views
were reviewed without rendering errors. An eight-seed old/new height comparison
retains furniture placement, with decorations rising to their supporting case.
The initial furniture regression passes 912 room/exit routes and 2,375 walked
collisions. Other furniture-source and test changes landed in the shared
checkout during validation. The required `npm test` attempt stops at the
small-library east-bay assertion; the focused rerun stops at first-floor R34
shelf count. A current-source comparison finds the same one shelf there at
both 2.15 and 2.85 wardrobe heights. The browser rerun stops at the storage-back
wall-gap assertion for `2:B3:fixed:2`. These runs are not reported as passing.
Logs and size/placement evidence are retained in that artifact directory and
`Browser/artifacts/wardrobe-height-npm-test.log`.

Only browser catalog/checks and notes are updated for this height request.
Unity, Blender and packaged exports are not regenerated. The aerial compiler's
171-module import graph excludes these furniture modules, so no aerial rebuild
is needed.

## Surgical table size, label and cushion (3 October 2026)

The owner clarified the requested size as 130% of the previous model, or 30%
larger. The shared Escape/Explore catalog now gives `operatingTable` a
1.066 × 2.704 footprint and 1.326 height. The full assembly is normalized to
these dimensions, and placement, rotated walking collision, navigation and
sight consume the same catalog. Ground R6 retains its fixed surgical table.

The front label increases from .40 × .07 to .56 × .13 before normalization
and hangs on a .60 × .17 timber plaque at the extending footplate's front
edge. Two brass hangers attach the plaque to the footplate; the label clears
the overhang. The green head cushion now follows the headboard's -.42-radian
angle and its top surface, using the sum of the board/cushion half-thicknesses
along the board normal. It no longer floats above the sloping timber.
The seven medical models total 28,460 triangles without runtime label planes.

`test-medical-furniture.mjs` passes catalog/geometry bounds, exact 130% size,
base contact, nine actual cushion-underside/headboard ray contacts, all seven
fixed medical placements across four seeds, reachability and supported
decorations. Front, elevated and head-end close renders were visually checked;
all 18 rays to the label's centre and edges reach the text unobstructed.
Desktop and phone-sized R6 captures were reviewed with no page or WebGL
errors. The table-specific Explore check confirms the identical fixed R6
table, all eight rendered assembly parts and their transforms/bounds against
the collision record, and a walked approach stopping outside the enlarged
footprint. `scope.json` confirms that resizing the table leaves every other
room's furniture records unchanged. Reproduce the rendering checks with
`node Browser/artifacts/surgical-table/capture.mjs`; review evidence is in
`Browser/artifacts/surgical-table/`.

The current general furniture check passes eight seeds, 1,288 flush storage
backs, 584 clear shelf/cabinet fronts, 912 room/exit routes, every doorway
crossing and 2,505 walked furniture collisions. The initial check also passed
before concurrent storage-placement changes. During that work the first full
suite attempt stopped at first-floor R34's stocked shelf count; the furniture
browser recheck stopped at the separate storage-back wall gap for
`2:B3:fixed:2`. The later full-suite rerun passes those placement checks and
the surgical model check. The initial logs are retained as `npm-test.log` and
`furniture-browser.log` in the surgical review folder; `scope.json` now reports
three R34 cases at both the original and enlarged surgical-table sizes.

The final furniture browser run passes all fourteen model previews,
desktop/mobile room views, actual rendered/collision transforms, keyboard
collision, stable fixed items, new-game variation and shared Escape/Explore
placements, with no page/shader errors. The preview navigation timeout was
raised in the shared test to the same 120 seconds already used by its main
page after an earlier 30-second startup timeout. Final visual evidence is in
`rooms-verified/` and `furniture-browser-verified.log`.

The final complete `npm test` attempt passes the furniture, medical, interior,
game, walking and preceding estate checks, then stops at
`test-jarman.mjs:11`: 818,899 actual exterior primitives versus 818,930 in its
protected comparison. This is the existing exterior discrepancy recorded in
earlier notes; that geometry path excludes the surgical-table model. The
comparison baseline is retained, and the full suite is not reported as
passing. The final output is `Browser/artifacts/surgical-table/npm-test-final.log`.

The furnished SVG plans and relevant research notes are updated. The aerial
manifest's source hash still matches the current import graph, which excludes
these interior furniture modules; no aerial rebuild is required. Only browser
sources and review artifacts are changed for this request. Unity, Blender and
packaged desktop/Android exports are not regenerated. Other shared edits are
preserved.

## Bookshelf and dispensary front access (3 October 2026)

Every shared Escape/Explore `bookcase` and `apothecary` placement now reserves
one metre in front of its visible face, across the complete width plus .10
at each side. The reservation rotates with the model's local +Z front. A
separating-axis check rejects other furniture entering it in either placement
order, including varied chairs and supported decorations. Architectural checks
retain the actual frame-width strip and a player-sized standing position.
Access strips remain placement constraints rather than invisible walking
obstacles; collision and navigation are regenerated from the resulting real
furniture records before actors are reset.

Fixed shelves and dispensary cabinets are allocated first, retaining their
original fixed ID indices, before other furnishings use the remaining space.
Items without a safe placement follow the existing general-furniture omission
rule. Concurrent storage-wall fitting, taller wardrobes and surgical-table
updates are preserved; compact-room shelf counts supersede the earlier counts
below where the combined constraints cannot accommodate all of them.

The independent polygon audit in `test-asylum-furniture.mjs` checks every
target against every other furniture footprint across all floors and eight
seeds. The final source check passes 584 full one-metre access strips, 912
room/exit routes, all doorway crossings, 2,523 walked furniture collisions,
NPC navigation/spawns, supported decorations and eye-height sight. It also
passes the concurrent 1,288 flush-storage-back checks. Original placements,
current comparisons, browser review images and logs are retained under
`Browser/artifacts/furniture-front-clearance/`. The owner's screenshot and
regenerated furnished plans are recorded in `Research/room-furnishings/`.

Browser source, regression checks, research notes and furnished drawings are
updated. The separate aerial compiler excludes these interior sources, so no
aerial rebuild is needed. Unity, Blender and packaged desktop/Android exports
are not regenerated.

The final small-library browser check passes all eight rooms and 32 stocked
cases, their rendered/collision dimensions, supported book rows, actual
doorway-to-centre walks, Escape/Explore parity and ten desktop/mobile views.
The focused `capture-clear-fronts.mjs` in the evidence directory independently
checks all 73 rendered shelves/cabinets and all 248 assembly parts against
their placement, rotation and scale, verifies clear player standing space,
and compares every protected item between Escape and Explore. Its seven fresh
desktop/mobile captures pass without page or shader errors; the dispensary,
angled library and upstairs library views were visually reviewed. Reproduce
it with `node Browser/artifacts/furniture-front-clearance/capture-clear-fronts.mjs`.

The complete `npm test` rerun passes furniture, medical, interior, gameplay,
walking and preceding estate checks, then stops at `test-jarman.mjs:11`:
818,899 actual exterior primitives versus 818,930 in the protected comparison,
with differing digests. This exterior graph excludes the changed interior
furniture source. The full suite is not reported as passing; its output is
`npm-test-final.log`. The general furniture browser check also stops on its
separate newly added storage-back contact ray for `2:B3:fixed:2`, which misses
the plaster wall. Its `browser-final.log` is retained without weakening that
assertion. The focused front-access and library browser checks above pass
against the stable combined layout despite that additional wall-contact issue.

## Book-filled small libraries (3 October 2026)

The owner's half-octagonal east-wing screenshot requests stocked shelves in
the matching small rooms. Ground/first R18, R21 and R31, ground R37 and first
R34 now form eight Small libraries in the shared Escape/Explore interior.
They contain 36 fixed bookcases; R31 fits one on each angled cheek. Actual
masonry boundaries provide shelf positions, rather than the rectangular
room envelopes. Entrances, centres, windows, stairs and exits remain clear.
The separate 150% size revision below is retained: fitted cases are currently
1.575 × .420 × 2.850, with matching rotated walking/navigation/sight footprints.

Each of four shelf levels has two groups of books resting on its measured
board surface. The stocked geometry is a separate rendering variant used by
these rooms. Standard cases retain their earlier book arrangement. Instanced
transforms follow each placed item's dimensions in all three axes. Room-use
names, reference image and regenerated furnished plans are in
`Research/room-furnishings/`; source assets and licences are retained.

The eight-seed furniture checks pass every room/exit route (912 total), all
doorway crossings, physical furniture collision, NPC paths/spawns, supported
decorations and eye-height sight. `test-asylum-bookrooms-browser.mjs` checks
all 36 actual rendered cases against their collision dimensions, all eight
book rows against shelf-board rays, and physically walks every library's
doorway to its centre. Ten desktop/mobile/Escape captures pass without page
or shader errors, and Escape/Explore placements match exactly. Evidence is in
`Browser/artifacts/small-libraries/`; `npm run test:furniture` includes this
browser check. Help cards are hidden only in the review captures so shelves
can be inspected; game UI is retained.

The general furniture browser check also passes all fourteen model previews,
rendered/collision transforms, actual keyboard collision, stable fixed items
and new-game variation, with desktop/mobile Escape and Explore views and no
page/shader errors. `check-current.mjs` in the library evidence directory
confirms the current shared checkout still matches all 36 reviewed cases.

The aerial compiler's import graph excludes the edited interior modules,
so these additions require no aerial rebuild. Browser sources, checks,
furnished drawings and notes are updated; Unity, Blender and packaged
desktop/Android exports are not regenerated for this addition.

The complete `npm test` rerun passes the preceding furniture, medical,
interior, game and exploration checks, then stops at `test-jarman.mjs` on
its protected exterior comparison: 818,899 actual primitives versus 818,930
expected. Its exterior imports exclude these interior shelf modules. The
protected reference is retained; the full suite is not reported as passing.
The complete output is `Browser/artifacts/small-libraries/npm-test-final.log`.
The first attempt's temporary file-open failure while saving window-clearance
evidence is retained in `npm-test.log`; that check passes both its focused
recheck and the final full-suite attempt.

## Bookshelves at 150% (3 October 2026)

The shared Escape/Explore bookcase is 150% of its previous width, depth and
height: 1.875 × .570 × 2.850. The complete shelf/frame/book assembly scales
together from its floor-level origin. Shelf contact metadata follows the same
scale, retaining a .003 gap beneath the books. Fitted stocked shelves in the
concurrent small-room additions also follow this scale: 1.575 × .420 × 2.850.
Placement, rotated collision, navigation and sight consume these dimensions.
Additional checked wall positions accommodate the enlarged cases. The narrow
east bay retains its two angled shelves and a clear entrance/room centre.

Independent before/after browser captures and geometry measurements are in
`Browser/artifacts/bookshelf-scale/`: all three dimensions measure exactly
1.5 times the original, the base remains grounded and all four book groups
retain their supporting shelf contact. The furniture checks pass eight seeds,
912 room/exit routes, all doorway crossings and 2,401 walked collisions.
The original 40 standard case IDs are all retained at 150%; the enlarged cases
use the fitted doorway-approach and room-centre clearance checks where needed.
The complete furniture browser check passes actual Escape/Explore instances,
desktop/mobile views, keyboard collision and shelf contact without runtime or
shader errors. The final room capture checks all 76 rendered cases and all 228
assembly parts against their enlarged collision sizes. Six restored linen/store
and fitted-bay desktop/mobile views pass without runtime/shader errors and were
visually reviewed. Regenerate them with
`node Browser/artifacts/bookshelf-scale/capture-rooms.mjs`.
The full `npm test` run reaches `test-jarman.mjs` and fails the separate exterior
snapshot hash (818,930 primitives in both actual and expected). Its log is
`Browser/artifacts/bookshelf-scale-npm-test.log`; no exterior snapshot is changed.

Browser sources and furnished drawings are updated; the imported furniture
files, Unity, Blender and packaged exports are not regenerated. The compiled
aerial scene excludes the interior furniture sources and requires no rebuild.

## Redesmere courtyard windows and fire-exit trim (3 October 2026)

The two lower narrow windows beside the white rear-court stair enclosure are
removed. The remaining upper sash moves from y=6.95 to y=6.5, matching the
neighbouring upper row while retaining its dimensions and wall plane.
`Browser/dist/rear-court-photo-detail.mjs` splits the white band at y=4.95
around the upper fire-exit door, leaving a 0.1-unit gap beside each jamb.
Walls, building footprints, doors, stairs and the band's outer endpoints
retain their positions. Geometry is constructed before instancing and
collision extraction; no runtime transform or shadow-cache change is needed.
The owner's marked screenshots and dimensions are recorded in
`Research/east-courtyard/README.md`.

The extended `test-escape-exterior.mjs` detects the original three-window
stack and passes after the repair. It checks the aligned opening, exposed
wall at the removed windows, twelve unobstructed door-leaf rays and the gaps
beside both jambs. Three before/after Explore views were visually reviewed
without page or shader errors. Captures and reproducible scripts are in
`Browser/artifacts/redesmere-window-trim/`.

The aerial model was regenerated and its source fingerprint verified current.
The source/compiled comparison passes exact geometry/draw counts, rendering,
full-detail loading and missing/incompatible/corrupt-model fallbacks; 0.017%
of pixels exceed its difference threshold. The full timeline check reached
its final screenshot but could not open an existing output image. Its rerun
with a fresh output directory passes all original assertions, including every
period, mobile controls and walking collision refresh.

Of all 118 browser-suite commands, 116 pass. `npm test` stops at the Jarman
whole-estate comparison; continuing the remaining checks also reports the
Leighton/Newton comparison. Both saved fingerprints
already disagree with the pre-edit courtyard model. The scope audit retains
818,881 Jarman and 882,928 Leighton/Newton primitives exactly, with all 49
removed and 18 added records confined to the requested windows and trim.
Neither comparison baseline nor its exclusions is refreshed for this repair.
Detailed results are in `audit.json`, `suite.log` and `remaining.json`.

Browser modelling sources, checks, notes and local generated aerial assets are
updated. Unity, Blender and packaged desktop/Android exports are unchanged.
Existing work in the shared checkout is preserved.

## Rectangular wardrobes and 130% chairs/tables (3 October 2026)

Windsor chairs and ordinary work tables now use 1.3 times their former width,
depth and height in the shared Escape/Explore catalog and renderer. Their
dimensions are .624 × .611 × 1.17 and 1.95 × 1.066 × .988 respectively.
Table seat spacing derives from the enlarged chair width. The original glTF
meshes remain intact and are fitted to the new catalog dimensions at runtime.

The pale glazed cupboard shown in the owner's screenshot, including its
Shaker base, is replaced across all `cupboard` instances by a plain rectangular
double-door wardrobe: 1.50 × .65 × 2.15, with a closed plinth, solid timber
doors, shallow framing and brass fittings. `wardrobe-model.mjs` shares the
medical material factory with the dispensary cabinet, preserving its timber
palette, grain/wear and brass finish. The retired Shaker mesh and its source
licence are retained as archived assets; runtime loading no longer requests
them, and the old frosted-glass upper case is removed from the model library.

Wardrobe placement searches additional safe wall positions and no longer uses
the nightstand's bedside rule. It retains the existing general-furniture
fallback when no position preserves architectural, window, door, corridor,
room-centre or stair clearance. Only the seven medical equipment placements
are mandatory. This resolves the temporary `0 R5 cupboard` readiness failure
recorded during the concurrent electrical-label check below. Collision,
navigation, safe spawns and eye-height sight derive from the rendered sizes.

Focused validation passes eight reproducible layouts, 912 room/exit routes,
all doorway walks, over 2,300 walked furniture collisions, NPC routes/spawns,
supported decorations and eye-height occlusion. Wardrobe rays verify its
closed front and absence of glass, with actual bounds matching the catalog;
material checks compare against the dispensary finish. All seven medical
equipment checks also pass, including the concurrent electrical-label change.
The four furnished SVG plans are regenerated. Review evidence and full-suite
output are under `Browser/artifacts/furniture-resize/`. The actual game browser
check passes desktop/mobile and neutral-model views, rendered bounds/transforms,
keyboard collision, new-game variation and fixed Escape/Explore parity without
page or shader errors. It also verifies that the retired Shaker model is never
requested. The wardrobe, enlarged chair/table grouping and portrait wardrobe
views were visually reviewed.

The complete `npm test` attempt passes the furniture, medical, interior,
walking, stair and preceding estate checks, then stops at `test-jarman.mjs:11`:
the protected exterior geometry digest differs (818,899 actual primitives,
818,930 expected). That assertion hashes `createEscapeExterior` geometry and
does not include these interior furniture meshes. The exterior source and
expected snapshot are retained. The remaining suite commands are not reached
by this run; the full output is saved as `npm-test.log`. The current furniture
regression was rerun after the concurrent small-library updates and passes;
its final output is `furniture-final.log`.

Only browser sources, validation, drawings and notes change for this request.
Unity, Blender and packaged exports are not regenerated. The compiled aerial
model excludes these interior sources; its source hash matches the existing
manifest, so no aerial rebuild is required. Concurrent bookcase, electrical
label, interior architecture and exterior work is preserved.

## Electrical apparatus label clearance (3 October 2026)

The browser electrical apparatus now carries a wider label on a dark timber
plaque, lowered below the tabletop and brought just forward of its overhang.
The brass drawer knob is offset to the left so it no longer covers the text.
The plaque remains inside the existing model bounds and collision footprint.
Only `Browser/dist/medical-furniture-models.mjs` is changed for this adjustment;
Unity, Blender and packaged exports are not regenerated. The compiled aerial
model excludes these interior furnishings and requires no rebuild.

Front and elevated close renders were visually checked. All 18 rays to the
label's centre and edges reach the label without intervening geometry, with
no page or WebGL errors. Reproduce these captures with
`node Browser/artifacts/machine-label/capture.mjs`; evidence is in that folder.
The focused medical check passes its geometry/material/bounds checks before
the current room-placement phase fails at `0 R5 cupboard`. `npm test` stops
on the same independent placement error in `test-asylum-furniture.mjs`, which
does not import the medical model source. The existing full furniture browser
check times out waiting for game readiness, so in-game validation remains
blocked by the current furnishing/layout state.

## Historic medical furniture (3 October 2026)

Seven original medical models are now placed in the shared Escape/Explore
interior: immersion bath in ground R1, cold-water apparatus in R12, wooden
surgical table in R6, early electrical apparatus in R29, stocked apothecary
cabinet and supported leech/cupping set in R7, and a 1940s ECT trolley in R8.
The room names describe those uses in the notebook; R8 explicitly identifies
the later hospital era. Historical references and the limits of the Chester
room reconstruction are in `Research/room-furnishings/README.md`.

`medical-furniture-models.mjs` creates hollow bath geometry, pipes/taps, the
shower reservoir and chain, surgical case/instruments, glass electrical
cylinder/Leyden jars, labelled bottles/pill pots/scales, leech jar/cupping
instruments and the ECT box/meter/leads/trolley. Timber, enamel, glass, cloth
and metal use separate materials with restrained wear. The seven meshes total
28,340 triangles before runtime label planes. All are fixed across seeds;
six have walking/navigation footprints and the seventh rests on the existing
dispensing table. Aggregate mesh bounds match the shared placement catalog.

The default layout has 438 furnishings: 185 ground, 198 first, 45 basement and
10 second. Placement preserves doorways, room centres, window approaches,
stairs and exit routes. Supported decorations now include their supporting
item's local Y offset, retaining an eight-millimetre gap above the visible top.
The furnished plans have been refreshed. The aerial compiled scene excludes
these interior sources and requires no rebuild; Unity, Blender and packaged
desktop/Android exports are not regenerated.

`test-medical-furniture.mjs` passes all seven source bounds/material/finite
geometry checks, actual ray intersections with the open bath basin and rim,
fixed appropriate placement across four seeds, room reachability and table
support. The general furniture test passes eight seeds, 912 room/exit routes,
all doorway crossings, 2,252 physically walked furniture collisions, NPC
paths/spawns, supported decorations and eye-height sight. The extended browser
check passes 29 desktop/mobile/neutral-model captures, all actual rendered
transforms and model bounds, keyboard collision, new-game variation and
matching fixed Escape/Explore furnishings without page/shader errors. The
seven close model views and six distinct medical rooms were visually reviewed,
including glass, controls, labels and clear circulation. Evidence is in
`Browser/artifacts/room-furniture/validation.json`; `medical-gallery.png` is a
review sheet regenerated with `node Browser/capture-medical-gallery.mjs` after
the browser test captures.
The complete `npm test` browser suite passes all 118 commands after these
medical furniture additions. Existing pinned furniture source/licence and
generated asset verification also passes.

## Furnished room uses and furniture replacements (3 October 2026)

The playable browser interior now assigns every room a fictional use and places
seven furniture types around that use in both Escape and Explore. The seed-1829
layout contains 439 items across all four floors: 186 ground, 198 first, 45
basement and 10 second. Main furnishings remain stable; 342 items (78%) are
fixed. Starting another escape game varies smaller items within checked room
positions. Pauses, revisits and stair travel preserve the current arrangement.

The owner's revisions replace all KayKit chairs and stools with visible-surface
adaptations of ShopPrentice's MIT Windsor chair, and replace the KayKit drawer
unit with its MIT Shaker nightstand. Bedrooms and dormitories prefer bedside
nightstands and GPL-3.0 Panca seats. The requested Panca_50 is a small bench,
40 x 30 x 45 cm, rather than a sideboard; its complete six-solid STEP assembly
is converted with FreeCAD. Medical rooms add a painted, closed upper case to
the nightstand. Beds are exactly 130% of their previous width, depth and height,
including their walking footprints. Bookcase books now sit on the horizontal
shelf boards; the renderer probes the board surface instead of the bounds of
the source's higher upright brackets.

`asylum-furniture.mjs` provides shared placement records. Rotated footprints,
the spatial collision index, NPC navigation cells/spawns and eye-height sight
all follow those records. Door approaches, windows, room centres, corridors,
stairs and exit access are checked before placement. Furniture is instanced
from the shared model library. Regeneration updates both the meshes and the
navigation overlay before actors reset. Modelling references, original source
licences, exact repository revisions and furnished plans are in
`Research/room-furnishings/`. The Panca editable source, converter and original
licence are also distributed beside its mesh in `panca-source.zip`.

The focused checks pass across eight seeds, covering 912 room/exit routes,
every door crossing, 2,188 physically walked furniture collisions, NPC paths
and spawns, supported books and standing eye-height sight. Actual Escape and
Explore rendering passes fourteen desktop/portrait/model-preview captures,
with keyboard collision, stable main items, new-game variation, matching
rendered/collision dimensions and book vertices seated on all four boards.
There are no page or shader errors. Evidence is under
`Browser/artifacts/room-furniture/`. `npm run test:furniture` includes pinned
source/licence and generated-mesh hash verification.
The complete `npm test` browser suite passes all 117 commands after the final
furniture replacements and bedside placement changes.

Only browser furniture assets, sources, room-use metadata, navigation/sight
integration, checks and documentation are updated. Unity, Blender project and
packaged desktop/Android exports are not regenerated. The compiled aerial
model excludes these interior sources; its source hash remains current and
needs no regeneration for these changes.

## Smooth internal concrete stair soffits (3 October 2026)

`asylum-stairs.mjs` now builds closed stepped concrete profiles with a single
planar sloping underside. `asylum-architecture.mjs` uses these for both flights
at every connection of S1/S3/S4/S5: fourteen flights across seven connections
from basement through Reception's second floor. The 0.18-unit vertical slab
depth matches the flat return-landing undersides. Solid flight sides close
the space below the treads; the former individual 0.18-thick tread blocks and
their small depth overlaps are removed. Existing carpet heights, footprints,
rail supports and navigation are preserved. Concrete geometry and retained
Stone boxes are merged into one draw per floor, retaining the shared opaque
material and outward-facing surfaces.

`test-asylum-stairs.mjs` checks 1,666 planar underside/landing samples and
1,092 closed-side samples, alongside the retained 1,029 support/headroom
samples, 70 fall barriers and all 23 physically walked outside-door routes.
Focused slab, second-floor room/route and skirting checks pass.
`test-asylum-stair-soffits-browser.mjs` captures both flight undersides at
every connection plus a portrait view in the actual Explore renderer.
All fifteen repaired desktop/portrait views pass without page or shader
errors. Visually reviewed comparisons show continuous soffits and closed
side faces across all four stairs, including basement and second-floor
flights. The saved original renderer fails the new regression on its first
planar-underside sample. The complete `npm test` suite passes (114 commands).
Evidence is under `Browser/artifacts/stair-soffits/`; the supplied reference
and modelling assumptions are recorded in `Research/1829-interior-proposal/`.

Only browser model sources, regression checks and documentation are changed.
The plan, navigation and drawings are retained. Unity, Blender and packaged
exports are not regenerated. The compiled aerial model excludes these
interior sources; its current manifest still matches the model source hash,
so no aerial regeneration is needed for this change.

## Jarman exterior comparison reconciliation (3 October 2026)

The owner's follow-up requests repair of the previously failing Jarman estate
comparison. The saved count/hash describes `16abbbb`, before the separately
documented stair-guard/clearance, continuous facade-course, courtyard sash and
roof-soffit corrections. An isolated historical dependency graph reproduces
that reference exactly. An independent primitive collector also reproduces
the unchanged production scope rules and confirms 818,185 unchanged Jarman
estate primitives. Its 1,897 removed and 745 added pieces are confined to 70
reviewed repair groups; anonymous differences remain in the affected main
estate facade/stair areas. Exterior compiler source hashes remain stable.

The evidence-gated refresh changes Jarman's saved count/hash to 818,930 and
reconciles the identical stale-reference issue in Leighton/Newton to 882,977,
with 882,232 unchanged primitives. The original L ranges, frontage and ward
assertions, walking checks and existing exclusion rules remain untouched.
Both photographic regressions pass normally. Audit sources, primitive
positions/reasons and focused final logs are retained in
Browser/artifacts/jarman-comparison/. No exterior source, compiled aerial
asset, Unity or Blender export was changed by this comparison repair.

Final validation: all 114 commands in a complete `npm test` run pass with
exit code 0, including both estate comparisons and the room-closure survey.
The final log is Browser/artifacts/jarman-comparison/npm-test-final.log;
final-validation.json records the suite, interior visual/walking evidence
and the unchanged current compiled source fingerprint. `git diff --check`
also passes. Earlier failure and continuation logs are retained as history.

## Room enclosure and pillar audit across all floors (3 October 2026)

The owner's marked screenshot and later all-floor request extend the existing
room-closure treatment throughout the browser interior. R33/R35's forward
entrance diagonals and R32/R36's adjoining forward-room returns now match on
ground and first floors. Their outside corners reserve the reviewed passage
width. R22's cross-range closure continues upstairs. R11's southern wall,
R17's enclosed room with separate north/east/south lobbies, R30's ground-floor
return beyond D8 and B11's basement lobby-side boundary close the remaining
unframed openings and remove their short isolated masonry piers. R27's
separately reviewed ground diagonal and upper L return are preserved.

All changes are explicit shared room/corridor variants. Rendering, maps,
navigation and collision therefore consume the same new boundaries; existing
runtime exterior shadow/obstacle refresh paths are unaffected. Both plan JSON
copies and the ground/first/basement review drawings are updated. Second-floor
rooms already meet the enclosure requirement and retain their geometry.

The new test-asylum-room-closures.mjs is included in npm test and test:asylum.
It passes 2,880 two-face masonry/skirting rays over 18 new wall sections,
36 player collision attempts, removed-pillar footprint checks and an audit of
710 internal wall ends on all four floors. Fitted room/outside openings,
existing masonry contacts and guarded stair mouths are the explicit exceptions.
The original open-wall layout fails the first independent closure probe.
Two obsolete R17 south-corner probes were retired from the older join fixture;
129 existing sampled joins and the full mitred-corner survey still pass.

Focused validation passes every room/exit navigation route, all stair
connections, all 23 physically walked outside-door routes, 89 framed room
doorways and 534 doorway walking passes, regular frame support/depth,
274 retained windows, window clearance, skirting, floor/ceiling solids and
the existing east/west room corrections. Earlier assertions retaining the
upper R35 pillar or R36 opening now reflect the user's expanded scope.

The actual exploration browser captures 18 before and 18 after desktop/mobile
views across four floors and walks both entrance approaches in both directions
on both lower levels (eight passes), without page or shader errors. The
marked join, mirrored upper join, adjoining forward rooms, west cross-range,
pavilion lobbies, central room and basement were visually reviewed. Evidence,
repeatable runners and the original-model rejection are retained in
Browser/artifacts/wing-room-closure/. The final full suite passes all 114
commands after the audited Jarman/Leighton comparison reconciliation;
its successful final log is under Browser/artifacts/jarman-comparison/.

A dependency audit confirms all 171 aerial compiler inputs exclude the edited
interior plan/layout. The existing compiled manifest matches the source hash,
so an aerial rebuild is unnecessary and was not performed. Browser interior
sources, tests and review drawings are updated. Unity, Blender and packaged
desktop/mobile exports were not regenerated. Concurrent doorway-thickness
and ground-floor cross-range work in the shared checkout was preserved.

## Regular interior doorway thickness (3 October 2026)

Six green room surrounds were unusually deep because R21, R30 and R31's north
partitions were offset from their adjoining cross-range walls on the ground
and first floors. The existing renderer spanned both jamb planes, producing
0.58, 0.83 and 0.58-unit masonry depths. Both shared plan JSON copies now align
those room fronts at z=19.5. All 89 interior openings use the regular 0.18-unit
wall depth and the existing timber casing. Masonry, skirting, walking collision,
navigation and notebook mapping rebuild from the same corrected boundaries;
the ground/first-floor SVG/PNG drawings are regenerated. Concurrent interior
edits in the shared workspace are preserved.

`test-asylum-door-frames.mjs` now requires regular depth for every interior
opening, with 356 independent rendered casing-depth rays in addition to its
2,724 masonry support/face-clearance rays and all 23 outside frames. The saved
original plan fails at R21. Eight wall-join survey entries follow the corrected
bay corners; the ground R30 outside-pier probe sits beyond D8's retained
aperture. All 131 surveyed joins and the full mitred-corner survey pass.
`test-asylum-doorways.mjs` passes all 534 bidirectional walking routes. All 19
focused interior, stair, window, skirting and Explore checks pass.

Explore before/after captures cover each repaired doorway from both sides,
with a full-frame phone view. The actual game doorway browser check captures
all six repaired entrances and passes nine player crossings. The general game
browser check passes all 23 E door round trips, the release latch, continuous
basement/ground/first-floor stair travel and raised outside landing. Reviewed
views have no page or shader errors. Evidence and logs are under
`Browser/artifacts/interior-door-thickness/`, including `focused-results.json`,
`regression-before.log`, `game/` and `game-interactions/`.

The final `npm test` run passes the interior and walking checks, then stops in
`test-jarman.mjs` on the existing protected exterior snapshot: 818,930 actual
primitives versus 820,082 expected. `jarman-scope.json` verifies that all 140
imported source modules and the protected snapshot match HEAD and do not load
the interior. The suite is therefore not reported as passing; the complete
output is retained in `npm-test-final.log`. No exterior snapshots are changed.

This repair updates browser interior plan sources, checks, review drawings and
notes. The separate aerial compiler excludes this interior input; its compiled
manifest retains the current source fingerprint and needs no rebuild. Unity,
Blender and packaged desktop/Android exports are not regenerated. Modelling
references are in `Research/1829-interior-proposal/README.md`.

## Ground-floor cross-range wall bends, east and west (3 October 2026)

The owner's purple/yellow ground-floor screenshot closes R27's northwest
wall gap and replaces the opposite outline's square corner with a 45-degree
face. The closure joins the existing wall ends at (45.1, 8.5351) and
(46.6140, 7). The opposite face joins (43.35, 7) to (45.1, 5.25), filling the
cut-back triangle with floor and ceiling. The corridor retains over 2.1 units
of clear width, and the green doorway stays at (49.75, 7).

The requested west-wing comparison finds the same open room-front defect at
R22's corresponding cross-range bend, with different proportions. Its new
wall joins (-39.0976, 2.2) to (-38, 5.2658); opposite R4's room corner has a
45-degree face from (-34.6, 5.25) to (-32.85, 7). Ground-floor room variants
retain complete wall ends and doorway piers. Cream/red masonry, dark skirting,
walking collision, navigation and notebook mapping derive from the same
boundaries. Both shared plan copies and the ground-floor SVG/PNG are updated;
other ongoing doorway and room edits in this checkout are preserved.
The final merge with the general room-closure work retains R27's marked
ground-floor diagonal and its separate first-floor L-shaped return. The regular
doorway survey uses its return-face probe on the first floor only, while the
ground-floor survey checks the straight frontage beside the retained doorway.

`test-asylum-cross-range-bends.mjs`, included in `npm test` and `test:asylum`,
passes 640 masonry/skirting rays across both faces of all four new wall runs,
endpoint joins, floor/ceiling coverage, seven routes walked in both directions,
retained room surrounds and comparison of the other floors with a control
plan removing this repair. The original east boundary fails the new solid-wall
assertion. `test-asylum-cross-range-bends-browser.mjs`, included in
`test:asylum`, passes 14 walks through Explore's actual input/update adapter
and captures ten desktop/mobile/first-floor comparison views without page or
shader errors. The final views are visually reviewed. Evidence, the original
plan and the control loader are under `Browser/artifacts/east-ground-bend/`.
The final actual-game check also passes all 23 outside-door E round trips,
the release latch, walked basement/ground/first-floor stairs, a raised outside
landing and desktop/mobile rendering without runtime errors. Its output is
retained in `game-check-final.log` in the same directory.

The full `npm test` run passes the interior, wall-join, window, doorway, stair,
slab, skirting and walking checks, then stops at the existing Jarman exterior
snapshot: 818,930 primitives versus 820,082 expected. A control run removing
only these ground-floor bend changes produces the identical count and hash;
no exterior snapshot baseline is changed. The logs are `npm-test-final.log` and
`control-jarman.log` in the evidence directory, so the full suite is not
reported as passing.

This changes browser interior sources, regression checks and the review plan.
The aerial compiler excludes these inputs, so no aerial asset rebuild is
needed. Unity, Blender and packaged desktop/Android exports are not regenerated.
References and dimensions are in `Research/1829-interior-proposal/README.md`.

## Exterior U-shaped stairs and clearance audit (3 October 2026)

The inner east-wing exterior stair had two opposed flights in the same lane,
crossing through one another between the raised ground-floor door and the
first-floor door. The reflected west stair had the same defect. The shared
builder now alternates three flights between separate parallel lanes, with
full doorway decks and a wider U-turn landing. Decks terminate at flight mouths;
the first tread rises about 0.2 from the walking ground. Exposed edges retain
continuous guards, while the doorways and turning routes remain open.

The estate-wide audit also found the remote rear-return platforms covering
sloping treads, and small deck overhangs above the final treads of both mirrored
annexe stairs. Those decks and their guards now meet flight edges. The rear
return's half-landing moves outward to retain a usable flight run. The special
movement-direction support selection for the former crossing inner-court
flights is removed. Geometry is authored before batching; walking refreshes
continue to sample the rendered treads and guards normally.

`test-exterior-stair-clearance.mjs`, included in `npm test`, checks all 20
guarded exterior flights, 2,340 rendered tread/headroom samples, 493 supported
landing-edge samples and 3,392 stop/restart/climb/descent moves across both
inner courts. It distinguishes small adjacent tread nosings from intersecting
flight sections. The saved original models fail the new crossing-flight
regression. Existing interior stair checks pass 1,029 support/headroom probes,
70 fall barriers and all 23 door routes. Exterior route, guard, period-removal
and batched collision/support checks also pass.

`test-exterior-stair-clearance-browser.mjs --compiled` walks both repaired
stairs up/down through the actual Explore and Escape update loops and captures
desktop/mobile walking views plus source/compiled aerial views. Those views,
the rear return and both annexe turns were visually reviewed without browser
or shader errors. `build:models` and `test:compiled` pass, including full-detail
loading, source/compiled rendering parity, fallbacks, all timeline periods and
walking collision refresh. The generated aerial source fingerprint is current.
Evidence is under `Browser/artifacts/exterior-stair-clearance/`; annexe close-ups
are under `Browser/artifacts/exterior-stair-rails/`.

The final annexe turning deck extends behind the top tread to retain enough
body clearance after removing the overhang. The normal exploration and door
support checks pass for both mirrored stairs; the support regression now
requires a deck meeting the tread edge, replacing its old overlap expectation.
The final compiled buffers also pass the 2,340 flight and 480 landing-edge
geometry probes with `test-exterior-stair-clearance.mjs --compiled`. Compiled
aerial buffers are inspected geometrically; Explore/Escape walking remains
the procedural scene's existing mode.

The annexe deck/guard correction updates 15 fingerprints in 14 historical
fixtures. Each affected test first passes with only the four changed stair
sources restored, then passes its remaining checks while capturing the new
fingerprints. Only verified hashes are replaced; primitive counts, placement,
ranges and all other saved fields remain intact. Original and replacement
values are in `Research/exterior-stair-rails/overlap-snapshot-updates.json`.
The existing whole-estate Jarman and Leighton/Newton records fail with the
original stair sources too and are left unchanged.

`npm test` reaches the separate east ground-wall check, which currently fails
its later first-floor pillar expectation. That failure also reproduces with
the original stair sources. The continuation covers all 91 remaining suite
commands: 88 pass after the final annexe route/support fixes. The other three
failures are the separate east first-floor wall assertion and the existing
Jarman/Leighton whole-estate records; all three also fail with the original
stairs. All 15 affected fixture/route/clearance checks pass normally in the
final verification. Logs, baseline comparisons and `final-summary.json` retain
the distinction between those failures and the completed staircase repair.

Browser modelling/walking sources and local compiled aerial assets are updated.
Unity, Blender and packaged desktop/Android exports are not regenerated by this
repair. References and dimensions are in `Research/exterior-stair-rails/README.md`.

## First-floor east-wing column and wall join (3 October 2026)

The owner's purple-line first-floor reference removes R35's isolated column
and joins the existing north wall to the wall beside its green room entrance.
The first-floor boundary now runs from (36.9, 19.1) to (34.5, 22.85); the
doorway remains at (34.5, 24.5). C6's first-floor approach follows the open side
of the new wall. Cream upper brick, red lower brick and dark skirting share the
joined boundary used by walking collision, navigation and notebook mapping.
This supersedes the earlier ground-floor repair's retention of the upstairs
column. Other ongoing wall and exterior edits in the shared checkout are
preserved.

Both plan JSON copies and the first-floor SVG/PNG drawing are updated.
`test-asylum-east-first-wall.mjs` surveys 192 masonry/skirting rays on both
faces, tests the cleared column footprint and solid wall collision, walks
the room and forward corridor in both directions, and compares other floors
with a control plan that removes this correction. The original first-floor
boundary fails the column-clearance assertion. Explore captures from the
corridor, room and doorway, with a phone view and ground comparison, finish
without page or shader errors. Reviewed evidence is under
`Browser/artifacts/east-first-wall/`, including the `review-after-*.png` views.
The actual browser game also passes all 23 E door round trips, the release
latch, basement/ground/first stair travel and desktop/mobile rendering.

The initial `npm test` attempt stopped at `test-asylum-layout.mjs` on its S4
stair traversal. A control run removing only this first-floor room/corridor
correction failed at the same assertion. After other shared-project stair
updates, both that layout test and `test-explore-interior.mjs` pass their full
route surveys. Logs are `npm-test.log`, `layout-current.log` and
`layout-control.log` in the evidence directory; focused interior results and
subsequent successful rechecks are recorded separately in
`focused-results.json` and `final-rechecks.json`. The fresh complete suite
output is retained as `npm-test-final.log`.

The final complete suite passes the interior checks, including this first-floor
regression, then stops in `test-explore-interior.mjs` while walking an outdoor
annexe fire stair at x=378.5, z=-19.2. `explore-control.mjs` removes only this
first-floor correction and reproduces the same target and stopped actor
coordinates. The full suite is therefore not reported as passing; this
unrelated exterior route failure and its control are retained in
`npm-test-final.log` and `explore-control.log`. No expected baselines were
changed for this wall repair.

This changes the browser interior plan, checks and review drawing. The separate
aerial compiler excludes these interior inputs, so this repair needs no aerial
rebuild. Unity, Blender and packaged application exports were not regenerated.

## Interior door-frame corner clearance (3 October 2026)

The ground-floor east inside-corner door D10's complete fitting and opening
now sit at x=31.82, z=15.5, clearing the angled wall's exposed edge. D9 uses
the matching west position at x=-31.82; basement D11 moves along its wall to
z=-34.48. The fitting reserves the lintel's .91-unit half-width, .09-unit
adjoining masonry half-thickness and .02 clearance. A shared centre supplies
the opening cuts, frame, leaf and sign. Outside door coordinates, landing
destinations and E interaction anchors retain their established values.

The cream jambs cover the masonry returns with .015 lateral clearance and
meet the lintel without overlapping head faces. All outside apertures fit
their hosting wall planes; the corner offsets are applied after that fitting.
No runtime geometry changes are introduced.
Walls, maps, player collision and pursuer navigation rebuild together from
the fitted opening cuts, while frame details retain their material batches.

`test-asylum-door-frames.mjs`, included in `npm test` and `test:asylum`, surveys
all 23 outside surrounds and 89 room surrounds on four floors using 2,724
rendered casing/masonry support and face-clearance rays. It checks actual
leaf transforms against the reviewed wall envelope, closed leaves and fixed
outside destinations. The saved original renderer fails the survey; the
east-corner check separately rejects D10's original placement at its restored
left pier. Existing room-door checks pass 534 bidirectional walking routes.

`artifacts/check-door-frame-fit.mjs` captures the reported door, its west
counterpart and other east/basement frames in Explore, including desktop
oblique and phone views. Final views were visually reviewed without page or
shader errors. `test-asylum-browser.mjs` passes all 23 E round trips with the
release latch, walked basement/ground/first stairs and the raised outside
landing. Evidence is in `Browser/artifacts/door-frame-fit/`.

The full `npm test` run passes the interior, frame and walking checks, then
stops at `test-jarman.mjs` on its existing protected exterior snapshot
(818,932 actual primitives versus 820,082 expected). `jarman-scope.json`
confirms that all 140 imported modules and the snapshot are unchanged from
HEAD, and that this check does not import the interior. The full suite is
therefore not reported as passing; its output is in `npm-test.log`.

This changes browser interior sources, regression checks and notes. The
compiled aerial manifest retains the current model source fingerprint
`f700561f8e090031b4d8c91cf0a35c5e8391e503e325c9e0ffba663827128cdc`;
that build excludes the interior and requires no regeneration. Unity, Blender
and packaged desktop/Android exports were not regenerated for this repair.

## Current Unity/Android gameplay port (2 October 2026)

`NativeAndroid/Unity` is the current Unity 6000.6.3f1 project. The native
game now uses the reviewed four-level asylum plan, including the basement
and second floor, all 23 outside doors, continuous interior stairs and seven
exterior fire-escape routes. Security and the Deva ghost follow the same
interior stair routes. Leaving the building continues the escape on foot;
reaching the front path completes it. Peaceful walking exploration starts
at dusk and can enter the same rooms without pursuers or a notebook.
Changing exploration views or locations retains the chosen lighting.

Space and the touch JUMP button use the current jump arc, rendered obstacle
heights, landing supports and interior headroom. NOTES records discovered
places, used doors and inspected artwork, separates observations from
deductions and reveals maps locally as the player explores. It pauses the
game and resets with a new attempt. Interior materials retain their source
texture scale, ceiling projection and the original Grindley mural image.

The schema-3 export includes exact walls, floor outlines, shafts, banisters,
doorways, heights, safe spawns and stair routes. Shared outdoor jump bounds
are packed into `jump-collision.bytes` with period/tree visibility masks;
the native spatial index decodes only nearby records. This avoids repeating
the detailed geometry bounds in each of the 13 timeline snapshots. Geometry,
navigation, source files and archive pictures are checked against their
export hashes before packaging. A source change during export aborts it.

Run `NativeAndroid/tools/build.ps1 -Target Android` from the repository root
to export, validate and build. `-Target Windows` creates the local gameplay
preview. `-SkipExport` reuses generated assets but still checks them against
current source. The Unity importer includes its builder and shader sources
in the cache signature, keeps interior meshes uncompressed and rejects
surface-shader errors before importing materials. Generated assets and
packages remain ignored by Git.

The final export includes the completed courtyard-window/roof repairs,
facade course joins and exterior stair guards. Its model fingerprint is
`f700561f8e090031b4d8c91cf0a35c5e8391e503e325c9e0ffba663827128cdc`.
The four GLBs contain 6,789,085 finite triangles; the interior uses 49 batches
and 104,676 triangles. All 13 periods, 34 buildings and 73 local archive
pictures are retained. Source and export checks pass in
`latest-test-port-final.log` and `latest-test-presentation-final.log` under
`NativeAndroid/artifacts`.

The final Windows preview and Android builds pass in
`latest-unity-windows-6.log` and `latest-unity-android-final.log`. The preview
smoke run passes 67,627 assertions (1,457 distinct messages), including all
23 door round trips, both second-floor rooms, basement travel, pursuers on
stairs, seven first-floor outside routes, three upper/remote stair routes,
guarded landing edges, period-dependent collision removal, jumps and the
discovered-only notebook. Native exterior close-ups, roof undersides,
interior rooms, mural and interface captures were visually reviewed in
`latest-smoke-final/`. The native test routes follow the newly guarded
landings; the old straight paths would cross the new barriers.

`NativeAndroid/out/escape-1829-native.apk` is version **0.8.0**, code **8**,
205,795,872 bytes, SHA-256
`13fde60654af0b681f5ee83ff9891eae123568961e86cade49ab2ae41593cf9f`.
APK verification confirms ARM64 IL2CPP, minimum Android API 26, target API
36, a valid v2 signature, all five attribution files and the same signing
certificate as v0.7, so it can update that installation. The previous APK
is preserved as `escape-1829-native-v0.7.apk`. Evidence is in
`latest-apk-verification.json`; no Android device was connected, so this
does not establish phone performance or on-device runtime validation.

The unused Unity 2022.3 project at the repository root has been removed
(`Assets`, `Packages` and `ProjectSettings`). The shared historical grid is
preserved byte-for-byte in `Research/escape-layout/layout.json`; the browser
layout builder and compatibility test now use that path. The existing FBX
is preserved byte-for-byte as `Art/1829-Level.fbx`, and the Blender tool now
exports there. Original archive PNGs remain in `Browser/dist/art`. The
legacy project's duplicate images and Unity-only scripts were removed.
The remaining browser layout test passes after removal, and the only Unity
project version file is under `NativeAndroid/Unity`. Blender models were
not regenerated. The removal inventory is saved in
`NativeAndroid/artifacts/legacy-unity-removal.json`.

## Inner courtyard window intersections and roof undersides (2 October 2026)

Both main-wing inner courts now place the lower corner sashes wholly inside
the exposed recess, replacing the window bisected by the low projecting room
and its concealed neighbour. The tall and shallow return windows also clear
the perpendicular facade, downpipe and main roof overhang. The shared east
builder supplies the west reflection. See the reference and dimension notes
in `Research/1829-back/README.md`.

`wing-roof-junctions.mjs` replaces narrow cornice strips with a solid soffit
following the complete slate outline, from the rear hip through the tapered
sides to the cross-range junction. The low corner rooms' existing upper
cornices now reach their slate edges. This closes the view-dependent sky gaps
without changing roof slopes or wall footprints. Geometry is assembled before
batching and cached transforms; no runtime geometry mutation is introduced.

`test-inner-courtyard.mjs`, included in `npm test`, passes 1,860 window/frame
clearance samples and 158 shallow-angle/underside roof rays across both wings.
The saved original definitions fail separately for the intersected sash and
open eave. All 2,594 ground walking-obstacle records match before/after exactly.
The roof-contact, front-inside-corner and walking checks pass. Source desktop,
mobile, low-angle and overhead views were visually reviewed without page or
shader errors. Evidence is in `Browser/artifacts/inner-courtyard/`.

The full browser suite reached an east-forward-end sash assertion while other
facade/stair work was modifying the shared checkout. Remaining checks and
original-courtyard comparisons are recorded in `remaining-results.json` and
the per-test logs: 60 of 79 subsequent checks pass; all 19 failures also
reproduce with the original courtyard geometry. No global snapshot baselines
were changed for this repair. Initial compiled checks were invalidated by concurrent
model edits, causing the development server to correctly fall back to source.
A fixed local snapshot passes the full source/compiled rendering comparison,
exact draw counts, full-detail loading and missing/incompatible/corrupt asset
fallbacks. Its timeline check passes every period, mobile navigation and
walking collision refresh. The compiled courtyard captures were visually
reviewed without page or shader errors. Reports are preserved separately as
`compiled-comparison.json` and `timeline-comparison.json`. The main workspace's
aerial asset was rebuilt afterward and its source fingerprint verified current.
Browser modelling sources and local generated aerial assets are changed;
Unity, Blender and packaged exports are not regenerated by this repair.

## Space to jump in walking and Asylum Escape (2 October 2026)

Space starts one jump per press in Explore on foot and Asylum Escape. The
walking guide, escape HUD/help and player controls document the shortcut.
The shared exterior arc rises about 1.69 units, clearing the existing low
frontage masonry and hedges. Rendered vertical bounds, coping and overhead
geometry govern airborne collisions; tall walls and tree trunks remain solid.
Players can land on low obstacles, jump again or walk off and settle without
holding a movement key. Door arrivals align takeoff to their rendered landing.

Ground walking retains its existing collision/stair rules. The jump index is
created on demand, follows obstacle refreshes, and uses extra non-enumerable
height/footprint data without changing the original ground obstacle snapshots.
Interior jumps retain the reviewed navigation routes and banisters, with
ceiling slabs and doorway headers limiting headroom. Pause/notebook suspend
movement; restart, view changes and door transfers reset the jump as needed.

`test-jump.mjs` is included in `npm test`. It covers varied frame rates,
head impacts, idle landing, wall-top support and step-off, tall/unknown-height
barriers, input/reset behavior, actual wall/hedge clearance in both exterior
controllers, all 23 outside arrivals, and indoor floor/doorway headroom.
The focused jump, explore-input, explore, game and stair checks pass.
`test-jump-browser.mjs` verifies real Space key events, held-key behavior,
pause/notebook, restart/door transfer and visible control hints, with reviewed
walking, Reception, basement and outside captures and no browser/shader errors.
Evidence is in `Browser/artifacts/jump/` and `Browser/artifacts/jump-browser.log`.

The full suite reached an unrelated Larkton geometry snapshot failure. Running
the remaining 43 checks recorded 41 passes and two more geometry snapshot
failures (Oakmere west and Annexe access). Separate checks with the pre-jump
walking module reproduce all three failures; model snapshots were not changed
for this feature. The suite log is `Browser/artifacts/jump-npm-test.log`;
subsequent results are in `Browser/artifacts/jump/remaining-tests.json`.
Run `npm run test:jump` for the focused physics, input and browser checks.

Only browser controls, movement, tests and documentation change. The compiled
aerial source fingerprint was verified current; no modelling or generated
model rebuild is required. Unity, Blender and packaged exports were not changed.

## Redesmere low-range roof gap (2 October 2026)

The ivy-fronted building beside the round chimney had an open strip between
its 4.55-unit wall top and the slate eave plane at 4.67. The roofs' single-sided
undersides made the strip visible from a shallow walking angle. The existing
cornice instance in `redesmere-passage.mjs` now forms a solid 0.28-unit eaves
band, covering the roofs' 0.4-unit overhang and meeting both hips. Roof shape,
chimney, walls, ivy and gutter stay fixed; no runtime geometry changes or
additional draw calls are introduced.

`test-escape-exterior.mjs` now includes 192 oblique coverage rays along all
four sides. It rejects the saved original geometry and passes after the fix.
The focused exterior, Redesmere garden, roof-contact and Hospital Shop checks
pass. `artifacts/redesmere-eaves-scope.mjs` compares the saved original source
against the repair: just one trim instance changes; 1,446,861 other primitives
and all walking obstacles match exactly at the time of comparison.

`artifacts/check-redesmere-eaves.mjs` captures walking-height, overhead and
mobile views in Explore and the rebuilt compiled aerial scene, with no page
or shader errors. Evidence and validation logs are in
`Browser/artifacts/redesmere-eaves/`. The local aerial model was regenerated;
Unity, Blender and packaged exports were not regenerated.

The source/compiled comparison passes, including matching draw counts, image
comparison, full detail and fallback handling. The timeline test passes every
period in both modes, mobile navigation and walking collision refresh; its
unchanged assertions run via `artifacts/check-redesmere-timeline.mjs` with
isolated screenshot outputs after another validation locked a shared image.
The final compiled manifest matches current model sources.

The complete `npm test` run stops at `test-larkton-recess.mjs` on the Annexe's
non-Larkton geometry snapshot. That check does not contain this Redesmere
range; its source and expected snapshot were left intact. The full suite is
therefore not reported as passing. `npm-test-final.log` records the failure;
`compiled-tests.log` and `timeline-isolated.log` record the successful compiled
comparison and subsequent timeline run. Earlier interrupted attempts are
retained separately, including a source change detected during compilation.

## Exterior door support audit (2 October 2026)

The four blue facade doors beside Reception previously ended 0.74 units above
the excavated walks. `entrance-west-photo-detail.mjs` now derives their base
from `FRONT_BASEMENT.grade - depth`; the east reflection inherits the same
level. Each complete door moves down without changing its proportions.
Reception has a shallow stone sill closing its 0.10-unit landing gap.

The wider audit corrects both annexe tower fire doors to the existing platform
tops, clears their leaves past the brick band, and extends both platforms to
the existing top treads. Churton's three door sills extend down to the lawn.
The main-kitchen service door gains a grounded stone step, and the 18 garage
doors plus mortuary door gain shallow sills meeting their concrete aprons.
These are construction-time changes before timeline grouping, batching and
transform caching; existing runtime shadow/collision refresh paths remain.

`test-exterior-door-supports.mjs`, included in `npm test`, surveys 109 rendered
door leaves across six historical periods with three support probes per sill.
It also samples each annexe door-to-stair deck continuously and checks that
the brick band does not conceal the door. It reads actual post-grounding
geometry, including rotated buildings, mirrored doors and the Witby copy.
The saved original door sources fail the new survey. Existing outside-walker
checks cover all seven main-building escape flights and both front walks.

`test-exterior-door-supports-browser.mjs` captures before/after game views,
desktop/mobile/night contacts, and walks both sunken front routes in both
directions. Evidence and validation logs are in `Browser/artifacts/door-supports/`.
Annexe snapshot audits restore just the two old door transforms and two old
landing slabs to reproduce the previous fingerprints before updating them.
The estate fingerprint audit also restores the concurrent wall-mitre changes
and the single Redesmere eaves-band correction, reproducing both existing
estate snapshots exactly. Its current model adds only the 21 new thresholds;
the door relocations, landing extensions, wall joins and eaves change retain
their primitive counts and have separate focused regressions. Snapshot scope
filters and ward ranges remain unchanged.

The source/compiled rendering comparison, model fallbacks and every timeline
stop pass. The timeline check uses an isolated artifact directory after a
shared screenshot-file conflict. `compiled-source-check.json` confirms the
generated asset matches the current source. Day, night, mobile, kitchen,
garage, Reception and annexe contact views were visually inspected.

All 101 commands in the browser suite pass across `npm-test-complete.log`
and `suite-remainder.log`, with the two remaining historical comparisons
passing after their verified reference updates (`oakmere-west-final.log`
and `annexe-access-final.log`). The continuation preserves its original
failure records; the focused final logs record the successful rechecks.
`git diff --check` also passes.

Browser model sources and local compiled aerial assets are updated. Unity,
Blender and packaged desktop/mobile exports are not regenerated.

## Grindley basement mural (2 October 2026)

The supplied upright mural now appears on the owner's marked B7 south wall,
beside the central basement corridor and opposite S5. `basement-mural.mjs`
blends the unchanged local PNG into the basement brick and plaster materials
at x=-34.65, z=1.39. The paint is 2.32 units high (80% of the 2.9-unit wall),
with equal 0.29-unit top/bottom margins and the source proportions retained.
A polygon following the painted outline removes the photographed surrounding
plaster at render time, with a 0.10-unit smooth inward feather. The source
attachment and runtime PNG have matching SHA-256 hashes.

The original wall bump shading, room lighting, opaque depth and existing
material batches are retained. No decal plane, frame, new draw call, walking
obstacle or random art interaction is added. Only the two basement masonry
materials receive the image; the back of the wall and the other floors do
not. Placement reference and provenance are in
`Research/escape-interior/README.md`.

`node Browser/artifacts/check-basement-mural.mjs after` checks the actual game,
the two material layers, the exact 80% height and equal margins, and captures
three desktop angles plus a phone view. All four final views were visually
reviewed, with no page or shader errors. The focused asylum layout, basement
end, interior architecture and interior light checks pass. Evidence is under
`Browser/artifacts/basement-mural/`; `after.json` records the full-game render.

The full `npm test` run passed the interior checks, then stopped at
`test-jarman.mjs`: its protected exterior geometry hash no longer matched
during concurrent exterior modelling. That test builds `escape-exterior.mjs`,
which does not include this mural or interior renderer. The unrelated exterior
source and snapshot were left intact; the full suite is not reported as
passing. The output is saved in `Browser/artifacts/basement-mural/npm-test.log`.

This changes browser interior sources and the local mural asset only. The
compiled aerial model excludes this interior and needs no rebuild for this
addition. Unity, Blender and packaged desktop/mobile exports were not
regenerated.

## Reception second floor (2 October 2026)

The browser Asylum Escape interior now has a compact second floor over
Reception. S1 continues from the first floor through another guarded return
flight to the semi-open C24 landing. Its two framed doors lead to R41
(two straight-facing sashes plus one 45-degree west sash) and R42 (one
straight-facing sash plus one 45-degree east sash). The five openings use
the exterior's top canted-bay sash positions and dimensions. The shared
window renderer now supports explicitly scheduled windows on upper floors
as well as in the basement, without adding inferred windows elsewhere on
the new level.

Plan ID 3 is the second floor at Y=8.4; basement ID 2 is retained. Existing
floor heights and outside-door transfers keep their established gameplay
convention. The new floor has its own compact notebook bounds and all
walking, pursuer navigation, stair openings, rails and discovery come from
the shared plan. The help text includes the additional level. Both JSON
plans match, and `Research/1829-interior-proposal/second-floor.svg` / `.png`
record the layout. The drawing exporter accepts an optional output name
(`second-floor`) and renders diagonal sash symbols.

`test-reception-second-floor.mjs` checks the two-room window schedule
against the actual exterior generator, 90 unobstructed panes, 45-degree
faces, retained landing partitions, notebook discovery and 12 physically
walked routes between the rooms and all lower floors in both directions.
The existing stair check covers 1,029 support/headroom probes and 70 fall
barriers; the slab and wall/ceiling checks cover the fourth level too.
`test-reception-second-floor-browser.mjs` walks the actual game player from
Reception to each room and back, and captures the landing, both rooms,
stairwell and mobile room/notebook views. It is included in `test:asylum`;
the geometry/navigation test is also included in `npm test`.

Validation: the full `npm test` suite passes. Both the new actual-game
browser check and `test-asylum-browser.mjs` pass, including all 23 outside
door round trips and the existing basement/ground/first stair route, with
no page or shader errors. Desktop and mobile captures were visually
reviewed, including the discovered second-floor notebook sketch. Evidence
and logs are in `Browser/artifacts/reception-second-floor/`.

Only the browser interior, shared review plan, tests and documentation are
updated. The aerial compiler excludes this interior; no compiled model
rebuild is needed. Exterior modelling, Unity, Blender and packaged desktop
and Android exports were not changed by this addition.

## Ceiling continuity and Reception entrance (2 October 2026)

The ceiling's stains, peeling edges and cracks previously stopped at the
texture boundary, exposing a five-unit grid. `interior-materials.mjs` now
wraps each complete mark across both texture axes and blends two continuous
projections with different directions and scales. Softer colour contrast and
relief retain the worn plaster without emphasising repeated patches. The
same sampling drives colour and bump shading on every floor; material sharing,
texture resolution and the random sequence for other finishes are retained.

Reception's ground-floor D1 now uses a 1.9 × 3.2 red double door with six dark
panels, matching the exterior entrance's paint and proportions. A cream
surround, glazed transom and brass handles fit below the existing ceiling.
Its generic green leaf, panic bar, emergency signs and green exit lamp are
removed. The doorway position, collision plan, E interaction and destination
on the existing front steps are retained. Other exits keep their fittings.

`node Browser/test-ceiling-entrance-browser.mjs` checks the actual game on all
four floors, D1's visible red panels and removed signage, its E round trip and
release latch, and texture-edge continuity. Mean adjacent-pixel differences
across the two wrapping edges fell from 8.29/6.20 to 3.17/3.09 intensity
levels, matching ordinary internal neighbors (3.07/3.16). Nine desktop/mobile
views per version were captured; visual review found no hard ceiling seams or
door-surround gaps, and there were no page or shader errors. The complete
`npm test` suite passes. Evidence and the full-suite log are in
`Browser/artifacts/ceiling-entrance/`.

Only browser interior sources are changed. The compiled aerial manifest still
matches its source hash; this interior is outside that build. Unity, Blender
and packaged desktop/mobile exports were not regenerated.

## Solid interior floor and ceiling slabs (2 October 2026)

The Reception-stair screenshot exposed a separate issue from the masonry
height correction below: floor and ceiling meshes were single-sided sheets
with no closing faces around stair openings. From within the inter-storey
band, their backs were culled and the surrounding rooms showed through.
`Browser/dist/asylum-architecture.mjs` now extrudes both surfaces into closed
solids with outward caps and perimeter/shaft reveals. Floors run from -0.2
to +0.002 relative to their storey. Ceilings retain their 2.9/3.8-unit room
heights and extend to the next floor's underside; top-storey ceilings are
0.2 units thick. Adjoining reveals meet without overlapping side faces. The
existing shared opaque materials and single draw per slab are retained.

`test-asylum-slabs.mjs`, registered in `npm test` and `test:asylum`, checks
8,420 cap views from both sides, 1,316 oblique shaft/perimeter edge views and
112 clear shaft samples across all three floors. It rejects the original
renderer on the first underside sample. Existing stair checks pass all 882
support/headroom samples, 60 fall barriers and 23 physically walked door
routes; wall/ceiling checks pass 11,730 masonry probes. The capture runner is
`Browser/artifacts/check-asylum-slabs.mjs`; before/after images and logs are
under `Browser/artifacts/asylum-slabs/`.

The full `npm test` suite passes. The actual-game capture run renders 25
desktop/mobile views across all four stairs and both connections at S1/S5,
with no page or shader errors. Visual review covers Reception ascent,
descent, undersides and the adjoining-floor band, plus the other stairwells
and mobile framing. The previously open bands now have continuous slab
faces; the stair openings remain clear.

Only the browser interior model changes. Stair routes, collision data and
plan drawings are unchanged. The aerial compiler excludes this interior;
Unity, Blender and packaged exports were not regenerated.

## Interior wall-to-ceiling coverage (2 October 2026)

The owner's basement view beside D13 and S1 prompted a three-floor wall-height
audit. The renderer previously ended masonry exactly at the room ceiling,
leaving the 0.3/0.4-unit space up to the next floor unfilled where stair shafts
expose it. Wall tops now continue to the next higher floor, with a 0.001-unit
overlap below its 0.002-unit walking surface, avoiding raised upper thresholds.
Top-storey walls overlap their ceiling by 0.02 units. Doorway and window
headers use the same height. Room ceilings remain at 2.9 units in the basement
and 3.8 on the upper floors. Plan boundaries,
door openings, collision, stair geometry and walking routes are not changed
by this fix.

`test-asylum-wall-ceilings.mjs`, included in `npm test` and `test:asylum`, checks
673 wall runs and 87 doorway headers using 11,730 masonry raycasts from both
sides at the ceiling and adjoining-floor heights. An in-memory comparison
confirms that the same check rejects the original renderer. Existing layout,
wall-join, basement, window, doorway, stair and skirting checks pass, as does
the actual-game check covering all 23 outside-door round trips and walking
between basement, ground and first floors. Seven before/after desktop/mobile
views were captured and visually checked without page or shader errors.
Evidence and the capture runner are in `Browser/artifacts/wall-ceilings/` and
`Browser/artifacts/check-wall-ceilings.mjs`.

The full browser suite was run but stopped at Jarman's protected exterior
snapshot during concurrent exterior modelling changes. The separate remaining
suite run passed 32 checks and records the Leighton/Newton exterior snapshot
mismatch. These
tests build `escape-exterior.mjs`, which does not import this interior renderer;
their snapshots and the concurrent edits were left intact. Detailed outcomes
are retained in the evidence directory.

Only browser interior rendering, regression checks and notes changed for this
fix. The aerial build dependency graph excludes `asylum-architecture.mjs`, so
this change needs no compiled aerial rebuild. Unity, Blender and packaged
desktop/mobile exports were not regenerated.

## Outside movement and trapped-player recovery (2 October 2026)

The west rear basement stair could admit a player beside its retaining cheek
at one height, then lower the player into that cheek's collision band. Every
subsequent movement was blocked. Outside movement now checks every crossed
height band, including the landing, before accepting the step. The same rule
protects other stairs, ledges and sunken paths. Releasing movement also lets
an unobstructed fall finish.

Exterior obstacles retain the vertical bounds of their own mesh/instance.
The old footprint-keyed lookup could replace a thick wall's height with a
thin cap sharing its X/Z bounds, including the Reception doorstep. Reachable
raised support also takes priority over a lower sunken-path outline. A small
local recovery handles overlapping poses, including after obstacle refresh;
it avoids newly encountered walls and cannot return a player to a distant
remembered position after a door transfer.

`test-asylum-outside.mjs` covers the reported stair edge, the full west basement
passage, both frontage walks in both directions, all seven upper fire escapes,
all 23 arrivals, five formerly embedded poses, collision refresh, idle falling
and batched visibility. Its 1,259,096 cardinal/diagonal movement probes cover
the asylum perimeter, raised stairs and wider grounds, checking both clearance
and a way to move away from reached positions. The actual-game regression is
`test-asylum-outside-browser.mjs`, included in `npm run test:asylum`. It walks
the west edge/passage/return and recovers a trapped pose through the game loop.
Desktop/mobile captures and results are in `Browser/artifacts/outside-traps/`.
The existing browser check also passes all 23 door round trips, indoor stair
levels and the raised exterior landing, without JavaScript or shader errors.

Validation: the expanded movement check, both actual-game browser checks,
model rebuild and `npm run test:compiled` pass, including source/compiled
image comparison, fallback loading, all timeline stops and obstacle refresh.
Running all suite commands independently records 90 passes and two failures
in `outside-traps/all-checks.json`. The Jarman and Leighton/Newton whole-estate
geometry snapshots differ after concurrent exterior paving edits. Both pass
with the committed exterior geometry and this repaired movement helper, using
the read-only `outside-traps/exterior-baseline-loader.mjs`; these two snapshot
fixtures are not changed by the movement repair. The earlier full `npm test`
attempt stopped at a concurrently changing interior wall fixture, which now
passes in the independent run. This is not a claim of a green full suite.

This repair changes browser movement and validation, not building geometry.
The local compiled aerial cache is rebuilt because the shared obstacle helper
is part of its source fingerprint. Unity, Blender and packaged desktop/Android
players are not updated by this repair.

## Player notebook and explored maps (2 October 2026)

TODO item 4 is implemented in browser Asylum Escape. Tab, M, N or J opens the
notebook; touch players use NOTES or the notebook button. Escape, N, M, J, P
or RESUME closes it. While reading, Tab/Shift+Tab stays within the dialog,
including the scrollable notes. The header and resume control stay outside
the scrolling pages on narrow screens.

`notebook.mjs` keeps knowledge for one escape attempt. Visiting levels, rooms
and corridors adds observations; inspected artwork adds source-labelled record
notes. The local daily-account image supplies the dates 7–9 December 1854,
the 1860 table supplies its report date and discharge heading, and the existing
generated 1854 plaque supplies its printed statistics and period categories.
Heritage panels now use the same held-E viewer as local artwork. Loading an
image alone never discovers its contents. Room labels remain fictional game
divisions, rather than established historical uses.

Discovered facts and deductions have separate sections. Exploring both wings
can produce a qualified architectural deduction. Door notes distinguish an
observed sign from a route actually used; staircase notes update when that
stair is discovered on another level. Existing doors remain
usable; no locks, treatment documents or future puzzle objectives are invented.
Repeated inspection deduplicates records, including copies on other floors.
Retry clears both the journal and exploration memory.

The notebook includes a 900 × 580 sketch canvas and tabs for discovered levels
and the grounds. Both it and the minimap use the same per-view fog: one-unit
cells reveal within 11 scene units around the player (doubled from 5.5 on
2 October 2026), with wall sight checks,
then remain known for that run. The negative coordinate origins of the revised
interior and the older grid layout are both supported. Browsing a different
sketch never discovers that level. NPC markers require the current level,
nearby distance, matching height and line of sight; explored areas do not
expose distant NPCs. `notebook-map.mjs` caches geometry and fog composites so
stationary map refreshes reuse their canvases.

Reading enters a suspended notebook state, clearing movement/use controls
and pending hold timers. The gameplay loop, player, NPC navigation/guard
animation and elapsed timer stop. Rendering continues, and resuming requires
fresh input. Help, ordinary pause, artwork inspection and retries retain their
existing behavior. No building geometry, compiled aerial assets, Unity/Blender
exports or packaged desktop/Android players were regenerated for this item.

Validation: the full browser `npm test` run passes. `test-notebook.mjs` checks
radius/wall fog, independent levels/grounds, retained exploration, updated
door/stair observations, document deduplication, deductions, hidden NPCs,
cached drawing and retry. `test-game.mjs` exercises the real game loop's
reading state, shortcuts, frozen progress and resume. `npm run test:notebook`
runs the notebook state and real Chrome checks; the latter verifies keyboard
and touch-button access, actual masked/remembered canvas pixels, held-E record
discovery, focus containment, floor browsing, fresh retries and phone-layout
scrolling with an accessible resume control. The existing asylum browser check
also passes all 23 door round trips, the walked basement/ground/first stair
and raised outside landing. No browser JavaScript or shader errors were found.
Desktop and phone-size renders were visually reviewed; six captures and the
browser results are in `Browser/artifacts/notebook/`. Mobile input was emulated
in Chrome, rather than tested on a physical phone.

## Native Android aerial interface revision (1 October 2026)

Version 0.7.0 / code 7 limits the pause button and its touch target to asylum
escape. Background/focus changes during exploration no longer open the pause
panel, including the Android location-permission prompt. Android Back / desktop
Esc closes the current archive or location list, then returns exploration to
the title. Escape pause, automatic background pause and its settings remain.

The exploration heading and left controls use a 28-unit inset from the safe
viewport's left/top edges, instead of the centred 1280-unit canvas. The location
crosshair and Day/Dusk/Night controls are 52-unit squares; lighting choices form
a vertical stack aligned with the heading and tree toggle. The location artwork
is baked from the browser SVG by `export-presentation.mjs` and checked against
that source. Shared button/panel drawing uses antialiased six-unit corner radii
with fixed-size corners at every aspect ratio; captures use the same surfaces.
The period arrows retain their size, placement and behaviour with rounded
corners. A small shadowed gesture guide runs along the bottom of aerial view.

A successful nearby aerial location fix retains aerial mode, historical period
and lighting, frames the reported position from above, and draws a red glowing
pillar and screen-sized ground pin through scenery. The marker follows the
physical fix across period changes and scales with camera distance. A rejected
or new fix clears the previous marker. Walking location still positions the
walker; switching to walking hides the aerial marker. Requests cannot overlap,
and returning home or entering escape cancels the location service. Location
data is not saved. Device GPS/permission input needs on-phone validation; smoke
checks inject nearby, distant and invalid fixes into the same result handler.

Validation: native asset/presentation checks, the full browser `npm test`
suite, Windows and ARM64 Android builds, and all 47,274 native gameplay,
navigation and presentation checks pass. Evidence is in
`NativeAndroid/artifacts/aerial-ui-smoke-final/smoke.json`; the day/dusk/night
controls in both views, wide layouts, retained escape pause, rounded panels
and red marker by day/night were visually reviewed. Automated frame timings
include smoke/loading overhead and are not phone performance measurements.

The signed update is `NativeAndroid/out/escape-1829-native.apk`, 178,768,544
bytes, SHA-256
`66512B1D101A9178B56445CCD8C217D8101D165C372DCC4A1047CD729E1813D5`.
APK v2 signature verification passes; package and certificate match the
previous versions. Its ARM64 libraries, all five license notices and the
asylum adaptive launcher icon are present. Details are recorded in
`NativeAndroid/artifacts/aerial-ui-apk-verification.json`. No phone was
connected; location permission interaction, physical GPS and real multitouch
remain to be checked on the device.

Only native C# sources, marker shader, presentation artwork, prepared native
scene and native player builds are updated. The generated geometry GLBs keep
source hash `bf3f2437f3d857fa77ec5cee686270bad0285909aa683fbd5a815a33316bbb9b`;
the geometry exporter was not rerun. Browser models, root Unity and Blender
exports are unchanged. The previous launcher-icon APK is preserved as
`NativeAndroid/out/escape-1829-native-v0.6.apk`.

## Native Android launcher icon (1 October 2026)

Version 0.6.0 / code 6 replaces the Unity launcher icon with a head-on
illustrated view of the asylum entrance, showing both blue heraldic dragons
and the coat of arms in the triangular pediment, the red door and stone steps.
The built-in image generator used the actual entrance photograph and existing
untitled game artwork. The two 1254x1254 opaque PNG sources are retained in
`NativeAndroid/Unity/Assets/AppIcon/`; prompts and references are recorded in
`NativeAndroid/art/icon-prompts.json`.

`NativeAppIconBuild.cs` sets the default icon and all six Android adaptive
sizes before each Android build. The adaptive artwork has extra sky and
approach around the entrance, preserving the complete pediment and steps
within launcher masks. The full scene is in the opaque background, with a
clear foreground layer. Texture imports retain sRGB colour, uncompressed
pixels, clamped edges and no mipmaps. Unity 6.6 uses adaptive Android icons;
its former separate Legacy and Round API fields are obsolete errors. The
layout follows [Android's adaptive-icon guidance](https://developer.android.com/develop/ui/compose/system/icon_design_adaptive).

Validation: `test-port.mjs` and `test-presentation.mjs` pass, as do native
scene validation and the ARM64 Android build. Circular and rounded-square
previews were visually checked at 240, 64 and 48 pixels in
`NativeAndroid/artifacts/icon-contact-sheet.png`. The packaged adaptive XML
points to both custom layers; the extracted 432px background and clear
foreground match Unity's exported pixels exactly, and the fallback icon is
opaque. Evidence is in `icon-settings.json`, `icon-art-validation.json`,
`icon-packaged-pixels.json` and `icon-apk-verification.json` in that folder.

The update is `NativeAndroid/out/escape-1829-native.apk`, 178,762,328 bytes,
SHA-256 `033D2903500F0024AB91CEAD06305E6BF6857A2E3BC5D79B0C0EF0333E86EB9F`.
APK v2 verification passes; its package and signing certificate match version
0.5.0, retained as `escape-1829-native-v0.5.apk`. The installed phone's launcher
has not been checked. Gameplay and browser tests were not rerun for this
launcher artwork change.

The Android icon assets/settings, version, native prepared scene and APK were
updated. Existing native geometry exports retain model source hash
`bf3f2437f3d857fa77ec5cee686270bad0285909aa683fbd5a815a33316bbb9b`.
Browser model sources, original photographs, root Unity and Blender exports,
and the native Windows player were not changed or regenerated in this revision.

## Native Android exploration controls revision (1 October 2026)

Version 0.5.0 / code 5 limits HELP, MAP, HOLD USE and TORCH to asylum escape.
Walking and aerial exploration ignore their former touch targets; the hidden
lower-right buttons no longer block looking or orbiting. Escape controls and
held-use gameplay remain available inside. The shared native Windows preview
also limits the corresponding help/map/torch shortcuts to escape, and its
walking control hint follows the visible controls.

Exploration now has three explicit Day, Dusk and Night choices. Their sun,
sunset and moon artwork is rasterized directly from the browser SVG definitions
by `export-presentation.mjs`, with the same selected colours and 44-unit touch
targets. The Lucide/Feather licence notice is bundled. Selecting the active
choice keeps it active; changing between walking and aerial views retains the
choice. Dusk uses the existing title twilight sky, sunlight, haze and colour
grading, with street lamps and window illumination enabled.

The presentation smoke checks exercise all three choices in both exploration
views, selection persistence, ignored escape targets and retained escape map,
help and torch actions. They capture each lighting/view combination with the
live mobile control drawing. The asset check also verifies the native glyph
definitions against the browser SVGs and the bundled licence against its source.

Validation: `test-port.mjs`, `test-presentation.mjs`, the full browser `npm test`
suite, the Windows build and the full native gameplay/presentation smoke pass.
`NativeAndroid/artifacts/controls-smoke-final/smoke.json` records 47,218 checks.
The six exploration lighting captures and the wide escape controls were
visually reviewed. Capture frame timings include the automated workload and
are not phone benchmarks.

The ARM64 Android build and APK v2 signature verification also pass. The update
is `NativeAndroid/out/escape-1829-native.apk`, 178,090,152 bytes, SHA-256
`E0915CCBCB4B234598201CE3095B7DB3B820F48FC19654D519D087CA0FE9E23D`.
The package and certificate match version 0.4.0, retained as
`escape-1829-native-v0.4.apk`. The APK includes all five licence notices;
`NativeAndroid/artifacts/controls-apk-verification.json` records the checks.
No phone was connected, so real touch behaviour still needs on-device review.

Only native control/lighting sources, presentation textures, the prepared
native scene and native Windows/Android players were updated or regenerated.
The geometry exporter was not rerun; the existing generated GLBs retain model
source hash `bf3f2437f3d857fa77ec5cee686270bad0285909aa683fbd5a815a33316bbb9b`.
Browser model sources, root Unity and Blender exports were unchanged.

## Native Android navigation and selection revision (30 September 2026)

Version 0.4.0 / code 4 addresses the second phone review. Aerial locations now
frame each building's full historical bounds from above, using a source shot
only for its horizontal direction. Ground-level archive views cannot become
the aerial camera position. Orbit pitch and zoom remain bounded, and an
additional roof/ground clearance check moves the camera back along its orbit
ray when a zoom or pan would put it inside a building.

Selection no longer tints everything inside a world-space box starting at
Y=1.8. The native exporter reuses the browser's clipped ward surfaces and
historical section filtering, preserving their complete building bases.
`selection.glb` contains 37 shared mesh variants / 66,640 triangles (4,895,684
bytes). Only the selected mesh draws, with depth testing and no shadows, at
0.048 opacity: an 80% reduction from the previous 0.24. It does not recolour
neighbouring buildings or ground within the selected building's broad bounds.
Long archive headings also fit above their dates without overlapping.

The title gradient spans the entire physical viewport, including the margins
outside the centred safe-area interface. Clamped texture edges prevent a
repeat seam. Both exploration choices now run a 2.4-second eased camera flight
from the exact live title pose, blending field of view and twilight lighting.
The aerial path rises above the estate; the walking path approaches the front
entrance. Touch/mouse navigation waits for handoff, and Skip/Back finishes at
the exact destination pose. Returning home cancels the flight, and backgrounding
the app pauses it until focus returns.

Validation: native asset/presentation checks and the Windows gameplay suite
pass. `NativeAndroid/artifacts/navigation-smoke-final/smoke.json` includes all
227 visible building/period locations, 2,724 close orbit cases, exact selection
base bounds, both flight midpoints/endpoints/skip paths, and movement after
handoff. GPU captures cover the wide title, close walls, corridor selection and
both transitions. Selected/unselected close-frontage renders were identical
at every third pixel when selecting the unrelated corridor, confirming the
old box tint no longer spills onto that frontage. Capture frame rates include
the automated workload and are not device benchmarks.

The ARM64 Android build and APK v2 signature verification also pass. The update
is `NativeAndroid/out/escape-1829-native.apk`, 178,071,528 bytes, SHA-256
`7E497383EF300D39503C9004383C4199D2CA211C0482D7FED08606A5ED1F636F`.
Its package and signing certificate match 0.3.0, retained as
`escape-1829-native-v0.3.apk`. See
`NativeAndroid/artifacts/navigation-apk-verification.json`. An initial native
compiler invocation ended without diagnostics; the subsequent complete build
passed. No phone was connected, so this update still needs on-device review.

The selection export was added while retaining the existing outdoor, indoor
and guard GLBs. Browser model sources, root Unity and Blender exports were not
changed. The model source hash remains
`bf3f2437f3d857fa77ec5cee686270bad0285909aa683fbd5a815a33316bbb9b`.

## Native Android presentation revision (30 September 2026)

Version 0.3.0 / code 3 addresses the phone review of the full port. This entry
supersedes the corresponding rendering limitations in the 0.2.0 notes below.

The interface uses the browser's Arial/Georgia lettering, cream and muted-green
palette, bordered dark panels and serif headings. Local Chrome bakes the fonts
as glyph artwork with `NativeAndroid/tools/export-presentation.mjs`; no Windows
font-program files are shipped and Android needs no installed fonts. Large
Georgia glyphs use 160 pixels for clear title lettering. Captions are measured
and fitted to button widths, including both torch states. High Detail and
Battery Saver are separate choices with the current option highlighted;
tapping that option keeps it selected. The small map legend also fits its row.

The title uses the browser's 1916 frontage camera, trees, twilight and gentle
lateral drift, and says **Cheshire County Asylum**. Building photographs open
in a left-side panel occupying less than one third of the landscape canvas.
The selected building remains highlighted and aerial camera controls work
beside the panel. An explicit action expands a photograph for pan/zoom.

The native export now includes the shared countryside, rolling meadows, distant
tree belts/hedges and the frontage coat-of-arms photograph. Native shaders add
clouds, moving weather noise, distant haze and height-dependent ground mist.
EZ-Tree leaves retain local phase and tip weights for the browser's three wind
harmonics; trunks remain fixed. Foliage mipmaps preserve alpha coverage. High
Detail adds nearby soft sunlight shadows; Battery Saver disables shadows and
keeps its lower resolution limit. Directional ambient light, surface detail,
adjusted sun/corridor lighting and the browser's ACES tone-mapping convention
replace the former flat appearance.

Road depth offsets previously disappeared during export, and compressed
coordinates could collapse thin surface layers. Signed material offsets now
survive into native materials; thin ground/overlay meshes retain uncompressed
coordinates. Title/aerial near clipping also gives more depth precision.
The outdoor union now contains 5,535 meshes / 6,604,975 triangles, counting all
periods, detail variants and scenery. Interior and guard counts are unchanged.
Scenery tints share quantized material buckets to limit additional draw calls.

Validation: `test-port.mjs` and `test-presentation.mjs` pass, as do the Windows
and ARM64 Android builds. Full gameplay and presentation checks are recorded
in `NativeAndroid/artifacts/presentation-smoke-final/smoke.json`. GPU captures
were visually compared with a fresh browser title reference and cover title,
sky/horizon, roads, day/night frontage, photo panel, quality choices, help and
touch controls at 1280×720 and 1560×720. Offscreen UI checks reuse the live
glyphs, caption measurements, rectangles and drawing functions. These captures
and their displayed frame timings are not phone benchmarks.

The signed update is `NativeAndroid/out/escape-1829-native.apk`, 176,987,696 bytes,
SHA-256 `1EB4B9A29DC002C90A62BC3A1D5E2CEAA707398935F345ADB73AF33571F23B81`.
APK v2 verification passes; package and certificate match the earlier builds.
Details are in `NativeAndroid/artifacts/presentation-apk-verification.json`.
The previous full-port APK is retained as `escape-1829-native-v0.2.apk`.
No device was connected; the S25 Ultra still needs a performance/touch check
with the restored scenery and High Detail shadows. The reported 60 FPS remains
the prototype baseline. Play Store release preparation remains separate.

Only NativeAndroid sources/exports were regenerated. Browser models, original
photographs, root Unity and Blender exports were not changed. The geometry
source hash remains `bf3f2437f3d857fa77ec5cee686270bad0285909aa683fbd5a815a33316bbb9b`.

## Native Android playable port (30 September 2026)

The isolated `NativeAndroid/Unity` project now provides asylum escape on both
floors, walking exploration across the estate, and aerial exploration through
all 13 historical periods. The test APK is `NativeAndroid/out/escape-1829-native.apk`
(version 0.2.0 / code 2). It retains the prototype's package and debug certificate
so it can install as an update. Its player-facing name is Escape from 1829.
This supersedes the prototype's ground-floor/frontage limits below.

Gameplay includes five exits selected once from all fourteen candidates per app
load, unchanged on retries; the two held-use stair transitions; guard and ghost
navigation through stairs; the five-second head start; sight, pursuit memory,
torch slowing, stamina, sprinting and crouching. Inactive exit sites display
ordinary walls. Signs, mini/full maps, held-use artwork viewing, arrival/escape
sequences, historical capture outcomes, procedural footsteps/heartbeat, pause,
audio, look sensitivity and 30/60 FPS choices are native C# implementations.

Exploration includes current source geometry for the whole estate, the timeline,
three building-detail levels, tree visibility with corresponding collision
snapshots, building selection, location jumps, dates and local photograph
browsing with pan/zoom. The archive contains 72 distinct local pictures,
including eleven wall-art images assigned on each floor. Building selection
uses source building bounds; it is less precise than the browser's triangle
picking around courtyards. MY POSITION requests location only when used and
maps readings with the existing earth anchor/perimeter. Physical GPS readings,
Android permission interaction and real multitouch require device validation.

The native rendering is tuned for mobile: shadows are disabled, outdoor detail
follows projected window size, and only nearby lights are enabled. High Detail
caps rendering at 1920 pixels along the longer screen side; Battery Saver uses
1280 pixels and fewer lights. Native day/night lighting has street-lamp pools
and a sparse window-light pattern. It does not reproduce the browser's cloud,
weather and tree-wind shaders or its exact window-light selection. Local archive
art is bundled; the browser's additional remote heritage-reference panels are
not bundled. The port is playable across the complete geometry and gameplay
scope, rather than a pixel-identical browser renderer.

### Shared assets and regeneration

`NativeAndroid/tools/export-port.mjs` builds the current browser model sources
in local headless Chrome, captures every period and detail level, and writes
one shared GLB library plus period membership/navigation metadata. Geometry
common to different periods is exported once. Two interior libraries contain
exact source triangles split into a shared core and open/closed neighbourhoods
for every exit. The guard preserves its source hierarchy for the native
displacement-driven leg solve. World transforms, reflected winding, surface
UVs, alpha, texture transforms, linear grain textures, bump and unlit materials
are converted explicitly. Mineral UVs use a dominant-axis projection instead
of the source's triplanar shader. Original photograph/art bytes are unchanged;
local WebP/JPEG/PNG pictures are decoded to generated Unity PNG resources.

The full source/export fingerprint is
`bf3f2437f3d857fa77ec5cee686270bad0285909aa683fbd5a815a33316bbb9b`.
The outdoor union has 4,400 meshes / 6,398,079 triangles, the two-floor interior
334 meshes / 186,332 triangles, and the guard 67 primitives / 10,606 triangles.
The outdoor number counts every period and detail variant in the library,
not the triangles rendered simultaneously. Exported vertices are welded without
removing triangles; Unity uses low mesh compression for packing, omits tangents
where bump shading is unused, and releases exterior/interior CPU mesh copies
after uploading. Low compression quantizes packed attributes; source GLBs keep
their original floating-point coordinates and triangle counts.

Source models, photographs, layouts, dates and capture-outcome content remain
shared inputs. Browser gameplay and native gameplay remain separate JavaScript
and C# implementations: future rule/control changes need updating and verifying
in both. Browser or Blender modelling changes do not update this package until
the native export and build are regenerated. The older root Unity project and
Blender exports were not changed by this port; only NativeAndroid exports were
regenerated. No browser model sources were edited in this work.

With Unity 6000.6.3f1, Android Build Support, SDK/NDK and OpenJDK installed:

```powershell
powershell -ExecutionPolicy Bypass -File NativeAndroid/tools/build.ps1 -Target Android
```

`-Target Windows` makes the local native preview; `-Target Prepare` imports and
validates the scene. Generated models, photos, scene, baked assets, Unity caches
and build outputs are ignored. Existing prototype export/check scripts and its
41 MB APK remain as historical comparison/rollback artifacts.

### Validation and device baseline

- `node NativeAndroid/tools/test-port.mjs` passes current source/layout/GLB/image
  hashes, finite attributes and valid indices, triangle counts, shared period
  membership, preserved guard joints, both exit-state geometry libraries,
  fourteen reachable exits and clear outdoor starts for all thirteen periods.
- Existing `Browser/test-escape-routes.mjs` and `Browser/test-security-guard.mjs`
  pass. Browser sources were unchanged; the unrelated browser-suite updates in
  this working directory are not part of the port.
- Windows and ARM64 IL2CPP Android builds succeed. The final Windows gameplay
  run is recorded in `NativeAndroid/artifacts/full-port-smoke-signs/smoke.json`.
  It exercises period switching, tree collisions, archive loading, location-list
  touch dispatch, help, retry persistence, movement speeds, held-use pauses,
  upstairs/downstairs latching, enemy stair pursuit, torch slowing, artwork,
  escape and varied capture outcomes. GPU-rendered captures of the estate,
  frontage by day/night, both floors and the guard were visually reviewed.
  Earlier failed smoke folders are superseded by this passing run.
- Validation caught and corrected distant-window collision bounds, optional
  nested JSON defaults, upper-floor spawn inheritance and material colour-space
  conversion. [Unity's shader property documentation](https://docs.unity3d.com/6000.0/Documentation/Manual/SL-PropertiesInPrograms.html)
  explains why linear glTF factors are converted to sRGB when assigned to Unity
  Color properties; named linear grain/mask textures retain linear sampling.
- `NativeAndroid/artifacts/full-apk-verification.json` records the 158,737,660-byte
  APK, SHA-256 `0D3084952DCA12B4A3EEE8DA3A3474F8D0FCDA59BE48C54DB68B868503A211E2`,
  verified APK v2 signature, matching prototype certificate, version code 2,
  Android 8 minimum / target API 36, ARM64 libraries and all four license notices.
  Location hardware is optional and the manifest requests no network permission.

The user reported the installed prototype at 60 FPS on a Samsung S25 Ultra.
That is the target for this expanded build, not a measured result for it. No
device was attached for the final build, and desktop smoke timings include
automation/loading overhead and are not a phone benchmark. Install the update
and check escape, walking and aerial modes on that phone before qualifying
performance. This is a locally signed test APK; release signing, Play packaging,
store presentation and submission remain separate work.

## Native Android prototype (30 September 2026)

`NativeAndroid/Unity` is an isolated Unity 6000.6.3f1 project. It builds an
offline native Android player using ARM64 IL2CPP and OpenGL ES 3, with package
identifier `org.hjennerway.escape1829.prototype`, minimum Android API 26 and
target API 36. The APK uses Unity's development signing key. Store signing,
an Android App Bundle and Play Console submission are separate release work.

The playable slice contains the 1916 asylum frontage, a ground-floor escape
round, a patrol/chase guard, a torch, a route map, pause/background handling,
touch movement/look and held run/use controls. Five exits are randomly selected
from the seven canonical ground-floor exits. It does not yet include the
browser game's first floor, ghost, historical timeline controls or building
information. The guard reuses the model in a fixed pose with movement/bobbing;
its articulated browser animation is not ported.

`NativeAndroid/tools/export-assets.mjs` runs the current browser model builders
in a local headless browser and exports world-space GLBs with embedded textures.
It crops the exterior to the frontage, rebuilds material batches in 16-metre
cells and records the original collision footprints and walk surfaces. The
indoor layout is copied byte-for-byte from `Browser/dist/layout.json`. The
model-source fingerprint and SHA-256 hashes for the layout and each GLB are
recorded in the generated manifest and checked before building.

The editor importer converts GLBs into native Unity meshes, materials, textures
and prefabs before building. Phones do not run Three.js or decode GLBs. There
are 878 exterior meshes / 633,490 triangles including the prototype ground,
266 indoor meshes / 82,884 triangles, and 23 guard meshes / 10,606 triangles.
The source has 369 collision footprints in the exterior crop. The Unity surface
shader handles base-colour textures, alpha cutouts, double-sided surfaces and
emission. Browser custom shaders, bump-map extensions and texture-transform
extensions are not reproduced; lighting/material appearance is approximate.
Real-time shadows are disabled for this first performance test.

Rebuild from the repository root with:

```powershell
powershell -ExecutionPolicy Bypass -File NativeAndroid/tools/build.ps1 -Target Android
```

The script needs the browser dependencies installed (`npm ci` in `Browser`),
Chrome or a Playwright Chromium installation, Unity 6000.6.3f1 and Unity's
Android Build Support, SDK/NDK and OpenJDK modules. `-UnityPath` overrides the
editor location; `MODEL_CHROME_PATH` overrides Chrome. `-Target Windows`
produces a desktop preview, and `-Target Prepare` exports/imports the scene
without building a player. Outputs are in `NativeAndroid/out`; validation logs,
source/import reports and captures are in `NativeAndroid/artifacts`. Generated
GLBs, baked Unity assets, scene files, engine caches and builds are ignored by
Git. The APK includes the repository, Three.js, EZ-Tree and tree-texture license
notices in StreamingAssets.

This bridge avoids hand-remaking building geometry and textures for the native
prototype. Repeat the export/build after browser model changes; native assets
do not update automatically in an already-installed APK. New gameplay and
platform-specific UI/lighting still require work in each runtime. This change
does not edit browser model sources or regenerate the earlier root Unity or
Blender exports.

The performance display reports FPS/frame time, and the pause screen offers
30/60 FPS caps and a lower resolution. Desktop F3 shows extra geometry and
95th-percentile frame timing. A capped desktop run is a functional test, not
evidence that this build is faster than the browser or runs smoothly on a
phone. Phone startup, touch ergonomics, sustained FPS, heat and memory still
need a real-device test.

Validation of the final prototype:

- `node NativeAndroid/tools/test-assets.mjs` passes source/layout/GLB hashes,
  finite vertex/index data, triangle counts, all seven routes and exterior spawn.
- Unity's prepare validation and both Windows and Android player builds pass.
  The automated Windows preview (`--prototype-smoke <absolute-output-folder>`)
  passes title actions, pause/resume, torch/map actions, exterior movement,
  entering the asylum, seven reachable routes, five active exits, escape and
  capture. `NativeAndroid/artifacts/final-smoke/smoke.json` records that run.
- Offscreen GPU captures of the actual built player verify the frontage and
  corridor geometry/textures/lighting. The entry marker is placed above the
  exported path's Y=.195 surface, and the guard's source-facing direction is
  corrected after the coordinate conversion. The captures do not contain IMGUI;
  screen layout and multi-touch ergonomics need the phone check.
- Focused browser escape-route, interior-architecture, explore and security-guard
  checks pass. Browser sources are unchanged by this native work.
- Android build tools verify the final APK's v2 signature, API 26/36 manifest,
  ARM64 ABI, native IL2CPP library and all four bundled license notices.
  `NativeAndroid/artifacts/apk-verification.json` records its SHA-256 and size
  (41,167,176 bytes). The signing certificate is `CN=Android Debug`.

## Geometry snapshots after the Carden wall correction (30 September 2026)

The complete browser suite audit found eleven failing checks: ward placement
and ten annexe preservation tests. Replaying only the previous Carden low-wall
footprint from `edb1924` made all ten annexe tests pass, including their later
assertions. The only model difference is the documented `3cb6ea0` correction
that ends the low masonry at the tall-range join to remove coincident brick
faces. No other source edits or snapshot-filter changes were used for replay.

Refreshed eleven hashes in ten saved snapshots for Larkton/recess, kitchen,
rear stretch/side alignment, the approved annexe shape, Oakmere court/west/
windows and entrance alignment. The recess check holds two affected hashes.
Every primitive count, root transform, retained-wing hash and ward range
outside those eleven refreshed fields remains exact.

The ward-placement test now compares authored building and corridor geometry
before layout assembly extends foundation bottoms into the lawn. Its camera,
walking obstacle and Historic-visibility checks still run on the assembled
scene. `test-building-grounding.mjs` independently checks that all upper
geometry, texture registration, footprints and transforms survive grounding.

The full browser `npm test` suite passes, as do all eleven affected checks and
the additional Carden preservation check. The complete suite log is
`Browser/artifacts/geometry-snapshot-final-suite.log`.
The compact before/after evidence is
`Browser/artifacts/geometry-snapshot-carden-repair.json`; the in-memory replay
uses `geometry-snapshot-carden-before-loader.mjs` in the same directory.
Model sources and exports are unchanged by this repair; the compiled estate's
source fingerprint remains current, so no model rebuild is required.

## Windows smoke navigation timing (1 October 2026)

Run `36767890588` successfully created the Windows folder and preview MSIX,
then timed out waiting for the aerial URL with no renderer errors. The previous
explicit navigation wait still started its 120-second clock alongside the
button click. Local Playwright diagnostics showed that software rendering can
spend about 55 seconds in the click's actionability/input checks before the
destination starts loading; the unchanged test still passed locally.

`Desktop/test/smoke.mjs` now awaits each real navigation click with
`noWaitAfter`, then checks its destination. `waitForURL` also accepts an already
reached destination, so fast navigation cannot be missed. Input and navigation
have separate 120-second limits. The smoke viewport is fixed at 960 by 640 and
pixel ratio 1, keeping software-rendering work independent of runner display
size and DPI. The animated handoff, timeline, offline assets, renderer isolation,
storage, gameplay/map and walking assertions remain enabled. Evidence now
records viewport and separate click/navigation timings; failures record their
stage, attempt a bounded focus/visibility/pointer-lock snapshot and screenshot.
The manually launched Electron also uses Playwright's background timer,
occluded-window and renderer flags. The game is brought to the front before
mouse-capture checks, avoiding incidental window backgrounding during CI or
local automated runs.
Console checks start with the controlled offline navigation, since optional
archive-image requests can already be in flight on the automatically opened
page before CDP blocks the network. JavaScript exceptions remain monitored
throughout startup.

Validation: all eight desktop unit checks and the full browser `npm test` suite
pass. The final packaged offline check also passes with Electron, its renderer
and software GPU restricted to four logical CPUs. Aerial input took 67.6 seconds
and navigation another 9.0 seconds; walking mouse capture and return navigation
passed. Evidence is in `Desktop/artifacts/packaged-four-cpu-smoke.json` and
`packaged-four-cpu.log`; the final landing and aerial captures were inspected.
All 303 web files inside `app.asar` match the current browser inventory by size
and SHA-256.

Earlier two-logical-CPU probes reached aerial (100.9 seconds input plus 17.9
seconds navigation), but stopped at walking mouse capture or the landing click.
The final four-CPU check matches the CPU count documented for this public
repository's [standard Windows runner](https://docs.github.com/en/actions/reference/runners/github-hosted-runners),
without claiming equivalent cloud performance.

Only the desktop smoke test and these notes changed; browser/model sources and
Unity/Blender/native exports were not edited, and the executable and MSIX were
not regenerated for this test change. The GitHub workflow has not been rerun
with this change.

## Packaged desktop navigation smoke check (30 September 2026)

The Windows offline smoke check reported a timeout after clicking Aerial View,
inside Playwright's implicit navigation wait, with the renderer still reporting
the intro URL and no runtime errors. The unchanged development smoke check
passed locally, so the CI failure was not reproduced deterministically.

`Desktop/test/smoke.mjs` now waits for the title's first rendered frame before
exercising its capture-and-navigation handler. It starts an explicit destination
wait alongside the real button click, disables only the click's implicit
navigation wait, and matches the aerial pathname with or without the temporary
`?intro=1` marker. It then waits for the animated handoff to finish before
checking the timeline. Return navigation uses the same explicit wait and
confirms that the start button becomes ready again. Navigation and scene
readiness checks retain their 120-second limits.

Validation: all eight desktop unit tests pass. The Windows executable was
rebuilt, and `npm run test:desktop -- --packaged` passed offline, including
renderer isolation, storage, gameplay/map, the aerial handoff and timeline,
compiled asset integrity, walking and return navigation. The packaged landing
and aerial screenshots were visually checked. Evidence is saved in
`Desktop/artifacts/packaged-smoke.json` and the associated screenshots/log.
The browser `npm test` run stopped at the unrelated `test-ward-placement.mjs`
Redesmere concealed-connector snapshot (lower vertices -1.98 versus -1.8).
This change edits only the desktop smoke test and these notes; no browser
model sources or Unity/Blender exports were changed. The runnable Windows
folder was rebuilt for validation; the MSIX packages were not rebuilt.

## Hidden access-path edges beside Estates (29 September 2026)

The one-sided strip in the lawn was the ground-contact edge of Main/admin's
retired `East wing side access`. `closeGroundEdges` now parents supporting
faces to individually toggled surfaces supplied by the layout controller.
Their hidden state therefore applies to the complete surface in source,
walking and serialized aerial scenes. Other road edges retain their sibling
structure and material batching. No road footprint or walking obstacle changes.

The grounding regression reproduced the original defect, then passed with
the repair across all 13 periods and four layout states. Compiled validation
also checks that the retired path owns its supporting faces. Estates, historic
roads and aerial batching checks pass. Visual evidence uses
`Browser/artifacts/estates-stray-*`.

The full compiled/source and timeline suite passed, including fallback loading
and walking collisions. `npm test` reached the unrelated Annexe entrance
preservation snapshot (`test-annexe-access.mjs`), where concurrent building
grounding edits changed the raw Annexe primitive fingerprint. All subsequent
suite checks pass in `estates-stray-suite-remaining.log`; the original failure
is retained in `estates-stray-suite.log`. That snapshot constructs the raw
exterior without either of this repair's changed edge-generation call paths.
Its baseline was not refreshed here. After those concurrent model edits, the
local compiled model was rebuilt again and Estates/grounding checks passed.

Source, walking and compiled close-ups were checked from both sides. Browser
source and local compiled aerial assets are updated; Unity, Blender and
packaged desktop exports were not regenerated.

## Outhouse base flicker and Pine13 verification (29 September 2026)

The reported green flicker was coincident moss and brick faces on both long
walls. Moss now projects 0.01 units beyond the plinth; the foundation extends
to -0.18 below the -0.15 lawn, with its top and footprint retained. Pine13,
the tree in the supplied screenshot, already has its root extended to -0.36
by the estate-wide grounding correction below. This repair retains that fix.
See Research/outhouse/README.md for the supplied reference and modelling notes.

The outhouse regression reproduces each original foundation/moss defect and
passes after correction, while checking Pine13, roof coverage, open approaches
and layout collisions. Source and walking close-up previews were visually
reviewed. The original outhouse reproduces both saved ward snapshot hashes;
the scope audit proves all surrounding geometry and ward ranges unchanged,
and limits this repair to the foundation and 40 moss translations. The two
preservation hashes are refreshed without changing their primitive counts.
Validation evidence uses Browser/artifacts/outhouse-contact-*.

Final validation: the complete `npm test` and `npm run test:compiled` suites
pass, including all tree families, every timeline stop, fallback loading and
walking collision refresh. Source, walking and compiled close-ups of both
wall faces and Pine13 were visually checked. The rebuilt manifest's source
fingerprint matches the final checkout.

Browser source and the local compiled aerial model are updated. Unity,
Blender and packaged desktop exports were not regenerated.

## Road, tree and lamp ground contact (29 September 2026)

The walking-view report exposed flat road and kerb overlays above the estate
lawn at Y=-0.15. `ground-contact.mjs` closes their boundary edges 0.02 units
into the terrain. Existing top surfaces, holes, routes, materials and junction
heights stay intact. Thin boxed paths are supported from their undersides;
sloping paths retain their gradient. Supporting faces are siblings so aerial
batching remains effective, and share the original surface's period ownership.
Their materials deliberately disable polygon offset: horizontal overlay bias
on vertical faces otherwise produces spikes through adjoining road surfaces.
The vertical faces use metre-scaled texture UVs, avoiding stretched ground
projection; that mapping is retained by compiled loading.

Simple broadleaf, mapped beech/oak/pine/willow and all EZ-Tree detail levels
now extend their root ends into the lawn, preserving crown geometry and X/Z
placements. Distant tree feet additionally sample the rendered meadow mesh;
the smooth height function alone left some trunks above its coarse triangles.
Only the lower trunks extend; the distant crowns and trunk tops stay fixed.
Lamp positions already meet their respective terrain or raised lawn surfaces.

`test-ground-contact.mjs`, included in `npm test`, audits 3,763 supporting
outlines, all estate tree families and lawn LODs, 1,327 hillside trees, and
all lamp columns across the 13 periods and four layout states. It also checks
that supporting faces cannot obstruct walking and have no slope depth bias.
Existing road-normal checks now distinguish horizontal tops from vertical edges.
Source, compiled and walking close-ups use `Browser/artifacts/ground-contact-*`.
The rebuilt compiled-scene tests pass for source/compiled rendering parity,
full detail and fallback loading, every period and walking collision refresh.
The complete `npm test` suite passes; focused grounding, historic-road and
batching checks also pass after the final edge-texture refinement.
The final timeline rerun retains all original assertions and saves screenshots
under `Browser/artifacts/ground-contact-timeline/`, avoiding a write failure
on the shared `timeline-1829.png`. Its log is `ground-contact-timeline.log`.

The root-only snapshot audit reconstructs the previous source in memory and
reproduces both saved whole-estate fingerprints before checking the difference.
Other named geometry, unnamed non-trunk primitives and ward ranges stay exact;
only the two snapshot hashes change, retaining 820,060 and 884,107 primitives.
The replay and evidence use `ground-contact-scope-*` and
`ground-contact-snapshot-check.*`; existing snapshot helpers remain unchanged.

Browser sources and the local compiled aerial model are updated. Unity,
Blender and packaged desktop exports are not regenerated.

## Evenly spaced orchard planters (29 September 2026)

Added three matching stone-edged tree beds at (0, -64), (56, -64) and (70, -64)
between Churton and Huxley/Dunham. The standing orchard row now has uniform
14-unit spacing, with the original bed dimensions, shrubs and small broadleaf
scale. See [placement reference](Research/orchard-planters/README.md).

The new trees are appended after the existing seeded trees and share their
foliage batches. A scoped before/after audit confirms exactly 42 new primitives,
with all previous protected geometry, tree positions and crown shapes intact.
Tree visibility and collision checks pass. The modern car-park check includes
the three additional trees in its existing displacement rule.

Validation logs and source/compiled previews use `Browser/artifacts/orchard-planters-`.
The `npm test` run, continuation and focused reruns cover every suite check.
The two whole-estate snapshots initially differed because they predated these
planters and the concurrent front-stair wall correction. A separate gated audit
reproduces both saved snapshots using the previous basement source and no new
planters, then verifies exactly the 42 planting additions and two retaining
walls split at grade with a 3 cm upper setback. Every other primitive stays
exact. Only the two snapshot count/hash pairs are refreshed; the snapshot
filters and assertions remain intact. Jarman, Leighton/Newton and modern
car-park checks pass after the refresh.

Compiled/source geometry and rendering comparison, full detail, model fallback,
all timeline stops, mobile controls and live walking collision refresh pass.
The final source and compiled planter views were visually inspected, with no
browser errors, and the compiled source fingerprint matches the current model.

Browser model source and local compiled aerial assets are updated. Unity and
Blender exports were not regenerated.

## Geometry snapshot baseline repair (29 September 2026)

The Jarman and Leighton/Newton whole-estate checks retained fingerprints from
25 September while later approved modelling work changed their surroundings.
Reconstructing Git revision `58f8bf3` entirely in memory reproduces both saved
count/hash pairs exactly, establishing their provenance before any refresh.

The audit compares geometry by name and then compares every unnamed primitive
as a multiset, including geometry, materials, world transforms and shadow/
collision flags. It retains 819,114 Jarman-protected and 883,161
Leighton-protected primitives exactly. All other changes fall in the documented
front-lawn tree replacement/additions/removal, front and west basements and
access surfaces, west facade/courtyard repairs, inner-court trim clearance,
kitchen fascia/gutter/ridge correction and Hospital Shop lamp relocation.
The current concurrent lawn and lamp edits are included in the audited state.

Only the two stored count/hash pairs are refreshed: Jarman now protects 820,016
primitives and Leighton/Newton 884,063. The original L ranges, all test
assertions and both snapshot-filter helpers remain unchanged. Both focused
tests pass, and the final full `npm test` run passes without failures
(`Browser/artifacts/geometry-snapshot-suite.log`). The source fingerprint still
matches the audited state after the suite. This repair changes no model geometry
or exports.

Evidence and repeatable audit helpers use `Browser/artifacts/geometry-snapshot-*`.
The history loader reads old modules from Git without changing the checkout.
The refresh helper rejects unknown changed names/regions, a mismatched original
snapshot, changed ward ranges or a model source fingerprint that moved after
the audit. Its `--write` option is a one-off repair, not a general snapshot
acceptance command. Later intentional model edits still require reviewing and
updating the whole-estate snapshots; the original protections are retained.

## Animated intro navigation (29 September 2026)

The intro's Aerial View and Explore on Foot actions now carry the current title
camera and a single captured frame into the destination. A small script runs
before scene loading to show that frame while geometry and shaders prepare.
Once the first destination frame is rendered, the still blends into daylight
and a 2.4-second eased camera move reaches the existing aerial or walking start.
The camera tracks the estate during the rise, including portrait layouts.

The transition blocks movement input until arrival, offers Skip movement and
Escape, and honours reduced motion with a short crossfade only. Aerial framing
updates if the viewport changes during the flight. The navigation marker and
session payload are consumed once, so direct links and reloads retain their
normal behaviour. Early clicks and unavailable session storage use the bundled
title still and its matching camera. A Back to intro link remains available
during loading, including failed scene loads. No persistent drawing buffer is
enabled; the title renders and captures only when one of these actions is used.

Run `npm run test:intro` from `Browser` for camera endpoint/control handoff,
portrait framing, resize, skip, reduced-motion and real browser navigation
checks. Browser checks delay the destination import to verify the loading
image, sample actual intermediate camera positions, and cover early clicks
with unavailable storage. Visual captures use `Browser/artifacts/intro-*`.
The full `npm test` run and all 32 checks after its first failure were run;
only the previously documented Jarman and Leighton/Newton estate snapshots
fail. This change touches browser navigation, camera animation and UI only;
no modelling sources, compiled estate, Unity or Blender exports are changed
by this work.

## Original lawn pair colour and size correction (29 September 2026)

The two original front-lawn trees now share the earlier copper-brown foliage
tint and are each 20% larger in height and crown radius than the four green
companions. Roots and rotations are retained. The shared template fit is fixed
at its previous dimensions, preserving all companion buffers and transforms;
only the original pair's scales and foliage materials change. Wind and shadow
materials remain shared within each of the two foliage colours.

The before/after audit reproduces both saved geometry snapshots, then removes
only the original pair from each comparison. All 820,004 Jarman-protected and
884,051 Leighton-protected outside primitives remain exact, including the four
green companions. Only the two snapshot hashes are refreshed; protected counts,
ward ranges and test assertions are retained. Evidence uses
`Browser/artifacts/lawn-pair-scope-*` and the repeatable snapshot-check helper.
The corrected source and compiled aerial previews were visually inspected and
both show a western-tree shadow affecting 16,484 pixels in the isolated shadow
comparison. Focused size, tint, sharing, collision and shadow checks pass.
The complete `npm test` suite passes. Source, rebuilt compiled and walking
browser checks also pass for leaf animation, shadows, trunk collisions,
walkable canopies and tree visibility. Logs/previews use `lawn-pair-*`.

Browser sources and the local compiled aerial asset are updated; Unity and
Blender exports were not regenerated.

## Front lawn planting and shadow coverage (29 September 2026)

The latest marked view removes the small east-wing broadleaf, moves the original
two lawn trees 30% toward the main facade, enlarges them by 20%, and adds four
matching trees across the front lawns. All six share greener EZ-Tree geometry,
materials, textures and depth materials with slight rotations and independent
LOD selection. Explicit trunk footprints scale with the crowns. The legacy
template for mapped beeches remains independent of the new lawn dimensions.
See [placement notes](Research/front-lawn-trees/README.md).

The western tree's absent shadow was near-plane clipping. Moving the sun back
along the same ray keeps its angle and 4096-pixel map, while enclosing all six
crowns and their ground shadows. Static shadows remain cached and existing
wind, visibility and timeline controls retain their invalidation paths.

Validation: the focused tree tests pass in source, compiled and walking views,
including wind pixels, shadow depth, shared buffers, toggle/collision refresh
and reduced motion. The annotated-view shadow comparison measures 12,662
darkened pixels from the western tree in both source and compiled renders.
The mapped-beech preservation check remains exact. Rendering stays within the
existing per-copy distant-tree allowance (782,676 tree triangles with trees on);
sharing cuts geometry/material storage, not the number of rendered trees.

The full browser suite was run through its initial Jarman snapshot stop, with
every remaining command covered by the continuation. A concurrent audited
snapshot refresh resolves Jarman and Leighton/Newton; the focused Jarman rerun
passes. Ground-only entrance probes now exclude overhead trees while preserving
the full trunk collision checks; their rerun also passes. Validation logs and
matching aerial previews use `Browser/artifacts/lawn-planting-*`.

The rebuilt compiled-scene and timeline browser suite passes, including exact
draw-count parity, source/compiled image comparison, full detail, fallback
loading, every period, mobile controls and live walking collision refresh.
Model binary round-trip checks also pass.

Browser model sources and the local compiled aerial asset are updated. Unity
and Blender exports were not regenerated.

## EZ-Tree front lawn pair (28 September 2026)

Replaced only the two photograph-positioned lawn beeches with tuned EZ-Tree
Oak Large geometry, retaining their root locations, approximate crown extents,
heights and bronze/olive distinction. The mapped beeches retain their prior
shared template exactly. See [preset and reference notes](Research/front-lawn-trees/README.md).

The pinned MIT-licensed generator uses the existing vendored Three.js. Local
baked leaf/bark pixels make generation synchronous in Node, browsers and the
model compiler, with no external runtime dependency. Three LODs share materials
and reduce the branch/leaf geometry at 95 and 210 units with hysteresis.
The existing tree toggle and timeline ownership are retained.

`front-lawn-wind.mjs` applies EZ-Tree's slow three-harmonic leaf sway before
projection, composing with the atmosphere shader. The shared day/night update
drives it in aerial, walking and game exterior scenes; the same setup restores
material hooks and matching shadow-depth materials after binary loading.
Nearby animation invalidates cached shadows each frame. Beyond 120 units and
when trees are hidden it pauses to retain cached aerial shadows. Reduced-motion
mode disables sway. Neither object transforms nor fixed trunk collisions move.
Explicit trunk footprints prevent the combined branching meshes' large bounds
from blocking the whole lawn.

Validation: `test-front-lawn-eztree.mjs` covers placement, crown dimensions,
LOD budgets, trunk/canopy walking, visibility, wind/depth time, reduced motion
and binary restoration. `test-front-lawn-eztree-browser.mjs` verifies changing
wind pixels, no shader/page errors, trunk collisions and tree toggling in source,
compiled and walking views, with screenshots under `Browser/artifacts/eztree-*`.
Run both with `npm run test:eztree` after `npm run build:models`.
The tree rendering, KML, aerial performance and day/night checks pass. The
complete graphics-profile checks and rebuilt compiled-scene/timeline suite
also pass, including source/compiled draw parity, fallback loading, mobile
controls and walking collision refresh. The saved lawn close-ups differ by
0.0032 intensity levels per colour channel between source and compiled paths.

The full `npm test` run and continuation cover every suite command. Only the
previously documented Jarman and Leighton/Newton whole-estate fingerprints
fail. Restoring the original front-lawn module in memory reproduces both
failures (196 extra pre-existing primitives in each); replacing the two trees
also changes those broad fingerprints, so their saved baselines were retained.
Exact mapped-beech preservation is recorded in `eztree-mapped-preservation.json`.
The local compiled estate was rebuilt. Browser sources and compiled aerial
assets changed; Unity and Blender exports were not regenerated.

## Ground, stone and rendered-wall textures (28 September 2026)

Roads and gravel now share deterministic surface-grain textures, with shallow
bump shading and world-aligned scale across ribbons, junction caps, courts and
instanced surfaces. Grass uses a 12-unit tile instead of the former 100-unit
tile, with finer blade strokes, mipmaps and requested 16× anisotropy. Existing
planting retains its random stream and placement.

Stone and white render use restrained mineral grain with triplanar sampling,
so walls, columns, steps and coping retain consistent detail without stretching
their box UVs. Existing authored brick/slate/boundary maps and other material
palettes are retained. Material metadata restores both ground and mineral
shader hooks after loading the precompiled scene; the atmosphere shader
continues to compose with them. Mineral sills remain eligible for the existing
distant window atlases, preserving the window-detail optimisation.

The two marked grass slivers at Reception's outer stair feet are now gravel.
Only the 0.34 × 0.20 corner at each side changes; the larger lawns and stair
geometry are retained. The existing path outline supplies the infill at the
same height and with the same material, without an overlapping patch. See
[the owner's annotations and finish notes](Research/surface-finishes/README.md).

Validation: source and rebuilt compiled close-ups were visually checked for
roads, lawns, gravel, white render, entrance stonework and church stone. Both
rendered stair-foot probes hit gravel at y=0.195. Source/compiled comparison,
full-detail and fallback loading, timeline stops, walking collision refresh,
road geometry, basement access and window-detail checks pass. The cornice
regression now identifies pale render by its material role rather than the
obsolete absence of a texture, and still checks clearance above the brick.
The full npm suite and its continuation cover every listed check; after that
cornice assertion update, only the previously recorded Jarman and Leighton/
Newton whole-estate snapshots fail. Both failures also reproduce with the
small paving correction removed in memory; their baselines are retained.
Evidence uses `Browser/artifacts/ground-textures-*` and `surface-finishes-*`.

Browser modelling sources and the local compiled aerial model are updated;
the generated fingerprint matches the final source. Unity, Blender and packaged
Windows exports were not regenerated.

## Aerial countryside and three lighting modes (28 September 2026)

The aerial and walking pages now offer direct Day, Dusk and Night selections.
Night illuminates one in ten visible windows (rounded to the nearest whole
window), superseding the one-in-fifteen setting documented below. Dusk retains
the denser, approximately 42% lit-room treatment. Switching between dusk and
night preserves room priorities; returning from daylight chooses a fresh set.
The controls use Lucide icons with accessible labels, pressed states and native
keyboard activation. Their license is retained in `Browser/dist/vendor/`.

`Browser/dist/countryside.mjs` adds low meadow relief, irregular tree belts and
interrupted hedges beyond the playable estate, including The Willows. These
are illustrative surroundings, not historical survey data; see
[the countryside notes](Research/countryside/README.md). The backdrop has three
draws, casts no additional shadow maps and is excluded from model selection,
timeline groups and walking collisions. Existing terrain remains level.

The atmosphere shader adds world-aligned grass/field variation, slowly moving
cloud shadows and estate-relative distance haze. Cloud detail extends down to
the horizon, fading continuously into the distant meadow colour. Dusk uses a
lower sun and warmer openings in the cloud cover. Changing modes invalidates
cached shadows; daylight restores the original sun position and lighting.
Reduced motion freezes both cloud drift and cloud shadows. Street illumination
still uses eight unshadowed point lights. The title preview images are refreshed
from the final runtime lighting rather than from promotional artwork.

Validation includes `test-atmosphere.mjs`, `test-countryside-browser.mjs`, the
day/night suite and source/compiled comparisons. Desktop and 390/320-pixel
phone checks verify nonblank renders, mode-specific window counts, nonoverlapping
controls and actual cloud-shadow pixel movement. Source and compiled renderings
have identical draw/triangle counts; 0.016% of screenshot pixels differ
significantly. The compiled comparison freezes weather via reduced-motion
emulation so time-dependent shadows cannot invalidate its image comparison.
The gameplay atmosphere and mobile landing suites also pass, covering animated
cloud pixels, interior exposure restoration, preview loading/failure states and
the 1916 title scene. A transient Windows screenshot-write error cleared on
rerunning the landing suite.

The full browser regression suite and all checks after its first failure were
run. Only the previously recorded Jarman and Leighton/Newton protected-geometry
snapshot failures remain; their expectations are unchanged. The browser's local
compiled asset was rebuilt for the window-lighting source fingerprint. Browser
runtime sources and loading images are updated; Unity, Blender and packaged
Windows exports are not regenerated.

## Main kitchen eave flicker and gallery ridge junction (28 September 2026)

The kitchen fascia and side gutters now project 0.025 scene units clear of
the brick wall faces, removing the coincident surfaces responsible for the
marked eave flicker. The cross-gallery terracotta cap ends flush against the
continuing north/south cap, producing a T junction. Reference and dimensions
are in [the kitchen notes](Research/main-kitchen/README.md).

The kitchen regression check ray-tests exposed trim clearance and the three
ridge arms' flush contact and equal height. It fails on the original fascia
and passes after the repair. The Main/admin, ward-corridor, tower-building
and roof-contact checks also pass. A source comparison confirms exactly five
changed meshes (two fascias, two side gutters and one ridge cap), with all
3,414 other Main/admin and corridor meshes retaining their geometry and
transforms. Evidence and the repeatable capture helper use
`Browser/artifacts/kitchen-roof-`.

Source and regenerated compiled close-ups were visually checked from shifted
eave views and both sides of the T junction, with no browser errors. The
compiled/source comparison passes, including full detail and fallback loading,
as does every timeline stop and live walking collision refresh. The full
browser suite stops at the Jarman protected-estate fingerprint; running its
remaining checks reports only the analogous Leighton/Newton failure. Both
reproduced their snapshot failures before this repair. Their baselines are
retained; all other suite commands pass. `git diff --check` passes.

Browser model sources and the local compiled aerial asset are updated.
Unity, Blender exports and the packaged Windows app were not regenerated.

## Artwork-inspired atmosphere (28 September 2026)

The browser title, arrival and escape scenes now use a dusk treatment inspired
by `Art/store-super-hero-1920x1080.png` and the square promotional artwork:
teal cloud cover, a warm horizon, lit rooms and low ground mist. The title
camera gently moves in front of the entrance, with a wider portrait distance;
the interactive aerial view keeps its existing map camera. Both loading WebPs
are regenerated through `Browser/capture-landing.mjs` using the same lighting
and camera as the live title. Reduced-motion preferences freeze cloud drift
and the title camera.

`Browser/dist/atmosphere.mjs` adds a runtime sky and composes height-dependent
mist with the existing grass and window shaders. Clouds share a deterministic
128-pixel noise texture with the mist. Existing repeated masonry/roof textures
also supply shallow bump detail; grass, glazing, transparent foliage and photo
panels are excluded from that treatment. The sky is one unshadowed draw and
does not enter the model hierarchy, selection meshes or walking obstacles.

Dusk illuminates about 42% of visible windows with a stable seeded selection.
Close panes have warm colour variation, curtain folds and stronger light toward
the sill; distant atlases retain their glass-only emission mask. Ordinary
walking/aerial night mode keeps its random one-in-fifteen selection. Day/night
switching changes the sky palette and restores daylight lighting. All exterior
views retain the eight-light street-lamp budget and cached-shadow invalidation.
Interior fixtures are warmer, with cooler, slightly lower ambient fill; the
game restores its interior exposure immediately after the arrival handoff.

Validation includes `test-atmosphere.mjs` (also run by `test-day-night.mjs`),
`test-atmosphere-browser.mjs`, desktop/mobile landing checks and the day/night
and compiled-model browser suites. The atmosphere browser check captures real
canvas pixels and composited screenshots at 1280x800 and 390x844, verifies
visible cloud movement, window density, the light budget and interior exposure.
Visual evidence is under `Browser/artifacts/atmosphere/`.

All focused browser checks pass, including mobile loading/failure states,
day/night controls and selection, every historical period and live walking
collisions. The final compiled/source comparison has identical draw and
triangle counts, with 0.0176% of pixels differing significantly. A concurrent
kitchen edit invalidated the first compiled run; verification was repeated
successfully against the newly rebuilt combined scene.

The full `npm test` run and the checks after its first failure were executed.
Jarman and Leighton/Newton have pre-existing protected-geometry snapshot
failures, reproduced using the committed window-light source; all other
commands passed. Details are in `Browser/artifacts/atmosphere-remaining-tests.json`.
The local compiled estate was rebuilt for the window-source fingerprint.
This change updates browser runtime sources and loading images; Unity, Blender,
GLB exports and the packaged Windows app were not regenerated.

## Microsoft Store artwork (28 September 2026)

Seven Store listing PNGs are saved directly in `Art/`: poster artwork at
1440x2160 and 720x1080, square box art at 2160x2160 and 1080x1080, and tile
icons at 300x300, 150x150 and 71x71. The selected portrait and square covers
were made with the built-in image generator using the existing game palette
and entrance photos. Both retain the three-storey central frontage and the
visible blue heraldic dragons and coat of arms in its triangular pediment,
as requested by the owner. These are illustrated cover images, not gameplay
screenshots. The three small tiles export the existing favicon's door symbol.

Prompts and references are recorded in `Desktop/store/art-prompts.json`.
`Desktop/scripts/create-store-tiles.mjs` exports the SVG tiles;
`Desktop/scripts/export-store-art.mjs` exports size variants from the approved
cover PNGs without cropping. Both refuse to overwrite existing artwork.
Run the latter with `--check-only` to validate the saved dimensions and produce
the review contact sheet without changing the artwork. The PNG size checks
passed, every file is below 50 MB, and both covers and all tiles were visually
reviewed. Evidence is in `Desktop/artifacts/store-art-validation.json` and
`store-art-contact-sheet.png`. No game models, runtime assets, Windows package
contents or GitHub Pages workflow were changed by this artwork task.

### Additional hero and promotional artwork

Five more PNG files in `Art/` cover the requested additional Store slots:
untitled super hero art at 3840x2160 and 1920x1080, titled hero art at
1920x1080, untitled featured square at 1080x1080, and legacy branded key art
at 584x800. The built-in image generator made four distinct compositions
from the approved square cover and actual entrance photograph. All retain
the complete blue-dragon pediment and frontal entrance.

`Desktop/store/additional-art-prompts.json` records the prompts, source files,
and exports. `Desktop/scripts/export-store-promotional-art.mjs` accepts four
generated sources (super hero, key, titled hero, square) and exports the five
sizes without overwriting files. Generated source dimensions were 1672x941
for both wides, 1071x1469 for the portrait, and 1254x1254 for the square.
Proportions are preserved, with less than 0.13% edge trimming to accommodate
pixel rounding. The 4K file is an upscaled export, not native 4K generation.

Validation passed for all five files: exact dimensions, valid PNGs, fully
opaque pixels and less than 50 MB each (largest 14,327,317 bytes). Generated
images and the exported contact sheet were visually checked for title
spelling, clear blue dragons, and intact frontage. Evidence is saved in
`Desktop/artifacts/promotional-art-validation.json` and
`promotional-art-contact-sheet.png`. The export helper supports `--check-only`.
No game-code tests were needed for these artwork-only additions.

Current game-specific Microsoft guidance retires the 584x800 Branded Key Art
format, despite the older portal showing a slot. That file is retained as
a requested legacy portrait variant without an Xbox branding bar. See
`Desktop/store/listing.md` for the source and slot mapping.

## Windows desktop and Microsoft Store packaging (27 September 2026)

`Desktop/` packages the same `Browser/dist` game in Electron for Windows x64.
The existing `.github/workflows/pages.yml`, browser dependencies and game
sources are unchanged by this packaging work. The Windows workflow has its own
jobs, permissions and concurrency group; its success is not a dependency of
Pages deployment. Neither packaging command uploads to Microsoft or publishes
a release. Unity and Blender exports are unaffected.

The desktop uses a secure `escape1829://game/` origin and serves only bundled
assets. It needs no Node installation, local HTTP server or hosted website to
play. Five optional archive wall images retain their existing external URLs;
they need internet, and the game's existing fallback artwork is used offline.
Bundled building photographs remain available offline. The renderer is
sandboxed with no Node/preload bridge. HTTPS links open
in the default browser; other external protocols and downloads are blocked.
F11 toggles fullscreen, and the native Game menu returns to the intro or exits.
Existing browser controls are retained. Local storage belongs to the desktop
profile, separate from browser saves; Store updates are delivered by Microsoft.
The optional position button asks for permission; actual device location still
depends on Chromium's location provider and Windows services and is not
covered by offline game testing.

### Local setup and testing

Use Node.js 24 and PowerShell on Windows. From the repository root:

```powershell
npm ci --prefix Browser
npm ci --prefix Desktop
Push-Location Browser
npx playwright install chromium
npm run build:models
Pop-Location
npm test --prefix Desktop
npm start --prefix Desktop
```

Alternatively set `MODEL_CHROME_PATH` to an installed Chrome executable for
the model compiler and icon rendering. The staging step verifies the compiled
model's source hash, size and SHA-256, copies web assets byte-for-byte, and
includes only the current compiled binary, not old local builds. It rejects
source changes during copying and records `Desktop/out/web-build.json`.
Rebuild models after changes before packaging, just as for Pages.

```powershell
npm run package:windows --prefix Desktop
npm run test:desktop --prefix Desktop -- --packaged
```

The runnable folder is `Desktop/out/EscapeFrom1829-win32-x64/`; launch
`EscapeFrom1829.exe`. Distribute the whole folder, not the executable alone.
The smoke test uses an isolated profile and blocks HTTP(S) requests, then
checks game startup/map, storage, compiled aerial assets/timeline, walking,
navigation and renderer isolation. Evidence is saved in `Desktop/artifacts/`.
Software WebGL is used only by tests, not by the normal desktop launcher.
Assets for Windows icons/tiles are generated from the existing favicon SVG.

### MSIX preview and Store submission

MSIX requires Windows SDK `MakeAppx.exe`. The build finds an installed SDK;
`MAKEAPPX_PATH` can override its path. If none is installed, the optional
`./Desktop/scripts/setup-sdk.ps1` downloads a pinned, checksum-verified
Microsoft SDK tools package into `Desktop/.cache/`, without a system install.

```powershell
./Desktop/scripts/setup-sdk.ps1
npm run package:preview --prefix Desktop
```

This creates an **unsigned development MSIX** with a `LocalPreview` identity.
It cannot be submitted as a Store release or installed by double-clicking
without separate signing/trust setup. Use the runnable folder for local play.
The packaging scripts do not install packages, generate certificates or
change certificate trust. MakeAppx semantic validation remains enabled.

After reserving the game in Partner Center, copy
`Desktop/store-identity.example.json` to `Desktop/store-identity.local.json`
and replace all three fields with the exact Product identity values. Then run
`npm run package:store --prefix Desktop`. Missing/example/preview identities
are rejected. The Store package is unsigned for Microsoft to sign during
certification; there is no paid signing-certificate dependency for this route.
Choose New product > Game in Partner Center for this MSIX game. Complete the listing,
game category, screenshots, ratings, privacy details and certification there.
Explain `runFullTrust` as the Electron desktop runtime used to run the bundled
WebGL game; no elevation or background service is requested.

The initial package version is `1.0.0.0`. Before each Store update, increase
`Desktop/package.json`'s numeric `major.minor.patch` version and refresh its
lockfile. The fourth Windows version component stays zero for Store use.

`.github/workflows/windows-store.yml` builds previews for relevant main pushes
and pull requests and uploads the runnable folder, MSIX and test evidence.
For a real submission build, set repository variables `STORE_IDENTITY_NAME`,
`STORE_PUBLISHER`, `STORE_PUBLISHER_DISPLAY_NAME`, then manually run the
workflow with `package_kind: store`. These are public package metadata, not
passwords or signing keys. Download the Store MSIX artifact and submit it to Microsoft;
the workflow itself has only repository read permissions and does not deploy.

The MSIX upload uses `actions/upload-artifact@v7` with `archive: false`, so its
individual download is the `.msix` file itself. The artifact is named after
that file: `EscapeFrom1829-<version>-x64-store.msix` for a Store run, or
`EscapeFrom1829-<version>-x64-preview-unsigned.msix` for a preview. Submit only
the Store file to Partner Center. The runnable Windows folder and test evidence
remain ZIP downloads; the web build inventory is included with test evidence.
The run summary links the MSIX and explains which package kind was built.

Older workflow runs still download `EscapeFrom1829-MSIX-<kind>.zip`. Extract
that ZIP and use the `.msix` inside it; do not rename the ZIP. A preview MSIX
still requires a new workflow run with `package_kind: store` and the three
identity variables configured. See the [direct artifact upload release](https://github.com/actions/upload-artifact/releases/tag/v7.0.0).

Validation (30 September 2026): all eight desktop unit tests pass. The workflow
YAML and all PowerShell step scripts parse successfully, and both preview and
Store summary branches generate the expected download link and submission
instructions. Direct downloads still need verification on the next hosted
workflow run. This edit does not rebuild the executable, MSIX or game models.

Store listing text, certification notes and privacy information are in
`Desktop/store/`. `node Desktop/scripts/capture-store.mjs` captures four direct
1920x1080 screenshots of the built Windows app into
`Desktop/out/store-submission/screenshots/`, meeting the desktop screenshot
size requirement. Publish the privacy text at a public URL before submission.
The initial Store identity was supplied on 28 September 2026; see the release
record below. The IARC questionnaire and the remaining Partner Center sections
still need completion; local preparation does not submit or publish it.

References: [Electron protocols](https://www.electronjs.org/docs/latest/api/protocol),
[Electron security](https://www.electronjs.org/docs/latest/tutorial/security),
[MSIX packaging tools](https://learn.microsoft.com/en-us/windows/msix/package/create-app-package-with-makeappx-tool),
[Store package signing](https://learn.microsoft.com/en-us/windows/apps/package-and-deploy/publish-first-app).

### Validation of the initial Windows preview

The local x64 executable and unsigned `1.0.0.0` preview MSIX were built with
Electron 44.4.5 and passed MakeAppx semantic validation. Desktop boundary,
Store identity/version and compiled-asset corruption tests pass. The packaged
executable passes the offline smoke test, including mouse capture, and the
landing, game, aerial and walking screenshots were visually checked. The
263 archived web files match the build inventory byte-for-byte, with one
compiled model and no build tools or local identity file in the application.
The bundled web source is the same source used for Pages; compiled assets were
regenerated locally. `.github/workflows/pages.yml` retains its original Git
blob hash `0c1ccfbe45fd36484285741a459c8dba40206c05`.

The compiled/source browser comparison passes, including full detail and
missing/corrupt-model fallback. The timeline test initially could not overwrite
an existing screenshot; an isolated copy of the same assertions, changing
only import/server/output locations, passes all timeline stops and walking
collision refresh. Its evidence is in `Desktop/artifacts/timeline/`.

The full browser suite stops at the existing Jarman whole-estate fingerprint
mismatch. Running the remaining checks reports only the analogous
Leighton/Newton fingerprint mismatch; all other checks pass. Those model
baselines and game sources were not edited for packaging. Logs and the
continuation report are in `Desktop/artifacts/`. Microsoft certification,
signed MSIX installation and device geolocation remain unverified; the
preview has no real Partner Center identity and has not been published.

### Initial Store package (28 September 2026)

The user supplied the reserved identity for Store product `9PK5RS1JJGXG` in a
Partner Center screenshot. It is saved in the ignored
`Desktop/store-identity.local.json`. `npm run package:store --prefix Desktop`
created `Desktop/out/EscapeFrom1829-1.0.0-x64-store.msix`, version `1.0.0.0`.
This is an unsigned Store submission package for Microsoft to sign after
certification. MakeAppx validation passed, and inspection inside the final
archive confirmed the supplied name, publisher and publisher display name.
The three desktop packaging tests and a fresh packaged offline gameplay,
storage, map, aerial timeline, walking and navigation check also passed.
All 263 bundled web files match the build inventory. The game sources and
the GitHub Pages workflow were not changed for this identity-specific build.

The package is 193,295,449 bytes; its SHA-256 is
`E6B9F4FE70AB08F41010E11F520A781CF9835DDD6D4CA68CDEE2F7D4B126B550`.
Detailed evidence is in `Desktop/artifacts/store-release-verification.json`.
Browser control still failed at startup with the Windows sandbox ACL error,
so the file has not been uploaded and certification has not been requested.
Submission materials and the Packages page URL are in `Desktop/store/listing.md`.

### Electron download recovery (28 September 2026)

The Windows workflow failed in `package:preview` when GitHub returned HTTP 500
for the pinned Electron 44.4.5 Windows x64 ZIP. Web staging had completed;
the failure occurred before executable packaging and MakeAppx validation.

`package-windows.mjs` now retries transient Electron download failures after
5, 15 and 30 seconds (four attempts total), logging each retry and preserving
the final error. HTTP 408/429/500/502/503/504 and temporary socket, timeout and
DNS failures qualify; missing releases, checksum failures, configuration and
filesystem errors still fail immediately. Asset staging and fuse updates sit
outside the retry loop.

Packaging uses the checksums bundled with the pinned `electron` npm dependency,
as Electron's installer does, so checking a cached ZIP does not require another
request for `SHASUMS256.txt`. Checksum verification remains enabled. The workflow
shares `Desktop/.cache/electron` between npm installation and packaging through
`electron_config_cache`, and restores/saves it with `actions/cache`, keyed by
runner OS, x64 architecture and the desktop lockfile. Local packaging honors
the same environment variable or keeps Electron's default cache location.
See [Electron Packager download options](https://electron.github.io/packager/main/interfaces/Options.html#download).

Validation: all eight desktop tests pass, including simulated HTTP 500 recovery,
retry exhaustion, nested fetch errors and immediate non-transient failures.
The Windows executable and unsigned preview MSIX were rebuilt successfully;
MakeAppx semantic validation and the packaged offline smoke test passed,
including renderer isolation, storage, game/map, compiled aerial timeline,
walking and return navigation. Build and smoke logs are saved in
`Desktop/artifacts/download-retry-preview.log` and `download-retry-smoke.log`.
The browser suite stops at the previously documented `test-jarman.mjs`
whole-estate fingerprint mismatch. No game sources, model sources, Unity or
Blender exports changed; the existing current compiled model was reused.
These checks validate the local build; the updated GitHub workflow has not
been run remotely.

## Front semi-basement walks and corrected stair entrances (27 September 2026)

The two facade walks now sit 1.215 scene units below the existing path grade,
following the owner's 50%-deeper correction. Each has six 0.2025-unit risers
at both ends. The outer descent runs along the facade from the blue-marked
corner; the initially modelled stair projection into the lawn is removed.
The inner flight rises beside Reception. Existing bottom windows, blue doors,
upper walls and the central split staircase retain their positions. References,
estimated dimensions and the superseding annotation are in
[Research/front-basement/README.md](Research/front-basement/README.md).

The shared terrain, legacy ground and corner asphalt are excavated to expose
the lower paving and every tread. Exposed foundations close the walls beneath
the windows; retaining edges follow the stepped frontage. Explore follows
the actual lower floor and tread heights and blocks crossing the retaining
walls. Height metadata follows the same visibility/obstacle refresh as the
scene, without changing obstacle-array serialization. Hiding both layouts
restores plain grass; choosing a timeline period reopens the excavation.

The new `test-front-basement.mjs` covers both complete routes in both directions,
all four six-tread flights, removal of the lawn projection, surface heights,
retaining collisions and layout/timeline changes. It is included in `npm test`.
The corner, exterior, walking, touch-input and KML checks pass. A saved pre-edit
comparison confirms every front window position and size remains exact.
Source and rebuilt compiled front, west, east and ground views were inspected.
Evidence uses `Browser/artifacts/front-basement-*`. Browser model sources and
local generated aerial models changed; Unity and Blender exports are unchanged.


## Protected estate test snapshots refreshed (25 September 2026)

The Jarman and Leighton/Newton tests still held whole-estate fingerprints
from before the accepted exterior corrections in `56c5470` and `bab9d54`.
The development and research notes record those failures after the paving,
steps, roof/trim, courtyard wall and tree changes. The annexe model sources
are unchanged across those commits; both snapshots include the edited
surrounding estate.

Refreshed only the two stored counts and SHA-256 fingerprints from the
current source: Jarman 859,427 -> 859,378 primitives and Leighton/Newton
923,474 -> 923,425. Exact snapshot equality, scope filters and all focused
window, roof, collision and visibility assertions remain active. The saved
Leighton/Newton footprint ranges are unchanged. No runtime/model sources,
generated aerial assets, Unity sources or Blender exports changed in this
repair, so no model rebuild or new rendering validation is required.

Validation: the complete `npm test` sequence passes all 77 commands,
including both refreshed snapshots and the focused exterior checks.
`git diff --check` passes.

## Kelsall/Churton roof tree removal (25 September 2026)

Removed the small orchard tree at x=-42, z=-64 whose foliage protruded
through the oblique wing roof and brick wall. The existing exclusion path
removes its trunk and all five crowns while preserving random draws and
rotation indices. Before/after scene comparison confirms exactly one tree
removed and every remaining broadleaf position and crown shape unchanged.
Building geometry and planting beds are retained; walking obstacles derive
from the scene without the removed trunk. Reference details are in
[the Churton notes](Research/churton-kelsall/README.md).

Source and rebuilt compiled close-ups were visually checked with trees
explicitly enabled and no browser errors. Churton, tree rendering, walking,
layout and performance checks pass. Compiled/source rendering comparison,
full detail, fallback loading, all timeline stops and live walking collision
refresh pass. The full browser suite and its continuation report only the
Jarman and Leighton/Newton whole-estate snapshot failures; both also fail
in the saved pre-edit scene, and their baselines were not changed. Evidence
uses `Browser/artifacts/kelsall-roof-tree-*`.

Browser sources and local compiled models are updated. Unity and Blender
exports are unchanged.

## Rear wings lowered to the connecting roof (25 September 2026)

Lowered both 1829 rear main roofs to the blue-marked connecting eaves in
`Research/1829-back/rear-wings-height-marked.png`. Eaves are now 13.06 and
ridges 15.66 scene units throughout, with the supporting wall tops, rear
stair-section trim and affected rainwater pipes fitted to that level.
The rear hips, footprints, low annex roofs and all window positions and
sizes are retained. The separate inner projecting enclosures keep their
high windows and caps. This supersedes the previous rising rear-arm roof.

All 67 recorded opening schedules match the pre-edit scene exactly. The
exterior check now verifies the level rear ridges and eaves and ray-tests
the upper glazing close to the lowered trim on both sides and both ends.
Exterior, roof-contact and west-refinement checks pass. Source and rebuilt
compiled east, west, rear and end views were visually checked without browser
errors. Source/compiled image comparison, draw counts, full detail, controls
and loading fallback checks pass, as do all timeline stops and live walking
collision refresh. The full browser suite and its continuation finish with
only the two whole-estate preservation snapshot failures. Those snapshots
for Jarman and Leighton/Newton fail both before and after this edit; their
stored baselines are unchanged. Evidence uses `Browser/artifacts/rear-height-*`.

Browser sources and local compiled models are updated; Unity and Blender
exports are unchanged. Reference and geometry details are in
`Research/1829-back/README.md`.

## East courtyard bay, recess and fire-exit corner (25 September 2026)

The courtyard beside Redesmere now has a regular half-octagonal bay with a
flat front and 45-degree cheeks, followed to the photograph's left by a real
recess and a shallow projecting fire-exit corner. The cross range and garden
pavilion stop behind the indentation. White foundations, floor bands, slate
roof edges, windows and walking collision follow the corrected walls; both
escape doors meet the stair landings. The garden-facing side remains coplanar
and the adjoining passage remains clear. Photo references, estimated dimensions
and comparison views are in [the courtyard notes](Research/east-courtyard/README.md).

Browser geometry shared by aerial, Explore and gameplay is updated, and the
local compiled aerial model is rebuilt. Unity and Blender exports are unchanged.
Source and compiled aerial, ground, detail and plan views were visually checked
without browser errors. Focused facade, roof-contact, western bay and Redesmere
garden checks pass. The compiled/source comparison, full-detail loading,
fallbacks, all timeline stops and live walking collision refresh pass.

The full browser suite stops at Jarman's whole-estate snapshot. Continuing the
remaining checks separately also reaches the Leighton/Newton snapshot failure.
Both failures reproduce using the saved pre-edit source via a loader; their
snapshot baselines are unchanged. All other suite checks pass, including the
31 remaining checks outside the Leighton/Newton failure. Evidence uses
Browser/artifacts/courtyard-bay-*.

## East frontage half-octagonal bay (25 September 2026)

Replaced the marked east frontage cylinder with the same broad-fronted,
canted half-octagonal bay used on the west side. Walls, white ground floor,
bands, slate hip, nine sash windows and walking collision share the new
outline. Brickwork now uses the surrounding walls' material and texture
scale instead of stretching one texture across the cylinder. Reference and
dimensions are recorded in [the bay notes](Research/east-bay/README.md).

Browser sources and the local compiled aerial model are updated; Unity and
Blender exports are unchanged. The shared builder's optional settings retain
both western bays' exact geometry attributes, materials, transforms,
collision footprints and window schedules, checked against the prior source.

Validation: the exterior/bay, roof-contact and west-refinement checks pass.
Source and compiled close, front and overhead views were visually checked,
with no browser errors. Compiled/source comparison, exact draw counts, full
detail, loading fallbacks and every timeline stop pass, including live
walking collision refresh. The compiled source fingerprint is current.
The full browser suite stops at Jarman's whole-estate snapshot; continuing
the remaining checks finds only the equivalent Leighton/Newton snapshot
failure. Both failures were reproduced before the bay edit, and their
baselines were not changed. Evidence uses `Browser/artifacts/east-bay-*`.

## Front entrance chimneys (25 September 2026)

Added the two long, square-ended brick stacks at the marked central entrance
roof junctions, using the existing front photographs for their proportions
and stepped brick caps. Bases penetrate the slate, and the caps stay below
the original pediment apex. Source geometry is shared by aerial, Explore and
gameplay. The local compiled aerial model was rebuilt; Unity and Blender
exports were not regenerated. Reference details are in
`Research/1829-back/README.md`.

Validation: entrance geometry and roof contacts pass (108 roof attachments,
3,888 perimeter samples). Source and compiled close, front and photo-direction
renders pass without browser errors. `npm run test:compiled` passes, including
all timeline stops, fallback paths and source/compiled image comparison.
The full `npm test` run stops at Jarman's whole-estate preservation snapshot;
continuing the remaining commands finds only the equivalent Leighton/Newton
snapshot failure. Both snapshots also fail with all six new chimney pieces
removed from the in-memory scene, so unrelated current workspace geometry is
involved. Those baselines were not overwritten. Evidence is saved under
`Browser/artifacts/front-chimneys-*`, including the with/without comparison.

## Front entrance stairs meet the doorway wall (25 September 2026)

Extended the middle landing and both lateral stair branches back to the
existing doorway landing wall, covering the grass strip in the user's
annotation. The branch depth increases from 1.2 to 2.25 scene units; the
outside edge, tread heights, approach steps, returns and railings retain
their positions. See [reference notes](Research/front-steps/README.md).

The existing exterior geometry check now samples the former grass strip,
including the wall seam, and verifies solid walking obstacles there. It
passes, and before/after browser captures show the continuous stone surfaces.
The rebuilt compiled model passes source/render comparisons, exact draw counts,
full detail, controls and missing/incompatible/corrupt model fallbacks. The
compiled entrance close-up is visually checked; every timeline stop and live
walking collision refresh pass. The generated source fingerprint is current.
Browser sources and local compiled output changed; Unity and Blender exports
are unchanged.

Validation artifacts use the Browser/artifacts/front-steps- prefix. Existing
Jarman and Leighton/Newton whole-estate preservation snapshots already fail
with the pre-change stair dimensions restored in memory: both have five
fewer primitives than their saved baselines. Those baselines are unchanged.

## Three.js r186.1 migration (25 September 2026)

The browser runtime now uses pinned Three.js **0.186.1**, retaining
`WebGLRenderer`. The migration was checked at r170 and r180 before r186.
All three entry points use the same local library; the game and GLTF loader no
longer download a second copy from jsDelivr. The upstream core module,
GLTFLoader, BufferGeometryUtils, SkeletonUtils and MIT licence are vendored
from the exact development dependency recorded in the npm lockfile.

After `npm ci`, use `npm run vendor:three` to regenerate those files and
`npm run check:three` to verify their contents and loader imports. The full
suite, model checks and model build verify this pin, including in Pages CI.
The only edits to upstream add-ons are their local import paths.

Compatibility changes use `PCFShadowMap` (the current soft PCF filter),
`TextureSource` when restoring binary textures, and `Timer` with explicit
per-frame updates and document visibility handling. Aerial timing resets after
shader warmup. Existing grass, interior finish, night-window and building-glow
shaders remain on WebGL. Lighting exposure and material parameters are retained.
Current Three.js requires WebGL 2; WebGL 1-only devices are no longer supported.
WebGPU and cascaded sunlight shadows were not introduced by this migration.
See the upstream [migration guide](https://github.com/mrdoob/three.js/wiki/Migration-Guide)
and [r186 release](https://github.com/mrdoob/three.js/releases/tag/r186).

The pre-upgrade full suite passed. The final full suite passes all 77 commands,
including dependency verification. Raw geometry fingerprints depended on the
older extrusion/triangulation and primitive generation. Before refreshing
21 hashes in the preservation snapshots, the same modelling source was built
under r160 and r186: all 8,697 scene objects retained exact hierarchy, transforms,
material values, instance transforms and shadow flags; all 7,723 geometries
retained bounds, surface area and oriented volume within the audit tolerance.
Cone builders remove degenerate faces and extrusion triangulation/UV ordering
changes. Counts and independent roof, opening, placement and walking assertions
were retained. The old/new hashes and audit report are in
`Browser/artifacts/three-upgrade/fingerprint-migration.json` and
`geometry-audit.json`; the audit script is `Browser/artifacts/audit-three-upgrade.mjs`.
It accepts a path to the original r160 module as its first argument.

The local compiled estate has been regenerated for revision 186 (13,460,180
compressed bytes). Source/compiled rendering, exact draw counts, shared buffers,
full detail, controls and missing/incompatible/corrupt model fallback pass.
The source/compiled comparison differs significantly in 0.0166% of pixels,
within the existing 0.5% tolerance. Every timeline period, walking collision
refresh, desktop/mobile day/night controls, building selection, software/GPU
visibility profiles, real emulated multitouch movement and responsive landing
loading/failure behavior also pass. Browser checks use headless Chrome with
software WebGL; hardware profiles and mobile input are simulated.
Browser sources and local compiled output changed; Unity and Blender exports
were not changed. Generated estate binaries remain ignored and are rebuilt by CI.

Run `npm run benchmark:three -- label` for repeatable day/night aerial and
walking captures plus a fixed-layout game comparison. Use `MODEL_CHROME_PATH`
when using an installed Chrome; `THREE_SAMPLES` defaults to 30. The benchmark
uses a 1000 × 700 viewport and verified GPU acceleration, with remote photos
excluded equally. GPU acceleration is required; `THREE_HARDWARE=1` is no longer
needed. Runs also measure synchronous rendering cost separately from the
display frame interval.
Its fixed exit/artwork/NPC choices are injected only by the test. Migration
screenshots and JSON reports are under `Browser/artifacts/three-upgrade/`.
The `three-validation-output.mjs` hook redirects browser-test output there,
preserving earlier screenshots. Timing numbers are local diagnostics, not
hardware FPS guarantees.

The final NVIDIA RTX 3090 Ti comparison sustained approximately 60 FPS in all
six views on both r160 and r186. Median synchronous rendering costs (ms) were:

| View | r160 | r186 |
| --- | ---: | ---: |
| Aerial day | 9.7 | 9.8 |
| Aerial night | 11.4 | 11.1 |
| Walking day | 15.3 | 13.5 |
| Walking night | 10.9 | 10.4 |
| Game reception | 0.2 | 0.3 |
| Game upstairs | 0.3 | 0.4 |

These single-run measurements show no broad hardware FPS gain or regression.
The software-rendered aerial daytime sample was slower: median frame interval
650.3 → 1200.3 ms. Night aerial was 683.5 → 633.6 ms, walking stayed near
450 ms, and game samples were 166.7 → 166.8/183.4 ms. The daytime change
coincides with the newer shadow implementation; this comparison does not
isolate its cause. Both versions were benchmarked with trees explicitly on,
which overrides the existing software-renderer default of hiding trees. No
shadow-quality reduction was applied. This remains a software-rendering
limitation, and is not representative of GPU performance. Final benchmark
runs have no page or shader errors and no duplicate-library/deprecation
warnings (SwiftShader still lacks KHR_parallel_shader_compile). Before/after
aerial, night walking and fixed-layout interior screenshots were visually
checked. Raw results: `Browser/artifacts/three-upgrade/performance-comparison.json`.

## Automatic tree visibility for software graphics (25 September 2026)

Aerial view and Explore on Foot now inspect their active WebGL renderer once
at startup, before drawing. Known software renderers (including SwiftShader,
Mesa software rasterizers and Microsoft Basic Render Driver/WARP) start with
the Trees layer hidden. GPU or unavailable/unrecognised renderer information
keeps the existing visible default. Browsers do not expose their acceleration
preference directly; the check uses the optional
[WebGL renderer information](https://registry.khronos.org/webgl/extensions/WEBGL_debug_renderer_info/)
and the ordinary renderer string, tolerating restricted or missing information.

The T shortcut still overrides visibility for the current page, including after
period changes. Reloading checks the renderer again. Automatic hiding invalidates
cached shadows and refreshes the walking obstacle index, so hidden trunks do not
block movement. The check lives outside the model-building imports and applies
after either aerial loading path. No geometry or generated models were changed;
the existing compiled fingerprint remains current. Unity and Blender exports
are unchanged, as is the interior game's tree default.

Validation: the full browser suite and the dedicated graphics checks pass.
Browser checks use real SwiftShader rendering for source/compiled aerial and
walking pages, plus simulated GPU and restricted-information responses. They
cover startup visibility, period changes, manual overrides, shadows, obstacle
refresh and reloads. Aerial hidden/shown and walking screenshots were visually
inspected. Source/compiled rendering comparisons, full detail and model-load
fallback checks and every timeline stop pass. Validation artifacts use
Browser/artifacts/tree-rendering-.

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

The crosshair button beside **Locations** requests the device's current location. Inside the estate or within 100 m of its outer edge, it places a red pillar of light with a pin at its base and centres the aerial view there. Farther away it shows “This only works near the West Cheshire Hospital site”. The button also explains denied permissions, unavailable location and timeouts, and can be pressed again to refresh the fix.

Location requires HTTPS (or localhost for development) and browser permission. Each press requests a fresh, high-accuracy fix; coordinates remain in the page and are not saved or sent to a server. The reported device accuracy appears with the result. The pin remains visible across layout changes. This control appears only in aerial mode.

The perimeter in `Browser/dist/device-location.mjs` approximates the whole modelled estate, including the annexe and southern grounds, from the existing outer roads. The 100 m buffer is measured to the nearest perimeter segment, with all interior points accepted. Both the boundary and the existing `earth-registration.mjs` alignment are approximate, not surveyed. Run `node Browser/test-device-location.mjs` for distance, coordinate and permission/error checks.

The September 29 marker update adds a soft red glow and pale core rising at least 180 scene metres, fading towards the sky. The column stays vertical as the camera orbits and retains a minimum apparent width when zoomed out; the 42-pixel pin keeps the exact ground fix readable in plan views. Both render over trees and buildings, without depth writes, fog or lighting attenuation, and hide together when a fix is refreshed or fails. This is a runtime aerial overlay shared by source and compiled loading; estate models, Unity and Blender exports do not change and need no regeneration.

Validation: the full `npm test` suite passes, including device-location and aerial-controls checks. `Browser/artifacts/location-pillar-review.mjs` verifies a simulated fix beneath the front-lawn canopy with trees enabled in source and compiled scenes, plus mobile, plan, night, period changes and removal after an outside-site fix. The `location-pillar-*.png` captures were visually checked; the report records no browser errors.

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


## Southern estate drive / Parsons seamless junction — 24 September 2026

Joined the owner's three circled road ends with one local asphalt surface.
The through-road verge remains continuous, the two inside corners are rounded,
and pale kerbs follow exposed grass edges only. The junction and its borders
inherit the Southern estate drive's Historic/The Main visibility, so the
separate Parsons endpoint is retained outside those periods and layouts.
See Research/historic-roads/README.md for the reference and regeneration steps.

The period regression samples nearly the full six-unit carriageway through
both former gaps and across the Parsons mouth, before and after batching.
It also checks that the junction is absent when the drive is absent. Dedicated
historic-road and annexe-access tests pass. The full npm test suite and its
continuation pass 73 of 75 checks; the Jarman and Leighton/Newton protected
geometry fingerprints fail identically with the new junction excluded by an
in-memory module hook, confirming that both failures are independent.

Rebuilt the local aerial model. npm run test:compiled passes, including source
image comparison, full detail, fallback loading, every timeline stop, mobile
controls and walking collision refresh. Overhead and oblique source/compiled
junction previews were visually inspected. Evidence uses the
Browser/artifacts/southern-junction-* prefix. Browser sources and generated
aerial assets changed; Unity and Blender exports were not regenerated.

## Escape ending visibility on phones — 25 September 2026

Portrait escape cameras pull back to frame the estate, making the original
exponential fog almost opaque over the buildings. The menu, escape pan and
success background now share the quarter-density aerial rendering helper in
Browser/dist/game.mjs (.000475 during rendering). Both escape render paths use
it, including the frame when an exit is first triggered. The shared scene fog
is restored after each render so retrying keeps the arrival atmosphere.

The real game-loop checks pass for all five active exits, timing, skip, retry
and reduced motion. Real WebGL checks pass at 390 × 704, 360 × 780 and
1440 × 900, at 0/5/10 seconds with normal and reduced motion (18 combinations),
including skip and restoration of arrival fog on retry, with no page errors.
Fog opacity over sampled building points falls from as much as 99.7% to 30.9%.
Before/after phone and desktop captures were visually checked; evidence uses
Browser/artifacts/escape-fog-*. Only browser rendering changed; no models or
Unity/Blender exports were regenerated for this fix.
The full npm test run passes the game and escape-exterior checks, then stops
at the previously documented test-jarman.mjs protected-geometry fingerprint
failure; its log is Browser/artifacts/escape-fog-suite.log.

### Aerial action order and spacing — 25 September 2026

The aerial action row now groups the crosshairs/location button, day/night
mode, Locations and Reset in that order with a shared 8 px gap. On phones the
row sits below Back to intro and the Locations menu opens below it. At widths
up to 350 px the day/night glyph cells narrow so all four actions still fit.

Validation: aerial controls, device location and day/night checks pass. Chrome
checks confirm the order, alignment, viewport bounds and exact 8 px gaps at
320, 350, 351, 390, 650, 651 and 1200 px, with working menu, keyboard toggling
and Reset. Desktop and 320 px screenshots were visually checked. The full
npm test run stopped at the previously documented test-jarman.mjs protected
geometry snapshot failure; its log is Browser/artifacts/aerial-button-order-suite.log.
This change updates browser markup/styles only; model sources and exports
were not changed.

## Random window lighting at night — 25 September 2026

Aerial and walking night modes now illuminate a random one-in-fifteen sample
of the windows in currently visible buildings (rounded to the nearest whole
window). Each transition from day to night draws fresh random priorities;
camera movement and repeated calls to setNight(true) preserve that selection.
Period/layout changes reuse those priorities and select from the buildings
that are present. Daylight clears the selection and restores ordinary glazing.

The panes use the street-lamp diffuser colour (0xffd28e) and emissive intensity
3, without adding point lights to the existing eight-light budget. Window IDs
are assigned before batching and carried through detailed glass, distant
window atlases and compiled scenes. A separate atlas glass mask keeps frames,
sills and sash bars unlit. Older opaque glass materials receive explicit tags;
roof glazing and masonry are excluded. The binary reader/writer now preserves
custom per-instance attributes alongside the existing vertex attributes.

Validation: the focused day/night, building-detail and binary tests pass,
including selection density, reshuffling, daylight restoration, individual
proxy identities and the unlit frame mask. Source/compiled night previews,
all periods, camera stability, desktop/mobile walking and keyboard controls
were checked. The UI section passed again after concurrent navigation edits;
the separate night building-selection check also passes. Rebuilt the local
aerial asset, and npm run test:compiled passes its image, full-detail, fallback,
timeline and walking-collision checks. Source and compiled overviews and a
close window view were visually inspected.

The full npm test suite and every check after its first failure were run:
73 of 75 pass. Jarman and Leighton/Newton fingerprints exactly match the
previously recorded failures in day-night-baseline.txt. Logs use
Browser/artifacts/window-lights-*, with previews in day-night-*-windows.png
and the day-night night/mobile/walking captures. Browser sources and the local
compiled aerial model changed; Unity and Blender exports were not regenerated.

## Oak24 annexe roof clearance - 25 September 2026

Reduced the owner's circled Oak24 uniformly to 55% of its original size through
its existing height/radius placement data. Its KML root coordinates, ground
height, seeded rotation and shared geometry are unchanged, as are all other
trees. The final nominal dimensions are 12.1 units high and 5.5 units crown
radius. See Research/kml-trees/README.md and its marked screenshot.

The placement and aerial-performance checks pass. A focused comparison with
HEAD verifies that only Oak24's height/radius changed, and 263,307 conservative
branch/foliage bound comparisons across all detail levels clear the eleven
nearby roofs. The local compiled aerial model was rebuilt, and the source and
compiled annexe previews were visually inspected with no browser errors.

The full npm test suite and its continuation pass 73 of 75 checks. The existing
Jarman and Leighton/Newton protected-geometry snapshot failures reproduce with
Oak24's original scale restored in memory, with identical failing fingerprints.
Validation logs and previews use Browser/artifacts/annexe-tree-roof-*.
Browser source and local compiled assets are updated; Unity and Blender exports
were not regenerated.

npm run test:compiled passes, including source/compiled image comparison,
model fallback cases, every timeline stop and walking collision refresh.

## Guard silhouette and uniform refinement (September 25)

The browser guard's rounded head/jaw, shoulder balls, tubular clothing and
mitten hands have been replaced with shaped cross-section meshes. The head
now has a continuous jaw/cheek/forehead outline, recessed small eyes and lids,
nose planes and sparse facial creases. The uniform has sloping shoulders,
a fitted chest/waist, shaped sleeves and trouser legs, pointed collar/pocket
flaps, a tapered tie and subdued cloth seams. Separate fingers, boot toe caps
and crossed laces, a structured peaked cap, badge inset, radio cable, buckle
pin and belt torch improve close views. The existing displacement-driven
patrol/chase animation and two-bone leg solve are retained.

GitHub candidates and verified MIT licence findings are recorded in
[Research/security-guard/README.md](Research/security-guard/README.md).
Two MIT character-authoring/base-mesh candidates were found, but neither was
a ready-made guard. The game continues to use original procedural geometry;
no external model, code, texture or animation was imported.

The model measures 66 batched meshes and 10,602 triangles in the geometry
check; browser lettering adds one mesh and four triangles. No extra runtime
lights or downloads are needed. This changes browser source only. Unity,
Blender and interchange exports were not regenerated. The aerial compiled
binary excludes the game guard, so no aerial model rebuild is required.

Validation:
- Guard geometry, patrol/chase foot contact, alternate steps, stationary
  settle, frame-rate independence and reset pass.
- The real game integration checks pass, including hold-E, help/artwork
  freezes, upstairs visibility, capture, cutscenes and restart.
- The WebGL review passes for front/side/back, upstairs, mobile and live
  pursuit, with no page or Three.js errors. The final images were visually
  inspected, including the corrected collar placement.
- The visual-check script adds a focused three-quarter standing screenshot,
  Browser/artifacts/security-guard-detail.png. Screenshot outputs are replaced
  atomically so Windows preview readers do not block an overwrite.
- All 75 tests in the npm test sequence were attempted: 73 pass.
  The sequence stops at test-jarman.mjs, so the remaining tests were run
  separately. test-leighton-newton.mjs also fails. Both failures are existing
  protected-building snapshot mismatches (each has 74 fewer primitives than
  its stored baseline); their 128-file import dependency union contains no
  modified files and does not import security-guard.mjs. Baselines were not
  changed as part of this character update.

## Protected-estate snapshot repair - 25 September 2026

The Jarman and Leighton/Newton checks retained expectations from before the
approved west landscaping cleanup and raised-lawn removal. Restoring only
escape-exterior.mjs, west-court-photo-detail.mjs, west-front-photo-detail.mjs,
west-refinement.mjs and entrance-walks.mjs from commit
4752500a5635d0f01d964d4e31864705514eac30 through an in-memory module loader
reproduces both saved fingerprints exactly with all other current sources.
The landscaping changes are documented above and in Research/west/README.md.

The net decrease is 74 primitives in each protected scope: two lawn panels,
36 planter parts, 25 long-border parts, ten railing parts and two hedges were
removed, and one garden return path was added. The existing west entrance
path was also extended without changing its primitive count. Refreshed only
the two geometry snapshots, to 859,427 Jarman and 923,474 Leighton/Newton
primitives. The exact hash comparisons and all architecture, placement,
glazing and collision assertions remain active.

This repair changes test expectations and documentation only. Browser model
sources and compiled assets were not changed or regenerated; Unity and
Blender exports were not changed.

Validation: all 75 scripts in the complete Browser npm test sequence pass,
including both repaired snapshot checks. git diff --check passes. Full output
is saved in Browser/artifacts/test-snapshot-repair-suite.log. No rendering
changes were made by this repair, so no model rebuild or visual rerun was needed.

## Pages compiled-scene screenshot timeout (September 25)

The 120-second navigation setting did not cover screenshot capture, which
still used Playwright's 30-second general default. Both compiled-scene
browser scripts now also set the general timeout to 120 seconds before
loading a page. This covers source/compiled comparisons, timeline and mobile
screenshots, and browser interactions under software WebGL. Navigation and
rendered-frame readiness keep their existing 120-second limits; all geometry,
image comparison, control and fallback assertions remain enabled.

Validation: npm test and npm run test:compiled pass locally with Node.js 24
and Chrome; the compiled checks use software WebGL. A controlled screenshot
experiment held font readiness for 35 seconds: the navigation-only setting
failed at 30.01 seconds, while the added general timeout captured the image
at 35.02 seconds. Logs are Browser/artifacts/ci-screenshot-timeout-suite.log,
ci-screenshot-timeout-compiled.log and ci-screenshot-timeout-delayed.log.

Only validation scripts and documentation changed. The existing compiled
asset matched the current source fingerprint; no model rebuild was needed.
Browser runtime, model sources and Unity/Blender exports were unchanged.

## Churton/Kelsall junction tree relocation - 25 September 2026

Moved the blue-circled small broadleaf beside Parsons Lane from x=-90, z=-44
to the blue-X lawn at x=-82, z=-54. Its 1.1 size, trunk height, seeded crown
shapes and generation order remain unchanged. Source placement generates the
trunk and all five batched crowns together; walking collision uses the new
root and the old position is clear. See Research/churton-kelsall/README.md
and tree-move-marked.png for the screenshot-based placement reference.

The isolated before/after comparison verifies all 1,486,201 other primitives
are exact. It also verifies unchanged crown shapes, the old/new collision
positions and hidden-tree collision removal. Refreshed the Jarman and
Leighton/Newton full-estate fingerprints only after reproducing their saved
before states; primitive counts are unchanged by this tree move. The existing
Redesmere garden tree-toggle check now probes the new position and explicitly
checks that the old position is clear.

Browser source and the local compiled aerial model were updated. Source and
compiled close previews were visually inspected; Unity and Blender exports
were not regenerated. Evidence uses Browser/artifacts/churton-tree-*.

## West-side gravel extension (25 September 2026)

Extended the west path beside 1829 along the user's red guide to Parsons Lane.
The court, apron and outer garden return now form one gravel surface, and the
doorway approach and garden-side walk use its colour. The former overlapping
court and apron slabs are removed. See `Research/west/README.md` and its saved
annotation for the geometry and reference.

The source and locally rebuilt compiled views were visually checked. West-wing,
exterior, walking, player-width path continuity, source/compiled image matching,
full-detail loading, model fallbacks and every timeline stop pass. The compiled
source fingerprint was verified current. The full browser suite reaches the
Jarman whole-estate preservation snapshot, whose stored ground geometry differs
from the current landscaping. Its baseline was not changed for this task.
Validation files use `Browser/artifacts/west-path-`.
Browser sources and local generated model updated; Unity and Blender exports
were not regenerated.

The suite was continued after Jarman: 31 of 32 remaining checks pass. The other
failure is Leighton/Newton's whole-estate preservation snapshot, which also
includes the edited grounds and concurrent scene changes. Both snapshot files
were left untouched by this task; all focused path and browser-rendering checks
pass. The final local compiled fingerprint remains current.

## Churton paving corner and ghost seam - 25 September 2026

Trimmed the blue-marked corner to the church-facing lawn and replaced the
three overlapping perimeter/access slabs with one flat gravel surface. The
lawn now reaches the same edge, with the concealed paving cut back to avoid
a fine pale sliver. The long red-circled seam is gone. Reference and geometry
notes are in Research/churton-kelsall/README.md.

Churton's geometry, six walking viewpoints, collisions, windows and roof checks
pass. Source and rebuilt compiled close views were inspected; both show the
clean corner and continuous paving, with no browser errors. The compiled
source fingerprint matched the current source. An in-memory before/after
comparison verifies every estate primitive outside the four edited ground
meshes is unchanged by this correction; merging the slabs removes two meshes.

The full npm test sequence was attempted. Its initial tree-visibility failure
came from the concurrently relocated roadside tree; that test was subsequently
updated by the tree task. Later full-suite attempts were interrupted. A focused
rerun confirms the Jarman estate snapshot differs (859,422 current primitives
versus 859,427 saved); restoring only the original Churton paving still differs
at 859,424, so concurrent landscaping also contributes. The Jarman and Leighton/
Newton saved snapshots were left unchanged by this task. Evidence and preview
files use Browser/artifacts/churton-paving-*.

Browser source and the local compiled aerial model are updated. Unity and
Blender exports were not regenerated.

The final compiled/source browser validation passes, including image matching,
full-detail loading, layout/tree controls, camera movement and model fallbacks.
The delivered compiled fingerprint was checked again after validation and is
current. Its log is Browser/artifacts/churton-paving-compiled-final.log.
The final timeline browser validation also passes every period in source and
compiled views, navigation, tree focus, mobile reset and live walking collision
refresh (Browser/artifacts/churton-paving-timeline-final.log).


## Continuous chimney-yard paving (September 25)

Extended the existing Tower service court polygon in
Browser/dist/historic-road-layout.mjs to cover the entire blue-circled yard:
the chimney base, cylinder court, gaps beside the service buildings, and the
strip along Main/admin. The perimeter meets the Farndon/Irby corridor faces
and follows Main/admin's stepped rear walls. The same grey asphalt material
and ground height join the existing approach; exterior lawns are retained.
See Research/tower-buildings/README.md and chimney-yard-paving-reference.png.

This changes a ground surface at scene construction. Building transforms,
walking obstacles and runtime visibility behavior are unchanged. The paving
retains The Main's existing Historic timeline ownership. Browser source and
the local compiled aerial asset include the change; Unity and Blender
exports are unchanged.

Validation: historic-roads, tower-buildings and pharmacy checks pass, covering
surface normals/heights, adjoining road clearance, historical visibility,
chimney/building clearance and walking routes. Source and compiled yard views
were visually checked, with no grass remaining inside the marked enclosure.
The complete source-versus-compiled browser comparison passes, including
image similarity, exact draw counts, controls and asset fallbacks. Evidence
uses Browser/artifacts/chimney-paving-*.

The initial npm test attempt encountered an unrelated Redesmere tree-collision
assertion; all 65 later commands were run separately, with 63 passing and the
Jarman/Leighton protected-geometry snapshots failing. Loading the original
courtyard definition reproduces those failures. Other modelling tasks were
editing the shared project during validation. Later full-suite and timeline
browser reruns were interrupted; they are not recorded as complete passes.

Final validation for the tree relocation: all 77 commands in the Browser
npm test sequence were attempted (27 before interruption, then 50 resumed).
75 pass. The Jarman and Leighton/Newton saved-geometry checks fail after
concurrent paving/stair edits changed their protected surroundings; the tree
move itself preserved both primitive counts and passed its isolated check.
The existing tree-visibility/collision, walking, layout, KML and performance
checks pass. Source/compiled browser comparison passes, including shadows,
image similarity, draw counts, controls and fallback cases. A subsequent
timeline run fell back to source because concurrent modelling changed the
asset fingerprint, so the full timeline run is not recorded as a pass.
Logs and per-command results are in Browser/artifacts/churton-tree-*.

## Continuous central roof trim and mitred frontage (25 September 2026)

Extended the four pale cornice/parapet layers from the rear of Reception
around both shoulders and along both side roof edges to the front pediment.
Each layer is a continuous mitred strip, with its inner side seated on the
central wall. The roof, chimney stacks, heraldry and existing profile heights
are retained. See Research/1829-back/README.md and the saved marked image.

Replaced the separate overlapping entrance cornice bars with joined offset
outlines. Their corners share mitres at the frontage step and the courtyard
return, removing the clipped pointed ends. The thin sloping coping also uses
shared mitred endpoints around the courtyard bends. The west builder supplies
the mirrored east trim. See Research/front-inside-corners/README.md.

Browser geometry and the local compiled aerial model are updated; Unity and
Blender exports were not regenerated. This is construction-time geometry, with
no changes to runtime layout or tree visibility. Evidence and previews use
Browser/artifacts/front-trim-*.

Validation: exterior, roof-contact and inside-corner checks pass, including
slate coverage, exposed windows, courtyard clearance and walking routes.
The complete npm test sequence was attempted, continuing after its Jarman
snapshot stop; only Jarman and Leighton/Newton fail. Loading all three original
model files from HEAD in memory also fails both saved-estate snapshots, at
859,428/923,475 primitives versus the saved 859,427/923,474. The trim consolidation
removes eight primitives, leaving 859,420/923,467. Saved snapshots were not
changed. The source/compiled browser comparison passes, including image
similarity, full-detail loading, controls and missing/incompatible/corrupt asset
fallbacks. The final source centre and both mirrored entrance joins were
visually inspected.

Final compiled validation passes every timeline stop, mobile reset, selection,
URL navigation and live walking collision refresh. The rebuilt central roof
and both mirrored corner views were visually checked. All 77 standard checks
were run: 75 pass and the two saved-estate snapshots above fail. The delivered
compiled fingerprint matches the current source. Shared browser-test evidence
was saved under Browser/artifacts/front-trim-validation/.

## Courtyard roof-tip follow-up (25 September 2026)

The latest marked view exposed two slate tips beyond the front inside-corner
walls and a raised end on the entrance cornice. The roof cut now extends its
open ends through the overhangs, while the wall cut and walking footprints
retain their original outline. The lower coping reaches the wing eaves.

The four entrance trim layers now share a swept profile with a short height
transition from the recessed facade. Both return heights are sampled from
the supporting slate; the court-side end meets the existing sloping coping.
Its overlapping first coping segment is omitted. Both front corners use the
same reflected geometry. See Research/front-inside-corners/README.md and
roof-tips-marked.png. Browser sources and the local compiled model were updated;
Unity and Blender exports were not regenerated.

The focused inside-corner check covers the two former slate tips, adjoining
retained roof, and the formerly raised trim end. Loading the saved before files
reproduces the new height assertion failure; the corrected geometry passes.
Exterior and walking checks also pass. Source and compiled close views of both
corners were visually reviewed. Evidence uses Browser/artifacts/roof-junctions-*.

Final validation for the roof-tip follow-up: all 77 standard commands ran,
continuing after Jarman; 75 pass and the previously failing Jarman and
Leighton/Newton saved-estate snapshots still differ. No saved baselines were
changed. The complete compiled browser suite passes, including source/image
comparison, full-detail loading, fallback cases, every timeline stop, mobile
reset and walking collision refresh. The final source fingerprint matches the
local compiled model. Shared validation outputs were copied into
Browser/artifacts/roof-junctions-validation/; concurrent unrelated model edits
in the shared workspace were retained.

## Redesmere / Saughall and Barmere gallery additions — 25 September 2026

Added the supplied courtyard photographs to both galleries. The unchanged
originals are in Research/redesmere-saughall/; two 1200 × 900 WebP copies use
the existing photo-build settings and are registered in the build script and
source manifest. The supplied redesmere3.jpg is byte-identical to
Research/redesmere-chimney/img1.jpg, so its existing barmere-garden asset is
reused. Redesmere / Saughall now has three photographs; Barmere has four,
retaining its other existing chimney view without duplicating the garden photo.

Validation: npm run test:photos passes, including all 82 gallery entries,
source/compiled building selection, location aliases and mobile lightbox checks
(Browser/artifacts/redesmere-gallery-photos.log). The Redesmere, Saughall and
Barmere galleries decode every image and open without page errors; desktop
panels and the mobile portrait viewer were visually checked. Evidence uses
Browser/artifacts/redesmere-gallery-added.png, saughall-gallery-added.png,
barmere-gallery-added.png and redesmere-added-*.png.

The full npm test suite stops at the unrelated saved-geometry assertion in
Browser/test-jarman.mjs:11 (859,413 primitives versus the saved 859,427), the
same protected-surroundings check documented by earlier modelling changes.
See Browser/artifacts/redesmere-gallery-suite.log. No model geometry or
Unity/Blender exports changed, and no model rebuild was required.


## Redesmere wall overlap and garden gravel cleanup (25 September 2026)

Cut the service room's lower wall, white base and floor band back to their
join with the low brick end range, removing the coplanar surfaces that caused
the marked flicker. The upper service room and passage head remain in place.
Joined the east apron, garden cross-walk and passage into one level gravel
surface with a straight garden edge, and paved the small marked grass recess
against the forward wing. See Research/redesmere-garden/README.md and
cleanup-annotation.png for the owner reference and geometry bounds.

Focused checks sample the exposed brick to reject overlapping wall planes,
the filled recess and complete straight gravel edge, retained garden lawn,
and a player-width walking route through the cross-walk and passage.
Browser sources and the local compiled aerial model are updated; Unity and
Blender exports are unchanged. No runtime layout/visibility behavior changes.


Validation: the focused wall, surface and player-width route checks pass;
the saved before geometry fails both new wall and paving regressions. Source
and rebuilt compiled reference, wall and overhead views were visually checked.
The compiled suite passes rendering/image matching, exact draw counts, full
detail, controls, fallback cases, every historical period and live walking
collision refresh. The final compiled fingerprint matches the source.

All 77 standard browser commands ran: 75 pass. Jarman and
Leighton/Newton whole-estate snapshots already fail on the saved pre-edit
working tree (859,385/923,432 primitives versus saved 859,427/923,474). This
cleanup removes one net primitive; their baselines were left unchanged.
Evidence and preview files use Browser/artifacts/garden-cleanup-*.


## Redesmere-facing frontage and roof-access door � 25 September 2026

The owner's blue-marked recess is removed: the narrow wall beside the forward
wing now aligns with the bay frontage. Its three sash openings, white base,
floor courses, cornice and slate roof follow the new plane. Only the garden
side is filled; the earlier rear courtyard recess remains open.

The red/yellow area gains the photographed blank two-storey projection,
level grey roof, pale coping and narrow glazed upper door opening directly
onto it. Its front aligns with the square pavilion. The neighbouring middle
window is broadened and the entrance and upper sash shift left to clear it.
See Research/redesmere-frontage/README.md and the three saved owner images.

The shared browser source is updated. The local aerial model is rebuilt
separately; Unity and Blender exports are unchanged. Focused checks verify
wall alignment, exposed glazing, slate coverage and normals, roof level,
door threshold and walking clearances. Preview evidence uses
Browser/artifacts/redesmere-frontage-*.

Validation: the focused checks and rebuilt compiled browser suite pass,
including source/compiled image comparison, full-detail loading, fallback
cases, every historical period and live walking-collision refresh. Final
source and compiled reference, detail and overhead views were inspected.

The two whole-estate snapshots initially flagged the intended facade edit.
Both pass on the saved pre-edit model. A separate exact comparison verifies
that all 1,485,398 primitives outside x=40�64, z=3�26 remain unchanged; the
marked region changes from 760 to 786 primitives. Only after that comparison
were the Jarman and Leighton/Newton stored geometry hashes refreshed, keeping
their range data and every test assertion intact. The before sources, hashes
and comparison helper are saved with the frontage evidence.

All 77 standard check commands pass across the initial suite, its remaining
commands and the two refreshed-snapshot rechecks. The final compiled source
fingerprint matches the delivered browser source. Validation logs and scope
comparison JSON use Browser/artifacts/redesmere-frontage-*.

## Main/admin road extended beneath the frontage (26 September 2026)

Added one junction-layer asphalt apron in
`Browser/dist/historic-road-layout.mjs` across the grass strip in front of
Main/admin. It overlaps beneath the recessed wall and both projecting bays,
covering the old kerb where it joins the existing road. The road centrelines,
outer verge, semicircular island and building geometry retain their positions.
The surface uses the existing The Main visibility group and remains below
walking collision height. See the [frontage reference notes](Research/historic-roads/README.md#mainadmin-frontage-paving--26-september-2026).

Source frontage and plan views were visually checked. Thirteen surface probes
across the former grass strip now reach asphalt; historic-road and admin
teardrop checks pass. Evidence uses `Browser/artifacts/admin-frontage-paving-*`.

The complete `npm test` suite passes. The local aerial model was rebuilt, and
its frontage and plan previews were checked with all thirteen former-grass
surface probes also passing in compiled mode. Unity and Blender exports were
not regenerated.

The source/compiled rendering comparison, full-detail rendering, fallback
loading and all timeline/walking checks pass. Concurrent lamp-placement work
changed the shared source during validation; the local model was refreshed
again afterward, with a separate final compiled frontage capture. The road
change does not modify lamp or lighting sources.

## Main/admin lamps at the road edge (26 September 2026)

Moved the three purple-circled teardrop-road lamps to the grass-side edges
nearest the owner's marked positions, following the clarification that the
posts should stand right beside the road. The whole concrete footprint clears
the kerb by about 8 cm. Both island posts use the raised lawn height; the outer
post uses the terrain height. Their feet extend 3 cm into the ground. A local
column material depth bias prevents the junction surfaces from visually
clipping the lower shaft. Night lighting follows the per-fixture base height.

The update happens before instancing and walking collision extraction, retaining
the road's period visibility, the fixture count and the other lamp placements.
Browser sources and the local generated aerial model are updated; Unity and
Blender exports were not regenerated. Placement notes and the supplied reference
are in Research/street-lamps.md.

Validation: npm test and the focused day/night, teardrop and walking checks pass.
Source and compiled day/night previews were visually inspected. All twelve
base corners touch grass with 3 cm of overlap in both loading paths; all three
shaft collisions and their night-light positions are verified. Evidence and
previews use Browser/artifacts/admin-lamps-final-{source,compiled}-*.
The complete npm run test:compiled checks also pass, including rendering
comparison, every timeline stop and live walking collision refresh.

## Rear roof-edge texture glitch (27 September 2026)

Raised the shared rear stair-section cornice by 0.04 scene units so its top
clears the brick wall instead of occupying the same plane. The pale trim now
renders cleanly in the owner's marked east rear-court view. The same helper
supplies the mirrored west wing; roof slopes, wall heights, window schedules
and walking footprints are retained. See Research/1829-back/README.md.

The exterior check now probes both cornices beneath the slate overhang and
requires pale trim with positive masonry clearance. The saved original roof
fails that new regression; the corrected exterior and existing roof-contact
checks pass. Source and rebuilt compiled rear/detail views were inspected.
The complete compiled suite passes source/image and draw-count comparison,
full detail, fallback loading, all historical periods and live walking refresh.

The standard browser suite and its continuation ran every listed command.
Four checks fail outside this change: Jarman and Leighton/Newton whole-estate
snapshots also fail on the saved pre-edit state; the two KML checks see the
concurrently added walkSurfaces property on otherwise empty obstacle arrays
and also fail when loading the original roof helper. The initial walking-route
failure passes on recheck after concurrent walking edits. Those sources and
baselines are left to their ongoing work. Evidence uses
Browser/artifacts/rear-roof-glitch-*.

Browser modelling source and the local generated aerial model are updated;
Unity and Blender exports are unchanged. Concurrent shared-source edits
required a final model refresh after the compiled suite.

## Front semi-basement validation status (27 September 2026)

The full browser suite and continuation completed. The two KML checks initially
rejected enumerable height metadata on otherwise empty obstacle arrays; that
regression is fixed by non-enumerable metadata, and both KML checks pass on
recheck. The focused front, corner, central-stair, walking and input checks pass.
Jarman and Leighton/Newton whole-estate fingerprints remain different from their
saved snapshots. Those global baselines were not overwritten while other chats
were changing the rear roof, west basement and courtyard geometry.

The front was visually checked in both procedural and rebuilt compiled form,
including the corrected outer stair direction and six risers. Model builds
succeeded, but repeated full compiled-suite attempts were rejected by source
fingerprint changes from concurrent work. Thus the final complete compiled
suite is unverified; the development server falls back to current source when
the shared manifest becomes stale. See Browser/artifacts/front-basement-build.log,
front-basement-compiled.log, front-basement-suite.log and the continuation report.

## West side semi-basement and courtyard level (27 September 2026)

Added the owner's marked stairs and sunken passage beside the rearward west
wing. The follow-up annotation turns the six-tread descent across the passage
from the lawn, directly towards a blue doorway on the glazed gallery's side.
There is no added doorway beside the lean-to. The upper corner gap is filled
with masonry shaped beneath the existing roofs and a narrow slate join.

The final colour and level correction matches the exposed gallery foundation
and retaining walls to the gallery's existing brick material colour and map.
The main-arm foundations match their adjoining brickwork. The courtyard and
stair approach now sit at the lawn level, with only a 0.005 surface separation
for rendering. The coping is 0.32 above that grade. A gentle transition beyond
the courtyard joins the retained southern apron, with no step at the marked
lawn boundary. The lower passage follows the front semi-basement floor level.

The shared browser model cuts the terrain, older underlying access surface,
rear approach and visible courtyard around the excavation. Walking follows
the stair treads and lower passage, with collisions at the retaining walls
and closed doorway. Existing layout callbacks continue to refresh obstacles
and invalidate shadows; hiding both layouts restores lawn over the excavation.
See Research/west/README.md and its three owner annotations for the modelling
reference, final coordinates and superseded first interpretation.

The focused west-side check verifies exposed treads, player-width access in
both directions, door placement and threshold, the filled upper corner,
matching brick colour/texture, level lawn/paving in both layouts and hidden
estate behavior. Exterior, west-refinement, front-corner, roof-contact, walking
and modern-entrance checks also pass. Source and generated-model previews use
Browser/artifacts/west-basement-*. Browser modelling sources and the local
compiled aerial model are updated; Blender and Unity exports are unchanged.

Final west-side validation: the complete compiled browser suite passes,
including source/render comparison, full-detail loading, fallback handling,
every timeline stop and live walking collision refresh. The final source and
compiled reference, stairs, door, passage and upper-junction views were
visually checked. The preview also probes all six stair heights, the lower
floor and the matching court/lawn heights in the rendered batched models.
The generated model's source fingerprint matches the current browser source.

The standard npm test run, focused recheck and continuation cover every listed
command. All pass except the Jarman and Leighton/Newton saved whole-estate
geometry comparisons, which also failed before this west-side work; their
baselines were not changed. The earlier front-corner and KML failures pass on
the final shared working tree. See west-basement-suite-final.log,
west-basement-remaining-final.log, west-basement-baseline-jarman.log,
west-basement-baseline-leighton.log and west-basement-compiled-final.log in
Browser/artifacts/. Concurrent front-basement and other model edits were
preserved throughout this change.

## Front west E-shaped garden wing (27 September 2026)

The owner's red outline places the E on the front west side, left of Reception.
The mistaken rear/east change was undone first. The outer pavilion now projects
forward to z=29.5, and a short stem brings the retained middle canted bay to
z=25.8. The existing long forward wing and glazed extension retain their geometry.
See Research/west/README.md and its saved annotation and aerial reference for
the estimated plan dimensions.

The front windows and trim follow the extended pavilion; its fire escape and
doors turn together onto the inner return. Both extended arms have continuous
slate roofs. The canted-bay helper permits a caller-supplied roof while retaining
its existing default for all other bays. Building-time geometry continues to
supply walking collisions through the existing obstacle builder.

The focused west and exterior checks cover exposed glazing, roof coverage,
the three arm lengths, both open recesses, stair placement and walking access.
Procedural overhead, oblique and ground-level views were inspected. A before/
after geometry/material/transform fingerprint matches for 1,484,872 protected
primitives covering the east side, rear ranges, Reception and the long forward
wing. Browser/artifacts/west-front-e-audit.mjs records that comparison.
Browser sources and the local compiled aerial model are updated; Unity and
Blender exports are unchanged.

The owner's subsequent four-colour alignment shortens the outer arm from
z=29.5 to 26.5, and the canted bay front from z=25.8 to 23.8 (root z=21).
These are the final front extents, superseding the initial E dimensions above.
Widths and heights are retained. The walking test now stops at the revised
pavilion plane; open-ground checks also cover the cleared former arm ends.

The final face-width reference narrows the yellow outer face from 13 to 8
units with its outside wall fixed, shifts the unchanged canted bay to x=-52.5,
and gives the purple/green recesses 8.4 units each. Windows, doorway, trim,
pipes and stair follow their respective walls. The widened left recess is
closed and roofed back to the existing cross range. The prior front-depth
alignment and wall heights are retained. The updated protected-region audit
excludes the intentionally moved recess glazing while retaining the entire
long forward wing, its flank windows and lean-to; all 1,484,692 protected
primitive records match exactly. The saved width references and latest
coordinates are documented in Research/west/README.md.

The blue central flat face narrows to 2.3 units within the existing 6.2-unit
bay root. The three-storey glazing, bands, canted masonry, slate roof and
collision outline share that profile. The east bay's former proportions
remain explicit in its regression check, independently of this west photo.

Final roof-junction correction: after the bay moves sideways, its branch
ridge meets the retained cross-range ridge at x=-50.76. The rear edge is
buried in that roof rather than terminating above its slope. The focused
roof test verifies coverage of every rear-edge vertex, preventing an open
seam when viewed from behind or above.

Final validation passes for the west/front geometry, exposed glazing, roof
contacts, closed branch junction and walking behaviour. The final npm test
run and continuation cover the complete browser suite: all checks pass except
the existing Jarman and Leighton/Newton whole-estate fingerprint comparisons.
Their saved baselines were not changed. The final compiled suite passes source/
render comparison, full detail, fallback handling, all timeline stops and live
walking collision refresh. Source and rebuilt overhead, oblique and reference
views were visually checked after the roof-junction correction.

Final logs use Browser/artifacts/west-front-e-width-final-*. The final previews
are west-front-e-source-* and west-front-e-compiled-*; reference.png shows all
four marked faces from the garden. The generated browser model is current.
Blender and Unity exports were not regenerated.

## Shared aerial and walking interface style (28 September 2026)

`Browser/dist/view-ui.css` applies the time-of-day control's dark green surface,
fine border and 4 px outer / 2 px inset corners to the navigation, timeline,
location menu/status, walking guide and direction pad, building photos and
photo viewer. Hover, selected and keyboard-focus states remain visible. The
stylesheet is loaded only by aerial and explore pages.

The aerial action group puts the location crosshairs before day/dusk/night,
Locations and Reset in both markup and visual order. On phones the group sits
below Back; at 430 px and below, Locations/Reset wrap to another row to retain
44 px lighting targets. Shared navigation offsets keep menus and panels below
the controls. Timeline arrows also have 44 px targets.

Validation: the complete `npm test` run and continuation cover all 79 commands;
77 pass, with only the previously documented Jarman and Leighton/Newton
whole-estate geometry snapshots failing. The existing mobile browser check
passes touch movement, simultaneous look, cancellation, timeline/navigation
and desktop keyboard/drag. The interface browser check covers both views at
320, 390, 430, 431, 650 and 1200 px, plus 568/844 px landscape, with screenshots,
button order, viewport bounds, reachability, menus, keyboard lighting, Reset
and photo panels. Evidence uses `Browser/artifacts/view-ui-*`.

This change updates browser interface markup/styles only. No model sources,
compiled models, Unity exports or Blender exports were changed for this work.

## West courtyard terrain flicker and overlap audit (28 September 2026)

Removed the terrain beneath the lowered west courtyard, its road link,
southern transition and stair approach. The former 5 mm gap was too small
for distant depth-buffer precision, visibly producing grass stripes through
the gravel. A single joined cut avoids touching triangulation holes. Paving
levels and walking geometry are unchanged. The existing layout fill restores
the whole cut when both layouts are hidden; a separate grass patch, using the
same material and projection as the terrain, restores the later courtyard
before 1849. Its visibility survives model serialization and is refreshed by
the timeline and layout controllers, which already invalidate shadows.

The focused regression fails against the original overlapping terrain and
passes after the fix. It covers the court, road link, sloped transition,
stair mouth, retained surrounding lawn, both layouts, hidden estate and the
1829/1849/2021 transitions. Existing exterior, west, front-basement, walking,
path and all 13-period checks also pass. Before/after distant views show the
stripes removed without raising the courtyard or changing the stairs.

The requested wider audit examines upward triangles, including instances,
within 2.5 cm of the flat terrain, sampling their clipped polygons and checking
exposure in Historic, Modern, both/hidden layouts and representative years.
It found no other paving conflicts. The distant meadow's shallow inner join
is an intentional grass overlay; local polygon offset gives it stable depth
priority without altering the scenic geometry or walking boundaries.

The full npm test run and continuation cover all configured checks. Only the
previously documented Jarman and Leighton/Newton whole-estate snapshots fail;
their stored baselines are not rebased for this correction. Validation logs
and before/after/source/compiled images use Browser/artifacts/west-court-flicker-*;
the wider findings are in Browser/artifacts/terrain-overlap-audit.json.

Browser modelling sources and the local generated aerial model are updated.
The meadow adjustment is runtime-only. Unity and Blender exports are unchanged.
Concurrent ground-material edits in the shared checkout were preserved.

Final validation: the complete compiled suite passes source/render comparison,
full-detail loading, fallback handling, every timeline stop, mobile controls
and live walking collision refresh. The final source and compiled courtyard,
stair and meadow-join captures were visually inspected; all surface probes
pass. The generated model's source fingerprint matches the current checkout.
The two whole-estate snapshot failures also reproduce with this courtyard
fix removed by the scoped baseline loader. The completed overlap audit covers
all 13 timeline years, in addition to the four layout combinations.
See Browser/artifacts/west-court-flicker-final.json for final status.

## Mobile title-screen button placement (29 September 2026)

The mobile menu uses a vertical flex layout with automatic space above its
action group, placing the three buttons near the bottom above Credits/Readme.
This reveals more of the central entrance and steps. The buttons retain their
48 px touch targets and remain in document flow so short screens can scroll.
At 390 × 704 the action group moves down by approximately 98 px. The desktop
layout is unchanged.

Validation: `node test-landing-mobile.mjs` passes all five viewport sizes,
loading/failure states and the live scene. Mobile, small-screen and desktop
screenshots were visually reviewed, with additional tall-phone and short
landscape checks. Evidence is saved under `Browser/artifacts/mobile-buttons-*`.
The full `npm test` run and continuation cover every configured check; only the
previously documented Jarman and Leighton/Newton geometry snapshots fail.
Only browser CSS changes; no models or exports require regeneration.

## Hospital Shop garden lamp (29 September 2026)

Moved the slender steel lamp from (102, 39) to (98.75, 39), matching the owner's
red X on the lawn beyond the shop-side path. The post, arm and head translate
together in the shared exterior builder before batching; height, bearing and
period ownership are retained. Placement notes are in Research/laundry/README.md.
The browser source and local generated aerial model are updated; Unity and
Blender exports were not regenerated. Source and compiled close-up previews
were visually checked against the supplied screenshot.

The existing Hospital Shop and Redesmere checks pass, including the open garden
path and layout-dependent walking collisions. Suite, build and compiled logs
use Browser/artifacts/shop-lamp-*.log.

The complete compiled suite passes rendering comparison, full-detail loading,
fallbacks, every timeline stop and live walking collision refresh. The wider
suite's Jarman and Leighton/Newton whole-estate snapshot failures also reproduce
with this lamp move reverted in memory; their stored baselines are unchanged.
All other checks in the suite and its continuation pass.
Concurrent tree edits arrived after the full suite; the model was rebuilt again
and the final compiled Hospital Shop preview passed with the new lamp position.

## Front basement window flicker (29 September 2026)

The blue-circled window above the outer basement stair exposed coincident brown
retaining masonry and white facade faces at z=19.7, y=0–0.17. Both mirrored
stair backings now have a separate lower foundation and an upper face recessed
0.03 units behind the facade. The lower face remains at the excavation boundary,
so no ground edge shows through. Window, coping and tread positions are retained.
See Research/front-basement/README.md and its supplied screenshot.

The front-basement regression probes both facade joins and terrain concealment;
the original geometry fails and the correction passes. Front-corner and exterior
checks pass. Source and compiled close/oblique views are visually clean, and
npm run test:compiled passes, including timeline and walking refresh coverage.
The rebuilt manifest matches the current source. Evidence is under
Browser/artifacts/front-sill-*.

npm test encountered a shared estate snapshot mismatch during concurrent model
work. The continuation passes both subsequently refreshed ward snapshots and
32 of its 33 checks. Its remaining test-aerial-layouts.mjs failure is the road
normal assertion, reproduced with the original front-basement module restored
by a test loader; it is independent of this repair. Existing unrelated changes
and their snapshot files were not edited by this task.

Browser source and the local compiled aerial model are updated. Unity, Blender
and packaged desktop exports were not regenerated.

## Mortuary lower-course flicker (29 September 2026)

The T-shaped mortuary's full-height wall overlapped its flush dark plinth on
all eight exterior segments. The upper wall now begins at y=0.23, exactly
where the base ends. This removes the coincident visible faces while retaining
the original footprint, height, materials, world UV projection and collisions.
The supplied screenshot and modelling notes are in Research/garages/README.md.

The focused regression probes each segment at six heights and three positions;
it detects the original overlap and passes after the correction. Mortuary roof,
openings, clearance, layout and walking checks pass. Source, rebuilt compiled
and walking previews were visually reviewed, including close and oblique base
views. Evidence is saved under Browser/artifacts/mortuary-base-*.

The original mortuary reproduces both saved estate geometry snapshots. A scoped
comparison verifies that every other primitive is unchanged, with only the
mortuary wall's lower vertices moving to the existing plinth top. The two
snapshot hashes were refreshed after that comparison; primitive counts and
the Leighton/Newton ward ranges remain unchanged by this repair.

The npm test run and its continuation cover every configured check, with all
passing after the snapshot refresh. The complete compiled suite passes source
render comparison, full-detail loading, fallback handling, all timeline stops
and live walking collision refresh. The final manifest matches current source.

Browser source and the local compiled aerial model are updated. Unity, Blender
and packaged desktop exports were not regenerated for this repair.

## Three-level Asylum Escape interior (2 October 2026)

The owner approved the exterior-based floor proposal with C1 at the rear wall,
S1 in former R24, S2 removed, and a west basement plus S5 at the marked west
junction. Revised drawings and the annotation are in
Research/1829-interior-proposal/README.md. This supersedes the former coarse
two-floor browser interior and its randomly selected corridor-end exits.

Browser/dist/asylum-plan.json is the shared source. asylum-layout.mjs derives
continuous wall collision, room openings and a 0.5-unit navigation grid with
a world-coordinate origin. asylum-architecture.mjs renders the same exterior
envelope, partitions, local textured finishes, floor/ceiling shaft openings
and batched return stairs. Existing guard/ghost models, artwork, pause, torch,
stamina, arrival and escape sequences are retained.

Ground/first/basement elevations are 0/4.2/-3.2. S1/S3/S4 connect ground to
first; S5 connects basement to ground and ground to first. Stair height changes
continuously while walking. Cross-floor pursuer routes include stair points;
replanning waits until an actor leaves the flight. Capture also compares
height, preventing captures through a stair ceiling.

All 23 existing door/level pairs remain available (13 ground, seven first,
three basement). E enters the exterior at the matching landing/path and
returns through the corresponding floor, with a release latch. NPCs stay in
the building while the player is outside. Escape completion occurs on the
front path at z>70 within |x|<90, rather than immediately on crossing a door.

asylum-outside.mjs obtains body-height collision and tread/deck support from
the exterior meshes/instances and basement walk metadata. It inspects hidden
originals retained by aerial batching, restoring every visibility flag before
rendering. This avoids collision from a merged batch's enclosing bounds and
preserves raised landings. Approach direction selects the correct rear return
flight where stairs overlap in plan. Tree toggles refresh this walking cache.

Legacy layout consumers remain supported by core.mjs, floors.mjs and
architecture.mjs. The browser game reads asylum-plan.json; the older browser
and Unity layout JSON and Blender/desktop exports were not regenerated.
Exterior geometry is unchanged and the compiled aerial manifest still matches
its source hash; no exterior rebuild is required.

`npm test` passes, including the added test-asylum-layout.mjs (all rooms/doors,
stairs up/down and three-level pursuer routes) and test-asylum-outside.mjs (all
arrivals, all seven exterior stairs down/up, batched collision parity and
visibility). test-asylum-browser.mjs passes with the real renderer, 23 E round
trips, release latch, all three levels, upper-landing movement and desktop/
mobile previews. `npm run test:asylum` runs the new checks. Visual/interaction
evidence is under Browser/artifacts/asylum-remodel/.

## Building preparation progress (2 October 2026)

The title's disabled “Preparing the building” action now shows a percentage,
native progress bar and a short status for the current preparation step.
Progress follows completed work: floor data, connected routes, each interior
floor, lighting/characters, grounds, frontage, outside access and first render.
These are weighted stage checkpoints, not a download percentage or time estimate.
Short paint yields between stages keep updates visible; background tabs can
continue preparing. Completion and the enabled Asylum Escape button wait for
the first rendered title view. Failure clears the busy state and retains the
reload action and independent exploration buttons.

The loading display fits desktop and small mobile views down to 320 × 480.
The landing browser check covers initial progress, a held exterior-image
download, increasing percentages, failure recovery and first-frame completion.
Visual evidence is Browser/artifacts/landing-*-progress.jpg. The game-loop check
uses an immediate paint scheduler; its intro-only help assertion runs before
the notebook checks start playing. No model sources or exports changed.
Validation: `npm test`, `node test-game.mjs` and the real-renderer
`node test-landing-mobile.mjs` all pass.

## Continuous Asylum Escape skirting (2 October 2026)

The revised three-floor browser interior previously built skirting only beside
window openings. Individual square-ended boards also overlapped at corners and
at partially duplicated partition runs, exposing brick ends and competing faces.

`Browser/dist/asylum-architecture.mjs` now builds skirting from full wall runs,
independently of the window masonry. `asylum-skirting.mjs` makes mitred outside
bends and combines the footprints before extruding one mesh per floor. This
removes internal caps and overlapping top/side faces at straight, angled, T and
crossing joins. It retains the 0.24-unit board height, 0.215-unit depth and one
skirting draw call per floor. Free caps clear the masonry end by 0.012 units;
partition sampling gaps of up to 0.3 units join along the existing run. Wall,
door, collision and navigation data are not modified.

`test-asylum-skirting.mjs` is included in `npm test` and `npm run test:asylum`.
It passes 1,536 window-base samples, 3,405 top-surface samples, synthetic
inside/outside/angled corners and overlapping partitions, and 69 doorway
clearance samples across the three floors. `test-asylum-layout.mjs` passes.
The actual game comparison in `Browser/artifacts/check-asylum-skirting.mjs`
captures 16 before and 16 after views across the three levels, including camera
movement and mobile. Visual review confirms continuous window bases and clean
corner returns; both runs report no page/shader errors. Images and render
summaries are in `Browser/artifacts/asylum-skirting/`.

The complete `npm test` suite passes; its log is
`Browser/artifacts/asylum-skirting-suite.txt`. The compiled exterior manifest's
source hash still matches the current aerial sources.

Only browser interior sources changed. The aerial compiler does not include
this interior; no compiled exterior rebuild is needed. Unity, Blender and
packaged desktop/mobile exports were not regenerated.

## Straight Reception corridor corners (2 October 2026)

The two ground/first-floor bends beside Reception now have matching continuous
45-degree faces. The east outline previously retained eight short sampled
segments; the west retained a short return plus a fragment of R11's rectangular
partition that projected into the corridor. Both outlines now join (±6.5, 4.9)
to (±8.6, 7) directly. R11's polygon follows the west chamfer so no leftover
partition extends beyond it.

The correction is in `Browser/dist/asylum-plan.json` and the matching research
plan. Visible masonry, skirting, floor/ceiling edges, maps, collision and
navigation use that shared boundary. The ground/first SVG and PNG review
drawings were regenerated. This change does not alter the exterior model;
its compiled manifest still matches the current source. Unity, Blender and
packaged exports were not regenerated.

`test-asylum-layout.mjs` now casts 588 rays against the actual brick, plaster
and skirting faces and walks 196 positions alongside both corners across both
floors. It rejects the original geometry and passes the correction, together
with the existing room/door routes and stair checks. `test-asylum-skirting.mjs`
also passes. `Browser/artifacts/check-reception-corners.mjs` captures 17 views
for each plan, including frontal/oblique angles, both floors and mobile. Visual
inspection confirms straight faces and continuous skirting, with no page or
shader errors. Evidence is in `Browser/artifacts/reception-corners/`.
The complete `npm test` suite passes; its output is saved there as `suite.txt`.

## Square internal stairwells and Reception basement stairs (2 October 2026)

All four browser interior stairs now have square footprints with two flights,
a full return landing and a front floor landing around a square central well.
`Browser/dist/asylum-stairs.mjs` shares the flight route, shaft opening and
guard paths between navigation and `asylum-architecture.mjs`. Continuous
mitred handrail meshes replace separately offset bars; posts end beneath the
rails and start on the actual tread or landing. Closely spaced balusters and
physical rail collision protect the central well and exposed landing edges.
Tiny tread nosings close floating-point seams without coplanar top overlaps.

S1 beside Reception now connects basement, ground and first floors. BC3 goes
around its east side to keep the Reception basement door D13 reachable. The
floor is cut only when a stair connects from below; the lowest floor remains
solid. Ceiling openings only occur where a staircase continues upwards.
This supersedes the earlier S1 ground/first-only connection and rectangular
return stairs. The matching research plan and all three SVG/PNG drawings were
updated in `Research/1829-interior-proposal/`.

`test-asylum-stairs.mjs` checks 882 points for visible tread/landing support
and headroom, 60 attempted falls through flight and landing guards, square
footprints, open wells with solid bottoms, and physically walks routes from
Reception to all 23 door/level pairs. Existing layout checks traverse every
stair in both directions, including both S1 connections. The new test is
included in `npm test` and `npm run test:asylum`. The browser interaction check
uses the shared route and still verifies all 23 door round trips, continuous
three-level walking and raised exterior landings.

The complete browser suite passes; output is in
`Browser/artifacts/asylum-stairs-suite.txt`. The focused checks and 15
actual-game desktop/mobile views pass without page or shader errors. Visual
review confirms joined return rails, square guarded wells and the Reception
descent. Captures and their runner are `Browser/artifacts/asylum-stairs/` and
`Browser/artifacts/check-asylum-stairs.mjs`.

Only browser interior sources and research drawings changed. The compiled
aerial manifest still matches its source hash, so no exterior rebuild was
needed. Unity, Blender and packaged desktop/mobile exports were not regenerated.

## Framed room doorways (2 October 2026)

The browser Asylum Escape interior now retains corridor-facing room walls
instead of erasing them with the corridor's clearance margin. Exact 1.9-unit
openings replace sampled door gaps. All 86 room entrances have cream masonry
above a 2.5-unit head and worn green painted surrounds, using the existing
door-paint and sash materials. Deep jambs join the slightly offset bay-room
partitions. The clear opening is 1.76 units wide and 2.43 units high; thresholds
remain level and open, with no use interaction required. R24 is the Reception
stair hall and retains its full-height stair mouth.

`asylum-layout.mjs` derives frames from the actual jamb cuts, and regenerates
the wall index and navigation cells from the restored partitions. The notebook
uses those same walls. B9's frontage is at z=-29.5, beside the basement
corridor, so its door does not close the west exit route. Both shared plan JSON
files and the SVG/PNG drawings were updated. Frame returns and mouldings join
without overlapping front faces. All green surrounds share one additional
material batch per floor; masonry and pale trim use the existing batches.

`test-asylum-doorways.mjs` checks all 86 portals, 516 bidirectional walking
passes, head-height and threshold clearance, solid walls above/beside each
door, jamb coverage and non-overlapping frame joints. The existing layout and
skirting checks pass. `test-asylum-doorways-browser.mjs` captures all four
orientations, three floors, deep bay openings and desktop/mobile views; it
also walks the actual player through three sample doors. The existing browser
interaction test passes all 23 outside-door round trips and stair transitions.
Both browser runs report no page or shader errors. Captures and render counts
are in `Browser/artifacts/asylum-doorways/`. Doorway checks are included in
`npm test` and `npm run test:asylum`.

The complete `npm test` suite passes; its output is saved in
`Browser/artifacts/asylum-doorways-suite.txt`. The final doorway geometry and
browser checks also pass after the frame-joint refinement.

Only browser interior sources and review drawings were changed. The compiled
aerial manifest still matches its source hash and needs no rebuild. Unity,
Blender and packaged desktop/mobile exports were not regenerated.

## Reception basement partition (2 October 2026)

The owner's marked view adds a transverse wall immediately beyond B11's
existing north doorway. In both shared plan JSON files B11 now ends at x=0,
and B12 occupies the eastern section. Their common partition spans z=9.4 to
19.6, with a 1.9-unit masonry opening centred at z=14.5. The existing renderer
supplies the cream/red brick finish, continuous skirting, doorway header and
green painted surround. The threshold remains open and level, consistent with
the other internal doors. Collision, navigation and notebook walls use the
same plan; no separate rendering or movement implementation was needed.

The basement review drawing was regenerated. The existing layout and doorway
checks pass, including room reachability and movement through the opening.
Browser/artifacts/check-reception-basement.mjs captures both sides, the join
beside the existing doorway and a mobile view; it verifies actual-player
crossings and blocked movement against the wall from both directions. The
captures have no page or shader errors. Evidence is in
Browser/artifacts/reception-basement/.

The full `npm test` suite passes; its output is saved there as `suite.txt`.
`test-asylum-browser.mjs` also passes all 23 E door round trips, continuous
three-level stair movement and raised outside-landing movement. The focused
layout and doorway checks were rerun successfully after concurrent edits to
the separate rear basement area; those edits are preserved.

Only browser interior plan sources and research drawings changed for this
partition. The compiled aerial manifest still matches its source hash; it
excludes the game interior and needs no rebuild. Unity, Blender and packaged
exports were not regenerated.

## Open rear basement area (2 October 2026)

The owner's marked view replaces B9's entrance partition and separate BC4
outside-door lobby with one continuous end space. Beyond B1/B2 the walls
flare at 45 degrees, from (-32.3, -27.1) to (-38.1, -32.9) and from
(-29.9, -27.1) to (-24.5, -32.5). The room now reaches across the rear width,
including the existing D11 outside door. There is no internal entrance frame,
header or threshold, while B1/B2 retain their side-room doors.

Both shared plan JSON files include the new polygons. `asylum-layout.mjs`
supports explicit `openEdges` and rooms without a `doorSide`, so walls,
skirting, collision, pursuer paths and notebook maps agree. The drawing
exporter respects those open edges and locates door symbols using polygon
bounds. Review drawings were regenerated. The concurrent Reception basement
partition is preserved.

`test-asylum-basement-end.mjs` checks 294 rendered masonry/skirting samples
along the two flares, 200 walking checks, clear full-height passages through
the former door and across the widened space, floor/ceiling support and
navigation to both rear corners and D11. Existing layout, doorway and skirting
checks pass. `test-asylum-basement-end-browser.mjs` captures eight views for
each version, including both wall angles, the reverse view and mobile; it
also walks the actual player through the entrance and across the rear room.
The captures have no page or shader errors. Both tests are included in the
appropriate `npm test` / `npm run test:asylum` commands. Evidence is under
`Browser/artifacts/basement-end/`.

The complete `npm test` suite passes (`suite.txt` in that directory).
Existing browser checks also pass all 23 E door round trips, stair movement
and room-door traversal. After the concurrent masonry-join update, the layout,
basement-end, doorway, wall-join, skirting and stair checks were rerun against
the combined source, and the final basement captures were refreshed.

Only browser interior sources and research drawings changed. The compiled
aerial manifest still matches its source hash and needs no rebuild. Unity,
Blender and packaged desktop/mobile exports were not regenerated.

## Sealed interior wall joins (2 October 2026)

The reported slit left of Reception was a sampled partition ending 0.219 units
short of the adjoining exterior wall. `asylum-wall-joins.mjs` now repairs
short straight, T and overlapping parallel joins in the shared layout before
masonry, skirting, doorway frames, maps, collision indices and navigation
cells are built. Repairs stay within 0.3 units of each original endpoint and
resolve dependent joins without moving already connected ends. The former
skirting-only extension is removed so every consumer uses the same walls.

The renderer merges contiguous/overlapping collinear full-height masonry after
window cuts. This removes internal end caps and the remaining subpixel butt
seam at Reception, while retaining the existing windows, material batches and
intentional door/stair openings. No plan outline or exterior geometry was
changed by this repair.

`test-asylum-wall-joins.mjs` checks a fixed survey of 131 repaired joins
(56 ground, 58 first, 17 basement), with 2,358 brick/plaster raycasts from both
sides at three heights, collision coverage, stable joins, bounded extensions,
clear doorway widths and no internal masonry caps at Reception. The check
rejects the unjoined layout. It is included in `npm test` and
`npm run test:asylum`; the latter also runs the new visual check.

The full `npm test` suite passes. The focused wall, layout, doorway and
skirting checks also pass after the final masonry merge. The actual-game
check passes all 23 outside-door round trips, basement/ground/first stair
walking and desktop/mobile views. Nine before and nine final browser views
cover Reception, oblique angles, both upper floors, an offset bay join and
the basement, without page or shader errors. Visual review confirms that the
reported opening and its remaining hairline seam are closed. Evidence and
the suite log are in `Browser/artifacts/asylum-wall-joins/`.

Only browser interior sources and checks changed. The compiled aerial
manifest still matches its source hash and requires no rebuild. Unity,
Blender and packaged desktop/mobile exports were not regenerated.

## Reception central corridor doorway (2 October 2026)

The ground-floor central rear corridor now has a transverse partition between
R11's exposed end and the angled exterior wall. P1 spans (4.1, 5.1) to
(6.7, 5.1), with a centered doorway at (5.4, 5.1). The existing renderer supplies
cream/red masonry, a 2.5-unit head, green trim and a clear, level threshold.
The R11 side doorway remains. The new partition is limited to the ground floor.

The shared plan supports explicit corridor partitions that bypass room-wall
corridor clipping. Wall joins, skirting, the navigation grid and notebook map
all use the resulting walls; doorway geometry uses the existing material
batches. Both plan JSON copies and the ground-floor drawing were updated.
The previous chamfer regression now checks its exposed portion, excluding the
new junction and its walking clearance; doorway checks cover the new joint.

Validation: all 87 framed openings pass 522 bidirectional walking checks,
including the new portal. The new wall endpoints join existing center lines,
and masonry/skirting rays cover both joins at four heights. Layout and
skirting checks pass, as does the complete npm test suite. Its log and the
actual-game desktop/mobile views are in Browser/artifacts/reception-connection/.
The render check reports no page or shader errors.

Only browser interior sources and review drawings changed for this connection.
The compiled aerial manifest still matches its source hash, so no exterior
rebuild was needed. Unity, Blender and packaged exports were not regenerated.

## Basement room sashes and exterior sill-strip flicker (2 October 2026)

The six main-wall sash positions are now visible inside the basement rooms on
both sides of BC1, grouped 2, 2, 1, 1 from rear to front as confirmed by the
owner. Both plan copies record each window's position, width, sill and height.
Room divisions move to z=-16.15/-8.35/-4.45, with centred corridor doors. The
B9 open rear area, its flared walls and outside exit remain connected.

asylum-layout.mjs exposes the room window schedule. asylum-architecture.mjs
merges the basement's collinear masonry before cutting those openings, so
sampled exterior/lining joins cannot interrupt a sash. The twelve sashes use
three-by-six glazing, recessed glass, painted bars and stone sills. Masonry
and continuous skirting remain above/below them; wall collision still blocks
passing through a window, and artwork placement excludes the window walls.
The opposite side follows the same schedule on the straight room lining
behind the courtyard projections. The upper floors keep their existing
window generation. The basement SVG/PNG review drawing shows the new divisions
and twelve window symbols.

The marked exterior flicker was reproduced in the real game. A ray through
pixel (758,357) of the 1860x558 comparison found brick and the generated
`West rear approach beside basement ground contact` at exactly x=-37 and the
same distance. escape-exterior.mjs now insets the concealed paving boundary
by 0.2 units at all three wall steps. Its generated gravel side lies inside
masonry instead of sharing the visible facade. This is authored geometry,
assembled before timeline batching and transform caching; no runtime geometry
mutation is introduced.

Focused checks pass: test-asylum-windows.mjs covers 12 sashes, all 216 panes
from inside, 2/2/1/1 grouping, eight walkable room doors, solid surrounds and
window collision. The wall-join survey follows the three moved partitions
and tests glazing where a sampled join is now a window. The west-side basement
check adds 120 exposed-facade samples across four period transitions, rejecting
coincident gravel faces. Existing layout, basement-end, doorway and skirting
checks pass. Desktop/mobile captures cover all eight rooms and oblique exterior
angles without page or shader errors. Evidence is in Browser/artifacts/basement-windows/.

The local compiled aerial model was rebuilt. Browser model sources, shared
plan JSON and the basement review drawing changed; Unity, Blender and packaged
desktop/mobile applications were not regenerated.

The initial full suite stopped at the Jarman whole-estate fingerprint because
it includes the changed west approach. The gated audit in
Browser/artifacts/basement-windows/audit-snapshots.mjs restores only the old
paving boundary in memory and reproduces both saved Jarman and Leighton/Newton
snapshots exactly. It verifies six boundary vertices moved 0.2 units inward,
unchanged topology/transforms, and every other protected exterior primitive
exact. Only the two SHA-256 fields were refreshed; counts (820,060 and 884,107),
ward ranges and assertions remain unchanged. snapshot-audit.json records the
before/after values and source fingerprint.

The rebuilt compiled model passes npm run test:compiled, including procedural
comparison, full detail, missing/incompatible/corrupt fallback, and every
timeline stop. The final game captures reproduce the old flicker using saved
pre-edit source and show the repaired strip from three nearby angles.

The final complete npm test run passes (suite-final.txt). The final twelve-window
browser capture also passes with no page/shader errors, including a centred
390x844 mobile sash view. The compiled source fingerprint remains current.

## Closed central corridor corner (2 October 2026)

The owner's marked view down the corridor away from Reception showed an
unintended opening between R8's straight wall and R7's offset wall. R7 now
connects (4.1, -24.5) to (5.5, -25.9) with a solid 45-degree room boundary.
This produces continuous cream/red masonry and dark skirting on both ground
and first floors. The room's side doorway and the route around the bend stay
open. Both shared plan JSON copies and ground/first-floor review drawings
are updated; rendering, maps, collision and navigation use the same boundary.

`test-asylum-layout.mjs` adds 304 rendered masonry/skirting probes from both
sides, collision and joined-endpoint checks, and walks around the bend in
both directions on both affected floors. Layout, doorway, skirting and
wall-join checks pass. The actual-game capture verifies four player walking
passes, desktop/mobile views and no page or shader errors. Visual review
confirms the opening is closed and the finish continues around the angle.
Before/after evidence and the capture runner are in
`Browser/artifacts/corridor-bend/` and
`Browser/artifacts/check-corridor-bend.mjs`.

The complete `npm test` run passes; its output is saved as
`Browser/artifacts/corridor-bend/npm-test.log`. After concurrent wall-height
renderer changes, the focused layout test and five actual-game views were
rerun successfully, including all four player walking passes.

Only browser interior plan sources, checks, drawings and notes were changed
for this correction. The compiled aerial model excludes the interior and its
manifest still matches the source fingerprint, so no rebuild was needed.
Unity, Blender and packaged desktop/mobile exports were not regenerated.

## West gallery lower return brick and flicker (2 October 2026)

The yellow-circled lower join beside the gallery was open between two thin
foundation strips. The gallery's cream backing ended at y=0.15, and the rear
approach's generated gravel edge shared its end plane at z=-30.5. A matching
brick return now closes the foundation to y=0.3, replacing the last 0.12 of
the gallery side foundation rather than overlapping it. The cream backing
starts at the brick top. The concealed paving step moves 0.2 towards the
rear, placing its generated edge inside masonry. Research/west/README.md
records the model coordinates and the supplied visual reference.

The geometry is authored before timeline batching and transform caching.
Existing runtime shadow/collision refresh paths are retained. The west-side
basement regression adds 96 front-face probes across four period transitions,
plus side-face overlap and retained upper-frame checks; it failed on the
original model and passes after the repair. West-refinement and ground-contact
checks also pass. Source and rebuilt compiled captures from three close
angles show continuous brick without page or console errors.

The initial full suite stopped at its estate-wide geometry snapshot. The
saved-source audit in Browser/artifacts/gallery-brick/audit-snapshots.mjs
reproduces both previous snapshots, then restores just the new brick return,
shortened foundation, cream instance and paving vertices in memory to prove
all other primitives remain exact. The two snapshots were refreshed only
after that check, increasing each primitive count by one. The audit report,
before/after views and validation logs are in Browser/artifacts/gallery-brick/.

Shared browser model sources and the local compiled aerial model are updated.
Unity, Blender and packaged desktop/mobile applications were not regenerated.

Final validation: the complete npm test suite and npm run test:compiled both
pass. The compiled checks cover source/image parity, full detail, missing,
incompatible and corrupt fallbacks, all timeline stops and live walking
collision refresh. The rebuilt manifest matches the current model source
fingerprint. Final logs are suite-final.txt and compiled-suite.txt in
Browser/artifacts/gallery-brick/.

## Asylum pause-menu intro action (2 October 2026)

The Esc pause menu uses compact Restart and Resume buttons on the left and
a right-aligned Back to intro link styled as a button. It opens `./index.html`
to return to the title page. On narrow screens the intro action wraps onto
its own right-aligned row. The compact layout and intro action apply only to
pause; capture and escape results keep their existing actions. Keyboard
navigation remains available while paused.

An actual-game browser check passed Esc pause, resume, restart, capture-result
visibility, keyboard access and navigation back to the index. Screenshots at
1280, 390 and 320 pixels wide were visually reviewed, with no menu overflow
or page errors. Evidence is in `Browser/artifacts/pause-menu/`.
The full `npm test` suite passed; its output is saved there as `npm-test.log`.
Only browser UI sources changed; model and packaged exports were not rebuilt.

## Inner courtyard light seams (2 October 2026)

The bright floor strip and vertical corner in the west inner courtyard were
shadow-map leaks at solid masonry contacts. The default back-face shadow pass
recorded the far wall, and the 25 cm normal offset plus roughly 25 cm depth
offset detached the filtered shadow from the receiving surface. Reducing the
offsets alone left a thin light edge.

`exterior-shadows.mjs` makes opaque architectural casters include both wall
skins in the shadow map while preserving visible-face culling, explicit shadow
sides, transparent materials and alpha-tested foliage. The shared builders
apply it to the initial estate and added layout buildings before batching and
transform caching. The sunlight normal offset is now 2 cm and its depth offset
is about 1.7 cm. Geometry, materials' visible finishes, collisions, map size
and cached-shadow invalidation are retained.

`test-exterior-shadows.mjs` audits 6,376 assembled opaque casters, contact
offsets, foliage/custom-material exclusions and invalidation. It is included
in `npm test`. `npm run test:shadows` also runs the actual-game pixel survey:
288 ground/wall samples across both inner courtyards in day, dusk and night.
Independent rays establish sunlight occlusion; neighbouring rays distinguish
natural distant shadow penumbras from solid contacts. The original settings
fail at 37 samples. The corrected settings have no leaks in the surveyed
solid-shadow regions, and open ground retains direct sunlight. The test also
captures desktop/mobile views and rejects page or shader errors.

The complete `npm test` suite passed, as did the focused shadow checks and
`npm run test:compiled` after rebuilding the aerial model. Source/compiled
renderings match and all timeline stops pass. Visual review covers the
reported recess, the opposite recess, adjoining bases, the central rear step,
frontage and daylight aerial scene. Evidence and logs are under
`Browser/artifacts/courtyard-light/`.

Browser sources and the local compiled aerial asset are updated. Unity,
Blender and packaged desktop/mobile exports were not regenerated.

## Flush angled interior masonry (2 October 2026)

The marked Reception corner had connected centre lines but square-ended brick
and cream wall boxes, leaving a recessed V above the mitred skirting. The
shared `asylum-wall-geometry.mjs` now unions mitred wall footprints for both
masonry and skirting on all four floors. Internal caps and overlapping faces
at intersecting or duplicated full-height partitions disappear. Near-parallel
sampled ends receive a short bevel when the theoretical mitre exceeds four
half-widths, preventing long tips outside the walking walls.

Masonry is cut around the existing windows before joining. The window bases,
window heads and doorway headers retain their dimensions and merge with the
full-height geometry into one draw call per finish. Brick/cream height,
building-coordinate textures, ceiling overlap, room layouts, collisions,
window schedules and intended openings are retained.

The wall-join regression now surveys 334 convex corners across all four
floors, with 2,004 brick/cream coverage probes and outward-facing side checks.
It retains the 131 sampled gap checks, collision checks and clear doorway
widths. The saved square-ended renderer fails the new corner survey. Older
probes that began inside perpendicular walls now check solid coverage from
above rather than requiring hidden internal caps. The skirting regression
also rejects long tips at nearly parallel duplicate-wall ends.

Focused layout, wall, ceiling, doorway, window, skirting and second-floor
checks pass. The actual-game comparison captures 11 views before and after,
covering both Reception sides, oblique views, the central corridor bend,
basement flares, first/second floors and mobile. Eight player walking passes
around the joins succeed in both directions, with no page or shader errors.
Reviewed images show continuous masonry with no square-end recesses.
Evidence, the baseline rejection and the full-suite log are under
`Browser/artifacts/asylum-masonry-corners/`. Run `npm run test:masonry-corners`
from Browser for the focused geometry and visual checks.

The complete `npm test` suite passes; its output is saved as
`Browser/artifacts/asylum-masonry-corners/npm-test.log`.

Only browser interior rendering, tests and notes changed. The compiled aerial
manifest matches its source fingerprint and needs no rebuild for this change.
Unity, Blender, review drawings and packaged applications were not regenerated.

## East ground-floor D10 wall surround (2 October 2026)

The blue-circled courtyard door used a sampled circular clearance that removed
masonry beside the frame and all the way to the ceiling. D10 now specifies a
fitted opening in both shared plan JSON copies. The layout cuts exact jambs,
retains the angled return, and shares the restored side walls with collision,
navigation, skirting and the notebook map. Removed upper wall spans become
cream masonry headers through the ceiling and adjoining floor. The door leaf
reaches the frame head, and the frame and exit sign align with the interior
wall face. D10's exterior position, destination and E behaviour are retained.
The yellow-circled R35 fragment/pillar is retained, following the request's
wording that it should be there; room boundaries and floor outlines are unchanged.

`test-asylum-east-corner.mjs` passes 206 masonry probes, both jambs' skirting
and collision checks, the closed leaf and two approach walks. It rejects the
previous opening. The new browser check passes six desktop/mobile/upper-floor
views, visible signage, D10's E round trip and release latch, with no page or
shader errors. Final frontal, oblique and mobile captures were visually reviewed.
Both checks are included in the relevant package test commands.

`npm test` stops at the unrelated Jarman exterior geometry hash. Running the
remaining commands also finds Leighton/Newton and annexe entrance-alignment
hash mismatches; all other commands pass, including the interior regressions
and the rerun game check after the sign correction. A dependency audit confirms
none of the three failing tests imports the interior files edited here. Their
expected snapshots were not changed. Logs, the baseline rejection, dependency
audit and before/after views are under `Browser/artifacts/east-corner/`.

Only browser interior sources, shared opening metadata, tests and notes were
changed for this repair. The aerial compiler excludes these interiors; its
local manifest was already inconsistent with the separate exterior source at
validation time and was not rebuilt here. Unity, Blender, review drawings and
packaged desktop/mobile exports were not regenerated.

## Window and internal partition clearance (2 October 2026)

The reported first-floor obstruction came from evenly spacing facade windows
without consulting the room partitions. `asylum-windows.mjs` now projects the
joined neighbouring walls into each facade run, excludes their footprints plus
the full sill and a 0.15-unit clearance, and selects the nearest available
position in the original bay. Adjacent sills also retain clearance. Window
cuts, glass, sash and sill move together. Nineteen generated windows shift
across the ground/first floors; the 257 generated and 17 explicitly scheduled
windows retain their counts and dimensions.

R1/R12 also had solid outer room linings 0.3 units behind the ground-floor
windows. Their outer edges now align with x=±24.7 in both plan copies.
Navigation, collision and wall rendering consume that same correction; no
runtime exterior geometry or shadow state changes. Ground/first-floor review
drawings are regenerated. The basement/second-floor schedules remain fixed.

`test-asylum-window-clearance.mjs` checks all 274 sash positions, 1,334 exposed
pane rays, full sill-to-partition clearance and retained collision. Generated
sashes are also checked against exterior returns; explicitly scheduled sashes
retain their existing facade reveals. The test rejects the saved pre-fix
renderer/plan. It is included in `npm test` and `test:asylum`; run
`npm run test:window-clearance` for geometry and actual-game visual checks.
The browser check captures all 19 shifted windows, both adjusted room linings,
an oblique first-floor corner, basement/second-floor schedules and mobile.
Evidence and logs are under `Browser/artifacts/window-clearance/`.

The final clearance survey and all relevant interior regressions pass. The
25 before/after desktop/mobile views have no page or shader errors; visual
review confirms full windows with masonry clearance beside their frames and
sills. The complete `npm test` invocation reaches an unrelated Larkton exterior
snapshot mismatch. Running every remaining command separately also finds
other annexe protected-geometry snapshot mismatches, recorded in
`suite-remaining.json` and `suite-remaining.log`. Expected exterior snapshots
were not altered by this work; the full suite is not reported as passing.

Only browser interior sources, tests, plan data and research drawings change.
The aerial build dependency graph excludes these modules, so no aerial build
or compiled-scene test is required. Its existing local manifest is already
stale against unrelated exterior sources; this change does not refresh it.
Unity, Blender and packaged applications were not regenerated.

## Front-wall shadow banding (2 October 2026)

The repeating diagonal pattern on 1829's rendered walls and stone coping was
self-shadowing from the PCF depth comparisons. Disabling received shadows
removed it while leaving the mineral grain intact. Increasing the constant
depth bias still left bands and would weaken contact shadows.

`exterior-shadows.mjs` now corrects each PCF comparison for the receiver's
surface slope. It derives the receiver plane in shadow-map coordinates,
compares the four neighbouring texel centres at their respective plane depths,
then interpolates those results at each of the existing five sample positions.
The light's small depth/normal offsets, shadow-map size, material culling and
two-sided architectural casters are retained. The filter installs once before
source or compiled-scene materials compile; `aerial-scene.mjs` installs it when
restoring the binary too. Vendored Three.js files are unchanged. This uses more
shader texture instructions; no frame-rate improvement is claimed.

The focused shadow checks pass: 98,304 unobstructed receiver pixels across
24 straight/oblique wall, angled-wall and ground views in day/dusk/night have
no false shadows. The stock renderer fails that same regression. All 288
existing courtyard wall/ground contact samples also pass, preserving the
earlier light-leak repair. Desktop/mobile captures have no page or shader
errors. The front walls, coping and courtyard views were visually reviewed.
Before/after views and logs are under `Browser/artifacts/wall-shadows/`; the
repeatable pixel survey is in `Browser/artifacts/courtyard-light/`.

The local aerial model was rebuilt and `npm run test:compiled` passes, including
source/compiled image comparison, full detail, model-load fallbacks and every
timeline stop. The rebuilt manifest matches the current source. The full
`npm test` invocation stops at an unrelated Larkton protected-model fingerprint mismatch;
the same mismatch occurs with this shader correction disabled. Remaining
suite commands are recorded separately in `remaining-summary.json` under the
wall-shadow artifacts: 31 pass and 14 fail on existing protected-geometry
snapshots or the stair-foot gravel-contact assertion. Expected model snapshots
were not changed by this work.

This repair changes browser shadow filtering and its validation only. Unity,
Blender and packaged desktop/mobile exports were not regenerated.

## Right-angle exterior wall joins (2 October 2026)

The marked front retaining-wall bend used square-ended boxes meeting at their
centre lines. This left a missing outer quadrant and overlapping inner top
faces in both masonry and coping. The estate-wide wall-builder review found
the same pattern in the mirrored front foundations/retaining walls, entrance
stair returns, west basement retaining wall, Irby/Ashley conservatory,
Main/admin and tower-service parapets, and Hospital Shop link coping.

`wall-mitres.mjs` gives each adjoining run matching diagonal ends and removes
internal caps. It retains named meshes, material finishes, heights and square
free ends, supports unequal widths and reflected/rotated runs, and records
exact polygon footprints for walking collisions. The entrance stair return
and west basement runs now share centre-line endpoints. Their approaches,
stair mouths, lower paving, doorways and front facade setback are retained.
Geometry is completed within the builders before batching, transform caching
and shadow preparation; existing runtime visibility/collision refresh remains.

`test-wall-mitres.mjs`, included in the standard and model-check suites, surveys
76 exterior wall/coping joins with 1,672 top/side probes and 90 filled-corner
collision probes. It rejects missing outer corners, overlapping inner tops
and incorrectly facing side surfaces. Rotated unequal-width examples also
reject the original boxes and verify removed internal caps. Loading the saved
pre-repair builders fails the same estate survey at a frontage corner.
Existing affected-building and walking checks pass. The interior wall survey
also checks its existing joined masonry on all four floors.

`test-wall-mitres-browser.mjs` captures 15 desktop/mobile views in each source
and compiled mode; the tower close-up has an additional corrected-camera
capture. Reviewed frontage, stair, conservatory, basement and parapet images
show clean mitres. Logs, before/after captures and the original-defect rejection
are in `Browser/artifacts/wall-mitres/`. Run `npm run test:wall-mitres` after
`npm run build:models`; `--before` uses the saved builders in that evidence folder.
The owner's annotated reference and modelling note are in Research/front-basement.

Browser model sources and local compiled aerial assets are updated. Unity,
Blender and packaged desktop/mobile applications were not regenerated.

Final validation for the right-angle repair: the focused building/walking
checks, 76-join survey and `npm run test:models` pass. The source/compiled image,
exact draw-count and fallback checks pass. Timeline checks pass at every stop,
including mobile and live walking refresh; their screenshots use the task's
own timeline subfolder after a concurrent write prevented saving a shared PNG.
The final rebuilt manifest matches the current model-source fingerprint.

The full standard suite was run, and all checks after its first failure were
also executed. Final rechecks leave three unrelated annexe snapshot failures:
`test-larkton-recess.mjs`, `test-oakmere-west.mjs` and `test-annexe-access.mjs`.
Each also fails when this task's seven pre-repair wall builders are restored
through the evidence loader. Their protected baselines were not changed by
this task. Other transient snapshot/eaves failures cleared on current-source
rechecks. The stair-foot test was updated to expect coping in the filled
corner and still verifies gravel immediately outside both adjoining faces.

## Interior exploration and walkable estate stairs (2 October 2026)

Explore on foot now starts at dusk and loads the same four-floor asylum plan
and architectural builder as Asylum Escape. `explore-walker.mjs` adapts the
existing mouse/keyboard/touch controls to the shared `createAsylumOutside`
and `createAsylumJump` movement, collision and stair logic. Exploration has
no NPC instances, notebook, pursuit, timer or escape completion trigger.
`explore-interior.mjs` supplies the existing finishes and pooled room/corridor
lighting without loading the game or its character/notebook modules.

All 23 outside door/level connections work in both directions. Press E or tap
the nearby door button to enter/leave; holding E cannot repeatedly cross the
door. All seven interior stair connections are walked, including Reception's
basement and second-floor connections. Location presets, jumping, timeline,
tree controls and the intro camera handoff remain available. Layout/tree
changes call `walker.setObstacles()` to rebuild outside collisions and support.

The shared outdoor walker now samples support across the whole estate instead
of the asylum's original bounded rectangle, and includes solid stone steps.
This enables the annexe fire stairs, pharmacy steps and main/admin and annexe
entrance steps even though those buildings have no linked interior. The
optional precise footprint collector follows unannotated extruded bay outlines
and splits sloping cylindrical handrails into short sections with their actual
heights. Their enclosing boxes previously blocked the rotated annexe flights
and upper landings. Ordinary ground-walker consumers retain their existing
footprint behavior. Building geometry and floor plans are unchanged.

`test-explore-interior.mjs` covers every door round trip, the held-key latch,
all seven internal connections in both directions, both split entrance branches,
both pharmacy stairs, both annexe fire flights/landings, the two other estate
entrance flights, jumps and walking beyond the game's escape boundary. It is
included in `npm test`. `npm run test:explore` also runs input and real desktop/
mobile checks. The focused checks pass, together with the existing Escape
browser's 23 door round trips and stairs, mobile multitouch, and day/dusk/night
controls. Desktop/mobile interior and dusk screenshots were visually reviewed;
the new browser check reports no page or shader errors. Evidence is under
`Browser/artifacts/explore-interior/`.

Browser runtime sources and the local compiled aerial assets are updated.
The exterior was rebuilt because its source fingerprint includes the shared
collision helper. Unity, Blender and packaged desktop/mobile exports were
not regenerated.

Final validation: `npm test` and `npm run test:compiled` both pass. The rebuilt
manifest matches the current source fingerprint. Their complete logs and
the compiled comparison metrics are saved in the evidence folder above.

## Reception edges and estate facade courses (2 October 2026)

Joined Reception's uneven front/side floor strips into level continuous courses,
removed the lowest sashes' duplicate projecting sill lips, and followed the
lower band through both stepped entrance facades and courtyard facets. Matching
joins on the lawn bays, west middle bay, courtyard returns and west roof corner
use the same swept-profile builder. The older instanced ward courses are joined
before model preparation by material, level and adjacent endpoint geometry.
The shared repair supports reflected and rotated facades and angled corners;
its top, underside and side faces have outward normals and no internal caps.

Joined meshes retain exact per-strip collision footprints. Collision indexing
now bounds each supplied footprint independently, preventing a merged facade's
enclosing box from expanding the collision index across its courtyards.
No runtime geometry movement or tree/layout change is introduced.

`test-facade-courses.mjs`, included in the standard and model suites, checks
20 explicit profiles, 68 explicit and 278 automatically joined corners, and
2,200 top/underside probes. Whole-model Reception rays reject competing corner
planes and hanging sill lips. The assembled-estate survey checks 1,915 remaining
thin pale box strips and finds no exposed matching right-angle overlaps.
`test-facade-courses-browser.mjs` captures close source/compiled Reception,
entrance, courtyard, bay, ward and shop views, including portrait Reception.
Evidence and command logs are under `Browser/artifacts/facade-trim/`; modelling
notes and the supplied screenshot are in `Research/front-inside-corners/`.

These are browser model/source changes. Unity, Blender and packaged desktop or
mobile applications were not regenerated by this repair.

## Enclosed exterior stairs (2 October 2026)

Exterior fire stairs and raised landings now have continuous iron guards,
including the west garden, west masonry return, east forward wing, central
court, both inner courts, east courtyard, rear return, both annexe stairs and
both pharmacy stairs. Reception's front balustrade uses the same collision
handling. The owner's marked reference and the changed landing arrangements
are recorded in Research/exterior-stair-rails/README.md.

`exterior-stair-rail.mjs` builds the handrails and close-spaced pickets from
explicit edge endpoints. The same mesh stores its guard endpoints and height.
`exteriorObstacles` transforms and subdivides those edges into narrow continuous
barriers for the shared Explore/Escape walker and jumping. This includes rails
above ground level, preserves sloping heights and reflected/scaled placements,
and follows normal visibility, timeline and batched-source refreshes. Pharmacy
rails use the service-court mesh factory so later range placement moves them
with their treads and doors. Walls close the wall-side edges; guards do not
cross the door openings.

The west-garden upper flight meets its doorway deck at the edge, with a longer
lower run and a full turning landing. The east-courtyard return has clearance
around its rail ends; the inner-court and rear-return landing edges support the
full turning width. Both annexe stairs now have an open stairwell and an L-shaped
landing/door walkway instead of a broad deck covering the rising flight.

`test-exterior-stair-rails.mjs`, included in `npm test`, checks the two upper
flights and remote rear return in both directions, probes the actual supported
sides of guards across all historic stair groups, rejects a central rail across
the door, and checks period removal and batched visibility/collision parity.
The final focused run passes 107 visible guard meshes and 271 attempted guard
crossings in 1916, including the annexe and pharmacy pairs. The existing exterior
movement survey, all 23 door round trips, interior stairs, pharmacy/annexe routes
and both front entrance branches also pass. Annexe tests walk around the open
stairwell to both tower doors. Door/facade ray tests now start inside the guards
or exclude the foreground pickets when checking the masonry behind a window.

Desktop, dusk and mobile views and real exploration movement checks are in
Browser/artifacts/exterior-stair-rails/. Browser model sources and local compiled
aerial assets are updated; Unity, Blender and packaged application exports were
not regenerated for this repair.

Validation for the facade repair: the focused course regression, ward placement,
walking/interior exploration, collision/performance and full `test:models`
suite pass. The regression rejects the saved original Reception's two competing
surfaces. All 28 close source/compiled browser views completed without page or
shader errors; Reception, the west middle bay, lawn bay, courtyard, ward and
shop views were visually reviewed. Day/dusk Explore comparisons were also
reviewed. `npm run test:facade` reruns the focused checks after `build:models`.

The complete standard suite was attempted and every command after its first
failure was run separately. The initial side-sash failure and the later west
stair-bound/recess failures reproduce with the saved original Reception builder
and no automatic course repair. Several legacy protected snapshots also fail:
whole-estate fingerprints include the intentionally changed trim, while the
annexe-only Carden check's separate 14-primitive discrepancy reproduces with
the original builder. Protected reference snapshots were not rewritten.
The ward-placement comparison now prepares both its source and assembled
buildings with the same course joiner and passes its full geometry checks.

The standard source/compiled comparison passes image similarity, exact render
counts, full-detail loading and fallback cases. Its first timeline continuation
fell back to source after concurrent model edits changed the fingerprint; a
fresh local build and timeline recheck follow in the same evidence directory.

Final facade validation: the refreshed compiled model matches the current
source fingerprint. The complete timeline browser recheck passes all source
and compiled periods, navigation/reloads, mobile reset, tree/selection controls
and live walking collision refresh. Browser sources and local compiled aerial
assets are updated; the broader standard-suite limitations above remain.

## East ground-floor pillar and room-wall gap (3 October 2026)

The owner's marked east-wing view removes the isolated R35 wall fragment and
closes the gap beside its framed room entrance. R35's ground-floor variant
connects (36.9, 19.1) to (34.5, 22.85), joining the existing north and doorway
side walls with continuous cream/red masonry and dark skirting. The room
doorway remains at (34.5, 24.5). This supersedes the earlier D10 note that
deliberately retained the pillar.

C6 has a ground-floor approach along the open side of the new wall. The layout
builder and drawing exporter now apply corridor variants in the same way as
room variants. Both shared plan JSON files and the ground-floor SVG/PNG are
updated. Rendering, collision, navigation and notebook mapping all use the
same corrected boundary; the first-floor room/corridor variant is retained.

`test-asylum-east-ground-wall.mjs` passes 192 masonry/skirting ray probes on
both wall faces, three clear former-pillar locations, solid collision and
joined endpoints. It walks the room entrance and forward corridor in both
directions and checks the unchanged first-floor fragment. The saved original
layout fails at the pillar-clearance assertion. This regression is included
in `npm test` and `test:asylum`. The shared-plan layout check also passes all
room/exit routes and physical stair connections.

Six desktop/mobile game views finish without page or shader errors. The
marked view, doorway join, reverse room face, mobile view and regenerated
ground-floor drawing were visually reviewed. Evidence and suite results are
under `Browser/artifacts/east-ground-wall/`; the original annotated screenshot
is retained in `Research/1829-interior-proposal/`.

The complete `npm test` suite was attempted and every command from its first
failure onward was run separately. The first wall-join failure and a later
skirting threshold failure occurred during concurrent doorway-fitting edits;
both checks pass after their coordinate updates. All repair-related interior
checks pass. Two exterior protected-snapshot checks still fail: Jarman and
Leighton/Newton. Neither imports the corrected interior plan/layout, and their
expected fingerprints were retained. The continuation ran 97 commands: 94
passed immediately, skirting passed its subsequent recheck, and those two
exterior checks remain failures. Logs and the final focused validation summary
are in the evidence directory above.

Only browser interior plan/layout sources, checks, drawings and notes were
changed for this correction. The separate aerial compiler excludes this
interior, so no compiled aerial rebuild is needed. Unity, Blender and packaged
application exports were not regenerated. Concurrent outside-door fitting
edits in the shared workspace were preserved and are outside this correction.

## Matching wall material around every outside door (3 October 2026)

The reported ground-floor east rear door is F3. Its old circular clearance
removed the entire wall height and left outdoor strips beside the frame.
Every outside door now derives a fitted opening from its floor's hosting
facade. Ordinary openings are 1.58 units wide with a 2.465-unit head; D1
retains its 1.9-unit opening, 3.6-unit head, red double leaf and transom.
Restored sides retain the existing red lower brick, cream upper brick and
dark skirting, with the same shared material and building-space textures.

Clipped wall spans retain headers through the ceiling and adjoining floor.
The renderer unites each header with its adjoining masonry at the relevant
head height, including angled returns. This removes internal jamb caps and
overlapping corner faces while keeping one mesh per masonry finish. The
restored lower wall runs feed collision, navigation, notebook mapping and
skirting. Exterior arrivals and E interaction coordinates stay fixed.
Concurrent frame placement and east ground-floor plan changes were preserved.

The new test-asylum-exit-surrounds.mjs regression passes all 23 door/level
connections, 6,536 matching-material probes, 207 closed-leaf probes, clear
approaches and solid side collision. It is included in npm test and the
interior suite. Existing checks pass all 89 room entrances and 534 walking
passes, all 112 outside/room frames, 69 clear threshold samples and the
window/ceiling/stair regressions. The wall-join test now recognises ray
origins buried inside restored upper masonry, and threshold probes use
the fitted door centre. The fixed F3 header ray rejects the original
layout and hits the repaired cream masonry.

The new test-asylum-exit-surrounds-browser.mjs captures all 23 doors plus
oblique and phone views, requires a walkable camera position with direct
sight of each leaf, and verifies all 23 E round trips and release latches.
It checks all 22 emergency signs in front of their headers and reports no
page or shader errors. It is included in test:asylum. The F3 front/oblique/
phone views, D1, F7, D8 and basement surrounds were visually reviewed.
Evidence is in Browser/artifacts/door-surrounds/.

Only browser interior sources, checks and notes were changed for this
repair. A dependency audit confirms the 171 aerial compiler inputs exclude
these interiors; no aerial model rebuild is needed or was performed here.
Unity, Blender, plan drawings and packaged application exports were not
regenerated for this door-surround repair.

The complete npm test run passes the interior checks and stops at the existing
Jarman protected exterior-geometry snapshot. All 33 remaining commands were
run separately; 32 pass and Leighton/Newton's protected exterior snapshot
also fails. Both failures concern unchanged exterior modelling inputs and
were already recorded in earlier development notes. Expected snapshots were
not changed. Full output is in Browser/artifacts/door-surrounds-suite.txt;
the continuation results are in door-surrounds/suite-tail.json.

## East rear ground-floor room wall (3 October 2026)

The owner's purple line joins R16's south wall to the wall beside its room
entrance, across the front of stair S4. General stair-footprint clipping had
removed the span from approximately (29.11, -32.4) to (34.6, -32.4), including
the final corner. R16's ground-floor variant now marks edge 2 as solid. The
shared layout retains that complete edge, while still applying exterior and
door cuts, and joins the existing doorway-side wall to it. Cream upper brick,
red lower brick and dark skirting share the existing material batches.

Collision, navigation and notebook mapping consume the same enclosed wall.
The existing framed doorway at (34.6, -34), corridor-side stair approach and
F3 lobby remain accessible. The first-floor R16 boundary is retained. Both
shared plan JSON copies and the ground-floor SVG/PNG are updated; the drawing
exporter shows explicit solid edges over the adjoining stair-area fill.

Stair descent can no longer leave S4 by continuing straight into R16. The
shared stairDeparture helper chooses the normal straight exit where clear,
or a sideways step onto a clear landing. Generated cross-floor navigation
uses that point. Stair/exploration checks use actual landing approaches, and
the new independent rear-wall regression specifies the S4 sideways exit
explicitly and walks the complete ascent/descent with floor and flight-release
assertions. This corrects the initial full-suite failure at an old stair-test
spawn inside the newly enclosed wall.

test-asylum-east-rear-wall.mjs passes 192 two-face masonry/skirting probes,
the doorway-side joint, collision, retained first-floor opening, bidirectional
room/stair/fire-exit approaches and complete S4 walks. Removing the solid-edge
variant fails at the original gap. The regression is included in npm test and
test:asylum. Shared layout, all 23 physically walked door routes, stair supports,
wall joins, ceilings, windows, doorway/frame surrounds and skirting checks pass.

Five final actual-game desktop/mobile views finish without page or shader
errors. The same browser check walks S4 upward/downward and verifies departure
from the flight. The marked view, room face, phone view and regenerated drawing
were visually reviewed. Before/after captures, movement evidence and suite
logs are in Browser/artifacts/east-rear-wall/. The original annotated reference
is retained in Research/1829-interior-proposal/.

A dependency audit finds none of asylum-layout.mjs, asylum-plan.json or
floors.mjs among the 171 aerial compiler inputs. No aerial compiled rebuild
is needed for this interior change. Browser interior sources and the review
drawing are updated; Unity, Blender and packaged exports were not regenerated.
Concurrent first-floor room and exterior edits in the shared workspace were
preserved.

The complete npm test run passes the wall and all preceding interior checks,
then stops in test-explore-interior.mjs at the distant exterior stair waypoint
(378.500656, -19.197299). Replaying with R16's new solid edge removed produces
the identical exterior actor position and failure; both versions first finish
all seven interior stair connections. The continuation runs every subsequent
standard-suite command and retains its per-command results in suite-tail.json.
Exterior annexe support and protected geometry comparisons also fail against
the concurrently edited exterior. Their expected snapshots were not changed
for this interior repair. Full and baseline output is retained with the wall
evidence above.

## East ground-floor corridor wall and opposite bevel (3 October 2026)

The owner's purple/blue marked screenshot joins R36's north wall end at
(33.8375, 27) to its west wall end at (31.45, 29.42). The opposite outside
corner now runs at 45 degrees from (32, 25.25) to (30.25, 27), cutting back
1.75 units on each side. The diagonal passage has approximately 2.35 units
of clear width. Cream upper brickwork, red lower brickwork and dark skirting
continue along both faces and join the existing wall runs.

R36 has an explicit ground-floor polygon, with corridor-width clipping
disabled for that reviewed boundary. This retains its existing doorway
piers and the complete new diagonal. C6 follows the northwest side of the
wall into the original forward corridor. R35 and the first-floor boundaries
retain their existing shapes. The ground-floor outline fills the cut-back
triangle, so the floor and ceiling follow the new outside face. The remaining
straight wall retains its existing window; all window counts are preserved.

Both shared plan JSON files and the ground-floor SVG/PNG are updated. Walls,
collision, pursuer navigation and notebook mapping derive from the shared
plan. test-asylum-east-corridor.mjs is included in npm test and test:asylum.
It passes 320 masonry/skirting rays on both new faces, solid collision and
joined endpoints, over 2.3 units of clear corridor width, floor/ceiling rays
through the added triangle, four routes walked in both directions and the
unchanged first-floor corner. The saved original plan fails its new-wall
collision assertion. The earlier R35 test now walks the revised corridor.

All focused wall, skirting, slab, window, doorway and layout checks pass,
including 89 framed entrances and 534 doorway walking passes. Seven final
desktop/mobile game views and two actual-game corridor walks finish without
page or shader errors. The marked view, opposite bevel, reverse view, phone
view and regenerated drawing were visually reviewed. Evidence, the original
plan and complete suite logs are in Browser/artifacts/east-corridor/. The
owner's annotated reference is retained in Research/1829-interior-proposal/.

Only browser interior sources, tests, drawings and notes were changed for
this correction. The aerial compiler excludes these interior inputs; no
compiled aerial rebuild was performed for this change. Unity, Blender and
packaged exports were not regenerated. Concurrent first-floor, rear stair
and exterior changes in the shared workspace were preserved.

The final complete npm test attempt passes the interior checks, including
all window counts and the corrected stair landings, then stops in
test-explore-interior.mjs at the exterior annexe stair waypoint
(378.500656, -19.197299). Replaying that test with this corridor wall and
outside bevel removed in memory produces the identical exterior actor
position and failure. The full output is in suite-final.txt and the replay
in explore-baseline.txt. Every remaining standard-suite command was covered
by the earlier 102-command continuation, which also records exterior support
and protected-geometry failures during concurrent exterior changes. Those
expected snapshots were not rewritten for this corridor correction.

Final continuation result: all 50 remaining commands ran, with 35 passing and
15 exterior support/access or protected-model comparisons failing. The combined
wall/browser/input-audit result and identical baseline exterior-stair failure
are recorded in Browser/artifacts/east-rear-wall/validation.json. No failing
exterior snapshot was updated as part of this wall correction.

## East first-floor room enclosure (3 October 2026)

The owner's marked screenshot identifies R27's projecting wall beside its
north-facing doorway in the east cross range. Its first-floor variant removes
the tongue from approximately (46.614, 7) to (48.62, 7). A continuous L-shaped
return joins the existing western wall end at (45.1, 8.5351) to (48.62, 8.5351),
then (48.62, 7), following the purple floor line. The last 0.18 units beside
the opening support the retained green surround at (49.75, 7). The cream/red
masonry and dark skirting share the normal joined wall builder.

Both plan JSON copies and the first-floor SVG/PNG are updated. Visible walls,
collision, navigation, room discovery and notebook mapping derive from the
same floor-specific boundary. The existing C1 approach remains accessible.
The other three floors retain their walls and navigation cells. Ground-floor
R35/C6 changes and other concurrent workspace modelling edits were preserved.

The new test-asylum-east-first-wall.mjs regression passes 384 masonry/skirting
rays over both faces of the two new runs, three cleared old-wall locations,
joined endpoints, collision attempts from both sides, and room/corridor walks
in both directions. Its baseline mode rejects the original projecting wall.
It is included in npm test and test:asylum. The room-doorway survey now checks
R27's perpendicular return across its own exposed faces, instead of casting
from inside that return at the old broad-front position. All 89 doorways and
534 walking passes, all 112 supported frames, and all room/exit/stair routes
pass the final focused checks. Ceiling, window-clearance, joined masonry,
skirting, slabs and the other interior regressions also pass.

Six before and six after desktop/mobile game views complete without page or
shader errors. The cleared corridor, doorway join, room-side enclosure,
mobile view and regenerated first-floor drawing were visually reviewed.
Evidence, the original marked reference and full-suite output are under
Browser/artifacts/east-first-wall/ and Research/1829-interior-proposal/.

Only browser interior plan sources, checks, drawings and notes change for
this repair. The aerial compiler excludes this interior; no compiled aerial
rebuild is required or was performed. Unity, Blender and packaged application
exports were not regenerated.

Final validation for the first-floor enclosure: npm test passes every interior
check and stops at the previously recorded Jarman exterior-geometry snapshot.
All 33 remaining commands were run separately: 32 pass, and Leighton/Newton's
previously recorded exterior snapshot also fails. Neither exterior check
imports the interior plan; their expected snapshots were retained. Earlier
stair and annexe movement failures during concurrent modelling are resolved
in the final run. Full output and continuation results are saved under
Browser/artifacts/east-first-wall/r27/. The reviewed R27 images are kept in
that subdirectory to distinguish this room from nearby-corner comparisons.


## Rear staircase room wall connections (3 October 2026)

The owner's purple-line screenshot and request for every matching gap extend
the earlier R16 ground-floor repair to R5 and R16 beside stairs S3 and S4 on
both ground and first floors. Each floor-specific room variant marks southern
edge 2 solid, so general stair/corridor clipping retains the complete boundary
at z=-32.4. The west wall runs from x=-34.6 to -24.5 and the east from x=24.5
to 34.6. The doorway-side corners join the existing wall runs with matching
cream upper brick, red lower brick and dark skirting on both faces.

Rendering, collision, navigation and notebook mapping use those shared walls.
The established stairDeparture helper chooses sideways clear landing exits
for both rear stairs at both levels; room doorways and fire-exit lobbies remain
accessible. Reception's deliberately open stair hall and basement stair
access remain circulation spaces. This supersedes the earlier instruction
to retain R16's first-floor opening.

Both shared plan JSON files and the ground/first-floor SVG/PNG review drawings
are updated. The expanded test-asylum-east-rear-wall.mjs checks all four wall
closures with 768 independent masonry/skirting rays, 44 collision, approach
and complete stair walks, regularly fitted frames, joined corner endpoints
and an audit rejecting loose rear-stair wall ends. Its --baseline mode rejects
the original R5 ground-floor gap at the first fixed collision probe.

The new test-asylum-stair-room-walls-browser.mjs captures nine before and nine
after desktop/mobile exploration views of both wings and floors. Four actual
walker ascent/descent runs turn onto the clear landings and release their
flights. Doorway-side joins, matching room faces and phone rendering were
visually reviewed. The browser reports no page or shader errors. This check
is included in test:asylum. The actual game browser check also passes all 23 E
door round trips, release latches, basement/ground/first stair movement and
raised outside-landing movement.

Evidence is in Browser/artifacts/stair-room-walls/, including the original
shared plan, reference views, repeatable browser check, baseline rejection
and full-suite log. Only the shared interior plans, regression checks, review
drawings and notes were changed for this repair. Concurrent staircase-soffit
and unrelated exterior comparison work in the shared checkout was preserved.
The separate aerial compiler excludes the interior plan; its source hash
matches the existing compiled manifest, so no aerial model rebuild was needed.
Unity, Blender and packaged application exports were not regenerated.

The complete 114-command npm test run passes after this repair, including
all interior, exploration, stair, estate and protected comparison checks.
Its full output is saved in Browser/artifacts/stair-room-walls/npm-test.log.

## Redesmere courtyard fire-escape landing (3 October 2026)

The owner's walking screenshot identifies the middle landing on the east
courtyard's two-flight escape. Its wall-side edge beyond the pavilion was
unguarded, and two small patches inside the rail outline lacked floor. The
middle plate now reaches the inner guard bend without covering the lower
flight mouth. The outer turning plate fills its wall-side corner, and the
existing short rail continues from the pavilion's end to the outer guard.
The doors, flights and upper landing keep their existing geometry.

`Browser/dist/courtyard-photo-detail.mjs` supplies the repair to browser
exploration, gameplay and aerial construction. `test-exterior-stair-rails.mjs`
adds 50 ray-tested support points over the former holes, a level deck walk,
six attempted falls through the repaired edge, and both doorway approaches.
The original source fails at the first missing-floor sample. The repaired
scene passes 107 guards / 299 supported fall-prevention probes, the existing
upper-stair round trips, timeline removal and batched collision parity.
The clearance audit passes all 20 exterior flights / 2,340 tread and headroom
samples, 503 source landing-edge samples and 490 compiled landing-edge samples.

Five matching before/after browser views render without page or shader errors.
Visual review confirms a solid landing, joined wall-side railing and open
stair mouths. The aerial model was regenerated, and `npm run test:compiled`
passes source/compiled image and draw-count comparisons, full-detail and
fallback loading, all timeline stops and live walking-obstacle refresh.
Browser sources and local generated aerial assets are updated. Unity, Blender
and packaged app exports were not regenerated.

The full `npm test` run stops at the independent furniture assertion
"Compact book-filled shelves remain fixed". All 108 subsequent suite commands
were run separately: 106 pass; only the two whole-estate fingerprint checks
fail. Whole-estate Jarman and
Leighton/Newton fingerprints also differ when this repair's original courtyard
source is restored: both original counts are 31 primitives below their saved
references. Those reference files are left unchanged. Before/after fingerprint
reports, browser captures, build results and suite logs are retained in
`Browser/artifacts/redesmere-fire-escape/`; the original screenshot and modelling
notes are in `Research/exterior-stair-rails/`.

## Exterior door sill and course clearance (3 October 2026)

The reported west garden door is the blue double leaf at (-45.2, 19.59).
Its continuous lower window-sill strip ran across the leaf at y=0.53.
`west-front-photo-detail.mjs` now splits just that strip outside the frame,
retaining both sidelight ledges and every other window band.

The wider audit finds two more affected doors in the Larkton annexe recess.
`annexe-larkton-recess.mjs` stops their terracotta base course at the door
surrounds and omits the projecting window sill beneath the pale door's upper
lights. Authored glazing rails, panel details, thresholds, walls, roofs,
walking routes and ward placement remain intact.

`test-exterior-door-supports.mjs` now surveys projecting horizontal trim in
each leaf's axes, using individual instances, bounds and confirming rays.
All 109 exterior leaves pass across 1829, 1849, 1870, 1916, 1938 and 2021
(325 visible door/period checks), along with the existing ground-support
and annexe stair checks. Explicit authored glazing/panel rails are retained.
`DOOR_TRIM_BASELINE=1` restores only the two original builders in memory:
the new survey then detects four crossing strips across three doors and
fails at its clearance assertion. Historical annexe fingerprints are advanced
only after each preservation test passes with the two original builders restored.
Unrelated whole-estate reference fingerprints are retained.

The west and Larkton regressions probe the full reported strip heights and
retain neighbouring ledges, lower door panels, ward preservation and walking
checks. `test-exterior-door-trim-browser.mjs` captures the three doors and a
phone view, and probes their retained named sources in both procedural and
compiled aerial scenes before restoring batched render visibility.
Evidence, baseline sources, surveys and validation logs are in
`Browser/artifacts/door-trim/`. The local aerial model was regenerated.
Only browser sources, tests, modelling notes and local generated aerial assets
are updated; Unity, Blender and packaged exports were not regenerated.

## Restored asylum arrival animation (3 October 2026)

Starting Asylum Escape was counting synchronous run preparation toward the
three-second camera sequence. Chrome reproduction with the furnished asylum
spent 12.7 seconds preparing a run, then completed the entire arrival in its
first frame without showing the approach. `game.mjs` now resets the Three.js
timer after preparing the run. Arrival also limits each animation step to
0.25 seconds so a slow render or shader compilation cannot skip the flight.
The usual one-second exterior hold, 1.5-second approach/fade and half-second
Reception reveal remain; very slow rendering extends the visible sequence.
Player movement, pursuers and the gameplay timer remain frozen throughout.

`test-game.mjs` checks launch and retry after 12.7 seconds of accumulated
preparation time, the full exterior hold, five-second rendering stalls,
camera movement and the Reception handoff. `npm run test:arrival` also runs
the furnished game in Chrome, captures exterior/approach/blackout/reveal/inside
checkpoints, and checks desktop restart and mobile reduced motion. Captures
and validation are under `Browser/artifacts/arrival-animation/`.
The game-loop checks and all three Chrome launch/retry scenarios pass, with
zero gameplay time consumed and no page or shader errors. Removing either
timing protection is rejected by the regression checks.
The full `npm test` run passes the game, asylum, stairs and exterior checks
before stopping at `test-annexe-carden-correction.mjs:13`: the independent
protected-geometry snapshot has 19,568 primitives versus 19,567 expected,
with a different hash. That model check does not import the game loop.
This changes browser timing only; generated models, Unity and Blender
exports do not require regeneration.

Final validation: all 109 exterior doors pass the clearance/support survey
across six periods. The new negative regression detects the original four
strips on three doors. All three corrected doors and the phone view were
visually reviewed in source and compiled rendering, with no page/shader errors.
The regenerated aerial model matches the current source fingerprint; compiled
image/draw-count comparison, full detail and fallback checks pass. The timeline
check initially reached its final screenshot but failed to write that existing
image. The unchanged check passes when rerun with an isolated output directory.

The full npm test invocation reached Carden's historical annexe fingerprint.
Every remaining command was run separately. Eleven annexe fingerprint records
were advanced after all ten original preservation tests passed with only the
two pre-repair door builders restored; the west/Larkton/109-door repair checks
also passed first. Each record changes only its count and digest, and all ten
preservation tests pass again with the corrected model. Original reference
copies, before/after proof logs and the update list remain in the evidence folder.
Only Jarman and Leighton/Newton's independent whole-estate snapshots still fail.
Both also fail with the original door builders (31 primitives below their
reference counts); those unrelated reference files were left unchanged.

## Open room doors (4 October 2026)

The four browser interior floors now contain 87 open green timber room doors:
38 ground, 36 first, 11 basement and two second-floor leaves. P1 remains a
clear corridor connection, and R40's court porch stays open circulation.
Stair mouths and the open basement end remain unframed/open as before.
Existing room frames, outside doors and outside E interactions are retained.

`asylum-doors.mjs` derives hinges from the nearest visible perpendicular wall
belonging to each room, including facade returns slightly offset from the
proposed room envelope. Stable room/floor seeds vary target angles between
100 and 130 degrees. Zero degrees spans the aperture; 180 reverses the leaf
along the hinge-side wall. The complete swing is checked against the renderer's
mitred masonry and skirting footprints. Body, raised panels, knob and plates
use their actual dimensions; bisection stops the first obstructed swing at
wall contact. Eight current leaves are constrained, with first-floor R27's
L-shaped return limiting it to about 94.49 degrees. Long walls are included
even when their endpoints lie outside the local doorway bounds.

Painted leaves/panels share one new instanced draw per floor, reusing the
existing green paint; hinges and brass hardware reuse existing batches.
Door footprints enter walking collision and the navigation grid before
cells/spawns are calculated. The same geometry also blocks sampled NPC sight.
Furniture checks reserve leaves/hardware and complete shelf access strips.
R31 retains two stocked cases, moving the case on the door side from its
canted cheek to the end wall. The usual fixed/variable furniture rules remain.

`test-asylum-room-doors.mjs` checks every room/circulation classification,
hinge choice, repeatable angle, the 0/180 convention, actual instance centres,
2,088 rendered wall-edge rays, all eight wall contacts, 79 walked leaf
collisions and furniture clearance. Analytic and mirrored tight-room fixtures
verify handle contact below 100 degrees; a long-wall fixture rejects endpoint-
only collision filtering. Existing doorway checks pass 89 frames and 534
crossings. The window test now probes basement panes from the room-side
reveal, because an open leaf can legitimately stand between a doorway and
the outer window. The R27 masonry probe checks its return behind the leaf.
The furnishing survey passes eight seeds, 912 room/exit routes, all framed
door crossings, storage contacts/front clearance and NPC routes/spawns.

`npm run test:room-doors` also captures all hinge orientations, constrained
swings, the clear P1 opening and desktop/mobile views in Chrome. It checks
178 actual player doorway crossings and identical game/exploration poses,
with no page or shader errors. Evidence is in `Browser/artifacts/room-doors/`.
The new unit check is included in `npm test` and `test:asylum`; its browser
check is included in `test:asylum`.

Only browser interior sources, tests and modelling notes change. The compiled
aerial manifest still matches its current source hash and needs no rebuild.
Unity, Blender and packaged application exports were not regenerated.

The full `npm test` run passes the interior, furniture, game, exploration,
walking/stair and preceding exterior checks, then stops at
`test-jarman.mjs:11` on its existing protected whole-estate snapshot mismatch
(818,901 primitives versus 818,930 expected). That check imports only the
exterior model, whose compiled source fingerprint remains unchanged by the
room-door work. Its historical expected snapshot was retained. Full output is
in `Browser/artifacts/room-doors-suite.txt`; the final focused geometry and
Chrome checks pass in `Browser/artifacts/room-doors-browser.txt`.

## Approved top-floor layout and labelled doors (4 October 2026)

Applied the owner's approved rough plan in `Research/top-floor-layout-proposal/`.
Three windowed rooms now open from a compact passage: west R43 staff sitting,
central R41 records office and east R42 staff office. Window distribution is
2–1–2; every sash centre, width, height, sill and canted orientation is retained.
The unwindowed rear strip becomes R44 archive/storage, and the pocket beside
the front stair landing becomes R45 linen storage. The outer outline, floor
elevation and complete S1 footprint/flights/well/rails remain fixed.

C24 runs between z=11.2 and z=13.2, 2 units before wall thickness. C25 retains
the eastward stair departure through the existing 1.7-wide side approach.
Each room has its own framed inward-open door. Its plan-specific opening width
is 1.3, or 1.2 for linen, with the existing 1.9 default retained on lower floors.
R43's doorway moves 0.2 west of the rough drawing to x=-5.5 to retain a clear
navigation-grid column. The linen wall has a solid edge around its aperture so
general stair clipping cannot erase it. The shared layout uses each opening's
width for wall cuts, jamb fitting, leaf poses, walking and NPC navigation.

The owner requested labels on just these five doors. `asylum-door-labels.mjs`
mounts room-name plaques on both faces of the actual open leaves at height
1.75. Ten text planes share a 768×1280 atlas and one merged text draw; shallow
brass backings reuse the hardware batch. Non-mipmapped atlas rows have padding
to avoid neighbouring names bleeding together. The printed ink follows the
existing readable reception-print material convention. Lower floors have no
new labels. Escape and Explore build the same geometry.

Room-use mappings supply the existing furnishings, finishes and notebook names.
The compact records office has one bookcase, a desk and chair; R44 holds bulk
storage. Both shared plans and the architectural/furnished second-floor
SVG/PNG drawings are updated. The furnished drawing command accepts an optional
floor name so lower-floor drawings do not need regeneration.

Validation: `test-reception-second-floor.mjs` passes 90 unobstructed exterior-
aligned panes, five two-sided nameplates, closed room/storage boundaries, clear
stair/passage approaches, office desks/seating and 40 physically walked
furnished/unfurnished cross-floor routes. Chrome passes ten actual Reception
room round trips, identical Escape/Explore names, notebook discovery, desktop
and phone captures, and no page/shader errors. All five rendered names and the
rooms, passage, stair landing and plans were visually reviewed.

`test-asylum-room-doors-browser.mjs` passes all 184 actual doorway crossings and
matching Escape/Explore poses. The full `npm test` run passes all preceding
interior, furniture, game, exploration, stair/window/frame/finish and estate
checks, then stops at the existing `test-jarman.mjs:11` snapshot mismatch:
818,901 primitives versus 818,930 expected, identical to the prior room-door
run. The protected expectation is retained. Logs, saved original plan, images,
browser validation and preservation proof are in
`Browser/artifacts/top-floor-layout-proposal/implemented/`.

Preservation checks prove both shared plans match, all inputs outside the upper
rooms/corridors are identical, all three lower-floor walls/doors/navigation/
rails match the saved original, and the aerial source hash and compiled
manifest remain unchanged. The separate aerial compiler excludes these
interiors, so no compiled model rebuild is needed. Only browser sources,
shared plans, tests, notes and review drawings change; Unity, Blender and
packaged desktop/Android exports were not regenerated.

## Shallower Hampton / Ince end (4 October 2026)

The owner's red/yellow and purple/green screenshot guides pull both sides of
this west cross range inward by another two model units. The main body is
8.5 units deep, and the outer end is 11.5. Both octagonal bay profiles and all
18 windows retain their dimensions and follow their respective moved walls.
The host hip and attached garden bay roof meet at the new lower ridge; end
masonry, white base, bands, recess infill, stair and lean-to follow the outline.
D3, D5, D6 and F4's outside destinations follow the physical doors in both plan
copies. Interior outlines and door anchors retain their existing definitions.
See Research/west/end-depth-2026-10-04/README.md for the saved annotation and
superseding coordinates.

West geometry, walking, basement, stair clearance, roof joins, facade courses,
model checks, compiled/source images, full detail, fallbacks and all timeline
years pass. Actual compiled aerial and Explore pages pass 72 exposed octagonal
pane probes each, the moved-wall collision check and desktop/phone captures,
with no page/shader errors. The depth-only comparison preserves 1,443,585
primitives outside the marked range and both bay meshes/profiles exactly.
Matching before/after views, baseline sources and logs are in
Browser/artifacts/west-end-depth/.

The required npm test run was continued following the separate concurrent
inside-corner correction. The shifted court bay's old walking sample now uses
its actual face and passes. The only remaining failures are Jarman and
Leighton/Newton's historical whole-estate snapshots; both also fail with the
saved pre-change model. Their expected records are retained. The final local
compiled aerial matches the current source, including that independent corner
revision. Browser sources and local generated aerial assets are updated;
Unity, Blender and packaged desktop/Android exports are not regenerated.

## Tripartite windows: 2-3-2 pane columns (4 October 2026)

Matching flat sash groups now have two columns in each narrow sidelight and
three in their centre. `photo-detail-primitives.mjs` accepts `columns`, with
three as the default; the garden flanks, outer-end middle window and door
sidelights, rear-wing end window, and mirrored entrance elevations explicitly
select two for their side sections. All opening widths, heights, positions,
materials, outer frames, six rows, meeting rails, heads and sills are retained.

The pane audit checks 22 side sections and nine centres with 665 actual
pane/frame/rail rays, including the reflected rear group and east entrance.
The original 3-3-3 geometry is rejected. The scene comparison excludes only
the affected vertical bars and retains 1,445,709 other primitives and every
opening dimension exactly. The comparison incorporates the separate concurrent
west-end proportion edit, preserving that work. Forty-four third-position
bars become 22 centred bars, with only Float32 instance rounding allowed.

Evidence, reference, baselines, captures and validation logs are in
`Browser/artifacts/tripartite-panes/`. Browser sources and local compiled aerial
assets are updated; Unity, Blender and packaged desktop/Android exports are
not regenerated. See `Research/west/README.md` for modelling scope.

Final pane validation: source, compiled aerial and Explore each pass all 665
pane/rail probes. Before geometry is rejected; five corresponding desktop
views and both phone captures were visually reviewed, with no page or shader
errors. The rebuilt aerial manifest matches current source. Existing west
refinement, shared exterior, building-detail, binary-format, source/compiled
image comparison, full-detail, fallback and complete timeline checks pass.

The required `npm test` run passes all preceding checks and stops at
`test-jarman.mjs:11` on its saved whole-estate fingerprint. The same assertion
also fails with the original 3-3-3 pane builders restored (818,973 primitives
versus 818,930 expected); the updated panes account for exactly 22 fewer
primitives (818,951). The historical reference is retained. Output is in
`suite.txt` and `jarman-before.txt`; all focused pane/model/browser checks pass.


## Stepped west rear-court corner moved forward (4 October 2026)

The owner's yellow/purple/blue/red screenshot advances the outer stepped
rear corner four units towards the court: outerRearZ=9 becomes 5 and
recessRearZ=11 becomes 7. The recessed red return and its upper sash follow
equally. The low bay, masonry, windows, pipes, base, floor bands, cornices
and roofs derive their positions from the shared west-range plan. The main
court and garden faces retain z=5 and z=13.5; the outer garden end stays
z=20.5. See Research/west/rear-forward-2026-10-04/README.md.

The latest concurrent west-end proportion rule centres its 30% entrance
section on the full end. That pier, entrance and straight path follow the
extended end's new centre, moving two units towards the court. The path's
shape, rotation, scale and material remain exact. An isolated comparison
using frozen current model sources preserves all 1,443,573 other primitives
outside the marked cross range, both canted bay geometries/collision profiles
and all eighteen bay window dimensions. Earlier comparison records are kept
alongside the current proof in Browser/artifacts/west-rear-forward/.

The rear-corner regression checks actual brick planes, equal four-unit
movement, full roof coverage, exposed red-return panes and collision in the
newly occupied strips. The original rear limits fail its outer-depth check.
West refinement, shared exterior, basement passage, walking, roof contacts,
facade courses, periods and model/binary/layout/control checks pass.
Actual compiled aerial and Explore pages each pass 132 exposed pane samples,
both moved-wall collision checks, desktop/phone views and no page/shader
errors. The rendered roof joins and complete windows were visually reviewed.

The local aerial asset is rebuilt and its final source fingerprint matches.
Source/compiled image and draw-count comparison, full detail, missing/bad
asset fallbacks and every timeline stop pass. Independent workspace rebuilds
initially replaced the manifest during comparison. Its isolated rerun keeps
the already hash-checked manifest/binary chosen at test startup; original
fallback routes and assertions are retained. Actual page checks use the
ordinary server and current manifest.

The required npm test run reaches Jarman's historical whole-estate snapshot;
all remaining commands are then run. Only Jarman and Leighton/Newton's
protected whole-estate references fail. Both also fail with this correction's
original rear limits restored: 818,951 versus 818,930 primitives for Jarman,
and 882,998 versus 882,977 for Leighton/Newton. Their expected records are
retained. The remaining 32 commands pass. Logs, original sources, preservation
proof, matching images and final manifest metadata are in the evidence folder.

Browser sources, tests, modelling notes and local generated aerial assets are
updated. Unity, Blender and packaged desktop/Android exports are not regenerated.

## Additional west courtyard window column (4 October 2026)

The circled blank portion of the rearward west wing now has a complete sash
column at z=1.4 on its three existing floor levels. The lower 1.4 x 1.85 sash
matches the basement row; both upper 1.4 x 2.9 sashes match the taller rows.
The column follows the 3.9-unit bay spacing with matching divisions, heads,
sills and stone marker. The shared browser builder supplies aerial, Explore
and game geometry. The existing exterior regression now expects 27 outer
windows instead of 24 and retains its exposure checks. The lean-to retains
its arrangement. See Research/west/README.md for the modelling reference.

The west refinement, courtyard clearance/roof coverage, facade-course and
shared exterior checks pass. The local aerial model is rebuilt. Before/after
source, compiled and Explore desktop/phone views, twelve new-pane probes,
page/shader checks and broader validation logs are saved in
Browser/artifacts/west-court-extra-column/. Unity, Blender and packaged
desktop/Android exports are not regenerated.

Final validation: the required npm test invocation passed its first 65 checks
before an existing ground-contact report could not be overwritten. That
check passes with a separate report path. All remaining suite commands were
then run: only Jarman and Leighton/Newton's historical whole-estate snapshots
fail. Both failures also reproduce with the saved pre-change wing builder;
their reference records are retained. The completed column passes source,
compiled and Explore pane probes and desktop/phone visual review. The final
rebuilt model matches the current source fingerprint; source/compiled image,
full-detail and fallback comparisons pass. The timeline browser check passes.
Validation logs, baseline sources and all report outputs are kept in the
same evidence folder.

## West court roof-step masonry (4 October 2026)

The owner's purple-circled tiled face was the almost vertical slate closure
between the tall cross range and lower rear arm. west-court-photo-detail.mjs
replaces it with a solid vertical return using the adjacent photo-brick
material. Three joined white-render cornice profiles continue around its top;
the two existing pitched roofs retain their geometry. See
Research/west/roof-masonry-2026-10-04/README.md and the original builder,
matching views and validation in Browser/artifacts/west-roof-masonry/.

The updated west regression rejects the original tiled face. West geometry,
shared exterior, roof contacts, inside corners and all 25 joined facade-course
checks pass. The rebuilt compiled aerial and Explore pages each pass 12 brick,
12 trim and eight retained-roof probes with no page or shader errors. Desktop
and phone views were visually reviewed. Browser sources and local generated
aerial assets are updated; Unity, Blender and packaged exports are not
regenerated.


## Hampton / Ince courtyard windows and flat roof (4 October 2026)

The owner's green/red/purple/yellow game annotation identifies the lower
recessed pairs beside the polygonal court bay, its canted sashes and the low
stair-projection roof. Each green lower pair becomes one sash at x=-62.65,
the horizontal centre of the exposed wall between x=-61.65 and -63.65.
The upper pair and the four broader projection windows retain their exact
dimensions and positions. All six red canted sashes now share the central
purple sash's 1.30-unit glazing width, retaining centres, heights and divisions.

The yellow hip becomes a level slate deck at y=8.81, seated on the existing
masonry. A pale rim rises only 0.20 above it. The short roof pipe and its
adjacent overlapping run are removed so neither crosses the sash bank.
The far end downpipe remains. See Research/west/court-window-roof-2026-10-04.

West refinement, roof contacts, facade courses, shared exterior, basement
walking and the model suite pass. The added geometry checks reject the saved
original narrow sashes. Actual compiled aerial and Explore pages each pass
60 affected-pane probes, sash placement/width, flat deck and rim checks,
and removal of both local pipes, with no page or shader errors. Matching
desktop and phone views were visually reviewed. The opening comparison
preserves all 40 unmarked court windows and all 70 garden openings exactly.

The rebuilt source/compiled image and draw-count comparison, full-detail
loading and asset fallbacks pass. Concurrent shared-model edits required
rebuilds during validation; a separate screenshot-write failure was resolved
by redirecting only test output paths into this task's evidence directory.
Assertions and browser scenarios are retained. Final timeline evidence is
in Browser/artifacts/west-court-window-roof/timeline-final.txt.

The required npm test run passes preceding checks and stops at Jarman's
historical whole-estate snapshot (818966 primitives versus 818930 expected).
Of the 33 remaining commands, 32 pass; Leighton/Newton's historical snapshot fails.
Both failures also reproduce with the saved original courtyard source; their
expected records are retained. Before/after images, original sources, pane
checks, preservation proof and logs are in Browser/artifacts/west-court-window-roof.

Browser sources, regression checks, modelling notes and local generated aerial
assets are updated. Unity, Blender and packaged desktop/Android exports are
not regenerated.

Final courtyard validation: the complete timeline browser check passes every
source/compiled year, selection, navigation, phone and live walking collision
check. The final local aerial asset is rebuilt after the latest independent
shared-model edit, and its source fingerprint matches. Saved manifest metadata
is in Browser/artifacts/west-court-window-roof/final-model.json.

## West inside-corner wall extension and flat roof (4 October 2026)

The owner's yellow guide extends the lower wall into the open corner between
the garden pavilion and west forward wing. The new perimeter follows
x=-33.65 from z=15.5 to 18.5, steps across to x=-32, then meets the low wing
at z=21.2. Matching brickwork supports a flat dark roof at y=8.83, level with
the existing lower eaves, and continuous pale coping with joined corners.
The four former lower-return sashes move onto the two longitudinal walls;
the landing windows and doorway remain exposed. A single solid footprint
supplies walking collisions throughout the new section. The upper back wall
retains its earlier z=15.5 alignment. See Research/west/flat-corner-2026-10-04/.

The focused corner check passes five level-roof samples, three exact wall
planes, occupied and clear footprint samples, all 104 corner pane probes,
physical doorway access and collision with the new outer wall. Source,
compiled aerial and Explore each pass the five roof, three wall and 52 west
pane probes; Explore reaches the doorway at z=15.8125. Desktop and phone
views were visually inspected, with no page or shader errors. West refinement,
roof contacts, exterior geometry and binary-format checks also pass.

Browser sources and local aerial models are updated. Unity, Blender and
packaged desktop/Android applications are not regenerated. The marked image,
saved original source, repeatable captures, page probes and validation logs
are in Browser/artifacts/west-flat-corner/.

Final roof-step validation: the complete suite was continued after updating
the facade-course count for the three new joined cornices. Only the existing
Jarman and Leighton/Newton whole-estate snapshots fail; both also fail with
the original tiled-face builder. Their expected records are retained.
Concurrent west-roof edits repeatedly invalidated the live manifest during
checks, so source/compiled image and draw-count comparison, full detail,
missing/incompatible/corrupt asset fallbacks and every timeline stop were
verified against a consistent local source snapshot. Actual compiled and
Explore corner probes and desktop/phone views also pass for that snapshot.
Evidence and fingerprints are in Browser/artifacts/west-roof-masonry/.

## Raised and joined west cross-range roof (4 October 2026)

The purple-marked small hip now continues the main ridge at y=17.08, roughly
0.6 above its former crown. The garden shoulder covers the outer pavilion
brick strip; the court pitch meets the polygonal bay above its rear brick
and cornice. Sampled shared edges match the retained slate, including the
middle garden branch valley. Overlapping old roof faces are cut away.
The wall outlines, windows and walking routes retain their definitions.
See Research/west/roof-join-2026-10-04/README.md.

The new roof regression checks both marked contacts, ridge continuity,
upward faces and shared-edge heights. Disabling the new helper reproduces
the uncovered-pavilion failure. Existing west refinement, exterior geometry,
inside-corner, courtyard and roof-contact checks pass. Source and compiled
views were visually reviewed from the marked, opposite and courtyard angles;
21 visible compiled-scene roof probes cover the marked masonry, with no
page or shader errors. Source/compiled rendering, full detail and asset
fallback comparisons pass. Evidence is in Browser/artifacts/west-roof-smoothing/.

Browser modelling sources, the roof regression, modelling notes and the
local compiled aerial model are updated. The saved final manifest matches
current source. Unity, Blender and packaged application exports are not
regenerated.

After the concurrent facade-course consolidation, the final live workspace
passes all 22 explicit courses, 3,000 surface probes, 36 complete-scene west
probes, west refinement and all 3,888 roof-contact probes. This supersedes the
intermediate count of 25 courses above. The final live aerial asset was rebuilt
and its source fingerprint matched at completion.

Final west inside-corner validation: the npm test run, continued commands and
direct reruns complete 124 checks, with 122 passing. The two failures are the
historical Jarman and Leighton/Newton whole-estate records; both also fail
with the saved original inside-corner source. Three furniture checks timed
out in the continuation runner and pass when invoked directly. The initial
shared facade-count failure also passes after the concurrent facade update.
The new adjacent west-roof-join check passes. Expected estate snapshots are
not rebased.

The full compiled rendering comparison passes once, including image similarity,
exact draw counts, full detail, controls and fallback assets. Final complete
compiled/timeline reruns were interrupted by concurrent west-roof source edits
and a shared screenshot file lock. The delivery model was rebuilt afterward
and matches the current source fingerprint. Its checksum, five flat-roof
probes, period-split collision footprints and four moved sash records pass
the scoped compiled-asset check. This verifies the delivered corner without
claiming a successful final complete compiled/timeline run. Evidence is in
Browser/artifacts/west-flat-corner/.

Final roof validation: the independent low stair-bay deck is retained in full.
The new join remains above y=14.5; the final source and compiled side views
have no hanging slate strips. The required npm test invocation passed its
preceding checks and stopped at Jarman's historical whole-estate snapshot.
All 33 following commands ran separately: 32 pass and Leighton/Newton's
historical whole-estate snapshot fails. Both protected snapshot assertions
also fail with the roof helper disabled; their expectations are retained.
The final source/compiled geometry and rendering, full detail and fallback
comparisons pass. The final manifest again matches current source.

The final timeline rerun passes all source/compiled periods, reloads, camera
navigation, selections, keyboard controls, mobile views and live walking
collision refresh. Its screenshots use this change's own compiled-tests
directory after an existing timeline screenshot could not be overwritten.
Only output paths are redirected; assertions and scenarios are retained.
The successful result is in Browser/artifacts/west-roof-smoothing/timeline.txt.

## West render bands and cornice corners (4 October 2026)

The owner's yellow strip was doubled by the low forward root's cornice and
roof support projecting through the taller garden pavilion. Their trim-only
footprints now exclude that pavilion and its existing band projection. The
masonry/foundation footprints and slate roof geometry retain their definitions.

The outer end's former 4.08 / 8.8 bars now share the adjoining 4.05 / 8.6
levels. Two 0.18-high courses follow the court steps, both entrance-pier
returns, the outer front and garden bays continuously. Three level cornice
profiles wrap the outer end and front corner, with the centre gutter aligned
to them. Both middle garden-bay cornices also join their straight stems and
canted corners. See Research/west/render-corners-2026-10-04/README.md.

Validation: all 22 swept courses, 117 explicit corners, 282 shared ward/court/
shop corners, 3,000 top/underside samples and 36 complete-scene west samples
pass. The original trim builders fail the new corner regression. A separate
comparison preserves all 1,459 originally textured masonry/roof/ground meshes,
1,366,356 mapped instances and 701 photo openings exactly; render/stone trim
is excluded from that preservation comparison. West geometry, roof contacts,
inside corners, basement walking, stairs, collisions and period checks pass.

Actual source aerial, compiled aerial and Explore pages each pass 36 trim
and 16 exposed-pane probes, seven desktop views and a phone view with no page
or shader errors. The broader facade browser survey passes 18 source and 18
compiled views, including Upton, Irby/Ashley, Hale, Farndon and Laundry.
Before/after, actual-page and wider corner captures were visually reviewed.
Compiled/source image and exact draw-count comparison, full-detail and all
missing/incompatible/corrupt-asset fallback assertions pass. The full timeline
browser check passes every period, navigation, phone and walking checks.
An existing timeline screenshot could not be overwritten; its isolated rerun
changes only the output directory and retains every original assertion.

The required npm test passes its first 90 commands and stops at Jarman's
historical whole-estate snapshot. All remaining 33 commands are then run:
32 pass and only Leighton/Newton's historical snapshot fails. Both failures
also reproduce with the saved original trim builders restored in the current
model: Jarman 818,966 versus 818,930 expected; Leighton/Newton 883,013 versus
882,977 expected. Current counts are 818,947 and 882,994. Their protected
reference records are retained, and the complete suite is not called passing.

The final local aerial asset is rebuilt after the independent concurrent
roof update and matches the current source fingerprint. Browser sources,
tests, research/development notes and local generated aerial assets are
updated; Unity, Blender and packaged desktop/Android exports are not
regenerated. Baselines, scripts, logs, captures and final reports are in
Browser/artifacts/west-render-corners/.
## West roof rebuilt from marked ridges (5 October 2026)

The owner's blue-circled roof view and yellow overhead guide replace the
earlier sampled roof patch with a continuous main ridge and four joined
branches. All crowns are at y=17.08; the main ridge runs along z=9.25 from
x=-68 to -30.6. Straight slate pitches, shared inside-corner valleys and
hipped branch ends follow the marked plan. Intersecting old faces are cut
away, and the eastern end follows the retained lower roofs' actual creases.
Matching brick closes raised perimeter edges. The mirrored rear wing keeps
its transform and unmarked rear ridge, and the independent low flat roofs,
wall footprints, glazing and walking routes retain their definitions.
See Research/west/roof-ridges-2026-10-05/README.md.

The ridge regression checks the whole main line, all four branches,
descending pitches, shared valleys, eastern contact, solid masonry below
raised edges and the retained low deck. The saved original builder fails
the new main-ridge assertion. West refinement, exterior geometry, inside
corners, roof contacts (108 attachments / 3,888 probes), facade courses
(22 courses / 3,000 surface probes) and binary-format checks pass.

Actual compiled aerial views pass 32 visible roof probes and have no page
or shader errors. Overhead, court, garden and end views were reviewed.
Compiled/source rendering, exact draw counts, full detail, controls and
missing/incompatible/damaged-asset fallbacks pass. The image comparison
finds a 0.000166 significant-pixel fraction and 0.00560 mean channel error.
Every source/compiled timeline stop, mobile view, navigation/selection and
live walking collision refresh passes.

The required npm test invocation passed its first 63 commands before the
turn interruption. All 61 remaining commands completed separately: 59 pass,
and only Jarman and Leighton/Newton's historical whole-estate snapshots fail.
Both failures also reproduce before this roof edit; their expected records
are retained. This accounts for all 124 suite commands, with 122 passing,
and does not claim a clean full-suite result.

Browser sources, regressions, modelling notes and the local compiled aerial
model are updated. The final manifest matches the current source hash and
its binary checksum is verified. Unity, Blender and packaged desktop/Android
exports are not regenerated. Baseline sources, references, captures, probes,
suite logs and final-model.json are in Browser/artifacts/west-roof-ridges/.

## Consistent horizontal roof tiles (5 October 2026)

All sloping tiled roofs now use level horizontal tile rows and one physical
tile scale, matching the existing shared slate map. The long tile edge follows
each face's horizontal contour; courses follow the slope at right angles.
The mapping measures final world-space geometry, including mirrored, rotated
and scaled buildings, and runs again after layout assembly adds the service
roofs. It is baked into ordinary UVs before aerial batching and compilation.
The outhouse's independent weathered tile map is compensated to the same tile
dimensions. Roof shapes, normals, colours, texture pixels, flat decks and
walking geometry are preserved. See Research/roof-tiles/README.md.

The full source survey covers 316 tiled meshes and 1,923 sloping triangles.
Source and compiled surveys also exercise an indexed transformed hip and
check horizontal long edges, perpendicular courses and uniform tile size;
the compiled survey includes render batches. Before/after preservation checks
retain every roof triangle and all other geometry, transforms and colours.
Seven compiled desktop views, the source service roofs and a framed phone
view pass visual checks with no page or shader errors. Final source/compiled
rendering, exact draw counts, full detail and fallback loading also pass.

The required npm test invocation and continuations account for 125 checks,
with 123 passing. Only Jarman and Leighton/Newton's existing whole-estate
snapshots fail, also with the saved original roof sources. Their records are
retained. Fifteen annexe reference files have their affected texture hashes
refreshed after original-source checks and an independent geometry audit;
numeric counts, roots, dimensions and the Carden height correction remain
exact. Ward and mirrored-link checks retain triangle-shape comparisons while
allowing independent UV storage. Browser source and the local compiled aerial
asset are updated and its fingerprint/checksum verified; Unity, Blender and
packaged desktop/Android exports are not regenerated. Evidence and repeatable
checks are in Browser/artifacts/roof-tiles/.

## Test repairs after the roof work (5 October 2026)

The completed roof tasks left two stale whole-estate references. Reconstructing
134 historical modules at db70a03 reproduces both original count/hash pairs
exactly. An independent primitive audit separates unchanged records, roof UV
updates and the documented building, basement, access and recessed-door
repairs. The reviewed snapshot refresh checks every changed structural region,
the exact west entrance-path translation, unchanged Leighton/Newton dimensions
and stable modelling inputs before advancing the two references. Jarman now
protects 818,948 primitives and Leighton/Newton 882,995. Their scope rules and
all geometry, glazing, walking and visibility assertions remain enabled.
Research/jarman/README.md and Research/leighton-newton/README.md record the
superseding evidence; scripts and reports are in Browser/artifacts/test-repair/.

Twelve browser checks previously started fixed-port servers and navigated
before those servers were listening. The shared test-support/server.mjs helper
waits for the actual listening address, allocates an independent port and
reports startup errors. Both concurrent servers return successful responses.
The four reproduced connection failures pass their reruns. The rear-stair wall
check moves only its east first-floor room camera from x=33.5 to x=33.3, clear
of R16's projecting door panels. Its nine views, clearance assertions and all
four actual stair walks pass; the corrected view is inspected. The room-finish
check also passes with the verified hardware launcher after its earlier
software-rendered startup timeout. Later browser checks use the shared GPU
launcher introduced by the independent hardware-acceleration task, which
verifies the NVIDIA GeForce RTX 3090 Ti before rendering. Captures are isolated
under Browser/artifacts/test-repair/hardware-media/.

The separate exterior-door trim check still aimed at the superseded D3 garden
position. Its twelve garden-leaf probes and desktop/mobile cameras now target
x=-44.70, z=13.59, matching the reviewed centred window bank and current
outside arrival. All seventy-two garden and annexe leaf probes pass across
source and compiled scenes; the corrected compiled view is inspected. The
shadow negative control explicitly starts with the daylight sun and refreshed
scene transforms. Both original-defect controls still fail as intended; the
corrected settings pass 98,304 sunlit receiver pixels and 288 courtyard contact
samples across day, dusk and night. The independent GPU testing update records
the driver-dependent negative-control count; repaired-core thresholds remain
unchanged.

NativeAndroid/tools/test-assets.mjs now delegates its historical command to
the current schema-three test-port.mjs validation. The old command checked the
retired schema-one prototype and seven exits. The current validation checks
asset hashes and finite indexed geometry, source freshness, all thirteen
periods, all four floors, twenty-three reachable doors, exact navigation,
collision data, guard rig and seventy-three local pictures. The authoritative
NativeAndroid/tools/build.ps1 -Target Prepare completes the asset export,
presentation checks and Unity scene preparation. Both current native checks
and the original test-assets command pass.

The complete Browser npm test passes all 125 commands, including both repaired
references. All 53 additional top-level browser checks pass after the recorded
reruns, covering all 175 browser test files plus the three vendor checks. The
compiled roof-tile mode also passes. Final test receipts, including initial
failures and their successful reruns, are indexed by final-validation.json.
Desktop npm test passes all eight tests. Its development smoke check also
passes offline assets, renderer isolation, persistent storage, the game and
notebook, compiled aerial timeline, mouse capture, walking and return navigation.
The desktop smoke launcher enables hardware rendering and refuses unverified
or software WebGL; its own renderer is the same NVIDIA GPU. Current web assets
are staged for this development test. The modelling source hash remains
f4e7771bb635db6d408703342f156c3aa1552c973206c21d441cc0a1a4d54a30 throughout
these repairs. Browser compiled assets remain current; local Unity model and
presentation assets and the prepared scene are refreshed. Android APK,
packaged Windows application and Blender exports are not regenerated.

## Local tests use hardware acceleration (5 October 2026)

Local browser tests, visual captures and the Three.js benchmark now use the
shared `Browser/test-support/hardware-browser.mjs` launcher. It enables GPU
rendering, disables software rasterizer fallback and checks the unmasked WebGL
renderer in a fresh context before any test mocks. Software rendering or missing
renderer information stops local validation. `npm run test:gpu` verifies launcher
usage, rejection of software flags and an actual rendered pixel. Ordinary model,
geometry and game-logic assertions continue to run on the CPU.

The existing GitHub Pages and Windows packaging workflows explicitly opt into
SwiftShader for their compiled-scene checks because their hosted runners have no
GPU. The exception requires both `CI=true` and `BROWSER_CI_SOFTWARE=1`; the local
GPU smoke test refuses this mode. Local source/compiled timeline and foliage
checks expect the normal visible-tree default. Software/restricted renderer
information is simulated on the GPU when testing automatic tree visibility.
Historical capture scripts should use the shared launcher when rerun locally.

The original courtyard-shadow settings expose one leaking contact on the RTX
3090 Ti rather than the ten formerly required by the software-rendered negative
control. The regression now requires at least one original leak, preserving its
ability to reject the old settings. The repaired settings still have to satisfy
every core contact and all sunlit receiver pixels; their thresholds and sample
coverage are unchanged.

Validation uses the NVIDIA GeForce RTX 3090 Ti through Direct3D11. The GPU smoke
check, tree renderer profiles, compiled/source comparison and fallback loading,
all timeline stops, intro navigation, real mobile touch controls, source/compiled/
walking lawn wind and collisions, and courtyard shadows all pass. The shadow
survey checks 98,304 receiver pixels and 288 contacts. Desktop and portrait
captures were visually checked. All 125 commands in `npm test` pass. A separate
mocked-launch policy check verifies that only the explicit hosted-CI configuration
permits software rendering, without performing local software rendering.

Logs, captures, diagnostics and the output-only redirection hook are under
`Browser/artifacts/hardware-acceleration/`. Modelling sources, generated scene
assets, Unity and Blender exports are not changed by this testing update.

## Continuous west garden lawn (5 October 2026)

Removed the raised west garden grass box. Its top was y=0.37, while the
adjoining terrain was y=-0.15, leaving a 0.52-unit step across the open lawn
at z=25.5. The garden now uses the single continuous estate terrain. The older
access slab clears the garden and its narrow return to the pavilion, keeping
gameplay grass exposed too. The lean-to approach retains its original top,
with textured gravel contact faces extending below the lawn.

The existing exterior and timeline checks now require terrain on both sides
of the former seam, throughout all thirteen periods, before/after batching,
and in the source/compiled aerial and walking pages. Ground-contact checks
cover all periods and all four layout states. GPU-verified source and compiled
views show continuous grass and solid path sides. The renderer was NVIDIA
GeForce RTX 3090 Ti through Direct3D11. A saved copy of the current scene passed
the complete source/compiled geometry and image comparison, full detail,
controls, missing/incompatible/corrupt-model fallbacks and timeline/walking
browser checks; the saved copy avoids concurrent roof edits invalidating the
manifest during validation. Source and compiled captures probe 25 garden
points each, including the former internal edge.

The required npm test run and continuation cover all 125 configured commands:
122 pass. test-west-roof-join.mjs fails during the concurrent roof work, and
the Jarman and Leighton/Newton whole-estate fingerprints differ after these
modelling edits. Their stored protected baselines are retained. The initial
compiled-suite roof-tile assertion also failed during that roof work; the
source/compiled and timeline checks were then run independently against the
saved scene. Current model rebuilds and the early interrupted/fallback checks
are recorded under Browser/artifacts/west-garden-level/.

See Research/west/grass-level-2026-10-05/README.md for the owner's marked view
and source scope. Shared browser sources and local generated aerial models
are updated; Unity, Blender and packaged exports are not regenerated.
Final working-scene rebuild and source/compiled garden capture pass with
matching source fingerprint a0edbbca072bbcde7b38c4a32c7e56cfd689edc53b320d55860d495a841b2edf.
The final captured approach uses the shared contact-face helper, preserving
normal gravel detail on its vertical sides. The saved-scene timeline browser
check passes every stop in both aerial loading paths and the walking page.
## West roof wall-top eaves and added entrance ridge (5 October 2026)

The owner's three follow-up views identify the remaining two corner gaps,
require the long slate pitches to finish on the blue wall-top lines, and add
a perpendicular ridge on the red line over the entrance-side bay. The earlier
yellow main ridge and four branches keep every coordinate and crown height.
The long eaves now meet the main cornice at y=14.53. Short shared pitched
returns join the higher bay cornices; a small stepped hip covers the taller
outer corner masonry that previously protruded through the slate. The new
entrance-bay ridge follows x=-27.3, z=12..18.3 at y=15.66, joining the retained
roof envelope at its root and ending in a hip. Its pitches are clipped at
exact roof-plane intersections, preserving the existing yellow entrance
ridge and removing the replaced underlying triangles. See
Research/west/roof-eaves-2026-10-05/README.md.

The roof regression retains the whole original main line and all four branch
checks, descending pitches, continuous valleys and lower-roof contacts. It
adds level wall-top eaves, complete-scene ray checks through both circled
corners, taller-wall coverage, the new ridge and its shared valley. The saved
former builder fails the new wall-top-eave assertion. The older raised-edge
masonry checks now probe below the lowered cornice; their former high-edge
expectations are superseded by the owner's latest blue-line request.

Hardware acceleration is verified as NVIDIA GeForce RTX 3090 Ti through the
required hardware-browser launcher. Matching source and actual compiled views
pass all 56 visible probes, including the seven circled-corner rays, nine
wall-top contacts, original ridge lines and new ridge. There are no page or
shader errors. Court, garden, overhead, end and entrance-junction views were
reviewed. Compiled/source rendering and draw-count comparisons, full detail,
asset fallbacks and every timeline stop including mobile views, selection,
controls and walking collision refresh pass. The significant-pixel fraction
is 0.000122857 and mean channel error is 0.00316810.

The required npm test invocation passes its first 91 commands and stops at
Jarman's historical whole-estate snapshot. All 33 remaining commands were
then run: 32 pass, and only Leighton/Newton's historical snapshot fails. Both
snapshot failures also reproduce with the saved former roof. Thus all 125
suite commands are accounted for: 123 pass and two pre-existing snapshots
fail. Their expected records are retained; this is not a clean full-suite
result.

Browser roof source, its regression and modelling/validation notes are
updated. The local compiled aerial model is regenerated. A formatting-only
refresh preserves the exact tested binary checksum, and the final manifest
matches the current source fingerprint. Unity, Blender and packaged
application exports are not regenerated. References, saved former source,
matching captures, 56-probe results, complete-suite accounting and
final-model.json are in Browser/artifacts/west-roof-eaves/.


## West garden staircase door wall and walkway width (5 October 2026)

The ground photograph moves both exterior landing doors off the outer
pavilion side return onto the recessed garden-facing wall.
Browser/dist/west-garden-stair.mjs now supplies 1.2-wide treads and door
walkways, a constant-width upper L and a 1.2-deep middle turning deck.
Parallel flights leave the middle wall-side approach unobstructed. Both
existing door heights and the ground-floor side sash are retained.
Reference and fitted coordinates are in Research/west/stair-2026-10-05/.

Both shared JSON plans move the F4 outside arrival and exterior stair
polyline onto the new approach, retaining the established interior anchor.
Separate outsideAxis/outsideFacing metadata lets Escape and Explore face
along the new garden approach on leaving, while keeping the interior door
orientation. The upper exterior door remains outside the playable wing
proposal. Browser sources and the local compiled aerial model are updated;
Unity, Blender and packaged exports are not regenerated.

The new regression checks actual relocated blue leaves, removal of the old
side-wall leaves, full-width visible floor, arrivals, facing, stopped and
restarted climbs/descents, guards, batching and period removal. The saved
original source fails the new wall assertion. Existing outside, west, rail,
door-support, route, game and exploration checks pass. The general facade
check now starts beside the window: its former distant ray crosses the
relocated stair tread, a natural occlusion rather than buried glazing.
The old staircase passes that former ray; the corrected facade check passes
the new source without excluding any rendered objects.

Hardware rendering is verified on the NVIDIA RTX 3090 Ti through the shared
launcher. Actual Explore reaches both doors, walks both directions, enters
and leaves F4 and checks the new outward camera facing. Ground, landing,
overhead and phone images are inspected. The rebuilt aerial passes all 20
flight headroom checks, source/compiled image and draw comparisons, full
detail, missing/incompatible/corrupt asset fallbacks and every timeline stop.
The final manifest matches the current source fingerprint.

The required npm test and remaining-suite continuation cover all 126 checks.
After the facade-probe rerun, 124 pass. The historical Jarman and
Leighton/Newton whole-estate snapshots still fail and also fail with this
staircase source restored to its saved former version. Their expectations
are retained. The final camera metadata and interaction changes pass fresh
focused route/game/exploration and hardware-browser checks. Evidence, the
initial and final suite reports, original source and build/validation logs
are in Browser/artifacts/west-garden-stair/.

## West forward-wing photo fire exit (5 October 2026)

The owner's purple-circled model view identifies the F5 masonry return stair
at the south end of the west forward wing. The two supplied ground photos
replace its earlier plain-tread interpretation. The shared browser builder
Browser/dist/west-forward-fire-exit.mjs adds dark stone treads with narrow
yellow nosings, closer black pickets, three curved frames on each flight and
two on the upper balcony, brick cheeks and a brick balcony pier with dark
fascia. The existing facade, blue F5 door, transom, parallel flight lanes,
intermediate turn and doorway landing keep their fitted positions. The lower
frames start around the middle of the flight, avoiding burial in the high
central brick support visible beside its foot. Dimensions remain estimates.
See Research/west/forward-fire-exit-2026-10-05/README.md and the unedited photos.

The shared guard helper accepts an optional picket spacing; its default is
unchanged for other stairs. Walking treats the masonry treads and landings
as floor support while retaining the new cheeks and balcony pier as solid
obstacles. Curved crowns have real tested standing headroom; their side posts
coincide with guarded edges. Yellow paint does not add walking obstacles.

At the owner's request, final validation is restricted to this exit, the
adjacent west-wing facade and immediate approach; no full-suite retest is
performed. test-west-forward-fire-exit.mjs passes 24 steps, eight arches,
24 actual crown headroom rays, stopped/restarted F5 ascent/descent, fall
prevention, solid pier, clear front path, eight exposed facade openings and
batched walking. The actual hardware browser walks up, uses F5 both ways and
walks down, and captures the two photo angles, balcony, overview and phone
view without page or shader errors. Hardware acceleration is verified as
NVIDIA GeForce RTX 3090 Ti through the required launcher. Initial pre-steering
checks also passed the existing exterior headroom, guard and facade checks.

Browser sources and local generated aerial models are updated. Unity,
Blender and packaged application exports are not regenerated. Saved former
source, original captures, final captures and browser comparison results are
in Browser/artifacts/west-forward-fire-exit/. npm run test:west-fire-exit
runs only the focused logic and hardware-browser checks (after build:models).

The final source/compiled comparison passes all five local camera views, with
matching scene triangle and draw counts and image differences below the
existing visual tolerance. The comparison fixes cloud/foliage motion through
reduced-motion settings and counts the scene separately from the selection
glow overlay. The last compiled manifest matches the final source fingerprint
and its binary checksum; final-model.json records both checks. No further
estate-wide checks were run after the focused validation completed.

## Entrance ridge relocation and slate/render contacts (5 October 2026)

The owner's yellow/orange/blue view moves the entrance-side branch from
x=-27.3 to x=-25.8, retaining y=15.66 and z=12..18.3. The yellow entrance
ridge, higher west cross-range ridge and four original branches retain their
coordinates and heights. See Research/west/entrance-ridge-shift-2026-10-05/README.md.

The entrance cornice exposes its inner upper-cap boundary to the shared roof
builder. Narrow joined slate pitches meet that boundary and sample every
existing roof crease along their inboard seams. The former roof fringe is
removed through the full overhang. The front hip meets the cornice at
z=19.625, y=13.69, and the side returns use the actual sloping render edges.
Walls, doors, windows, stairs and walking outlines are retained.

The west roof regression passes retained and relocated ridges, removal of
the former orange branch, valleys, hip, exposed cornice and 404 physical
roof/render samples. The saved previous roof fails the moved-ridge assertion.
The adjoining inside-corner regression passes, including its seam across
the actual render edge, 104 pane probes and existing roof closures. West
refinement and the shared exterior's roof checks pass. Assertions that used
the old slate overhang now check the new exposed render or the inward slate
edge, retaining the unaffected east-side checks.

Hardware rendering is verified on NVIDIA GeForce RTX 3090 Ti via Direct3D11
with the shared launcher. Matching source and compiled entrance, close,
low, overhead and portrait views were inspected without page/shader errors.
The compiled visible scene passes 29 retained-ridge probes, eight relocated
ridge probes and thirteen render-edge contacts. Source and compiled ridge
heights match exactly; the cornice intersection survey finds zero crossings.
Validation is kept to 1829 and its directly adjoining roof/render junctions;
no complete estate suite was rerun, following the owner's scope instruction.

The local compiled aerial model is regenerated using the hardware launcher.
Its final manifest matches the current modelling fingerprint, and the saved
binary checksum is verified. Shared browser geometry applies to aerial,
Explore and gameplay. Unity, Blender and packaged exports are not regenerated.
References, saved former roof, captures, build log and final-model.json are
under Browser/artifacts/entrance-ridge-shift/. Concurrent source changes are
preserved, including the white cornice material correction.

## West courtyard downpipe relocation (5 October 2026)

The owner's orange/blue annotation moves the far-end courtyard pipe beside
its low flat-roofed projection, between the paired projection sashes and the
next outer sash. Browser/dist/west-court-photo-detail.mjs moves x=-71.70 to
x=-66.55, retains z=4.74 and brings the top from y=12.60 to the blue guide's
low roof rim at y=8.91. Its iron material and 0.085-square section are retained.
See Research/west/drainpipe-2026-10-05/README.md for the reference and coordinates.

Validation is restricted to this west building and its immediate courtyard
surroundings at the owner's request. The existing west-building regression
passes the relocation, old-position clearance, height and adjacent glazing.
Hardware-rendered source and rebuilt compiled courtyard/close views each
pass 20 local visible probes without page or shader errors. Both views have
matching draw/triangle counts and pass the existing image comparison tolerance.
The required hardware launcher verifies the NVIDIA GeForce RTX 3090 Ti through
Direct3D11. The regenerated manifest matches the current modelling source.
Before/after captures and receipts are under Browser/artifacts/west-court-drainpipe/.
Shared browser sources and the locally generated aerial model are updated;
Unity, Blender and packaged application exports are unchanged. No full-suite
retest is performed for this edit.


## West descending roof edges and white render joins (5 October 2026)

The owner's blue/purple court guide and blue garden follow-up correct both
outer-pavilion junctions. Their descending ridges end on the tall cornices,
with continuous slate pitches and solid white returns down to the lower
eaves. The court cornice continues around its side, its riser is capped
under the adjacent roof plane, and the recessed gutter clears the white
face. Main ridge and branch coordinates are retained by this correction.
See Research/west/roof-render-joins-2026-10-05/README.md. AGENTS.md records
the requirement that slate cannot cross the middle of rendered trim.

The dedicated test-west-roof-render-joins.mjs passes both descending
ridges and pitch continuity, 244 physical roof/render probes, ten outward
white-face probes and gutter clearance. It fails with the saved original
west roof sources. The shared roof test also retains these assertions;
its old circled pixels now require their intended render where appropriate.
Assertion failures name surfaces and coordinates rather than expanding
complete material/texture objects.

Two tiny clipped entrance-west roof meshes opt into local UVs to avoid
Float32 loss. Subtracting whole texture repeats preserves the pattern
phase and triangle positions/normals. An indexed hip test independently
checks that preservation. Source and compiled tile surveys passed this
precision correction before further concurrent roof revisions.

Hardware rendering is verified as NVIDIA GeForce RTX 3090 Ti, including
each local model rebuild through hardware-browser.mjs. Actual source and
compiled scenes each pass 25 visible-surface probes, with desktop, low
angle, complete garden elevation and phone captures; no page/shader
errors occur. The compiled binary checksum is verified. Its fingerprint
was superseded by further concurrent model edits before report time. Capture start/end fingerprints are saved.

The required npm test run and continuation previously accounted for all
126 commands: 124 passed; Jarman and Leighton/Newton's
historical whole-estate snapshots also failed with the saved pre-change
west roof sources. Model checks, compiled/source image and draw comparisons,
full-detail loading, fallback paths and timeline checks passed during that
validation. Several other active chats subsequently changed nearby roofs
and render in this same checkout. Their edits are preserved. Latest
broader check failures: latest-test-west-roof-join, latest-test-roof-tiles, latest-compiled-tile-check.
This is not a clean final full-suite result. See latest-checks.json and
its logs for the precise current results; final-model.json records the
validated corner views and asset provenance.

Browser modelling sources and the local compiled aerial are updated.
Unity, Blender and packaged application exports are not regenerated for
this correction. References, saved original sources and evidence are under
Browser/artifacts/west-roof-render-joins/.

## West entrance yellow roof boundary (5 October 2026)

The owner's yellow guide replaces the sampled slate/coping boundary on the
small west inside-corner return beside the entrance. The back eave is level
at y=14.53, drops by 0.23 over a short 0.10-unit run to y=14.30, and descends
along the canted side to the existing entrance cornice's terminal upper edge.
Slate and white trim use shared straight mitres. Narrow slate returns match
every crease at their inboard seams, and the old fringe is removed across
the render overhang. The back ribbon stops at the adjoining pavilion's valley
endpoint, preserving its independent pitches and crown. Roof closure brick
finishes beneath the same profile. See
Research/west/entrance-yellow-boundary-2026-10-05/README.md.

Validation was limited to this building and its immediate surroundings, as
requested. Browser/test-west-entrance-roof-boundary.mjs passes 17 boundary
contacts, 444 physical slate/render samples and retained adjoining crowns.
The saved original corner fails its new level-eave assertion. The existing
inside-corner check passes 104 pane probes, 70 concealed trim-edge samples,
1,302 flush/textured closure samples and its walking/collision checks. West
refinement and the shared west roof check also pass; the latter retains all
ridge/valley checks and 552 physical roof/render probes. No estate-wide suite
was rerun. Changes elsewhere in the shared west roof were preserved.

Hardware rendering was verified as NVIDIA GeForce RTX 3090 Ti via Direct3D11
using the shared hardware launcher. Marked, close, low, overhead and phone
views were inspected in both source and compiled modes, with no page/shader
errors. All 32 visible boundary, adjoining-crown and seam probes match between
both modes. The local compiled model was rebuilt with the hardware launcher;
its current source fingerprint and binary checksum were verified.

Shared browser geometry applies to aerial, Explore and gameplay. Unity,
Blender and packaged application exports were not regenerated. The supplied
reference, saved original source, focused test receipts, captures, build log
and final-model.json are in Browser/artifacts/west-roof-yellow-boundary/.

## Switch between aerial and walking at the current location (5 October 2026)

Both views now place a mode-switch button beside Back to intro, including on
320 px phones. The shared view-navigation module reads the live camera X/Z
and horizontal heading at activation, rather than the original location
preset. The destination URL carries that pose plus the current estate period
and day/dusk/night setting; reloads retain the transferred location.

Explore drops to the destination's ground/support height and uses its current
walking collision cache to find nearby clearance when the exact point is
blocked. Aerial rises vertically over the current walking location, including
indoor positions, and retains the heading. Its downward angle keeps the original
ground point in view. The aerial controls inherit the new target without a
first-input jump, and resizing does not reset a transferred position.

Run npm run test:views from Browser for the location/heading/support regression
and hardware-browser desktop/phone round trips. The browser check pans and walks
before switching, checks period and lighting, resize/reload, nearby placement
for a blocked drop, and rising from an indoor position. Captures and receipts
are saved in Browser/artifacts/view-navigation/. The logic check is also part
of npm test. The dedicated browser check passes at 1200 and 320 px with no page
errors; both views' screenshots are visually inspected. Hardware acceleration
is verified as NVIDIA GeForce RTX 3090 Ti through Direct3D11. Existing input,
aerial-control, intro-flight and interior-walking checks pass, including all
23 doors and seven internal stair connections. The existing intro browser
check also passes desktop walking, phone aerial and reduced-motion arrival,
including loading holds and unavailable session storage.

The required npm test run stops at the existing test-facade-courses.mjs:68
course-count assertion (23 actual versus 22 expected). This navigation work
changes no model geometry. Browser navigation/UI sources and checks are updated;
compiled estate models, Unity, Blender and packaged exports are not regenerated.

## Removed west pavilion roof-edge protrusion (5 October 2026)

The owner's blue-circled screenshot identifies the raised short slate/render
stub where the inner garden pavilion meets the entrance-side roof. The
short raised block and abrupt 0.23-unit step are removed in
Browser/dist/front-inside-corners.mjs. An initial sloping return was
integrated with concurrent work retaining the main roof plane; the final
coping and masonry closure follow that plane at the inner render edge.
The pavilion valley endpoint remains fixed. See
Research/west/pavilion-roof-tip-2026-10-05/README.md. Shared edits in the same
files are preserved.

The final boundary check passes 88 pitch/bend contacts, 432 physical
slate/render samples and retained crowns. The saved former corner fails
the regression. The inside-corner, west refinement, roof-join, roof-contact
and entrance-tip checks pass. Source and actual compiled GPU views cover
the marked angle, close and opposite angles, and phone. Both paths pass
23 visible edge/seam probes with no page or shader errors. The hardware
launcher verifies NVIDIA GeForce RTX 3090 Ti through Direct3D11.

The required npm test stopped at the existing facade-course count mismatch
(23 versus 22). Continuation and focused reruns account for all 127 suite
commands: 124 pass; facade-course counting and Jarman/Leighton-Newton's
historical estate snapshots fail. Those failures also reproduce with the
saved former corner. Roof tiles and the inside-corner check initially
failed during concurrent modelling edits and passed fresh final reruns.
Both vendor checks passed with their correct arguments; the first
continuation runner incorrectly passed the argument as part of the filename
and was corrected. The full suite is not clean.

Browser sources and the local compiled aerial are updated; Unity, Blender
and packaged application exports are not regenerated. Original sources,
reference, GPU captures, baseline receipts, complete continuation logs,
final validation and model fingerprint/checksum evidence are under
Browser/artifacts/west-pavilion-roof-tip/.

## West outer-end gutter/cornice flicker (5 October 2026)

The owner's blue circle identifies competing dark and white surfaces along
the outer-end eave. Three gutter boxes overlapped the upper cornice, with
both top faces at the shared y=14.53 eave. One closed gutter now follows the
cornice's exposed outer edge and both returns of the central pier. Its width,
height and top level are retained; the solid footprints meet at their edges
without sharing any top area. Slate and cornice geometry are retained. See
Research/west/eave-flicker-2026-10-05/README.md.

Browser/test-west-end-gutter.mjs passes 65 cornice samples without coplanar
metal overlap and 19 gutter/return continuity samples. The saved original
builder fails with 33 overlaps, independently reproducing the reported cause.
The focused west refinement, west roof and yellow entrance boundary checks
also pass. Validation remains limited to this building and its immediate
surroundings; no complete estate suite is run.

The shared hardware launcher verifies NVIDIA GeForce RTX 3090 Ti via
Direct3D11. Source and rebuilt compiled views cover the marked end, close,
small camera shift, low and phone views. Visible-scene checks repeat the 65
clear cornice and 19 gutter-contact probes, plus 32 adjacent entrance-roof
contacts, retained crowns and seams. There are no page or shader errors.

The local compiled aerial model is regenerated for both requested repairs.
Shared browser sources apply to aerial, Explore and gameplay; Unity, Blender
and packaged application exports are not regenerated. Evidence is retained
in Browser/artifacts/west-end-eave-flicker/. The original yellow-boundary
captures and model receipt are refreshed against the same final model.


## Blue roof plane and red entrance join (5 October 2026)

The owner's blue/yellow and red reference removes the small entrance-side
roof tongue and requires its angle to match the main pitch. The original
main roof plane now continues through both back coping runs; their steeper
slate ribbons and short height step are removed. The white coping and brick
closures meet that plane at its inner edge. The red projection return's
cornice top is level at y=13.69, closing its formerly dipped roof join.
Clipped slate corners repeated within 0.00001 model units are welded to
remove numerical slivers; other masonry and ground cuts retain their geometry.
See Research/west/roof-slope-repair-2026-10-05/README.md. This supersedes the
previous level/stepped and blended entrance boundary profiles.

Final validation is local, following the owner's later instruction. The
boundary regression passes 88 slope/bend contacts and 432 physical trim
samples; the saved former blue and red geometry independently fail it.
Inside-corner, west-refinement, west-roof-join, roof-contact and source/compiled
roof-tile checks pass. The inside-corner check retains its pane, masonry,
collision and walking probes, and the shared roof test retains 552 render
probes and all adjoining ridge/valley checks.

The NVIDIA GeForce RTX 3090 Ti / Direct3D11 renderer is verified through the
required hardware launcher. Source and compiled desktop, close, low, overhead
and phone views were inspected with no page/shader errors. Their 78 visible
surface checks match exactly. The locally rebuilt aerial manifest matches
the final source fingerprint, and its binary checksum is verified. Shared
browser sources and the local compiled aerial are updated; Unity, Blender
and packaged application exports are not regenerated. Evidence is under
Browser/artifacts/west-roof-slope-repair/.

The earlier broader npm test attempt stopped at the existing 23-versus-22
facade-course count assertion, which also fails with the saved former roof
sources. Its continuation was stopped when the owner requested local geometry
validation; it is not a completed estate-wide result.

## Church-front road midpoint and complete path loop (5 October 2026)

Moved the final Parsons Lane stretch to z=-93.55, midway between Churton's
projecting lawn bay and the church clock-end feet. The western bend eases into
it, the Upton Lea T-junction moves with it, and the existing local merged
junction/border polygons are regenerated from refreshed road inputs. Vacated
asphalt returns to terrain. Churton's entrance walk and mast-side gravel now
end at the moved lane, without pale paving stubs across it. Road labels and
lamps inherit the common fitted centreline; geographic source coordinates stay
intact. The registered buildings retain their position and geometry.

Closed the two-metre church perimeter walk with a clock-end arc at local z=19.
Periodic tangents join both edges of the paving and edging exactly at the seam.
A short clock-front link meets the moved lane; both existing side links extend
to asphalt. Modelling reference and revision notes are in
Research/church/README.md and Research/historic-roads/README.md.

At the owner's request validation was limited to local geometry. The focused
Browser/test-church-grounds.mjs passes the physical midpoint, road/junction
surface contact, vacated-road removal, full-width seam, path links and 2,400
walking-clearance samples. The adjacent Churton, church-front and western
Parsons-junction checks pass. No estate-wide suite was run. Hardware rendering
was verified as NVIDIA GeForce RTX 3090 Ti via Direct3D11. Local overview,
plan and close church views were inspected in source and actual compiled
modes without page or shader errors. The local road and church loop match
between both modes; the rebuilt model's current source hash and binary checksum
were verified. A first compile was rejected because other model source changed
during the build; a fresh retry completed successfully.

Browser sources and the local compiled aerial model are updated. Unity,
Blender and packaged application exports were not regenerated. Captures,
focused geometry receipts, build log and compiled validation are in
Browser/artifacts/church-road-loop/.

## Courtyard bay roof protrusion: corrected location (5 October 2026)

The owner's wider follow-up identifies the courtyard polygonal bay beside
the low flat-roofed projection. The earlier pavilion-roof-tip entry targeted
the garden side and did not remove the originally reported defect. See
Research/west/courtyard-roof-tip-2026-10-05/README.md and both original images.

Browser/dist/west-cross-range-roof.mjs removes the superseded return hip
after sampling its original surfaces for joined-roof construction. Its
remaining 0.1725-wide sliver was the protruding slate at the clarified
shoulder. Browser/dist/west-court-photo-detail.mjs omits the obsolete white
return strip. Existing joined slate, bay cornice, masonry, glazing and
walking footprints retain their profiles; concurrent source edits remain.

The west roof check passes nine new roof-clearance and four trim-clearance
rays plus its existing ridge, valley and 552 physical render probes. Saved
former sources fail the new regression. West refinement, roof contacts
(108 attachments / 3888 perimeter contacts) and roof tiles pass. The required
npm test again stops at the existing facade-course count mismatch, 23 versus
22; this is not a clean complete-suite result. The preceding broader suite
accounting remains historical.

Source and actual rebuilt compiled views cover the correct court, full bay,
close and opposite angles and phone, each with 13 visible clearance probes.
The required hardware launcher verifies NVIDIA GeForce RTX 3090 Ti through
Direct3D11. Reference images, original sources, GPU captures, baseline
regression, test log and final model fingerprint/checksum evidence are under
Browser/artifacts/west-courtyard-roof-tip/. Shared browser sources and the
local compiled aerial are updated. Unity, Blender and packaged application
exports are not regenerated.

## Eastern entrance slate and cornice joins (5 October 2026)

The owner's red/blue-circled screenshot identifies slate protruding through
the entrance projection's cornice and an upper return stopping before the
main-range cornice. `west-cross-range-roof.mjs` now finishes both entrance
roof boundaries, applying the mirrored cornice's actual world transform.
`front-inside-corners.mjs` fits the eastern coping and narrow slate returns
to shared corners and the adjoining fascia's terminal plane and cap.
See Research/front-inside-corners/README.md for the reference and scope.

The user restricted validation to local geometry. The final focused checks
pass 15 eastern boundary/return contacts, 3,318 physical slate/render samples,
the retained western boundary's 88 contacts and 432 physical samples, and
the immediate courtyard's walls, walking route, 104 pane probes, 70 concealed
trim edges and 1,308 textured closure samples. Reflection is accounted for
when classifying the eastern cornice's outward top faces. Both saved original
defects independently fail the new regression. Use
`npm run test:entrance-cornice` from Browser for the local checks.

Actual procedural browser views pass 15 visible slate/render probes with
no page or shader errors. Close, opposite, low and phone views were inspected.
The required hardware launcher verifies NVIDIA GeForce RTX 3090 Ti through
Direct3D11. Final receipts, the supplied image, original sources and captures
are in Browser/artifacts/entrance-cornice-joins/; validation.json and
verified-validation.json record the final checks. No full-suite run or
compiled-model rebuild was performed for this request. Shared browser model
sources are updated; compiled aerial, Unity, Blender and packaged exports
are not regenerated.

## Developer options and staircase overlay (5 October 2026)

Aerial and Explore on foot now show a Developer option button in their shortcut
guides. Press minus (including numpad minus), or activate the button, to reveal
the extra shortcuts. M toggles the staircase overlay while developer mode is
enabled. Disabling developer mode hides both the shortcuts and overlay. Buttons
also support touch, and session storage retains the settings across view
switches/reloads when available. Repeated keys, browser modifier shortcuts and
typing into text fields leave these settings alone.

developer-options.mjs loads stair-overlay.mjs only when needed; ordinary aerial
viewing does not fetch the interior plan. A separate transparent render pass
highlights exterior stairs in cyan and interior stairs in amber, through walls
and roofs. Exterior tread/landing top faces use the existing mesh transforms,
including instanced meshes and hidden originals retained by material batching.
Unnamed iron treads are identified beside the existing guards with matching
materials. Interior flights and landings use the shared plan, stair footprint,
floor elevations and architectural tread count. The seven connections at four
interior staircase locations are deduplicated. Exterior highlights follow their
source ancestors' period visibility, including demolition of the annexe stairs.
The overlay never enters the building model, collisions or shadow pass.

Run npm run test:developer for the coverage/input regression and actual desktop
and 320 px phone checks. The logic regression is included in npm test;
node test-developer-options.mjs --compiled additionally checks the locally
available compiled binary. All focused checks pass: 418 exterior surfaces,
seven interior connections, source/batch and deserialized compiled coverage,
timeline removal, keyboard/touch controls, typing guards, mode-switch/session
state and indoor/outdoor rendering. Final captures and browser receipts are in
Browser/artifacts/developer-options/. Hardware acceleration is verified as
NVIDIA GeForce RTX 3090 Ti via Direct3D11; final screenshots were reviewed.
Existing explore-input, explore-interior, aerial-controls and view-navigation
logic checks also pass. The required npm test run stops at the already documented
test-facade-courses.mjs:68 failure (23 courses versus 22 expected).

Only browser UI/runtime sources, checks and this note were changed. No modelling
inputs or generated models were changed or rebuilt. The existing compiled asset
was checked directly for overlay compatibility; its source hash already differs
from the current unrelated modelling edits, so the development server still
uses its normal procedural fallback. Unity, Blender and packaged exports were
not regenerated.

## Eastern roof brick gaps and extended back join (5 October 2026)

The owner's blue/red/yellow screenshot identifies a small exposed brick sliver
at the canted entrance roof seam and the longer brick strip beneath the taller
Redesmere roof. The lower roof's final pitches now extend back from x=38 to
meet the taller roof's actual plane at its retained 15.66 crown. Its stepped
boundary follows the existing 14.55 eave. The taller roof is clipped beneath
that extension, removing competing slate; short rising eave closures finish
at the roof edge. The rest of the entrance pitches and the taller 16.2 crown
retain their geometry. See Research/east-roof-brick-joins/README.md.

The canted ribbon's seam sampling now includes the crossing of overlapping
roof planes, restricted to the marked eastern facet. Sampling only triangle
edges bridged above the retained roof and left the brick visible obliquely.
The added crossing closes that opening. Small clipped high-roof faces use
local UVs to retain the slate pattern's phase and physical tile dimensions.
Existing wall/window outlines and courtyard walking routes retain their
modelling inputs; the new eave faces add no ground-level walking obstacles.

Nine focused checks pass. The new regression covers 12 formerly exposed
viewing rays, 83 shared roof contacts, both retained crowns and the cornice;
each saved original defect independently fails it. Existing eastern and
western entrance checks pass 3,318 and 432 physical trim probes, while the
west shared roof retains 552 render probes. Courtyard masonry, 104 pane
probes, the walked doorway route, 108 roof attachments / 3,888 perimeter
contacts, Redesmere glazing and exterior stair checks pass. Source and
compiled tile surveys pass. The exterior check's outdated eastern mesh-name
assertion also fails with the original roof; it now recognizes the existing
slate-to-render return, matching the west check, while retaining material
and height assertions.

The required npm test run stops at the previously documented facade-course
count mismatch, 23 versus 22 expected. This is not a completed full-suite
result. Local source and actual rebuilt compiled views cover the marked
angle, close blue and yellow joins, opposite direction and phone. The required
hardware launcher verifies NVIDIA GeForce RTX 3090 Ti via Direct3D11; there
are no page or shader errors. All 12 visible source/compiled defect rays
match exactly. The final source fingerprint and binary checksum are verified.
Evidence, saved original sources and receipts are retained in
Browser/artifacts/east-roof-brick-joins/.

Shared browser model sources and the local compiled aerial model are updated.
Unity, Blender and packaged application exports are not regenerated.

## West-wing Library and adjoining third-storey rooms (5 October 2026)

The owner's yellow divisions now define the Library (R46), outer sitting room
(R47), canted bay reading room (R48), office (R49) and inner book store (R50).
Their second-floor envelope, plan ID 3 at Y=8.4, follows the current west-wing
exterior, including its stepped court return, end pier, canted bays and inner
square projection. This is the third occupied storey. The existing Reception
upper rooms remain in their own outline loop; wall surfaces now choose the
normal of their hosting loop. C26 serves the new rooms, and R51 reserves the
west-junction stair hall. See Research/west-library/README.md and plan.png.

S5 gains the first-to-second-floor connection. The owner's later request in
"Update west wing staircase" supersedes this task's initial side-wall enclosure:
R51 is now open and the upper return joins the west corridor landing. That
revision is documented in Research/west/upper-access-stair-2026-10-05/README.md.
F4's existing upper exterior landing at (-63,8.5,14.3) now enters the Library.
Per-level exit anchors put its interior opening on the actual garden wall while
preserving the earlier first-floor connection. Same-floor navigation can use
stairs through a lower floor between disconnected upper wings.

The 26 new sashes use the existing exterior detail builders' sizes and horizontal
orientations, projected onto the new walls, with sills fitted to the established
3.8-unit interior ceiling. This gives 31 scheduled upper windows including the
five Reception windows. The Library has eight stocked bookcases, a reading table,
chairs and books. Central table candidates pass the shared furnishing clearance
checks; adjoining rooms use the existing sitting, reading, office and archive
purposes. The stair hall gets no furniture. Original furnishings compared by
stable IDs retain their placement across all four levels. Both shared plan JSON
copies agree; these room divisions and uses are gameplay estimates rather than
a surveyed historical interior.

The new test-west-library.mjs passes 80 physically walked furnished/unfurnished
routes between all five rooms and ground floor, first floor, Reception's upper
floor and F4, plus stocking, slabs, windows and notebook discovery. Final focused
rechecks also pass 95 room doors, 24 outside / 97 interior door frames with 2,918
masonry support rays, the retained Reception layout's 40 cross-floor routes, and
the developer overlay's eight interior connections. The window-clearance check
passes 300 sashes plus the Reception transom, 1,802 pane rays and 6,770,601
clearance samples. Its final receipt is in Browser/artifacts/west-library/
window-clearance-final/. Door totals and Reception-specific assertions are updated
for the added wing without removing their geometry and walking checks.

The hardware browser check passes all five furnished room return trips, travel
between upper wings, game and Explore F4 round trips, notebook mapping and phone
layout. NVIDIA GeForce RTX 3090 Ti / Direct3D11 acceleration was verified through
the required hardware launcher; there are no page or shader errors. Desktop,
phone, room, passage, stair and cutaway captures are retained in
Browser/artifacts/west-library/ alongside the former plan and final rechecks.

The required npm test attempt stopped at the existing facade-course count mismatch
(23 versus 22). A separate run executed all 130 commands and recorded 123 passes
and seven failures in Browser/artifacts/west-library/suite-results.json. The two
Library-related door-count / per-level-anchor failures are corrected and pass the
final rechecks. The other failures concerned facade courses, an exterior roof
name, protected Jarman / Leighton–Newton geometry and saved aerial road vertices;
these overlap separate exterior work and are not a Library validation success.
Later exterior revisions may supersede that historical suite receipt.

Browser interior sources, both shared plans, checks and review drawings are
updated. The aerial compiler's dependency graph excludes these interior modules,
so this task does not require an aerial model rebuild. Unity, Blender and packaged
application exports are not regenerated. The saved build-plan.mjs is a historical
creation script based on before-plan.json and must not overwrite the later stair
revision; current shared plan JSON files are the modelling inputs.

## Open west-wing upper access staircase (5 October 2026)

The owner's marked interior view supersedes the enclosed S5 continuation in the
Library-storey entry above. R51's internal west, east and rear walls are removed
on the first and second floors. The wall-side upper flight is replaced by a
return rising diagonally across the well to the west side of the north landing,
approximately along the supplied blue line. C26's recorded approach now meets
that arrival at (-33.35,8.55). The existing upper perimeter remains the actual
outside envelope.

S5 uses a connection-specific definition for first-to-second floor (1:3).
Its initial flight remains fixed; the replacement upper centre runs from
(-31.15,6.3,12.3) to (-33.35,8.4,9.7). An angled return-deck edge meets the
closed concrete flight, and a fitted upper arrival deck joins the existing
floor slab. Carpet pads, post support, continuous handrails, physical barriers,
walking, cross-floor pursuer paths and the developer overlay use the same
flight endpoints. The square shaft and its floor/ceiling cuts remain fixed.
Both shared plans and the first-floor / Library SVG and PNG drawings are updated.
The reference and modelling estimates are in
Research/west/upper-access-stair-2026-10-05/.

Validation passes 80 furnished/unfurnished Library routes; all room and exit
routes, all eight stair connections in both directions, 1,902 underside/landing
rays, 1,248 closed-side samples, 1,176 support/headroom points, 80 fall barriers,
9,076 slab-cap views and 1,644 shaft/perimeter reveals. Saved-before comparison
confirms seven identical walking connections and fifteen identical flight
vertex buffers, including the retained initial flight of the changed connection.
The overlay also raycasts the replacement flight and rejects its removed former
position.

Hardware browser validation verifies NVIDIA GeForce RTX 3090 Ti / Direct3D11,
all five furnished Library return trips, cross-wing travel, game/Explore F4
round trips, notebook/mobile views, and seventeen stair-underside captures.
There are no page or shader errors. Matching before/after Explore views and
clean previews are in Browser/artifacts/west-upper-stair/; Library browser
validation is in Browser/artifacts/west-library/. An existing soffit image was
locked, so the final successful underside run uses the fresh west-upper prefix.

The required npm test run stops at the independent facade-course count assertion
(23 versus 22); that test constructs only the exterior model. Every subsequent
suite command is run separately, with receipts in
Browser/artifacts/west-upper-stair/remaining-suite.json and remaining-suite.log.
Those results distinguish the staircase checks from concurrent exterior work.

Only browser interior sources, shared plans, checks, notes and review drawings
change. The aerial dependency fingerprint still matches the existing compiled
binary, so no aerial regeneration is required. Unity, Blender and packaged
application exports are not regenerated.

Final suite receipt: all 131 npm-test commands were attempted. After recovering
the road check's locked report file by saving the same completed assertions to
west-upper-stair/road-continuity-retry.json, 127 checks pass. Four independent
exterior assertions remain: facade-course count, protected Jarman geometry,
protected Leighton/Newton geometry and saved aerial-road vertices. All interior,
stair, exploration, corridor, furniture, developer-overlay and performance
checks pass. The successful road retry verifies 1,606 road surfaces and their
supporting edges; its original failure was only the locked report-file write.

## Developer shortcut visibility (5 October 2026)

This supersedes the initial shortcut visibility in the developer-options note
above. Aerial and Explore on foot now hide the Developer option button in the
HTML and on a fresh session. The first minus press reveals the button and enables
developer mode. Once revealed, it remains available for clicking, including
after developer mode is disabled. Session storage retains that discovery across
view switches and reloads alongside the existing developer settings. Modified
and repeated key presses cannot reveal it.

Developer logic and browser checks pass, including fresh sessions in both views,
minus activation, mode switching, touch controls and typing guards at 1200 px
and 320 px. The GPU launcher check passes with NVIDIA GeForce RTX 3090 Ti via
Direct3D11. Hidden and revealed screenshots were reviewed in
Browser/artifacts/developer-options/. Explore input, aerial controls and view
navigation checks also pass. The required npm test attempt stops at the existing
test-facade-courses.mjs:68 count mismatch (23 versus 22).

Only browser UI/runtime, related checks and this note change for this request.
No models or exports were regenerated.

## Developer full map across modes (5 October 2026)

Press minus to enable developer options, then M to reveal and open the full map
in Aerial, Explore on foot or Asylum Escape. Every level is immediately available:
ground, first, basement, second floor and grounds. M, Escape or Close dismisses
the map. The earlier staircase-overlay M binding is superseded by Shift+M in
Aerial and Explore. Shortcut buttons remain hidden until minus is first pressed.

The shared developer-map.mjs dialog uses the playable floor plans and the existing
notebook map renderer. Its revealAll drawing option bypasses the fog composite
and discovery checks for room, door and stair symbols without changing any
explored cells or notebook facts. Activating M also reveals the escape minimap
and makes every level available in the notebook. That reveal survives closing
the dialog and view switches; disabling developer mode restores ordinary fog
and discovered-level tabs. Normal escape-mode M still opens the notebook when
developer mode is off.

Walking input stops when the map opens. Escape mode suspends movement, NPCs,
interaction timers and the elapsed time until the dialog closes. Background UI
is inert while the map is open, keyboard focus stays within its controls, and
the map canvas fits the viewport. The map module and aerial floor plan load only
when needed, sharing the plan request with the staircase overlay.

Developer, notebook, game, Explore input/walking/interior, aerial controls and
view-navigation logic checks pass. Final hardware browser checks pass at 1200 px
and 320 px for all five map tabs, M/Shift+M separation, close-button keyboard
activation, focus containment, walking pause, touch controls, view switches and
unchanged exploration memory. The notebook browser check also passes the escape
minimap reveal, all-level notebook tabs, frozen player/NPCs/timer and restored
fog after disabling developer mode, alongside its normal desktop/phone checks.
NVIDIA GeForce RTX 3090 Ti / Direct3D11 acceleration is verified by test:gpu and
the browser launchers. Final map screenshots were reviewed; receipts and captures
are in Browser/artifacts/developer-options/ and Browser/artifacts/notebook/.

The required npm test attempt still stops at test-facade-courses.mjs:68 (23
courses versus 22). Concurrent furniture/plan changes briefly prevented Explore
initialization with a dormitory-bed placement error; the final UI run loads
successfully. A separate furniture check during those changes reported an
unreachable first-floor R10. These modelling checks are independent of the map
change. This request changes only browser UI/runtime, related checks and notes;
no modelling inputs or compiled, Unity, Blender or packaged exports were changed
or regenerated by this task.

## Developer shortcut requires a press on each page (5 October 2026)

This supersedes the session restoration described in the earlier developer
shortcut notes. The shared developer controls now start hidden and disabled on
every page visit, including Explore on foot, reloads and switches from aerial
view. Old session-storage settings are ignored. Pressing minus reveals the
button and enables developer mode; the button remains clickable for the rest
of that page visit. Map and staircase settings no longer carry between pages.

Developer, Explore input, aerial controls, view navigation, game and notebook
logic checks pass. Hardware browser checks pass at 1200 px and 320 px with old
enabled/revealed settings deliberately present, after switching views, after
reloading and after starting the walk. Minus then reveals the controls in both
layouts. Hidden and revealed captures were visually reviewed in
Browser/artifacts/developer-options/walking-started-*.png. The required GPU
check verifies NVIDIA GeForce RTX 3090 Ti / Direct3D11 acceleration. The required
npm test run still stops at test-facade-courses.mjs:68 (23 courses versus 22).

Only browser developer controls, related checks and this note change. Models,
Unity, Blender and packaged exports were not regenerated.

## Basement padded confinement cells (5 October 2026)

The owner confirms B5, B6, B7 and B8 as padded cells for patient confinement.
Their former stores and workshop uses are superseded. Both browser modes now
show quilted canvas lining on the walls and floor, plus one fixed low rounded
mattress per cell. Rigid storage, tables, seats and variable loose items are
removed from these rooms. Furnished room names and notebook discoveries read
“Padded cell · patient confinement”. These are fictional gameplay uses.

The finisher classifies exposed cell faces separately from corridor faces and
omits wallpaper/dado rails there. padded-cell-models.mjs tessellates the actual
masonry surfaces into soft panels, continuing across the lower/upper batch
seam. All four rooms' wall and floor lining shares one mesh and canvas material.
The backing covers the former skirting; quilt seams remain visible under the
game's lighting. Exclusions account for complete window frames, perpendicular
reveals, door-surround outer trim, parked leaves and floor-level jambs. Room
boundaries, windows, doors and stair inputs retain their existing definitions.
Mattress placement uses the shared furniture records and collision/navigation
updates. The source mattress is .92 × 1.90 × .18m; model and walking bounds agree.

Dedicated validation passes all twenty lined surfaces, eight clear apertures,
eight physically walked cell return routes, reproducible mattresses, and the
actual padding triangles against all 68 nearby window/door timber bounds.
The furnishing survey passes eight seeds and 976 room/exit routes. Window-frame
and room-finish checks pass all 300 windows, 94 openings and 5,462 wall rays.
Game, notebook and Explore-interior checks pass. Hardware browser checks verify
NVIDIA GeForce RTX 3090 Ti / Direct3D11, matching padding and mattress geometry
in Escape and Explore, desktop/phone views and no page/shader errors. Final
captures and the browser receipt are in Browser/artifacts/padded-cells/; the
basement furnished SVG/PNG are refreshed. Run npm run test:cells in Browser.

The required npm test attempt stops at the existing independent façade-course
count assertion in test-facade-courses.mjs:68 (23 versus 22). Browser interior
sources, checks and review drawings are updated. The current aerial source
fingerprint still matches its compiled asset, so no aerial rebuild is needed.
Unity, Blender and packaged exports are not regenerated.

## Connected escape and capture recovery (6 October 2026)

TODO items 1 and 2 are implemented in the current browser Asylum Escape. The
dependency diagram, branches, discovery triggers and recovery rules are in
`Browser/ESCAPE-DESIGN.md`. The old grid fixture retains its legacy loop for
regression checks; the four-floor asylum uses the new scenario.

The player can inspect a staff memorandum beside Reception, explore paired rear
stairs, obtain a labelled stair key or operate the basement safety release,
and physically walk into the restricted second-floor offices. S1 and S5 have
visible iron grilles with matching movement/jump barriers; their release is
permanent for that run. The basement release opens both, so either upstairs
record wing remains reachable through the first floor. No clue reading is a
mandatory invisible gate: the same information is legible on the actual notices
and key tags. Notice boards have outward-facing print on each side so their
lettering remains readable from either approach, including on the grilles.
E operates the fittings, and ordinary held E no longer freezes
pursuit. Artwork and Notebook reading retain their pause behavior.

The upstairs porter record and attached brass key identify either D2 or D8 as
the service entrance. Other outside doors can be found and tested, but are bolted
for this Escape scenario. Stepping outside is progress; security patrols the
grounds, uses the active collision model for routes and sight, and can capture
the player there. Ground navigation caches are invalidated when the outside
collision revision changes, including tree visibility changes. Guard movement
cannot consume the player's jump state. Crossing the rear perimeter and using
E at the mast starts the existing ten-second estate ending. The former front-path
threshold cannot complete the game.

The night backdrop uses 1916, which normally hides the modern mast. Escape adds
a visible copy of its existing lattice model and a walkable footing. Its separate
batches and cached transforms are prepared before invalidating exterior shadows
and constructing outside collisions. This is a fictional escape landmark, not
a historical claim about 1916. Aerial/Explore timeline inputs are unchanged.

Per-run choices vary the staff-key room (R23/R25), upstairs record (R41/R49) and
outside route (D2/D8), with all eight combinations solvable. `?seed=1829` fixes
these scenario choices for debugging; an ordinary restart picks a fresh seed.
Furniture retains its existing independent randomisation. Run reset clears
keys, grilles, capture count, evidence and fog together.

`escape-progress.mjs` separates observed knowledge from possessions. Facts and
deductions appear only after their actual inspection, approach, use or traversal
triggers. Deductions work in either discovery order. Tested doors evolve from
untried to locked to used; observed upper grilles acquire natural map annotations.
The grounds sketch now covers the mast/perimeter area, with fog preserved and
nearby outdoor security shown only when visible. No objective arrow, separate
quest log, stage checklist or undiscovered key marker is added.

The first capture relocates the player to the admissions room beside Reception;
the second relocates them to basement padded cell B5, with four seconds of
observation before continuing. Both confiscate carried keys, change patrols,
preserve elapsed gameplay time and all Notebook/fog knowledge, and provide ten
seconds to recover after resuming. Opened grilles remain open. The property tray
beside Reception and the original key sources prevent confiscation soft locks.
The third capture ends the attempt with the existing random historical
diagnosis/treatment screen, as requested. Recovery dialogs support keyboard
focus, responsive scrolling and touch; suspended states require fresh movement
input on return.

Validation: `npm run test:gpu` verifies NVIDIA GeForce RTX 3090 Ti / Direct3D11.
`test-escape-progress.mjs` passes 128 spread seeds, all eight combinations, both
access methods, out-of-order evidence, capture at each dependency, retained
knowledge, lost-key recovery, 56 furnished clue approaches across eight furnishing
seeds, gate/jump barriers, interaction reach and navigation-cache invalidation.
`test-escape-progress-browser.mjs` physically walks both access branches, both
upper record wings and both outside routes to the visible mast. It verifies
automatic outdoor capture, the three consequences, frozen Notebook/player/NPCs/
timer, player/guard jump isolation, clean retry and actual touch clue/Notebook
controls, with no page or shader errors. Final desktop/phone screenshots are
visually reviewed in `Browser/artifacts/escape-chain/`.

Existing game, Notebook, jump, outside movement, Explore interior, guard and
developer checks pass. Hardware regressions also pass all 24 outside door
round trips with explicit scenario access in the geometry fixture, continuous
basement/ground/first stairs, furnished Library and F4 trips in Escape/Explore,
real jump input, and desktop/touch Notebook reading. The geometry fixtures set
their tested door access explicitly; they retain all physical assertions, while
the new scenario test validates locks and branching. Run `npm run test:escape`
for gameplay checks plus the new hardware browser scenario test.

The required final `npm test` attempt stops at the existing independent
`test-facade-courses.mjs:68` assertion, 23 courses versus 22. Its receipt is in
`Browser/artifacts/escape-chain/full-suite.log`; this is not a complete-suite
pass. The current aerial dependency fingerprint still matches the compiled
manifest, so no aerial rebuild is required. Browser gameplay/runtime fittings,
related checks, player instructions and these notes change. Shared modelling
inputs, Unity, Blender and packaged desktop/Android exports are not regenerated.

## Staff stair gates fitted to the stairs (6 October 2026)

The owner's floating-grille reference is retained in
`Research/escape-interior/stair-gate-floating-reference.png`. Escape's S1 and S5
upper grilles now sit 0.08 units before their actual first risers, rather than
halfway along the landing approach. Frames use the shared 1.3-unit stair width,
with posts bedded into the landing on anchor plates and short rail returns
meeting the existing handrails. Narrower barred leaves have three attached
hinges, a latch, handle and smaller riveted notice plate. The frame height is
2.35 units; the movement barrier follows the new location and height. Release
clears the leaf while retaining the fixed posts and head. Key and basement
release methods keep their existing gameplay behavior.

`npm run test:gpu` verifies NVIDIA GeForce RTX 3090 Ti / Direct3D11 hardware
rendering. `test-escape-progress.mjs` and `test-asylum-stairs.mjs` pass, including
all eight scenarios, both access methods, locked movement/jump barriers and
continuous stairs. `test-escape-progress-browser.mjs` passes both physically
walked upper stair branches and the complete desktop/touch escape and recovery
checks, with no page or shader errors. The gate capture harness also confirms
all four posts meet the rendered landing slab at Y=4.202 and the fixed frames
remain after release. Front, angled, released and phone views were reviewed in
`Browser/artifacts/stair-gate/`, alongside its validation receipt.

The required `npm test` attempt again stops at the pre-existing
`test-facade-courses.mjs:68` assertion (23 courses versus 22). This is not a
complete-suite pass. Only browser Escape fittings and their reference/validation
notes change for this repair. Shared stair inputs and Explore geometry are
unchanged; aerial compiled models, Unity, Blender and packaged exports were not
regenerated.

## Side-room searches for pursuers — 6 October 2026

Security and the Deva ghost now step into a nearby side room when the walkable
route to the player exceeds one local room's frontage. The threshold follows
the actual room width along its corridor. Close encounters and sharing the same
room retain pursuit; enemies on another floor continue their staircase routes.

`Browser/dist/enemy-room-search.mjs` chooses a reachable, furnished destination
inside a room with a physical doorway and beyond the corridor edge. Both NPCs
walk there, then wait for six gameplay seconds. Moving past the doorway does
not recall a committed search; entering the occupied room restores pursuit and
can still cause capture. An eight-second cooldown allows normal pursuit between
searches, and a timeout releases an obstructed entry. Notebook/pause states freeze
the search timer. Retry, capture relocation and transfer to outdoor patrol clear
room-search state. The existing head start, guard stride and ghost torch response
remain active.

`test-enemy-room-search.mjs` passes 32 guard/ghost cases across four floors and
four furnishing seeds, including physical doorway traversal, corridor clearance,
the six-second passing window, the one-room boundary, close/shared-room pursuit,
cooldown, stairs, timeout and reset. `test-enemy-room-search-browser.mjs` passes
the actual game loop with verified NVIDIA GeForce RTX 3090 Ti / Direct3D11:
both NPCs enter R14, the player sprints past with ordinary game input without
capture, and room expiry, occupied-room capture, Notebook freeze and retry reset
work. Corridor and passing screenshots were visually checked, with no page or
shader errors. Results are in `Browser/artifacts/enemy-room-search/`.

The existing game, escape-progress, Notebook and guard checks also pass. The
hardware `test-escape-progress-browser.mjs` regression passes both indoor
branches, outdoor escape, all capture/recovery consequences and desktop/touch
controls; its receipt is `Browser/artifacts/enemy-room-search/escape-regression.log`.
`npm run test:pursuit` runs the focused logic and hardware browser checks; the
new logic check is included in `npm test`. The required full-suite attempt still
stops at the previously recorded `test-facade-courses.mjs:68` assertion (23
courses versus 22); its log is `Browser/artifacts/enemy-room-search/full-suite.log`.
This change updates browser gameplay and its tests only. It does not regenerate
compiled models, Unity, Blender or packaged exports.

## Corridor brick colour boundary at mortar joints (6 October 2026)

The red/cream corridor split now follows a complete brick course in the shared
Escape/Explore interior. The 2-unit masonry texture contains 16 courses, so the
four-floor asylum boundary moves from 1.1 to 1.125 units (nine courses). Raised
scheduled window bases use the same boundary instead of extending red brick to
their sills. The legacy grid corridor boundary moves from 1.52 to 1.5 units
(twelve courses). Texture generation and material projection share the course
dimensions; room dado rails retain their separate, ceiling-relative heights.

The room-finish regression passes 297 corridor boundary pairs across all four
floors, raised window-base probes, 5,462 room wall rays and unchanged navigation.
Wall joins, legacy architecture, window frames/clearance, padded cells and layout
checks pass. Hardware verification uses NVIDIA GeForce RTX 3090 Ti / Direct3D11.
The close-up harness verifies actual red-wall heights and generated mortar pixels
on every floor, desktop/phone views and no page or shader errors. Before/after
captures and receipts are in `Browser/artifacts/corridor-brick-boundary/`; rerun
with `node artifacts/corridor-brick-boundary/check-browser.mjs after` from Browser.

The required `npm test` attempt stops at the existing independent
`test-facade-courses.mjs:68` count assertion (23 versus 22); it is not a complete
suite pass. Only browser interior sources, focused checks and these notes change.
The aerial compiled scene does not contain this interior. Unity, Blender and
packaged exports were not regenerated.

## Unique door room numbers and treatment names (6 October 2026)

All 92 enclosed browser room doors now have consecutive numbers in natural
numeric plan-ID order: ground G1–G38, first 101–133, basement B1–B11 and second
201–210. Sorting copies of the door records keeps existing door batches and
poses intact. Open circulation gets no room plaque, and removed/merged rooms
leave no gaps in the player sequence. Internal modelling IDs are retained.

Each parked leaf has the same number on both faces. The six ground-floor
treatment rooms also name Hydrotherapy (G1), Surgery (G6), Bloodletting (G7),
ECT (G8), Cold-water shower (G12) or Electrical therapy (G28), according to
the current room-use and furnishing definitions. Reception's five previous
room names remain beneath 201–205. This supersedes the earlier restriction
to five named upper doors. Treatment naming follows the existing fictional
room uses; the historical modelling references are unchanged.

The text uses one merged draw per floor with compact padded grid atlases,
all below 4096 pixels in either dimension. This avoids a tall single-column
texture being resized on phones. Brass backings reuse the existing hardware
batches. One-line plaques are .22 high; named plaques are .32 high. Both
remain centred at 1.75 and follow the actual open leaf. Escape and Explore
share the same label records and geometry.

Validation: test-asylum-door-labels.mjs passes all 92 unique consecutive
numbers, reversed-input numeric sorting, six treatment names, retained upper
names, 184 actual text planes and preservation of shared plan inputs. It is
included in npm test, test:asylum and test:room-doors. The Reception unit check
passes retained windows, stairs and 40 furnished/unfurnished room round trips;
the hardware browser check covers numbers on all four floors, ten actual
Reception room trips, all-floor Escape/Explore plaque parity, desktop/mobile
captures and no page or shader errors. The required GPU smoke check verifies
NVIDIA GeForce RTX 3090 Ti / Direct3D11 acceleration. Open-door geometry,
door frames and the eight-seed furniture survey pass, including all 976
room/exit routes, all door crossings and furniture clearance.

The required npm test run stops at the previously recorded exterior
wall-course count in test-facade-courses.mjs:68 (23 versus 22). The separate
doorway check stops at test-asylum-doorways.mjs:40 because basement B5's
existing cell padding is encountered instead of plaster above the doorway;
a run using the previous HEAD door-label module reproduces the same failure.
Those unrelated expectations are retained. Logs and reviewed captures are
in Browser/artifacts/room-numbers/.

Only browser room plaques, related validation and notes are changed by this
work. Shared plan JSON, review drawings, Unity, Blender and packaged exports
are not regenerated. Aerial compilation excludes the interior plaques; its
existing manifest still matches the current aerial source fingerprint.

## Story clues follow the door room numbers (6 October 2026)

Escape's staff memorandum and office filing notices now use G23/G24 for the
ground-floor stair-key rack and 201/209 for the second-floor service record.
The in-world notice textures and copied notebook evidence agree with the door
plaques; the office clues also specify the second floor. The basement notice
uses the same numbering lookup for its B4 release control. Scenario room IDs,
seed choices, placement, locks and capture relocation retain their model IDs.

`Browser/dist/asylum-room-numbers.mjs` is the shared numbering source for door
plaques, story clues, remembered places and notebook/developer maps. It numbers
only enclosed door rooms in natural numeric plan order, retaining all 92
existing plaque numbers. Open circulation has no room number. Player-facing
stair names omit the former R24 modelling reference while shared plan inputs
retain it. Neither notebook fog nor discovery rules change.

Validation: `test-escape-progress.mjs` checks all eight scenario combinations
against the actual door plaques and the text drawn into the notice canvases.
`test-notebook.mjs` checks all 92 map numbers and remembered rooms across the
four floors, as well as existing fog/discovery behavior. Gameplay and two-sided
door-plaque checks pass. `npm run test:gpu` and both
`test-escape-progress-browser.mjs` and `test-notebook-browser.mjs` pass on NVIDIA
GeForce RTX 3090 Ti / Direct3D11, with desktop/touch escape, recovery, restart,
notebook and map checks and no page or shader errors. The notebook browser
restart check uses the actual Restart control and waits for mouse capture to
finish. Readable notices and desktop/mobile maps were reviewed in
`Browser/artifacts/escape-chain/` and `Browser/artifacts/notebook/`.

The required `npm test` attempt stops at the previously documented independent
`test-facade-courses.mjs:68` assertion, 23 courses versus 22. It is not a full
suite pass. This change updates browser narrative, display labels, tests and
notes; shared plan JSON, Unity, Blender and packaged exports are not regenerated.
The existing compiled aerial manifest still matches its source fingerprint.

## Reliable mouse capture after Escape (6 October 2026)

Browser resume actions now wait for confirmed capture of the game canvas before
continuing the run. The ordinary pause menu, help, notebook, capture recovery and
developer map share this behavior. Successful resumes clear movement/drag input,
focus the game canvas and reset the frame clock. Touch controls and browsers
without the pointer-lock API retain their existing controls.

`Browser/dist/mouse-capture.mjs` handles both Promise and legacy event APIs.
Transient `NotAllowedError` failures retry at 1.4-second intervals with a
3.5-second deadline, keeping gameplay frozen. This spacing covers Chrome's
1.25-second native Escape cooldown and avoids flooding its request rate limit;
see the Chromium [browser controller](https://raw.githubusercontent.com/chromium/chromium/main/chrome/browser/ui/exclusive_access/pointer_lock_controller.cc)
and [renderer limits](https://raw.githubusercontent.com/chromium/chromium/main/third_party/blink/renderer/core/page/pointer_lock_controller.h).
Persistent failure retains a pause screen with a focused Resume control and a
fresh-click instruction. Escape during a pending request, blur, hidden tabs and
restart cancel retries; late successful requests are released rather than
resuming a cancelled action. Pending unlock events cannot dismiss a resume.

Validation: `npm run test:gpu`, `npm run test:mouse`, `test-game.mjs`,
`test-explore-input.mjs`, `test-notebook.mjs`, `test-developer-options.mjs` and
`test-notebook-browser.mjs` pass. Browser rendering used the verified NVIDIA
GeForce RTX 3090 Ti through ANGLE/Direct3D11. The actual-game checks cover
repeated Escape/click/key resume, mouse movement after capture, frozen progress,
help/notebook/capture recovery, cancellation, legacy API and mobile controls,
without page/shader errors. Automation sends Escape to the page rather than
Chrome's native unlock UI, so the 1.25-second cooldown and persistent denial
are injected before allowing real capture. The browser's rapid-request limit
was also observed during stress testing. Evidence and reviewed pause/resume
screenshots are in `Browser/artifacts/mouse-capture/`; notebook evidence remains
in `Browser/artifacts/notebook/`.

The required full `npm test` attempt stops at the existing independent
`test-facade-courses.mjs:68` mismatch (23 courses versus 22), recorded in
`Browser/artifacts/mouse-capture/npm-test.log`. This is not a full suite pass.
This fix updates browser input code, tests and development notes; no models,
Unity/Blender exports or packaged builds were regenerated for this change.

## Clear current objectives and visible clue glows (6 October 2026)

The owner reported unlocking the old Library stair gate without understanding
the next action. Escape now shows a current objective with an action, location
and use key. After stair access, it names the porter record in second-floor
room 209, Librarian office beside the old Library, or room 201, Records office
above Reception. When the player is in the other upper section, the objective
explains descending to the first floor and crossing to the other staff stair.
Gate plates and the basement control notice supply the room and attached brass
key clue; opened-gate/release notebook entries retain it for later reading.
Taking the brass key changes the objective to the selected ground-floor outer
entrance, going outside points to the mast, and capture/reclaim supplies the
key-recovery action. Optional notices remain optional, and asking for an
objective does not create notebook evidence or reveal map areas.

Available fittings have a wider, brighter gold halo and a soft camera-facing
beacon above the prop, making horizontal desk papers visible from their doorway.
The rim and beacon pulse every 2.8 gameplay seconds; pause freezes animation and
reduced motion keeps it steady. Depth testing preserves wall/furniture
occlusion. Used notices, released controls and collected keys clear their glow;
lost keys make their source available again, and confiscated property lights
the Reception tray. The compact HUD groups its notebook control with the
objective. On phones the minimap follows its height; landscape guidance leaves
the central crosshair clear. The service record prompt says “PRESS E TO TAKE
BRASS KEY”.

Validation: `npm run test:gpu` confirms NVIDIA GeForce RTX 3090 Ti through
ANGLE/Direct3D11. `test-escape-progress.mjs`, `test-game.mjs` and
`test-notebook.mjs` pass, covering all eight scenarios, optional/out-of-order
clues, both access methods, current objectives, disconnected-upper-section
directions, capture/recovery, glow cleanup and reduced motion. The full hardware
`test-escape-progress-browser.mjs` passes both physically walked upstairs
branches, gated movement/jump rejection, outside traversal and ending,
capture/reclaim/retry, preserved notebook/fog/time and desktop/touch controls,
including the updated objective and brass-key prompts. No page/shader errors
were reported. Reviewed near/doorway views with the torch off, both actual
record offices, portrait/landscape guidance and reduced motion are in
`Browser/artifacts/objective-guidance/`; rerun its `check-browser.mjs after`
from Browser. Its validation JSON records scenario rooms and phone bounds.

The required `npm test` attempt stops at the previously recorded independent
`test-facade-courses.mjs:68` assertion (23 courses versus 22); its log is
`Browser/artifacts/objective-guidance/full-suite.log`. This is not a full-suite
pass. Only browser Escape runtime guidance, fittings, tests and these notes
change. Shared plans, Explore and Unity/Blender/package exports are not
regenerated. The existing aerial compiled manifest still matches its source
fingerprint; these runtime fittings are excluded from aerial compilation.

## Floor appearance while climbing stairs (6 October 2026)

The reported temporary green/dark floor finish is reproduced during an actual
Reception stair climb. The actor reaches Y=4.2 while still retaining floor 0
and its active stair route; the previous lamp pool remains downstairs at Y=2.9.
Stepping clear of the flight switches to first-floor lamps at Y=7.1, turning
the same floor texture beige. Matched-camera captures and the lamp/actor
receipt are in `Browser/artifacts/texture-transient/before-stair-*`.

`Browser/dist/interior-lights.mjs` now blends the two connected floors using
the actor's physical height between the actual route endpoints. A smooth
height weight fades each floor's contribution; a continuous distance penalty
keeps nearly extinguished lamps from occupying the nearby-light pool. At either
endpoint the pool matches that landing before the actor's floor identity
changes. The same shared behavior applies to Escape and Explore, ascending and
descending, basement connections and the relocated Library continuation.
The twelve visible light slots, flat-floor lighting, textures and geometry
retain their existing definitions. No timed loading or texture replacement is
introduced.

`test-interior-lights.mjs` passes the existing floor-cell, nearest-lamp, colour,
selection-boundary and empty-floor checks plus 16 stair journeys. It verifies
identical endpoint lighting across the floor handoff, both floors contributing
at the return landing and continuous contributions through 1,000 height steps.
`test-interior-lights-browser.mjs` physically traverses all 16 journeys and
compares the final stair frame with settled-floor lighting at an identical
camera/actor pose: all pixels match. The floor shader and light budget remain
fixed. Escape, Explore and portrait views pass without page/shader errors on
verified NVIDIA GeForce RTX 3090 Ti / ANGLE Direct3D11. Reviewed captures and
the browser receipt are in `Browser/artifacts/stair-lighting/`; rerun both
checks with `npm run test:interior-lights` from Browser.

GPU policy, gameplay, exploration, stair support/collision and jump regressions
pass. The required `npm test` attempt still stops at the previously recorded
`test-facade-courses.mjs:68` assertion (23 courses versus 22); its log is
`Browser/artifacts/texture-transient/npm-test.log`. This is not a full-suite
pass. Only browser lighting, validation and development notes change. Shared
plans, texture assets, compiled aerial models, Unity, Blender and packaged
exports are not changed or regenerated by this repair.

## Roof undersides and wall joins (6 October 2026)

Ground views exposed sky between many slate skins and the cornices beneath
them. `roof-wall-joins.mjs` now surveys the complete exterior assembly, retains
already-solid roofs and adds opaque backings and eave returns to the open skins.
The returns meet the actual wall/cornice top, reuse its material and stop at the
slate edge. All original roof vertices and existing render profiles stay fixed.
Matching spans are merged, mirrored parents retain outward-facing triangles,
and repeated finishing adds no duplicates. Finishing runs before shadow
preparation, timeline splitting and batching, including late service/tower
buildings. See `Research/roof-wall-gaps/README.md` and the saved user reference.

Validation surveys 570 source roof meshes (285 closed undersides) and 582 after
compiled timeline splitting. All 278 independently frozen, formerly open ground
rays now hit solid geometry in both paths. Eight further horizontal fixture
rays protect outward-facing fascias on ordinary and reflected parents. A welded
edge audit confirms that all 285 original solid roof meshes have no open
boundaries, including the four instanced roof meshes. An independent comparison
preserves every geometry attribute/index, world/instance transform, material
colour/side, visibility and shadow flag on all 16,348 existing meshes. The
repair adds 658 meshes and 20,967 triangles. Historical original-shape tests
exclude only the flagged additions; their saved expected hashes stay intact.

Source roof/contact, roof/render, ward-placement and annexe reflection checks
pass. Local models are rebuilt; compiled roof checks, source/compiled rendering
comparison and timeline controls pass using the verified NVIDIA GeForce RTX
3090 Ti through ANGLE/Direct3D11. The timeline rerun uses the unchanged test
assertions with a separate capture directory because Windows held a shared
screenshot open. Ground/overview review covers fifteen estate cameras and a
portrait view in each model path, with no page/shader errors. Final captures are
`Browser/artifacts/roof-wall-gaps/verified-*-*.png`.

The required `npm test` stops at the previously recorded facade-course count,
23 versus 22. All 134 remaining commands were executed separately, and all
roof-related failures were corrected and rerun. Seven independent failures
remain, each reproduced with the saved pre-roof-repair assembly modules:
`test-facade-courses`, `test-reception-second-floor`, `test-asylum-windows`,
`test-asylum-doorways`, `test-jarman`, `test-leighton-newton` and
`test-aerial-layouts`. These cover the old course count, changed journal/padding
labels, historical estate fingerprints and an earlier saved road trace. This
is not a full-suite pass. Initial, rerun and baseline logs are retained in
`Browser/artifacts/roof-wall-gaps/`.

Scope: browser exterior sources, tests, modelling notes and regenerated local
compiled aerial assets. Unity, Blender and packaged desktop/Android exports are
not regenerated.

## Geometry optimisation and incremental interiors (6 October 2026)

Implemented the owner's geometry-audit selections 1, 2, 3, 5, 6, 8 and 9:
exact compiled-buffer sharing; batched/atlas corridor and Oakmere windows;
room/spatial furniture batches with distant chair/bench geometry; reusable roof
support surveys; exactly indexed room padding; distant gas-holder detailing;
and kerbs with a maximum 5 mm deviation. Nearby furniture/windows/gas-holder
detail, roof-to-render contacts and all 65,722 original padding triangles are
retained. Models, licences, source/output hashes, tolerances and controlled
before/after measurements are described in
`Research/geometry-optimization/README.md`.

The controlled 1300 × 900 aerial view uses 1,868 calls instead of 3,245
(42.4% fewer). Exact buffer sharing removes 41,345,678 duplicate geometry
bytes. The local aerial export is 18,967,333 bytes compressed and 144,693,760
bytes before compression. These are geometry/download measurements, not an
FPS claim. Source and compiled aerials match at 1,868 calls and 859,604
triangles in the compiled-test view; fewer than 0.013% of pixels differ
significantly. The exterior binary content hash is
`8e26443a6d56dbf5a19df0900c7b524f2f0053da8f9d32a840d139a92ce15fa6`.

The owner confirmed the interior prerequisite was complete, so gameplay TODO 7
is now implemented in both Escape and Explore. Ten render sections follow
existing doorway planes and each floor's occupied footprint. The compiler
stores finished geometry and one door-label resource per floor in
`Browser/dist/compiled/interior/`; their total compressed size is 2,683,225
bytes. A worker runs the same compiler when assets are unavailable or damaged.
Live shared materials preserve finish shaders and the supplied basement mural.
Furniture placement, navigation, collision, door/stair records, NPC routes and
interaction state use the complete logical plan throughout loading.

The starting section and nearby corridors/stair connections prepare first.
Other sections load by proximity, stay cached and yield between restoration,
furniture and graphics steps. Upload batches target six milliseconds and warm
the room shaders before entry; the rare mural/quilt shader variants also have
small shared fixtures prepared before entry. An individual WebGL/driver call
cannot be interrupted and can exceed that budget, so this does not guarantee
stutter-free rendering on every device. Entry at an unfinished section is held
until it is ready, with a retry prompt on failure. Retrying retains successful
floor resources and cached rooms. Replay during loading updates the current
placement seed without losing or duplicating later furniture. Explore touch
entry resumes automatically when a requested doorway becomes ready.

`test-interior-loading.mjs` checks every entrance and stair landing, all section
bounds/materials, and independently compares the entire source surface area
with the clipped sections. `test-interior-loading-browser.mjs` checks prepared
assets, missing-asset worker fallback, worker-launch and graphics failures,
retry, held entry, every entrance/stair connection, immediate cached return and
replay both during and after loading. It records entry preparation, frame
pacing and retained memory using the real twelve-light pool, fog and tone
mapping. The final receipt is
`Browser/artifacts/geometry-optimization/final-loading-receipt/validation.json`.
Deliberate new-game furniture generation is measured separately from background
loading; entry times exclude plan/furniture-resource setup and are not total
page-ready times. Phone-sized views use the same desktop hardware GPU, not a
physical-phone benchmark.

The final local run requires one section before entry: 2.65 seconds with
prepared assets and 3.42 seconds through the worker fallback. Background frames
have a 16.7 ms median; the largest observed frame is 50.1 ms in the desktop
asset case and 29.8 ms in the portrait worker case. Restoration peaks at
3.8 ms and furniture assembly at 8.5 ms. Initial graphics-driver calls before
entry reach 201.9 ms, which is why preparation remains separate from entry.
All ten cached sections and shared furniture retain 22,972,620 geometry-buffer
bytes; approximate sampled JS heap is 148–157 MB, including textures and logical
state. These are diagnostic samples, not process/GPU-memory totals or a device
performance guarantee.

All local rendering used verified NVIDIA GeForce RTX 3090 Ti / ANGLE
Direct3D11. Final Escape/Explore furniture checks cover 34 models, actual
instance/collision dimensions, wall contacts, keyboard collision, fixed
landmarks and replay; padding checks cover all four cells, desktop/portrait and
close-up relief. Both modes have no page/shader errors. Reviewed captures and
receipts are in `Browser/artifacts/geometry-optimization/verified-furniture/`,
`final-cells/` and `final-explore/`. The compiled suite passes roof geometry,
all 278 frozen gap rays, source/compiled images, all timeline stops and
interior asset/fallback checks. Fresh screenshot folders avoid Windows locks
on previously opened captures; test assertions remain enabled.

The known facade-course assertion is fixed: the newer continuous outer-end
gutter is one separate sweep alongside 22 render courses. All 23 still receive
the existing 3,112 top/underside and 36 complete-scene west probes. The fix
changes no facade geometry. `npm test` now passes that check and stops at the
previous reception notebook assertion expecting the old internal label R42.
Every command was also executed separately: 139 of 143 pass. The four remaining
pre-existing failures are `test-reception-second-floor`, `test-jarman`,
`test-leighton-newton` and `test-aerial-layouts` (old journal/estate/road
expectations). Logs and the complete command receipt are in
`Browser/artifacts/geometry-optimization/`; this is not a full-suite pass.
The four failures were also rerun against the saved pre-optimisation modules
and reproduced with the same assertions; `baseline-results.json` and its logs
retain that evidence.

`npm run build:models` now builds both aerials and interior sections.
`npm run test:interior-loading` checks the latter after compilation, and is
included in `test:compiled`. Hosted compilation explicitly uses the existing
CI-only software-rendering exception; local validation continues to require
hardware acceleration. Browser source, tests, notes and local compiled assets
are updated. Unity, Blender and packaged desktop/Android exports are not
regenerated.

## Downpipe/window clearance — 7 October 2026

The owner's request moves existing drainpipes out of the windows and prevents
new intersections as facade schedules change. `downpipe-clearance.mjs` checks
the complete finished scene before timeline splitting, batching and transform
caching. Explicit instance tags and named downpipes distinguish rainwater goods
from stair supports or columns. Each overlapping pipe shifts the shortest
distance along its existing wall, clearing every window row and perpendicular
return with allowance for its thickness, frames and sills. Already clear pipes
retain their transforms. Brackets, shoes and offsets follow moved assemblies.
The additional service/pharmacy buildings are checked after layout assembly.

Thirty-two pipes move: 31 in the gameplay estate and one pharmacy pipe added by
the aerial/walking layouts. The complete check covers 260 pipes and 3,116
windows. The regression exercises staggered rows, rotated/non-uniformly scaled
and mirrored parents, perpendicular return windows, fitting alignment,
idempotence and visible formerly obstructed basement/west-side panes. It is
included in `npm test` and available separately as `npm run test:downpipes`.
See `Research/downpipe-window-clearance/README.md` for the placement notes.

Validation uses the required hardware launcher and verified NVIDIA GeForce
RTX 3090 Ti through Direct3D11. Relevant estate, facade, window, courtyard,
pharmacy, tower, shadow and batching checks pass. Source, before and rebuilt
compiled views are inspected; source/compiled rendering, full detail, fallbacks,
roof preservation and the historical timeline checks pass. Evidence is under
`Browser/artifacts/downpipe-clearance/`, including a fixed-source primitive
comparison that allows only pipe/fitting movements. No architectural geometry
is changed by this repair.

The complete `npm test` run stops at the existing second-floor notebook R42
assertion. Historical Jarman and Leighton whole-estate snapshots also fail:
their frozen counts already differ from the current scene with pipe relocation
disabled, and the requested movements additionally change their hashes. Those
unrelated/frozen references are retained rather than silently refreshed. This
is not a full-suite pass. Concurrent roof and gameplay edits are preserved.

Shared browser sources and the local compiled aerial are updated. Unity,
Blender and packaged desktop/Android exports are not regenerated by this repair.

## Redesmere roof protrusions (7 October 2026)

Removed the redundant brick strip above the rear-return eaves. The small stair
lean-to now ends directly at the main slate edge, enclosing the formerly
exposed white roof return. Its solid roof slab and tapered wall share that
junction; the ground footprint, adjoining openings and fire escape remain.
The remaining Redesmere survey also trims the garden pavilion's raised
cornice crown to its shallow roof edge and stops the outer main-range brick
trim beside the lower entrance hip. The photographed parapet and chimney
assemblies remain intentional projections. See
`Research/redesmere-roof-cleanup/README.md` and the owner's marked screenshot.

`test-roof-wall-joins.mjs` now runs the independent Redesmere roof probes for
source and compiled scenes: the former brick-strip points, ground rays through
the former floating white return and 94 source / 244 compiled render-top
samples. All pass, alongside the 278 existing eave-gap rays. The Redesmere
garden, assembled exterior, roof attachment, courtyard coverage and stair
clearance checks pass, including exposed windows and walking access.

Hardware visual review covers eight ground/overhead views in source and
compiled modes using the verified NVIDIA GeForce RTX 3090 Ti through
ANGLE/Direct3D11. The compiled-model suite passes roof geometry,
source/compiled rendering equivalence, timeline controls and interior loading.
The required `npm test` passes the roof checks, then stops at the already
documented `test-reception-second-floor.mjs:76` expectation for the old R42
notebook label. This is not a full-suite pass. Captures and validation logs are
in `Browser/artifacts/redesmere-roof-cleanup/`.

Browser model sources and local compiled aerial assets are updated. Unity,
Blender and packaged desktop/Android exports are not regenerated. Existing
concurrent workspace edits are retained.

## Responsive Escape launch and building transitions (7 October 2026)

The reported roughly six-second delay is reproduced as 4.05–4.36 seconds of
synchronous furniture regeneration, followed by first graphics work and the
existing one-second establishing shot. An earlier sample reaches 8.13 seconds
of furniture work. The first outdoor canvas draw takes 2.88 seconds even though
the door interaction itself takes only 3 ms. These are local diagnostic samples,
not network loading times or FPS measurements; see
`Browser/artifacts/escape-transitions/before.json`.

Escape now randomizes its initial furnishings and builds its first scenario
while the loading screen is present. The first click consumes that prepared
run. Both scenes compile their canvas shaders and draw the initial Reception
and arrival views before the title becomes interactive. Replays still choose
fresh furniture and pursuer positions. Furniture placement prepares door-leaf,
panel and handle polygons once per pass, rejects distant corridor/door checks
conservatively and reuses fixed candidates' static clearance results. Checks
against other furniture remain live. A signature of the architectural inputs,
door poses and furniture dimensions invalidates the cache after changes.

Indoor and outdoor spotlights remain attached to their respective scenes.
The outdoor light has zero intensity during indoor play and aerial sequences;
doorway changes update the appropriate light before drawing the new view.
Keyboard and touch torch controls change intensity, keeping shader light counts
stable. Moving the original torch used to introduce a new exterior shader
variant and invalidate the warmed indoor variants during background loading.
The interaction, collision, door locks, notebook and escape timer retain their
existing behavior. The three-second arrival, including its intentional
one-second hold, is preserved.

The final desktop/portrait transition check records 99–199 ms of first-click
preparation, roughly 1.15–1.17 seconds for replay, and a maximum 152.2/19.0 ms
canvas draw across sixteen actual-key doorway transitions with the
torch on and off. No additional shader programs are created by these switches.
Earlier unvisited-wing draws varied up to approximately 0.5 seconds despite
shader reuse; driver work cannot be guaranteed interruption-free on every
device. Phone-sized views use this desktop GPU, not a physical-phone benchmark.
Final receipts and reviewed indoor/outdoor captures are in
`Browser/artifacts/escape-transitions/verified/`; the original complete furniture
baseline is retained losslessly as `furniture-before.json.gz` beside it.

`npm run test:transitions` checks all original furniture records, navigation
cells and safe spawns for eight seeds, cache invalidation after a door moves,
launch/replay responsiveness, shader reuse, permanent light ownership and
keyboard/touch torch controls. Hardware arrival and the full physically walked
Escape chain pass, including both stair/key branches, capture recovery, grounds
and ending, desktop/touch input, frozen arrival state and clean retry. Furniture,
gameplay, escape progress/grounds and compiled interior geometry checks pass.
Rendering uses the verified NVIDIA GeForce RTX 3090 Ti through ANGLE/Direct3D11.

The required full `npm test` attempt passes the relevant checks and stops at
the already documented `test-reception-second-floor.mjs:76` expectation for
the old R42 notebook label. Its log is
`Browser/artifacts/escape-transitions/npm-test.log`; this is not a full-suite
pass. The new fixture check also runs separately and is registered in the suite.
Both local compiled model paths are regenerated and their fingerprints match
the current shared sources. This change does not alter model geometry or
furniture placements for a given seed. Unity, Blender and packaged builds are
not regenerated, and concurrent roof, pipe and gameplay edits are preserved.

## Tower workshop interiors and maintenance props (7 October 2026)

The marked blue stores door beside the water tower now opens inward in Escape.
A short vestibule connects to the existing Farndon passage at X=156.3; the
passage's tower section is hollowed within its established 5.4-unit width.
Three accessible rooms fit the marked service-building outline: repair,
oil/parts, and machine workshops. Workbenches, a vice, spanners, parts shelving,
oil tins, drill press, lathe and assembly table give each room a workshop use.
The crowbar and oil can move from the old outdoor lean-to to separate benches.
Red lower brick, pale painted upper courses, the tiled band, skirting and
service lighting follow the supplied corridor photographs. The hidden room
partitions are inferred gameplay fittings. See Research/escape-grounds/README.md
and the saved tower-workshops-reference.png for modelling evidence and scope.

The crowbar has a continuous curved steel crook, split claw and flattened tip;
the oil can has a rounded reservoir, pump, open loop handle and brass spout.
The maintenance wicket now carries a full iron frame, hinge straps/knuckles,
latch, ring pull, irregular grained boards and visible nails. Gate timing,
noise, guard behaviour and capture rules remain intact. Tools return to their
benches on capture; opened access/boundary fittings remain open. New attempts
restore the original shells/batches before constructing the runtime interior.
The grounds boundary follows the stores envelope, the map includes all three
rooms and the HUD names the current room.

Implementation: Browser/dist/tower-workshops.mjs and maintenance-props.mjs,
connected through escape-grounds.mjs, game.mjs, notebook.mjs/notebook-map.mjs
and escape-progress.mjs. Original shared estate modelling sources and all tower
roof contacts remain fixed. Affected tower/corridor batches are rebuilt, static
transforms recached, walking obstacles refreshed and shadows invalidated.
These fittings are created only for Escape and are excluded from the compiled
estate/interior recipes. No compiled assets or Unity/Blender/package exports are
regenerated by this change; concurrent shared modelling/build changes remain.

Validation: `npm run test:gpu` and the final `npm run test:grounds` pass on
NVIDIA GeForce RTX 3090 Ti / ANGLE Direct3D11. The real-game walkthrough walks
all three rooms, tests the closed/open access door using keyboard movement,
collects oil with the touchscreen control, completes both gate routes, checks
patrol/noise/pause/capture/restart, and finds no perimeter holes with trees
shown or hidden. No page or shader errors are recorded. The new CPU regression
walks the actual batched estate twice and compares every original mesh, parent,
material, transform, instance buffer and geometry hash after disposal. All
original estate records are restored exactly. Map/game/progress, tower service
buildings, ward corridors, outdoor movement, water tower, exterior and shadow
checks also pass. Desktop, portrait, corridor, all rooms and close tool/wicket
views were visually reviewed. Logs/captures: Browser/artifacts/tower-workshops/.

The required full `npm test` passes the new workshop and grounds tests, then
stops at the previously documented `test-reception-second-floor.mjs:76`
expectation for the old R42 notebook label. Its final log is
Browser/artifacts/tower-workshops/full-suite.log. This is not a full-suite pass.

## Tower faces exposed inside the workshops (7 October 2026)

The tower-side vestibule and passage now show the existing exterior tower
directly. The runtime stores model omits its masonry, painted lining and
skirting on the two edges enclosed by the tower; the original tower's brick,
arched entrance, repairs, corner strips and plinth retain their exact meshes,
materials and transforms. The vestibule's right partition moves from X=153.6
to X=153.1, with a stepped north end meeting the corner strip and lower plinth
without a gap or intersection. Batching and walking refresh use the corrected
wall geometry. See Research/escape-grounds/README.md and its saved owner
screenshot. Concurrent gallery, arched-window and workshop-door edits remain.

The CPU workshop regression compares 44 south/east sightlines with the original
tower and checks contact at four heights, moved-wall collision, physical room
walks and exact estate restoration on two attempts. It passes, as do grounds,
water-tower, tower-building, exterior and shadow checks. The updated real-game
grounds walkthrough passes on the NVIDIA GeForce RTX 3090 Ti through ANGLE
Direct3D11. The independent contact inspection confirms 32 original-tower
sightlines, correct collision and no page/shader errors; desktop, phone,
daylight and night views were visually reviewed. Contact screenshots and logs
use Browser/artifacts/tower-workshops/tower-contact-* and tower-face-*/tower-right-*.

The final required `npm test` passes the tower-contact/workshop and grounds
regressions, then stops at the previously documented R42 notebook-label
assertion in `test-reception-second-floor.mjs:76`. Its complete log is
Browser/artifacts/tower-workshops/tower-contact-full-suite.log. This is not a
full-suite pass; the earlier transient workshop-route failures are resolved
in the current shared source.

Only Escape runtime source and validation/reference files change for this
correction. Shared tower/roof sources, generated estate/interior assets and
Unity/Blender/package exports are not regenerated.

## Workshop door sign (7 October 2026)

The entrance plaque now sits on the upper recessed door panel and reads only
`Workshop`, centred in larger type. It is attached to the opening door pivot
and excluded with the door from static batching. Other notice text keeps its
existing layout. This changes the Escape runtime fittings in
`tower-workshops.mjs` and the sign helper in `escape-grounds.mjs`. The plaque is
created only for Escape; compiled estate/interior models and Unity/Blender
exports were not regenerated.

The hardware grounds walkthrough passes on NVIDIA GeForce RTX 3090 Ti through
ANGLE/Direct3D11, including door entry, all three rooms, tool collection,
boundary routes, capture and restart. Reviewed closed/open door captures and
the receipt are in `Browser/artifacts/workshop-sign/`; `npm run test:gpu` passes.
The full `npm test` passes the grounds/workshop checks and stops at the existing
`test-reception-second-floor.mjs:76` assertion for the old R42 notebook label.
The complete log is `Browser/artifacts/workshop-sign-suite.log`.

## Distant wall light streaks (7 October 2026)

The reported horizontal glows across the laundry, rear court and low gallery
come from the street lamps' ground-pool overlays. Their slope-scaled polygon
offset pulled horizontal glow planes forward through solid masonry at shallow
walking angles. Restoring the old offset reproduces the lines without changing
the walls, windows or sunlight.

`Browser/dist/day-night.mjs` now uses ordinary depth testing for those pools.
Their existing Y=0.405 placement already clears the paved surface. Ground glow,
window emission, lamp positions, point lights and the cached sun shadows retain
their existing behavior. This is a runtime browser lighting change; it changes
no model geometry and does not require regenerating the estate binary. Unity,
Blender and packaged exports are not regenerated.

`test-street-light-occlusion-browser.mjs` uses the production glow material in
an independent solid-wall fixture. All 600 wall samples remain occluded across
five distances (12-200 units) and the Escape, Explore and aerial near planes.
The original offset fails the same survey; open paving still receives visible
glow at every distance. The check runs within `npm run test:day-night`.

The complete day/night checks pass, including all periods, source/compiled
loading, desktop/portrait controls and night selection. Final source/compiled
captures cover the laundry, rear court, arched gallery and a nearby lamp view;
actual Escape captures cover dusk/night and a portrait courtyard. Rendering
uses the verified NVIDIA GeForce RTX 3090 Ti through ANGLE/Direct3D11, with no
page or shader errors. Comparisons, the independent pixel report and logs are
under `Browser/artifacts/wall-light-leaks/`.

The required full `npm test` attempt stops at the workshop crowbar-route
assertion in `test-tower-workshops.mjs:42`. That test's complete dependency graph
does not import the changed lighting module; this is an independent workspace
failure. Its log is `Browser/artifacts/wall-light-leaks/full-suite.log`. This is
not a full-suite pass. Existing concurrent workspace edits are retained.

## Full workshop gallery, semicircular windows and signed room doors (7 October 2026)

The accessible Escape passage now follows the full Main/admin-to-Farndon
gallery at X=156.3, from Z=9.8 to -132.1, within its established 5.4-unit width.
Flooring, wall finishes, ceiling, pipes and tube lights continue throughout;
the notebook map, navigation bounds and scenario boundary follow the extended
interior. Closed ends retain the adjoining buildings as exterior models. The
two existing grounds-gate escape routes remain required.

`workshop-gallery.mjs` cuts adjoining shells while retaining their vertex
attributes and original meshes for replay restoration. Real arched openings
through masonry and lining expose the gallery glazing on both sides. Exposed
workshop walls receive matching divided semicircular windows, including two
west openings beside the retained photographed sashes. Building contacts remain
internal walls. Concealed junction windows and projecting branch fittings are
removed from the passage. Existing tower faces, corner contact and roofs remain.

Each room now has an opening timber door with recessed panels, handles and a
centred sign affixed to its leaf. E opens it; leaf collision follows its actual
closed/open bounds. Moving doors and signs are excluded from static batches.
The affected estate batches/transforms are rebuilt, navigation refreshed and
shadows invalidated. Room-door state survives capture and resets on a new run.

Geometry/gameplay checks and the hardware grounds walkthrough pass on NVIDIA
GeForce RTX 3090 Ti / ANGLE Direct3D11. Validation includes the complete walked
gallery, three room doors and moving plaques, over 140 lower-pane/arched-head
visibility rays from both sides, all room/tool/gate routes, tree visibility,
capture/restart and exact restoration of every original estate mesh, batch,
transform and instance buffer. Desktop/portrait views and logs are retained
in `Browser/artifacts/workshop-gallery/`. The required `npm test` attempt stops
at the existing `test-reception-second-floor.mjs:76` R42 notebook assertion;
its full log is saved there. This is not a full-suite pass.

These changes are Escape runtime fittings. Shared compiled estate/interior
assets, Explore, Unity, Blender and packaged exports are not regenerated.
See `Research/escape-grounds/README.md` for inferred modelling choices and scope.

## Aged floor signs beside internal staircases (7 October 2026)

Escape and Explore share thirteen wall-mounted floor plaques: four on the
ground floor, five on the first floor, and two each in the basement and on the
second floor. Each identifies its current storey as Basement, Ground Floor,
First Floor or Second Floor. Existing solid well fronts carry the signs between
the flight mouths. The revised straight Library flight gets signs beside its
actual lower and upper approaches; the first-floor west stair therefore has
separate plaques for its two distinct approaches.

`asylum-stair-signs.mjs` derives the mounts from the current stair connections
and existing walls, avoiding window bays. The 1.42 by .43 plaques sit at 1.88
above each floor, above the handrails and dado, with shallow physical depth and
2 mm clearance to masonry. Cream-painted timber, serif lettering, chipped
edges, grain, stains, ink scratches and tarnished fixings use deterministic
canvas paint. The lettering appears only on the front, with exposed timber
on the board edges. Each floor uses one merged sign mesh and one 1024 by 320
texture. The interior compiler and worker include that material in each floor's
shared resource, preserving it across separately loaded sections.

Validation: `test-asylum-stair-signs.mjs` covers all thirteen plaques, sixteen
landing approaches and 117 readable-face/masonry-mount probes. Existing stair
and room-number checks pass, as does compiled interior surface preservation.
The GPU browser check inspects every plaque from a clear walking position,
compares exact sign records and paint hashes across prepared assets, worker
fallback, Escape and Explore, and captures all plaques plus four phone views.
Interior loading checks pass entry gating, failure/retry, every entrance/stair,
cached return and replay in prepared and worker modes. The required hardware
launcher and GPU smoke check verify NVIDIA GeForce RTX 3090 Ti through
ANGLE/Direct3D11; no page or shader errors occur. Receipts and reviewed views
are in `Browser/artifacts/stair-floor-signs/`. Run `npm run test:stair-signs`
for the focused checks; the logic check is also registered in the main and
asylum suites.

The required `npm test` run stops at the existing
`test-reception-second-floor.mjs:76` expectation for the former R42 notebook
label, already documented by earlier changes. Its log is
`Browser/artifacts/stair-floor-signs/npm-test.log`; this is not a full-suite
pass. The relevant sign, stair, door-label and loading checks pass separately.

Browser interior sources and local compiled interior assets are updated. The
shared plan and walking/collision routes retain their definitions. The aerial
compiled fingerprint remains current without an estate rebuild. Unity,
Blender and packaged exports are not regenerated.

## Main-corridor brick band and striped reveals (7 October 2026)

The supplied main-corridor photograph corrects the Escape gallery's former
single, low decorative course. Its red/buff header band now occupies three
0.10-unit courses from Y=1.38 to 1.68, just above the retained Y=1.48 window
sill. Physical wall UVs keep that height consistent through the gallery and
workshop linings, including the west arch spandrels. Exposed red brick below
and pale painted brick above use finer joints, muted colour variation, small
deterministic grain and shallow bump relief.

`workshop-interior-finish.mjs` creates the shared runtime finishes and inward
window surrounds. Separate red/buff jamb courses and radial arch bricks run
back through the wall thickness, with recessed mortar, a thin red outer edge
and grey stone sills. Narrower painted gallery sash frames leave the striped
masonry visible. The clear aperture, existing glazing divisions, exterior
stone details, original tower surfaces and signed opening doors are retained.
Window reveal tessellation follows the angle of each brick rather than using
full-arch subdivision for every small sector; static details join the existing
material batches and all new resources participate in runtime disposal.

Focused grounds and workshop geometry checks pass, covering physical walking,
door/sign operation, lower-pane and arched-head visibility from both sides,
unchanged tower/roof geometry and exact replay restoration. The final GPU
walkthrough passes with no page/shader errors on NVIDIA GeForce RTX 3090 Ti
through ANGLE Direct3D11; `npm run test:gpu` also passes the launcher policy and
render check. Reviewed oblique/window/room views, desktop/portrait walkthrough
captures, geometry log and GPU receipt are in
`Browser/artifacts/corridor-interior-finish/`. The required `npm test` stops at
the previously recorded R42 notebook-label assertion in
`test-reception-second-floor.mjs:76`, with its log saved in the same folder.
This is not a full-suite pass.

These are Escape browser runtime fittings; shared compiled estate/interior
assets, Explore, Unity, Blender and packaged exports are not regenerated.
The reference and visual estimates are recorded in
`Research/escape-grounds/README.md`.

## Water tower entrance and tiled corner (7 October 2026)

The supplied entrance photograph now guides a distinct, centred black door
leaf between the white panels. Narrow white jambs, a shallow reveal, handle,
hinges and threshold give it physical edges and recognisable door fittings;
the dark arched fanlight retains a small barred vent. The modern parking sign
is omitted as requested. The entrance-side pale tiled patch rises from its
former 3.6-unit top to the adjacent annexe-side patch's existing 4.1-unit top.
Both patches share their vertical limits. Reference interpretation and
estimated dimensions are recorded in `Research/water-tower/README.md`.

The focused water-tower, tower-building, roof-contact, escape-exterior and
tower-workshop checks pass. `npm run test:gpu` verifies NVIDIA GeForce RTX
3090 Ti through ANGLE Direct3D11 and the hardware-launcher policy. The source
and rebuilt compiled captures verify door, corner, oblique and phone views,
matching tiled heights, exact retained roof-scar vertices/colours and tower
placement, with no page or shader errors. `node build-models.mjs` rebuilds the
local aerial asset, and `node test-precompiled-models.mjs` passes normal and
full-detail loading, source comparison and fallback validation. Reviewed
images, GPU receipts and logs are in
`Browser/artifacts/water-tower-entrance/`.

The required `npm test` again stops at the existing R42 notebook-label
expectation in `test-reception-second-floor.mjs:76`; its log is
`Browser/artifacts/water-tower-entrance/npm-test.log`. This is not a full-suite
pass. Browser model source and the local compiled aerial asset are updated.
Interior assets, Unity, Blender and packaged exports are not regenerated.

### Water tower entrance follow-up (7 October 2026)

The owner's follow-up restores two narrow bricked inset windows to the left of
the entrance, replacing the previous single projecting brick block. The shaft
keeps its original square dimensions; only the +Z skin receives the two
rectangular apertures. Brick returns close them against infill 0.115 units
behind the face, leaving the other shaft faces intact. The entrance's broad
projecting brick sill is removed, and its white panels, jambs and black leaf
reach ground level around a thin threshold within the frame depth. The
semicircular brick head now has the same alternating red/buff-yellow radial
brick finish as sides 3 and 4, retaining its previous centre and profile.

The water-tower check covers both exposed recessed infill planes, the striped
entrance arch, the low threshold and door/panel surfaces down to the ground.
The focused tower-building, roof-contact, escape-exterior and tower-workshop
checks pass, as does the hardware GPU smoke/launcher check. Before/after source
and rebuilt compiled views cover the entrance, both window recesses, shared
tiled corner, oblique details and phone framing. Source/compiled window
geometry and threshold positions match exactly, as do retained roof-scar
vertices, colours and tower placement, with no page or shader errors. The
receipts and reviewed views are in
`Browser/artifacts/water-tower-entrance-followup/`.

Browser model source and the local generated aerial asset are updated; shared
interior assets, Unity, Blender and packaged exports are not regenerated.

`node build-models.mjs` and `node test-precompiled-models.mjs` pass for the
follow-up, including source comparison, full-detail loading and fallback
checks. The corresponding build and compiled-check logs are saved with the
follow-up captures.

The required follow-up `npm test` again stops at the previously recorded R42
notebook-label assertion in `test-reception-second-floor.mjs:76`. The complete
run log is `Browser/artifacts/water-tower-entrance-followup/npm-test.log`; this
does not constitute a full-suite pass.

## Redesmere door gallows brackets (7 October 2026)

The two blue gabled door canopies in `rear-court-photo-detail.mjs` now use
standard square timber gallows brackets, matching the owner's supplied
photograph. Each bracket has an upright anchored to the actual wall, a level
projecting arm and a diagonal rising from the upright to the outer arm.
This replaces the round braces and hanging uprights at the canopy edges.
The original blue covers and doors retain their geometry. Reference details
and estimated dimensions are in `Research/east-courtyard/README.md`.

The exact before/after comparison verifies that all 1,446,222 primitives
outside the two canopy areas retain their geometry, materials, transforms
and shadow flags. Reviewed source and compiled front/oblique views show both
complete brackets attached to their walls and supporting the roof undersides.
Captures, baseline source and scope receipts are under
`Browser/artifacts/redesmere-gallows/`. All rendering uses the verified NVIDIA
GeForce RTX 3090 Ti through ANGLE Direct3D11; `npm run test:gpu` passes.

Focused `test-escape-exterior.mjs`, `test-redesmere-garden.mjs`,
`test-exterior-door-supports.mjs`, `test-exterior-stair-clearance.mjs` and
`test-downpipe-clearance.mjs` pass. Source roof/wall checks pass in the required
`npm test` run; rebuilt compiled roof/wall checks also pass, including the
244 Redesmere render-top probes and 278 eave-gap rays. The regenerated estate
passes `test-precompiled-models.mjs`, with matching source/compiled draw counts,
detail controls and corrupt/missing asset fallback. Both local canopy capture
runs report no page or shader errors.

The required full `npm test` stops at the previously recorded R42 notebook
label assertion in `test-reception-second-floor.mjs:76`. This is not a full
suite pass. The canopy change does not modify the notebook or interior rooms.

Scope: shared browser source for aerial, Explore and gameplay, plus rebuilt
local compiled aerial assets. Unity, Blender, compiled interior assets and
packaged desktop/Android exports are not regenerated.

## Door signs match the aged staircase plaques (7 October 2026)

All 92 numbered room signs (184 readable faces) and the four workshop door
signs now share the staircase plaques' aged cream-painted timber, serif
lettering, double border, grain, stains, chipped edges and tarnished fixings.
`asylum-sign-paint.mjs` supplies the same deterministic paint and board-edge
UVs to the stair, room and workshop signs. Exact pixel hashes confirm that
the thirteen reference staircase signs retain their original paint.

Room numbers and treatment/upstairs names retain their existing wording and
two-sided placement on the parked leaves. Each floor retains one padded atlas
and merged label mesh, with lit, rough timber boards replacing the brass-backed
unlit nameplates. Workshop plaques retain their names and mounts and follow
their opening leaves; their dimensions now use the floor-sign proportions.
Existing grounds notices and emergency-exit fittings retain their presentation.

The door-label, stair-sign, room-door, grounds and workshop logic checks pass.
Local compiled interior assets are rebuilt, and their section-bound and complete
source-surface preservation check passes. GPU browser validation verifies all
184 room-sign faces, four workshop materials, exact prepared/worker paint parity,
unchanged staircase paint, and reviewed desktop/phone and opened-door captures
with no page or shader errors. Rendering uses NVIDIA GeForce RTX 3090 Ti through
ANGLE/Direct3D11, also verified by `npm run test:gpu`. Receipts and captures are
under `Browser/artifacts/door-sign-style/`; its `check-browser.mjs` repeats the
visual inspection against the retained staircase reference hashes.

The existing room-door browser check now waits for all streamed sections and
counts their combined instances, using the current 92-door plan. It passes
Escape/Explore parity, 188 actual player doorway crossings and 22 desktop/phone
views; its log and captures are retained in the same artifact folder.

The required full `npm test` stops at the previously documented R42 notebook
expectation in `test-reception-second-floor.mjs:76`; the log is retained in the
same artifact folder. This is not a full-suite pass. The relevant sign and door
checks pass separately.

Scope: shared browser interior sources for Escape and Explore, rebuilt local
compiled interior assets, and Escape runtime workshop fittings. The estate
binary, Unity, Blender and packaged desktop/Android exports are not regenerated.

## Workshop exterior wall flicker beside the tower (7 October 2026)

The blue-circled Asylum Escape west stores wall had coincident runtime interior
and exterior faces at X=146.3. The plaster ceiling edge produced a long pale
stripe; the partition end caps and south masonry return produced vertical
patches. The real game reproduced these on the verified NVIDIA GeForce RTX
3090 Ti through ANGLE/Direct3D11. The before receipt records 51 exposed probe
locations with competing faces.

Browser/dist/tower-workshops.mjs now insets the floor/ceiling outline by 0.04
units at each stepped corner and ends partitions/returns inside the enclosing
masonry. The exterior wall plane, tower meshes and roof contacts are retained.
The existing batch/transform rebuild, obstacle refresh, shadow invalidation
and replay-restoration paths continue to apply.

Browser/test-tower-workshops.mjs adds 105 real assembled facade probes per
attempt at the former ceiling stripe, partition ends, floor edge and return.
It passes both attempts, alongside all existing room walks, doors/signs,
window visibility, tower/roof retention and exact estate restoration checks.
The GPU policy check, grounds logic, water-tower, tower-building, exterior and
shadow checks pass. The hardware grounds gameplay walkthrough passes with no
page/shader errors. Desktop, shifted, oblique, doorway and portrait wall views
were reviewed, and the after receipt contains zero exposed overlap samples.
Evidence: Browser/artifacts/tower-wall-flicker/inspect.mjs, before/after images
and JSON receipts, grounds-browser.log and full-suite.log. The walkthrough's
standard outputs are in Browser/artifacts/corridor-interior-finish/.

The required full npm test passes the grounds/workshop regression and stops
at the previously documented R42 notebook-label assertion in
Browser/test-reception-second-floor.mjs:76. This is not a full-suite pass.

Scope: Asylum Escape browser runtime fittings only. Shared compiled assets,
Explore, Unity, Blender and packaged desktop/Android exports are not
regenerated by this repair. See Research/escape-grounds/README.md.

## Developer unlock for all 1829 doors (7 October 2026)

In Asylum Escape, press minus to reveal developer options, then click
`U · Unlock all 1829 doors` or press U. The toggle bypasses all 24 outside
door locks/bolts and both upper staff grilles, including their visible leaves,
collision and locked interaction prompts. U works while the mouse is captured;
held keys, modified shortcuts and typing do not activate it. The button shows
its enabled state and wraps with the other controls on narrow screens.

The bypass grants no keys or invented discoveries. Its indoor objective directs
the player to any outside door; grounds gates and the final mast interaction
retain their normal requirements. Capture preserves the toggle. Turning it off
or disabling developer mode restores normal restrictions, while grilles opened
with a key or the basement release retain their actual progress. Restart clears
the toggle; selecting it at the title applies to the first run. Aerial, Explore
and the legacy grid fixture do not expose the option.

Validation: developer-menu, gameplay and escape-progress logic checks pass.
Hardware browser checks pass for the new option at 1200 and 320 px, including
every outside exit, physical passage through both grilles, U/repeat handling,
capture, toggle off, developer disable, restart and button bounds. Reviewed
locked/unlocked captures and receipts are in Browser/artifacts/developer-doors/.
Existing Aerial/Explore developer controls and both physically walked normal
key/office escape branches also pass. All browser launches verify NVIDIA
GeForce RTX 3090 Ti through ANGLE Direct3D11; npm run test:gpu passes.

The required npm test stops at the existing R42 notebook-label assertion in
Browser/test-reception-second-floor.mjs:76. It passes the updated progression
and grounds checks before that failure; this is not a full-suite pass.
Only browser UI/runtime, related checks and these notes change. Model sources,
compiled assets, Unity, Blender and packaged exports are not regenerated.

## Rectangular sashes beside the Workshop door (7 October 2026)

The owner's follow-up restricts the short west stores facade adjoining the blue
Workshop entrance to rectangular windows. Browser/dist/tower-workshops.mjs
retains the four existing rectangular sash openings and fills the two inferred
small arched apertures with continuous brick and matching interior lining.
The unused west-arch builder is removed from workshop-gallery.mjs. Windows on
other gallery/workshop elevations keep their existing geometry, and the
ceiling/partition flicker repair remains in place.

The focused workshop regression passes both attempts, checking the former
apertures from each side and sixteen sightlines through the retained lower and
upper rectangular panes, plus existing walks, doors, tower/roof retention,
facade overlap probes and exact estate restoration. Hardware game views were
reviewed from desktop, oblique, doorway, shifted and portrait positions on
NVIDIA GeForce RTX 3090 Ti / ANGLE Direct3D11. The receipt reports zero sampled
exposed or occluded wall overlaps and no page/shader errors. Evidence uses the
rectangular- prefix in Browser/artifacts/tower-wall-flicker/.

This changes Asylum Escape runtime fittings only. Compiled estate/interior
assets, Explore, Unity, Blender and packaged exports are not regenerated.
The latest modelling correction is in Research/escape-grounds/README.md.

The required full npm test passes the corrected grounds/workshop checks and
stops at the existing R42 notebook-label assertion in
Browser/test-reception-second-floor.mjs:76. Its log is
Browser/artifacts/tower-wall-flicker/rectangular-full-suite.log; this is not a
full-suite pass.



## Workshop wall moved to the purple tower guide (7 October 2026)

The marked west workshop facade in Asylum Escape moves 0.9 scene units west,
from X=146.3 to X=145.4, retaining its north/south direction and 90-degree
meeting with the tower. The amount is estimated from the owner's screenshot,
saved as Research/escape-grounds/workshop-wall-position-reference.png.

Browser/dist/tower-workshops.mjs moves the exterior masonry, interior lining,
four rectangular sashes, access door and threshold together. Runtime clones
extend the west flat-roof edge, parapets, copings and eaves to the new wall.
The vestibule and western room boundaries follow it; their benches, vice,
tool board, shelving, oil tins, crowbar/oil positions and usable approaches
move west. The room lamps follow the widened rooms. Room doors still join
the gallery. Browser/dist/escape-grounds.mjs derives the access interaction
from the moved doorway. Collision refresh, rebuilt batches, cached transforms
and shadow invalidation follow the fittings. The tower and slate roof contacts
remain exact, and restart restores the original estate.

The final GPU inspector passes on NVIDIA GeForce RTX 3090 Ti / ANGLE
Direct3D11, with 35 single-face facade samples, physical walks through the
door and both tool rooms, desktop/interior/portrait captures and no page or
shader errors. The independent check-wall.mjs passes two attempts, each with
90 facade probes, 16 glazing rays, roof coverage, 763 physical walking steps,
exact tower preservation and exact mesh/batch/instance restoration. The
water-tower, tower-building, escape-exterior and exterior-shadow checks pass.
Evidence is in Browser/artifacts/workshop-wall-position/.

Concurrent corridor changes affected validation while this work was running.
The full npm test rerun stops at the opened pedestrian-gate collision assertion
in Browser/test-escape-grounds.mjs:17; full-suite.log is not a suite pass.
check-baseline.mjs records the same gate result and tower-side hit coordinates
with zero wall shift and with the requested shift. The broader workshop test
now reports primitive names/coordinates on a mismatch, preventing a failed
object comparison from trying to print the entire cyclic scene graph.

This revision changes Asylum Escape runtime fittings only. Shared compiled
estate/interior assets, Explore, Unity, Blender and packaged exports are not
regenerated. Modelling scope and superseded alignment are recorded in
Research/escape-grounds/README.md.

## Water tower course survey and proportions (7 October 2026)

The owner's course-count comparison is recorded in
`Research/water-tower/README.md`. The checked photograph gives approximately
24 courses for the black door height, 34 to the entrance arch crown, 85 to
the blocked upper arch crown and 138 to the main horizontal band. The previous
model gave 31, 45, 101 and 147 respectively. Photo values come from checked
mortar lines with a perspective progression; model values come from actual
geometry and the 0.1375-unit texture course pitch. Counts are approximate,
typically within one or two courses around faint joints and repaired masonry.

The entrance leaf changes from 1.08 by 4.22 to 1.28 by 3.35, matching the
approximately 2.6:1 rectified photograph instead of the previous 3.9:1 leaf.
The white frame, hardware and fanlight follow the new height. The entrance
arch is lowered, and this face's blocked upper arch crown drops to 11.705
(about 85 courses). Its two small inset windows and both neighbouring tiled
patches are aligned with the revised entrance; their later dimensions in the
research notes supersede the earlier estimates. Roof-contact geometry and
tower placement/overall height retain their previous definitions. The round
entrance head retains its width, leaving its crown about four courses above
the photo estimate; the main band retains its level, about nine courses above
the photo estimate. These residual differences are shown in the comparison.

The water-tower, tower-building, roof-contact and escape-exterior checks pass.
The required hardware launcher verifies NVIDIA GeForce RTX 3090 Ti through
ANGLE Direct3D11. Source and rebuilt compiled views cover the full front,
doorway, small windows, shared tiled corner, oblique details and phone framing.
Actual measured feature heights, leaf bounds, window geometry and threshold
positions match between source and compiled scenes, with exact retained
roof-scar vertices/colours and no page or shader errors. The aerial build and
standard compiled-scene validation pass, including full detail and fallback.
Measurement records, the checked photo ruler, comparison figure and receipts
are in `Browser/artifacts/water-tower-course-survey/`.

The required full `npm test` stopped at a tower/workshop contact assertion in
`test-tower-workshops.mjs:54`, logged in that folder's `npm-test.log`. The
workshop implementation and test were receiving concurrent changes during
this check. A control using the previous tower also failed a contact assertion;
`compare-contact.mjs` separately confirms that the tower surface at the full
suite's reported failing plinth probe is identical before and after these
proportion changes. A later focused run stopped at the then-current
"Skinny intermediate bay removed" assertion, recorded in
`workshop-current.log`. These results do not constitute a full-suite pass.

Browser model source and the local generated aerial asset are updated.
Shared interior assets, Unity, Blender and packaged exports are not
regenerated by this correction.

After the concurrent workshop corrections, the final focused
`test-tower-workshops.mjs` run passes, recorded in `workshop-final.log`.
The earlier full-suite log remains a stopped run rather than a full-suite
pass; the final tower, adjoining roofs/workshops and GPU source/compiled
checks pass independently.

## Narrower tower corridors, level concrete and machine-room fittings (7 October 2026)

The owner's three gameplay screenshots identify the exposed corridor corner,
raised step and oil-store shelf/door overlap. Escape passages now retain 65%
of the former clear width (4.825 to 3.13625 units) and 110% of the former clear
height (3.41 to 3.751 units), measured between finished faces and above Y=.04.
These dimensions are shared with the concurrently extended Escape corridor
plan; the dated estate corridor source remains unchanged.

The raised floor was the Tower service court surface crossing the gallery.
Runtime shell cuts remove that surface from accessible passages. A continuous
floor uses deterministic, seamless grey concrete mottling, fine aggregate and
subtle bump relief at a four-unit physical texture repeat. Explicit flagstone
and machine-room floor-joint meshes are removed. Inward corridor corner returns
complete the offset painted faces, covering exposed red masonry end caps.

The oil-store shelving is shortened and moved clear of the opening door,
including its bins and uprights. The machine workshop has a straight front
boundary instead of the unused L-shaped side bay. A central assembly island
with vice, milling station, bench grinder, fitting bench, shaft/bearing bench,
rolling tool chest and partition-mounted tool boards supplement the existing
lathe, drill, cabinet and assembly table. Tool boards avoid window apertures.
Visible machine/bench footprints contribute matching walking obstacles.

The original solid Farndon gallery is removed as one runtime replacement.
Retaining its clipped east side after the concurrent gallery move created an
invisible strip across the machine-room doorway; that remainder is excluded.
Affected batches and transforms are rebuilt, scenario obstacles refreshed,
shadows invalidated and original estate surfaces restored on disposal.

Validation: test-tower-workshops.mjs passes physical room/gallery walks, all
opening doors/signs, window sightlines, retained tower surfaces and exact
restart restoration. test-escape-grounds.mjs and npm run test:gpu pass.
Browser/artifacts/workshop-layout/inspect.mjs verifies both requested ratios,
19 oil-door angles without shelf intersections, level gallery floor samples,
a clear machine entrance and eight actual game walks through the tool rooms,
workshop aisles and both gallery ends. Desktop/phone images and JSON receipts
are in that directory. Rendering is verified NVIDIA GeForce RTX 3090 Ti via
ANGLE/Direct3D11, with no page or shader errors.

These changes are Escape browser runtime fittings. Shared compiled estate and
interior assets, Explore, Unity, Blender and packaged exports are not regenerated.

The required full npm test run passes the grounds/workshop regression and
then stops at the previously documented R42 notebook-label assertion in
test-reception-second-floor.mjs:76. The complete log is
Browser/artifacts/workshop-layout/full-suite.log; this is not a full-suite pass.

## Animated, closable tower workshop doors (7 October 2026)

The three signed workshop room doors and the blue stores entrance now swing
over 0.95 seconds in Asylum Escape. E and the touch Use button toggle opening
and closing, with explicit Open/Close prompts available from either side.
Pressing again during a swing reverses it from the current pose; holding E
performs one action. Signs remain attached to their moving leaves.

Walking, jumping and sight use each leaf's current rotated footprint, including
intermediate angles. Each animation step refreshes scenario obstacles and
invalidates exterior shadows. Swept-angle samples pause a door before it
intersects the player, then resume when the player steps clear. Pausing or
opening the Notebook freezes animation. Capture preserves the chosen door
states; a new run closes them. Tool collection and boundary-gate updates do
not snap a door that is still moving.

door-creak-audio.mjs synthesizes a rough, wavering hinge creak for opening and
closing, using the game's existing audio context and sound preference. Reversal
replaces that door's active sound, and mute, pause, Notebook and restart stop
active creaks. Workshop creaks do not change the guard's existing hearing rules.

Validation: test-escape-grounds.mjs covers partial poses, reversal, closing from
inside, rotated collision footprints and blocked/resumed swings. The existing
test-tower-workshops.mjs passes physical room/corridor walks and exact original
estate restoration after awaiting the new animation. The new
test-workshop-door-animation-browser.mjs passes all four doors, real E events,
held-key behaviour, touch opening/closing, Notebook freeze, capture/restart and
muting. It verifies sixteen actual audio-source starts and renders both creak
variants through Web Audio, with audible output, silent mute and clean endings.
Reviewed desktop opening/closing and portrait views, the validation receipt
and wider regression logs are in Browser/artifacts/workshop-door-animation/.
GPU validation and these browser checks use NVIDIA GeForce RTX 3090 Ti through
ANGLE/Direct3D11, with no page or shader errors in the focused door check.
The new browser regression is included in npm run test:grounds.

The existing hardware test-escape-grounds-browser.mjs walkthrough also passes
physical entry, all room/tool routes, held gate work, touch collection, capture
and restart. test-escape-corridors-browser.mjs passes all connected runs on
both an initial run and a restart, locked-door walking/jumping checks and sign
views. The CPU game-loop harness now supplies the real audio helper alongside
the existing clock helper and passes its gameplay regressions.

The required full npm test rerun passes the gameplay, grounds, workshop,
Notebook, layout and room-closure checks, then stops at the already documented
R42 Notebook-label expectation in test-reception-second-floor.mjs:76. Its log
is Browser/artifacts/workshop-door-animation/full-suite.log. This is not a
full-suite pass; all focused door, audio and grounds regressions pass.

Only Browser Escape runtime behaviour and validation are updated. Shared
compiled estate/interior assets, Unity, Blender and packaged exports are not
regenerated by this change.

## Escape corridor network against the water tower (7 October 2026)

escape-corridor-plan.mjs defines the eight connected passage runs, all six
annotated stopping lines and the three additional ward-contact closures.
The main gallery centre moves from X=156.3 to X=154.773125 while preserving
the requested 3.13625 m finished width and 3.751 m clear height. Its west
lining meets the tower corner at X=153.205; the original tower masonry is
the interior wall along the tower. The redundant secondary partition is
removed. Repair/oil-store partitions, room doors, the machine-room boundary,
benches, grinder and tool boards follow the revised passage edges.

escape-corridors.mjs builds one joined concrete floor, continuous ceilings,
brick/paint/tile-band walls and glazed semicircular windows. Exact polygon
union leaves open junctions along the main/admin approach, Irby/Ashley link,
two Hale links and diagonal Upton/Frith/Oscroft spine with Grafton/Edge and
Witby branches. Nine full-width locked double doors block walking and jumping;
six match the owner's yellow lines, and three close the other ward contacts.
Nine suspended cream direction boards match the existing distressed door
plates and calculate up/left/right arrows from each board's approach vector.

The runtime replacement clips original solid shells and exterior trim out
of the passage volume, preserving geometry attributes and exact collision
footprints for diagonal remnants. Interfering tree copies and low legacy
foliage instances are omitted in Escape and restored on disposal, including
shared instance buffers. Source batches are rebuilt, cached transforms and
walking obstacles refreshed, and exterior shadows invalidated. The expanded
grounds boundary and map retain the previous outdoor gate approaches; route
search can inspect the enlarged finite grid rather than exhausting the old
fixed search allowance. The workshop door walkthrough waits for each animated
leaf to finish opening before crossing it.

Validation: test-tower-workshops.mjs verifies both attempts, every passage,
all nine physical locks, nine boards, cardinal arrow directions, arched-window
sightlines, original tower surfaces and exact estate restoration. The grounds
logic regression passes. test-escape-corridors-browser.mjs walks all eight
runs from the actual stores entrance in the live game and again after retry,
checks real keyboard walking/jumping against all locks, and captures every
board, junctions, tower contact and portrait framing. The existing grounds
browser walkthrough passes room-door interactions, room/tool access, both
escape gates, touch collection, guard behaviour and restart. Hardware rendering
is verified NVIDIA GeForce RTX 3090 Ti through ANGLE/Direct3D11. Captures,
JSON receipts and logs are in Browser/artifacts/corridor-network/; room views
remain in Browser/artifacts/corridor-interior-finish/.

The required full npm test run passes grounds/workshop checks and then stops
at the previously documented R42 notebook-label assertion in
test-reception-second-floor.mjs:76. The log is corridor-network/full-suite.log;
this is not a full-suite pass. These runtime modules are outside the shared
estate/interior compilation dependency graph. No generated shared models,
Unity/Android or Blender exports are rebuilt by this change.

## Workshop entrance wall grounding and brick alignment (7 October 2026)

The wall beside the blue Workshop entrance in Escape had a 0.15-unit gap
between its replacement plinth at Y=0 and the lawn at Y=-0.15.
Browser/dist/tower-workshops.mjs now extends the replacement masonry's
ground-level foot to Y=-0.18. The cloned doorway threshold also extends
below the lawn, keeping its top at Y=0.14. The established X=145.4 facade,
tower junction, window/door positions and upper roof contacts are retained.
The split masonry panels use shared world-coordinate brick registration,
so their courses and joints continue across sash bases and opening headers.

The existing runtime construction rebuilds batches and cached transforms;
grounds synchronization refreshes walking obstacles and invalidates shadows.
Exact restoration of original meshes, batches and buffers still passes on
both attempts. test-tower-workshops.mjs now probes the rebuilt facade below
zero and either side of the plinth join, checks shared brick registration,
and checks the buried threshold with its retained walking height.

The workshop, grounds, water-tower, tower-building and exterior-shadow
checks pass. npm run test:gpu verifies NVIDIA GeForce RTX 3090 Ti through
ANGLE Direct3D11. Browser/artifacts/workshop-wall-grounding/inspect.mjs
passes 56 rendered facade probes, including the former ground opening,
with no page or shader errors. Reviewed desktop, close base, southern corner
and portrait captures plus before/after measurements are in that directory.

This is an Escape browser runtime correction. Shared compiled estate/interior
models, Explore, Unity/Android, Blender and packaged exports are not regenerated.
The placement reference and measurements are recorded in
Research/escape-grounds/README.md.

The required full npm test run passes the gameplay, grounds/workshop, tower
and adjoining service-building checks, then stops at the corridor downpipe
position comparison in test-ward-placement.mjs:44 (called at line 52).
That check compares the assembled estate with the standalone admin corridor
before any Escape runtime workshop fittings are constructed; it expects X=0
for an assembly now shifted to X=-0.80501 by the exterior downpipe correction.
Browser/artifacts/workshop-wall-grounding/full-suite.log records the stopped
run, not a full-suite pass. The final focused workshop regression also passes
the rendered-batch texture continuity checks at all four rectangular windows.

## Second-floor notebook regression correction (7 October 2026)

The former failure at test-reception-second-floor.mjs:76 expected the internal
plan ID R42 in the notebook. The current notebook correctly uses the player's
door number and room name: 202 · Staff office. The test now verifies all five
Reception-side second-floor entries, numbered 201 through 205, including their
current room names. This corrects the stale assertion without changing the
player-facing numbering. The focused second-floor, notebook and door-label
checks pass. The full runs in corridor-network/full-suite-fixed.log and
full-suite-current.log encountered incomplete concurrent terrain/lighting
edits before reaching the second-floor check; those integrations are now in
place and the corridor/grounds checks pass again. The wider run recorded in
Browser/artifacts/workshop-wall-grounding/full-suite.log passes the corrected
second-floor notebook check and later stops at the independent corridor
downpipe-position assertion in test-ward-placement.mjs:44. This is not a
full-suite pass. The numbered notebook regression is fixed.

## Water-tower corridor finish and proportion corrections (7 October 2026)

All eight Escape corridor runs now have their ceiling underside at Y=5.05,
aligned with the purple line on the supplied workshop-wall screenshot. This
supersedes the previous 3.751-unit clear height; the finished width remains
3.13625. The workshop ceiling and passage ceilings meet at the same level.

Solid and arched wall linings now share a finished plane and world-aligned
brick UVs. The three reported partition/gallery joins are flush and retain
the same brick phase. Skirting is generated for both faces of internal
partitions, window bases, room/corridor perimeter linings and corner returns.
Additional trim follows the original tower's base and the projecting ground
arch sills. It belongs to the Escape group; the tower source stays intact.

Room-door openings use ROOM_DOOR_WIDTH/HEIGHT from the 1829 layout (1.9/2.5).
Leaves match its 1.74 width, 2.375 height and .06 thickness. Full-width corridor
double doors use the same height, meet at the centre and have a narrow timber
rebate that closes the sightline even after diagonal geometry is batched.
Animated room-door obstacles continue to follow the actual leaf dimensions.

Every one of the 35 ceiling tubes has an illumination definition. The new
workshop-interior-lights.mjs assigns twelve fixed PointLight slots to nearby
fixtures and fades selection changes, avoiding a shader with 35 active lamps.
Direction boards use separate front/back paint maps and full UVs on both
faces. Reverse destinations are authored for the opposite approach; arrows
are calculated independently, including a down arrow for a route behind the
viewer. The Grafton branch repeats its destinations on both sides.

test-tower-workshops.mjs verifies both attempts, the eight ceiling planes,
all partition/lining skirting samples, 1829 leaf dimensions, centre sightlines
from both sides of all nine double doors, eighteen readable sign faces,
every fixture's assigned light, room/gallery walking and exact restoration.
test-escape-grounds.mjs, test-escape-corridors-browser.mjs and
test-workshop-door-animation-browser.mjs pass. The latter retains keyboard,
touch, partial swings, capture/restart and actual audio checks.

The new test-escape-corridor-finishes-browser.mjs is included in
npm run test:corridors. It verifies actual assembled wall depth/UV joins,
all eight ceiling heights, all 35 illumination assignments and accessible
approaches to both sides of the signs. Reviewed desktop/portrait screenshots,
the JSON receipt and logs are in Browser/artifacts/corridor-finishes/.
Hardware rendering is NVIDIA GeForce RTX 3090 Ti through ANGLE/Direct3D11,
with no page or shader errors in the focused GPU checks.

These changes are Escape browser runtime models, outside the shared compiled
estate/interior dependency graph. Generated shared models, Unity/Android,
Blender and packaged exports are not regenerated. The screenshot modelling
references are saved in Research/escape-grounds/.

The required full npm test run passes the changed grounds/workshop regression
and the subsequent interior, door, skirting, lighting, tower and adjoining
building checks. It then stops at the already documented, independent
"Corridor downpipe assembly position" assertion in test-ward-placement.mjs:44
(actual X=-.8050100041723312, expected X=0). The complete log is
Browser/artifacts/corridor-finishes/full-suite.log. This is not a full-suite
pass. The final tower-skirting focused rerun and the final hardware visual
rerun pass; their logs are workshops-final.log and visual-final.log in that
same folder.

## Corridor illumination, matching door heights and remaining depth flicker (7 October 2026)

The latest owner screenshots supersede the preceding corridor-door dimensions.
Every workshop room leaf and all nine locked double pairs now match the blue
stores entrance: 3.65 units high, Y=.05..3.70, under a Y=3.75 opening head.
workshop-door-dimensions.mjs supplies those shared values. The regular asylum's
door dimensions remain intact. Handles, recessed panels and plaques follow
the taller leaves, retaining animated collision footprints and attached signs.

The double-door jamb's inner face was exactly coplanar with the long wall
lining, producing the vertical flicker. It now sits .015 units into the
opening; the masonry header ends are buried inside the side walls. Corridor
shell replacement also includes the ward contacts, clearing the hanging
window/trim pieces above the two Hale locks while preserving upper windows
above the accessible ceiling volume. The machine-room floor was the original
service court at Y=.34 over the new Y=.04 concrete; that surface and its
supporting mesh, plus the residual low Farndon roof/underside, are now clipped
from the rooms. One joined ceiling owns both the rooms and passage network.
Original geometry, instance buffers and batches are restored on disposal.

The brick finish repeats over exactly eight stretchers / sixteen headers
(2.08 units), with wrapped brick variation and integer pixel course boundaries.
Solid panels and arched linings retain one shared world phase. This removes
the cut brick at the former two-unit repeat and the band seam, retaining the
three-course Y=1.38..1.68 band.

The prior light regression checked stored positions, but the static transform
cache froze the actual PointLight matrices. Light and target transforms now
remain live. Six stable downward tube slots and four window slots use cached
256-pixel shadows, initialized even when a slot is unused. Reassignment and
door motion invalidate these maps. The fixed count stays within the tested
WebGL fragment texture budget. Window bounce takes colour, strength and
direction from the estate sun/sky; the existing sun supplies direct aperture
light. Cosmetic glazing/backing no longer casts opaque window shadows.

All 35 tube positions, 114 window definitions, eight ceiling planes, 147 level
floor probes, wall UV joins, sign faces and day/dusk/night response pass the
actual GPU corridor-finish regression. The light regression renders a solid
partition: the open floor gains 32 intensity levels, the blocked floor gains
zero, and removing the blocker restores the positive control. The workshop
geometry/restoration and grounds logic checks pass. Both-attempt corridor
walks, all nine walking/jumping locks, and keyboard/touch door animation,
partial swings, audio, pause and restart checks pass without page/shader errors.
Torch-free desktop/portrait, machine-room, tower-corner, band and every corridor
end view are visually reviewed. The portrait fixture now waits for resize
frames before its manually driven draw, preventing a cleared-canvas capture.
Evidence and repeatable inspect.mjs are in Browser/artifacts/corridor-repairs/;
the final finish receipt is finishes/validation.json.

The two blocked ground tower doorways now share the corrected entrance's base
and spring/crown levels. test-water-tower.mjs checks those crowns, and the
existing entrance, tiled patches and roof contacts retain their definitions.
The shared aerial estate binary is rebuilt and its manifest fingerprint
matches current source. test-precompiled-models.mjs passes source/compiled
image comparison, exact draw/triangle counts, controls, full detail and fallback.
All GPU validation uses NVIDIA GeForce RTX 3090 Ti / ANGLE Direct3D11. Browser
source and the local aerial asset change; shared interior assets, Unity/Android,
Blender and packaged exports are not regenerated.

The required full npm test run passes the changed grounds/workshop checks and
the later interior, lighting, tower, service-building and ward-model checks.
It stops at the previously documented independent "Corridor downpipe assembly
position" comparison in test-ward-placement.mjs:44 (actual X=-.8050100041723312,
expected X=0). corridor-repairs/full-suite.log records the stopped run, not a
full-suite pass. The final corridor-finish rerun passes after preserving upper
ward windows and correcting portrait capture timing; its log is
corridor-repairs/finishes-final.log. The final torch-free visual log is
corridor-repairs/visual-final.log.

## Visible chains and padlocks on locked Escape doors (7 October 2026)

All 24 locked 1829 exit leaves now carry a broad iron chain between bolted
eye plates, with a large bevelled brass padlock, steel shackle and dark
keyhole. The two staff stair grilles carry the fitting below their notices.
All nine permanently locked water-tower corridor double-door pairs carry
the same fitting on both faces, beneath their existing LOCKED plaques.
The current E refusal messages are retained.

door-lock.mjs shares its geometries and materials through an owned factory;
the links use one instanced mesh per assembly. asylumExitCenter supplies each
actual interior leaf plane, including inset/offset corrections and the wider
Reception door. All fittings are cosmetic and excluded from walking obstacles.
They belong to Escape's runtime props, outside the shared compiled architecture.
Corridor fittings are added before the normal batch/cache/shadow refresh.
Disposal releases the instance buffers and shared resources on restart.

escape-progress.mjs exposes the read-only doorLocked predicate for the existing
key and developer-unlock restrictions. World sync hides the service entrance
chain when its brass key is available and clears every 1829 chain with the
developer unlock. It restores the matching chains after confiscation or toggle
off, while staff grilles released normally retain their state. Grounds locks
remain chained with the 1829 bypass active. Already-open room doors and the
opening Workshop entrance retain their existing fittings.

Validation: test-door-locks.mjs checks all 24 actual timber attachment planes,
both key routes, grille release, confiscation/recovery, developer unlock and
disposal. test-door-locks-browser.mjs passes actual U interaction, blocked-door
messages, key/capture/reclaim and restart without duplicate fittings or
page/shader errors. Desktop, basement, upper exit, grille, all nine corridor
ends and 390-pixel portrait captures were visually reviewed. The existing
progress, grounds and workshop geometry/restoration checks pass, as does the
physical corridor browser regression with walking/jumping at every lock and
route walks after restart. GPU validation and npm run test:gpu verify NVIDIA
GeForce RTX 3090 Ti / ANGLE Direct3D11. Evidence is in
Browser/artifacts/door-locks/; npm run test:door-locks runs the new checks.
The logic check also joins npm test, and the browser check joins test:escape.

The required npm test passes the new lock check and the preceding Escape,
interior, door, stair, window, lighting, roof, tower and workshop checks. It
stops at the previously documented independent "Corridor downpipe assembly
position" assertion in test-ward-placement.mjs:44 (actual X=-.8050100041723312,
expected X=0). Browser/artifacts/door-locks/full-suite.log records this stopped
run; it is not a full-suite pass.

Only browser Escape runtime sources, checks and notes change. Current aerial
and interior manifest source hashes still match; these runtime fittings need
no compiled-model rebuild. Unity/Android, Blender and packaged exports are
not regenerated.

## Kitchen roof trim inside the water-tower corridor (7 October 2026)

The owner's screenshot shows the adjoining kitchen's fascia end and diagonal
hip flashing protruding above the oil-store doorway at Z=-26.6. Their eave is
below the Escape corridor ceiling. The runtime shell selector included roofs
and gutters but omitted the separately named fascia/flashing meshes. They now
use the existing corridor-volume clipping, retaining exterior portions and
the original geometry for exact restoration on disposal. Affected batches,
cached transforms, obstacles and shadows use the established refresh path.

test-tower-workshops.mjs adds 36 assembled-wall probes per attempt at the
reported join. The original fails on the kitchen fascia at X=153.6; the repair
exposes only the finished wall at X=153.205. The final integrated workshop
check passes both attempts, physical corridor/room walks and exact estate
restoration. Main-kitchen and Escape-grounds checks also pass. The hardware
launcher verifies NVIDIA GeForce RTX 3090 Ti / ANGLE Direct3D11. The dedicated
inspection reproduces the owner's angle before repair and verifies all 36
rendered wall probes afterwards, without page/shader errors. Desktop, close
and portrait after views are visually reviewed. Evidence and the repeatable
inspect.mjs are in Browser/artifacts/tower-corridor-protrusion/.

The required npm test run stops at the Hale door-header overlap regression
in test-tower-workshops.mjs while that independent test and repair are being
edited concurrently. Its stopped receipt is full-suite.log. The later current
workshop check passes that assertion and the new protrusion probes; its receipt
is workshops-final.log. A baseline loader removing only this protrusion repair
and its new probes also passes the current remaining workshop checks. This
does not establish a full-suite pass.

Only the Browser Escape runtime selector, regression, references and notes are
changed by this repair. Both shared compiled manifests retain current source
fingerprints, so no rebuild is needed. Unity/Android, Blender and packaged
exports are not regenerated.

## Kitchen wall extended to the workshop corner (7 October 2026)

The pink-marked wall is the Main kitchen's north facade beside the tower
workshops. Escape's western room-shell cut applied the passage's .32-unit
end clearance, clipping kitchen brickwork and plinth back to X=145.08 while
the adjoining workshop face remained at X=145.4. The western room volume now
uses startPadding=0; galleryShellRemainders retains that explicit clearance
while preserving .32 for other cuts. The kitchen facade continues to X=145.4
at its original Z=-26.6 plane, with original materials, UVs and window position.

test-tower-workshops.mjs reproduces the old missing facade and verifies 24
wall/plinth rays from the lawn to Y=4.5, one exposed face, walking collisions,
both attempts and exact estate restoration. The current complete workshop
check passes, as do test-main-kitchen.mjs, test-tower-buildings.mjs and
test-water-tower.mjs. Hardware day/night, close, shifted and 390-pixel portrait
views show the closed corner; there are no page or shader errors. The renderer
is NVIDIA GeForce RTX 3090 Ti / ANGLE Direct3D11, verified with test:gpu.

Evidence and repeatable inspection are in
Browser/artifacts/kitchen-workshop-wall-gap/. The required npm test passes
preceding checks and the new kitchen contact checks, then stops at a separate
Hale locked-door header overlap in test-tower-workshops.mjs:155. Those header
checks and shell clipping changed concurrently during validation. The final
focused workshop rerun passes the current header checks as well; see
workshops-final.log. full-suite.log records the earlier stopped run and is
not a full-suite pass. The baseline comparison retains original .32 clearance
and excludes only the new kitchen-contact probes; its remaining workshop
checks also pass with the current sources.

This correction changes Escape runtime shell clipping only. Existing batch
rebuild/cache, walking refresh and shadow invalidation cover the extension.
Both shared compiled manifests still match their source hashes; no model
rebuild is needed. Explore, Unity/Android, Blender and packaged exports are
not regenerated. The owner's reference and modelling rationale are in
Research/escape-grounds/README.md.

## Locked corridor door header flicker (7 October 2026)

Both Hale ward contacts retained the estate's horizontal masonry band at
Y=3.81..3.99 in front of the Escape door header. Their exposed planes differed
by about one micrometre. Facade optimization converts the band's instances
to a regular mesh named "joined stone courses"; the runtime shell filter
handled the original instances but omitted that optimized mesh.

tower-workshops.mjs now includes joined stone-course meshes in the existing
corridor shell clipping. Exterior and upper fragments retain their original
attributes; the normal batch rebuild, transform cache, walking refresh and
shadow invalidation apply. Disposal restores the original geometry and
batches. No door, lock, height, lighting or layout definition changes.

test-tower-workshops.mjs now checks the actual rendered estate batches above
all nine locked pairs at 25 points per door, on both initial creation and
replay: 450 single-surface probes. It also selects each door group by its
position, since both Hale doors have the same title. The saved pre-fix run
fails on two almost coincident faces at the first Hale header. The repaired
run passes, including all existing room/corridor walks and exact restoration.

Browser/artifacts/locked-door-header/inspect.mjs verifies another 225 header
probes in the actual game, with zero overlapping faces or page/shader errors.
Desktop front/left/right views of every pair and a 390-pixel portrait view
are reviewed. test-escape-corridors-browser.mjs passes all corridor walks,
locked walking/jumping checks and a second attempt. The existing corridor
finish GPU regression also passes its ceiling, floor, UV, lighting and sign
checks without page/shader errors. Hardware rendering uses
NVIDIA GeForce RTX 3090 Ti / ANGLE Direct3D11, verified with test:gpu.

Evidence, before/after captures and logs are in
Browser/artifacts/locked-door-header/. The owner screenshot and modelling
notes are in Research/escape-grounds/. Both shared compiled manifest hashes
still match their sources; the change remains outside their dependency graph.
Compiled models, Explore, Unity/Android, Blender and packaged exports are
not regenerated.

The required npm test run passes the changed header/workshop checks and all
preceding Escape, interior, door, stair, window, lighting and exterior checks.
It stops at the previously documented independent "Corridor downpipe assembly
position" assertion in test-ward-placement.mjs:44: actual X=-.8050100041723312,
expected X=0. locked-door-header/full-suite.log records the stopped run;
this is not a full-suite pass.

## Reference iron padlocks and connected door chains (7 October 2026)

The owner's padlock photograph replaces the preceding square brass locks and
single spanning chains. The shared Escape factory now supplies four chain runs
per face, joined through a bowed shackle above a round, weathered iron case.
The case has a recessed top, a lower circular profile, rivets, a case seam,
a keyhole escutcheon and an offset pivoting cover. Repeatable, shared small
textures provide iron grain, rust patches and roughness without new downloads.

Each oval loop alternates its plane with its neighbour. Arc-length placement
keeps spacing shorter than the loop opening; odd counts put both end links
perpendicular to their bolted eyes and shackle wires. All four runs thread
the same shackle, with upper runs on the arch and lower runs on the uprights.
This also corrects the initially tangent anchor connection: a tangent loop
can appear connected while remaining unlinked. Terminal loops now enclose
the mounting wire and clear its solid surface, as do neighbouring chain wires.
The links remain instanced, and the factory shares all geometries, materials
and textures. Interior disposal releases each shared patina texture once.

The factory updates all 24 locked asylum exit leaves, the two staff stair
grilles and both faces of the nine locked grounds corridor pairs. Existing
key, confiscation/recovery, grille-release, developer-unlock and restart
behaviour remains intact. Geometry remains outside walking obstacles; the
normal grounds batch/cache/shadow refresh includes the new fittings.

Final test-door-locks.mjs passes 1,808 signed loop-interior connection checks
using the actual model curves and instance transforms, including all adjacent
links and both terminal eyes/shackles across the actual door widths and faces.
It also checks sampled iron-wire separation, timber clearance, all 24 actual
mounting planes, both key routes, capture/recovery, unlock and restart disposal,
including exactly one disposal event per shared patina/grain texture.
The final browser check passes desktop/390-pixel phone views, close-up iron
hardware, every corridor pair and the reverse face, blocked-door interaction,
key/capture/reclaim, U toggling and restart without page or shader errors.
Images were visually reviewed. Hardware rendering uses the verified NVIDIA
GeForce RTX 3090 Ti / ANGLE Direct3D11 renderer; test:gpu also passes.
Final evidence is in Browser/artifacts/door-locks-reference/geometry.log,
final-browser.log, validation.json and its PNG captures. door-locks.log retains
an earlier complete pass before the final anchor-end refinement.

Only browser Escape runtime fittings, their tests and notes change. Both
compiled architecture manifests still match current source hashes; these
runtime fittings need no compiled-model rebuild. Unity/Android, Blender and
packaged exports are not regenerated. The reference and modelling notes are
in Research/escape-interior/ and Research/escape-grounds/.

The required npm test initially stopped at a Hale corridor-header overlap in
test-tower-workshops.mjs:155 during concurrent shell edits. The current
workshop check now passes both with the final lock fittings and with their
factory disabled for comparison (header-without-locks.log). The suite resumed
from that workshop checkpoint and passed the subsequent door, stair, window,
lighting, roof, tower and ward-model checks until the previously documented
independent Corridor downpipe assembly position assertion in
test-ward-placement.mjs:44 (X=-.8050100041723312, expected 0).
full-suite.log and remaining-suite.log record these stopped runs; this is not
a full-suite pass. All final lock-specific geometry, lifecycle, interaction
and GPU visual checks pass.

## Straight Farndon wall and continuous corridor joins (7 October 2026)

The owner's pink-circled gameplay view identifies the triangular recess in
the east gallery wall beside the Farndon lock. The diagonal corridor's cap
previously projected past that wall because it still started at the dated
estate's X=156.3 centre. escape-corridor-plan.mjs now ends that cap on the
Escape gallery centre X=154.773125, retaining the same diagonal axis and all
locked endpoints. The union supplies a single straight east wall, matching
floor/ceiling edges and the notebook/walking boundary.

corridor-wall-joins.mjs calculates shared corner bisectors for each boundary
edge. escape-corridors.mjs, workshop-gallery.mjs and tower-workshops.mjs use
them to mitre the masonry, painted lining and skirting. Window apertures keep
their clear geometry, and world-registered brick UVs follow the moved ends.
The separate narrow corner-return panels are removed. Explicit panel collision
footprints follow the mitres; the existing batch rebuild, transform cache,
obstacle refresh and shadow invalidation include the repaired geometry.

The new shared corridor-join survey probes rendered batches from the inward
side at five heights and four distances from every junction, including both
faces of the diagonal/Grafton/Witby corners. The before model fails 332 of
680 probes; removing the notch eliminates three obsolete vertices, and all
560 probes at the remaining fourteen corners pass. Forty additional Farndon
wall/skirting rays verify the straight plane. test-tower-workshops.mjs checks
this on both attempts alongside room/passage walks, original tower surfaces,
window apertures, locks, collisions and exact estate restoration.

test:gpu, test-workshop-lighting-browser.mjs,
test-escape-corridors-browser.mjs and test-escape-corridor-finishes-browser.mjs
pass on NVIDIA GeForce RTX 3090 Ti / ANGLE Direct3D11. The actual game finish
test also runs the corner survey and Farndon rays. Desktop/portrait, reverse
Farndon, diagonal, Grafton, Witby, Irby, admin, Hale and workshop views were
reviewed without page/shader errors. Evidence and the repeatable inspect.mjs
are in Browser/artifacts/farndon-wall-joins/; the existing finish receipt is
in Browser/artifacts/corridor-repairs/finishes/validation.json.

Only Escape browser runtime models, tests and notes change. Both shared
compiled manifests still match their source hashes, so no shared model rebuild
is needed. Unity/Android, Blender and packaged exports are not regenerated.
The owner's image and modelling notes are in Research/escape-grounds/.

The required npm test run passes the changed corridor/workshop checks and the
subsequent interior walls, skirting, doorways, stairs, lighting, roofs, tower
and ward models. It stops at the previously documented independent Corridor
downpipe assembly position assertion in test-ward-placement.mjs:44, with
X=-.8050100041723312 rather than 0. Browser/artifacts/farndon-wall-joins/
full-suite.log records the stopped run; this is not a full-suite pass.

## Victorian timber fire doors (7 October 2026)

The browser interior's 23 non-Reception exit leaves now use worn brown timber,
six moulded panels on both faces, three iron hinges and an oval knob on a
mortice-lock plate. victorian-fire-doors.mjs supplies batched fittings to both
asylum-architecture.mjs and the legacy grid architecture.mjs. The existing red
Reception entrance retains its established design. Room doors keep their green
finish. The leaf dimensions, stone surrounds, collision/navigation and exterior
arrival points remain fixed. The flat outer stiles retain all four chain
mountings; Escape's existing lock factory and visibility states are unchanged.

game.mjs no longer paints illuminated route signs or PUSH BAR TO OPEN plaques
and removes their green accent lamps. The legacy exit's emergency-light case,
panic bar, kick plate and overhead closer are removed. The period fittings use
shared timber-grain textures and iron materials, without external assets.

All ten compiled interior sections are rebuilt with the new batched geometry.
Both aerial and interior manifests match their current source hashes. The
compiled-surface check passes complete source area, bounds and live materials.
The GPU loading check passes prepared assets and worker fallback, desktop/phone,
failed-entry retry, cached returns and replay furniture. The door-frame,
exit-surround, legacy architecture, game and chain checks pass, including all
1,808 existing link/eye/shackle connection checks.

test-victorian-fire-doors-browser.mjs passes compiled and worker paths: all 24
Escape locks, 92 actual timber/anchor contacts on the 23 new leaves, zero modern
exit signs, blocked interaction, service-key/capture/recovery and U toggle
states, desktop/oblique/phone views and no page/shader errors. Captures on all
four floors were visually reviewed. Hardware is the verified NVIDIA GeForce
RTX 3090 Ti / ANGLE Direct3D11 renderer; test:gpu passes. Evidence is in
Browser/artifacts/victorian-fire-doors/ and its loading/ subdirectory.

The updated test-asylum-exit-surrounds-browser.mjs also passes all 24 unlocked
E round trips with the release latch, all 23 bare masonry headers and
desktop/oblique/phone captures. It waits for the streamed interiors, surveys
architectural meshes independently of removable chains/prop glows, and uses
the existing developer bypass for passage checks. Locked interaction is
verified separately by the period-door check. Its receipt is in the surrounds/
subdirectory. Geometry probes now accept the new timber mouldings/insets as
valid leaf surfaces alongside the original solid core.

Only browser interior sources, compiled interiors, tests and notes change.
Unity/Android, Blender, separate exterior facade doors and packaged exports are
not regenerated. Styling notes are in Research/escape-interior/README.md.

The required npm test run initially reached an east-corner probe that still
expected the old flat-core mesh name. After accepting the new timber surfaces,
the suite resumed at that checkpoint and passed the following door, walking,
stairs, lighting, roof, tower and ward geometry checks. It stopped at the
previously documented independent Corridor downpipe assembly position assertion
in test-ward-placement.mjs:44 (X=-.8050100041723312, expected 0). full-suite.log
and remaining-suite.log in Browser/artifacts/victorian-fire-doors/ record these
runs; this is not a full-suite pass. All final door, chain, loading and GPU
checks pass.

## Closed water-tower corridor header joints (7 October 2026)

The owner's Hale-door screenshot exposed a mismatch between the new passage
wall mitres and the inset locked-door headers. The side-wall lining tapered
back 0.2875 units at each cap, leaving slots beside the header's 0.12-unit
front face. escape-corridors.mjs now identifies the eighteen locked-cap
corners and ends their masonry, lining and skirting square behind the timber
frames. Connected corridor corners retain their existing shared mitres.
The existing runtime batch, transform, collision and shadow refresh includes
these wall ends.

The shared auditDoorHeaderJoins survey casts sideways rays at both ends of
all nine headers, across six depths and four heights. It detects 288 failing
samples before the repair; all 432 pass afterwards in both the assembled
logic model and actual game. All 560 connected-corner probes also pass.
test-tower-workshops.mjs includes the header audit on both attempts, alongside
physical room/passage walks, locks, original tower surfaces and exact estate
restoration. test:gpu, test-escape-corridors-browser.mjs and
test-escape-corridor-finishes-browser.mjs pass. The renderer is the verified
NVIDIA GeForce RTX 3090 Ti through ANGLE Direct3D11, with no page/shader errors.

Reviewed before/after desktop views of all nine pairs, Hale/diagonal oblique
views, a phone view, repeatable inspect.mjs and receipts are in
Browser/artifacts/door-header-gaps/. The owner's image and modelling notes
are in Research/escape-grounds/. Both compiled manifests still match their
source hashes: this repair changes only Escape browser runtime geometry,
tests and notes. No shared model rebuild or Unity/Android, Blender or packaged
export is needed or performed for this repair.

The required npm test run passes the changed header/workshop checks and the
following interior, stairs, roof, tower and ward geometry checks. It stops
at the previously documented independent Corridor downpipe assembly position
assertion in test-ward-placement.mjs:44 (X=-.8050100041723312, expected 0).
Browser/artifacts/door-header-gaps/full-suite.log records the stopped run;
this is not a full-suite pass.

## Stable water-tower corridor lighting and door performance (7 October 2026)

The owner reported window-light shapes that were misaligned, appeared and
disappeared while walking, and caused lag, especially during door animation.
The old six tube/four window spotlight pool reassigned and faded sources by
player distance. Door motion invalidated all ten local shadow maps as well as
the estate sun. This revision supersedes that pooled-light description above.

workshop-interior-lights.mjs now gives all 37 tubes permanent world positions
and constant output. Static occlusion is rendered once into a 2048x1280 packed
depth atlas (256 pixels per fitting), sampled through one texture uniform.
Shared downward projection maths avoids a matrix uniform for every fitting,
keeping the shader within mobile WebGL fragment-uniform limits. Receiver-plane
depth comparisons prevent horizontal shadow stripes on sloping receivers.
The four opening door leaves cast analytic box shadows using their actual
inverse world matrices; opening/closing never rebakes the static atlas.
Context restoration invalidates the atlas, and disposal restores all original
material/render hooks and releases the target and listener. A new lighting
generation prevents reused shaders from retaining a disposed attempt's uniforms.

The four viewer-selected window spotlights are removed. Estate sun/sky still
follow day/dusk/night settings, and direct sunlight uses the real apertures,
frames and occluders. The rendered regression projects a ray through a clear
window pane onto the floor: it measures positive sunlight at that point and
zero on the neighbouring wall-blocked samples. There is no artificial window
patch that can switch off as the player moves away.

workshop-shadow-batches.mjs temporarily replaces static opaque shadow submissions
with spatial, position-only batches. Colour draws submit no proxy triangles;
raycasts and walking ignore the proxies. Trees and moving leaves remain live
casters. Original geometry/materials and caster flags are restored on disposal.
The existing door collision refresh and exterior.invalidateShadows() still run
for each changed angle, so sun shadows and collision footprints remain current.

The hardware lighting regression passes unobstructed illumination, a solid
partition, closed/open door occlusion and a blocker-removal positive control.
Moving the actor leaves the rendered pixels exactly unchanged; door movement
and walking retain one atlas bake. The workshop regression passes both attempts,
original geometry/buffer restoration, caster flags and shader/render-hook
restoration. Corridor finishes (including desktop/portrait, all sign faces,
day/dusk/night and aperture projection), physical corridor walks/locks, and
keyboard/touch door animation/audio/restart checks pass without shader errors.
Validation uses NVIDIA GeForce RTX 3090 Ti / ANGLE Direct3D11 via the required
hardware launcher; test:gpu also passes.

Before/after inspection and receipts are in Browser/artifacts/corridor-light-stability/.
The same local diagnostic script records median stationary samples of 10.6 ->
9.3 ms, walking samples of 30.8 -> 16.5 ms, and door samples of 45.6 -> 13.9 ms.
Peak door-sample draw submissions fall from 7231 to 1703. The script synchronizes
the GPU; walking samples include its pose/render plus measured render, so these
are comparative diagnostics, not live-play FPS or phone performance guarantees.
Final finish measurements/captures also live in corridor-repairs/finishes/.

Both shared compiled manifests match current model fingerprints. This changes
Escape browser runtime lighting, shadow submissions, tests and notes only;
shared model assets, Unity/Android, Blender and packaged exports are not rebuilt.
The required npm test passes the changed workshop checks and subsequent interior,
lighting, roof, tower and ward tests, then stops at the previously documented
independent Corridor downpipe assembly position assertion in
test-ward-placement.mjs:44 (X=-.8050100041723312, expected 0). The full-suite log
in corridor-light-stability/ records that failure; it is not a full-suite pass.

## Eastern corridor daylight and restrained ceiling fill (7 October 2026)

The owner's two annotated references in Research/escape-grounds identify large
unsourced wall ovals and request eastern skylight through the outer windows,
with subtler light toward 1829. This follows the fixed-atlas performance repair.
The same tube shader serves all eight connected passage runs: output is now 16
(previously 85), colour is paler, and cosine-to-the-fourth downward distribution
suppresses high-wall spill. No viewer-selected window lights are reintroduced.

Escape passes an eastern sun profile through landing-scene.mjs to day-night.mjs.
The sky glow and illumination use the same source direction. Explicit light
matrix updates fix mode changes on cached source/compiled transforms; every
change still invalidates exterior shadows. The profile applies only to Escape;
the other views retain their default lighting directions. The angle clears the
boundary hedge. Direct light passes through the real window apertures and is
blocked by their frames, sills, solid walls and moving doors.

The joined corridor ceiling now casts shadows, closing a sunlight leak from
above. Surviving low connecting-gallery slate/ridge pieces in the Escape runtime
are raised by the same 1.55 units as the passage wall height. Previously these
old low roof remnants blocked the east-facing window rays below the new ceiling.
Original tower and adjoining-building roofs remain fixed; the original estate
geometry/transforms are restored on disposal. The raised pieces are included
when the affected batches are rebuilt and transforms/shadows refreshed.

Validation on NVIDIA RTX 3090 Ti / ANGLE Direct3D11 through the hardware launcher:
- test-day-night.mjs (including eastern direction, sky agreement and frozen
  matrix updates), test-game.mjs and test-tower-workshops.mjs pass.
- The workshop checks cover all eight ceiling shadow blockers, raised low roof
  remnants, retained tower roofs, collision paths and exact retry restoration.
- test-workshop-lighting-browser.mjs passes using production output: floor gain
  7, blocked/closed-door gain 0, open-door/removed-blocker gain 3.65; player
  movement produces zero pixel difference and the atlas stays at one bake.
- test-escape-corridor-finishes-browser.mjs passes: direct sun gain 11.2 along
  the eastern clear-pane ray and 0 on both neighbouring wall-blocked samples.
- test-workshop-door-animation-browser.mjs and test-escape-corridors-browser.mjs
  pass, including keyboard/touch doors, sounds, locks and physical passage walks.
- Final day/dusk/night views of every run plus portrait review and performance
  receipts are in Browser/artifacts/corridor-east-light/. No shader errors.
  The same local synchronized-GPU diagnostic records medians of 8.8 ms still,
  16.0 ms walking and 14.3 ms during door animation, with 1770 peak door draws
  and one atlas bake. Walking includes the harness's additional pose render;
  these are comparative desktop diagnostics, not phone FPS guarantees.

The required npm test stops at test-roof-wall-joins.mjs:53 on independent
Redesmere roof viewing-ray gaps. Its full output is saved in
Browser/artifacts/corridor-east-light/full-suite.txt; this is not a full-suite
pass. The interior compiled fingerprint still matches; the aerial fingerprint
currently differs amid other modelling edits in this shared working tree.
These changes are Escape runtime additions outside the compiled-model import
graph, tested in the actual Escape source scene. Shared binaries, Unity/Android,
Blender and packaged exports were not rebuilt for this correction.
