# Escape grounds and tower workshops

## Eastern window light and softer fittings — 7 October 2026

The owner's [circled wall patches](corridor-wall-light-reference.png) and
[spill on both sides](corridor-spill-reference.png) request an eastern sky
source, stronger light through the outer windows and a subtler 1829-facing
side. The same correction applies to all eight connected passage runs.
This supersedes the strong downward tube output described below.

Escape now gives the existing sun an eastern direction, shared by the sky
glow, illumination and shadows. Cached light transforms are refreshed when
the mode changes. The joined Y=5.05 ceiling casts shadows, and remnants of
the old 3.6-unit connecting-gallery roofs rise with the taller passage so
they no longer shade the new windows from below the ceiling. Tower and
adjoining building roofs retain their original positions. The source angle
clears the boundary hedge; window frames, sills, walls and doors still block
it. Tube output falls from 85 to 16 with a steeper downward distribution and
a paler colour, removing the large high-wall pools while retaining floor fill.

Hardware views across day, dusk and night, portrait views and performance
receipts are in `../../Browser/artifacts/corridor-east-light/`. The rendered
window test records light along a ray through an eastern clear pane and zero
at neighbouring wall-blocked samples. Movement preserves fixed illumination
and one atlas bake; moving doors retain their occlusion. This changes Escape
browser runtime sources only. Shared compiled models, Unity/Android, Blender
and packaged exports were not regenerated for this correction.

## Stable corridor illumination — 7 October 2026

The owner reports that the water-tower corridor's light shapes do not follow
the windows, disappear while walking, and cause lag near doors. This supersedes
the six tube/four window shadow-slot scheme described below. Window daylight
now comes only from the existing estate sun and real aperture geometry; there
are no viewer-selected window spotlights. All 37 overhead tubes keep fixed
world positions and constant output, independently of the player's position.

One static depth atlas blocks tube light at walls, furniture and trim. Moving
door leaves use their actual transformed boxes to block it without rebuilding
the atlas. Sunlight retains its normal moving-door shadow refresh, accelerated
by separate position-only static shadow batches. Original colour geometry,
walking surfaces, window dimensions and historical placement are retained.

These are inferred gameplay lighting fittings, not historical electrical data.
The browser checks and before/after captures are in
`../../Browser/artifacts/corridor-light-stability/`. This is an Escape runtime
change; shared estate/interior binaries, Unity/Android, Blender and packaged
exports are not regenerated.

## Closed header side joints — 7 October 2026

The owner's [gameplay screenshot](door-header-side-gaps-reference.png) shows
open strips at both ends of the painted masonry above a Hale locked pair.
The shared corner mitres introduced below also tapered the passage side walls
at locked caps, where the boundary has a timber frame and inset header rather
than a matching return wall. This exposed the outside masonry beside the
header. At all nine locked pairs, the side-wall masonry, painted lining and
skirting now end square behind the frames and headers. Connected passage
corners retain their shared mitres.

Hardware-rendered before/after views and side-joint surveys are in
`../../Browser/artifacts/door-header-gaps/`. This is an Escape browser runtime
correction. The shared compiled models remain current; Unity/Android, Blender
and packaged exports are not regenerated.

## Straight Farndon wall and joined corridor trim — 7 October 2026

The owner's [pink-circled gameplay reference](farndon-wall-notch-reference.png)
requests a straight wall beside the Farndon doors and a review of the passage
walls and skirting. The diagonal Upton/Frith/Oscroft route previously started
at the dated estate's X=156.3 centre, projecting its end past the narrower
Escape gallery's east wall. Its start now lies on the Escape gallery centre,
along the same diagonal axis. This removes the triangular recess without
moving the established diagonal side walls or any locked endpoint.

All passage masonry, painted lining and dark skirting now meet at shared
mitres, including angled Grafton/Witby junctions and the gallery branches.
This supersedes the small separate corner-return strips described below.
Window apertures retain their clear profiles; the uninterrupted Farndon wall
uses the normal window spacing for its longer continuous run. Floors,
ceilings, collision footprints and notebook boundaries follow the corrected
outline through the existing batch/cache/obstacle/shadow refresh.

Before/after GPU captures and survey receipts are in
`../../Browser/artifacts/farndon-wall-joins/`. This changes Escape browser
runtime models only; shared compiled estate/interior models, Unity/Android,
Blender and packaged exports are not regenerated.

## Reference iron locks and four connected chain runs — 7 October 2026

The owner's [padlock reference](../escape-interior/door-lock-reference.png)
supersedes the square brass hardware below. Each face of all nine locked
double-door pairs now carries four iron chain runs through a rounded, aged
iron padlock. Alternating oval links connect to their neighbours, end eyes
and the bowed shackle. The upper mounting plates stay below the LOCKED plaques.
The shared Escape hardware factory also updates the asylum exits and grilles.
The existing corridor geometry, collisions and refusal messages are retained;
these runtime props still use the normal batch/cache/shadow refresh.
Review captures are in `../../Browser/artifacts/door-locks-reference/`.

## Kitchen wall meets the workshop facade — 7 October 2026

The owner's [pink-marked reference](kitchen-workshop-wall-gap-reference.png)
identifies the Main kitchen's north wall beside the west workshop facade.
The Escape room-shell cut previously stopped that wall and its pale plinth at
X=145.08, leaving a 0.32-unit gap to the workshop face at X=145.4. The kitchen
brickwork and plinth now continue to X=145.4 at their existing Z=-26.6 plane.
Their original materials, texture coordinates, window and roof are retained.

The western room volume now has zero extra clearance at its west end; other
passage cuts retain their established clearance. This correction applies to
Escape runtime shell clipping in `tower-workshops.mjs` and
`workshop-gallery.mjs`. The shared kitchen/tower sources and compiled assets,
Explore, Unity/Android, Blender and packaged exports are not regenerated.
The existing batch rebuild, transform cache, obstacle refresh and shadow
invalidation include the extended wall; replay restores the original estate.
Before/after GPU views and validation are in
`../../Browser/artifacts/kitchen-workshop-wall-gap/`.

## Chains and padlocks on closed corridor sections — 7 October 2026

The owner's gameplay request adds large hanging brass padlocks and interlocking
iron chains to all nine locked double-door pairs. Two bolted eyes attach each
chain to the timber leaves, below the existing LOCKED plaques. Both faces carry
the fitting. The asylum's developer unlock leaves these closed corridor
sections locked. The opening Workshop entrance and three opening room doors
retain their normal fittings and interaction.

These are Escape-only fictional lock indicators; the corridor plan, leaf
heights and historical estate sources retain the preceding corrections.
Review views and validation are in `../../Browser/artifacts/door-locks/`.

## Corridor lighting, door heights and overlapping estate surfaces — 7 October 2026

The owner's latest gameplay references are saved in `corridor-repairs/`.
The blue stores entrance beside the tower is the height reference for this
complex: every opening internal leaf and every locked double leaf is now
3.65 units high, with its foot at Y=.05 and top at Y=3.70. The opening head
is Y=3.75. This supersedes the earlier use of the main asylum's 2.5-unit
doorway definition in these Escape fittings; those main-asylum doors retain
their established dimensions.

The machine-room floor mismatch was the retained service court at Y=.34,
above the continuous concrete at Y=.04. Its floor and supporting mesh are
now cut out of the workshop footprint. The old Farndon gallery's low roof
and underside are also cleared from the room. The joined ceiling now owns
the rooms and passages at Y=5.05. Ward-contact window assemblies and trim
below that ceiling are retired or clipped at the locked corridor ends,
including both Hale approaches. All originals are restored on disposal.

The locked-door jambs formerly shared the side-wall finished plane. Their
inner faces now project .015 units into the aperture, and header ends are
buried in the surrounding masonry. This removes competing depth surfaces.
The finish texture now repeats over exactly eight .26-unit stretchers /
sixteen striped headers (2.08 units), with wrapped brick variation and
pixel-aligned course boundaries; both split panels and arched walls use that
same world registration. The three-course band retains Y=1.38..1.68.

All 35 tubes supply real downward illumination. Their moving light and target
transforms remain live after static geometry caching. Six tube shadow slots
and four window shadow slots retain their assignments until a source leaves
the nearby selection; cached shadows refresh on reassignment and door motion.
Windows admit the estate's shared sky and sun colour, strength and direction,
including dusk/night changes. The added window component represents indoor
bounce, with the existing sun supplying direct light through the apertures.
These are inferred game lighting fittings, not historical electrical data.

The ground blocked tower arches also follow the latest corrected entrance
proportions; that shared model correction is documented in
`../water-tower/README.md`. The runtime corridor/workshop changes are outside
the shared model compilers. Only the aerial estate asset is rebuilt for the
tower source change; Unity/Android, Blender and packaged exports are unchanged.
GPU views and repeatable checks are in
`../../Browser/artifacts/corridor-repairs/`.

## Workshop entrance wall ground contact — 7 October 2026

The owner's follow-up identifies the wall beside the blue Workshop entrance.
Its Escape replacement plinth started at Y=0, above the lawn at Y=-0.15,
leaving a 0.15-unit opening beneath the wall. The plinth and entrance threshold
now extend to Y=-0.18. The threshold top remains Y=0.14; the facade remains
at the accepted purple-guide position X=145.4, meeting the tower at 90 degrees.
Upper masonry, window apertures, door placement and roof contacts retain their
existing dimensions. Brick texture coordinates share world registration across
the separate wall, sash-base and header panels, removing pattern discontinuities
at the window cuts.

This changes the Escape runtime replacement in `tower-workshops.mjs` only.
The usual batch rebuild, transform cache, obstacle refresh and shadow
invalidation include the corrected geometry, and disposal restores the estate.
GPU views and facade measurements are in
`../../Browser/artifacts/workshop-wall-grounding/`. Shared compiled estate and
interior models, Explore, Unity/Android, Blender and packaged exports are not
regenerated.

## Purple workshop-to-tower junction guide — 7 October 2026

The owner's `workshop-wall-position-reference.png` marks a vertical line on
the tower's south face. The adjoining west workshop facade moves from X=146.3
to X=145.4, a 0.9-unit visual estimate from that screenshot. Its north/south
direction stays fixed, so it continues to meet the tower at 90 degrees.
This supersedes the retained X=146.3 alignment in the flicker notes below.

The access door, threshold, four rectangular sashes, masonry and interior
lining follow the same shift. Cloned flat-roof edges, parapets, copings and
eaves extend to the new facade; the tower and slate roof contacts retain their
geometry. The vestibule and two western rooms follow the moved boundary.
Their benches, vice, tool board, shelving, oil tins, takeable tools and approach
points move west, and the local lamps follow the widened rooms. Room doors
continue to connect to the gallery. Walking and interaction records follow
the fittings, affected batches are rebuilt, cached transforms refreshed and
shadows invalidated. Restart restores the original estate exactly.

This is an Asylum Escape runtime change in `tower-workshops.mjs` and
`escape-grounds.mjs`. Shared compiled estate/interior assets, Explore, Unity,
Blender and packaged exports are not regenerated. Evidence and runnable
checks are in `../../Browser/artifacts/workshop-wall-position/`.

## Rectangular windows beside the Workshop entrance — 7 October 2026

The owner's follow-up specifies only rectangular windows on the short west
stores facade directly adjoining the blue Workshop door. This supersedes the
two inferred west-facing semicircular additions described below. The four
established rectangular sashes remain at Z=-47, -42.5, -37 and -31.5; the two
small arched apertures at Z=-39.75 and -34.25 are filled with continuous exterior
brickwork and matching interior lining. Other gallery/workshop elevations keep
their existing windows.

`tower-workshops.mjs` now cuts only those four sash openings and the entrance
in this facade; the unused west-arch builder is removed from
`workshop-gallery.mjs`. The previous ceiling/partition flicker repair remains.
The workshop regression checks the filled apertures from both sides and all
four rectangular panes from inside and outside, alongside walking, working
doors, unchanged tower/roof contacts and exact replay restoration.

Reviewed hardware desktop, oblique, doorway, shifted and portrait views plus
the zero-overlap/no-page-or-shader-error receipt use the `rectangular-` prefix
in `../../Browser/artifacts/tower-wall-flicker/`. This correction changes Escape
runtime fittings only; compiled assets and Unity, Blender or packaged exports
are not regenerated.

The required full suite passes the corrected grounds/workshop checks and
stops at the existing R42 notebook-label assertion; the log is
`rectangular-full-suite.log` in the same artifact directory.

## Exterior workshop wall flicker correction — 7 October 2026

The owner's blue-circled Asylum Escape screenshot identifies the west stores
wall beside the water tower. The runtime plaster ceiling's side face, three
painted partition end caps and the south masonry return shared the exterior
brick plane at X=146.3. Hardware game captures reproduced the horizontal pale
stripe and vertical patches; 51 exposed probe locations had competing faces.

`tower-workshops.mjs` now insets the floor/ceiling outline by 0.04 units and
terminates partition and return ends inside the enclosing masonry. The inset
follows each stepped corner, keeping the slab edges concealed by the walls
and existing tower trim. The west brick facade retains its established plane.

The assembled, rebuilt batches pass 105 exterior-surface probes per attempt,
as well as the existing room walks, door/sign, window, tower/roof retention
and exact restoration checks. Hardware desktop, shifted, oblique, doorway and
phone views show the repaired wall; all sampled exposed overlaps are gone.
Receipts and captures are in `../../Browser/artifacts/tower-wall-flicker/`.
The full suite stops at the previously documented R42 notebook-label assertion.
This repair changes Escape runtime fittings only; compiled assets and Unity,
Blender or packaged exports are not regenerated.

## Main-corridor interior finish correction — 7 October 2026

The owner's `corridor-interior-reference.png` supersedes the earlier narrow,
low tile stripe. The photograph shows exposed red lower brickwork, pale painted
upper brickwork and a broad red/buff header band immediately below the paint.
The band is about three courses deep, with its top a little above the window
sills. The Escape fitting uses 0.10-unit courses and a band from Y=1.38 to 1.68,
against the retained window sill at Y=1.48. These are visual proportions rather
than surveyed dimensions. Staggered buff headers alternate with red brick;
the band follows one physical height through the gallery and room linings.

The inward window surrounds now use alternating red and buff jamb courses and
radial arch bricks, continuing back through the reveal, with a thin red outer
arris and muted grey stone sills. Existing white sash divisions and clear
semicircular apertures are retained. Exterior stone surrounds retain their
established appearance. The upper painted brick has finer mortar joints and
subtle relief/grain; the lower red and buff colours are weathered and muted.

`Browser/dist/workshop-interior-finish.mjs` owns these runtime materials and
window details. The original tower's photographed masonry is retained, and
the signed, opening room doors continue to use the existing fittings. This
changes the Escape workshop/gallery interior; shared estate/interior compiled
assets, Explore, Unity, Blender and packaged exports are not regenerated.

Final views and validation are saved in
`../../Browser/artifacts/corridor-interior-finish/`. The geometry check retains
clear lower panes and semicircular heads on both faces, working room doors,
full-length walks and exact restoration on replay. The hardware walkthrough
passes on NVIDIA GeForce RTX 3090 Ti / ANGLE Direct3D11 with no page or shader
errors. Reviewed captures include the oblique corridor, both gallery window
faces, all exposed workshop faces and desktop/portrait gameplay. The required
full suite again stops at the existing R42 notebook assertion in
`test-reception-second-floor.mjs:76`; see `full-suite.log`.

## Full connecting gallery, windows and room doors — 7 October 2026

The follow-up extends the accessible passage along the full existing
Main/admin-to-Farndon trace: X=156.3, width 5.4, Z=9.8 to -132.1. This
supersedes the earlier stops inside the tower stores. Its floor, ceiling,
painted brick, tiled band, skirting, service pipe and tube lights continue
throughout. The ends remain enclosed at the established building contacts.
The scenario boundary, walking routes and explored notebook map include the
whole gallery, preserving the two grounds-gate escape routes.

Semicircular gallery windows now have real openings through exterior masonry
and interior lining, with divided glazing, curved frames and stone sills on
both sides. Exposed workshop faces receive matching arched lights; two west
openings supplement the photographed rectangular sashes. Walls attached to
the tower, kitchen or another service range remain internal, without windows
into solid adjoining buildings. Concealed junction windows and projecting
branch fittings are retired within the passage. Workshop window spacing and
room divisions are inferred gameplay fittings, not surveyed historical data.

Each of the three rooms has a hinged timber door, recessed panels, handles
and its own centred nameplate affixed to the moving leaf. E opens a door;
closed and open leaves supply matching walking obstacles. Signs and leaves
are excluded from static batches. Open doors survive capture and reset with
a new attempt. The blue entrance's `Workshop` plaque and the original exposed
tower faces/corner contact remain as specified by the preceding corrections.

`workshop-gallery.mjs` provides wall openings and clips adjoining shells using
the existing attribute-preserving geometry helper. Affected batches and cached
transforms are rebuilt, obstacles refreshed and shadows invalidated. Disposal
restores every original estate mesh, batch, parent, transform and instance
buffer. These remain Escape runtime fittings: compiled estate/interior assets,
Explore, Unity, Blender and packaged exports are not regenerated.

Validation evidence is in `../../Browser/artifacts/workshop-gallery/`.
Physical checks cover the whole gallery, three opening doors, moving signs,
more than 140 glass-visibility rays through lower panes and semicircular heads
from both sides, perimeter integrity and exact replay restoration. Hardware
walkthroughs and desktop/portrait captures use the verified RTX 3090 Ti through
ANGLE/Direct3D11. The full suite stops at the existing R42 notebook assertion
in `test-reception-second-floor.mjs:76`; this is not a full-suite pass.

## Exposed tower faces and vestibule corner — 7 October 2026

The owner's `tower-interior-contact-reference.png` corrects the vestibule:
its northern face is the water tower itself, with no intervening painted
stores wall. The right partition must meet the tower without a gap or overlap.
The original tower mesh supplies both the south-facing vestibule enclosure
and the east-facing passage enclosure. Its existing photo-based brickwork,
arched entrance, pale repairs, corner strips and plinth are rendered directly.
No duplicate tower surface, repainting or interior skirting is added there.

The vestibule partition moves from X=153.6 to the tower's east edge, X=153.1.
Its north end butts against the projecting corner strip at Z=-49.995;
below Y=0.3 a short return meets the plinth at Z=-50.025. This preserves
the original tower geometry and fits the wall to its stepped surface.
The other workshop partitions retain their positions. Walking obstacles
follow the moved wall and the tower's own masonry.

This correction changes only the Escape runtime fittings. The shared exterior
tower and roofs, compiled estate/interior assets, Unity and Blender exports
are unaffected. Contact checks and hardware-rendered desktop/phone views are
saved under `../../Browser/artifacts/tower-workshops/tower-`.

## Accessible tower corridor and workshops — 7 October 2026

The owner's `tower-workshops-reference.png` circles the existing blue stores
door in red and its adjoining service ranges in blue. This revision supersedes
the outdoor lean-to described below. The takeable crowbar is on the repair
bench; the oil can is on the oil-store bench, both inside the marked complex.

The north/south passage follows the existing Farndon corridor centreline at
X=156.3, with its accepted 5.4-unit width and 3.6-unit envelope. Only its section
inside the tower stores, Z=-60.3..-26.6, is hollowed for Escape. The blue door
at X=146.16, Z=-44.75 opens inward onto a short connecting vestibule. Two rooms
lie west of the passage: a repair workshop and an oil/parts store. The larger
machine workshop lies east of it within the dormered range. Closed corridor
ends retain the rest of the estate as an exterior model.

The owner's later entrance-sign correction places the plaque on the upper
recessed panel of that door. Its sole, centred line reads `Workshop`; the
former `WORKSHOPS` and `Tools inside` wording is superseded. The plaque follows
the door leaf as it opens.

The finishes use `../admin-corridor/interior-1.png` and `interior-2.png`: red
lower brick, pale painted upper courses, a red/yellow tile band, dark skirting,
stone flooring, timber surrounds, overhead service pipes and tube lights.
The photographs supply the finish reference; room partitions and furnishings
are inferred gameplay fittings rather than surveyed historical rooms. The
stepped kitchen recess and original outer shell/roof envelope are retained.

`tower-workshops.mjs` temporarily replaces the solid lower shells, opens the
existing stores-door panel, splits the old corridor block, rebuilds affected
material batches and refreshes cached transforms/collisions. Restart restores
all original estate meshes, batches, materials and instance buffers before
constructing the new attempt. The scenario boundary follows the outer stores
walls so entry cannot bypass a north escape gate. The grounds map covers the
machine room and reveals the workshop outline through its existing fog; the
HUD names each room. Four local lights illuminate the interiors.

`maintenance-props.mjs` supplies the curved steel crowbar with split claw and
flattened tip, a pressed-metal oil can with pump, loop handle and curved brass
spout, and the wicket's iron frame, hinge straps, latch, ring pull, grain and
nailed retaining boards. Collection, noisy/quiet gate choices, held prising,
capture and restart retain the established escape rules. The access door and
opened gates remain open after capture; tools return to their interior benches.

These are browser Escape runtime models. Explore, the dated aerial and shared
compiled estate/interior assets do not include these fittings. No Unity,
Blender, Android or desktop package export is regenerated by this revision.
Run `npm run test:grounds` for the logic, exact estate-restoration and hardware
game walkthrough checks. Reviewed room/prop views and the receipt are in
`../../Browser/artifacts/tower-workshops/`.

## Original boundary and outdoor store — 7 October 2026

These are fictional gameplay fittings, not a reconstruction of the historical
hospital perimeter. They are created by `Browser/dist/escape-grounds.mjs` for
Asylum Escape only. The dated estate, Explore and archive photographs are not
changed. No water-tower or service-building interior is added.

The external lean-to/workbench stands beside the tower stores, using the
west-facing stores doorway at X=146.24, Z=-44.75 as its reference. The latest
door and parapet evidence is in `../tower-buildings/README.md`. The tool-store
anchor is X=141.8, Z=-44.75, with its usable face towards the asylum. Its new
timber backing, canopy and table support the two takeable props.

Hedges and iron railings connect around the playable area. Existing masonry
replaces fence sections where it already supplies a continuous, tall obstruction.
The front drive has a visibly locked carriage gate and a notice pointing towards
the pedestrian route. Two usable gates on Z=-85 lead towards the existing mast:
the pedestrian gate at X=-80 and the boarded maintenance wicket at X=87.
The outline and interaction anchors live in `escape-grounds-state.mjs`.

Collision records follow the rendered perimeter and moving leaves. Railings
stop walking/jumping but permit sight; dense hedges and the retaining boards
block sight. Tree visibility refreshes preserve these scenario obstacles.
The gates, boards, notices and tools have independent visibility, while repeated
bars and fixed fittings share instanced geometry. Moving a gate refreshes
navigation and shadows. Generated estate/interior assets exclude these runtime
fittings; the shared source fingerprints remain unchanged.

Hardware browser views and measurements: `Browser/artifacts/escape-grounds/`.
The before/after plan views establish placement; the desktop and phone views
check the gate notices, workbench, passage width and interaction presentation.

## Corridor dimensions, concrete and workshop usability - 7 October 2026

The owner's three supplied Escape screenshots show an exposed masonry join,
a raised slab across the corridor and shelving intersecting the open oil-store
door. This request supersedes the earlier stone/flagstone floor interpretation
and horizontal floor-joint detailing. The requested passage proportions are
65% of previous finished width and 110% of previous finished height. These
ratios apply to the clear interior, leaving the dated estate source unchanged.

The gameplay finish is slightly distressed grey concrete: muted seamless
mottling, fine aggregate and small pores with shallow relief, without regular
black joint lines. The outdoor service-court surface is cut out of the interior
runtime corridor, so the floor remains level. Painted returns cover the exposed
cut ends at inward corridor junctions.

Shorter oil-store shelving clears the entire signed door swing. The inferred
machine room is now rectangular, with its former unoccupied front-side bay
closed. Milling, grinding, fitting, parts storage and a central assembly island
with a vice make use of the room while leaving walking aisles. These are
fictional maintenance fittings, not a surveyed historical workshop inventory.

The screenshot-guided revision and combined corridor layout are checked in
../../Browser/artifacts/workshop-layout/: reviewed desktop/phone captures,
exact dimensional ratios, 19 shelf-clearance angles, level floor probes and
physical game walks. The original tower model and replay restoration remain
verified by the workshop regression. Unity, Blender and packaged exports are
not regenerated.

## Extended corridor network and shared tower wall - 7 October 2026

The owner's `corridor-network-reference.png` supplies the purple accessible
routes, six yellow stopping lines and nine red X direction-board locations.
This correction supersedes the old detached gallery position and the extra
partition beside the tower. Its clear width remains 3.13625 m. The realignment
initially retained the 3.751 m clear height; subsequent shared finish work
aligns the corridor and workshop ceiling undersides at Y=5.05. The west
finished face meets the tower's projecting
corner trim at X=153.205; the actual tower masonry forms the corridor wall
along the tower, with no intermediate room or parallel partition.

The gallery centre moves to X=154.773125. Repair/oil-store partitions and
doorways follow its west side; the machine-room partition, doors, benches,
grinder and tool boards follow its east side. The purple network includes
the main/admin approach, Irby/Ashley link, both Hale links, the diagonal
Upton/Frith/Oscroft spine and its Grafton/Edge and Witby branches. These are
inferred playable interiors within the existing estate routes. The coloured
annotations define gameplay access, rather than evidence of historical locks
or direction boards.

Locked full-width timber double doors occupy all six yellow cutoffs. The
three remaining ward contacts also end in locked double doors, keeping the
new playable network enclosed. Nine suspended direction boards use the same
aged cream, distressed edging and serif lettering as the door plates. Each
board faces an approaching route; arrows show the next leg relative to that
face (up for ahead, left and right for turns).

All passages share the established brick/paint/tile-band finish, arched
glazing, level concrete floor and overhead lighting. The runtime replacement
cuts interfering original shells and trim, and omits tree copies whose lower
geometry intersects the enclosed passages. Disposal restores all originals
and instance buffers exactly. The expanded boundary/map follows the corridor
branches while retaining the existing outdoor approaches and two north gates.

`Browser/artifacts/corridor-network/` contains hardware browser captures and
the walking/locked-door receipt. Shared compiled estate/interior sources,
Explore, Unity, Blender and packaged exports are not regenerated for this
Escape-only corridor replacement.

## Corridor finishes, ceiling height and two-sided signs - 7 October 2026

The owner's gameplay references are `corridor-seams-reference.png`,
`corridor-lights-reference.png` and `corridor-ceiling-height-reference.png`.
The purple height mark aligns with the workshop wall top at Y=5.05. All eight
Escape passage ceilings now share that underside, giving 5.01 units of clear
height above the Y=.04 floor. This supersedes the earlier 3.751-unit passage
height; the 3.13625-unit finished width is retained.

Internal wall faces share their brick texture's world coordinate and the
same lining depth across solid and windowed sections. Dark skirting covers
both partition faces, window bases, all corridor and room perimeter walls,
corner returns and the original tower walls exposed indoors. The tower's
geometry is retained; its added skirting belongs to the disposable Escape
interior.

Workshop room openings use the existing 1829 model's 1.9 by 2.5 dimensions.
Their leaves match its 1.74 width, 2.375 height and .06 thickness. Corridor
double doors retain the full clear passage width, use that leaf height and
meet at the centre with a narrow timber rebate closing the viewing seam.
The exterior blue stores entrance retains its photographed proportions.

Every ceiling tube has a matching illumination definition. Twelve nearby
light sources follow the player, maintaining the same shader light count
through the network. Direction boards have independently painted front and
back faces. Each face uses destinations and arrows for its own approach;
the Grafton branch repeats its destination list with reversed-view arrows,
while the other boards select routes appropriate to each approach.

These are Browser Escape runtime changes. Shared compiled estate/interior
assets, Unity/Android, Blender and packaged exports are not regenerated.
Validation and reviewed captures are in
`../../Browser/artifacts/corridor-finishes/`.

## Locked door header flicker - 7 October 2026

The owner's [gameplay screenshot](locked-door-header-reference.png) identifies
a flickering horizontal brick strip above the Hale locked double doors.
The estate's joined masonry course at Y=3.81..3.99 survived the Escape shell
replacement and shared the painted header's face within about one micrometre
at both Hale contacts. Facade optimization had converted these courses from
instances into ordinary meshes, which the original shell filter omitted.

The runtime replacement now clips joined stone-course meshes with the same
corridor volumes as the surrounding walls. The exterior and upper sections
remain, and disposal restores the originals. Door dimensions, locks and
passage layout retain their current definitions. Reviewed hardware browser
views of all nine locked pairs, close oblique views and a portrait capture
are in `../../Browser/artifacts/locked-door-header/`; validation is recorded
in `../../DEVELOPMENT.md`. Shared compiled models, Unity/Android, Blender and
packaged exports are not regenerated for this Escape runtime correction.

## Kitchen eave protrusion into the tower corridor - 7 October 2026

The owner's `tower-corridor-protrusion-reference.png` shows a pale fascia end
and diagonal hip flashing above the oil-store doorway. Both belong to the
adjoining Main kitchen at Z=-26.6, whose 4.8-unit eave lies below the Escape
passage ceiling. The runtime shell replacement previously recognised roofs
and gutters but omitted separately named fascia and flashing meshes.

Those fittings now use the same corridor-volume clipping as the roof. Their
external portions remain; the finished west corridor face at X=153.205 is
clear. This changes only the disposable Browser Escape interior. The original
kitchen/tower sources, shared compiled assets, Unity/Android, Blender and
packaged exports are unchanged. Exact estate restoration on restart remains
covered by the workshop regression. The reported desktop angle, close view,
portrait capture and rendered wall probes are saved in
`../../Browser/artifacts/tower-corridor-protrusion/`.
