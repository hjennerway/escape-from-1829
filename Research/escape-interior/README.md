# Asylum escape interior finishes

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
