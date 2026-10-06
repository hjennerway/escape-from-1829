# Room furnishings — 3 October 2026

## Basement padded cells — 5 October 2026

The owner confirms B5, B6, B7 and B8 as padded cells for patient confinement.
This supersedes their former store, medicine-store and workshop assignments.
Each has a single fixed, rounded canvas mattress (.92 × 1.90 × .18m) and no
storage, work tables, chairs or loose objects. Escape and Explore share the
same room-use names, furnishings and padding. Notebook discoveries use
“Padded cell · patient confinement”. These are owner-directed fictional room
uses, not evidence of the hospital's historical room functions.

Original procedural quilted canvas covers the room-facing walls and floors.
Wall panels repeat at .62 × .58m, with a 26mm backing and up to 45mm of soft
relief. The thin floor pads rise 4–16mm above the original floor. The lining
stops outside window frames, door surrounds and parked door leaves. Wallpaper
and dado rails are omitted in these cells; the reviewed room boundaries,
window schedules and playable door poses remain the shared plan inputs.

The [basement furnished plan](basement.svg) is refreshed. Run
`npm run test:cells` in `../../Browser` for the dedicated geometry, return-route
and hardware browser checks. Desktop, phone and Explore views are in
`../../Browser/artifacts/padded-cells/`. Full validation results are recorded
in `../../DEVELOPMENT.md`. Browser sources are updated; the aerial asset's
source fingerprint remains current. Unity, Blender and packaged exports are
not regenerated.

## Shared ward privies — 5 October 2026

R5, R16, R33 and R35 on the ground and first floors now serve as shared
privies and washrooms. This supersedes their earlier linen-store, nursing
station and day-room assignments. The rear rooms have three seats each;
the forward rooms have two, allowing their existing window bays and open
entrance leaves to remain clear. The eight rooms contain twenty seats,
twenty-eight boarded privacy partitions and eight basin washstands.

The rear fittings stand against the long south partition, away from the
north and end windows. Their room markers move into the common aisle at
z=-34.65. The forward fittings use the south partition; their washstands
occupy the wider northern space. Each stall has a separate seat footprint
and narrow screen footprints, so players can walk between the boards to
reach the seat. The washstands have open earthenware basins, matching ewers,
soap, folded cloth and a pail on the lower shelf. Seat openings expose a
recessed pan within a plain timber surround, with a small hand-operated
valve fitting. The rooms use the existing plain masonry finish.

Historical basis: the [1829 Wakefield account](https://upload.wikimedia.org/wikipedia/commons/6/64/Midland_medical_and_surgical_reporter_and_topographical_and_statistical_journal._Volume_2%2C_1830-1831._%28IA_s1id13414000%29.pdf)
describes internal privies intended as water closets, troubled by insufficient
water. [The National Archives' Bramah patent account](https://www.nationalarchives.gov.uk/explore-the-collection/explore-by-topic/business-finance-and-innovation/toilet-design/)
dates the handle-operated valve closet to 1778. The
[Te Papa English washstand](https://collections.tepapa.govt.nz/object/57076)
is dated 1800–1830 and establishes a suitable timber washstand type. These
sources support plausible period fittings; the model, dimensions, partition
layout and selected room functions are original gameplay interpretations,
not a reconstruction of Chester's recorded sanitary inventory. All fittings
are static. No source images are imported.

The three procedural designs total 4,300 triangles before instancing. Fixed
records drive Escape/Explore rendering, player collision, NPC navigation
and sight. Both shared plans and their ground/first architectural and
furnished SVG/PNG drawings are refreshed. Other furnishings are unchanged
for two independently compared seeds; room outlines, doors, windows, stairs
and exterior geometry retain the previous plan.

Run `npm run test:privies` in Browser for the dedicated logic and hardware
browser checks. Logic checks follow 112 routes to seat/washstand standing
positions over four seeds and check genuine seat openings. The browser check
verifies all 56 rendered fixtures, 28 actual keyboard collision approaches,
eight rooms in both modes, model closeups and phone views. Hardware rendering
is verified on the NVIDIA RTX 3090 Ti / Direct3D11. Evidence is in
`../../Browser/artifacts/ward-privies/`; validation details are in
`../../DEVELOPMENT.md`. Only browser sources and review drawings change.
The aerial compiled source hash still matches; Unity, Blender and packaged
application exports are not regenerated.

## Mirrored R2/R13 ward additions — 5 October 2026

The owner requested six additional beds in R13 and its mirrored R2 layout,
and confirmed both the ground and first floors. Each room now contains ten
beds, five in each existing row. The original four bed positions, orientation,
full model size, head inset and 1.975-unit spacing remain; three positions
extend each row towards the entrance. R2 reflects R13's x coordinates.
Existing fixed wardrobes and small benches remain in place. The middle
aisle, entrance and every bed foot retain walking access.

Both shared plans define the exact rows; the ground/first furnished SVG/PNG
drawings are refreshed. Browser Escape and Explore are updated. The aerial
model excludes these interior furnishings; Unity, Blender and packaged
exports are not regenerated. Reviewed GPU views and placement comparisons
are in `../../Browser/artifacts/outer-ward-beds/`, with validation notes in
`../../DEVELOPMENT.md`.

## Central dormitory wall-bed correction — 5 October 2026

The owner's marked removals apply to R6, R8 and R10. Each now retains fourteen
beds: eight on the window side and six on the entrance side. Original
entrance-side slots 1 and 2 (zero based) are left empty; the other slots keep
their spacing. All headboards meet the visible .09-unit wall face. This
supersedes the sixteen-bed counts and rear circulation strips below.

Fixed and variable Windsor chairs are removed from all three rooms. Existing
small Panca seats remain, and wardrobes move to clear short-wall positions.
The entrances open to at most 105 degrees to clear the retained wall beds.
Row ends and all bed feet retain walking access. Both shared plans and the
first-floor furnished SVG/PNG are refreshed. Browser interiors are changed;
the aerial compiler excludes them, and Unity/Blender/package exports remain
unchanged. The checks and reviewed views are recorded in
`../../Browser/artifacts/central-dormitory-wall-beds/` and `../../DEVELOPMENT.md`.

## Three central first-floor dormitories — 5 October 2026

The owner's later same-day “Adjust beds and chairs” follow-up supersedes this
initial sixteen-bed arrangement, removing the entrance-side pair and Windsor
chairs and pushing the remaining headboards to the walls. The validation below
records the earlier layout; the three merged dormitories remain in place.

R6, R8 and R10 now each combine two former rooms and contain sixteen fixed
beds, arranged eight per long wall with feet facing the middle aisle. Beds
retain their existing 130% dimensions and shared rendering/collision model.
Explicit row records in the shared plan fix every bed position across new
games. Placement rejects any missing or obstructed planned bed instead of
silently reducing the requested count.

The window-side row leaves .95 units behind its heads; the entrance-side
row leaves 2.15 units for the open leaf and circulation. Storage and small
seats are refitted after the beds; clear strips around both row ends prevent
them from closing the route from the door to the central aisle. R10 has a
larger southern end allowance so the navigation grid includes the turn.
Its nursing work table and the former R11 linen shelves are removed.
All three dormitories retain wardrobe storage, with checked small-seat and
supported-book variation. The first-floor drawing reflects the arrangement.

`test-central-dormitories.mjs` checks all 48 beds and physically follows a
route to each bed foot. The browser companion verifies the actual instances,
shared Escape/Explore furnishings, keyboard movement across a removed
divider and desktop/portrait views using verified hardware rendering.
Browser interior sources and review drawings change; Unity, Blender and
packaged exports are not regenerated, and the aerial model excludes them.

## West-wing Library — 5 October 2026

The new third-storey Library R46 uses stocked bookcases with the same timber,
books and collision checks as the small libraries. Its larger plan reserves
central reading-table candidates, which still pass the shared furniture,
door and circulation checks. The final layout has eight bookcases, one table,
chairs and supported books. The four adjoining rooms use the existing sitting,
reading, office and archive furniture; R51 remains clear stair circulation.
These are gameplay fittings for the owner's marked room layout. See
[the Library plan and scope](../west-library/README.md) and
`../../Browser/artifacts/west-library/` for the reviewed GPU captures.

## Supplied Cheshire Lunatic Asylum engraving — 4 October 2026

The owner supplied the engraving captioned “Cheshire Lunatic Asylum” to replace
the simple rural illustration shown in the visitors’ sitting hall. The exact
uploaded PNG is bundled at `../../Browser/dist/art/cheshire-lunatic-asylum.png`.
Both existing copies share one print texture in Escape and Explore. Their timber
frames, dimensions and wall positions are retained. The full image and its
caption fit at the original aspect ratio, with a narrow neutral paper margin
above and below rather than cropping or stretching the engraving.

This supersedes the rural-illustration description below. The supplied image
is an owner-selected game decoration; its placement does not establish a
historical room inventory. Browser sources and the local artwork asset change;
Unity, Blender and packaged application exports are not regenerated.
Desktop and phone review images in Escape and Explore, with exact image-pixel
checks, are in `../../Browser/artifacts/hall-artwork/`.

## Ground-floor linen folding and mending area — 4 October 2026

The owner clarified that the second blank space is the ground-floor east-wing
area below the checkers addition, across the corridor from the existing linen
lobby. A matching wooden worktable now holds two stacks of folded linen and
a sewing basket, with two inward-facing Windsor chairs and a timber bench.
The six fixed records extend the ward service area without moving its linen
cupboards, trolley, original bench or duty board. They keep corridor and door
approaches clear and use the same placement, walking and sight data in Escape
and Explore.

`hall-furniture-models.mjs` reuses its folded-cloth construction for one new
decorative model (168 triangles), using the existing muted linen materials.
This is a fictional linen folding and mending use chosen to suit the nearby
storage, with no claim about the asylum's historical room inventory. The
ground-floor furnished SVG/PNG is refreshed. The hall checks cover ten models
and 45 fixed records; new wide views are named `service-open-area`, with linen
worktable and bench close views in `../../Browser/artifacts/hall-furnishings/`.
Only browser sources and review drawings change. The aerial binary excludes
these interior models; Unity, Blender and packaged exports are not regenerated.

## Second east first-floor checkers group — 4 October 2026

The owner requested another checkers table and bench in the open area shown
in their east-wing first-floor screenshot, in addition to the existing table.
The recreation area now spans both sides of the junction. The added table,
four matching inward-facing Windsor chairs and draughts board occupy its east
side; a matching bench faces the new table. The forward corridor stays open
between the two groups. All original hall furniture retains its IDs and poses,
and the seven additions stay fixed in both Escape and Explore. This extends
the existing fictional recreation use without adding a historical claim.

The first-floor furnished SVG/PNG is refreshed. Run `npm run test:halls` from
`Browser` for placement and actual browser checks; the added wide desktop,
phone and Explore views are named `recreation-open-area` in
`../../Browser/artifacts/hall-furnishings/`. The aerial binary excludes this
source and needs no rebuild for this change. Unity, Blender and packaged exports
are unchanged.

## Three open halls — 4 October 2026

The owner approved the visitors’ sitting hall directly above Reception, the
ward service lobby east along the ground-floor corridor, and the communal
recreation area directly above that lobby. Separate furnishing areas retain
the existing open architecture and corridor routes. The sitting hall has two
four-chair reading/visiting groups; the service lobby displays folded linen
in two open cupboards and on a wooden trolley; the recreation area has a
draughts table, newspaper stand, sewing basket and seating near the windows.

The nine new designs are original procedural interpretations using the
existing muted furniture palette. The rural landscape is an original canvas
illustration, and the newspaper masthead, duty schedule, visiting text and
placements are fictional. The visiting hours match the existing Reception
notice. None establishes Chester’s original inventory or room functions.
Existing furniture references and licences below remain applicable to the
reused Windsor chairs, tables and books.

The 32 records stay fixed between games and match in Escape and Explore.
Cabinet fronts, corridors, windows, stair approaches and the ground-floor
outside door stay accessible. Notebook discovery includes the three area
names. Ground and first furnished plans are refreshed; other floors are
preserved. Reproduce the focused checks with `npm run test:halls` from
`Browser`; reviewed images, original records and scope proof are in
`../../Browser/artifacts/hall-furnishings/`. These are browser sources;
the aerial compiler excludes them. Unity, Blender and packaged exports are
not regenerated.


## Cold-water apparatus size and pole — 4 October 2026

The owner's follow-up enlarges the complete cold-water apparatus to 130% of
its previous width, depth and height: 1.586 × 1.430 × 2.964 metres. The shared
Escape/Explore catalog applies those dimensions to the model, placement,
walking, navigation and sight. The device remains fixed in ground R12; the
ground-floor furnished SVG/PNG reflects its larger footprint.

The left pole's brass control section replaces the matching portion of the
iron shaft. The previous equal-radius cylinders overlapped along that section,
causing a depth conflict. Separate iron sections now join the brass at each
end, retaining the pole silhouette and control fittings. This is an adjustment
to the existing interpretive cold-bathing model and historical reference.

Close front, elevated and pole views plus desktop/mobile room checks are in
`../../Browser/artifacts/cold-water-bath/`; reproduce them with that folder's
`capture.mjs`. Only browser sources and the affected furnished plan are updated.
The aerial binary excludes interior furniture; Unity, Blender and packaged
desktop/Android exports are not regenerated.

## Approved top-floor offices and storage — 4 October 2026

The reviewed five-room layout replaces the earlier two-room top floor.
R43 is a staff sitting room, R41 a smaller records office, R42 a staff office,
R44 archive/storage and R45 a linen store. The records office has one bookcase,
a desk and chair; its reduced footprint no longer needs the two cases of the
former large room, and the new archive provides bulk storage. Archive shelves
and linen cupboards retain their normal wall contact and front access. Existing
placement/collision/navigation rules furnish all five rooms and reserve their
door swings, room centres and circulation.

The second-floor furnished SVG/PNG is regenerated; the drawing command accepts
`second-floor` to update this level alone. The three lower-floor drawings and
their current furniture sources are preserved. Top-floor doors have nameplates
on both leaf faces in Escape and Explore. Current browser review and regression
evidence is in `../../Browser/artifacts/top-floor-layout-proposal/implemented/`.

## Reception desk and key-hook correction — 4 October 2026

The owner's follow-up moves the desk 30% closer to the back wall. Its centre
moves from z=14.5 to z=12.97, reducing the distance to the z=9.4 wall from
5.1 to 3.57 metres. The clerk's chair moves with it to z=11.57; the ledger,
papers, ink/quill, candlesticks and bell remain supported on the desktop.

The six cupboard hooks now embed in the backboard, pass through the key bows
and turn upward in front. Each bow rests on its hook's underside, replacing
the earlier gap. `../../Browser/test-reception-furniture.mjs` checks contact
on the final meshes. Front and oblique close views are in
`../../Browser/artifacts/reception-furniture/`.

## Reception entrance hall — 3 October 2026

The owner requested all six proposed additions, then a 20% size increase for
every Reception item and a desk in the middle facing the arriving player.
The ground-floor open hall now contains a central clerk's desk, a Windsor
chair behind it, two plain timber waiting benches, a Chester-inspired longcase
clock, a hinged key cupboard with six labelled iron keys, a framed rules notice,
and desk accessories: an open admissions ledger, loose correspondence,
an inkwell and quill, two brass candlesticks and a wooden-handled brass handbell.

The desk is centred at x=0/z=14.5 with its visitor face toward the south
entrance. Player arrival is x=0/z=17.5, facing the desk; passages on both sides
remain open. The benches and clock sit against the side partitions. The
cupboard and notice hang on those partitions, while the accessories rest on
the enlarged desktop. All eight placement records remain fixed in Escape and
Explore. The six new design dimensions are 120% of the initial proposal;
the existing Windsor chair is enlarged only in Reception.

`../../Browser/dist/reception-furniture-models.mjs` makes original game models
using the existing subdued timber, brass, iron, glass and paper finishes.
The six designs total 4,924 triangles before the locally generated print planes.
Print materials retain readable ink under the torch. The clock sounds only
nearby on the ground floor: quiet alternating ticks and an hourly bell strike,
using gameplay time from its initial 10:10 setting. Escape respects its sound
toggle and pauses; Explore unlocks sound after a user gesture and advances it
while walking is active. No new game interaction is assigned to the handbell.

References establish plausible prop types, not Chester's original furniture
inventory. [Cheshire Archives](https://www.cheshirearchives.org.uk/Asylum-patient-records.aspx)
holds Reception Orders from 1829. The clock's case and maker inscription are
an interpretation of the [Benjamin Peers of Chester longcase clock](https://www.nationaltrustcollections.org.uk/object/931645),
dated 1800–1840 by the National Trust, rather than a measured replica. The
[Windsor chair reference](https://www.historicnewengland.org/explore/collections-access/gusn/19405)
is dated 1800–1830; the game retains its existing Windsor design. The rules,
2–4 visiting hours, key labels, handwriting and prop placements are fictional.

Run `node Browser/test-reception-furniture.mjs` for size, placement, support,
circulation, collision and sound checks, and
`node Browser/test-reception-furniture-browser.mjs` for actual Escape/Explore
geometry, keyboard movement, readable print textures and desktop/phone views.
Review evidence is in `../../Browser/artifacts/reception-furniture/`.
These sources affect browser interiors; the aerial compiler excludes them.
Unity, Blender and packaged desktop/Android exports are not regenerated.

## Wardrobe and bookshelf wall contact — 3 October 2026

Wardrobes and both bookshelf variants now place their complete back face
against actual masonry, including the canted library walls. Their centres
sit half their depth plus .09 from the wall centreline, matching the .18-wide
rendered wall. Side/front clearance remains checked; rear probes allow this
contact instead of adding a gap. Corridor checks retain the full walking
width without projecting an extra buffer through the enclosing wall.

The narrow R31 bay fits its two canted cheeks first; other small libraries
fill their long walls before corner positions. Basement window avoidance
now reads the explicit window schedule used by its renderer. These changes
keep storage backs against solid wall and retain window and doorway access.
Collision, navigation and sight use the same updated placement records in
Escape and Explore. The four furnished plans below are regenerated.

Rendered contact measurements and desktop/mobile review captures are in
`../../Browser/artifacts/storage-wall-contact/`. Original furniture meshes,
Unity, Blender and packaged exports are not regenerated. The aerial compiler
excludes the interior furniture sources, so this placement update needs no
aerial model rebuild.

## Clear bookshelf and dispensary fronts — 3 October 2026

The owner's [dispensary screenshot](dispensary-front-reference.png) requests
clear access in front of every bookshelf and dispensary cabinet. Each placed
`bookcase` and `apothecary` reserves a one-metre-deep strip from its front face,
across its full width plus .10 at each side. The strip follows the model's
local +Z front through every rotation, including the canted library shelves.
Other furniture, including varied chairs and supported decorations, cannot
enter it. Front standing positions also retain player clearance from masonry.

Placement checks both directions, so the rule applies whether storage or the
potential obstruction is placed first. Fixed shelves and dispensary cabinets
are fitted before other furniture, retaining their original ID indices.
General furniture and additional shelves are omitted when no checked position
preserves access, windows, doors, room centres and stairs. This access rule
supersedes the earlier shelf counts where compact rooms cannot fit them all.
Concurrent storage-wall and model-size updates remain in the shared layout.

`test-asylum-furniture.mjs` independently projects all rotated furniture
footprints against every full front strip across eight seeds and all floors.
Rendering, keyboard collision and Escape/Explore parity use the existing
furniture and small-library browser checks. Current review evidence is in
`../../Browser/artifacts/furniture-front-clearance/`. The four furnished plans
are regenerated from the final placement records. These changes affect the
browser interiors; Unity, Blender and packaged exports are not regenerated.
The separate aerial compiler excludes these interior sources.

## Furniture surface refinement — 3 October 2026

The owner's table/chair and wardrobe/dispensary screenshots exposed regular
bands in both runtime furniture shaders. These now share
`Browser/dist/furniture-finishes.mjs`: a seeded, smoothly interpolated texture
provides faint, irregular timber fibres plus soft stain and fine wear. Filtering
and mipmaps smooth the detail at a distance. Timber runs vertically on upright
faces and along horizontal boards; painted/enamelled surfaces and iron/brass
use only isotropic wear. Books and the mixed fabric/wood bed use a matte finish,
so their non-timber surfaces do not inherit grain.

The muted palettes and source texture atlas remain intact. This is a browser
material revision with no furniture mesh, dimension, placement or collision
change. The aerial compiler excludes these modules, so its generated model
requires no rebuild. Unity, Blender and packaged exports are not regenerated.
The reproducible before/after comparison and review sheet are under
`../../Browser/artifacts/furniture-finishes/`.

## Surgical table size, label and head cushion — 3 October 2026

The surgical table is 130% of its previous overall width, depth and height:
1.066 × 2.704 × 1.326. The shared Escape/Explore catalog supplies the same
dimensions to rendering, rotated collision, navigation and sight. Ground R6
retains one fixed surgical table, with placement checked against room,
doorway, window and circulation clearances. This supersedes the original
equipment dimensions retained during the earlier ordinary-table revision.

A wider, two-line label hangs on a timber plaque at the front edge of the
extending footplate, clear of its overhang. Brass hangers connect it to the
footplate. The green removable head cushion rests directly on the sloping
headboard; its position follows the board's angle and surface thickness.
These are owner-requested adjustments to the same interpretive model and
do not change its historical reference. The seven medical meshes now total
28,460 triangles without runtime label textures.

Close front, elevated and head-end review captures and label visibility
checks are under `../../Browser/artifacts/surgical-table/`. Regenerate them
with `node Browser/artifacts/surgical-table/capture.mjs`. The medical model
check also measures contact between the cushion underside and headboard at
nine points. Only browser sources and furnished floor plans are updated;
the separate aerial binary excludes interior furniture. Unity, Blender and
packaged application exports are not regenerated.

## Wardrobe height — 3 October 2026 follow-up

The owner requested wardrobes at the same height as the bookshelves. All
`cupboard` instances now use a 2.850-high case, matching both standard and
fitted bookcases, with the existing 1.50 × .65 footprint. The procedural case,
doors and fittings scale vertically together from the floor origin. Placement,
walking/navigation and sight records consume the shared catalog dimensions.
This supersedes the earlier 2.15 wardrobe height below. Browser review evidence
is in `../../Browser/artifacts/wardrobe-height/`. Unity, Blender and packaged
exports are not regenerated; the aerial binary excludes this interior model.

## Small libraries — 3 October 2026 follow-up

The owner's [east half-octagonal room screenshot](small-library-reference.png) requests book-filled shelves
in the matching small rooms. R18, R21 and R31 on both ground and first floors,
ground R37 and first R34 now have the fictional notebook use **Small library**.
The shelves follow the actual masonry, including the two canted cheeks of R31,
rather than the rectangular room envelopes. They retain clear room entrances,
room centres, windows, stairs and outside-door approaches. This supersedes the
earlier sparse quiet-room treatment for these eight rooms.

These cases reuse the existing KayKit shelf and book sources and timber finish.
Each of four shelf levels carries two groups of books, seated on the measured
board surface. Narrow-room footprints are fitted separately from standard
bookcases; the current fitted size is 1.575 × .420 × 2.850 after the separate
150% bookcase revision. Both use the shared current case height and match their rendered
dimensions to walking/navigation/sight records. Placements remain fixed across
new games and are identical in Escape and Explore. This is an owner-directed
gameplay addition, without a claim about Chester's historical room functions.

Run `node Browser/test-asylum-bookrooms-browser.mjs` to check the actual
rendered cases and supported book rows, walk each entrance to its room centre,
and capture all eight rooms plus phone and Escape views. Evidence is under
`../../Browser/artifacts/small-libraries/`. `npm run test:furniture` includes
this check. The furnished plans below are regenerated with these placements.
Only browser interiors are updated; no aerial binary, Unity, Blender or
packaged application export is regenerated for these shelves.

## Bookshelf scale — 3 October 2026

All standard bookshelf instances use a 1.875 × .570 footprint and 2.850 height,
150% of their original dimensions. Shelves, frames and their books scale as one
assembly. The fitted stocked variant follows the same scale from its smaller
base size, giving a 1.575 × .420 footprint and the same 2.850 height. Additional
checked wall positions retain circulation around the enlarged cases; the
narrow east bay uses two shelves aligned to its diagonal cheeks. The four
furnished plans below reflect the current placement and collision records.
Before/after size and contact evidence is in
`../../Browser/artifacts/bookshelf-scale/`. Original glTF files remain intact.

## Larger Windsor chairs/tables and rectangular wardrobes — 3 October 2026

The owner's pale, glazed medicine-cupboard screenshot is replaced throughout
the shared Escape/Explore furniture library by an original plain double-door
wardrobe. The `cupboard` placement key now renders a 1.50 × .65 footprint,
2.15-high solid timber case with a closed plinth, shallow door framing and
brass knobs/hinges. Its worn timber and brass materials are the same factory
and palette as the dispensary cabinet. There are no glass panes, drawers or
open lower shelf. This is an owner-directed design, not a museum replica.
The Shaker mesh and its source/licence record remain archived in the asset
set, but the game no longer requests or renders that mesh or its medical top.

Windsor chairs and ordinary work tables are 130% of their previous width,
depth and height: chairs .624 × .611 × 1.17, tables 1.95 × 1.066 × .988.
The source meshes stay intact; runtime normalization applies the new sizes.
The medical operating table retains its separate equipment dimensions.
Walking footprints, navigation and sight use these same dimensions. Wardrobes
use checked wall positions; table-chair spacing follows the enlarged chairs.
Furniture is omitted where no placement preserves the existing room, door,
window and stair clearances, as with other general room furniture.

Updated review captures and validation are in
`Browser/artifacts/furniture-resize/`; the four furnished floor plans below
are regenerated from the current placement records. Only browser sources,
checks, drawings and notes change; Unity, Blender and packaged exports are
not regenerated. The separate compiled aerial scene excludes this interior.

## Historic medical equipment — 3 October 2026 follow-up

The owner requested all seven proposed medical additions and authorised room
placement. `Browser/dist/medical-furniture-models.mjs` builds original meshes
with separate worn timber, enamel, brass, iron, ceramic, cloth and glass
finishes. Labels are generated locally, rather than copied from museum images.
The references establish the types and approximate periods, not their use or
placement at Chester. The playable interior combines historical periods; it
does not represent a single year. R8 is explicitly named as a later hospital
era in the notebook. No claim is made that ECT existed in 1829 or 1916.

| Addition | Room and use | Model details and reference |
| --- | --- | --- |
| Immersion bath | Ground R1, hydrotherapy | Open oval enamel bowl, rolled rim, shallow water, iron feet, brass plumbing/taps, thermometer and bath chart. Prolonged warm baths are documented by [Bethlem Museum](https://museumofthemind.org.uk/blog/change-minds-online-sarah-jane-may). |
| Cold-water apparatus | Ground R12, cold-water treatment | Raised metal reservoir, overhead outlet, pull chain, exposed control pipe and drained enamel tray. An interpretive apparatus inspired by early cold bathing, not a replica of a specific mechanism; [Haverford's archival exhibition](https://qmh.haverford.edu/medical-treatment) records early nineteenth-century shower treatments, including bucket dousing. |
| Surgical table | Ground R6, surgical treatment | Narrow timber boards, four legs, head support, extending footplate, linen and a lower shelf with instrument case, saw, scalpel and forceps. Based on the [1830 wooden operating table](https://oldoperatingtheatre.com/collection/collection-detail/1123945/) and [period surgical instruments](https://oldoperatingtheatre.com/wp-content/uploads/2024/11/History-of-site-factsheet-simplified.pdf). Its presence in this asylum room is a gameplay choice. |
| Early electrical apparatus | Ground R29, early electrical treatment | Timber console, glass cylinder, crank, rubbing pad, Leyden jars, conductor and lead. Inspired by [Nairne and Blunt's 1782–1793 machine](https://collection.sciencemuseumgroup.org.uk/objects/co6818), with simplified mechanism and an original console; this is distinct from ECT. |
| Apothecary cabinet | Ground R7, apothecary/medicine room | Open framed shelves with 21 labelled medicine bottles/pots, drawers, balance, paper and individual pills. [Early medicine chest](https://collection.sciencemuseumgroup.org.uk/objects/co197720/laudanum-bottles-c-19th-century-medicine-chests) supplies references for stoppered bottles, scales and laudanum/poison labels; stock is illustrative rather than a recorded Chester inventory. |
| Leech and cupping set | On the dispensing table in ground R7 | Lidded glass leech jar with dark leech shapes, open felt-lined case, cupping glasses, brass scarificator and lancet. References: [1820–1860 pharmacy leech jar](https://collection.sciencemuseumgroup.org.uk/objects/co80761/pharmacy-leech-jar) and [1801–1844 cupping set](https://collection.sciencemuseumgroup.org.uk/objects/co140023). |
| ECT trolley | Ground R8, later-era ECT treatment | Wheeled trolley, open timber instrument box, analogue meter, controls, coiled leads and separate electrodes; an existing bed and medicine cupboard complete the room. Inspired by a [British 1940–1945 ECT machine](https://collection.sciencemuseumgroup.org.uk/objects/co531731/electroconvulsive-therapy-machine). ECT began in 1938; this prop represents a later period. |

The electrical apparatus's interpretive label now has a dark timber backing,
sits below and just forward of the tabletop edge, and clears the drawer knob,
which is offset to the left. The plaque is a readability adjustment to the
original game console. This adds twelve triangles to the earlier model count
below, for 28,352 without runtime label textures, within the same bounds.

Each requested model appears exactly once and stays fixed across new games.
Six freestanding models contribute to the shared walking, navigation and sight
records. The decorative leech/cupping set rests on its table without a second
walking obstacle. Other medicine/nursing cupboards remain in the existing
rooms, including the basement medicine store. The new meshes total 28,340
triangles without label textures; text replaces flat paper geometry at runtime.
Their actual aggregate dimensions match the furniture catalog's footprints
and heights. Doorways, windows, room centres, stairs and exits remain clear.

All additions use the shared furniture library in Escape and Explore. They are
procedural browser sources; no imported museum images, third-party medical
meshes or additional asset downloads are required. The furnished SVG plans
below include these additions. Browser render evidence is under
`Browser/artifacts/room-furniture/`, including `model-hydroBath.png`,
`model-hydroShower.png`, `model-operatingTable.png`, `model-electrotherapy.png`,
`model-apothecary.png`, `model-bloodletting.png` and `model-ectMachine.png`.
The [seven-model review sheet](../../Browser/artifacts/room-furniture/medical-gallery.png)
shows all additions and room assignments together; regenerate it with
`node Browser/capture-medical-gallery.mjs` after capturing the browser views.

Run `node Browser/test-medical-furniture.mjs` for model, placement and support
checks, or `npm run test:furniture` from Browser for the complete furniture
checks and desktop/mobile rendering. Validation outcomes belong in
`DEVELOPMENT.md`. The compiled aerial model excludes these interior sources;
Unity, Blender and packaged desktop/Android exports are not regenerated.

The owner requested seven matching models, logical room uses and furniture
placement throughout the playable interior. These uses are fictional gameplay
choices, not evidence of the hospital's historical room functions. The reviewed
architectural boundaries in `../1829-interior-proposal/` remain the source of
walls, windows, doors and stairs.

## Seven furniture models, including the owner's replacements

The retained bed, shelves, table and books are Kay Lousberg's
**KayKit Furniture Bits 1.0**, licensed CC0,
from [the original GitHub repository](https://github.com/KayKit-Game-Assets/KayKit-Furniture-Bits-1.0),
pinned to commit `96d5930a8dbdb363409bbc2d3341718b00e17c9c`.
The original asset licence and per-file SHA-256 hashes accompany the local
models in `../../Browser/dist/models/furniture/`. The ten retained source files,
including the licence and shared texture, total 81,564 bytes. The owner rejected
the KayKit chairs and drawer unit; those files are removed from the asset set.

| In-game model | Pack source | Adaptation |
| --- | --- | --- |
| Single bed | KayKit `bed_single_A` | 1.326 × 2.730 footprint, 1.196 high: exactly 130% of all previous dimensions |
| Windsor chair | ShopPrentice `windsor_chair.py` | .624 × .611 footprint, 1.17 high; 130% of the previous dimensions |
| Bookcase | `shelf_B_large` | Four shelves, matching timber case and the pack's books; 1.875 × .570 footprint, 2.850 high: 150% of the previous complete assembly |
| Rectangular wardrobe | Original procedural model | 1.50 × .65 footprint, 2.850 high to match the bookcases; replaces all Shaker/medical cupboard instances |
| Work table | `table_medium` | 1.95 × 1.066 footprint, .988 high; 130% of the previous dimensions |
| Panca bedside bench | Medieval furniture `Panca_50.stp` | .40 × .30 footprint, .45 high; the source is a small seat, not a sideboard |
| Books | `book_set` | .42 × .20 footprint, .27 high; supported by a table or cupboard |

The remaining KayKit glTF files stay intact. The browser normalizes dimensions,
assembles the bookcase and wardrobe, and applies subdued
wood/cloth finishes with fine procedural wear. The wardrobe shares the
dispensary timber/brass finish. The source shelf's bounds include high upright
brackets: book placement now probes the horizontal board itself. Book bottoms
are .003 above surfaces at .3225, .9525, 1.5825 and 2.2125 in the 150% assembled
case. The shelves, books and frame scale together, and placement, walking and
navigation use the enlarged catalog dimensions.

### Windsor chair and Shaker nightstand: MIT

[ShopPrentice](https://github.com/ShopPrentice/shopprentice) is pinned to
`d670906ae258a80eefe9ec65d5cccffe67d2f1fb`. Original Fusion scripts, readmes,
parameter records, reference renders and MIT notice are retained under
`sources/shopprentice/`. These are CAD scripts, rather than mesh downloads.
`../../Browser/build-furniture-designs.mjs` makes visible-surface game
adaptations, not direct Fusion exports. The chair retains a rounded tapered
seat with shallow scoops, four splayed/raked tapered legs, H stretchers, seven
back spindles and a curved crest. The nightstand retains full side panels,
tapered feet, two dark-knobbed drawers, an open lower shelf and an overhanging
top. Hidden dovetail/tenon construction and manufacturing timelines are omitted.
The original MIT notice accompanies the meshes as `ShopPrentice-MIT.txt`.
The nightstand adaptation is retained as an archived asset, superseded in play
by the procedural wardrobe. Run `npm run build:furniture` from Browser to
regenerate the Windsor and archived Shaker meshes.

### Panca bench: GPL-3.0

[Medieval furniture](https://github.com/Compagnia-d-Arme-del-Santo-Luca/medieval_furniture)
is pinned to `081fd0bc28486aff01fa4dde2d64227809a7ac01`. The exact six-solid
`Panca_50.stp` assembly is tessellated by `../../Browser/convert-panca.py` using
FreeCAD, with .5 mm chord tolerance, millimetres converted to metres and Z-up
converted to Y-up. Its source bounds are 400 × 300 × 450 mm. All six parts,
including the two wedges and pierced crossboard, are retained. The mesh and
converter retain GPL-3.0; the original licence is `Panca-GPL-3.0.txt`.
`panca-source.zip` is distributed beside the mesh and contains the editable
STEP, converter and original licence. To rebuild it, run the converter with
FreeCAD's Python, then the furniture builder to refresh asset hashes. Original
licences and sources are tracked separately from the other asset licences.

## Room-use plan

`../../Browser/dist/asylum-room-uses.mjs` assigns every room explicitly by floor.
The notebook records these uses when the player visits the rooms. The following
groupings explain the intended circulation and organisation.

| Level / area | Uses |
| --- | --- |
| Ground, beside Reception | R23 admissions; R25 consultation; R26 staff office |
| Ground, central rear arm | R6/R8 treatment; R7 medicines; R9 consultation; R10 records; R11 nursing |
| Ground, outer rear arms | R1/R12 treatment; R2/R13 dormitory wards; R3/R14 nursing; R4/R15 day rooms; R5/R16 linen |
| Ground, west cross range | R19 reading; R20 dining; R22 activities; R17/R39 stores; R18/R21 quiet sitting |
| Ground, east cross range | R27 day room; R28 dining; R29 treatment; R30 staff sitting; R31 quiet window bay |
| Ground, forward wings | R32/R36 dormitories; R33/R35 nursing; R34/R38 reading; R37 quiet sitting |
| First, central rear arm | R6/R8/R10 dormitories, sixteen beds each; paired former R7/R9/R11 rooms are absorbed |
| First, outer rear arms | R1/R3/R12/R14 bedrooms; R2/R13 wards; R4/R15 day rooms; R5/R16 linen |
| First, cross range | R19/R28/R29 bedrooms; R20/R22/R27 wards; R23/R25 nursing; R26 staff sitting; R30 staff bedroom; R17 store; R18/R21/R31 quiet areas |
| First, forward wings | R32/R36 wards; R33/R35 day rooms; R34 quiet sitting; R37 reading |
| Basement | B1/B11 stores; B2 linen; B3/B10 maintenance; B4/B12 records; B5–B8 padded confinement cells |
| Second | R43 staff sitting; R41 records office; R42 staff office; R44 archive/stores; R45 linen |
| Kept clear | R24 stair hall on both levels; B9 stair lobby; ground R40 entrance porch |

The eight small libraries listed above replace their earlier quiet sitting
uses with fitted, stocked shelves. Corridors, stair wells, landings,
outside-door approaches and room centres retain their walking space.

## Placement and variation

Beds, storage and main tables have stable, room-specific locations. Wardrobes
use safe wall positions. Panca benches prefer bedside positions in bedrooms
and dormitories, then safe wall positions if the bedside is obstructed. Windsor seats are
placed at tables where clearance permits. Roughly three quarters of placed
items remain fixed; a new escape game varies spare chairs, small benches and supported
books among checked positions. Each floor/room has a deterministic random
stream, so changing one room does not shuffle the whole building. Explore uses
the repeatable seed 1829. Pausing, returning to rooms and floor transitions do
not reroll furniture.

Visible instances, circle/rotated-rectangle collision, NPC navigation cells,
safe spawn selection and eye-height visibility all use the same placement
records. Regeneration replaces the furniture index and navigation overlay
before resetting actors. Tall bookcases and wardrobes obstruct sight;
low furniture does not hide a standing player. Artwork avoids tall storage.

## Review and validation

- [Ground floor](ground-floor.svg)
- [First floor](first-floor.svg)
- [Basement](basement.svg)
- [Second floor](second-floor.svg)

Run `node Browser/draw-furnishings.mjs` to refresh these illustrative drawings.
Run `npm run test:furniture` from Browser for source licence/hash verification,
seed/collision/navigation checks and Escape/Explore desktop/mobile rendering.
Browser screenshots and validation are under `Browser/artifacts/room-furniture/`.
Neutral model previews are `model-chair.png`, `model-cupboard.png`,
`model-bench.png`, `model-bookcase.png` and `model-bed.png`. Browser checks compare
actual geometry dimensions with collision footprints and cast rays from actual
book vertices to their supporting shelf surfaces.

Only browser furnishings, room-use metadata and movement/sight integration are
updated. Unity, Blender and packaged desktop/Android exports are not regenerated.
The aerial compiled model does not contain this interior; its source hash
remains current and requires no rebuild for these furnishings.
