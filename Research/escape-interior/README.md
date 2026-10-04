# Asylum escape interior finishes

## Open room doors (4 October 2026)

The owner's request adds green timber leaves to all 87 enclosed room entrances
on the four browser interior floors. The framed P1 corridor connection and
R40 court porch remain open circulation, without leaves; the Reception stair
hall and open basement end also remain clear. The existing outside doors
retain their fittings and E interactions.

Each leaf swings into its room, hinged toward the closest visible wall at
90 degrees to its doorway. Actual facade returns are used rather than the
slightly offset proposed room envelopes. Equal distances use a stable side.
Seeded room/floor angles vary from 100 to 130 degrees: 0 spans the closed
opening and 180 reverses the leaf along the hinge-side wall. If the desired
swing intersects masonry or skirting, it stops at first contact, including
the timber panels and handle. Eight current leaves have wall-limited angles;
the first-floor R27 return limits its door to about 94.49 degrees.

Walking, navigation, NPC sight and furniture placement share the same poses.
R31 retains two stocked cases, with one on a canted cheek and the other on the
end wall to keep the door and shelf access clear. These are owner-directed
gameplay fittings, not surveyed historic construction. Validation and desktop/
mobile views are in `../../Browser/artifacts/room-doors/` and DEVELOPMENT.md.
Only browser sources and checks change. The aerial compiler excludes these
interiors; Unity, Blender and packaged exports are not regenerated.

## Door-frame corner clearance (3 October 2026)

The owner's ground-floor east-wing view identifies D10's cream surround
extending past the angled wall corner. Its complete interior fitting and
masonry opening now sit at x=31.82, z=15.5, clearing the adjoining wall.
D9 inherits the matching west position at x=-31.82; the basement D11 fitting
moves along its wall to z=-34.48. The exterior door coordinates, destinations
and E interactions retain their established positions.

Outside frames reserve space for their lintel, the adjoining wall thickness
and a small clearance. Jambs cover the masonry returns without sharing a
visible face, and signs follow the fitted door. These are browser construction
corrections to the existing gameplay plan, not new historic measurements.
All 23 outside surrounds and 89 room surrounds pass the rendered support
survey. Validation and captures are in `../../DEVELOPMENT.md` and
`../../Browser/artifacts/door-frame-fit/`. Unity, Blender and packaged exports
were not regenerated; the compiled aerial model excludes this interior.

## Grindley basement mural (2 October 2026)

The owner's [marked view](basement-mural-placement.png) places the supplied
Grindley canal mural on B7's south-facing wall beside the central basement
corridor, opposite the S5 junction stair. The upright attachment is preserved
byte-for-byte at `../../Browser/dist/art/grindley-basement-mural.png`; the
earlier original photograph remains in `../grindley/ward-mural.png`.

The painted area is centred at x=-34.65 on the z=1.39 wall face. Its 2.32-unit
height is 80% of the 2.9-unit room height, leaving 0.29 units above and below.
The source's proportions are retained. A render-time outline excludes the
photographed ceiling and surrounding plaster, with a 0.10-unit inward feather
around the painted edge. The paint blends directly into the basement brick
and plaster materials, retaining masonry relief and the existing lighting.
It adds no projecting frame, collision or additional draw call.

This is the owner's requested gameplay placement, not a surveyed historic
location. Only the browser interior and its local image asset are updated;
the aerial compiler excludes this interior. Unity, Blender and packaged
exports were not regenerated. Validation is recorded in `../../DEVELOPMENT.md`.

## Ceiling and Reception entrance (2 October 2026)

The owner's request reduces the visible ceiling tiling while retaining its
worn plaster appearance. Stains, flakes and cracks now wrap continuously;
blended projections soften repeated patches across all playable floors.

The door behind the Reception starting position is D1, the main entrance.
Its interior now follows the existing exterior red double door: six dark
panels, cream surround and a glazed transom fitted to the interior ceiling.
This supersedes generic emergency fittings at D1 only. Its route to the front
steps and E interaction are retained. These are browser visual adaptations,
not new historical measurements. Validation is in `../../DEVELOPMENT.md` and
comparisons are in `../../Browser/artifacts/ceiling-entrance/`.

## Emergency exit fittings (September 24)

The active exits now have worn green painted leaves, deep metal jamb returns,
dark rebates, three hinges, a projecting panic bar with mounting cases, a
bolted kick plate, grooved threshold and overhead closer. These are visual
game fittings, not a historical reconstruction. Door paint is generated locally
with deterministic brush marks, edge chips and lower scuffs; geometry reuses
the existing material batches on both floors.

Each exit has a framed illuminated green sign with a running-person pictogram,
route number/name and forward arrow, plus a separate PUSH BAR TO OPEN plaque.
The sign and hardware share a corridor-facing coordinate system for north,
south, east and west doors. Existing pooled green lamps supply the lighting.
The five-route random selection, maps, collision cells and hold-E interaction
retain the layout described in `../escape-layout/README.md`.

Only browser runtime sources change. Unity, Blender and GLB exports are not
regenerated; the aerial compiled model does not contain the game interior.

The supplied `main-corridor-reference.png` guides the browser game's interior
finish update of September 18. It shows cream-painted upper brickwork, a red
brick dado with two cream checker courses, red/buff striped arches, barred
sash windows, dark skirting, worn stone slabs, peeling ceilings and long
surface-mounted lights.

`Browser/dist/architecture.mjs` applies these features to both playable floors.
`interior-materials.mjs` generates seeded masonry, stone and ceiling textures
locally and projects them at a fixed building scale so courses remain aligned
across scaled wall sections. Materials and textures are shared between floors;
small details, lights and arch bricks are instanced by material. Curved window
reveals use a shared extruded profile instead of stepped wall strips.

This is a visual adaptation, not a surveyed reconstruction or a claim that
these fittings existed in 1829. Window recesses are sealed decorative openings.
The existing layout, stairs, exits, collision data and pursuer paths remain the
playable plan described in `../escape-layout/README.md`. The shallow passage
jambs fit inside the existing player wall clearance. Wall-art placement excludes
window bays and stair mouths.

The game uses more neutral ambient and fixture light so the cream and red
materials remain visible, with the existing 12-light pool and independent torch.
No extra runtime lights are added for the window recesses. Unity, Blender and
GLB exports are unchanged. The aerial compiled model does not include this
interior and does not require rebuilding for these changes.

Validation: `Browser/test-interior-architecture.mjs` raycasts exposed window
panes in all four wall orientations and checks passage clearance on both floors.
`test-game.mjs`, `test-interior-lights.mjs` and `test.mjs` cover gameplay, pooled
lighting and navigation. WebGL screenshots and the renderer check live under
`Browser/artifacts/escape-interior-*`; the screenshot harness uses local vendored
Three.js and blocks external archive photos consistently.

## Passage headers and game signs (September 18 follow-up)

The marked `passage-header-reference.png` requests masonry above the striped
section arches. A shared curved white-brick header now fills each arch's
shoulders and crown up to the ceiling on both playable floors. Its faces sit
just behind the coloured arch bricks and its ends meet the side walls. The
opening below the spring line retains its existing clearance.

Ward-name room signs are removed from `game.mjs` only. Exit signs, stair
instructions and the upper-gallery sign remain. The aerial/walking Locations
catalogue and ward names are unchanged. The navigation plan and the Unity,
Blender, GLB and compiled aerial exports are unaffected.

## Window edge flicker (September 18 follow-up)

`window-flicker-reference.png` identifies the shimmering white/red patches on
the window jambs and sill corners. The masonry opening and striped jambs had
coplanar inner side faces; the sill ends also coincided with the outer jamb
faces. At an example lower-floor window the wall and jamb intersections were
only about one micrometre apart after instance transforms.

The wall/reveal opening now sits 30 mm behind the trim in the lateral/radial
direction, and the sill projects 30 mm beyond each outer jamb. These are real
geometry clearances, preserving the frame depth, material, window placement
and navigation clearance. The curved reveal shares the enlarged masonry
opening. No depth-test or polygon-offset workaround is used.

`test-interior-architecture.mjs` checks 600 jamb/sill samples across every
window on both floors; its new checks reject the saved pre-fix geometry.
`Browser/artifacts/check-window-flicker.mjs` captures before/after camera sweeps
with 50 positions over both floors. Only browser geometry is changed; the
Unity, Blender, GLB and compiled aerial exports are unaffected.

## Additional wall artwork (September 18)

The user supplied three images to hang on random walls in Asylum Escape. The
original PNG files are retained byte-for-byte as browser assets:

- `../../Browser/dist/art/asylum-winter-moonlight.png`: snowy asylum exterior
  beneath a full moon, 1376 x 918.
- `../../Browser/dist/art/asylum-service-tunnels.png`: brick service space with
  exposed pipes, 1221 x 918.
- `../../Browser/dist/art/daily-account-patients-1854.png`: both pages of Table
  XVIII, Extract from Daily Account of Patients, December 7-9, 1854, 960 x 568.

These are decorative references, not changes to the playable building or claims
about the historical placement of the pictures. Their text is image content.
Each appears on both floors using the existing hold-E artwork viewer. Random wall
selection keeps clear of windows, passage arch piers, stairs, exits and other
panels. Wall textures contain the whole image; the viewer uses the original PNG.
Validation details and artifact locations are recorded in `../../DEVELOPMENT.md`.

## Skirting and stair edge flicker (September 18 follow-up)

`stair-skirting-flicker-reference.png` identifies the same depth conflict at
skirting corners and on stair edge strips. Separate skirting boxes ended on
perpendicular masonry faces, leaving bare red slivers and coplanar end caps.
The stone nosings shared both their top and front planes with the carpeted
treads. Upper landing strip ends also shared the carpet pad's side plane.

Skirting now forms one merged mesh with mitered joins and no internal end caps.
The original height and wall projection remain; free ends extend 12 mm past
the masonry end plane. This covers inward and outward corners on both floors,
including the reception stair mouths, without adding draw calls. Stone stair
nosings sit 18 mm above and 12 mm ahead of the treads, with their ends inset
10 mm. Upper landing strips end 20 mm inside the carpet pad edges.

Architecture regression checks cover 760 corner views and 116 stair top,
riser and strip-end samples. The saved old skirting produces 162 exposed or
coplanar corner failures in `Browser/artifacts/probe-skirting.mjs before`;
the corrected geometry produces none. The existing window, passage and header
checks remain in place. `check-stair-skirting.mjs` provides camera sweeps around
both staircases on both floors. Browser geometry only; navigation, Unity,
Blender, GLB and aerial compiled exports are unchanged.

### Artwork labels (September 18 follow-up)

At the user's request, winter moonlight is displayed as the image alone on the
walls and in the enlarged viewer. The generic supplied-artwork caption is also
removed from every local artwork that used it. Original PNGs are unchanged.
