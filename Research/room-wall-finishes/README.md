# Victorian room wall finishes — 4 October 2026

## Padded-cell exception — 5 October 2026

The owner's confirmed B5–B8 confinement cells supersede the basement-store
and workshop finishes below. These four rooms use quilted canvas wall and
floor padding instead of wallpaper, lower paint and dado rails. A single
padding batch follows the actual exposed masonry faces, leaving full window
frames, door surrounds and open leaves clear. The corridor side of every
partition retains its original masonry. Panel dimensions, mattress choices
and review evidence are recorded in [the furnishing notes](../room-furnishings/README.md).

The owner requests the existing two-tone corridor brickwork be retained,
with a Victorian dado rail, slightly distressed white/cream paint over the
bottom 40% of bedroom, dormitory and other non-treatment room walls, and
repeating wallpaper above. The supplied [floral damask reference](wallpaper-reference.jpg)
guides the original botanical ornament; the pattern is similar rather than
a reproduction. These are owner-directed gameplay finishes, not a claim
about the asylum's documented decoration.

The three room palettes are dusty rose, sage and faded blue, assigned
deterministically by room number and floor. A single neutral 512px canvas
damask tile is tinted at render time. A second shared 512px cream paint tile
adds restrained worn marks and stains. Treatment rooms (hydrotherapy, cold
water, surgery, ECT and early electrical treatment), corridors, stair halls,
the basement stair lobby and entrance porch retain their masonry. Other
enclosed rooms, including stores, offices and basement workshops, use the
new finish. Room uses come from `../../Browser/dist/asylum-room-uses.mjs`.

The owner's follow-up asks for less bright, more muted and distressed paper.
The three tints now use rose `#b29993`, sage `#969f8f` and blue `#8593a4`.
The same floral ornament and repeat scale are retained, with a duller warm
paper ground and softer ink contrast. Deterministic, softly blended stains,
rubbed ink patches and small scuffs age the shared tile; the marks wrap over
its edges so repeated walls remain seamless. The cream lower paint is unchanged.

The moulded rail centres at 1.52m on the 3.8m storeys and 1.16m in the 2.9m
basement, projects 35mm and has a 104mm stepped profile. Those dimensions
are modelling choices. The existing dark skirting is retained. Room-facing
wall surfaces are classified separately from corridor-facing and adjacent
treatment-room surfaces, including long exterior runs crossing multiple
rooms and angled bay faces. Rails follow exposed masonry at their height,
stop at doors and windows, and have mitred corners. The Grindley basement
mural is still composited after the wall finishes.

`../../Browser/dist/asylum-room-finishes.mjs` adds finish attributes to the
existing Brick/Plaster batches and merges each floor's rails into one mesh.
There are no wallpaper overlays or separate textures per room/colour.
Walking walls, furniture, door poses and the reviewed plan are unchanged.
Sources are shared by Escape and Explore. The aerial compiler excludes
these interiors; Unity, Blender and packaged exports are not regenerated.

Run `npm run test:room-finishes` from `../../Browser`. Review images and
validation are in `../../Browser/artifacts/room-finishes/`; complete-suite
results are recorded in `../../DEVELOPMENT.md`.

## Window frame clearance correction — 4 October 2026

The owner's [marked window screenshot](window-frame-reference.png) shows a missing timber head and dado
moulding entering both side jambs. Stopping at the glass aperture left the
standard sash's 40mm outer jamb projection unprotected, and rail segments on
the masonry reveals could also reach the frame. Generated windows now have
an 80mm timber head joining their existing jambs and sill. Scheduled basement
and upper-floor sashes retain their complete frames.

Rail runs are clipped against every window's full timber footprint before
corner joints are formed. The exclusion accounts for the rail's 35mm projection,
including perpendicular reveals and 45-degree windows. A 20-micrometre end
clearance covers Float32 mesh rounding. Rails continue beside the casings.
The wall openings, panes, window positions and walking plan are retained.

`npm run test:window-frames` checks every interior sash and captures matching
desktop, phone and exploration views. The geometry check independently probes
heads, jambs and sills from both faces, compares actual timber bounds against
rail triangles, and checks the neighbouring decorated rails. Its two baseline
modes separately reject the original missing head and crossing moulding.
Evidence is in `../../Browser/artifacts/window-frames/`.
