# Room furnishings — 3 October 2026

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
| First, rear arms | R1/R3/R6/R8/R12/R14 bedrooms; R2/R7/R9/R13 wards; R4/R15 day rooms; R5/R11/R16 linen; R10 nursing |
| First, cross range | R19/R28/R29 bedrooms; R20/R22/R27 wards; R23/R25 nursing; R26 staff sitting; R30 staff bedroom; R17 store; R18/R21/R31 quiet areas |
| First, forward wings | R32/R36 wards; R33/R35 day rooms; R34 quiet sitting; R37 reading |
| Basement | B1/B5/B8/B11 stores; B2 linen; B3/B7/B10 maintenance; B4/B12 records; B6 medicines |
| Second | R41 records; R42 staff office |
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
