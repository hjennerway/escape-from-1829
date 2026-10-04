# Victorian room wall finishes — 4 October 2026

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
