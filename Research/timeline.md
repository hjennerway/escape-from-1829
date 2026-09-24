# Estate timeline — 18 September 2026

Source: the owner's [Google Sheet](https://docs.google.com/spreadsheets/d/107LEc_YgAiATltfdQCZUXCjegXZBKlWfY2cmn6vOl44/edit), tabs **Ward dates** and **Periods**, read on 18 September 2026. `Browser/dist/estate-periods.mjs` contains the complete local snapshot: 22 date rows and 12 period rows. Whitespace around section names is trimmed; titles and descriptions retain their source wording. The site uses this bundled snapshot and does not fetch the sheet on each visit.

The owner subsequently added **1829 — Opening**, with the exact description **Cheshire Lunatic Asylum opens August 1829**, and identified its building sections in a red-outlined plan ([opening reference](timeline-opening.png)). This explicit correction supplements the sheet snapshot. The stops are now **1829, 1849, 1856, 1860, 1870, 1896, 1912, 1915, 1916, 1938, 2010, 2016 and 2021**. These are discrete snapshots, spaced equally on the control. Construction is inclusive (`year >= Built`); demolition is exclusive (`year < Demolished`). A blank demolition date means the section persists at every later stop.

## Model and source matches

| Sheet section | Model or site feature | Visible stops |
| --- | --- | --- |
| 1829 (1829–) | Marked central frontage, both three-bay entrance projections, reception and all three rear ranges, including original portions of the later west/east ward areas | All |
| 1829 Wings (1849–) | Outer west additions, forward north/south arms, and the circled east pavilions/frontage | 1849 onward |
| Valley drive (1829–) | Valley drive path | All |
| Parsons lane (1829–) | All four Parsons Lane paths, including Upton Lea, 1829 Central and North | All |
| Vivienne Smith lane (1829–) | Main lane and reception approach | All |
| The Willows (1829–) | The Willows | All |
| Church (1856–) | Chapel and church grounds | 1856 onward |
| Upton Lea (1860–) | Upton/Oscroft/Frith detached ward model | 1860 onward |
| Redesmere (1870–) | Redesmere/Saughall, Barmere, and outer east extensions beyond the original rear range and forward arm | 1870 onward |
| The Main (1896–2005) | Main/Admin and the associated ward/service estate listed below | 1896, 1912, 1915, 1916, 1938 |
| Kelsall (1912–) | Churton/Kelsall/Seren Lodge | 1912 onward |
| Annexe (1915–2009) | Annexe central buildings and all five ward groups | 1915, 1916, 1938 |
| Upton Dene Phase 1 (2010–) | Phase 1 context and Caldecott Close, from the period description | 2010, 2016, 2021 |
| Warren Lane (2010–) | Warren Lane path | 2010, 2016, 2021 |
| Upton Grange (2010–) | Upton grange and Upton Grange (Part 2) paths | 2010, 2016, 2021 |
| Upton Dene Phase 2 (2016–) | Phase 2 roads; no housing/care-home model | 2016, 2021 |
| Ross Avenue (2016–) | Ross Avenue and Ross Avenue (Part 2) | 2016, 2021 |
| Lockwood View (2016–) | Lockwood View path | 2016, 2021 |
| Upton Dene Phase 3 (2021–) | Phase 3 roads; no housing model | 2021 |
| Gerrard Crescent (2021–) | Gerrard Crescent path | 2021 |
| Frost Drive (2021–) | Frost drive path | 2021 |
| Sydney Close (2021–) | No geometry currently available | 2021, once modelled |

The **Main** group includes Irby/Ashley, Grafton/Edge, Hale/Daresbury, Huxley/Dunham, Farndon, Witby, Main kitchen, the connecting ward corridors, Estates, Stores, tower service buildings/workshops/pharmacy, the freestanding chimney, Hospital Shop, garages, mortuary, greenhouses and bowling green. These are provisional section-level dates: the sheet does not give separate construction/demolition dates for those structures. In particular, this is not evidence that every service structure was demolished in 2005.

The **Annexe** match includes Larkton/Jodrell, Tarvin/Jarman, Leighton/Newton, Oakmere, Picton/Carden, associated grounds and annexe-named historic road surfaces. The grouped model follows 1915–2009 throughout.

## Explicit assumptions and gaps

- Ross Avenue has a **2016** build date, although the **2010** period description lists it. The build-date row takes precedence for visibility. The description is preserved, with a short explanation at the 2010 stop.
- The owner's red outline supersedes the first timeline's assumption that every part east of x=22 dates from 1870. The original central frontage and its three rear ranges appear in 1829. Original side ranges are separated at their outer joints (approximately x=±38) and the frontage/forward-arm joint (z=17.3); the projecting reception remains included. The outer west and forward arms follow in 1849; the second marked view below also assigns the adjoining east pavilions to 1849. Continuous meshes and box instances are split with their vertex attributes and clipped collision footprints retained. This reveals the existing model in stages; it does not reconstruct historically different finishes or internal layouts. Photo selection outlines include only the parts built in the selected period, even where one later ward spans multiple dates.
- Upton/Oscroft/Frith is the model associated with Upton Lea. The supplied source names do not provide a finer division of its blocks.
- The owner explicitly corrected the water tower to **1829 onward**. This replaces the earlier provisional 1896 assignment; it is visible at every stop.
- A second [marked view](timeline-1849.png) assigns the entire circled east frontage, forward arm and adjoining east/garden pavilions to **1849**. This supersedes the first split at x=41.4: the 1849 section now extends to the gap before Barmere (x=75, south of the rear cross-range boundary z=-29). Barmere and the Redesmere/Saughall rear cross range remain dated 1870.
- The subsequent [circled passage detail](timeline-passage-1870.png) assigns the connecting masonry head between the east garden pavilion and Redesmere to **1870 onward**. Its complete lintel, coping, white trim and supporting jambs follow Redesmere together, overriding the spatial split at x=75 that previously exposed half the head in 1849. The adjoining pavilion remains dated 1849.
- The owner's later [paired entrance projection correction](timeline-entrance-projections.png) assigns both three-bay projections immediately beside Reception to **1829 onward**. This supersedes the earlier 1849 assignment for these two parts of the frontage. The opening footprint extends to z=20.15 between x=−32.5 and x=32.5, retaining their full masonry, white lower storeys, doors, glazing, cornices and slate overhangs. The lower forward arms and farther east/garden pavilions retain their 1849 dates; the temporary east closing wall remains in place at opening.
- The undated Outhouse, original inner courtyards and Reception approach remain at all stops. The owner's subsequent ground-surface correction makes gravel, paving, edging and raised lawn patches around later 1829 wings follow the same section boundaries and dates as their buildings. The complete sweeping branches from Reception wait for the forward wings in 1849. Before construction, these surfaces disappear to expose the existing terrain, with its original grass colour, texture and world scale; removing raised lawns also prevents residual footprint outlines. General landscaping and mature trees provide site context across the timeline, not period-specific planting evidence. Tree preference remains independent of the date slider.
- The owner's [blue-circled lawn correction](timeline-lawn-items.png) removes the lighting column at x=22, z=43 and the two small iron ground fittings at x=10, z=32.5/39 from **every period**. The column, arm and lamp are omitted from the shared browser builder, and the east entrance mirror omits those two fittings. This is an explicit removal request, not a revised construction date; the western fittings and separate Redesmere approach light are outside the marked area.
- The communications mast and equipment, Countess roundabout, modern car park and Vivienne Smith Lane eastern continuation are provisionally assigned to the first modern stop, 2010. Their exact construction dates are not supplied. The car park's replaced trees disappear from that stop.
- Historic road and ground surfaces follow their named estate section: Annexe-named surfaces from 1915 to 2009, Churton-named surfaces from 1912 onward, and other historic service surfaces with the Main from 1896 to 2005. Ground remains visible when later surfaces disappear. Road materials and present model alignments are retained; no claim is made that asphalt or road names are authentic to the early periods.
- **Isolation hospital (1916)** and **Nurses home (1938)** have stops/descriptions but no distinct model. Their stops do not introduce substitute buildings. The UI says they are not yet modelled.
- Housing for all three Upton Dene phases, the care home and Sydney Close lack geometry in the current site. Available roads are dated, and the relevant stops disclose the missing models. There is no invented road route or building footprint.

The owner's [circled opening-period wall](timeline-opening-wall.png) requests a
closed east end when **1829** is selected. The exposed cuts at x=38 and z=17.3
now have brick masonry, a pale plinth and cornice, and infill following the
existing slate roof. This is a visual closure of the staged model, not new
evidence for a historic window arrangement. Its dedicated section is present
from 1829 until the 1849 wing replaces it, with matching walking collision.

## Runtime coverage

All 34 entries in the building photo catalog and all 15 mapped roads have explicit section mappings. Nested geometry, windows, labels, photographs, grounds and collisions inherit their host's effective period. Terrain and general landscape context persist. Locations outside the selected period are hidden from the location menu, and hidden buildings cannot be selected through the map or the photo picker.

The slider appears in aerial and exterior walking views. It defaults to 1916, as requested by the owner, retains the camera when changed, and keeps the selected year in `?period=YEAR`. Location links and aerial/walking links carry that year. Arrow keys, Home/End and previous/next buttons provide keyboard access. T still toggles trees while the slider has focus.

Period groups are created before window-detail processing and material batching. Nothing is moved or rebatched during a period switch; switching toggles dated ancestors, invalidates shadows, and refreshes walking obstacles. The compiled binary preserves those groups and date tags and reattaches the same controller after loading. Older binaries without timeline grouping fall back to source construction.

This changes the browser views and their locally regenerated compiled model. The escape game, Unity project and Blender exports retain their existing representations.

## 1912 road continuity correction - 24 September 2026

The owner's [red/blue annotation](historic-roads/1912-road-correction-marked.png)
removes the two later annexe access stubs from 1912 and restores the through-road
between Vivienne Smith Lane, the Main/admin east drive and Parsons Lane (North).
This supersedes name-only dating for these three surfaces. The Annexe inner east
road follows The Main (1896-2005); the Parsons Lane southern fork and Admin
teardrop outer lawn sweep, including their borders, follow the Annexe (1915-2009).
These dates extend the correction consistently through the existing section
rules; the annotation itself supplies no additional construction dates.

The restored eastern route also needs an open junction over the clipping gap at
Parsons Lane. Its local asphalt and border follow the existing six-unit road and
0.6-unit kerb; the saved lane vertices are retained. Period groups remain created
before batching. Timeline version 4 rejects older compiled road assignments.
Browser source and compiled aerial assets change; Unity/Blender exports do not.

## Rear annexe roads and Oakmere court — 24 September 2026

The owner's [blue-road/yellow-paving annotation](historic-roads/annexe-rear-network-marked.png)
adds four connected rear roads and paving up to Oakmere's walls. These additions,
including all new borders, appear only at 1915, 1916 and 1938, following the
Annexe section. This explicit request supersedes the older removed-rear-road
assumption for the marked areas. Existing through-road dates are unchanged.

## Red-circled entrance objects � 24 September 2026

The subsequent marked screenshot removes the remaining west ground fittings at
x=-10, z=32.5/39 and the bare east verge sapling at x=59, z=46.3, including
its seven branches, in every period. This supersedes the earlier retention of
the western fittings. The surrounding hedge and paving remain.
