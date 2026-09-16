# Modern road overlay and aerial layouts

Source: [shared 1829 Google Earth project](https://earth.google.com/earth/d/1jXu49Oe3iXWoHLAS1GdS8lUhKcpg8cUk?usp=sharing), retrieved 15–16 September 2026 from the public viewer's `document/getmapdata` response.

| Custom path name in Earth | Saved vertices |
| --- | ---: |
| Upton grange | 12 |
| Gerrard Crescent | 10 |
| Frost drive | 9 |
| Vivienne Smith Lane | 14 |
| Ross Avenue | 2 |
| Ross Avenue (Part 2) | 7 |
| Upton Grange (Part2) | 19 |
| Lockwood View | 6 |
| Warren Lane | 15 |
| Parsons Lane | 9 |
| Parsons Lane (Upton Lea) | 7 |
| Parsons Lane (1829 Central) | 6 |
| Valley drive | 8 |
| Parsons Lane (North) | 27 |
| Caldecott Close | 8 |

The four additional paths were fetched from the same live project. All four pre-existing paths were checked against the fresh response and remain unchanged. The Upton extension is saved as `Upton Grange (Part2)`; its displayed name is normalised to `Upton Grange (Part 2)`, with `sourceName` retaining the exact original spelling. The subsequent Warren Lane import adds 15 vertices; that import brought the total to nine paths and 94 vertices. The Parsons Lane and Valley drive import adds 30 vertices, bringing the total then to thirteen paths and 124 vertices. The North section adds 27 vertices, for fourteen paths and 151 vertices.

`Browser/dist/modern-road-data.mjs` retains the original feature geometry coordinates as latitude/longitude pairs, in source order. Camera/view targets are not used. `earth-registration.mjs` uses exactly the same fixed 1829 anchor and approximate metre/axis registration documented in `landmark-placement.md`. The modern roads therefore use the same alignment as the church, water tower and Seren Lodge/Churton correction. No buildings were repositioned for these layers.

Roads are flat asphalt overlays with pale edges, round joins and ends. Each asphalt strip is an estimated six scene units wide, with a 7.2-unit edge. The map defines centrelines, not measured widths or carriageway boundaries. Heights of 0.32–0.34 keep the overlay above the shared ground and drive surfaces. Paths remain open; no missing segments, traffic markings or extra roads have been invented. Saved path overlap, including Frost drive and Vivienne Smith Lane, is preserved.

The aerial-only layout controller groups existing objects without cloning or changing their transforms. Historic contains the Annexe (including its grounds), Main/admin (including its grounds), the connecting corridor and chimney. Modern contains the imported roads other than Vivienne Smith Lane and the four Parsons Lane sections. The single road collection is under the shared group, with individual visibility rules; Vivienne Smith Lane and all four Parsons Lane sections are enabled by Historic OR Modern. The shared group retains 1829, Redesmere, water tower, Churton, chapel, and existing surrounding site context. Shared content uses Historic OR Modern visibility, so both toggles on do not double-render shared buildings and both off leave terrain only. The planter group keeps its own visibility preference inside the shared group. The game and walking pages do not opt into this controller.

The initial state is Historic on / Modern off on each page load. Checkbox changes preserve the camera for comparison. Fit layouts frames the visible layers, excludes the background terrain and accommodates narrow screens; it is disabled when both layers are off. Reset view and the escape pan retain the chosen visibility state. New tests cover the four states, original world transforms, source vertices, road normals and elevation, full framing, and checkbox binding. The browser UI was additionally checked with real checkbox and keyboard interaction.


## Road-name labels

All fifteen paths carry their own camera-facing text sprite, created once from a local canvas texture. The full path name, including Part 2 where applicable, is retained. Text is light with a dark outline, stays at a fixed readable screen size, and follows its road’s visibility rule (both layouts for Vivienne Smith Lane and the four Parsons Lane sections; Modern for the other roads). Label anchor candidates are sampled along the saved centreline, one unit above ground. Shorter paths get first choice; the remaining labels choose a clear position along their own road, or the least-overlapping position when the view is crowded. Paths outside the camera view do not show floating labels at the screen edge. The road geometry and road widths are unaffected by labelling.

Checks cover one text label per path, label anchors on their respective polylines, inherited Modern visibility, and consistent screen size across desktop/mobile viewports. The actual aerial page was also rendered and visually checked on desktop and mobile.


## Revised front boundary and lane entrance

The user-marked aerial frontage image (codex-clipboard-b7831218-93ad-4aaf-b863-3a2e1ce10655.png) locates the boundary roughly 18 scene units beyond its previous line. The wall group is translated from z=49 to z=67 with no rotation; its masonry dimensions, end piers and gate opening are retained. Hedge continuations follow the same line. The old full-width gravel drive at z=59 and narrow strip at z=51 are removed; new lawn covers the former forecourt edge and the central 3.2-unit path extends to the gate.

The circled satellite junction (codex-clipboard-570e3550-0ece-4adf-aa34-ea989b30c2a5.png) guides a flared entrance in Modern. The 3.2-unit gate approach opens through two cubic curves to a mouth between x=-17 and x=17 on Vivienne Smith Lane. Its asphalt overlaps the unchanged lane centreline; kerbs end at the lane's near edge. The junction follows the slight bend in the original path near x=0 rather than shifting or straightening the lane. Widths and curves are visual estimates.

The modern-road-data.mjs SHA-256 remains 6914FFD182790FE9F8EF26A3034CE3DED7D479D3597F168019569DFE8C699D3E across this change. The entrance is a separate Modern child, not a ninth imported path. Checks cover wall translation, updated collisions, removal of the old gravel, continuous surfaces through the gate, upward-facing kerbs, and their joins to the fixed lane.


## Warren Lane and shared Vivienne Smith Lane

Warren Lane was imported from the live shared Google Earth project, preserving all 15 saved vertices and adding its road-name label. The eight existing road coordinate arrays were verified unchanged against the fresh project response. Vivienne Smith Lane now appears in Historic and Modern, with one copy of its geometry and label. It hides when both layouts are off. The curved Reception entrance remains Modern-only. Camera fitting and label placement ignore hidden roads, so Historic does not frame or label the Modern-only network. The earlier data checksum above records the entrance-change snapshot and predates this import.

## Parsons Lane and Valley drive import

The four requested paths were retrieved from the live public Google Earth viewer on 15 September 2026. Parsons Lane retains 9 vertices, Parsons Lane (Upton Lea) 7, Parsons Lane (1829 Central) 6, and Valley drive 8. Names retain the source capitalization. Only the feature line geometry was decoded; saved camera targets were excluded. All nine existing coordinate arrays were checked against the same response and match exactly.

The new paths use the existing fixed 1829 registration, approximate road widths, automatic road-name labels and Modern visibility rule. Expand **13 mapped paths** to see the complete list and use **Fit layouts** to frame the network.


## Parsons Lane (North) import — 16 September 2026

The North path was read from the same live public Google Earth project. All 27 feature line vertices are retained in their saved order and precision; camera targets are excluded. All thirteen previously imported coordinate arrays were compared with the fresh response and match exactly. The road uses the fixed 1829 registration and existing grey asphalt, pale borders, rounded joins and automatic road-name label.

Its single road and label appear whenever Historic or Modern is enabled, and hide when both are off. Fit layouts includes the entire North route in either layout. The list now shows **14 mapped paths**, with 151 saved vertices in total.

## Parsons Lane crossing cleanup

The two photo-estimated annexe east roads now stop just short of Parsons Lane (North). Their unsupported continuations beyond the saved route are removed, with clearance for both roads’ asphalt, pale borders and rounded ends. All Google Earth paths and their coordinates are retained.

## Caldecott Close import — 16 September 2026

Caldecott Close was retrieved from the same live public Google Earth project's `document/getmapdata` response (feature `044C7547BE41E13B7457`). All eight polyline vertices retain their saved order and precision; camera coordinates are excluded. All fourteen existing paths were verified against the fresh response and remain unchanged. The total is now fifteen paths and 159 saved vertices.

The road uses the fixed 1829 registration, existing asphalt and pale borders, rounded joins and ends, and an automatic road-name label. Its geometry and label appear only when Modern is enabled, in both aerial and walking views. The aerial list shows **15 mapped paths**, including Caldecott Close, and **Fit layouts** includes its complete route.
