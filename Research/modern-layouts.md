# Modern road overlay and aerial layouts

Source: [shared 1829 Google Earth project](https://earth.google.com/earth/d/1jXu49Oe3iXWoHLAS1GdS8lUhKcpg8cUk?usp=sharing), retrieved 15 September 2026 from the public viewer's `document/getmapdata` response.

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

The four additional paths were fetched from the same live project. All four pre-existing paths were checked against the fresh response and remain unchanged. The Upton extension is saved as `Upton Grange (Part2)`; its displayed name is normalised to `Upton Grange (Part 2)`, with `sourceName` retaining the exact original spelling. The subsequent Warren Lane import adds 15 vertices; there are now nine paths and 94 vertices.

`Browser/dist/modern-road-data.mjs` retains the original feature geometry coordinates as latitude/longitude pairs, in source order. Camera/view targets are not used. `earth-registration.mjs` uses exactly the same fixed 1829 anchor and approximate metre/axis registration documented in `landmark-placement.md`. The modern roads therefore use the same alignment as the church, water tower and Seren Lodge/Churton correction. No buildings were repositioned for these layers.

Roads are flat asphalt overlays with pale edges, round joins and ends. Each asphalt strip is an estimated six scene units wide, with a 7.2-unit edge. The map defines centrelines, not measured widths or carriageway boundaries. Heights of 0.32–0.34 keep the overlay above the shared ground and drive surfaces. Paths remain open; no missing segments, traffic markings or extra roads have been invented. Saved path overlap, including Frost drive and Vivienne Smith Lane, is preserved.

The aerial-only layout controller groups existing objects without cloning or changing their transforms. Historic contains the Annexe (including its grounds), Main/admin (including its grounds), the connecting corridor and chimney. Modern contains the imported roads other than Vivienne Smith Lane. The single road collection is under the shared group, with individual visibility rules; Vivienne Smith Lane is enabled by Historic OR Modern. The shared group retains 1829, Redesmere, water tower, Churton, chapel, and existing surrounding site context. Shared content uses Historic OR Modern visibility, so both toggles on do not double-render shared buildings and both off leave terrain only. The planter group keeps its own visibility preference inside the shared group. The game and walking pages do not opt into this controller.

The initial state is Historic on / Modern off on each page load. Checkbox changes preserve the camera for comparison. Fit layouts frames the visible layers, excludes the background terrain and accommodates narrow screens; it is disabled when both layers are off. Reset view and the escape pan retain the chosen visibility state. New tests cover the four states, original world transforms, source vertices, road normals and elevation, full framing, and checkbox binding. The browser UI was additionally checked with real checkbox and keyboard interaction.


## Road-name labels

All nine paths carry their own camera-facing text sprite, created once from a local canvas texture. The full path name, including Part 2 where applicable, is retained. Text is light with a dark outline, stays at a fixed readable screen size, and follows its road’s visibility rule (both layouts for Vivienne Smith Lane; Modern for the other roads). Label anchor candidates are sampled along the saved centreline, one unit above ground. Shorter paths get first choice; the remaining labels choose a clear position along their own road, or the least-overlapping position when the view is crowded. Paths outside the camera view do not show floating labels at the screen edge. The road geometry and road widths are unaffected by labelling.

Checks cover one text label per path, label anchors on their respective polylines, inherited Modern visibility, and consistent screen size across desktop/mobile viewports. The actual aerial page was also rendered and visually checked on desktop and mobile.


## Revised front boundary and lane entrance

The user-marked aerial frontage image (codex-clipboard-b7831218-93ad-4aaf-b863-3a2e1ce10655.png) locates the boundary roughly 18 scene units beyond its previous line. The wall group is translated from z=49 to z=67 with no rotation; its masonry dimensions, end piers and gate opening are retained. Hedge continuations follow the same line. The old full-width gravel drive at z=59 and narrow strip at z=51 are removed; new lawn covers the former forecourt edge and the central 3.2-unit path extends to the gate.

The circled satellite junction (codex-clipboard-570e3550-0ece-4adf-aa34-ea989b30c2a5.png) guides a flared entrance in Modern. The 3.2-unit gate approach opens through two cubic curves to a mouth between x=-17 and x=17 on Vivienne Smith Lane. Its asphalt overlaps the unchanged lane centreline; kerbs end at the lane's near edge. The junction follows the slight bend in the original path near x=0 rather than shifting or straightening the lane. Widths and curves are visual estimates.

The modern-road-data.mjs SHA-256 remains 6914FFD182790FE9F8EF26A3034CE3DED7D479D3597F168019569DFE8C699D3E across this change. The entrance is a separate Modern child, not a ninth imported path. Checks cover wall translation, updated collisions, removal of the old gravel, continuous surfaces through the gate, upward-facing kerbs, and their joins to the fixed lane.


## Warren Lane and shared Vivienne Smith Lane

Warren Lane was imported from the live shared Google Earth project, preserving all 15 saved vertices and adding its road-name label. The eight existing road coordinate arrays were verified unchanged against the fresh project response. Vivienne Smith Lane now appears in Historic and Modern, with one copy of its geometry and label. It hides when both layouts are off. The curved Reception entrance remains Modern-only. Camera fitting and label placement ignore hidden roads, so Historic does not frame or label the Modern-only network. The earlier data checksum above records the entrance-change snapshot and predates this import.
