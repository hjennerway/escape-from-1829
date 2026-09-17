# Redesmere to Main/admin connector

The user's September 2026 correction identifies the red-circled connection in `hipped-connector-marked-model.png` and `hipped-connector-marked-photo.png`. About the first 60% from Redesmere is a building with a hipped roof; the remaining section to Main/admin is a low corridor. The blue-circled ivy-fronted range and adjoining chimney must remain unchanged.

The browser model preserves the low, concealed joint from x=94.65 to x=100.45 beneath/beside Redesmere's existing roof. The exposed connection runs from x=100.45 to x=160.5, with its split at x=136.48. The first section has a depth of 11.8, eaves at 4.8 and roof rise of 3.2 scene units. Its front wall stays at z=13, with the extra depth extending north to z=1.2. The remaining corridor retains its depth of 6.4, eaves at 3.6 and shallow 0.64 roof rise.

The new western roof edge starts at x=100.23, beyond the protected range's x=100.2 roof overhang. The protected range, ivy, benches and chimney retain their geometry and materials. Window details remain based on `winter-corridor-reference.png`; repeated spacing and concealed elevations are inferred. The photograph establishes the roof form and relative massing, not measured dimensions.

Geometry is in `Browser/dist/main-admin-building.mjs`, with facade details in `Browser/dist/admin-corridor-detail.mjs`. Preview at `aerial.html?view=main-admin-corridor` or walk at `explore.html?view=main-admin-corridor`.

## Farndon and ward extensions

`farndon-route-reference.png` adds the blue north/south branch at 90 degrees
to the existing connector. Its centre stays at x=156.3 from z=9.8 to -147.5,
meeting Farndon's rear wing. It passes immediately east of the water tower
through the existing, taller service ranges. The exposed runs use low brick
walls, round-headed windows and a shallow slate roof matching the connector.
The corridor is 5.4 units wide, with 3.6-unit walls and a 0.64 roof rise;
these dimensions and hidden junctions are visual estimates.

`ward-routes-reference.png` extends this network along the red diagonal to
Upton/Frith/Oscroft, with the marked side branches to Grafton/Edge and Witby.
The diagonal runs at 45 degrees from [156.3,-117.1] to [75.1,-198.3], then
turns west to Upton. Grafton's branch follows z=-152.2 and Witby's x=100.3.
Each branch enters its host wall and shares the low roof height. The original
building positions and roof forms are retained. Farndon and Witby's covered
rear sashes are removed at their new junctions. Superseded corridor ground
markers are clipped or retired, while other unmodelled ranges retain theirs.

The complete network belongs to Historic and participates in exterior walking
collisions, including the actual diagonal footprint. Choose **Farndon corridor**
or **Ward corridors** in Locations. Aerial views are `?view=farndon-corridor`,
`?view=ward-corridors` and their `-plan` variants; the same locations also work
in `explore.html`. Geometry is in `farndon-corridor.mjs` and `ward-corridors.mjs`.
`node Browser/test-ward-corridors.mjs` checks all ward contacts, roof continuity,
the perpendicular and diagonal routes, open grass, collisions and visibility.
Unity and Blender exports are unchanged.

The later ward-placement correction retains the blue gallery axis at x=156.3,
directly beside the tower on its chimney side. The gallery is one straight
run perpendicular to Main, shortened to the moved Farndon rear face at
z=-132.1. Farndon's receiving wing is aligned to this axis. The 45-degree
spine and Upton endpoint stay fixed; Witby and Grafton's branch endpoints and
Hale's two links now follow their corrected building positions. This supersedes
the extension endpoints above. See the current [overhead comparison and
positions](../ward-placement/README.md).

## Front extension and attached side

`front-door-reference.png` marks the new corridor through the former recessed
low west connection, with a door at its front edge. The extension follows the
existing Farndon centreline at x=156.3, from the fixed cross-gallery at z=9.8
to the marked recessed frontage at z=30.6. It retains the gallery's 5.4-unit
width, 3.6-unit walls and 0.64 roof rise, with a continuous straight ridge.
The original corridors, their endpoints and the main building position stay
fixed. Only the low room's inner edge moves, from x=155.4375 to 153.6; its
outer wall and front/rear edges are retained, with the three front sashes
respaced onto the narrower wall.

The follow-up `front-side-reference.png` removes the ground-floor sash partly
hidden by the roof. The east roof slope and wall continue along the full
blue-marked side to the tall pavilion at x=160.5, closing the earlier notch.
The six upper windows stay fixed. The old recessed sash becomes a glazed
double door, with brickwork closing the front gable and a low stone threshold.
The forecourt approach stays open. This remains exterior geometry with a
closed door, matching the other modelled ward entrances.

`Browser/dist/admin-front-corridor.mjs` owns the extension. It belongs to the
existing Historic corridor group and uses the same aerial rendering and
walking collision system. `node Browser/test-main-admin.mjs` checks the
fixed Farndon endpoint, continuous ridge and roof coverage, blue side seam,
removed window, visible door glazing and clear approach. The saved before/after
comparison in `Browser/artifacts/verify-admin-front-corridor.mjs` additionally
checks exact vertices and transforms for the 14 original corridor objects,
and retained Main/admin geometry and openings. Aerial, plan, doorway and side
renders are in `Browser/artifacts/admin-front-corridor-after-*.png`.
