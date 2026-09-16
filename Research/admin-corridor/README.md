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
